/**
 * v13 查询页渲染
 * 依赖: core/state.js, calc/filters.js (filterTxs, sortTxs), utils/format.js, utils/dom.js ($)
 * 对照档: 第七节模块13 + v12 query.js
 * 
 * 命名空间: 仅导出 renderQuery / doQuery / saveCurrentFilter / loadSavedFilter / deleteSavedFilter / quickFilter
 */

(function() {

// 查询表排序状态
var _querySortCol = 'date';   // 默认按日期排序
var _querySortDir = 'desc';   // 默认最新在前
var _queryTableSortInited = false;

/** 初始化查询表排序表头点击 */
function _initQueryTableSort() {
  var ths = document.querySelectorAll('#query-table th.th-sortable');
  for (var i = 0; i < ths.length; i++) {
    (function(th) {
      th.style.cursor = 'pointer';
      th.addEventListener('click', function() {
        var col = th.getAttribute('data-sort');
        if (!col) return;
        if (_querySortCol === col) {
          _querySortDir = _querySortDir === 'asc' ? 'desc' : 'asc';
        } else {
          _querySortCol = col;
          _querySortDir = 'asc';
        }
        var allThs = document.querySelectorAll('#query-table th.th-sortable');
        for (var j = 0; j < allThs.length; j++) {
          allThs[j].classList.remove('th-sort-asc', 'th-sort-desc');
        }
        th.classList.add(_querySortDir === 'asc' ? 'th-sort-asc' : 'th-sort-desc');
        doQuery();
      });
    })(ths[i]);
  }
}

/** 入口：弹出所有下拉并执行默认查询（本月） */
function renderQuery() {
  _populateQueryFilters();
  _setDefaultMonth();
  _highlightQuickBtn('thisMonth');
  // ★ 初始化已存筛选器
  _initSavedFilters();
  // ★ 初始化查询表排序
  if (!_queryTableSortInited) { _initQueryTableSort(); _queryTableSortInited = true; }
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

    // ★ 应用表格排序
    if (_querySortCol) {
      try { filtered = sortTxs(filtered, _querySortCol, _querySortDir === 'asc'); } catch(e) { console.error('[doQuery] sort 崩溃:', e); }
    }

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
    { label: TERMS.volume,  raw: vol,        cuOpts: { suffix: '萬' }, accent: 'cyan',   color: UI_COLORS.techCyan },
    { label: TERMS.comm,    raw: comm,       cuOpts: { prefix: '¥' },  accent: 'blue',    color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, raw: undrawn,    cuOpts: { prefix: '¥' },  accent: 'orange', color: UI_COLORS.warning },
    { label: '💰 總錢包',   raw: totalWallet, cuOpts: { prefix: '¥' },  accent: 'gold',   color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div', { className: 'kpi-card' });
    card.style.borderLeft = '3px solid ' + items[i].color;
    card.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '" style="font-size:20px">0</div>';
    el.appendChild(card);
  }

  // ★ countUp 动画
  var vals = el.querySelectorAll('.kpi-card-value');
  for (var j = 0; j < vals.length; j++) {
    if (items[j] && items[j].raw != null && typeof countUp === 'function') {
      countUp(vals[j], items[j].raw, items[j].cuOpts);
    }
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
    thead.innerHTML = '<tr><th>日期</th><th>代理</th><th>地點</th><th class="text-right">洗碼量</th><th class="text-right">碼糧</th><th class="text-right">已提領</th><th class="text-right">未提領</th><th>備註</th></tr>';
  }

  tbody.innerHTML = '';
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var tr = h('tr');
    var cells = [tx.date, tx.agent, tx.venue, fmtDec(tx.volume, 1) + '萬', fmtMoney(tx.bonus), fmtMoney(tx.drawn), fmtMoney(tx.undrawn), tx.note || ''];
    for (var j = 0; j < cells.length; j++) {
      var tdAttrs = {};
      if (j >= 3 && j <= 6) tdAttrs.class = 'text-right num-mono';
      tr.appendChild(h('td', tdAttrs, cells[j]));
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
      var tdAttrs = {};
      if (j >= 1) tdAttrs.class = 'text-right num-mono';
      tr.appendChild(h('td', tdAttrs, cells[j]));
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
      { label: '公基金總額', raw: totalFundIncome, color: UI_COLORS.goldSoft },
      { label: '已提領',      raw: totalW,          color: UI_COLORS.danger },
      { label: '可提餘額',    raw: balance,         color: UI_COLORS.warning },
    ];
    if (totalCDep > 0) {
      kpiItems.splice(1, 0, { label: '自存現金', raw: totalCDep, color: UI_COLORS.cashOrange });
    }

    for (var i = 0; i < kpiItems.length; i++) {
      var card = h('div', { className: 'kpi-card' });
      card.style.borderLeft = '3px solid ' + kpiItems[i].color;
      card.innerHTML = '<div class="kpi-card-label">' + kpiItems[i].label + '</div>' +
                       '<div class="kpi-card-value" style="font-size:20px;color:' + kpiItems[i].color + '">0</div>';
      kpiEl.appendChild(card);
    }

    // ★ countUp 动画
    var vals = kpiEl.querySelectorAll('.kpi-card-value');
    for (var j = 0; j < vals.length; j++) {
      if (kpiItems[j] && kpiItems[j].raw != null && typeof countUp === 'function') {
        countUp(vals[j], kpiItems[j].raw, { prefix: '¥' });
      }
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
    thead.innerHTML = '<tr><th>日期</th><th>說明</th><th class="text-right num-mono">入帳</th><th class="text-right num-mono">提領</th><th>操作</th><th class="text-right num-mono">基金餘額</th></tr>';
  }

  tbody.innerHTML = '';

  // 上月累计行
  if (!skipMonthFilter && preBalance > 0) {
    var pr = h('tr');
    pr.style.cssText = 'background:' + hexToRgba(UI_COLORS.goldSoft, 0.08) + ';';
    pr.innerHTML = '<td>' + (queryMonth || dateFrom).substring(0, 7) + '-01</td><td style="color:' + UI_COLORS.goldSoft + ';font-weight:600;">上月累計</td><td class="text-right num-mono"></td><td class="text-right num-mono"></td><td></td><td class="text-right num-mono" style="font-weight:700;color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(preBalance) + '</td>';
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
    var typeClr = e.type === '提領' ? 'color:' + UI_COLORS.danger + ';font-weight:600;' : (e.type === '存入' ? 'color:' + UI_COLORS.info + ';' : (e.type === '自存現金' ? 'color:' + UI_COLORS.cashOrange + ';font-weight:600;' : 'color:' + UI_COLORS.goldSoft + ';'));

    var delBtn = e.source === 'fund'
      ? '<button class="btn-red" onclick="deleteFundRecord(\'' + (e._fbKey || e.id) + '\')">刪除</button>'
      : '<span style="color:' + UI_COLORS.textMuted + ';font-size:11px;">自動</span>';

    var inVal = (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') ? fmtMoney(e.amount) : '';
    var outVal = (e.type === '提領') ? fmtMoney(e.amount) : '';

    tr.innerHTML = '<td>' + e.date + '</td>' +
      '<td style="' + typeClr + '">' + e.desc + '</td>' +
      '<td class="text-right num-mono" style="color:' + UI_COLORS.goldSoft + ';">' + inVal + '</td>' +
      '<td class="text-right num-mono" style="color:' + UI_COLORS.danger + ';">' + outVal + '</td>' +
      '<td>' + delBtn + '</td>' +
      '<td class="text-right num-mono" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';
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

  // ★ 已領碼糧 (tx.drawn) 和錢包提領 (awWithdraw) 是兩筆獨立的扣減，都要減
  var allDrawn = 0;
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent === agent) {
      allDrawn += (txs[i].drawn || 0);
    }
  }
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
        drawn: txs[i].drawn || 0,
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
      { label: '碼糧總額', raw: allBonus,  color: UI_COLORS.goldSoft },
    ];
    if (allCash > 0) {
      kpiItems.push({ label: '現金寄放', raw: allCash,  color: UI_COLORS.cashOrange });
    }
    if (awDep > 0) {
      kpiItems.push({ label: '錢包存入', raw: awDep,    color: UI_COLORS.skyBlue });
    }
    if (awCDep > 0) {
      kpiItems.push({ label: '自存現金', raw: awCDep,   color: UI_COLORS.cashOrange });
    }
    kpiItems.push({ label: '已提領', raw: allDrawn,    color: UI_COLORS.danger });
    kpiItems.push({ label: '未提領', raw: awBalance,    color: UI_COLORS.warning });

    for (var i = 0; i < kpiItems.length; i++) {
      var card = h('div', { className: 'kpi-card' });
      card.style.borderLeft = '3px solid ' + kpiItems[i].color;
      card.innerHTML = '<div class="kpi-card-label">' + kpiItems[i].label + '</div>' +
                       '<div class="kpi-card-value" style="font-size:20px;color:' + kpiItems[i].color + '">0</div>';
      kpiEl.appendChild(card);
    }

    // ★ countUp 动画
    var vals = kpiEl.querySelectorAll('.kpi-card-value');
    for (var j = 0; j < vals.length; j++) {
      if (kpiItems[j] && kpiItems[j].raw != null && typeof countUp === 'function') {
        countUp(vals[j], kpiItems[j].raw, { prefix: '¥' });
      }
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
    thead.innerHTML = '<tr><th>日期</th><th>地點/說明</th><th class="text-right num-mono">轉碼數</th><th class="text-right num-mono">碼糧</th><th class="text-right num-mono">已提領</th><th>操作</th><th class="text-right num-mono">未領餘額</th></tr>';
  }

  tbody.innerHTML = '';

  // 标题行
  var titleRow = h('tr');
  titleRow.innerHTML = '<td colspan="7" style="padding:8px 0;font-weight:700;color:' + UI_COLORS.goldSoft + ';font-size:14px;">💼 ' + agent + ' 代理對帳單</td>';
  tbody.appendChild(titleRow);

  // 上月累计行
  if (!skipMonthFilter && preRunning > 0) {
    var pr = h('tr');
    pr.style.cssText = 'background:' + hexToRgba(UI_COLORS.goldSoft, 0.08) + ';';
    pr.innerHTML = '<td>' + filterStart.substring(0, 7) + '-01</td><td style="color:' + UI_COLORS.goldSoft + ';font-weight:600;">上月累計</td><td class="text-right num-mono"></td><td class="text-right num-mono"></td><td class="text-right num-mono"></td><td></td><td class="text-right num-mono" style="font-weight:700;color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(preRunning) + '</td>';
    tbody.appendChild(pr);
  }

  // 数据行
  var running = preRunning;
  var totalDrawnShown = 0;
  var totalVolShown = 0;
  var totalBonusShown = 0;
  for (var i = 0; i < allLedger.length; i++) {
    var e = allLedger[i];

    // 月份/日期过滤
    if (!skipMonthFilter) {
      if (filterStart && e.date < filterStart) continue;
      if (dateFrom && e.date < dateFrom) continue;
      if (dateTo && e.date > dateTo) continue;
    }

    running += e.bonus - (e.drawn || 0);  // 碼糧收入增加，己領碼糧減少餘額
    var tr = h('tr');

    if (e.rowType === 'withdraw') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:' + UI_COLORS.danger + ';font-weight:700;">提領' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td class="text-right num-mono" style="color:' + UI_COLORS.danger + ';font-weight:700;">-' + fmtMoney(e.amount) + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="text-right num-mono" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'aw_deposit') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:' + UI_COLORS.info + ';font-weight:700;">存入' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td class="text-right num-mono" style="color:' + UI_COLORS.info + ';font-weight:700;">+' + fmtMoney(e.amount) + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="text-right num-mono" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'aw_cash_dep') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:' + UI_COLORS.cashOrange + ';font-weight:700;">自存現金' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td class="text-right num-mono" style="color:' + UI_COLORS.cashOrange + ';font-weight:700;">+' + fmtMoney(e.amount) + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="text-right num-mono" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'cash') {
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:' + UI_COLORS.cashOrange + ';font-weight:700;">現金寄放' + (e.client ? '：' + e.client : '') + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td class="text-right num-mono" style="color:' + UI_COLORS.cashOrange + ';font-weight:700;">+' + fmtMoney(e.bonus) + '</td>' +
        '<td class="text-right num-mono"></td>' +
        '<td><span style="color:' + UI_COLORS.textMuted + ';font-size:11px;">自動</span></td>' +
        '<td class="text-right num-mono" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else {
      var volStr = e.volume > 0 ? fmt(e.volume) + '萬' : '';
      var drawnStr = e.drawn > 0 ? fmtMoney(e.drawn) : '';
      if (e.drawn > 0) totalDrawnShown += e.drawn;
      if (e.volume > 0) totalVolShown += e.volume;
      totalBonusShown += e.bonus;
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td>' + (e.venue || '') + '(' + (e.client || '') + ')</td>' +
        '<td class="text-right num-mono">' + volStr + '</td>' +
        '<td class="text-right num-mono" style="color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(e.bonus) + '</td>' +
        '<td class="text-right num-mono" style="color:' + UI_COLORS.danger + ';">' + drawnStr + '</td>' +
        '<td><span style="color:' + UI_COLORS.textMuted + ';font-size:11px;">自動</span></td>' +
        '<td class="text-right num-mono" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';
    }
    tbody.appendChild(tr);
  }

  // 合计行：碼糧合计含全部来源（交易碼糧+錢包存入），未领余额与 KPI awBalance 保持一致
  var allIncome = allBonus + allCash + awDep + awCDep;
  _appendTotalRow(tbody, running, allDrawn, totalVolShown, allIncome, awBalance);

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = 'none';
}

