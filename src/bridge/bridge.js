/**
 * v13 桥接层 — HTML onclick → JS 函数
 * 
 * HTML 模板中所有 onclick 调用必须在此处有对应全局函数。
 * 这是模板（markup）与数据/逻辑（JS 模块）之间的唯一桥梁。
 * 
 * 依赖: 所有 data/ 和 ui/ 模块已加载
 */

// ============================================================================
// 手機調試面板 (內建可視 log，不需開 Console)
// ============================================================================
var _debugLines = [];
var _debugMaxLines = 120;

/** 寫入一筆日誌到螢幕面板 + console */
function debugLog(className, msg) {
  var ts = new Date().toISOString().slice(11, 23);
  var line = '<div class="v13-dlog"><span class="v13-dlog-ts">' + ts + '</span> <span class="' + className + '">' + msg + '</span></div>';
  _debugLines.push(line);
  if (_debugLines.length > _debugMaxLines) _debugLines.shift();
  var panel = document.getElementById('v13-debug-log');
  if (panel) panel.innerHTML = _debugLines.join('');
  console.log(msg);
}

function debugToggle() {
  var panel = document.getElementById('v13-debug-panel');
  if (!panel) return;
  var toggle = document.getElementById('v13-debug-toggle');
  if (panel.classList.contains('collapsed')) {
    panel.classList.remove('collapsed');
    panel.classList.add('expanded');
    if (toggle) toggle.textContent = '▼';
  } else {
    panel.classList.remove('expanded');
    panel.classList.add('collapsed');
    if (toggle) toggle.textContent = '▶';
  }
}

function debugShow() {
  var panel = document.getElementById('v13-debug-panel');
  if (panel) {
    panel.style.display = 'block';
    // 預設折疊，不擋操作
    panel.classList.add('collapsed');
    panel.classList.remove('expanded');
  }
  localStorage.setItem('macau_debug', '1');
}
function debugHide() {
  var panel = document.getElementById('v13-debug-panel');
  if (panel) panel.style.display = 'none';
}
function debugClear() {
  _debugLines = [];
  var panel = document.getElementById('v13-debug-log');
  if (panel) panel.innerHTML = '';
}

// ★ 自動啟用條件: URL ?debug=1 或 localStorage macau_debug=1
(function() {
  if (location.search.indexOf('debug=1') !== -1) {
    localStorage.setItem('macau_debug', '1');
  }
  if (localStorage.getItem('macau_debug') === '1') {
    // 延遲顯示以確保 DOM 已就緒
    var _di = setInterval(function() {
      var panel = document.getElementById('v13-debug-panel');
      if (panel) { panel.style.display = 'block'; clearInterval(_di); }
    }, 200);
    setTimeout(function() { clearInterval(_di); }, 5000);
  }
})();

// ============================================================================
// 交易表单桥接
// ============================================================================

/** 当前编辑中的交易 fbKey，null 表示新增 */
var _txEditingKey = null;

/**
 * 打开交易模态框
 * @param {string|null} fbKey - 编辑时传入 fbKey，新增时传 null
 */
function _openTxModal(fbKey) {
  _txEditingKey = fbKey;
  _populateTxAgentDropdown();
  _populateTxVenueDropdown();

  var titleEl = document.getElementById('modal-title');
  var draftEl = document.getElementById('draft-indicator');

  if (fbKey) {
    // 编辑模式
    if (titleEl) titleEl.textContent = '編輯交易';
    var tx = getTxByKey(fbKey);
    if (tx) _fillTxForm(tx);
    // 检查草稿
    if (draftEl) draftEl.style.display = hasDraft(fbKey) ? 'block' : 'none';
  } else {
    // 新增模式
    if (titleEl) titleEl.textContent = '新增交易';
    _resetTxForm();
    if (draftEl) draftEl.style.display = 'none';
  }

  openModal('modal');
}

/** 填充交易表单代理下拉 */
function _populateTxAgentDropdown() {
  var sel = document.getElementById('tx-agent');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇代理</option>';
  var agents = getAllAgents();
  for (var i = 0; i < agents.length; i++) {
    var opt = document.createElement('option');
    opt.value = agents[i];
    opt.textContent = agents[i];
    sel.appendChild(opt);
  }
  // 绑定代理选择联动 → 自动填入碼佣率
  sel.onchange = _onAgentChange;
}

