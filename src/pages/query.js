/**
 * v13 查询页渲染
 * 依赖: core/state.js, calc/filters.js (filterTxs, sortTxs), utils/format.js, utils/dom.js ($)
 * 对照档: 第七节模块13
 */

/** 入口：弹出所有下拉并执行默认查询（本月） */
function renderQuery() {
  _populateQueryFilters();
  _setDefaultMonth();
  _highlightQuickBtn('thisMonth');
  doQuery();
}

/** 填充查詢頁下拉：代理、地點、月份 */
function _populateQueryFilters() {
  // ---- 代理 ----
  var agentSel = document.getElementById('query-agent');
  if (agentSel) {
    agentSel.innerHTML = '<option value="">全部代理</option>';
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

  // ---- 月份（1月-12月） ----
  var monthSel = document.getElementById('query-month');
  if (monthSel) {
    monthSel.innerHTML = '<option value="">全部月份</option>';
    for (var m = 1; m <= 12; m++) {
      var mStr = m < 10 ? '0' + m : '' + m;
      var opt = document.createElement('option');
      opt.value = '2026-' + mStr;  // 默认年份，实际由 _setDefaultMonth 覆写
      opt.textContent = m + '月';
      monthSel.appendChild(opt);
    }
  }
}

/** 设定月份下拉默认值为当前月，默认填入日期范围为当月 */
function _setDefaultMonth() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var mStr = month < 10 ? '0' + month : '' + month;
  var monthValue = year + '-' + mStr;

  // 设定月份下拉
  var monthSel = document.getElementById('query-month');
  if (monthSel) {
    // 更新所有 option 的 value 为当前年份
    var opts = monthSel.options;
    for (var i = 1; i < opts.length; i++) {
      var text = opts[i].textContent; // "1月".."12月"
      var mm = parseInt(text);
      var mmStr = mm < 10 ? '0' + mm : '' + mm;
      opts[i].value = year + '-' + mmStr;
      if (opts[i].value === monthValue) {
        monthSel.selectedIndex = i;
      }
    }
  }

  // 默认日期范围 → 当月第一天到最后一天
  var daysInMonth = new Date(year, month, 0).getDate();
  var dateFrom = year + '-' + mStr + '-01';
  var dateTo = year + '-' + mStr + '-' + (daysInMonth < 10 ? '0' + daysInMonth : daysInMonth);

  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  if (fromEl) fromEl.value = dateFrom;
  if (toEl) toEl.value = dateTo;
}

/** 高亮快捷时间按钮 */
function _highlightQuickBtn(type) {
  var btns = document.querySelectorAll('#page-query .tf-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  // 找到对应按钮
  for (var j = 0; j < btns.length; j++) {
    if (btns[j].textContent.trim() === _quickBtnLabel(type)) {
      btns[j].classList.add('active');
    }
  }
}

function _quickBtnLabel(type) {
  var map = {
    lastWeek: '上週', thisWeek: '本週', thisMonth: '本月',
    lastMonth: '上月', thisYear: '年度', custom: '自訂'
  };
  return map[type] || '';
}

/** 执行查询 */
function doQuery() {
  var txs = State.get('txs');
  var criteria = {};

  // 代理
  var agentEl = document.getElementById('query-agent');
  if (agentEl && agentEl.value) criteria.agent = agentEl.value;

  // 地点
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

  // KPI
  _renderQueryKPI(filtered);

  // 表格
  _renderQueryTable(filtered);

  // 代理帐务表
  _renderQueryAgentSummary(filtered);
}

function _renderQueryKPI(txs) {
  var el = $('#query-kpi');
  if (!el) return;

  var vol = totalVolume(txs);
  var comm = totalComm(txs);
  var undrawn = totalUndrawn(txs);
  var totalWallet = getTotalWallet();

  el.innerHTML = '';
  el.style.cssText = 'display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap';

  var items = [
    { label: TERMS.volume,  value: fmt(vol) + '萬', color: UI_COLORS.techCyan },
    { label: TERMS.comm,    value: fmtMoney(comm), color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, value: fmtMoney(undrawn), color: UI_COLORS.warning },
    { label: '💰 總錢包',   value: fmtMoney(totalWallet), color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div');
    card.style.cssText = 'flex:1;background:' + UI_COLORS.bgElevated + ';padding:12px;border-radius:8px;border:1px solid ' + UI_COLORS.borderSubtle + ';border-left:3px solid ' + items[i].color;
    card.innerHTML = '<div style="font-size:11px;color:' + UI_COLORS.textMuted + ';margin-bottom:4px">' + items[i].label + '</div>' +
                     '<div style="font-size:20px;font-weight:700;color:' + items[i].color + '">' + items[i].value + '</div>';
    el.appendChild(card);
  }
}

function _renderQueryTable(txs) {
  var tbody = document.querySelector('#page-query table:not(.agent-summary-table) tbody');
  if (!tbody) return;

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

/** 快速时间筛选
 *  type: lastWeek | thisWeek | thisMonth | lastMonth | thisYear | custom
 */
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
      // 上周一 ～ 上周日
      var dayOfWeek = now.getDay() || 7; // 周日=7
      var lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - dayOfWeek - 6);
      var lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      dateFrom = _ymd(lastMonday);
      dateTo = _ymd(lastSunday);
      break;
    }
    case 'thisWeek': {
      // 本周一 ～ 今天
      var dayOfWeek = now.getDay() || 7;
      var thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - dayOfWeek + 1);
      dateFrom = _ymd(thisMonday);
      dateTo = _ymd(now);
      break;
    }
    case 'thisMonth': {
      // 本月 1 日 ～ 今天
      dateFrom = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-01';
      dateTo = _ymd(now);
      break;
    }
    case 'lastMonth': {
      // 上月 1 日 ～ 上月最后一天
      var firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      var lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFrom = _ymd(firstDayLastMonth);
      dateTo = _ymd(lastDayLastMonth);
      break;
    }
    case 'thisYear': {
      // 今年 1/1 ～ 今天
      dateFrom = now.getFullYear() + '-01-01';
      dateTo = _ymd(now);
      break;
    }
    case 'custom': {
      // 自订 — 显示日期选择器，不清除已有值
      if (customRange) customRange.style.display = '';
      if (fromEl && !fromEl.value) fromEl.value = _ymd(now);
      if (toEl && !toEl.value) toEl.value = _ymd(now);
      doQuery();
      return;
    }
  }

  // 显示日期选择器（快捷按钮自动填入日期，方便查帐）
  if (customRange) customRange.style.display = '';

  // 设定 date 输入
  if (fromEl) fromEl.value = dateFrom;
  if (toEl) toEl.value = dateTo;

  doQuery();
}

/** 格式化日期为 YYYY-MM-DD */
function _ymd(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/** 补零 */
function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}