// ============================================================================
// 共用：合计行
// ============================================================================

function _appendTotalRow(tbody, running, drawnTotal, volTotal, bonusTotal, undrawnTotal) {
  var tr = h('tr');
  tr.style.cssText = 'background:' + hexToRgba(UI_COLORS.bgElevated, 0.8) + ';font-weight:700;color:' + UI_COLORS.goldSoft + ';border-top:2px solid ' + UI_COLORS.borderSubtle + ';';
  if (drawnTotal !== undefined) {
    // 代理對帳單模式：7列（含总洗码数、碼糧合计、已提领、未领余额）
    var volStr   = (volTotal   > 0) ? fmt(volTotal)   + '萬' : '';
    var bonusStr = (bonusTotal > 0) ? fmtMoney(bonusTotal) : '';
    var drawnStr = (drawnTotal > 0) ? fmtMoney(drawnTotal) : '';
    // 未领余额优先使用传入的精确值，退而使用 running
    var undrawnVal = (undrawnTotal !== undefined) ? undrawnTotal : Math.max(0, running);
    tr.innerHTML =
      '<td></td>' +
      '<td style="color:' + UI_COLORS.textPrimary + ';">合計</td>' +
      '<td class="text-right num-mono">' + volStr + '</td>' +
      '<td class="text-right num-mono" style="color:' + UI_COLORS.goldSoft + ';">' + bonusStr + '</td>' +
      '<td class="text-right num-mono" style="color:' + UI_COLORS.danger + ';">' + drawnStr + '</td>' +
      '<td></td>' +
      '<td class="text-right num-mono" style="font-size:15px;color:' + UI_COLORS.warning + ';">' + fmtMoney(undrawnVal) + '</td>';
  } else {
    // 公基金模式：6列
    tr.innerHTML = '<td></td><td style="color:' + UI_COLORS.textPrimary + ';">合計</td><td class="text-right num-mono"></td><td class="text-right num-mono"></td><td></td><td class="text-right num-mono" style="font-size:15px;">' + fmtMoney(Math.max(0, running)) + '</td>';
  }
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

// ============================================================================
// 已存筛选器
// ============================================================================

/**
 * 获取当前筛选条件快照
 * @returns {object}
 */
function _getCurrentFilterSnapshot() {
  return {
    agent:    ($('#query-agent') || {}).value || '',
    venue:    ($('#query-venue') || {}).value || '',
    month:    ($('#query-month') || {}).value || '',
    search:   ($('#query-search') || {}).value || '',
    dateFrom: ($('#query-date-from') || {}).value || '',
    dateTo:   ($('#query-date-to') || {}).value || '',
    _savedAt: new Date().toISOString(),
  };
}

/**
 * 应用筛选器快照
 * @param {object} snap
 */
function _applyFilterSnapshot(snap) {
  var agentEl = $('#query-agent');
  var venueEl = $('#query-venue');
  var monthEl = $('#query-month');
  var searchEl = $('#query-search');
  var fromEl = $('#query-date-from');
  var toEl = $('#query-date-to');
  var customRange = $('#query-date-range');

  if (agentEl) agentEl.value = snap.agent || '';
  if (venueEl) venueEl.value = snap.venue || '';
  if (monthEl) monthEl.value = snap.month || '';
  if (searchEl) searchEl.value = snap.search || '';
  if (fromEl) fromEl.value = snap.dateFrom || '';
  if (toEl) toEl.value = snap.dateTo || '';

  // 有自定义日期时展开日期范围
  if (customRange && (snap.dateFrom || snap.dateTo)) {
    customRange.style.display = '';
  }

  doQuery();
}

/**
 * 刷新已存筛选器下拉列表
 */
function _refreshSavedFilterDropdown(selectName) {
  var sel = $('#query-saved-filters');
  if (!sel) return;

  var filters = State.get('savedFilters') || {};
  var names = Object.keys(filters).sort();

  sel.innerHTML = '';
  if (names.length === 0) {
    sel.innerHTML = '<option value="">(無已存篩選)</option>';
    sel.disabled = true;
    return;
  }

  sel.disabled = false;
  sel.innerHTML = '<option value="">— 選擇已存篩選 —</option>';
  for (var i = 0; i < names.length; i++) {
    var opt = document.createElement('option');
    opt.value = names[i];
    opt.textContent = names[i] + ' (' + (filters[names[i]].agent || '全部') + ')';
    if (selectName === names[i]) opt.selected = true;
    sel.appendChild(opt);
  }
}

/**
 * 儲存目前篩選條件
 */
function saveCurrentFilter() {
  var snap = _getCurrentFilterSnapshot();

  // 检查是否有实际筛选条件
  if (!snap.agent && !snap.venue && !snap.month && !snap.search && !snap.dateFrom && !snap.dateTo) {
    if (typeof showToast === 'function') showToast('目前無篩選條件可儲存', 'warning');
    return;
  }

  // 用代理+月份作为默认名称
  var defaultName = (snap.agent || '全部') + ' - ' + (snap.month || snap.dateFrom || '自訂');
  var name = prompt('為此篩選器命名：', defaultName);
  if (!name) return;
  name = name.trim();
  if (!name) return;

  var filters = State.get('savedFilters') || {};
  filters[name] = snap;
  State.set('savedFilters', filters);
  Store.saveFilters(filters);

  _refreshSavedFilterDropdown(name);
  if (typeof showToast === 'function') showToast('篩選器「' + name + '」已儲存', 'success');
}

/**
 * 載入已存篩選
 * @param {string} name
 */
function loadSavedFilter(name) {
  if (!name) return;
  var filters = State.get('savedFilters') || {};
  var snap = filters[name];
  if (!snap) {
    if (typeof showToast === 'function') showToast('篩選器不存在', 'warning');
    return;
  }
  _applyFilterSnapshot(snap);
  if (typeof showToast === 'function') showToast('已載入篩選器「' + name + '」', 'info');
}

/**
 * 刪除目前選中的已存篩選
 */
function deleteSavedFilter() {
  var sel = $('#query-saved-filters');
  if (!sel || !sel.value) {
    if (typeof showToast === 'function') showToast('請先選擇要刪除的篩選器', 'warning');
    return;
  }
  var name = sel.value;
  if (!confirm('確定刪除篩選器「' + name + '」？')) return;

  var filters = State.get('savedFilters') || {};
  delete filters[name];
  State.set('savedFilters', filters);
  Store.saveFilters(filters);

  _refreshSavedFilterDropdown();
  if (typeof showToast === 'function') showToast('篩選器「' + name + '」已刪除', 'success');
}

/**
 * 初始化已存筛选器下拉（页面渲染时调用）
 */
function _initSavedFilters() {
  _refreshSavedFilterDropdown();
}

// 导出公开 API
window.renderQuery = renderQuery;
window.doQuery = doQuery;
window.saveCurrentFilter = saveCurrentFilter;
window.loadSavedFilter = loadSavedFilter;
window.deleteSavedFilter = deleteSavedFilter;
window.quickFilter = quickFilter;

})();
