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

  // 1. 交易：transaction 原子合併 (個別 CRUD 已即時推送，此為安全網)
  db.ref(FB_PATH.TXS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(txs);
    var rArr = fbObjToArray(remote);
    var merged = mergeTxs(rArr, txs);
    return fbArrayToObj(merged);
  });

  // 2. 公基金：transaction 原子合併
  db.ref(FB_PATH.FUND).transaction(function(remote) {
    if (!remote) return fbArrayToObj(fundWithdrawals);
    var rArr = fbObjToArray(remote);
    var localMap = {};
    for (var fi = 0; fi < fundWithdrawals.length; fi++) {
      localMap[fundWithdrawals[fi]._fbKey] = fundWithdrawals[fi];
    }
    for (var fj = 0; fj < rArr.length; fj++) {
      var fKey = rArr[fj]._fbKey;
      if (!localMap[fKey]) {
        localMap[fKey] = rArr[fj];
      } else {
        var lTs = localMap[fKey]._updatedAt || 0;
        var rTs = rArr[fj]._updatedAt || 0;
        if (rTs > lTs) localMap[fKey] = rArr[fj];
      }
    }
    var mf = [];
    for (var fk in localMap) mf.push(localMap[fk]);
    return fbArrayToObj(mf);
  });

  // 3. 代理名單：transaction 原子合併
  db.ref(FB_PATH.AGENT_LIST).transaction(function(remote) {
    if (!remote || !Array.isArray(remote)) return agentList;
    return mergeAgentLists(agentList, remote);
  });

  // 4. 代理钱包：transaction 原子合併
  db.ref(FB_PATH.AGENT_WALLETS).transaction(function(remote) {
    if (!remote) return fbWalletsToObj(agentWallets);
    var rw = fbObjToWallets(remote);
    return fbWalletsToObj(mergeWallets(rw, agentWallets));
  });

  // 5. 工作月份
  db.ref(FB_PATH.WORKING_MONTH).set(workingMonth);

  // 6. 订房：transaction 原子合併
  db.ref(FB_PATH.RM_BOOKINGS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(bookings);
    var rArr = fbObjToArray(remote);
    var localMap = {};
    for (var bi = 0; bi < bookings.length; bi++) {
      localMap[bookings[bi]._fbKey] = bookings[bi];
    }
    for (var bj = 0; bj < rArr.length; bj++) {
      var bKey = rArr[bj]._fbKey;
      if (!localMap[bKey]) {
        localMap[bKey] = rArr[bj];
      } else {
        var blTs = localMap[bKey]._updatedAt || 0;
        var brTs = rArr[bj]._updatedAt || 0;
        if (brTs > blTs) localMap[bKey] = rArr[bj];
      }
    }
    var mb = [];
    for (var bk in localMap) mb.push(localMap[bk]);
    return fbArrayToObj(mb);
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
