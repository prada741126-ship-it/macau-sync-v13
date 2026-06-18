/**
 * v13 Firebase 即时监听器
 * 
 * 依赖: sync/firebase.js (getDB, fbObjToArray, fbObjToWallets)
 *        core/state.js, core/events.js, core/store.js
 *        core/constants.js (FB_PATH, EVENTS, STORAGE_KEYS, CONFIG)
 * 对照档: 第九节 initSync() — 6 个监听器 + 代理名單智能監聽
 */

var _watchers = {};  // 已注册的监听器引用

/**
 * 启动所有 Firebase 即时监听器 (对照档 initSync)
 * ★ 代理名單使用智能監聽，區分刪除同步和新增同步：
 *   - 遠端為空 + 本地有數據 → 刪除同步（清空本地）
 *   - 本地為空 + 遠端有數據 → 新增同步（接受遠端）
 *   - 兩邊都有數據 → remote 覆蓋（Firebase 權威來源）
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

    // ★ 客户端侧过滤墓碑（state 中不需要墓碑，墓碑只存在于 Firebase）
    merged = merged.filter(function(r) { return !r._deleted; });

    console.log('[v13:watchers] TXS onValue: remote=' + remote.length + ' local=' + local.length + ' merged=' + merged.length);

    // 检测是否真正有变化（按长度+内容）
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      console.log('[v13:watchers] TXS CHANGED: ' + local.length + ' → ' + merged.length + ' entries');
      State.set('txs', merged);
      Store.saveTxs(merged);
      Events.emit(EVENTS.TXS_LOADED, merged);
    }
  });

  // 2. 监听公基金
  _watchers.fund = db.ref(FB_PATH.FUND).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('fundWithdrawals');

    // ★ 用 mergeTxs（时间戳决胜），确保编辑/删除能跨端同步（公基金结构与txs一致）
    var merged = mergeTxs(local, remote);

    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      console.log('[v13:watchers] FUND CHANGED: ' + local.length + ' → ' + merged.length + ' entries');
      State.set('fundWithdrawals', merged);
      Store.saveFund(merged);
      Events.emit(EVENTS.FUND_LOADED, merged);
    }
  });

  // 3. 代理名單：智能監聽（區分刪除同步和新增同步）★ FIX: Push-only 無法跨設備同步刪除
  var _agentListReceivedFirst = false;
  _watchers.agentList = db.ref(FB_PATH.AGENT_LIST).on('value', function(snap) {
    var remote = snap.val() || [];
    var local = State.get('agentList');
    if (!Array.isArray(local)) local = [];

    console.log('[v13:watchers] AGENT_LIST onValue: remote=' + remote.length + ' local=' + local.length + ' first=' + _agentListReceivedFirst);

    // 首次觸發：跳過（避免頁面載入時被 Firebase 回調覆蓋本地數據）
    if (!_agentListReceivedFirst) {
      _agentListReceivedFirst = true;
      console.log('[v13:watchers] AGENT_LIST skip first watcher fire (init)');
      // 如果本地為空但遠程有數據，接受首次初始化
      if (local.length === 0 && remote.length > 0) {
        console.log('[v13:watchers] AGENT_LIST init: local empty, applying remote=' + remote.length);
        State.set('agentList', remote);
        Store.saveAgentList(remote);
        Events.emit(EVENTS.AGENT_LIST_UPDATED, remote);
      }
      return;
    }

    // 檢測是否真正有變化
    var localSorted = local.slice().sort().join(',');
    var remoteSorted = remote.slice().sort().join(',');
    if (localSorted === remoteSorted) return;  // 無變化，跳過

    // CASE 1: 遠程為空（其他設備刪除了代理）→ 同步刪除
    if (remote.length === 0 && local.length > 0) {
      console.log('[v13:watchers] AGENT_LIST DELETE sync: remote empty, clearing local ' + local.length + ' agents');
      State.set('agentList', []);
      Store.saveAgentList([]);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, []);
      return;
    }

    // CASE 2: 本地為空，遠程有數據（其他設備新增了代理）→ 同步新增
    if (local.length === 0 && remote.length > 0) {
      console.log('[v13:watchers] AGENT_LIST ADD sync: local empty, applying remote ' + remote.length);
      State.set('agentList', remote);
      Store.saveAgentList(remote);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, remote);
      return;
    }

    // CASE 3: 兩邊都有數據但內容不同 → remote 為 Firebase 權威來源，直接覆蓋
    //   取并集會導致刪除同步失敗（被刪代理復活），必須用 remote 覆蓋
    console.log('[v13:watchers] AGENT_LIST OVERRIDE: local=' + local.length + ' → remote=' + remote.length, 'local:', JSON.stringify(local), 'remote:', JSON.stringify(remote));
    State.set('agentList', remote);
    Store.saveAgentList(remote);
    Events.emit(EVENTS.AGENT_LIST_UPDATED, remote);
  });

  // 4. 监听代理钱包
  _watchers.agentWallets = db.ref(FB_PATH.AGENT_WALLETS).on('value', function(snap) {
    var remote = fbObjToWallets(snap.val());
    // ★ 去掉 empty remote 的提前 return — 远端清空时需合并（mergeWallets 会正确处理 null）
    var local = State.get('agentWallets');

    // ★ 用 mergeWallets 合并（时间戳决胜），不能用 remote 直接覆盖 local
    var merged = mergeWallets(local, remote);

    // ★ 客户端侧过滤墓碑（state 中不需要墓碑）
    var cleaned = {};
    for (var _ag in merged) {
      var _filtered = merged[_ag].filter(function(r) { return !r._deleted; });
      if (_filtered.length > 0) cleaned[_ag] = _filtered;
    }
    merged = cleaned;

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      console.log('[v13:watchers] WALLETS CHANGED: localAgents=' + Object.keys(local||{}).length + ' remoteAgents=' + Object.keys(remote||{}).length + ' mergedAgents=' + Object.keys(merged||{}).length);
      State.set('agentWallets', merged);
      Store.saveWallets(merged);
      Events.emit(EVENTS.WALLETS_LOADED, merged);
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

    // ★ 用 mergeBookings（时间戳决胜），确保编辑/删除能跨端同步
    var merged = mergeBookings(local, remote);

    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      console.log('[v13:watchers] BOOKINGS CHANGED: ' + local.length + ' → ' + merged.length + ' entries');
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

  // 8. 监听酒店设定
  _watchers.hcConfig = db.ref(FB_PATH.HC_CONFIG).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('hotelConfig');

    // ★ 用 mergeTxs（时间戳决胜），确保编辑/删除能跨端同步
    var merged = mergeTxs(local, remote);

    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      console.log('[v13:watchers] HC_CONFIG CHANGED: ' + local.length + ' → ' + merged.length + ' entries');
      State.set('hotelConfig', merged);
      Store.saveHCConfig(merged);
      Events.emit(EVENTS.HC_CONFIG_UPDATED, merged);
    }
  });

  console.log('[v13:watchers] All 8 watchers started (agent list: smart sync)');
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
 * 手动全量同步 (从 Firebase 拉取，走 merge 逻辑避免覆盖本地数据)
 */
