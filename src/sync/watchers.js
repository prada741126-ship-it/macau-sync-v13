/**
 * v13 Firebase 即时监听器
 * 
 * 依赖: sync/firebase.js (getDB, fbObjToArray, fbObjToWallets)
 *        core/state.js, core/events.js, core/store.js
 *        core/constants.js (FB_PATH, EVENTS, STORAGE_KEYS, CONFIG)
 * 对照档: 第九节 initSync() — 7 个监听器
 */

var _watchers = {};  // 已注册的监听器引用

/**
 * 启动所有 Firebase 即时监听器 (对照档 initSync)
 */
function startWatchers() {
  var db = getDB();
  if (!db) {
    console.error('[v13:watchers] Cannot start — Firebase not initialized');
    return false;
  }

  // 1. 监听交易
  _watchers.txs = db.ref(FB_PATH.TXS).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('txs');

    // 用 mergeTxs 合并（时间戳胜出策略）
    var merged = mergeTxs(local, remote);

    // 检测是否真正有变化（按长度+内容）
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('txs', merged);
      Store.saveTxs(merged);
      Events.emit(EVENTS.TXS_LOADED, merged);
    }
  });

  // 2. 监听公基金
  _watchers.fund = db.ref(FB_PATH.FUND).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('fundWithdrawals');

    // 用 mergeArrays 合并（本地有+远端没有 → 保留本地；远端有+本地没有 → 加入）
    var merged = mergeArrays(local, remote);

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('fundWithdrawals', merged);
      Store.saveFund(merged);
      Events.emit(EVENTS.FUND_LOADED, merged);
    }
  });

  // 3. 监听代理名单
  _watchers.agentList = db.ref(FB_PATH.AGENT_LIST).on('value', function(snap) {
    var remote = snap.val();
    if (!remote || !Array.isArray(remote)) return;

    var local = State.get('agentList');
    if (JSON.stringify(local) !== JSON.stringify(remote)) {
      State.set('agentList', remote);
      Store.saveAgentList(remote);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, remote);
    }
  });

  // 4. 监听代理钱包
  _watchers.agentWallets = db.ref(FB_PATH.AGENT_WALLETS).on('value', function(snap) {
    var remote = fbObjToWallets(snap.val());
    if (!remote || Object.keys(remote).length === 0) return;

    var local = State.get('agentWallets');
    if (JSON.stringify(local) !== JSON.stringify(remote)) {
      State.set('agentWallets', remote);
      Store.saveWallets(remote);
      Events.emit(EVENTS.WALLETS_LOADED, remote);
    }
  });

  // 5. 监听工作月份
  _watchers.workingMonth = db.ref(FB_PATH.WORKING_MONTH).on('value', function(snap) {
    var remote = snap.val();
    if (remote && remote !== State.get('workingMonth')) {
      State.set('workingMonth', remote);
      Store.saveWorkingMonth(remote);
      Events.emit(EVENTS.MONTH_CHANGED, remote);
    }
  });

  // 6. 监听订房
  _watchers.bookings = db.ref(FB_PATH.RM_BOOKINGS).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('bookings');

    // 用 mergeArrays 合并，避免直接覆盖导致本地独有订房丢失
    var merged = mergeArrays(local, remote);

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('bookings', merged);
      Store.saveBookings(merged);
      Events.emit(EVENTS.BOOKINGS_LOADED, merged);
    }
  });

  // 7. 监听月度存档
  _watchers.archives = db.ref(FB_PATH.ARCHIVES).on('value', function(snap) {
    var remote = snap.val();
    if (remote) {
      State.set('archives', remote);
      Store.saveArchives(remote);
    }
  });

  console.log('[v13:watchers] All 7 watchers started');
  return true;
}

/**
 * 停止所有监听器
 */
function stopWatchers() {
  var db = getDB();
  if (!db) return;

  for (var key in _watchers) {
    try {
      var path = FB_PATH[key.toUpperCase()];
      if (path) db.ref(path).off('value', _watchers[key]);
    } catch (e) {
      console.error('[v13:watchers] Error stopping watcher:', key, e);
    }
  }
  _watchers = {};
  console.log('[v13:watchers] All watchers stopped');
}

/**
 * 手动全量同步 (从 Firebase 拉取)
 */
function syncDownloadAll() {
  var db = getDB();
  if (!db) return;

  db.ref(FB_PATH.TXS).once('value', function(snap) {
    var txs = fbObjToArray(snap.val());
    if (txs.length > 0) {
      State.set('txs', txs);
      Store.saveTxs(txs);
      Events.emit(EVENTS.TXS_LOADED, txs);
    }
  });

  db.ref(FB_PATH.FUND).once('value', function(snap) {
    var funds = fbObjToArray(snap.val());
    if (funds.length > 0) {
      State.set('fundWithdrawals', funds);
      Store.saveFund(funds);
      Events.emit(EVENTS.FUND_LOADED, funds);
    }
  });

  db.ref(FB_PATH.AGENT_LIST).once('value', function(snap) {
    var list = snap.val();
    if (list && Array.isArray(list)) {
      State.set('agentList', list);
      Store.saveAgentList(list);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, list);
    }
  });

  db.ref(FB_PATH.AGENT_WALLETS).once('value', function(snap) {
    var wallets = fbObjToWallets(snap.val());
    if (Object.keys(wallets).length > 0) {
      State.set('agentWallets', wallets);
      Store.saveWallets(wallets);
      Events.emit(EVENTS.WALLETS_LOADED, wallets);
    }
  });

  db.ref(FB_PATH.WORKING_MONTH).once('value', function(snap) {
    var month = snap.val();
    if (month) {
      State.set('workingMonth', month);
      Store.saveWorkingMonth(month);
      Events.emit(EVENTS.MONTH_CHANGED, month);
    }
  });

  db.ref(FB_PATH.RM_BOOKINGS).once('value', function(snap) {
    var bookings = fbObjToArray(snap.val());
    if (bookings.length > 0) {
      State.set('bookings', bookings);
      Store.saveBookings(bookings);
      Events.emit(EVENTS.BOOKINGS_LOADED, bookings);
    }
  });

  db.ref(FB_PATH.ARCHIVES).once('value', function(snap) {
    var archives = snap.val();
    if (archives) {
      State.set('archives', archives);
      Store.saveArchives(archives);
    }
  });
}
