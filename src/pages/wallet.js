/**
 * v13 总钱包页面 (v3 — 快捷按钮时间筛选器)
 *
 * 依赖: State, Events, calc/finance.js, utils/format.js
 *
 * 页面内容:
 * 1. KPI 总览卡片 (总钱包余额、公基金余额、代理钱包总额、总存入、总提领)
 * 2. 快捷时间筛选器 (本週/上週/本月/上月/年度/自訂 — 与查询页一致)
 * 3. 总钱包流水 (合并: 公基金记录 + 代理钱包记录 + 交易佣金产生的码粮/公基金)
 * 4. 公基金卡片 (卡片式, 含汇总 + 流水明细)
 * 5. 代理钱包卡片 (同原设计)
 *
 * 筛选逻辑: 取代旧的月份下拉，改用日期范围 (dateFrom/dateTo)
 *   - 快捷按钮设定 dateFrom/dateTo，存入 State
 *   - 各渲染函数从 State 读取范围进行筛选
 *   - 「全部時間」时 dateFrom='' && dateTo='' → 不过滤
 */

// ============================================================================
// 快捷时间筛选器 (与查询页一致)
// ============================================================================

/** 快捷按钮点击处理 */
function walletQuickFilter(type) {
  _highlightWalletQuickBtn(type);

  var now = new Date();
  var dateFrom = '';
  var dateTo = '';
  var customRange = document.getElementById('wallet-date-range');
  if (customRange) customRange.style.display = 'none';

  var pad2 = function(n) { return n < 10 ? '0' + n : '' + n; };
  var ymd = function(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  };

  switch (type) {
    case 'lastWeek': {
      // 上周一 ~ 上周日
      var dow = now.getDay() || 7;
      var lastMon = new Date(now);
      lastMon.setDate(now.getDate() - dow - 6);
      var lastSun = new Date(lastMon);
      lastSun.setDate(lastMon.getDate() + 6);
      dateFrom = ymd(lastMon);
      dateTo = ymd(lastSun);
      break;
    }
    case 'thisWeek': {
      // 本周一 ~ 今天
      var dow2 = now.getDay() || 7;
      var thisMon = new Date(now);
      thisMon.setDate(now.getDate() - dow2 + 1);
      dateFrom = ymd(thisMon);
      dateTo = ymd(now);
      break;
    }
    case 'thisMonth': {
      // 本月1日 ~ 今天
      dateFrom = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-01';
      dateTo = ymd(now);
      break;
    }
    case 'lastMonth': {
      // 上月1日 ~ 上月最后一天
      var firstDayLM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      var lastDayLM = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFrom = ymd(firstDayLM);
      dateTo = ymd(lastDayLM);
      break;
    }
    case 'thisYear': {
      // 今年1/1 ~ 今天
      dateFrom = now.getFullYear() + '-01-01';
      dateTo = ymd(now);
      break;
    }
    case 'custom': {
      if (customRange) customRange.style.display = '';
      var fromEl = document.getElementById('wallet-date-from');
      var toEl = document.getElementById('wallet-date-to');
      // 保留上次的值，或默认今天
      if (fromEl && !fromEl.value) fromEl.value = ymd(now);
      if (toEl && !toEl.value) toEl.value = ymd(now);
      // custom 模式：不在这里设定范围，等用户选日期后 onchange 触发 renderWallet
      _updateWalletDateDisplay();
      renderWallet();
      return;
    }
    default: {
      // 全部時間
      break;
    }
  }

  // 设定日期输入框的值（非 custom 模式）
  var fromEl2 = document.getElementById('wallet-date-from');
  var toEl2 = document.getElementById('wallet-date-to');
  if (fromEl2 && dateFrom) fromEl2.value = dateFrom;
  if (toEl2 && dateTo) toEl2.value = dateTo;

  _updateWalletDateDisplay();
  renderWallet();
}

