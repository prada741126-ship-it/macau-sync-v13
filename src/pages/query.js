/**
 * v13 查询页渲染
 * 依赖: core/state.js, calc/filters.js (filterTxs, sortTxs), utils/format.js, utils/dom.js ($)
 * 对照档: 第七节模块13 + v12 query.js
 */

/** 入口：弹出所有下拉并执行默认查询（本月） */
function renderQuery() {
  _populateQueryFilters();
  _setDefaultMonth();
  _highlightQuickBtn('thisMonth');
  doQuery();
}

/**
 * 从交易数据中自动检测所有出现的年份
 * @returns {number[]} 降序排列的年份列表
 */
function _detectYears() {
  var txs = State.get('txs');
  var years = {};
  var now = new Date();
  var currentYear = now.getFullYear();
  // 确保至少有当前年
  years[currentYear] = true;

  for (var i = 0; i < txs.length; i++) {
    var d = txs[i].date;
    if (d && d.length >= 4) {
      var y = parseInt(d.substring(0, 4));
      if (!isNaN(y) && y >= 2020) years[y] = true;
    }
  }

  var result = Object.keys(years).map(Number);
  result.sort(function(a, b) { return b - a; }); // 降序：最新在前
  return result;
}

/** 填充查詢頁下拉：代理、地點、月份（多年份） */
function _populateQueryFilters() {
  // ---- 代理 ----
  var agentSel = document.getElementById('query-agent');
  if (agentSel) {
    agentSel.innerHTML = '<option value="">全部代理</option><option value="__FUND__">🏦 公基金</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      var opt = document.createElement('option');
      opt.value = agents[i];
      opt.textContent = agents[i];
      agentSel.appendChild(opt);
    }
  }

  // ---- 地點（VENUE_OPTIONS 是对象数组 {label, casino}） ----
  var venueSel = document.getElementById('query-venue');
  if (venueSel) {
    venueSel.innerHTML = '<option value="">全部地點</option>';
    var venues = (typeof VENUE_OPTIONS !== 'undefined') ? VENUE_OPTIONS : [];
    for (var j = 0; j < venues.length; j++) {
      var v = venues[j];
      var opt = document.createElement('option');
      if (typeof v === 'object' && v !== null) {
        opt.value = v.label;
        opt.textContent = v.label;
      } else {
        opt.value = v;
        opt.textContent = v;
      }
      venueSel.appendChild(opt);
    }
  }

  // ---- 月份（动态检测年份） ----
  _refreshMonthDropdown();
}

/** 设定月份下拉默认值为当前月，默认填入日期范围为当月 */
function _setDefaultMonth() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var mStr = month < 10 ? '0' + month : '' + month;
  var monthValue = year + '-' + mStr;

  var monthSel = document.getElementById('query-month');
  if (monthSel) {
    // 尝试选中当前月份
    var found = false;
    var opts = monthSel.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === monthValue) {
        monthSel.selectedIndex = i;
        found = true;
        break;
      }
    }
    // 如果当前月份不在列表中（没有该年数据），默认不选
    if (!found) {
      monthSel.selectedIndex = 0;
    }
  }

  var daysInMonth = new Date(year, month, 0).getDate();
  var dateFrom = year + '-' + mStr + '-01';
  var dateTo = year + '-' + mStr + '-' + (daysInMonth < 10 ? '0' + daysInMonth : daysInMonth);

  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  if (fromEl) fromEl.value = dateFrom;
  if (toEl) toEl.value = dateTo;
}

function _highlightQuickBtn(type) {
  var btns = document.querySelectorAll('#page-query .tf-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  for (var j = 0; j < btns.length; j++) {
    if (btns[j].textContent.trim() === _quickBtnLabel(type)) {
      btns[j].classList.add('active');
    }
  }
}

function _quickBtnLabel(type) {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var map = {
    lastWeek: '上週', thisWeek: '本週', thisMonth: '本月',
    lastMonth: '上月', thisYear: '年度', custom: '自訂'
  };
  return map[type] || '';
}