/** 填充交易表单地点下拉 */
function _populateTxVenueDropdown() {
  var sel = document.getElementById('tx-venue');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇地點</option>';
  var venues = (typeof VENUE_OPTIONS !== 'undefined') ? VENUE_OPTIONS : ['新濠天地', '新濠影滙', '金沙', '銀河', '永利', '上葡京'];
  for (var i = 0; i < venues.length; i++) {
    var opt = document.createElement('option');
    // VENUE_OPTIONS 是对象数组 {label, casino}
    var venue = venues[i];
    if (typeof venue === 'object' && venue !== null) {
      opt.value = venue.label || venue;
      opt.textContent = venue.label || venue;
      opt.setAttribute('data-casino', venue.casino || '');
    } else {
      opt.value = venue;
      opt.textContent = venue;
    }
    sel.appendChild(opt);
  }
}

/** 代理选择变更 → 自动填入该代理最近交易的碼佣率 */
function _onAgentChange() {
  var agentSel = document.getElementById('tx-agent');
  var rateEl = document.getElementById('tx-rate');
  if (!agentSel || !rateEl) return;
  var agent = agentSel.value;
  if (!agent) return;

  // 查找该代理最近一笔交易，取其碼佣率
  var txs = State.get('txs');
  var lastRate = null;
  for (var i = txs.length - 1; i >= 0; i--) {
    if (txs[i].agent === agent && txs[i].rate) {
      lastRate = txs[i].rate;
      break;
    }
  }
  // 若无历史交易，使用默认 0.8
  if (lastRate != null) {
    rateEl.value = lastRate;
  } else if (!rateEl.value) {
    rateEl.value = '0.8';
  }
  calc(); // 触发自动计算佣金/基金
}

/** 填写编辑表单 */
function _fillTxForm(tx) {
  var fields = {
    'tx-type':  tx.type,
    'tx-date':  tx.date,
    'tx-agent': tx.agent,
    'tx-client': tx.client,
    'tx-venue': tx.venue,
    'tx-volume': tx.volume,
    'tx-rate':   tx.rate,
    'tx-comm':   fmt(tx.comm),
    'tx-bonus':  tx.bonus,
    'tx-drawn':  tx.drawn,
    'tx-undrawn': fmt(tx.undrawn),
    'tx-fund':   fmt(tx.fund),
    'tx-cash':   tx.cash || '',
    'tx-note':   tx.note,
  };
  for (var id in fields) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id] != null ? fields[id] : '';
  }
  toggleTypeFields();
}

/** 重置新增表单 */
function _resetTxForm() {
  var ids = ['tx-type', 'tx-date', 'tx-agent', 'tx-client', 'tx-venue',
             'tx-volume', 'tx-rate', 'tx-comm', 'tx-bonus', 'tx-drawn',
             'tx-undrawn', 'tx-fund', 'tx-cash', 'tx-note'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.value = '';
  }
  var typeEl = document.getElementById('tx-type');
  if (typeEl) typeEl.value = 'rolling';
  var dateEl = document.getElementById('tx-date');
  if (dateEl) dateEl.value = nowStr();
  toggleTypeFields();
}

/** 交易类型切换 — 显示/隐藏相应字段 */
function toggleTypeFields() {
  var type = (document.getElementById('tx-type') || {}).value;
  var rollingFields = ['tx-volume', 'tx-rate', 'tx-comm', 'tx-bonus', 'tx-drawn', 'tx-undrawn', 'tx-fund'];
  var cashFields = ['tx-cash'];

  // 显示/隐藏转码字段
  for (var i = 0; i < rollingFields.length; i++) {
    var el = document.getElementById(rollingFields[i]);
    if (el) {
      var row = el.closest('.form-row');
      if (row) row.style.display = type === 'rolling' ? '' : 'none';
    }
  }

  // 显示/隐藏现金字段
  for (var j = 0; j < cashFields.length; j++) {
    var cel = document.getElementById(cashFields[j]);
    if (cel) {
      var crow = cel.closest('.form-row');
      if (crow) crow.style.display = type === 'cash' ? '' : 'none';
    }
  }
}

/** 自动计算佣金/基金/未提领 */
function calc() {
  try {
    var volEl   = document.getElementById('tx-volume');
    var rateEl  = document.getElementById('tx-rate');
    var bonusEl = document.getElementById('tx-bonus');
    var drawnEl = document.getElementById('tx-drawn');

    var vol   = toNum(volEl ? volEl.value : 0);
    var rate  = toNum(rateEl ? rateEl.value : 0);
    var bonus = toNum(bonusEl ? bonusEl.value : 0);
    var drawn = toNum(drawnEl ? drawnEl.value : 0);

    if (typeof calcComm !== 'function') {
      console.error('[calc] calcComm is not defined');
      return;
    }

    var comm = calcComm(vol, rate);
    var fund = calcFund(comm, bonus);
    var undrawn = calcUndrawn(bonus, drawn);

    var commEl = document.getElementById('tx-comm');
    if (commEl) commEl.value = Math.round(comm).toString();

    var fundEl = document.getElementById('tx-fund');
    if (fundEl) fundEl.value = Math.round(fund).toString();

    var undrawnEl = document.getElementById('tx-undrawn');
    if (undrawnEl) undrawnEl.value = Math.round(undrawn).toString();

    console.log('[calc] vol=' + vol + ' rate=' + rate + ' → comm=' + Math.round(comm) + ' fund=' + Math.round(fund) + ' undrawn=' + Math.round(undrawn));

    // 保存草稿
    if (typeof saveDraft === 'function') {
      saveDraft(getCurrentFormData());
    }
  } catch(e) {
    console.error('[calc] error:', e);
  }
}

