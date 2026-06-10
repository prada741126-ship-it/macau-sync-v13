/**
 * v13 查询页渲染
 * 依赖: core/state.js, calc/filters.js (filterTxs, sortTxs), utils/format.js
 * 对照档: 第七节模块13
 */

function doQuery() {
  var txs = State.get('txs');

  // 获取筛选条件
  var criteria = {};
  var agentEl = document.getElementById('query-agent');
  var monthEl = document.getElementById('query-month');
  var venueEl = document.getElementById('query-venue');
  var searchEl = document.getElementById('query-search');

  if (agentEl && agentEl.value) criteria.agent = agentEl.value;
  if (monthEl && monthEl.value) criteria.month = monthEl.value;
  if (venueEl && venueEl.value) criteria.venue = venueEl.value;
  if (searchEl && searchEl.value) criteria.keyword = searchEl.value;

  var filtered = filterTxs(txs, criteria);

  // KPI
  _renderQueryKPI(filtered);

  // 表格
  _renderQueryTable(filtered);

  // 代理帐务表 (按代理聚合)
  _renderQueryAgentSummary(filtered);
}

function _renderQueryKPI(txs) {
  var el = $('#query-kpi');
  if (!el) return;

  var vol = totalVolume(txs);
  var comm = totalComm(txs);
  var undrawn = totalUndrawn(txs);

  el.innerHTML = '';
  el.style.cssText = 'display:flex;gap:16px;margin-bottom:16px';

  var items = [
    { label: TERMS.volume,  value: fmt(vol) + '萬', color: UI_COLORS.techCyan },
    { label: TERMS.comm,    value: fmtMoney(comm), color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, value: fmtMoney(undrawn), color: UI_COLORS.warning },
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
  var tbody = document.querySelector('#page-query table tbody');
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
  // 代理帐务汇总 (按代理聚合)
  var agentTable = $('#page-query .agent-summary-table tbody');
  if (!agentTable) return;

  var agg = aggregateByAgent(txs);
  agentTable.innerHTML = '';
  for (var i = 0; i < agg.length; i++) {
    var a = agg[i];
    var tr = h('tr');
    var cells = [a.agent, fmt(a.volume) + '萬', fmtMoney(a.bonus), fmtMoney(a.drawn), fmtMoney(a.undrawn)];
    for (var j = 0; j < cells.length; j++) {
      tr.appendChild(h('td', {}, cells[j]));
    }
    agentTable.appendChild(tr);
  }
}

/** 快速时间筛选 */
function quickFilter(type, ev) {
  var btns = document.querySelectorAll('#page-query .tf-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  if (ev && ev.target) ev.target.classList.add('active');

  // 设定筛选条件
  var filter = { type: type };
  if (type === 'month') filter.value = State.get('workingMonth') || currentMonth();
  if (type === 'year') filter.value = currentMonth().substring(0, 4);

  State.set('currentTimeFilter', filter);
  doQuery();
}
