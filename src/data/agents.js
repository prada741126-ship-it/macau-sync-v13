/**
 * v13 代理名单数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 * 对照档: 第七节模块11
 * 
 * 事件: emit agentList:updated
 * 
 * ★ 同步策略：Push-only（本地權威）
 *   CRUD 操作即時推送 Firebase，監聽器同步跨設備變更。
 *   跨設備同步：最後推送者勝出。無競態條件。
 */

/**
 * 新增代理
 * @param {string} name
 * @returns {object} { success, name }
 */
function addAgent(name) {
  if (!name || !name.trim()) {
    return { success: false, error: '代理名称不可为空' };
  }
  name = name.trim();

  var list = State.get('agentList');
  if (list.indexOf(name) >= 0) {
    return { success: false, error: '代理 "' + name + '" 已存在' };
  }

  State.update('agentList', function(arr) {
    arr.push(name);
    arr.sort(function(a, b) { return a.localeCompare(b); });
    return arr;
  });

  Store.saveAgentList(State.get('agentList'));
  syncAgentListToFirebase(State.get('agentList'));
  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
  return { success: true, name: name };
}

/**
 * 删除代理
 * @param {string} name
 * @returns {object}
 */
function removeAgent(name) {
  debugLog('v13-dlog-red', '🔴 removeAgent(' + name + ') before=' + JSON.stringify(State.get('agentList')));
  var removed = false;
  State.update('agentList', function(arr) {
    var idx = arr.indexOf(name);
    if (idx >= 0) {
      arr.splice(idx, 1);
      removed = true;
      debugLog('v13-dlog-red', '🔴 spliced idx=' + idx + ' after=' + JSON.stringify(arr));
    }
    return arr;
  });

  if (!removed) {
    debugLog('v13-dlog-ylw', '⚠ removeAgent NOT FOUND: ' + name);
    return { success: false, error: '代理 "' + name + '" 不存在' };
  }

  var newList = State.get('agentList');
  debugLog('v13-dlog-red', '🔴 State.get → ' + JSON.stringify(newList));
  Store.saveAgentList(newList);
  trackRecentlyDeleted('agent', name);
  // ★ 验证写入
  var verify = Store.loadAgentList();
  debugLog('v13-dlog-red', '🔴 localStorage verify: ' + JSON.stringify(verify) + ' match=' + (JSON.stringify(verify) === JSON.stringify(newList)));
  syncAgentListToFirebase(newList);
  Events.emit(EVENTS.AGENT_LIST_UPDATED, newList);
  debugLog('v13-dlog-grn', '✅ removeAgent DONE. remaining=' + JSON.stringify(newList));
  return { success: true, name: name };
}

/**
 * 重命名代理 (同时更新所有交易和钱包)
 * @param {string} oldName
 * @param {string} newName
 * @returns {object}
 */
function renameAgent(oldName, newName) {
  if (!newName || !newName.trim()) {
    return { success: false, error: '新名称不可为空' };
  }
  newName = newName.trim();

  var list = State.get('agentList');
  if (oldName === newName) {
    return { success: true, name: newName };
  }
  if (list.indexOf(newName) >= 0) {
    return { success: false, error: '代理 "' + newName + '" 已存在' };
  }

  // ★ 保存旧钱包记录（用于后续 Firebase tombstone 清理）
  var walletsSnapshot = State.get('agentWallets');
  var oldWalletRecords = (walletsSnapshot[oldName] || []).slice();

  // 更新名单
  State.update('agentList', function(arr) {
    var idx = arr.indexOf(oldName);
    if (idx >= 0) arr[idx] = newName;
    arr.sort(function(a, b) { return a.localeCompare(b); });
    return arr;
  });

  // 更新交易中的代理名
  State.update('txs', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].agent === oldName) arr[i].agent = newName;
    }
    return arr;
  });

  // 更新钱包 (oldName → newName)
  State.update('agentWallets', function(wallets) {
    if (wallets[oldName]) {
      wallets[newName] = wallets[oldName];
      delete wallets[oldName];
    }
    return wallets;
  });

  Store.saveAgentList(State.get('agentList'));
  Store.saveTxs(State.get('txs'));
  Store.saveWallets(State.get('agentWallets'));

  // ★ 同步到 Firebase（确保跨设备一致）

  // 1. 代理名单
  syncAgentListToFirebase(State.get('agentList'));

  // 2. 交易：逐笔推送（因为有 _fbKey，set 不会新建）
  var _txs = State.get('txs');
  for (var _ti = 0; _ti < _txs.length; _ti++) {
    if (_txs[_ti].agent === newName) {
      syncTxToFirebase(_txs[_ti]);
    }
  }

  // 3. 钱包：新 agent 名下逐笔同步到 Firebase
  var _aw = State.get('agentWallets');
  var _newRecords = _aw[newName];
  if (_newRecords) {
    for (var _ri = 0; _ri < _newRecords.length; _ri++) {
      syncWalletToFirebase(newName, _newRecords[_ri]);
    }
  }

  // 4. 钱包：旧 agent 名下逐笔 tombstone（标记删除，防止同步还原）
  for (var _oi = 0; _oi < oldWalletRecords.length; _oi++) {
    var _or = oldWalletRecords[_oi];
    if (_or._fbKey) {
      removeWalletFromFirebase(oldName, _or._fbKey);
    }
  }

  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
  Events.emit(EVENTS.TXS_LOADED, State.get('txs'));

  return { success: true, name: newName };
}

/**
 * 获取所有代理
 * @returns {Array}
 */
function getAllAgents() {
  return State.get('agentList').slice();
}

/** 从经纪人管理面板新增代理 (供 HTML onclick) */
function addAgentFromMgr() {
  var nameEl = document.getElementById('mgr-agent-name');
  if (!nameEl) return;
  var name = nameEl.value.trim();
  if (!name) {
    showToast('请输入代理名称', 'warning');
    return;
  }
  var result = addAgent(name);
  if (result.success) {
    showToast('代理 ' + name + ' 已新增', 'success');
    nameEl.value = '';

    // 刷新代理列表 (调度事件)
    Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));

    // 重新填充下拉选单
    var agentSel = document.getElementById('rm-agent');
    if (agentSel && typeof RM !== 'undefined' && RM.populateAgentDropdown) {
      RM.populateAgentDropdown();
    }
    var agentFilter = document.getElementById('rm-agent-filter');
    if (agentFilter && typeof RM !== 'undefined' && RM.populateAgentFilter) {
      RM.populateAgentFilter();
    }
  } else {
    showToast(result.error || '新增失败', 'error');
  }
}