/** 保存交易表单 */
function saveForm() {
  var data = getCurrentFormData();

  if (!data.agent) {
    showToast('請選擇代理', 'warning');
    return;
  }

  if (_txEditingKey) {
    // 编辑
    var updated = updateTx(_txEditingKey, data);
    if (updated) {
      clearDraft(_txEditingKey);
      closeModal();
      refreshAllViews();
      toastCRUDDone();
    } else {
      showToast('更新失敗', 'error');
    }
  } else {
    // 新增
    var created = createTx(data);
    if (created) {
      closeModal();
      refreshAllViews();
      toastCRUDDone();
    } else {
      showToast('新增失敗', 'error');
    }
  }
}

/** 获取当前表单数据 */
function getCurrentFormData() {
  return {
    type:   (document.getElementById('tx-type') || {}).value || 'rolling',
    date:   (document.getElementById('tx-date') || {}).value || '',
    agent:  (document.getElementById('tx-agent') || {}).value || '',
    client: (document.getElementById('tx-client') || {}).value || '',
    venue:  (document.getElementById('tx-venue') || {}).value || '',
    volume: (document.getElementById('tx-volume') || {}).value || '0',
    rate:   (document.getElementById('tx-rate') || {}).value || '0',
    bonus:  (document.getElementById('tx-bonus') || {}).value || '0',
    drawn:  (document.getElementById('tx-drawn') || {}).value || '0',
    cash:   (document.getElementById('tx-cash') || {}).value || '0',
    note:   (document.getElementById('tx-note') || {}).value || '',
  };
}

/** 刷新所有视图 */
function refreshAllViews() {
  try { renderOverview(); } catch(e) { console.error('refresh overview:', e); }
  try { renderAll(); }      catch(e) { console.error('refresh all:', e); }
  try { renderQuery(); }    catch(e) { console.error('refresh query:', e); }
  try { renderSummary(); }  catch(e) { console.error('refresh summary:', e); }
}

// ============================================================================
// 公基金表单桥接
// ============================================================================

function saveFundForm() {
  var data = {
    date:   (document.getElementById('fund-date') || {}).value || nowStr(),
    type:   (document.getElementById('fund-type') || {}).value || 'deposit',
    amount: (document.getElementById('fund-amount') || {}).value || '0',
    note:   (document.getElementById('fund-note') || {}).value || '',
  };

  if (!data.amount || toNum(data.amount) <= 0) {
    showToast('請輸入金額', 'warning');
    return;
  }

  var record = createFund(data);
  if (record) {
    closeModal('fund-modal');
    refreshAllViews();
    toastCRUDDone();
  } else {
    showToast('新增失敗', 'error');
  }
}

/** 打开公基金模态框（重置表单） */
function openFundModal() {
  var dateEl = document.getElementById('fund-date');
  if (dateEl) dateEl.value = nowStr();
  var typeEl = document.getElementById('fund-type');
  if (typeEl) typeEl.value = 'deposit';
  var amountEl = document.getElementById('fund-amount');
  if (amountEl) amountEl.value = '';
  var noteEl = document.getElementById('fund-note');
  if (noteEl) noteEl.value = '';
  openModal('fund-modal');
}

/** 删除公基金记录（从查询页调用） */
function deleteFundRecord(fbKey) {
  showConfirm('確定刪除此筆公基金記錄？', function() {
    var result = deleteFund(fbKey);
    if (result) {
      toastCRUDDone();
      refreshAllViews();
    } else {
      showToast('刪除失敗', 'error');
    }
  });
}

/** 删除代理钱包记录（从查询页调用） */
function deleteAgentWallet(agent, fbKey) {
  showConfirm('確定刪除此筆錢包記錄？', function() {
    var result = deleteWallet(agent, fbKey);
    if (result) {
      toastCRUDDone();
      refreshAllViews();
    } else {
      showToast('刪除失敗', 'error');
    }
  });
}

// ============================================================================
// 代理钱包表单桥接
// ============================================================================

var _walletAgentName = null;

