/**
 * v13 Firebase 初始化与连接监控
 * 
 * 依赖: core/constants.js (FIREBASE_CONFIG, FB_PATH, EVENTS)
 *        core/events.js (Events)
 *        core/state.js (State)
 * 对照档: 第七节模块10, 第九节同步机制
 */

// ============================================================================
// 初始化
// ============================================================================

var _db = null;              // Firebase database 实例
var _fbRetryDone = false;    // 是否已完成重试/setup
var _fbPollTimer = null;     // 轮询定时器
var _initialSyncDone = false; // 首次连通后已完成双向同步

/**
 * 真正执行 Firebase 初始化
 * @returns {object|null}
 */
function _doInitFirebase() {
  if (typeof firebase === 'undefined') return null;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    _db = firebase.database();
    console.log('[v13:firebase] ✅ Connected! _db ready, database:', _db.ref.toString().substring(0,30));
    _watchConnection();
    return _db;
  } catch (e) {
    console.error('[v13:firebase] Init error:', e);
    return null;
  }
}

/**
 * 初始化成功后补启动 watchers + 同步
 */
function _onFirebaseReady() {
  console.log('[v13:firebase] 🚀 Starting watchers + sync...');
  try { startWatchers(); } catch(e) { console.error('[v13:firebase] startWatchers error:', e); }
  try { syncDownloadAll(); } catch(e) { console.error('[v13:firebase] syncDownloadAll error:', e); }
}

/**
 * 初始化 Firebase（多层回退保障）
 * 1. 立即尝试（如果 SDK 已加载）
 * 2. load 事件重试（兼容 document.readyState===complete）
 * 3. 1秒间隔轮询 最多 30 次
 * @returns {object|null} database 实例，未就绪时返回 null
 */
function initFirebase() {
  // 如果已经连上了，直接返回
  if (_db) return _db;

  // 立即尝试
  var result = _doInitFirebase();
  if (result) {
    _fbRetryDone = true;
    // ★ 首次成功也触发 onFirebaseReady（延迟，等连接真正建立后再同步）
    // 但不在 initAppAfterLogin 之前启动 watchers，避免与后续 initAppAfterLogin 双重注册
    // 标记需要延迟同步，由 _watchConnection 在连通时触发
    return result;
  }

  // 还没连上 — 安排重试
  if (_fbRetryDone) return null;  // 已经安排过了
  _fbRetryDone = true;

  console.warn('[v13:firebase] Firebase SDK not loaded yet, setting up retry...');

  // 策略A: load 事件（处理 document.readyState 问题）
  function tryInitViaEvent() {
    if (!_db) {
      console.log('[v13:firebase] ⏳ Retry via event...');
      _doInitFirebase();
      if (_db) _onFirebaseReady();
    }
  }

  if (document.readyState === 'complete') {
    // 页面已完全加载，直接用 setTimeout 延迟执行
    console.log('[v13:firebase] Page already loaded, scheduling retry...');
    setTimeout(tryInitViaEvent, 500);
  } else {
    window.addEventListener('load', tryInitViaEvent);
  }

  // 策略B: 轮询（兜底 — 处理 load 永远不触发的情况）
  var pollCount = 0;
  _fbPollTimer = setInterval(function() {
    pollCount++;
    if (typeof firebase !== 'undefined' && !_db) {
      console.log('[v13:firebase] ⏳ Poll #' + pollCount + ' — Firebase SDK detected, initializing...');
      _doInitFirebase();
      if (_db) {
        clearInterval(_fbPollTimer);
        _fbPollTimer = null;
        _onFirebaseReady();
      }
    }
    if (pollCount >= 30) {
      clearInterval(_fbPollTimer);
      _fbPollTimer = null;
      if (!_db) {
        console.error('[v13:firebase] ❌ Firebase SDK failed to load after 30s. Sync disabled.');
        console.error('[v13:firebase]    请检查: 1) 网络是否可访问 cdn.jsdelivr.net  2) 防火墙/广告拦截器是否屏蔽');
      }
    }
  }, 1000);

  return null;
}

/**
 * 获取 database 实例
 * @returns {object|null}
 */
function getDB() {
  return _db;
}

/**
 * 创建数据库引用
 * @param {string} path - 数据库路径
 * @returns {object} Firebase ref
 */
function dbRef(path) {
  if (!_db) return null;
  return _db.ref(path);
}

// ============================================================================
// 连接监控 (对照档第九节)
// ============================================================================

