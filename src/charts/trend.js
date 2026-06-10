/**
 * v13 图表模块 - 每日洗码量趋势
 * 依赖: Chart.js CDN, calc/stats.js (aggregateByDay), utils/format.js
 */

var _trendChart = null;

function renderTrendChart(txs, month) {
  var canvas = document.querySelector('#page-overview .chart-full canvas');
  if (!canvas) return;

  var data = aggregateByDay(txs, month || State.get('workingMonth'));

  var labels = [];
  var volumes = [];
  for (var i = 0; i < data.length; i++) {
    labels.push(data[i].date.substring(5)); // MM-DD
    volumes.push(data[i].volume);
  }

  if (_trendChart) _trendChart.destroy();

  _trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '洗碼量 (萬)',
        data: volumes,
        borderColor: UI_COLORS.techCyan,
        backgroundColor: 'rgba(0,212,255,0.08)',
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
  var canvas = document.querySelector('#page-overview .ov-two-col canvas');
  if (!canvas) return;

  var ranks = rankByVolume(txs, 10);

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