/** 打开代理钱包模态框 (供外部调用) */
function openWalletModal(agentName) {
  _walletAgentName = agentName || '';
  // 填充代理下拉
  var agentSel = document.getElementById('wallet-agent');
  if (agentSel) {
    agentSel.innerHTML = '<option value="">選擇代理</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      var opt = document.createElement('option');
      opt.value = agents[i];
      opt.textContent = agents[i];
      if (agents[i] === agentName) opt.selected = true;
      agentSel.appendChild(opt);
    }
  }
  var title = document.getElementById('wallet-title');
  if (title) title.textContent = '代理錢包' + (agentName ? ' - ' + agentName : '');
  var dateEl = document.getElementById('wallet-date');
  if (dateEl) dateEl.value = nowStr();
  var typeEl = document.getElementById('wallet-type');
  if (typeEl) typeEl.value = 'deposit';
  var amountEl = document.getElementById('wallet-amount');
  if (amountEl) amountEl.value = '';
  var noteEl = document.getElementById('wallet-note');
  if (noteEl) noteEl.value = '';
  openModal('agent-wallet-modal');
}

function saveAgentWalletForm() {
  var agentSel = document.getElementById('wallet-agent');
  var agent = (agentSel && agentSel.value) ? agentSel.value : _walletAgentName;
  if (!agent) {
    showToast('請選擇代理', 'warning');
    return;
  }

  var data = {
    date:   (document.getElementById('wallet-date') || {}).value || nowStr(),
    type:   (document.getElementById('wallet-type') || {}).value || 'deposit',
    amount: (document.getElementById('wallet-amount') || {}).value || '0',
    note:   (document.getElementById('wallet-note') || {}).value || '',
  };

  if (!data.amount || toNum(data.amount) <= 0) {
    showToast('請輸入金額', 'warning');
    return;
  }

  var record = createWallet(agent, data);
  if (record) {
    closeModal('agent-wallet-modal');
    refreshAllViews();
    toastCRUDDone();
  } else {
    showToast('新增失敗', 'error');
  }
}

// ============================================================================
// 酒店设定模态框桥接
// ============================================================================

var _hcEditingKey = null;

function hcOpenModal(fbKey) {
  _hcEditingKey = fbKey || null;

  // 填充体系下拉
  _hcPopulateCasinoDropdown();

  var title = document.getElementById('hc-modal-title');
  if (fbKey) {
    if (title) title.textContent = '編輯房型';
    // 查找并填充
    var config = getAllHC();
    for (var i = 0; i < config.length; i++) {
      if (config[i]._fbKey === fbKey) {
        _hcFillForm(config[i]);
        break;
      }
    }
  } else {
    if (title) title.textContent = '新增房型';
    _hcResetForm();
  }

  // 显示 Modal
  var bg = document.getElementById('hc-modal-bg');
  if (bg) bg.style.display = 'flex';
}

function hcCloseModal() {
  var bg = document.getElementById('hc-modal-bg');
  if (bg) bg.style.display = 'none';
  _hcEditingKey = null;
}

function hcSaveModal() {
  var data = {
    casino:    (document.getElementById('hc-casino') || {}).value || '',
    hotel:     (document.getElementById('hc-hotel') || {}).value || '',
    code:      (document.getElementById('hc-code') || {}).value || '',
    room:      (document.getElementById('hc-room') || {}).value || '',
    weekday:   (document.getElementById('hc-weekday') || {}).value || '0',
    weekend:   (document.getElementById('hc-weekend') || {}).value || '0',
    special:   (document.getElementById('hc-special') || {}).value || '0',
    threshold: (document.getElementById('hc-threshold') || {}).value || '0',
  };

  if (!data.casino || !data.hotel || !data.room) {
    showToast('請填寫體系、酒店、房型', 'warning');
    return;
  }

  if (_hcEditingKey) {
    var updated = updateHC(_hcEditingKey, data);
    if (updated) {
      hcCloseModal();
      showToast('房型已更新', 'success');
      RM.render();
    }
  } else {
    var created = createHC(data);
    if (created) {
      hcCloseModal();
      showToast('房型已新增', 'success');
      RM.render();
    }
  }
}

function hcOnCasinoChange() {
  var casino = (document.getElementById('hc-casino') || {}).value;
  var hotelSel = document.getElementById('hc-hotel');
  if (!hotelSel) return;
  hotelSel.innerHTML = '<option value="">選擇酒店</option>';

  var hotels = getHotelsByCasino(casino);
  for (var i = 0; i < hotels.length; i++) {
    var opt = document.createElement('option');
    opt.value = hotels[i];
    opt.textContent = hotels[i];
    hotelSel.appendChild(opt);
  }
}

function _hcPopulateCasinoDropdown() {
  var sel = document.getElementById('hc-casino');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇體系</option>';
  var config = getAllHC();
  var seen = {};
  for (var i = 0; i < config.length; i++) {
    if (!seen[config[i].casino]) {
      seen[config[i].casino] = true;
      var opt = document.createElement('option');
      opt.value = config[i].casino;
      opt.textContent = config[i].casino;
      sel.appendChild(opt);
    }
  }
}