/** 更新月份下拉的 option value 和选中状态（跨年支持）*/
function _refreshMonthDropdown() {
  var monthSel = document.getElementById('query-month');
  if (!monthSel) return;

  var currentValue = monthSel.value;  // 记住当前选择
  var years = _detectYears();

  monthSel.innerHTML = '<option value="">全部月份</option>';
  for (var yi = 0; yi < years.length; yi++) {
    var yr = years[yi];
    var groupOpt = document.createElement('option');
    groupOpt.value = '';
    groupOpt.textContent = '── ' + yr + ' 年 ──';
    groupOpt.disabled = true;
    groupOpt.style.cssText = 'color:var(--tech-cyan);font-weight:700;font-size:12px;';
    monthSel.appendChild(groupOpt);

    for (var m = 1; m <= 12; m++) {
      var mStr = m < 10 ? '0' + m : '' + m;
      var monOpt = document.createElement('option');
      monOpt.value = yr + '-' + mStr;
      monOpt.textContent = '  ' + m + '月';
      monthSel.appendChild(monOpt);
    }
  }

  // 恢复选择
  if (currentValue) {
    for (var i = 0; i < monthSel.options.length; i++) {
      if (monthSel.options[i].value === currentValue) {
        monthSel.selectedIndex = i;
        break;
      }
    }
  }
}

/** 执行查询 — 根据代理选择路由到不同渲染模式 */
function doQuery() {
  try {
    var agent = '';
    var agentEl = document.getElementById('query-agent');
    if (agentEl && agentEl.value) agent = agentEl.value;

    // === 公基金模式 ===
    if (agent === '__FUND__') {
      _renderFundLedger();
      return;
    }

    // === 普通 / 代理明细模式 ===
    var txs = State.get('txs');
    var criteria = {};

    // 代理
    if (agent) criteria.agent = agent;

    // 地点 (基金模式不适用)
    var venueEl = document.getElementById('query-venue');
    if (venueEl && venueEl.value) criteria.venue = venueEl.value;

    // 月份
    var monthEl = document.getElementById('query-month');
    if (monthEl && monthEl.value) criteria.month = monthEl.value;

    // 日期范围
    var fromEl = document.getElementById('query-date-from');
    var toEl = document.getElementById('query-date-to');
    if (fromEl && fromEl.value) criteria.dateFrom = fromEl.value;
    if (toEl && toEl.value) criteria.dateTo = toEl.value;

    // 关键词
    var searchEl = document.getElementById('query-search');
    if (searchEl && searchEl.value) criteria.keyword = searchEl.value;

    var filtered = filterTxs(txs, criteria);

    // 获取选定的月份（用于 pre-balance 和月份过滤）
    var queryMonth = criteria.month || '';
    if (!queryMonth && criteria.dateFrom) {
      queryMonth = criteria.dateFrom.substring(0, 7);
    }

    // === 代理明细模式 ===
    if (agent) {
      _renderAgentLedger(agent, filtered, queryMonth);
      return;
    }

    // === 普通模式（全部代理）===
    // KPI
    _renderQueryKPI(filtered);
    // 交易表格
    _renderQueryTable(filtered);
    // 代理帐务表（显示）
    _renderQueryAgentSummary(filtered);
    // 显示代理帐务汇总部
    var summarySection = document.getElementById('query-agent-summary-section');
    if (summarySection) summarySection.style.display = '';

  } catch(e) {
    console.error('[doQuery] error:', e);
    showToast('查詢失敗：' + (e.message || e), 'error');
  }
}

// ============================================================================
// 普通模式：KPI + 交易表格 + 代理汇总
// ============================================================================