/** 高亮当前活跃的快捷按钮 */
function _highlightWalletQuickBtn(type) {
  var btns = document.querySelectorAll('#page-wallet .tf-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  if (!type || type === 'all') return;
  var label = _walletQuickBtnLabel(type);
  for (var j = 0; j < btns.length; j++) {
    if (btns[j].textContent.trim() === label) {
      btns[j].classList.add('active');
    }
  }
}

/** 快捷按钮 type → 显示文字 */
function _walletQuickBtnLabel(type) {
  var map = {
    lastWeek: '上週', thisWeek: '本週', thisMonth: '本月',
    lastMonth: '上月', thisYear: '年度', custom: '自訂'
  };
  return map[type] || '';
}

/** 更新页面上的日期范围显示文字 */
function _updateWalletDateDisplay() {
  var disp = document.getElementById('wallet-date-display');
  if (!disp) return;
  var fromEl = document.getElementById('wallet-date-from');
  var toEl = document.getElementById('wallet-date-to');
  var from = fromEl ? fromEl.value : '';
  var to = toEl ? toEl.value : '';
  if (from && to) {
    disp.textContent = '📅 ' + from + ' ～ ' + to;
  } else if (from) {
    disp.textContent = '📅 ' + from + ' 起';
  } else if (to) {
    disp.textContent = '📅 至 ' + to;
  } else {
    disp.textContent = '📅 全部時間';
  }
}

/** 从输入框读取当前筛选范围 {dateFrom, dateTo} (空字符串=不限制) */
function _getWalletDateRange() {
  var fromEl = document.getElementById('wallet-date-from');
  var toEl = document.getElementById('wallet-date-to');
  return {
    dateFrom: (fromEl && fromEl.value) ? fromEl.value : '',
    dateTo: (toEl && toEl.value) ? toEl.value : '',
  };
}

/** 判断一条记录的日期是否在当前筛选范围内 */
function _walletDateInRange(dateStr, dateFrom, dateTo) {
  if (!dateStr) return false;
  // 归一化日期格式为 YYYY-MM-DD
  var ds = (dateStr || '').replace(/\//g, '-');
  if (dateFrom && ds < dateFrom) return false;
  if (dateTo && ds > dateTo) return false;
  return true;
}

// ============================================================================
// 渲染入口
// ============================================================================

/**
 * 渲染总钱包页面
 */
function renderWallet() {
  try {
    _updateWalletDateDisplay();
    _renderWalletKPIs();
    _renderFlowTable();
    _renderFundCard();
    _renderAgentWalletCards();
  } catch (e) {
    console.error('[v13:wallet] renderWallet error:', e);
  }
}

// ============================================================================
// KPI 统计卡片
// ============================================================================

function _renderWalletKPIs() {
  var container = document.getElementById('wallet-overview');
  if (!container) return;

  var txs = State.get('txs');
  var fundRecords = State.get('fundWithdrawals');
  var agentWallets = State.get('agentWallets');
  var range = _getWalletDateRange();

  // 筛选（KPI 按日期范围筛选）
  var filteredTxs = _filterByDateRange(txs, 'date', range);
  var filteredFunds = _filterByDateRange(fundRecords, 'date', range);
  var filteredAWs = {};
  for (var ag in agentWallets) {
    var recs = agentWallets[ag];
    var filt = _filterByDateRange(recs, 'date', range);
    if (filt.length > 0) filteredAWs[ag] = filt;
  }

  // 公基金余额 (全量、不受筛选影响 — KPI 应该是全量)
  var fundBalance = calcFundBalance(txs, fundRecords);

  // 代理钱包总额 (全量)
  var agents = {};
  for (var a1 = 0; a1 < txs.length; a1++) {
    var a = txs[a1].agent;
    if (a) agents[a] = true;
  }
  for (var ag2 in agentWallets) {
    agents[ag2] = true;
  }
  var agentTotal = 0;
  for (var name in agents) {
    agentTotal += calcAgentBalance(name, txs, agentWallets);
  }

  // 总钱包余额
  var totalWallet = getTotalWallet();

  // 总存入 (筛选范围内)
  var totalDeposit = 0;
  for (var d1 = 0; d1 < filteredFunds.length; d1++) {
    var fr = filteredFunds[d1];
    if (fr.type === 'deposit' || fr.type === 'cash_deposit') {
      totalDeposit += toNum(fr.amount);
    }
  }
  for (var ag3 in filteredAWs) {
    var recs3 = filteredAWs[ag3];
    for (var d2 = 0; d2 < recs3.length; d2++) {
      if (recs3[d2].type === 'deposit' || recs3[d2].type === 'cash_deposit') {
        totalDeposit += toNum(recs3[d2].amount);
      }
    }
  }
  // 存入也包括: 交易产生的佣金公基金 + 码粮 (视为流入)
  for (var d3 = 0; d3 < filteredTxs.length; d3++) {
    totalDeposit += toNum(filteredTxs[d3].fund);
    totalDeposit += toNum(filteredTxs[d3].bonus);
  }

  // 总提领 (筛选范围内)
  var totalWithdraw = 0;
  for (var w1 = 0; w1 < filteredFunds.length; w1++) {
    if (filteredFunds[w1].type === 'withdraw') {
      totalWithdraw += toNum(filteredFunds[w1].amount);
    }
  }
  for (var ag4 in filteredAWs) {
    var recs4 = filteredAWs[ag4];
    for (var w2 = 0; w2 < recs4.length; w2++) {
      if (recs4[w2].type === 'withdraw') {
        totalWithdraw += toNum(recs4[w2].amount);
      }
    }
  }

  var cards = [
    { label: '總錢包餘額', value: fmtMoney(totalWallet), cls: 'wk-gold' },
    { label: '公基金餘額',  value: fmtMoney(fundBalance), cls: 'wk-positive' },
    { label: '代理錢包總額', value: fmtMoney(agentTotal), cls: 'wk-positive' },
    { label: '總存入',      value: fmtMoney(totalDeposit), cls: 'wk-positive' },
    { label: '總提領',      value: fmtMoney(totalWithdraw), cls: 'wk-negative' },
  ];

  var html = '';
  for (var c = 0; c < cards.length; c++) {
    html += '<div class="wallet-kpi-card">' +
      '<div class="wk-label">' + cards[c].label + '</div>' +
      '<div class="wk-value ' + cards[c].cls + '">' + cards[c].value + '</div>' +
      '</div>';
  }
  container.innerHTML = html;
}

// ============================================================================
// 工具函式
// ============================================================================

/** 按日期范围筛选数组 (arr[field] 支持 YYYY/MM/DD 和 YYYY-MM-DD) */
function _filterByDateRange(arr, dateField, range) {
  if (!range.dateFrom && !range.dateTo) return arr;
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (_walletDateInRange(arr[i][dateField], range.dateFrom, range.dateTo)) {
      result.push(arr[i]);
    }
  }
  return result;
}

// ============================================================================
// 总钱包流水 (合并所有金流来源)
// ============================================================================

function _renderFlowTable() {
  var tbody = document.querySelector('#wallet-flow-table tbody');
  var empty = document.getElementById('wallet-flow-empty');
  if (!tbody) return;

  var txs = State.get('txs');
  var fundRecords = State.get('fundWithdrawals');
  var agentWallets = State.get('agentWallets');
  var range = _getWalletDateRange();

  // 构建统一流水条目
  var flows = [];

  // 1) 公基金记录
  var filteredFunds = _filterByDateRange(fundRecords, 'date', range);
  for (var i = 0; i < filteredFunds.length; i++) {
    var fr = filteredFunds[i];
    var typeLabel = (fr.type === 'deposit' || fr.type === 'cash_deposit') ? '存入' : '提領';
    if (fr.type === 'cash_deposit') typeLabel = '現金存入';
    flows.push({
      date: fr.date || '',
      source: '公基金',
      type: typeLabel,
      amount: toNum(fr.amount),
      sign: (fr.type === 'withdraw') ? -1 : 1,
      note: fr.note || '',
    });
  }

  // 2) 交易佣金产生的码粮和公基金
  var filteredTxs = _filterByDateRange(txs, 'date', range);
  for (var j = 0; j < filteredTxs.length; j++) {
    var tx = filteredTxs[j];
    var fundVal = toNum(tx.fund);
    var bonusVal = toNum(tx.bonus);
    var volNote = '洗碼' + fmtDec(tx.volume, 1) + '萬';

    if (fundVal > 0) {
      flows.push({
        date: tx.date || '',
        source: '公基金',
        type: '佣金公基金',
        amount: fundVal,
        sign: 1,
        note: (tx.agent || '') + ' ' + volNote,
      });
    }
    if (bonusVal > 0) {
      flows.push({
        date: tx.date || '',
        source: tx.agent || '',
        type: '碼糧',
        amount: bonusVal,
        sign: 1,
        note: volNote,
      });
    }
  }

  // 3) 代理钱包记录
  for (var ag in agentWallets) {
    var recs = agentWallets[ag];
    for (var k = 0; k < recs.length; k++) {
      var wr = recs[k];
      if (!_walletDateInRange(wr.date, range.dateFrom, range.dateTo)) continue;
      var wl = '';
      if (wr.type === 'deposit') wl = '存入';
      else if (wr.type === 'cash_deposit') wl = '自存現金';
      else if (wr.type === 'withdraw') wl = '提領';
      flows.push({
        date: wr.date || '',
        source: ag,
        type: wl,
        amount: toNum(wr.amount),
        sign: (wr.type === 'withdraw') ? -1 : 1,
        note: wr.note || '',
      });
    }
  }

  if (flows.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  // 按日期降序排列
  flows.sort(function(a, b) {
    return (b.date || '').replace(/\//g, '-').localeCompare((a.date || '').replace(/\//g, '-'));
  });

  var html = '';
  for (var f = 0; f < flows.length; f++) {
    var flow = flows[f];
    var isOut = flow.sign < 0;
    var tc = isOut ? 'wf-withdraw' : 'wf-deposit';
    var rowClass = isOut ? 'row-withdraw' : 'row-deposit';
    var prefix = isOut ? '↓ -' : '↑ +';
    html += '<tr class="' + rowClass + '">' +
      '<td>' + flow.date + '</td>' +
      '<td class="wf-source">' + flow.source + '</td>' +
      '<td class="' + tc + '">' + flow.type + '</td>' +
      '<td class="' + tc + ' num-mono" style="text-align:right">' + prefix + fmtMoney(flow.amount) + '</td>' +
      '<td>' + flow.note + '</td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

// ============================================================================
// 公基金卡片
// ============================================================================

function _renderFundCard() {
  var container = document.getElementById('wallet-fund-card');
  if (!container) return;

  var txs = State.get('txs');
  var fundRecords = State.get('fundWithdrawals');
  var range = _getWalletDateRange();

  // 筛选
  var filteredFunds = _filterByDateRange(fundRecords, 'date', range);
  var filteredTxs = _filterByDateRange(txs, 'date', range);

  // 公基金余额 (全量)
  var balance = calcFundBalance(txs, fundRecords);

  // 汇总统计
  var commFundSum = 0;     // 佣金产生的公基金
  var depositSum = 0;      // 手动存入
  var cashDepSum = 0;      // 自存现金
  var withdrawSum = 0;     // 提领
  for (var k = 0; k < filteredTxs.length; k++) {
    commFundSum += toNum(filteredTxs[k].fund);
  }
  for (var m = 0; m < filteredFunds.length; m++) {
    var fr = filteredFunds[m];
    if (fr.type === 'deposit') depositSum += toNum(fr.amount);
    else if (fr.type === 'cash_deposit') cashDepSum += toNum(fr.amount);
    else if (fr.type === 'withdraw') withdrawSum += toNum(fr.amount);
  }

  // 构建明细列表 (合并佣金公基金 + 手动记录)
  var details = [];

  // 佣金公基金 (从交易中)
  for (var d1 = 0; d1 < filteredTxs.length; d1++) {
    var tx = filteredTxs[d1];
    var fv = toNum(tx.fund);
    if (fv > 0) {
      details.push({
        date: tx.date || '',
        type: '佣金公基金',
        amount: fv,
        sign: 1,
        note: (tx.agent || '') + ' 洗碼' + fmtDec(tx.volume, 1) + '萬',
      });
    }
  }

  // 手动记录
  for (var d2 = 0; d2 < filteredFunds.length; d2++) {
    var fr2 = filteredFunds[d2];
    var tl = '';
    if (fr2.type === 'deposit') tl = '存入';
    else if (fr2.type === 'cash_deposit') tl = '現金存入';
    else if (fr2.type === 'withdraw') tl = '提領';
    details.push({
      date: fr2.date || '',
      type: tl,
      amount: toNum(fr2.amount),
      sign: (fr2.type === 'withdraw') ? -1 : 1,
      note: fr2.note || '',
    });
  }

  // 按日期降序
  details.sort(function(a, b) {
    return (b.date || '').replace(/\//g, '-').localeCompare((a.date || '').replace(/\//g, '-'));
  });

  // 渲染卡片 — 独立金边主题，与代理钱包卡片视觉区分
  var html = '<div class="wallet-fund-card">' +
    '<div class="wallet-fund-card-header">' +
      '<span class="wfc-name">🏦 公基金</span>' +
      '<span class="wfc-balance">' + fmtMoney(balance) + '</span>' +
    '</div>' +
    '<div class="wallet-fund-card-body">' +
      '<table>' +
        '<thead><tr><th>佣金公基金</th><th>存入</th><th>自存現金</th><th>提領</th></tr></thead>' +
        '<tbody><tr>' +
          '<td style="color:var(--success)">' + fmtMoney(commFundSum) + '</td>' +
          '<td style="color:var(--success)">' + fmtMoney(depositSum) + '</td>' +
          '<td style="color:var(--info)">' + fmtMoney(cashDepSum) + '</td>' +
          '<td style="color:var(--danger)">' + fmtMoney(withdrawSum) + '</td>' +
        '</tr></tbody>' +
      '</table>' +
    '</div>';

  // 明细 — 统一使用 .wallet-card-detail 样式
  if (details.length > 0) {
    html += '<div class="wallet-card-detail">' +
      '<table>' +
      '<thead><tr><th style="width:90px">日期</th><th>類型</th><th style="text-align:right">金額</th><th>備註</th></tr></thead>' +
      '<tbody>';

    for (var d3 = 0; d3 < details.length; d3++) {
      var dt = details[d3];
      var isOut = dt.sign < 0;
      var tc = isOut ? 'var(--danger)' : 'var(--success)';
      var prefix = isOut ? '-' : '+';
      html += '<tr>' +
        '<td>' + dt.date + '</td>' +
        '<td style="color:' + tc + '">' + dt.type + '</td>' +
        '<td style="text-align:right;color:' + tc + '">' + prefix + fmtMoney(dt.amount) + '</td>' +
        '<td>' + dt.note + '</td>' +
        '</tr>';
    }

    html += '</tbody></table></div>';
  }

  html += '</div>';  // 关闭 .wallet-fund-card

  container.innerHTML = html;
}

// ============================================================================
// 代理钱包明细卡片
// ============================================================================

function _renderAgentWalletCards() {
  var container = document.getElementById('wallet-agent-cards');
  var empty = document.getElementById('wallet-agent-empty');
  if (!container) return;

  var txs = State.get('txs');
  var agentWallets = State.get('agentWallets');

  // 收集所有代理
  var agents = {};
  for (var i = 0; i < txs.length; i++) {
    var a = txs[i].agent;
    if (a) agents[a] = true;
  }
  for (var ag in agentWallets) {
    agents[ag] = true;
  }

  var agentList = Object.keys(agents).sort();
  if (agentList.length === 0) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  var html = '<div class="wallet-agent-grid">';

  for (var m = 0; m < agentList.length; m++) {
    var agentName = agentList[m];
    var balance = calcAgentBalance(agentName, txs, agentWallets);

    // 从交易中计算该代理的码粮和现金寄放
    var bonusSum = 0;
    var cashSum = 0;
    for (var n = 0; n < txs.length; n++) {
      if (txs[n].agent === agentName) {
        bonusSum += toNum(txs[n].bonus);
        cashSum += toNum(txs[n].cash) || 0;
      }
    }

    // 从钱包记录中计算各项
    var records = agentWallets[agentName] || [];
    var awDeposit = 0;
    var awCashDep = 0;
    var awWithdraw = 0;
    for (var k = 0; k < records.length; k++) {
      if (records[k].type === 'deposit') awDeposit += toNum(records[k].amount);
      else if (records[k].type === 'cash_deposit') awCashDep += toNum(records[k].amount);
      else if (records[k].type === 'withdraw') awWithdraw += toNum(records[k].amount);
    }

    html += '<div class="wallet-agent-card">' +
      '<div class="wallet-agent-card-header">' +
        '<span class="wa-name">' + agentName + '</span>' +
        '<span class="wa-balance">' + fmtMoney(balance) + '</span>' +
      '</div>' +
      '<div class="wallet-agent-card-body">' +
        '<table>' +
          '<thead><tr><th>碼糧累計</th><th>現金寄放</th><th>存入</th><th>自存現金</th><th>提領</th></tr></thead>' +
          '<tbody><tr>' +
            '<td>' + fmtMoney(bonusSum) + '</td>' +
            '<td>' + fmtMoney(cashSum) + '</td>' +
            '<td style="color:var(--success)">' + fmtMoney(awDeposit) + '</td>' +
            '<td style="color:var(--info)">' + fmtMoney(awCashDep) + '</td>' +
            '<td style="color:var(--danger)">' + fmtMoney(awWithdraw) + '</td>' +
          '</tr></tbody>' +
        '</table>' +
      '</div>';

    // 钱包流水明细 — 统一使用 .wallet-card-detail 样式
    if (records.length > 0) {
      var sorted = records.slice().sort(function(a, b) {
        return (b.date || '').replace(/\//g, '-').localeCompare((a.date || '').replace(/\//g, '-'));
      });
      var typeLabel2 = { deposit: '存入', cash_deposit: '自存現金', withdraw: '提領' };
      html += '<div class="wallet-card-detail">' +
        '<table>' +
        '<thead><tr><th style="width:90px">日期</th><th>類型</th><th style="text-align:right">金額</th><th>備註</th></tr></thead>' +
        '<tbody>';
      for (var p = 0; p < sorted.length; p++) {
        var wr = sorted[p];
        var tc = (wr.type === 'deposit' || wr.type === 'cash_deposit') ? 'var(--success)' : 'var(--danger)';
        var prefix = (wr.type === 'deposit' || wr.type === 'cash_deposit') ? '+' : '-';
        html += '<tr>' +
          '<td>' + (wr.date || '') + '</td>' +
          '<td style="color:' + tc + '">' + (typeLabel2[wr.type] || wr.type) + '</td>' +
          '<td style="text-align:right;color:' + tc + '">' + prefix + fmtMoney(toNum(wr.amount)) + '</td>' +
          '<td>' + (wr.note || '') + '</td>' +
        '</tr>';
      }
      html += '</tbody></table></div>';
    }

    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}
