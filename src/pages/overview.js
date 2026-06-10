/**
 * v13 总览页渲染
 * 
 * 依赖: core/state.js, core/constants.js (UI_COLORS, TERMS)
 *        calc/finance.js (totalVolume, totalComm, totalBonus, totalFund, totalDrawn, totalUndrawn)
 *        calc/stats.js (calcKPI, rankByVolume, aggregateByDay)
 *        utils/format.js (fmt, fmtMoney), utils/dom.js ($, h)
 * 对照档: 第七节模块15
 */

function renderOverview() {
  var txs = State.get('txs');
  var filter = State.get('currentTimeFilter');
  var filteredTxs = filter ? filterByTime(txs, filter) : txs;

  var kpi = calcKPI(filteredTxs);

  // --- KPI 卡片 ---
  _renderKPI(kpi);

  // --- 每日趋势图 (委托 charts/trend.js) ---
  if (typeof renderTrendChart === 'function') {
    renderTrendChart(filteredTxs);
  }

  // --- 代理排行 (委托 charts/rank.js) ---
  if (typeof renderRankChart === 'function') {
    renderRankChart(filteredTxs);
  }

  // --- 近期动态 ---
  _renderRecentActivity(filteredTxs);
}

function _renderKPI(kpi) {
  var grid = $('#ov-kpi-grid');
  if (!grid) return;

  var cards = [
    { label: TERMS.volume,      value: fmt(kpi.totalVolume),  unit: '萬', color: UI_COLORS.techCyan },
    { label: TERMS.comm,        value: fmtMoney(kpi.totalComm),   color: UI_COLORS.skyBlue },
    { label: TERMS.bonus,       value: fmtMoney(kpi.totalBonus),  color: UI_COLORS.electricViolet },
    { label: TERMS.fund,        value: fmtMoney(kpi.totalFund),   color: UI_COLORS.goldSoft },
    { label: TERMS.drawn,       value: fmtMoney(kpi.totalDrawn),  color: UI_COLORS.warning },
    { label: TERMS.undrawn,     value: fmtMoney(kpi.totalUndrawn),color: UI_COLORS.danger },
  ];

  grid.innerHTML = '';
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var card = h('div', { className: 'kpi-card', 'data-kpi': c.label.toLowerCase() });
    card.style.cssText = 'background:' + UI_COLORS.bgElevated + ';border:1px solid ' + UI_COLORS.borderSubtle + ';border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s ease;border-left:3px solid ' + c.color;

    var label = h('div', { className: 'kpi-label' }, c.label);
    label.style.cssText = 'font-size:12px;color:' + UI_COLORS.textSecondary + ';margin-bottom:8px';

    var value = h('div', { className: 'kpi-value' }, c.value + (c.unit ? ' <span style="font-size:14px;color:' + UI_COLORS.textMuted + '">' + c.unit + '</span>' : ''));
    value.style.cssText = 'font-size:24px;font-weight:700;color:' + c.color;

    card.appendChild(label);
    card.appendChild(value);

    // KPI 点击跳转
    card.addEventListener('click', function() {
      Events.emit(EVENTS.KPI_CLICK, { kpi: this.getAttribute('data-kpi') });
    });

    grid.appendChild(card);
  }

  // 笔数/代理数
  var info = h('div', { className: 'kpi-info' });
  info.style.cssText = 'grid-column:1/-1;text-align:center;padding:8px;font-size:12px;color:' + UI_COLORS.textMuted;
  info.textContent = '共 ' + kpi.txCount + ' 筆交易 · ' + kpi.agentCount + ' 位代理';
  grid.appendChild(info);
}

function _renderRecentActivity(txs) {
  var box = $('.timeline-box');
  if (!box) return;

  // 取最近 10 笔
  var recent = txs.slice().sort(function(a, b) {
    return (b.date || '').localeCompare(a.date || '');
  }).slice(0, 10);

  box.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:12px;color:' + UI_COLORS.textPrimary + '">近期動態</div>';

  if (recent.length === 0) {
    box.appendChild(h('div', { style: 'color:' + UI_COLORS.textMuted + ';font-size:13px' }, '尚無交易記錄'));
    return;
  }

  for (var i = 0; i < recent.length; i++) {
    var tx = recent[i];
    var item = h('div', { className: 'timeline-item' });
    item.style.cssText = 'padding:8px 0;border-bottom:1px solid ' + UI_COLORS.borderSubtle + ';font-size:13px;display:flex;justify-content:space-between;align-items:center';

    var left = h('span');
    left.innerHTML = '<span style="color:' + UI_COLORS.textMuted + '">' + tx.date + '</span> ' +
                     '<span style="color:' + UI_COLORS.techCyan + '">' + (tx.agent || '') + '</span> ' +
                     (tx.client ? '<span style="color:' + UI_COLORS.textSecondary + '">' + tx.client + '</span>' : '');

    var right = h('span', { style: 'color:' + UI_COLORS.skyBlue + ';font-weight:600' }, fmt(tx.volume) + '萬');

    item.appendChild(left);
    item.appendChild(right);
    box.appendChild(item);
  }
}
