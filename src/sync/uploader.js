/**
 * v13 上传队列与批量同步
 * 
 * 依赖: sync/firebase.js (getDB, dbRef, fbObjToArray, fbArrayToObj, fbWalletsToObj)
 *        core/state.js, core/events.js, core/constants.js (FB_PATH, EVENTS, CONFIG)
 * 对照档: 第九节 syncUpload() + _syncSet()
 */

// ============================================================================
// 上传队列
// ============================================================================

var _uploadQueue = [];
var _uploading = false;

/**
 * 入队上传任务
 * @param {function} task - 返回 Promise 的上传函数
 */
function enqueueUpload(task) {
  _uploadQueue.push(task);
  if (!_uploading) {
    _processQueue();
  }
}

function _processQueue() {
  if (_uploadQueue.length === 0) {
    _uploading = false;
    return;
  }

  // ★ 如果 Firebase 还没就绪，延迟处理（不退队，不丢数据）
  if (!getDB()) {
    _uploading = false;
    setTimeout(_processQueue, 1000);
    return;
  }

  _uploading = true;
  var task = _uploadQueue.shift();

  try {
    task();
  } catch (e) {
    console.error('[v13:uploader] Queue task error:', e);
  }

  // 逐任务处理（串行，避免 Firebase 限制）
  setTimeout(_processQueue, 100);
}

// ============================================================================
// 批量上传 (对照档 syncUpload)
// ============================================================================

/**
 * 全量同步到 Firebase (8 路径)
 */