function _renderQueryKPI(txs) {
  var el = $('#query-kpi');
  if (!el) return;

  var vol = totalVolume(txs);
  var comm = totalComm(txs);
  var undrawn = totalUndrawn(txs);
  var totalWallet = getTotalWallet();

  el.innerHTML = '';

  var items = [
    { label: TERMS.volume,  value: fmt(vol) + '萬', accent: 'cyan',   color: UI_COLORS.techCyan },
    { label: TERMS.comm,    value: fmtMoney(comm), accent: 'blue',    color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, value: fmtMoney(undrawn), accent: 'orange', color: UI_COLORS.warning },
    { label: '💰 總錢包',   value: fmtMoney(totalWallet), accent: 'gold',   color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div', { className: 'kpi-card' });
    card.style.borderLeft = '3px solid ' + items[i].color;
    card.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '" style="font-size:20px">' + items[i].value + '</div>';
    el.appendChild(card);
  }

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = '';
}

function _renderQueryTable(txs) {
  var thead = document.getElementById('query-thead');
  var tbody = document.getElementById('query-tbody');
  if (!tbody) return;

  // 恢复默认表头
  if (thead) {
    thead.innerHTML = '<tr><th>日期</th><th>代理</th><th>地點</th><th>洗碼量</th><th>碼糧</th><th>已提領</th><th>未提領</th><th>備註</th></tr>';
  }

  tbody.innerHTML = '';
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var tr = h('tr');
    var cells = [tx.date, tx.agent, tx.venue, fmt(tx.volume) + '萬', fmtMoney(tx.bonus), fmtMoney(tx.drawn), fmtMoney(tx.undrawn), tx.note || ''];
    for (var j = 0; j < cells.length; j++) {
      tr.appendChild(h('td', {}, cells[j]));
    }
    tbody.appendChild(tr);
  }
}

function _renderQueryAgentSummary(txs) {
  var agentTable = document.querySelector('#page-query .agent-summary-table tbody');
  if (!agentTable) return;

  var agg = aggregateByAgent(txs);
  agentTable.innerHTML = '';
  for (var i = 0; i < agg.length; i++) {
    var a = agg[i];
    var balance = getAgentBalance(a.agent);
    var tr = h('tr');
    var cells = [a.agent, fmt(a.volume) + '萬', fmtMoney(a.bonus), fmtMoney(a.drawn), fmtMoney(a.undrawn), fmtMoney(balance)];
    for (var j = 0; j < cells.length; j++) {
      tr.appendChild(h('td', {}, cells[j]));
    }
    agentTable.appendChild(tr);
  }
}

// ============================================================================
// 公基金明细模式 (agent === "__FUND__")
// ============================================================================