function _watchConnection() {
  if (!_db) return;

  var connectedRef = _db.ref(FB_PATH.CONNECTED);
  connectedRef.on('value', function(snap) {
    var connected = snap.val() === true;
    var prevConnected = State.get('syncConnected');
    State.set('syncConnected', connected);
    Events.emit(EVENTS.CONNECTION_CHANGED, connected);

    if (connected) {
      console.log('[v13:firebase] ✅ Firebase RTDB 已連線');
      // 首次连通：延迟 2 秒后执行双向同步（给 SDK 时间稳定连接）
      setTimeout(function() {
        if (!State.get('syncConnected')) return;  // 又断开了，跳过
        console.log('[v13:firebase] 🔄 执行双向同步...');
        // 先上传本地数据
        try { syncUploadAll(); } catch(e) { console.error('[v13:firebase] syncUploadAll error:', e); }
        // 然后下载远端数据（如果还没做过首次同步）
        if (!_initialSyncDone) {
          _initialSyncDone = true;
          console.log('[v13:firebase] 🔽 首次同步: 拉取遠端數據...');
          try { syncDownloadAll(); } catch(e) { console.error('[v13:firebase] syncDownloadAll error:', e); }
        }
      }, 2000);
    } else {
      // 只有从 connected→disconnected 变化时才警告（避免首次 false 状态误报）
      if (prevConnected === true) {
        console.warn('[v13:firebase] ⚠️ Firebase RTDB 斷線');
      }
    }
  });
}

// ============================================================================
// CRUD 即时写入 (对照档第九节 - 个别即时写入)
// ============================================================================

/**
 * 同步单笔交易到 Firebase
 * @param {object} tx
 */