function syncUploadAll() {
  if (!getDB()) {
    console.warn('[v13:uploader] Firebase not initialized, skip syncUpload');
    return;
  }

  Events.emit(EVENTS.SYNC_START);

  var txs = State.get('txs');
  var fundWithdrawals = State.get('fundWithdrawals');
  // ★ FIX: agentList 不在函數入口捕獲，避免 watchers 更新後用舊數據覆蓋
  var agentWallets = State.get('agentWallets');
  var workingMonth = State.get('workingMonth');
  var bookings = State.get('bookings');
  var archives = State.get('archives');

  var db = getDB();

  // 1. 交易：transaction 原子合併 (個別 CRUD 已即時推送，此為安全網)
  // ★ FIX: mergeTxs(local, remote) — 第一个参数是本地，第二个是远端
  // ★ 防止删除回魂: 为最近删除的项写入墓碑
  db.ref(FB_PATH.TXS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(txs);
    var rArr = fbObjToArray(remote);
    // ★ 为最近删除的远端项写入墓碑，防止被复活
    for (var i = 0; i < rArr.length; i++) {
      if (rArr[i]._fbKey && isRecentlyDeleted('tx', rArr[i]._fbKey)) {
        rArr[i] = { _fbKey: rArr[i]._fbKey, _deleted: true, _updatedAt: Date.now() };
      }
    }
    var merged = mergeTxs(txs, rArr);  // ✓ local=txs, remote=rArr
    console.log('[v13:uploader] TXS transaction: local=' + txs.length + ' remote=' + rArr.length + ' merged=' + merged.length);
    return fbArrayToObj(merged);
  }, function(err, committed, snapshot) {
    if (err) {
      console.error('[v13:uploader] TXS transaction FAILED:', err.message || err);
    } else if (committed) {
      console.log('[v13:uploader] ✅ TXS transaction committed, ' + (snapshot ? snapshot.numChildren() : '?') + ' entries on Firebase');
    }
  });

  // 2. 公基金：transaction 原子合併（★ 使用 mergeTxs 时间戳决胜策略）
  db.ref(FB_PATH.FUND).transaction(function(remote) {
    if (!remote) return fbArrayToObj(fundWithdrawals);
    var rArr = fbObjToArray(remote);
    // ★ 为最近删除的远端项写入墓碑
    for (var i = 0; i < rArr.length; i++) {
      if (rArr[i]._fbKey && isRecentlyDeleted('fund', rArr[i]._fbKey)) {
        rArr[i] = { _fbKey: rArr[i]._fbKey, _deleted: true, _updatedAt: Date.now() };
      }
    }
    var merged = mergeTxs(fundWithdrawals, rArr);
    console.log('[v13:uploader] FUND transaction: local=' + fundWithdrawals.length + ' remote=' + rArr.length + ' merged=' + merged.length);
    return fbArrayToObj(merged);
  }, function(err, committed, snapshot) {
    if (err) {
      console.error('[v13:uploader] FUND transaction FAILED:', err.message || err);
    } else if (committed) {
      console.log('[v13:uploader] ✅ FUND transaction committed');
    }
  });

  // 3. 代理名單：直接 set() 推送本地到 Firebase（不合并）
  //    CRUD 操作（addAgent/removeAgent/renameAgent）已透過 syncAgentListToFirebase 即時推送，
  //    此處作為安全網確保頁面加載時本地正確數據能到達 Firebase
  // ★ FIX: set 回調內實時讀取 State，避免用入隊時的舊數據覆蓋 watchers 已更新的數據
  (function() {
    var _al = State.get('agentList');
    if (!Array.isArray(_al)) _al = [];
    db.ref(FB_PATH.AGENT_LIST).set(_al.slice().sort(function(a, b) { return a.localeCompare(b); }), function(err) {
      if (err) {
        console.error('[v13:uploader] AGENT_LIST set FAILED:', err.message || err);
      } else {
        console.log('[v13:uploader] ✅ AGENT_LIST pushed: ' + _al.length + ' agents', JSON.stringify(_al));
      }
    });
  })();

  // 4. 代理钱包：transaction 原子合併（★ 使用 mergeWallets 时间戳决胜策略）
  // ★ FIX: mergeWallets(local, remote) — local=agentWallets, remote=rw
  db.ref(FB_PATH.AGENT_WALLETS).transaction(function(remote) {
    if (!remote) return fbWalletsToObj(agentWallets);
    var rw = fbObjToWallets(remote);
    // ★ 为最近删除的远端项写入墓碑
    for (var ag in rw) {
      var records = rw[ag];
      if (!Array.isArray(records)) continue;
      for (var i = 0; i < records.length; i++) {
        if (records[i]._fbKey && isRecentlyDeleted('wallet', records[i]._fbKey)) {
          records[i] = { _fbKey: records[i]._fbKey, _deleted: true, _updatedAt: Date.now() };
        }
      }
    }
    return fbWalletsToObj(mergeWallets(agentWallets, rw));
  }, function(err, committed, snapshot) {
    if (err) {
      console.error('[v13:uploader] WALLETS transaction FAILED:', err.message || err);
    } else if (committed) {
      console.log('[v13:uploader] ✅ WALLETS transaction committed');
    }
  });

  // 5. 工作月份
  db.ref(FB_PATH.WORKING_MONTH).set(workingMonth);

  // 6. 订房：transaction 原子合併（★ 使用 mergeBookings 时间戳决胜策略）
  db.ref(FB_PATH.RM_BOOKINGS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(bookings);
    var rArr = fbObjToArray(remote);
    // ★ 为最近删除的远端项写入墓碑
    for (var i = 0; i < rArr.length; i++) {
      if (rArr[i]._fbKey && isRecentlyDeleted('booking', rArr[i]._fbKey)) {
        rArr[i] = { _fbKey: rArr[i]._fbKey, _deleted: true, _updatedAt: Date.now() };
      }
    }
    var merged = mergeBookings(bookings, rArr);
    console.log('[v13:uploader] BOOKINGS transaction: local=' + bookings.length + ' remote=' + rArr.length + ' merged=' + merged.length);
    return fbArrayToObj(merged);
  }, function(err, committed, snapshot) {
    if (err) {
      console.error('[v13:uploader] BOOKINGS transaction FAILED:', err.message || err);
    } else if (committed) {
      console.log('[v13:uploader] ✅ BOOKINGS transaction committed');
    }
  });

  // 7. 酒店设定：transaction 原子合併（★ 使用 mergeTxs 时间戳决胜策略）
  var hcConfig = State.get('hotelConfig');
  db.ref(FB_PATH.HC_CONFIG).transaction(function(remote) {
    if (!remote) return fbArrayToObj(hcConfig);
    var rArr = fbObjToArray(remote);
    // ★ 为最近删除的远端项写入墓碑
    for (var i = 0; i < rArr.length; i++) {
      if (rArr[i]._fbKey && isRecentlyDeleted('hc', rArr[i]._fbKey)) {
        rArr[i] = { _fbKey: rArr[i]._fbKey, _deleted: true, _updatedAt: Date.now() };
      }
    }
    var merged = mergeTxs(hcConfig, rArr);
    console.log('[v13:uploader] HC_CONFIG transaction: local=' + hcConfig.length + ' remote=' + rArr.length + ' merged=' + merged.length);
    return fbArrayToObj(merged);
  }, function(err, committed, snapshot) {
    if (err) {
      console.error('[v13:uploader] HC_CONFIG transaction FAILED:', err.message || err);
    } else if (committed) {
      console.log('[v13:uploader] ✅ HC_CONFIG transaction committed');
    }
  });

  // 8. 月度存档
  db.ref(FB_PATH.ARCHIVES).set(archives);

  Events.emit(EVENTS.SYNC_COMPLETE);
}

/**
 * 带重试的 set
 * @param {object} ref - Firebase ref
 * @param {*} data
 */
function syncSetWithRetry(ref, data, attempt) {
  if (!attempt) attempt = 0;
  if (attempt >= CONFIG.SYNC_RETRY_MAX) {
    console.error('[v13:uploader] syncSet max retries reached');
    return;
  }

  try {
    ref.set(data, function(err) {
      if (err) {
        var delay = CONFIG.SYNC_RETRY_BASE * Math.pow(2, attempt);
        console.warn('[v13:uploader] syncSet retry in', delay, 'ms (attempt', attempt + 1, ')');
        setTimeout(function() {
          syncSetWithRetry(ref, data, attempt + 1);
        }, delay);
      }
    });
  } catch (e) {
    var delay = CONFIG.SYNC_RETRY_BASE * Math.pow(2, attempt);
    setTimeout(function() {
      syncSetWithRetry(ref, data, attempt + 1);
    }, delay);
  }
}
