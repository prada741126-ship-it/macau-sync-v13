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

/**
 * 真正执行 Firebase 初始化
 * 必须先完成匿名认证，再启动 watchers + 同步，否则 permission_denied
 * @param {function} onReady - 认证完成后调用
 * @returns {object|null}
 */
function _doInitFirebase(onReady) {
  if (typeof firebase === 'undefined') return null;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    // 必须等待 firebase-auth-compat.js 加载完成
    if (typeof firebase.auth !== 'function') {
      console.log('[v13:firebase] ⏳ Auth SDK not ready yet, retrying...');
      return null; // 返回 null，让轮询继续
    }

    // 先检查 signInAnonymously 是否存在（避免 TypeError 静默）
    var authInstance = firebase.auth();
    if (typeof authInstance.signInAnonymously !== 'function') {
      console.error('[v13:firebase] ❌ signInAnonymously not available on auth instance');
      return null;
    }

    var tempDb = firebase.database(); // 临时持有，auth 成功后才赋值给 _db

    // Anonymous auth — RTDB 读写都需要认证完成后才能操作
    // ★ FIX: 只有 auth 成功后才设置 _db + 启动 _watchConnection，否则同步会 permission_denied
    authInstance.signInAnonymously().then(function() {
      console.log('[v13:firebase] 🔑 Anonymous auth OK');
      _db = tempDb;
      _watchConnection();
      if (typeof onReady === 'function') onReady();
    }).catch(function(err) {
      console.error('[v13:firebase] ❌ Anonymous auth failed:', err.message);
      _db = null; // 明确设为 null，确保同步不会启动
      if (typeof onReady === 'function') onReady();
    });

    console.log('[v13:firebase] ⏳ Waiting for anonymous auth...');
    return null; // 返回 null，让轮询继续（auth 成功后 _db 会被设置）
  } catch (e) {
    console.error('[v13:firebase] Init error:', e);
    _db = null;
    return null;
  }
}

/**
 * 初始化成功后补启动 watchers + 同步
 * 必须在匿名认证完成后调用
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
 * 关键：必须先完成匿名认证，再启动 watchers，否则 permission_denied
 * @returns {object|null} database 实例，未就绪时返回 null
 */
