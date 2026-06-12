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

  // 1. 交易：先从 Firebase 拉取最新，mergeTxs 后再全量 set
  //    这样本地的删除（splice）会正确反映到 Firebase
  db.ref(FB_PATH.TXS).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var merged = mergeTxs(remote, txs); // 本地(_updatedAt大)胜出
    db.ref(FB_PATH.TXS).set(fbArrayToObj(merged), function(err) {
      if (err) console.error('[v13:uploader] TXS set error:', err);
    });
  });

  // 2. 公基金：先拉取再 set（保证删除同步）
  db.ref(FB_PATH.FUND).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    // 以本地为准（本地已 splice 的不在 localMap 里，不会加入 merged）
    var localMap = {};
    for (var fi = 0; fi < fundWithdrawals.length; fi++) {
      localMap[fundWithdrawals[fi]._fbKey] = fundWithdrawals[fi];
    }
    // 远端有但本地没有 → 远端胜出（新增）；远端有且本地也有 → _updatedAt 大者胜出
    for (var fj = 0; fj < remote.length; fj++) {
      var fKey = remote[fj]._fbKey;
      if (!localMap[fKey]) {
        // 远端有但本地没有：可能是别的设备新增的 → 保留
        localMap[fKey] = remote[fj];
      } else {
        // 两边都有 → 时间戳大者胜
        var lTs = localMap[fKey]._updatedAt || 0;
        var rTs = remote[fj]._updatedAt || 0;
        if (rTs > lTs) localMap[fKey] = remote[fj];
      }
    }
    var mergedFund = [];
    for (var fk in localMap) mergedFund.push(localMap[fk]);
    // 更新本地 state（如果有变化）
    if (mergedFund.length !== fundWithdrawals.length) {
      State.set('fundWithdrawals', mergedFund);
      Store.saveFund(mergedFund);
    }
    db.ref(FB_PATH.FUND).set(fbArrayToObj(mergedFund), function(err) {
      if (err) console.error('[v13:uploader] FUND set error:', err);
    });
  });

  // 3. 代理名單：先拉取再合併再 set（避免覆蓋其他設備新增的代理）
  db.ref(FB_PATH.AGENT_LIST).once('value', function(snap) {
    var remote = snap.val();
    if (!remote || !Array.isArray(remote)) remote = [];
    var merged = mergeAgentLists(agentList, remote);
    db.ref(FB_PATH.AGENT_LIST).set(merged, function(err) {
      if (err) console.error('[v13:uploader] AGENT_LIST set error:', err);
    });
  });

  // 4. 代理钱包：mergeWallets 后全量 set
  db.ref(FB_PATH.AGENT_WALLETS).once('value', function(snap) {
    var remoteWallets = fbObjToWallets(snap.val());
    var merged = mergeWallets(remoteWallets, agentWallets); // 本地胜出
    db.ref(FB_PATH.AGENT_WALLETS).set(fbWalletsToObj(merged), function(err) {
      if (err) console.error('[v13:uploader] WALLETS set error:', err);
    });
  });

  // 5. 工作月份
  db.ref(FB_PATH.WORKING_MONTH).set(workingMonth);

  // 6. 订房：与公基金相同策略（先拉再合并再 set）
  db.ref(FB_PATH.RM_BOOKINGS).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var localMap = {};
    for (var bi = 0; bi < bookings.length; bi++) {
      localMap[bookings[bi]._fbKey] = bookings[bi];
    }
    for (var bj = 0; bj < remote.length; bj++) {
      var bKey = remote[bj]._fbKey;
      if (!localMap[bKey]) {
        localMap[bKey] = remote[bj];
      } else {
        var blTs = localMap[bKey]._updatedAt || 0;
        var brTs = remote[bj]._updatedAt || 0;
        if (brTs > blTs) localMap[bKey] = remote[bj];
      }
    }
    var mergedBookings = [];
    for (var bk in localMap) mergedBookings.push(localMap[bk]);
    if (mergedBookings.length !== bookings.length) {
      State.set('bookings', mergedBookings);
      Store.saveBookings(mergedBookings);
    }
    db.ref(FB_PATH.RM_BOOKINGS).set(fbArrayToObj(mergedBookings), function(err) {
      if (err) console.error('[v13:uploader] BOOKINGS set error:', err);
    });
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
