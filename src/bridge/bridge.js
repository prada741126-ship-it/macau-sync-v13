/**
 * v13 桥接层 — HTML onclick → JS 函数
 * 
 * HTML 模板中所有 onclick 调用必须在此处有对应全局函数。
 * 这是模板（markup）与数据/逻辑（JS 模块）之间的唯一桥梁。
 * 
 * 依赖: 所有 data/ 和 ui/ 模块已加载
 */

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
}

/** 填充交易表单地点下拉 */
function _populateTxVenueDropdown() {
  var sel = document.getElementById('tx-venue');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇地點</option>';
  var venues = (typeof VENUE_OPTIONS !== 'undefined') ? VENUE_OPTIONS : ['新濠天地', '新濠影滙', '金沙', '銀河', '永利', '上葡京'];
  for (var i = 0; i < venues.length; i++) {
    var opt = document.createElement('option');
    opt.value = venues[i];
    opt.textContent = venues[i];
    sel.appendChild(opt);
  }
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
  var vol = toNum((document.getElementById('tx-volume') || {}).value);
  var rate = toNum((document.getElementById('tx-rate') || {}).value);
  var bonus = toNum((document.getElementById('tx-bonus') || {}).value);
  var drawn = toNum((document.getElementById('tx-drawn') || {}).value);

  var comm = calcComm(vol, rate);
  var fund = calcFund(comm, bonus);
  var undrawn = calcUndrawn(bonus, drawn);

  var commEl = document.getElementById('tx-comm');
  if (commEl) commEl.value = fmt(comm);

  var fundEl = document.getElementById('tx-fund');
  if (fundEl) fundEl.value = fmt(fund);

  var undrawnEl = document.getElementById('tx-undrawn');
  if (undrawnEl) undrawnEl.value = fmt(undrawn);

  // 保存草稿
  saveDraft(getCurrentFormData());
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

// ============================================================================
// 代理钱包表单桥接
// ============================================================================

var _walletAgentName = null;

/** 打开代理钱包模态框 (供外部调用) */
function openWalletModal(agentName) {
  _walletAgentName = agentName;
  var title = document.getElementById('wallet-title');
  if (title) title.textContent = '代理錢包 - ' + (agentName || '');
  var dateEl = document.getElementById('wallet-date');
  if (dateEl) dateEl.value = nowStr();
  openModal('agent-wallet-modal');
}

function saveAgentWalletForm() {
  if (!_walletAgentName) {
    showToast('代理資訊缺失', 'error');
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

  var record = createWallet(_walletAgentName, data);
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
      delBtn.onclick = function() {
        if (confirm('確定刪除代理「' + agentName + '」？')) {
          var result = removeAgent(agentName);
          if (result.success) {
            showToast('代理已刪除', 'success');
            _renderAgentMgrList();
            _populateTxAgentDropdown();
            if (RM && RM.populateAgentDropdown) RM.populateAgentDropdown();
            if (RM && RM.populateAgentFilter) RM.populateAgentFilter();
          } else {
            showToast(result.error || '刪除失敗', 'error');
          }
        }
      };

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