function syncDownloadAll() {
  var db = getDB();
  if (!db) return;

  db.ref(FB_PATH.TXS).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('txs');
    var merged = mergeTxs(local, remote);
    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('txs', merged);
      Store.saveTxs(merged);
      Events.emit(EVENTS.TXS_LOADED, merged);
    }
  });

  db.ref(FB_PATH.FUND).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('fundWithdrawals');
    // ★ 用 mergeTxs（时间戳决胜），确保下载合并时编辑/删除能正确处理
    var merged = mergeTxs(local, remote);
    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('fundWithdrawals', merged);
      Store.saveFund(merged);
      Events.emit(EVENTS.FUND_LOADED, merged);
    }
  });

  // 3. 代理名單：從 Firebase 拉取（智能合併 — 本地刪除優先）
  db.ref(FB_PATH.AGENT_LIST).once('value', function(snap) {
    var remote = snap.val() || [];
    var local = State.get('agentList');
    if (!Array.isArray(local)) local = [];

    // 如果兩邊一樣就跳過
    var localSorted = local.slice().sort().join(',');
    var remoteSorted = remote.slice().sort().join(',');
    if (localSorted === remoteSorted) return;

    // CASE: 遠程為空（其他設備刪除了所有代理）→ 同步刪除（與 watchers CASE 1 一致）
    if (local.length > 0 && remote.length === 0) {
      console.log('[v13:watchers] syncDownloadAll AGENT_LIST DELETE sync: remote empty, clearing local ' + local.length + ' agents');
      State.set('agentList', []);
      Store.saveAgentList([]);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, []);
      return;
    }

    // 本地為空，遠程有數據 → 接受遠程
    if (local.length === 0 && remote.length > 0) {
      console.log('[v13:watchers] syncDownloadAll AGENT_LIST: remote=' + remote.length + ' → local empty, applying');
      State.set('agentList', remote);
      Store.saveAgentList(remote);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, remote);
      return;
    }

    // 兩邊都有 → remote 為 Firebase 權威來源，直接覆蓋
    if (JSON.stringify(remote.slice().sort()) !== JSON.stringify(local.slice().sort())) {
      console.log('[v13:watchers] syncDownloadAll AGENT_LIST override: local=' + local.length + ' → remote=' + remote.length);
      State.set('agentList', remote);
      Store.saveAgentList(remote);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, remote);
    }
  });

  db.ref(FB_PATH.AGENT_WALLETS).once('value', function(snap) {
    var remote = fbObjToWallets(snap.val());
    var local = State.get('agentWallets');
    var merged = mergeWallets(local, remote);
    // ★ 客户端侧过滤墓碑
    var _cleaned = {};
    for (var _a in merged) {
      var _f = merged[_a].filter(function(r) { return !r._deleted; });
      if (_f.length > 0) _cleaned[_a] = _f;
    }
    merged = _cleaned;
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('agentWallets', merged);
      Store.saveWallets(merged);
      Events.emit(EVENTS.WALLETS_LOADED, merged);
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
    var remote = fbObjToArray(snap.val());
    var local = State.get('bookings');
    var merged = mergeBookings(local, remote);
    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('bookings', merged);
      Store.saveBookings(merged);
      Events.emit(EVENTS.BOOKINGS_LOADED, merged);
    }
  });

  db.ref(FB_PATH.ARCHIVES).once('value', function(snap) {
    var archives = snap.val();
    if (archives) {
      State.set('archives', archives);
      Store.saveArchives(archives);
    }
  });

  // 8. 酒店设定
  db.ref(FB_PATH.HC_CONFIG).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('hotelConfig');
    var merged = mergeTxs(local, remote);
    // ★ 客户端侧过滤墓碑
    merged = merged.filter(function(r) { return !r._deleted; });
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('hotelConfig', merged);
      Store.saveHCConfig(merged);
      Events.emit(EVENTS.HC_CONFIG_UPDATED, merged);
    }
  });
}