function _renderFundLedger() {
  var txs = State.get('txs');
  var fundWithdrawals = State.get('fundWithdrawals');

  // 获取筛选条件
  var monthEl = document.getElementById('query-month');
  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  var queryMonth = monthEl && monthEl.value ? monthEl.value : '';
  var dateFrom = fromEl && fromEl.value ? fromEl.value : '';
  var dateTo = toEl && toEl.value ? toEl.value : '';

  var skipMonthFilter = !queryMonth && !dateFrom && !dateTo;

  // 构建公基金流水：交易产生的入帐 + 手动存取记录
  var allLedger = [];
  var totalFundIncome = 0;

  // 1. 从交易中提取公基金入帐
  for (var i = 0; i < txs.length; i++) {
    var fv = txs[i].fund || 0;
    if (fv > 0) {
      totalFundIncome += fv;
      allLedger.push({
        date: txs[i].date,
        desc: (txs[i].agent || '') + ' ' + (txs[i].client || ''),
        amount: fv,
        type: '入帳',
        source: 'tx',
        id: txs[i].id,
        _fbKey: txs[i]._fbKey
      });
    }
  }

  // 2. 公基金手动存取记录
  var totalDep = 0, totalCDep = 0, totalW = 0;
  for (var i = 0; i < fundWithdrawals.length; i++) {
    var r = fundWithdrawals[i];
    var rType = r.type || '';
    if (rType === 'deposit') {
      totalDep += (r.amount || 0);
    } else if (rType === 'cash_deposit') {
      totalCDep += (r.amount || 0);
    } else {
      totalW += (r.amount || 0);
    }

    var typeLabel = rType === 'deposit' ? '存入' : (rType === 'cash_deposit' ? '自存現金' : '提領');
    allLedger.push({
      date: r.date,
      desc: r.note || '',
      amount: r.amount || 0,
      type: typeLabel,
      rawType: rType,
      source: 'fund',
      id: r.id,
      _fbKey: r._fbKey
    });
  }

  allLedger.sort(function(a, b) { return a.date.localeCompare(b.date); });

  // 计算上月累计 (pre-balance)
  var preBalance = 0;
  if (!skipMonthFilter) {
    var filterMonthStart = queryMonth ? queryMonth + '-01' : dateFrom;
    for (var i = 0; i < allLedger.length; i++) {
      var e = allLedger[i];
      if (e.date < filterMonthStart) {
        if (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') {
          preBalance += e.amount;
        } else {
          preBalance -= e.amount;
        }
      }
    }
  }

  var balance = Math.max(0, totalFundIncome + totalDep + totalCDep - totalW);

  // === KPI ===
  var kpiEl = document.getElementById('query-kpi');
  if (kpiEl) {
    kpiEl.innerHTML = '';

    var kpiItems = [
      { label: '公基金總額', value: fmtMoney(totalFundIncome), color: UI_COLORS.goldSoft },
      { label: '已提領',      value: fmtMoney(totalW),          color: UI_COLORS.danger },
      { label: '可提餘額',    value: fmtMoney(balance),         color: UI_COLORS.warning },
    ];
    if (totalCDep > 0) {
      kpiItems.splice(1, 0, { label: '自存現金', value: fmtMoney(totalCDep), color: UI_COLORS.cashOrange });
    }

    for (var i = 0; i < kpiItems.length; i++) {
      var card = h('div', { className: 'kpi-card' });
      card.style.borderLeft = '3px solid ' + kpiItems[i].color;
      card.innerHTML = '<div class="kpi-card-label">' + kpiItems[i].label + '</div>' +
                       '<div class="kpi-card-value" style="font-size:20px;color:' + kpiItems[i].color + '">' + kpiItems[i].value + '</div>';
      kpiEl.appendChild(card);
    }

    // ＋ 提领 按钮
    var btnDiv = h('div', { className: 'kpi-card', style: 'display:flex;align-items:center;justify-content:center;border-left:3px solid transparent' });
    btnDiv.innerHTML = '<button class="btn btn-sm btn-primary" onclick="openFundModal()">＋ 提領</button>';
    kpiEl.appendChild(btnDiv);
  }

  // === 表格 ===
  var thead = document.getElementById('query-thead');
  var tbody = document.getElementById('query-tbody');
  if (!tbody) return;

  if (thead) {
    thead.innerHTML = '<tr><th>日期</th><th>說明</th><th class="num">入帳</th><th class="num">提領</th><th>操作</th><th class="num">基金餘額</th></tr>';
  }

  tbody.innerHTML = '';

  // 上月累计行
  if (!skipMonthFilter && preBalance > 0) {
    var pr = h('tr');
    pr.style.cssText = 'background:rgba(201,168,76,0.08);'; // derived from UI_COLORS.goldSoft
    pr.innerHTML = '<td>' + (queryMonth || dateFrom).substring(0, 7) + '-01</td><td style="color:' + UI_COLORS.goldSoft + ';font-weight:600;">上月累計</td><td class="num"></td><td class="num"></td><td></td><td class="num" style="font-weight:700;color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(preBalance) + '</td>';
    tbody.appendChild(pr);
  }

  // 数据行
  var running = preBalance;
  var filterMonthStart = queryMonth ? queryMonth + '-01' : dateFrom;

  for (var i = 0; i < allLedger.length; i++) {
    var e = allLedger[i];

    // 月份/日期过滤
    if (!skipMonthFilter) {
      if (filterMonthStart && e.date < filterMonthStart) continue;
      if (dateFrom && e.date < dateFrom) continue;
      if (dateTo && e.date > dateTo) continue;
    }

    if (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') {
      running += e.amount;
    } else {
      running -= e.amount;
    }

    var tr = h('tr');
    var typeClr = e.type === '提領' ? 'color:#f85149;font-weight:600;' : (e.type === '存入' ? 'color:#58a6ff;' : (e.type === '自存現金' ? 'color:#e67e22;font-weight:600;' : 'color:' + UI_COLORS.goldSoft + ';'));

    var delBtn = e.source === 'fund'
      ? '<button class="btn-red" onclick="deleteFundRecord(\'' + (e._fbKey || e.id) + '\')">刪除</button>'
      : '<span style="color:#6e7681;font-size:11px;">自動</span>';

    var inVal = (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') ? fmtMoney(e.amount) : '';
    var outVal = (e.type === '提領') ? fmtMoney(e.amount) : '';

    tr.innerHTML = '<td>' + e.date + '</td>' +
      '<td style="' + typeClr + '">' + e.desc + '</td>' +
      '<td class="num" style="color:' + UI_COLORS.goldSoft + ';">' + inVal + '</td>' +
      '<td class="num" style="color:#f85149;">' + outVal + '</td>' +
      '<td>' + delBtn + '</td>' +
      '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';
    tbody.appendChild(tr);
  }

  // 合计行
  _appendTotalRow(tbody, running);

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = 'none';
}

// ============================================================================
// 代理對帳單模式 (指定代理时)
// ============================================================================

function _renderAgentLedger(agent, filteredTxs, queryMonth) {
  var txs = State.get('txs');
  var agentWallets = State.get('agentWallets');
  var awArr = agentWallets[agent] || [];

  // 从全部交易中计算该代理的各项汇总 (不分月份)
  var allBonus = 0, allCash = 0;
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent === agent) {
      allBonus += (txs[i].bonus || 0);
      allCash += (txs[i].cash || 0);
    }
  }

  // 钱包异动汇总
  var awDep = 0, awCDep = 0, awWithdraw = 0;
  for (var i = 0; i < awArr.length; i++) {
    var wt = awArr[i].type;
    var amt = awArr[i].amount || 0;
    if (wt === 'deposit') awDep += amt;
    else if (wt === 'cash_deposit') awCDep += amt;
    else awWithdraw += amt;
  }

  // 所有提领 = 交易中已提领 + 钱包提领
  var allDrawn = 0;
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent === agent) {
      allDrawn += (txs[i].drawn || 0);
    }
  }
  // 钱包提领也加到已提领
  allDrawn += awWithdraw;

  var awBalance = Math.max(0, allBonus + allCash + awDep + awCDep - allDrawn);

  // 取得月份过滤起止
  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  var dateFrom = fromEl && fromEl.value ? fromEl.value : '';
  var dateTo = toEl && toEl.value ? toEl.value : '';
  var skipMonthFilter = !queryMonth && !dateFrom && !dateTo;
  var filterStart = queryMonth ? queryMonth + '-01' : dateFrom;

  // === 构建合并流水 ===
  var allLedger = [];

  // 1. 交易入帐
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent !== agent) continue;
    var bv = txs[i].bonus || 0;
    var cv = txs[i].cash || 0;
    if (bv > 0) {
      allLedger.push({
        date: txs[i].date,
        venue: txs[i].venue || '',
        client: txs[i].client || '',
        volume: toNum(txs[i].volume) || 0,
        bonus: bv,
        rowType: 'rolling',
        type: '入帳',
        source: 'tx',
        id: txs[i].id,
        _fbKey: txs[i]._fbKey
      });
    }
    if (cv > 0) {
      allLedger.push({
        date: txs[i].date,
        venue: '現金寄放',
        client: txs[i].note || '',
        volume: 0,
        bonus: cv,
        rowType: 'cash',
        type: '入帳',
        source: 'tx',
        id: txs[i].id,
        _fbKey: txs[i]._fbKey
      });
    }
  }

  // 2. 钱包操作
  for (var i = 0; i < awArr.length; i++) {
    var r = awArr[i];
    var wt = r.type;
    if (wt === 'deposit') {
      allLedger.push({
        date: r.date,
        venue: '存入',
        client: '',
        volume: 0,
        bonus: (r.amount || 0),
        amount: r.amount || 0,
        rowType: 'aw_deposit',
        type: '存入',
        source: 'wallet',
        id: r.id,
        _fbKey: r._fbKey,
        note: r.note || ''
      });
    } else if (wt === 'cash_deposit') {
      allLedger.push({
        date: r.date,
        venue: '自存現金',
        client: '',
        volume: 0,
        bonus: (r.amount || 0),
        amount: r.amount || 0,
        rowType: 'aw_cash_dep',
        type: '自存現金',
        source: 'wallet',
        id: r.id,
        _fbKey: r._fbKey,
        note: r.note || ''
      });
    } else {
      allLedger.push({
        date: r.date,
        venue: '提領',
        client: '',
        volume: 0,
        bonus: -(r.amount || 0),
        amount: r.amount || 0,
        rowType: 'withdraw',
        type: '提領',
        source: 'wallet',
        id: r.id,
        _fbKey: r._fbKey,
        note: r.note || ''
      });
    }
  }

  allLedger.sort(function(a, b) { return a.date.localeCompare(b.date); });

  // 计算上月累计
  var preRunning = 0;
  if (!skipMonthFilter && filterStart) {
    for (var i = 0; i < allLedger.length; i++) {
      if (allLedger[i].date < filterStart) {
        preRunning += allLedger[i].bonus;
      }
    }
  }

  // === KPI ===
  var kpiEl = document.getElementById('query-kpi');
  if (kpiEl) {
    kpiEl.innerHTML = '';

    var kpiItems = [
      { label: '碼糧總額', value: fmtMoney(allBonus), color: UI_COLORS.goldSoft },
    ];
    if (allCash > 0) {
      kpiItems.push({ label: '現金寄放', value: fmtMoney(allCash), color: UI_COLORS.cashOrange });
    }
    if (awDep > 0) {
      kpiItems.push({ label: '錢包存入', value: fmtMoney(awDep), color: UI_COLORS.skyBlue });
    }
    if (awCDep > 0) {
      kpiItems.push({ label: '自存現金', value: fmtMoney(awCDep), color: UI_COLORS.cashOrange });
    }
    kpiItems.push({ label: '已提領', value: fmtMoney(allDrawn), color: UI_COLORS.danger });
    kpiItems.push({ label: '未提領', value: fmtMoney(awBalance), color: UI_COLORS.warning });

    for (var i = 0; i < kpiItems.length; i++) {
      var card = h('div', { className: 'kpi-card' });
      card.style.borderLeft = '3px solid ' + kpiItems[i].color;
      card.innerHTML = '<div class="kpi-card-label">' + kpiItems[i].label + '</div>' +
                       '<div class="kpi-card-value" style="font-size:20px;color:' + kpiItems[i].color + '">' + kpiItems[i].value + '</div>';
      kpiEl.appendChild(card);
    }

    // ＋ 異动 按钮
    var btnDiv = h('div', { className: 'kpi-card', style: 'display:flex;align-items:center;justify-content:center;border-left:3px solid transparent' });
    btnDiv.innerHTML = '<button class="btn btn-sm btn-primary" onclick="openWalletModal(\'' + agent.replace(/'/g, "\\'") + '\')">＋ 異動</button>';
    kpiEl.appendChild(btnDiv);
  }

  // === 表格 ===
  var thead = document.getElementById('query-thead');
  var tbody = document.getElementById('query-tbody');
  if (!tbody) return;

  if (thead) {
    thead.innerHTML = '<tr><th>日期</th><th>地點/說明</th><th class="num">轉碼數</th><th class="num">碼糧</th><th>操作</th><th class="num">未領餘額</th></tr>';
  }

  tbody.innerHTML = '';

  // 标题行
  var titleRow = h('tr');
  titleRow.innerHTML = '<td colspan="6" style="padding:8px 0;font-weight:700;color:' + UI_COLORS.goldSoft + ';font-size:14px;">💼 ' + agent + ' 代理對帳單</td>';
  tbody.appendChild(titleRow);

  // 上月累计行
  if (!skipMonthFilter && preRunning > 0) {
    var pr = h('tr');
    pr.style.cssText = 'background:rgba(201,168,76,0.08);'; // derived from UI_COLORS.goldSoft
    pr.innerHTML = '<td>' + filterStart.substring(0, 7) + '-01</td><td style="color:' + UI_COLORS.goldSoft + ';font-weight:600;">上月累計</td><td class="num"></td><td class="num"></td><td></td><td class="num" style="font-weight:700;color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(preRunning) + '</td>';
    tbody.appendChild(pr);
  }

  // 数据行
  var running = preRunning;
  for (var i = 0; i < allLedger.length; i++) {
    var e = allLedger[i];

    // 月份/日期过滤
    if (!skipMonthFilter) {
      if (filterStart && e.date < filterStart) continue;
      if (dateFrom && e.date < dateFrom) continue;
      if (dateTo && e.date > dateTo) continue;
    }

    running += e.bonus;
    var tr = h('tr');

    if (e.rowType === 'withdraw') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#f85149;font-weight:700;">提領' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#f85149;font-weight:700;">-' + fmtMoney(e.amount) + '</td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'aw_deposit') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#58a6ff;font-weight:700;">存入' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#58a6ff;font-weight:700;">+' + fmtMoney(e.amount) + '</td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'aw_cash_dep') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#e67e22;font-weight:700;">自存現金' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#e67e22;font-weight:700;">+' + fmtMoney(e.amount) + '</td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'cash') {
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#e67e22;font-weight:700;">現金寄放' + (e.client ? '：' + e.client : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#e67e22;font-weight:700;">+' + fmtMoney(e.bonus) + '</td>' +
        '<td><span style="color:#6e7681;font-size:11px;">自動</span></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else {
      var volStr = e.volume > 0 ? fmt(e.volume) + '萬' : '';
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td>' + (e.venue || '') + '(' + (e.client || '') + ')</td>' +
        '<td class="num">' + volStr + '</td>' +
        '<td class="num" style="color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(e.bonus) + '</td>' +
        '<td><span style="color:#6e7681;font-size:11px;">自動</span></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';
    }
    tbody.appendChild(tr);
  }

  // 合计行
  _appendTotalRow(tbody, running);

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = 'none';
}

