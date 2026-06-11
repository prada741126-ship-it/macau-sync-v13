/**
 * v13 统计页渲染 (代理×场地聚合)
 * 依赖: calc/stats.js (aggregateByAgentVenue), utils/format.js
 * 对照档: 第七节模块10 renderSummary
 */

function renderSummary() {
  var txs = State.get('txs');
  var month = State.get('workingMonth');
  if (month) txs = filterByMonth(txs, month);

  // KPI
  _renderSummaryKPI(txs);

  // 代理×场地表
  _renderSummaryTable(txs);
}

function _renderSummaryKPI(txs) {
  var el = $('#summary-kpi');
  if (!el) return;
  var kpi = calcKPI(txs);
  el.innerHTML = '';

  var items = [
    { label: '總筆數', value: kpi.txCount, accent: 'cyan',   color: UI_COLORS.techCyan },
    { label: '代理數', value: kpi.agentCount, accent: 'violet', color: UI_COLORS.electricViolet },
    { label: TERMS.volume, value: fmt(kpi.totalVolume) + '萬', accent: 'blue',    color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, value: fmtMoney(kpi.totalUndrawn), accent: 'orange',  color: UI_COLORS.warning },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div', { className: 'kpi-card' });
    card.style.borderLeft = '3px solid ' + items[i].color;
    card.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '">' + items[i].value + '</div>';
    el.appendChild(card);
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
      tr.appendChild(h('td', {}, cells[j]));
    }
    tbody.appendChild(tr);
  }
}