function syncTxToFirebase(tx) {
  if (!_db || !tx._fbKey) {
    if (!_db) console.warn('[v13:firebase] syncTx skipped: _db is null');
    if (!tx._fbKey) console.warn('[v13:firebase] syncTx skipped: missing _fbKey');
    return;
  }
  try {
    _db.ref(FB_PATH.TXS + '/' + tx._fbKey).set(tx, function(err) {
      if (err) {
        console.error('[v13:firebase] syncTx FAILED:', err.message || err);
        // 写入失败时重新入队
        enqueueUpload(function() { syncTxToFirebase(tx); });
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncTx error:', e);
  }
}

/**
 * 从 Firebase 删除单笔交易
 * @param {string} fbKey
 */
function removeTxFromFirebase(fbKey) {
  if (!_db) return;
  try {
    _db.ref(FB_PATH.TXS + '/' + fbKey).set(null, function(err) {
      if (err) console.error('[v13:firebase] removeTx FAILED:', err.message || err);
    });
  } catch (e) {
    console.error('[v13:firebase] removeTx error:', e);
  }
}

/**
 * 同步单笔公基金到 Firebase
 * @param {object} record
 */
function syncFundToFirebase(record) {
  if (!_db || !record._fbKey) {
    if (!_db) console.warn('[v13:firebase] syncFund skipped: _db is null');
    return;
  }
  try {
    _db.ref(FB_PATH.FUND + '/' + record._fbKey).set(record, function(err) {
      if (err) {
        console.error('[v13:firebase] syncFund FAILED:', err.message || err);
        enqueueUpload(function() { syncFundToFirebase(record); });
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncFund error:', e);
  }
}

/**
 * 从 Firebase 删除单笔公基金
 * @param {string} fbKey
 */
function removeFundFromFirebase(fbKey) {
  if (!_db) return;
  try {
    _db.ref(FB_PATH.FUND + '/' + fbKey).set(null, function(err) {
      if (err) console.error('[v13:firebase] removeFund FAILED:', err.message || err);
    });
  } catch (e) {
    console.error('[v13:firebase] removeFund error:', e);
  }
}

/**
 * 同步单笔代理钱包到 Firebase
 * @param {string} agent
 * @param {object} record
 */
function syncWalletToFirebase(agent, record) {
  if (!_db || !record._fbKey) {
    if (!_db) console.warn('[v13:firebase] syncWallet skipped: _db is null');
    return;
  }
  try {
    _db.ref(FB_PATH.AGENT_WALLETS + '/' + encodeFirebaseKey(agent) + '/' + record._fbKey).set(record, function(err) {
      if (err) {
        console.error('[v13:firebase] syncWallet FAILED:', err.message || err);
        enqueueUpload(function() { syncWalletToFirebase(agent, record); });
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncWallet error:', e);
  }
}

/**
 * 从 Firebase 删除单笔代理钱包
 * @param {string} agent
 * @param {string} fbKey
 */
function removeWalletFromFirebase(agent, fbKey) {
  if (!_db) return;
  try {
    _db.ref(FB_PATH.AGENT_WALLETS + '/' + encodeFirebaseKey(agent) + '/' + fbKey).set(null, function(err) {
      if (err) console.error('[v13:firebase] removeWallet FAILED:', err.message || err);
    });
  } catch (e) {
    console.error('[v13:firebase] removeWallet error:', e);
  }
}

/**
 * 同步单笔订房到 Firebase
 * @param {object} booking
 */
function syncBookingToFirebase(booking) {
  if (!_db || !booking._fbKey) {
    if (!_db) console.warn('[v13:firebase] syncBooking skipped: _db is null');
    return;
  }
  try {
    _db.ref(FB_PATH.RM_BOOKINGS + '/' + booking._fbKey).set(booking, function(err) {
      if (err) {
        console.error('[v13:firebase] syncBooking FAILED:', err.message || err);
        enqueueUpload(function() { syncBookingToFirebase(booking); });
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncBooking error:', e);
  }
}

/**
 * 从 Firebase 删除单笔订房
 * @param {string} fbKey
 */
function removeBookingFromFirebase(fbKey) {
  if (!_db) return;
  try {
    _db.ref(FB_PATH.RM_BOOKINGS + '/' + fbKey).set(null, function(err) {
      if (err) console.error('[v13:firebase] removeBooking FAILED:', err.message || err);
    });
  } catch (e) {
    console.error('[v13:firebase] removeBooking error:', e);
  }
}

/**
 * 同步代理名单到 Firebase（用 transaction 原子合併，防止并发丢失）
 * @param {Array} agentList - 當前本地代理名單
 */
function syncAgentListToFirebase(agentList) {
  if (!_db) {
    console.warn('[v13:firebase] syncAgentList skipped: _db is null');
    return;
  }
  try {
    _db.ref(FB_PATH.AGENT_LIST).transaction(function(remote) {
      if (!remote || !Array.isArray(remote)) return agentList;
      // 原子合併：本地 + 遠端（去重）
      var merged = remote.slice();
      for (var i = 0; i < agentList.length; i++) {
        if (merged.indexOf(agentList[i]) === -1) {
          merged.push(agentList[i]);
        }
      }
      merged.sort(function(a, b) { return a.localeCompare(b); });
      // 只有当真正有变化时才返回新值（返回 undefined 表示中止事务）
      if (JSON.stringify(merged) === JSON.stringify(remote)) return;
      return merged;
    }, function(err, committed, snapshot) {
      if (err) {
        console.error('[v13:firebase] syncAgentList transaction FAILED:', err.message || err);
        // 失败时重试（用 enqueueUpload 排队）
        enqueueUpload(function() { syncAgentListToFirebase(agentList); });
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncAgentList error:', e);
  }
}

// ============================================================================
// 格式转换 (对照档第九节)
// ============================================================================

/**
 * Firebase 物件格式 → 本地数组
 * @param {object} obj - Firebase snapshot value
 * @returns {Array}
 */
function fbObjToArray(obj) {
  if (!obj) return [];
  var result = [];
  for (var key in obj) {
    var item = obj[key];
    if (item && typeof item === 'object') {
      item._fbKey = item._fbKey || key;
      result.push(item);
    }
  }
  return result;
}

/**
 * 本地数组 → Firebase 物件格式
 * @param {Array} arr
 * @returns {object}
 */
function fbArrayToObj(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    var key = arr[i]._fbKey;
    if (key) {
      obj[key] = arr[i];
    }
  }
  return obj;
}

/**
 * 代理钱包 → Firebase 巢状物件
 * @param {object} wallets - { agentName: [records] }
 * @returns {object}
 */
function fbWalletsToObj(wallets) {
  var obj = {};
  for (var agent in wallets) {
    var encoded = encodeFirebaseKey(agent);
    obj[encoded] = fbArrayToObj(wallets[agent]);
  }
  return obj;
}

/**
 * Firebase 巢状物件 → 代理钱包
 * @param {object} obj
 * @returns {object}
 */
function fbObjToWallets(obj) {
  if (!obj) return {};
  var wallets = {};
  for (var encoded in obj) {
    var agent = decodeFirebaseKey(encoded);
    wallets[agent] = fbObjToArray(obj[encoded]);
  }
  return wallets;
}

// ============================================================================
// Firebase Key 编码 (处理特殊字符)
// ============================================================================

function encodeFirebaseKey(str) {
  return str.replace(/\./g, '_DOT_')
            .replace(/#/g, '_HASH_')
            .replace(/\$/g, '_DOLLAR_')
            .replace(/\[/g, '_LB_')
            .replace(/\]/g, '_RB_')
            .replace(/\//g, '_SLASH_');
}

function decodeFirebaseKey(encoded) {
  return encoded.replace(/_DOT_/g, '.')
                .replace(/_HASH_/g, '#')
                .replace(/_DOLLAR_/g, '$')
                .replace(/_LB_/g, '[')
                .replace(/_RB_/g, ']')
                .replace(/_SLASH_/g, '/');
}
