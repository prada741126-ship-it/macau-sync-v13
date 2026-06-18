/**
 * v13 统计页渲染 (代理×场地聚合)
 * 依赖: calc/stats.js (aggregateByAgentVenue), utils/format.js
 * 对照档: 第七节模块10 renderSummary
 */

function renderSummary() {
  var txs = State.get('txs');
  var month = State.get('workingMonth');

  // ★ try-catch 包裹，防止未定义条目导致崩溃
  try {
    if (month) txs = filterByMonth(txs, month);
  } catch (e) {
    console.error('[v13:summary] filterByMonth 崩溃:', e);
  }

  // KPI
  try {
    _renderSummaryKPI(txs);
  } catch (e) {
    console.error('[v13:summary] _renderSummaryKPI 崩溃:', e);
  }

  // 代理×场地表
  try {
    _renderSummaryTable(txs);
  } catch (e) {
    console.error('[v13:summary] _renderSummaryTable 崩溃:', e);
  }
}

function _renderSummaryKPI(txs) {
  var el = $('#summary-kpi');
  if (!el) return;
  var kpi = calcKPI(txs);
  el.innerHTML = '';

  var items = [
    { label: '總筆數', raw: kpi.txCount,       cuOpts: {},              accent: 'cyan',   color: UI_COLORS.techCyan },
    { label: '代理數', raw: kpi.agentCount,    cuOpts: {},              accent: 'violet', color: UI_COLORS.electricViolet },
    { label: TERMS.volume, raw: kpi.totalVolume, cuOpts: { suffix: '萬' }, accent: 'blue',    color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, raw: kpi.totalUndrawn, cuOpts: { prefix: '¥' }, accent: 'orange',  color: UI_COLORS.warning },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div', { className: 'kpi-card' });
    card.style.borderLeft = '3px solid ' + items[i].color;
    card.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '">0</div>';
    el.appendChild(card);
  }

  // ★ countUp 动画
  var vals = el.querySelectorAll('.kpi-card-value');
  for (var j = 0; j < vals.length; j++) {
    if (items[j] && items[j].raw != null && typeof countUp === 'function') {
      countUp(vals[j], items[j].raw, items[j].cuOpts);
    }
  }
}

function _renderSummaryTable(txs) {
  var tbody = document.querySelector('#summary-table tbody');
  if (!tbody) return;

  var data = aggregateByAgentVenue(txs);
  tbody.innerHTML = '';

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var tr = h('tr');
    var cells = [d.agent, d.venue, fmt(d.volume) + '萬', fmtMoney(d.bonus), fmtMoney(d.drawn), fmtMoney(d.undrawn)];
    for (var j = 0; j < cells.length; j++) {
      var tdAttrs = {};
      if (j >= 2) tdAttrs.class = 'text-right num-mono';
      tr.appendChild(h('td', tdAttrs, cells[j]));
    }
    tbody.appendChild(tr);
  }
}