// ============================================================================
// 共用：合计行
// ============================================================================

function _appendTotalRow(tbody, running) {
  var tr = h('tr');
  tr.style.cssText = 'background:rgba(22,27,34,0.8);font-weight:700;color:' + UI_COLORS.goldSoft + ';'; // bgElevated at 80% opacity
  tr.innerHTML = '<td></td><td style="color:' + UI_COLORS.textPrimary + ';">合計</td><td class="num"></td><td class="num"></td><td></td><td class="num" style="font-size:15px;">' + fmtMoney(Math.max(0, running)) + '</td>';
  tbody.appendChild(tr);
}

// ============================================================================
// 快速时间筛选
// ============================================================================

function quickFilter(type) {
  _highlightQuickBtn(type);

  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  var customRange = document.getElementById('query-date-range');

  var now = new Date();
  var dateFrom = '';
  var dateTo = '';

  switch (type) {
    case 'lastWeek': {
      var dayOfWeek = now.getDay() || 7;
      var lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - dayOfWeek - 6);
      var lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      dateFrom = _ymd(lastMonday);
      dateTo = _ymd(lastSunday);
      break;
    }
    case 'thisWeek': {
      var dayOfWeek = now.getDay() || 7;
      var thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - dayOfWeek + 1);
      dateFrom = _ymd(thisMonday);
      dateTo = _ymd(now);
      break;
    }
    case 'thisMonth': {
      dateFrom = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-01';
      dateTo = _ymd(now);
      break;
    }
    case 'lastMonth': {
      var firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      var lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFrom = _ymd(firstDayLastMonth);
      dateTo = _ymd(lastDayLastMonth);
      break;
    }
    case 'thisYear': {
      dateFrom = now.getFullYear() + '-01-01';
      dateTo = _ymd(now);
      break;
    }
    case 'custom': {
      if (customRange) customRange.style.display = '';
      if (fromEl && !fromEl.value) fromEl.value = _ymd(now);
      if (toEl && !toEl.value) toEl.value = _ymd(now);
      doQuery();
      return;
    }
  }

  if (customRange) customRange.style.display = '';
  if (fromEl) fromEl.value = dateFrom;
  if (toEl) toEl.value = dateTo;

  doQuery();
}

function _ymd(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}
