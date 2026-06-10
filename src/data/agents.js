/**
 * v13 代理名单数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 * 对照档: 第七节模块11
 * 
 * 事件: emit agentList:updated
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
  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
  return { success: true, name: name };
}

/**
 * 删除代理
 * @param {string} name
 * @returns {object}
 */
function removeAgent(name) {
  var removed = false;
  State.update('agentList', function(arr) {
    var idx = arr.indexOf(name);
    if (idx >= 0) {
      arr.splice(idx, 1);
      removed = true;
    }
    return arr;
  });

  if (!removed) {
    return { success: false, error: '代理 "' + name + '" 不存在' };
  }

  Store.saveAgentList(State.get('agentList'));
  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
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

  // 更新钱包
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