function initFirebase() {
  // 如果已经连上了，直接返回
  if (_db) return _db;

  // 立即尝试 — 传入 onReady 回调，auth 完成后才启动 watchers
  var result = _doInitFirebase(function onReady() {
    _onFirebaseReady();
  });
  if (result) {
    _fbRetryDone = true;
    // _onFirebaseReady 会在 signInAnonymously().then() 中调用
    return result;
  }

  // 还没连上 — 安排重试
  if (_fbRetryDone) return null;
  _fbRetryDone = true;

  console.warn('[v13:firebase] Firebase SDK not loaded yet, setting up retry...');

  // 策略A: load 事件（处理 document.readyState 问题）
  function tryInitViaEvent() {
    if (!_db) {
      console.log('[v13:firebase] ⏳ Retry via event...');
      _doInitFirebase(function onReady() {
        _onFirebaseReady();
      });
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
      _doInitFirebase(function onReady() {
        if (_fbPollTimer) {
          clearInterval(_fbPollTimer);
          _fbPollTimer = null;
        }
        _onFirebaseReady();
      });
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
      // 重连双向同步：先拉取远端数据，再推送本地变更
      setTimeout(function() {
        if (!State.get('syncConnected')) return;
        console.log('[v13:firebase] 🔄 重連同步：下載遠端...');
        try { syncDownloadAll(); } catch(e) { console.error('[v13:firebase] syncDownloadAll error:', e); }
        // 等下载合并完成后，再推送本地数据
        setTimeout(function() {
          if (!State.get('syncConnected')) return;
          console.log('[v13:firebase] 🔄 重連同步：推送本地...');
          try { syncUploadAll(); } catch(e) { console.error('[v13:firebase] syncUploadAll error:', e); }
        }, 3000);
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
  console.log('[v13:firebase] 🔵 syncTxToFirebase ENTERED, _db=' + (!!_db) + ', fbKey=' + (tx && tx._fbKey));
  if (!tx._fbKey) {
    console.warn('[v13:firebase] syncTx skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncTx deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncTxToFirebase(tx); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncTx WRITE:', tx._fbKey, 'agent=' + (tx.agent || '?'), 'vol=' + (tx.volume || 0));
    _db.ref(FB_PATH.TXS + '/' + tx._fbKey).set(tx, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncTx FAILED:', tx._fbKey, err.message || err);
        enqueueUpload(function() { syncTxToFirebase(tx); });
      } else {
        console.log('[v13:firebase] ✅ syncTx OK:', tx._fbKey);
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
  if (!_db) {
    console.warn('[v13:firebase] removeTx deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeTxFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeTx TOMBSTONE:', fbKey);
    // ★ 墓碑策略：不设 null，而是写一个墓碑对象
    // 这样另一端的 mergeTxs 可以识别并移除该条目
    _db.ref(FB_PATH.TXS + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeTx FAILED:', fbKey, err.message || err);
        enqueueUpload(function() { removeTxFromFirebase(fbKey); });
      } else {
        console.log('[v13:firebase] ✅ removeTx TOMBSTONE OK:', fbKey);
      }
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
  if (!record._fbKey) {
    console.warn('[v13:firebase] syncFund skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncFund deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncFundToFirebase(record); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncFund WRITE:', record._fbKey);
    _db.ref(FB_PATH.FUND + '/' + record._fbKey).set(record, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncFund FAILED:', record._fbKey, err.message || err);
        enqueueUpload(function() { syncFundToFirebase(record); });
      } else {
        console.log('[v13:firebase] ✅ syncFund OK:', record._fbKey);
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
  if (!_db) {
    console.warn('[v13:firebase] removeFund deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeFundFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeFund TOMBSTONE:', fbKey);
    _db.ref(FB_PATH.FUND + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeFund FAILED:', fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeFund TOMBSTONE OK:', fbKey);
      }
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
  if (!record._fbKey) {
    console.warn('[v13:firebase] syncWallet skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncWallet deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncWalletToFirebase(agent, record); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncWallet WRITE:', agent, record._fbKey);
    _db.ref(FB_PATH.AGENT_WALLETS + '/' + encodeFirebaseKey(agent) + '/' + record._fbKey).set(record, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncWallet FAILED:', agent, record._fbKey, err.message || err);
        enqueueUpload(function() { syncWalletToFirebase(agent, record); });
      } else {
        console.log('[v13:firebase] ✅ syncWallet OK:', agent, record._fbKey);
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
  if (!_db) {
    console.warn('[v13:firebase] removeWallet deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeWalletFromFirebase(agent, fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeWallet TOMBSTONE:', agent, fbKey);
    _db.ref(FB_PATH.AGENT_WALLETS + '/' + encodeFirebaseKey(agent) + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeWallet FAILED:', agent, fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeWallet TOMBSTONE OK:', agent, fbKey);
      }
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
  if (!booking._fbKey) {
    console.warn('[v13:firebase] syncBooking skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncBooking deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncBookingToFirebase(booking); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncBooking WRITE:', booking._fbKey);
    _db.ref(FB_PATH.RM_BOOKINGS + '/' + booking._fbKey).set(booking, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncBooking FAILED:', booking._fbKey, err.message || err);
        enqueueUpload(function() { syncBookingToFirebase(booking); });
      } else {
        console.log('[v13:firebase] ✅ syncBooking OK:', booking._fbKey);
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
  if (!_db) {
    console.warn('[v13:firebase] removeBooking deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeBookingFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeBooking TOMBSTONE:', fbKey);
    _db.ref(FB_PATH.RM_BOOKINGS + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeBooking FAILED:', fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeBooking TOMBSTONE OK:', fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] removeBooking error:', e);
  }
}

/**
 * 同步单笔酒店设定到 Firebase
 * @param {object} entry
 */
function syncHCConfigToFirebase(entry) {
  if (!entry._fbKey) {
    console.warn('[v13:firebase] syncHCConfig skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncHCConfig deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncHCConfigToFirebase(entry); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncHCConfig WRITE:', entry._fbKey, 'casino=' + (entry.casino || '?'), 'hotel=' + (entry.hotel || '?'));
    _db.ref(FB_PATH.HC_CONFIG + '/' + entry._fbKey).set(entry, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncHCConfig FAILED:', entry._fbKey, err.message || err);
        enqueueUpload(function() { syncHCConfigToFirebase(entry); });
      } else {
        console.log('[v13:firebase] ✅ syncHCConfig OK:', entry._fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncHCConfig error:', e);
  }
}

/**
 * 从 Firebase 删除单笔酒店设定
 * @param {string} fbKey
 */
function removeHCFromFirebase(fbKey) {
  if (!_db) {
    console.warn('[v13:firebase] removeHCConfig deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeHCFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeHCConfig TOMBSTONE:', fbKey);
    _db.ref(FB_PATH.HC_CONFIG + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeHCConfig FAILED:', fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeHCConfig TOMBSTONE OK:', fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] removeHCConfig error:', e);
  }
}

/**
 * 同步代理名单到 Firebase（用 set() 覆写，支持新增和删除同步）
 *
 * 原先用 transaction() 做并集合并，导致删除操作无法传播——
 * 删掉的代理会被远端数据合并回来。改用 set() 覆写整个名单，
 * 确保删除操作能正确推送到 Firebase 并传播到所有设备。
 *
 * @param {Array} agentList - 當前本地代理名單
 */
function syncAgentListToFirebase(agentList) {
  if (!_db) {
    console.warn('[v13:firebase] syncAgentList deferred (_db null) → auto-enqueue');
    // ★ FIX: 不捕获入队时的 agentList，执行时从 State 实时读取
    //    避免竞态：入队后 agentList 变化（删除/新增）时推送旧数据覆盖新数据
    enqueueUpload(function() { syncAgentListToFirebase(State.get('agentList')); });
    return;
  }
  try {
    var sorted = agentList.slice().sort(function(a, b) { return a.localeCompare(b); });
    _db.ref(FB_PATH.AGENT_LIST).set(sorted, function(err) {
      if (err) {
        console.error('[v13:firebase] syncAgentList set FAILED:', err.message || err);
        // ★ 重试时也实时读取 State
        enqueueUpload(function() { syncAgentListToFirebase(State.get('agentList')); });
      } else {
        console.log('[v13:firebase] ✅ syncAgentList OK:', sorted.length + ' agents', JSON.stringify(sorted));
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

// ============================================================================
// 管理员操作：清除 Firebase 全部数据
// ============================================================================

/**
 * 清除 Firebase macau_data/ 下的所有数据（交易、公基金、代理钱包、订房等）
 * 警告：此操作不可逆，执行前须由 UI 确认
 * @param {function} onDone - 成功回调 function(err)
 */
function clearFirebaseData(onDone) {
  var db = getDB();
  if (!db) {
    console.error('[v13:firebase] clearFirebaseData: _db not ready');
    if (onDone) onDone(new Error('Firebase 未連線'));
    return;
  }
  console.warn('[v13:firebase] 🗑️  clearFirebaseData: clearing macau_data/ (with _clearedAt marker)...');

  // ★ FIX: 不能直接用 set(null) 清空父节点
  //   set(null) 会让手机端 watcher 收到 snap.val()=null → fbObjToArray=[] → mergeTxs 保留本地数据不删
  //   解决方案：写入 _clearedAt 标记 + 逐个清空子路径，手机端 watcher 监听 _clearedAt 执行同步清除
  var clearedAt = Date.now();
  // 路径必须与 watchers.js 中 db.ref(FB_PATH.XXX) 一致
  var clearPayload = {
    '_clearedAt':           clearedAt,
    'txs':                  null,
    'fundWithdrawals':      null,
    'agentWallets':         null,
    'rmBookings':           null,
    // agentList 保留，不刪除代理名單
    'workingMonth':         null,
    'hcConfig':             null,
    'archives':             null,
  };

  db.ref('macau_data').update(clearPayload, function(err) {
    if (err) {
      console.error('[v13:firebase] ❌ clearFirebaseData FAILED:', err.message || err);
    } else {
      console.log('[v13:firebase] ✅ clearFirebaseData OK — macau_data cleared (clearedAt=' + clearedAt + ')');
    }
    if (onDone) onDone(err);
  });
}