function _hcFillForm(entry) {
  var fields = {
    'hc-casino': entry.casino, 'hc-hotel': entry.hotel,
    'hc-code': entry.code, 'hc-room': entry.room,
    'hc-weekday': entry.weekday, 'hc-weekend': entry.weekend,
    'hc-special': entry.special, 'hc-threshold': entry.threshold
  };
  for (var id in fields) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id] != null ? fields[id] : '';
  }
  hcOnCasinoChange(); // 填充酒店
  if (document.getElementById('hc-hotel')) {
    document.getElementById('hc-hotel').value = entry.hotel;
  }
}

function _hcResetForm() {
  var ids = ['hc-casino', 'hc-hotel', 'hc-code', 'hc-room',
             'hc-weekday', 'hc-weekend', 'hc-special', 'hc-threshold'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.value = '';
  }
}

// ============================================================================
// CSV 导入桥接
// ============================================================================

function handleCSVImport(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var result = importTxsCSV ? importTxsCSV(ev.target.result) : { success: false };
    if (result.success) {
      showToast('匯入 ' + result.count + ' 筆交易', 'success');
      refreshAllViews();
    } else {
      showToast(result.error || '匯入失敗', 'error');
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function rmHandleImport(event) {
  if (RM && RM.handleImport) {
    RM.handleImport(event);
  }
}

// ============================================================================
// 移动端侧栏
// ============================================================================

function toggleMobileSidebar() {
  var sb = document.getElementById('sidebar');
  if (sb) {
    var isOpen = sb.style.transform === 'translateX(0px)' || sb.style.left === '0px';
    sb.style.left = isOpen ? '-260px' : '0px';
    sb.style.transform = isOpen ? 'translateX(-260px)' : 'translateX(0)';
  }
}

// ============================================================================
// 代理管理列表渲染
// ============================================================================

/** 渲染代理管理列表 (agent-mgr-modal 内) */
function _renderAgentMgrList() {
  var container = document.getElementById('agent-mgr-list');
  if (!container) return;

  var agents = getAllAgents();
  container.innerHTML = '';

  if (agents.length === 0) {
    container.innerHTML = '<div style="padding:16px;color:' + UI_COLORS.textMuted + ';text-align:center">暫無代理</div>';
    return;
  }

  for (var i = 0; i < agents.length; i++) {
    (function(agentName) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid ' + UI_COLORS.borderSubtle;

      var nameSpan = document.createElement('span');
      nameSpan.textContent = agentName;
      nameSpan.style.cssText = 'font-size:14px;color:' + UI_COLORS.textPrimary;

      var btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex;gap:6px';

      // 钱包按钮
      var walletBtn = document.createElement('button');
      walletBtn.textContent = '錢包';
      walletBtn.style.cssText = 'background:' + UI_COLORS.success + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px';
      walletBtn.onclick = function() {
        closeModal('agent-mgr-modal');
        openWalletModal(agentName);
      };

      // 删除按钮
      var delBtn = document.createElement('button');
      delBtn.textContent = '刪除';
      delBtn.style.cssText = 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px';
      delBtn.onclick = (function(name) {
        return function() {
          showConfirm('確定刪除代理「' + name + '」？', function() {
            var result = removeAgent(name);
            if (result.success) {
              showToast('代理已刪除', 'success');
              _renderAgentMgrList();
              _populateTxAgentDropdown();
              if (RM && RM.populateAgentDropdown) RM.populateAgentDropdown();
              if (RM && RM.populateAgentFilter) RM.populateAgentFilter();
            } else {
              showToast(result.error || '刪除失敗', 'error');
            }
          });
        };
      })(agentName);

      btnGroup.appendChild(walletBtn);
      btnGroup.appendChild(delBtn);
      row.appendChild(nameSpan);
      row.appendChild(btnGroup);
      container.appendChild(row);
    })(agents[i]);
  }
}

// 监听代理管理 Modal 打开事件，刷新列表
// 注意: openModal 是同步的，我们在 agent-mgr-modal 点击后手动刷新
// 替代方案: 劫持原始 openModal
var _origOpenModal = openModal;
openModal = function(id, data) {
  var result = _origOpenModal(id, data);
  if (id === 'agent-mgr-modal') {
    setTimeout(_renderAgentMgrList, 50);
  }
  return result;
};

// ============================================================================
// 事件监听：tx:new / tx:edit:request
// ============================================================================

Events.on('tx:new', function() {
  _openTxModal(null);
});

Events.on('tx:edit:request', function(fbKey) {
  _openTxModal(fbKey);
});

// 监听交易创建/更新/删除后保存草稿
Events.on(EVENTS.TX_CREATED, function() { clearDraft(null); });
Events.on(EVENTS.TX_UPDATED, function() { clearDraft(null); });

/**
 * 手動重置為最新預設數據 (UI 按鈕調用)
 */
function hcResetPreset() {
  var msg = '確定要重置為最新預設數據嗎？\n這會刪除現有所有酒店設定（' + State.get('hotelConfig').length + ' 筆），並載入 ' + PRESET_CONFIG.length + ' 筆預設數據。此操作無法復原！';
  showConfirm(msg, function() {
    try {
      var count = resetHCToPreset();
      showToast('已重置 ' + count + ' 筆酒店預設數據', 'success');
      _hcSelected = {};
      _hcLastClicked = null;
      hcRender();
    } catch(e) {
      console.error('[v13:hc] reset preset error:', e);
      showToast('重置失敗', 'error');
    }
  }, { okColor: '#b71c1c' });
}

/** 批量選取狀態: { fbKey: true } */
var _hcSelected = {};
/** 最後一次點擊的 fbKey (用於 Shift 範圍選取) */
var _hcLastClicked = null;

/**
 * 渲染酒店设定列表 (hc-table tbody)
 * 可选: 按 casino/hotel/search 筛选
 */
function hcRender(filterCasino, filterHotel, filterSearch) {
  var tbody = document.querySelector('.hc-table tbody');
  if (!tbody) return;

  var config = getAllHC();

  // 填充筛选下拉 (体系)
  var casSel = document.getElementById('hc-filter-casino');
  if (casSel) {
    var curCas = casSel.value;
    casSel.innerHTML = '<option value="">全部體系</option>';
    var seenCas = {};
    for (var k = 0; k < config.length; k++) {
      if (!seenCas[config[k].casino]) {
        seenCas[config[k].casino] = true;
        var co = document.createElement('option');
        co.value = config[k].casino;
        co.textContent = config[k].casino;
        if (config[k].casino === curCas) co.selected = true;
        casSel.appendChild(co);
      }
    }
  }

  // 填充筛选下拉 (酒店)
  var hotSel = document.getElementById('hc-filter-hotel');
  if (hotSel) {
    var curHot = hotSel.value;
    hotSel.innerHTML = '<option value="">全部酒店</option>';
    var seenHot = {};
    var casFil = casSel ? casSel.value : '';
    for (var m = 0; m < config.length; m++) {
      if ((!casFil || config[m].casino === casFil) && !seenHot[config[m].hotel]) {
        seenHot[config[m].hotel] = true;
        var ho = document.createElement('option');
        ho.value = config[m].hotel;
        ho.textContent = config[m].hotel;
        if (config[m].hotel === curHot) ho.selected = true;
        hotSel.appendChild(ho);
      }
    }
  }

  // 读取当前筛选条件
  var fCasino = filterCasino != null ? filterCasino : (casSel ? casSel.value : '');
  var fHotel  = filterHotel  != null ? filterHotel  : (hotSel ? hotSel.value : '');
  var fSearch = filterSearch != null ? filterSearch : (document.getElementById('hc-filter-search') || {}).value || '';
  var fSearchLower = fSearch.toLowerCase();

  // 筛选
  var filtered = config.filter(function(c) {
    if (fCasino && c.casino !== fCasino) return false;
    if (fHotel  && c.hotel  !== fHotel)  return false;
    if (fSearchLower) {
      var hay = (c.casino + c.hotel + c.code + c.room).toLowerCase();
      if (hay.indexOf(fSearchLower) < 0) return false;
    }
    return true;
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    var emptyTr = document.createElement('tr');
    var emptyTd = document.createElement('td');
    emptyTd.colSpan = 10;
    emptyTd.style.cssText = 'text-align:center;padding:24px;color:' + UI_COLORS.textMuted;
    emptyTd.textContent = '暫無資料';
    emptyTr.appendChild(emptyTd);
    tbody.appendChild(emptyTr);
    hcUpdateBatchBar();
    return;
  }

  // 收集當前可見行的 fbKey 列表 (用於 Shift 範圍選取)
  var visibleKeys = [];
  for (var i = 0; i < filtered.length; i++) {
    visibleKeys.push(filtered[i]._fbKey);
  }

  for (var i = 0; i < filtered.length; i++) {
    (function(entry, rowIndex) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-hc-key', entry._fbKey);

      // 高亮已選行
      if (_hcSelected[entry._fbKey]) {
        tr.style.background = '#fff8e1';
      }

      // checkbox 列
      var tdChk = document.createElement('td');
      tdChk.style.cssText = 'text-align:center;padding:4px';
      var chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = !!_hcSelected[entry._fbKey];
      chk.setAttribute('data-hc-key', entry._fbKey);
      chk.onclick = function(e) {
        e.stopPropagation();
        hcToggleRow(entry._fbKey, chk.checked, e);
      };
      tdChk.appendChild(chk);
      tr.appendChild(tdChk);

      var cells = [
        entry.casino, entry.hotel, entry.code, entry.room,
        '¥' + entry.weekday, '¥' + entry.weekend, '¥' + entry.special,
        entry.threshold + '萬'
      ];
      for (var j = 0; j < cells.length; j++) {
        var td = document.createElement('td');
        td.textContent = cells[j] != null ? String(cells[j]) : '';
        tr.appendChild(td);
      }
      // 操作列
      var tdOp = document.createElement('td');
      var editBtn = document.createElement('button');
      editBtn.textContent = '編輯';
      editBtn.style.cssText = 'background:' + UI_COLORS.goldSoft + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;margin-right:4px';
      editBtn.onclick = function() { hcOpenModal(entry._fbKey); };

      var delBtn = document.createElement('button');
      delBtn.textContent = '刪';
      delBtn.style.cssText = 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px';
      delBtn.onclick = (function(ent) {
        return function() {
          showConfirm('確定刪除「' + ent.room + '」？', function() {
            var deleted = deleteHC(ent._fbKey);
            if (deleted) {
              delete _hcSelected[ent._fbKey];
              showToast('已刪除', 'success');
              hcRender();
            } else {
              showToast('刪除失敗', 'error');
            }
          });
        };
      })(entry);

      tdOp.appendChild(editBtn);
      tdOp.appendChild(delBtn);
      tr.appendChild(tdOp);
      tbody.appendChild(tr);
    })(filtered[i], i);
  }

  // 更新全選 checkbox 狀態
  hcUpdateSelectAllState(visibleKeys);
  hcUpdateBatchBar();
}

/** 更新全選 checkbox 的三態 (全選/半選/未選) */
function hcUpdateSelectAllState(visibleKeys) {
  var sa = document.getElementById('hc-select-all');
  if (!sa) return;
  if (!visibleKeys) {
    // 從 DOM 收集
    var rows = document.querySelectorAll('.hc-table tbody tr[data-hc-key]');
    visibleKeys = [];
    for (var r = 0; r < rows.length; r++) {
      visibleKeys.push(rows[r].getAttribute('data-hc-key'));
    }
  }
  var selCount = 0;
  for (var i = 0; i < visibleKeys.length; i++) {
    if (_hcSelected[visibleKeys[i]]) selCount++;
  }
  if (selCount === 0) {
    sa.checked = false;
    sa.indeterminate = false;
  } else if (selCount === visibleKeys.length && visibleKeys.length > 0) {
    sa.checked = true;
    sa.indeterminate = false;
  } else {
    sa.checked = false;
    sa.indeterminate = true;
  }
}

/** 更新批量操作欄顯示狀態 */
function hcUpdateBatchBar() {
  var bar = document.getElementById('hc-batch-bar');
  var countEl = document.getElementById('hc-batch-count');
  if (!bar) return;
  var count = Object.keys(_hcSelected).length;
  if (count > 0) {
    bar.style.display = 'flex';
    if (countEl) countEl.textContent = '已選 ' + count + ' 項';
  } else {
    bar.style.display = 'none';
  }
}

/** 全選 / 取消全選 */
function hcToggleSelectAll(checked) {
  var rows = document.querySelectorAll('.hc-table tbody tr[data-hc-key]');
  if (checked) {
    for (var i = 0; i < rows.length; i++) {
      var key = rows[i].getAttribute('data-hc-key');
      _hcSelected[key] = true;
    }
  } else {
    _hcSelected = {};
  }
  // 刷新列表 (保留篩選狀態)
  hcRender();
}

/** 切換單行選取 (支援 Shift 範圍選取) */
function hcToggleRow(fbKey, checked, event) {
  if (event && event.shiftKey && _hcLastClicked) {
    // Shift 範圍選取：選取 _hcLastClicked 到 fbKey 之間的所有行
    var rows = document.querySelectorAll('.hc-table tbody tr[data-hc-key]');
    var keys = [];
    for (var i = 0; i < rows.length; i++) {
      keys.push(rows[i].getAttribute('data-hc-key'));
    }
    var idxA = keys.indexOf(_hcLastClicked);
    var idxB = keys.indexOf(fbKey);
    if (idxA >= 0 && idxB >= 0) {
      var from = Math.min(idxA, idxB);
      var to   = Math.max(idxA, idxB);
      for (var j = from; j <= to; j++) {
        _hcSelected[keys[j]] = checked;
      }
    }
  } else {
    _hcSelected[fbKey] = checked;
    if (!checked) delete _hcSelected[fbKey];
  }
  _hcLastClicked = fbKey;
  // 刷新列表 (保留篩選狀態)
  hcRender();
}

/** 清除所有選取 */
function hcClearSelection() {
  _hcSelected = {};
  _hcLastClicked = null;
  var sa = document.getElementById('hc-select-all');
  if (sa) { sa.checked = false; sa.indeterminate = false; }
  hcRender();
}

/** 批量刪除所選項目 */
function hcBatchDelete() {
  var keys = Object.keys(_hcSelected);
  if (keys.length === 0) {
    showToast('請先選取要刪除的項目', 'warning');
    return;
  }
  showConfirm('確定要批量刪除 ' + keys.length + ' 筆酒店設定？此操作無法復原！', function() {
    var deleted = 0;
    for (var i = 0; i < keys.length; i++) {
      var result = deleteHC(keys[i]);
      if (result) deleted++;
    }
    _hcSelected = {};
    _hcLastClicked = null;
    showToast('已刪除 ' + deleted + ' 筆', deleted > 0 ? 'success' : 'error');
    hcRender();
  }, { okColor: '#b71c1c' });
}

/**
 * 酒店设定筛选 (HTML onchange/oninput 调用)
 * 筛选变更时自动清除选取 (避免跨筛选混淆)
 */
function hcFilter() {
  _hcSelected = {};
  _hcLastClicked = null;
  hcRender();
}

// ============================================================================
// 登入桥接
// ============================================================================

/**
 * 登入按钮回调 — 读取密码调用 checkPassword，显示错误/剩余次数
 */
function _v13LoginFallback() {
  var inputEl = document.getElementById('pw-input');
  var errorEl = document.getElementById('pw-error');
  var attemptsEl = document.getElementById('pw-attempts');
  var pw = inputEl ? inputEl.value : '';

  if (!pw) {
    if (errorEl) errorEl.textContent = '請輸入密碼';
    if (attemptsEl) attemptsEl.textContent = '';
    return;
  }

  var result = (typeof checkPassword === 'function') ? checkPassword(pw) : { success: false, error: '認證模組未載入' };

  if (result.success) {
    if (errorEl) errorEl.textContent = '';
    if (attemptsEl) attemptsEl.textContent = '';
  } else {
    if (errorEl) errorEl.textContent = result.error || '驗證失敗';
    // 自动从 _pwAttempts(若可访问) 或直接隐藏
    if (attemptsEl) {
      var maxAttempts = (typeof CONFIG !== 'undefined' && CONFIG.MAX_PW_ATTEMPTS) ? CONFIG.MAX_PW_ATTEMPTS : 3;
      attemptsEl.textContent = '剩餘 ' + maxAttempts + ' 次機會';
    }
  }
}

// ============================================================================
// 管理员：清除所有数据（Firebase + 本地）
// ============================================================================

/**
 * 清除全部数据 (Firebase + 本地 localStorage + State)
 * 二次确认保护，防止误操作
 */
function clearAllDataConfirm() {
  if (!confirm('⚠️ 警告：此操作將清除 Firebase 及本機所有業務數據（交易、公基金、代理錢包、訂房）！\n\n此操作不可逆，建議先備份！\n\n確定要繼續嗎？')) {
    return;
  }
  if (!confirm('再次確認：您確定要清除全部數據嗎？\n\n清除後所有記錄將消失，無法恢復！')) {
    return;
  }

  showToast('正在清除數據...', 'info');

  // 1. 先清除本地
  try {
    Store.clearLocalData();
  } catch(e) {
    console.error('[v13:bridge] clearAllData: Store.clearLocalData error:', e);
  }

  // 2. 再清除 Firebase
  if (typeof clearFirebaseData === 'function') {
    clearFirebaseData(function(err) {
      if (err) {
        showToast('本機數據已清除，Firebase 清除失敗：' + (err.message || err), 'error');
        console.error('[v13:bridge] clearFirebaseData error:', err);
      } else {
        showToast('全部數據已清除！', 'success');
        // 刷新所有页面
        try { renderAll(); } catch(e2) {}
      }
    });
  } else {
    showToast('本機數據已清除（Firebase 清除函數未加載）', 'warning');
    try { renderAll(); } catch(e2) {}
  }
}

// 监听 HC 更新事件，自动刷新列表
Events.on(EVENTS.HC_CONFIG_UPDATED, function() {
  var panel = document.getElementById('room-tab-config');
  if (panel && (panel.style.display !== 'none' && panel.classList.contains('active'))) {
    hcRender();
  }
  // 同时刷新订房表单中的体系下拉
  if (typeof RM !== 'undefined' && RM.populateCasinoDropdown) {
    RM.populateCasinoDropdown();
  }
});
