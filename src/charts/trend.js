/**
 * v13 图表模块 - 每日洗码量趋势
 * 依赖: Chart.js CDN, calc/stats.js (aggregateByDay), utils/format.js
 */

var _trendChart = null;

/** 设置 Chart.js 全局 tooltip 暗色主题 */
function _initChartDefaults() {
  if (typeof Chart === 'undefined' || _initChartDefaults._done) return;
  _initChartDefaults._done = true;
  Chart.defaults.plugins.tooltip.backgroundColor = UI_COLORS.bgElevated;
  Chart.defaults.plugins.tooltip.titleColor = UI_COLORS.textPrimary;
  Chart.defaults.plugins.tooltip.bodyColor = UI_COLORS.textSecondary;
  Chart.defaults.plugins.tooltip.borderColor = UI_COLORS.borderSubtle;
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = false;
}

function renderTrendChart(txs, month) {
  if (typeof Chart === 'undefined') return;
  _initChartDefaults();
  var canvas = document.querySelector('#page-overview .chart-full canvas');
  if (!canvas) return;

  var data = aggregateByDay(txs, month || State.get('workingMonth'));
  var chartContainer = canvas.parentElement;
  if (!chartContainer) return;

  // ★ 无数据 → 显示空状态
  if (data.length === 0) {
    canvas.style.display = 'none';
    var emptyEl = chartContainer.querySelector('.chart-empty');
    if (!emptyEl) {
      chartContainer.insertAdjacentHTML('beforeend', '<div class="chart-empty"><svg class="empty-svg" viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);opacity:0.35"><line x1="10" y1="80" x2="110" y2="80" stroke="currentColor" opacity="0.3"/><polyline points="20,80 35,50 50,65 65,30 80,45 95,20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4"/><circle cx="35" cy="50" r="3" fill="currentColor" opacity="0.4"/><circle cx="65" cy="30" r="3" fill="currentColor" opacity="0.4"/><circle cx="95" cy="20" r="3" fill="currentColor" opacity="0.4"/></svg><div class="empty-text">暫無趨勢數據</div><div class="empty-hint">新增交易後此處顯示每日洗碼量趨勢</div></div>');
    } else { emptyEl.style.display = ''; }
    if (window._trendChart) { window._trendChart.destroy(); window._trendChart = null; }
    return;
  }

  // 有数据 → 显示图表
  canvas.style.display = '';
  var existingEmpty = chartContainer.querySelector('.chart-empty');
  if (existingEmpty) existingEmpty.style.display = 'none';

  var labels = [];
  var volumes = [];
  for (var i = 0; i < data.length; i++) {
    labels.push(data[i].date.substring(5));
    volumes.push(data[i].volume);
  }

  if (window._trendChart) window._trendChart.destroy();

  window._trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '洗碼量 (萬)',
        data: volumes,
        borderColor: UI_COLORS.techCyan,
        backgroundColor: hexToRgba(UI_COLORS.techCyan, 0.08),
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: UI_COLORS.techCyan,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      onClick: function(e, elements) {
        if (elements.length > 0) {
          var idx = elements[0].index;
          var date = data[idx] ? data[idx].date : '';
          Events.emit(EVENTS.CHART_CLICK, { type: 'trend', date: date });
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) { return '洗碼量: ' + fmt(ctx.raw) + '萬'; }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: UI_COLORS.textSecondary, font: { size: 11 } },
          grid: { color: UI_COLORS.borderSubtle }
        },
        y: {
          ticks: { color: UI_COLORS.textSecondary, callback: function(v) { return v + '萬'; } },
          grid: { color: UI_COLORS.borderSubtle }
        }
      }
    }
  });
}

function renderRankChart(txs) {
  if (typeof Chart === 'undefined') return;
  var canvas = document.querySelector('#page-overview .ov-two-col canvas');
  if (!canvas) return;

  var ranks = rankByVolume(txs, 10);
  var chartContainer = canvas.parentElement;
  if (!chartContainer) return;

  // ★ 无数据 → 显示空状态
  if (ranks.length === 0) {
    canvas.style.display = 'none';
    var emptyEl = chartContainer.querySelector('.chart-empty');
    if (!emptyEl) {
      chartContainer.insertAdjacentHTML('beforeend', '<div class="chart-empty"><svg class="empty-svg" viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);opacity:0.35"><rect x="25" y="15" width="70" height="60" rx="6" stroke="currentColor" opacity="0.3"/><rect x="35" y="25" width="50" height="8" rx="2" fill="currentColor" opacity="0.2"/><rect x="35" y="38" width="40" height="8" rx="2" fill="currentColor" opacity="0.15"/><rect x="35" y="51" width="45" height="8" rx="2" fill="currentColor" opacity="0.1"/><circle cx="85" cy="29" r="3" fill="currentColor" opacity="0.3"/><circle cx="80" cy="42" r="3" fill="currentColor" opacity="0.25"/><circle cx="82" cy="55" r="3" fill="currentColor" opacity="0.2"/></svg><div class="empty-text">暫無排行數據</div><div class="empty-hint">新增交易後此處顯示代理洗碼量排行</div></div>');
    } else { emptyEl.style.display = ''; }
    if (window._rankChart) { window._rankChart.destroy(); window._rankChart = null; }
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

  if (window._rankChart) window._rankChart.destroy();

  window._rankChart = new Chart(canvas, {
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

function renderRoomChart(bookings, month) {
  var canvas = document.querySelector('#page-room .rm-chart-wrap canvas');
  if (!canvas) return;

  var agg = aggregateBookingsByMonth(bookings);
  if (month) agg = agg.filter(function(a) { return a.month === month; });

  var labels = [];
  var counts = [];
  var freeCounts = [];
  var paidCounts = [];

  for (var i = 0; i < agg.length; i++) {
    labels.push(agg[i].month);
    counts.push(agg[i].count);
    freeCounts.push(agg[i].freeCount);
    paidCounts.push(agg[i].paidCount);
  }

  if (window._roomChart) window._roomChart.destroy();

  window._roomChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '免費',
          data: freeCounts,
          backgroundColor: UI_COLORS.success,
          borderRadius: 4,
        },
        {
          label: '付費',
          data: paidCounts,
          backgroundColor: UI_COLORS.warning,
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, ticks: { color: UI_COLORS.textSecondary }, grid: { display: false } },
        y: { stacked: true, ticks: { color: UI_COLORS.textSecondary }, grid: { color: UI_COLORS.borderSubtle } }
      },
      plugins: {
        legend: {
          labels: { color: UI_COLORS.textSecondary }
        }
      }
    }
  });
}
