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
 * 全量同步到 Firebase (7 路径)
 */
function syncUploadAll() {
  if (!getDB()) {
    console.warn('[v13:uploader] Firebase not initialized, skip syncUpload');
    return;
  }

  Events.emit(EVENTS.SYNC_START);

  var txs = State.get('txs');
  var fundWithdrawals = State.get('fundWithdrawals');
  var agentList = State.get('agentList');
  var agentWallets = State.get('agentWallets');
  var workingMonth = State.get('workingMonth');
  var bookings = State.get('bookings');
  var archives = State.get('archives');

  var db = getDB();

  // 1. 交易 (transaction: 本地优先，删除多余)
  db.ref(FB_PATH.TXS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(txs);
    // 合并：本地更新覆盖远端
    var merged = fbObjToArray(remote);
    var localMap = {};
    for (var i = 0; i < txs.length; i++) {
      localMap[txs[i]._fbKey] = txs[i];
    }
    for (var j = 0; j < merged.length; j++) {
      var key = merged[j]._fbKey;
      if (localMap[key]) {
        merged[j] = localMap[key];
        delete localMap[key];
      }
    }
    // 添加本地新增的
    for (var k in localMap) {
      merged.push(localMap[k]);
    }
    return fbArrayToObj(merged);
  });

  // 2. 公基金
  db.ref(FB_PATH.FUND).transaction(function(remote) {
    if (!remote) return fbArrayToObj(fundWithdrawals);
    var merged = fbObjToArray(remote);
    var localMap = {};
    for (var i = 0; i < fundWithdrawals.length; i++) {
      localMap[fundWithdrawals[i]._fbKey] = fundWithdrawals[i];
    }
    for (var j = 0; j < merged.length; j++) {
      var key = merged[j]._fbKey;
      if (localMap[key]) {
        merged[j] = localMap[key];
        delete localMap[key];
      }
    }
    for (var k in localMap) {
      merged.push(localMap[k]);
    }
    return fbArrayToObj(merged);
  });

  // 3. 代理名单 (直接 set 数组)
  db.ref(FB_PATH.AGENT_LIST).set(agentList);

  // 4. 代理钱包
  db.ref(FB_PATH.AGENT_WALLETS).transaction(function(remote) {
    if (!remote) return fbWalletsToObj(agentWallets);
    var remoteWallets = fbObjToWallets(remote);
    // 合并
    for (var agent in agentWallets) {
      var localRecords = agentWallets[agent];
      var remoteRecords = remoteWallets[agent] || [];
      var localMap = {};
      for (var i = 0; i < localRecords.length; i++) {
        localMap[localRecords[i]._fbKey] = localRecords[i];
      }
      for (var j = 0; j < remoteRecords.length; j++) {
        var key = remoteRecords[j]._fbKey;
        if (localMap[key]) {
          remoteRecords[j] = localMap[key];
          delete localMap[key];
        }
      }
      for (var k in localMap) {
        remoteRecords.push(localMap[k]);
      }
      remoteWallets[agent] = remoteRecords;
    }
    return fbWalletsToObj(remoteWallets);
  });

  // 5. 工作月份
  db.ref(FB_PATH.WORKING_MONTH).set(workingMonth);

  // 6. 订房
  db.ref(FB_PATH.RM_BOOKINGS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(bookings);
    var merged = fbObjToArray(remote);
    var localMap = {};
    for (var i = 0; i < bookings.length; i++) {
      localMap[bookings[i]._fbKey] = bookings[i];
    }
    for (var j = 0; j < merged.length; j++) {
      var key = merged[j]._fbKey;
      if (localMap[key]) {
        merged[j] = localMap[key];
        delete localMap[key];
      }
    }
    for (var k in localMap) {
      merged.push(localMap[k]);
    }
    return fbArrayToObj(merged);
  });

  // 7. 月度存档
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
