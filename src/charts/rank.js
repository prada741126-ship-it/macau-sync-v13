/**
 * v13 图表模块 - 代理洗碼量排行柱状图
 * 依赖: Chart.js CDN, calc/stats.js (rankByVolume), utils/format.js, charts/trend.js (_initChartDefaults)
 */

var _rankChart = null;

function renderRankChart(txs) {
  if (typeof Chart === 'undefined') return;
  if (typeof _initChartDefaults === 'function') _initChartDefaults();
  var canvas = document.querySelector('#page-overview .ov-two-col canvas');
  if (!canvas) return;

  var ranks = rankByVolume(txs, 10);
  var chartContainer = canvas.parentElement;
  if (!chartContainer) return;

  // 无数据 → 显示空状态
  if (ranks.length === 0) {
    canvas.style.display = 'none';
    var emptyEl = chartContainer.querySelector('.chart-empty');
    if (!emptyEl) {
      chartContainer.insertAdjacentHTML('beforeend', '<div class="chart-empty"><svg class="empty-svg" viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);opacity:0.35"><rect x="25" y="15" width="70" height="60" rx="6" stroke="currentColor" opacity="0.3"/><rect x="35" y="25" width="50" height="8" rx="2" fill="currentColor" opacity="0.2"/><rect x="35" y="38" width="40" height="8" rx="2" fill="currentColor" opacity="0.15"/><rect x="35" y="51" width="45" height="8" rx="2" fill="currentColor" opacity="0.1"/><circle cx="85" cy="29" r="3" fill="currentColor" opacity="0.3"/><circle cx="80" cy="42" r="3" fill="currentColor" opacity="0.25"/><circle cx="82" cy="55" r="3" fill="currentColor" opacity="0.2"/></svg><div class="empty-text">暫無排行數據</div><div class="empty-hint">新增交易後此處顯示代理洗碼量排行</div></div>');
    } else { emptyEl.style.display = ''; }
    if (_rankChart) { _rankChart.destroy(); _rankChart = null; }
    return;
  }

  // 有数据 → 显示图表
  canvas.style.display = '';
  var existingEmpty = chartContainer.querySelector('.chart-empty');
  if (existingEmpty) existingEmpty.style.display = 'none';

  var labels = [];
  var volumes = [];
  var colors = [];

  var palette = [UI_COLORS.techCyan, UI_COLORS.skyBlue, UI_COLORS.electricViolet,
                 UI_COLORS.goldSoft, UI_COLORS.success, UI_COLORS.info,
                 UI_COLORS.warning, UI_COLORS.danger, UI_COLORS.cashOrange, UI_COLORS.goldDim];

  for (var i = 0; i < ranks.length; i++) {
    labels.push(ranks[i].agent);
    volumes.push(ranks[i].volume);
    colors.push(palette[i] || UI_COLORS.techCyan);
  }

  if (_rankChart) _rankChart.destroy();

  _rankChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '洗碼量 (萬)',
        data: volumes,
        backgroundColor: colors,
        borderRadius: 6,
        borderWidth: 0,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onClick: function(e, elements) {
        if (elements.length > 0) {
          var idx = elements[0].index;
          var agent = ranks[idx] ? ranks[idx].agent : '';
          Events.emit(EVENTS.CHART_CLICK, { type: 'rank', agent: agent });
        }
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: UI_COLORS.textSecondary, font: { size: 11 } },
          grid: { color: UI_COLORS.borderSubtle }
        },
        y: {
          ticks: { color: UI_COLORS.textPrimary, font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}
