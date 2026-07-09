/**
 * v13 统计页渲染 (代理×场地聚合)
 * 依赖: calc/stats.js (aggregateByAgentVenue), utils/format.js
 * 对照档: 第七节模块10 renderSummary
 * 
 * 命名空间: 仅导出 window.renderSummary
 */

(function() {

// ★ 排序状态 (改进 #1)
var _summarySortCol = 'volume';   // 默认按洗码量降序
var _summarySortDir = 'desc';
var _summaryTableSortInited = false;

// ★ 搜索状态 (改进 #2)
var _summarySearchQuery = '';
var _summaryToolbarInited = false;

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

  // ★ 搜索框 + 排序表头初始化（仅一次）
  _initSummaryToolbar();
  _initSummaryTableSort();

  // ★ 读取搜索框值
  var searchInput = document.getElementById('summary-search');
  if (searchInput) {
    _summarySearchQuery = searchInput.value || '';
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

/**
 * ★ 改进 #2 — 动态插入搜索工具栏（仅一次）
 */
function _initSummaryToolbar() {
  if (_summaryToolbarInited) return;
  var pageSummary = document.getElementById('page-summary');
  if (!pageSummary) return;
  var tableScroll = pageSummary.querySelector('.table-scroll');
  if (!tableScroll) return;

  var toolbar = h('div', {
    className: 'summary-toolbar',
    style: { marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }
  });
  toolbar.innerHTML =
    '<span class="search-box">' +
    '<input type="text" id="summary-search" placeholder="搜索代理或場地..." style="width:220px" oninput="renderSummary()">' +
    '<button class="search-clear" onclick="document.getElementById(\'summary-search\').value=\'\';renderSummary()" title="清除搜索">✕</button>' +
    '</span>' +
    '<span class="summary-result-count" style="color:var(--text-muted);font-size:13px;"></span>';

  pageSummary.insertBefore(toolbar, tableScroll);
  _summaryToolbarInited = true;
}

/**
 * ★ 改进 #1 — 初始化统计表排序表头点击（仅一次）
 */
function _initSummaryTableSort() {
  if (_summaryTableSortInited) return;
  var ths = document.querySelectorAll('#summary-table th.th-sortable');
  if (!ths.length) return;

  for (var i = 0; i < ths.length; i++) {
    (function(th) {
      th.addEventListener('click', function() {
        var col = th.getAttribute('data-sort');
        if (!col) return;
        if (_summarySortCol === col) {
          _summarySortDir = _summarySortDir === 'asc' ? 'desc' : 'asc';
        } else {
          _summarySortCol = col;
          _summarySortDir = 'desc';
        }
        // 更新 UI 指示器
        var allThs = document.querySelectorAll('#summary-table th.th-sortable');
        for (var j = 0; j < allThs.length; j++) {
          allThs[j].classList.remove('sort-asc', 'sort-desc');
        }
        th.classList.add(_summarySortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        renderSummary();
      });
    })(ths[i]);
  }

  // 初始指示器
  _updateSortIndicator();
  _summaryTableSortInited = true;
}

/** 同步表头排序指示器 */
function _updateSortIndicator() {
  var allThs = document.querySelectorAll('#summary-table th.th-sortable');
  for (var j = 0; j < allThs.length; j++) {
    allThs[j].classList.remove('sort-asc', 'sort-desc');
    var col = allThs[j].getAttribute('data-sort');
    if (col === _summarySortCol) {
      allThs[j].classList.add(_summarySortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  }
}

function _renderSummaryTable(txs) {
  var tbody = document.querySelector('#summary-table tbody');
  if (!tbody) return;

  var data = aggregateByAgentVenue(txs);

  // ★ 改进 #2 — 搜索过滤
  if (_summarySearchQuery) {
    var q = _summarySearchQuery.toLowerCase().trim();
    var filtered = [];
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      if ((d.agent || '').toLowerCase().indexOf(q) !== -1 ||
          (d.venue || '').toLowerCase().indexOf(q) !== -1) {
        filtered.push(d);
      }
    }
    data = filtered;
  }

  // ★ 改进 #1 — 排序
  if (_summarySortCol) {
    data.sort(function(a, b) {
      var va = a[_summarySortCol] || 0;
      var vb = b[_summarySortCol] || 0;
      if (typeof va === 'string' && typeof vb === 'string') {
        return _summarySortDir === 'asc'
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }
      return _summarySortDir === 'asc' ? va - vb : vb - va;
    });
  }

  tbody.innerHTML = '';

  // ★ 改进 #3 — 合计行数据
  var totals = { volume: 0, bonus: 0, drawn: 0, undrawn: 0 };

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    totals.volume  += d.volume  || 0;
    totals.bonus   += d.bonus   || 0;
    totals.drawn   += d.drawn   || 0;
    totals.undrawn += d.undrawn || 0;

    var tr = h('tr');
    var cells = [d.agent, d.venue, fmt(d.volume) + '萬', fmtMoney(d.bonus), fmtMoney(d.drawn), fmtMoney(d.undrawn)];
    for (var j = 0; j < cells.length; j++) {
      var tdAttrs = {};
      if (j >= 2) tdAttrs.class = 'text-right num-mono';
      tr.appendChild(h('td', tdAttrs, cells[j]));
    }
    tbody.appendChild(tr);
  }

  // ★ 改进 #3 — 合计行
  if (data.length > 0) {
    var totalTr = h('tr', { className: 'summary-total-row' });
    var totalCells = [
      { text: '合計', attrs: {} },
      { text: '', attrs: {} },
      { text: fmt(totals.volume) + '萬', attrs: { class: 'text-right num-mono' } },
      { text: fmtMoney(totals.bonus), attrs: { class: 'text-right num-mono' } },
      { text: fmtMoney(totals.drawn), attrs: { class: 'text-right num-mono' } },
      { text: fmtMoney(totals.undrawn), attrs: { class: 'text-right num-mono' } },
    ];
    for (var k = 0; k < totalCells.length; k++) {
      totalTr.appendChild(h('td', totalCells[k].attrs, totalCells[k].text));
    }
    tbody.appendChild(totalTr);
  }

  // ★ 更新结果计数
  var countEl = document.querySelector('.summary-result-count');
  if (countEl) {
    countEl.textContent = data.length > 0
      ? '共 ' + data.length + ' 筆'
      : '無匹配結果';
  }

  // ★ 同步排序指示器（搜索/重渲染后保持）
  _updateSortIndicator();
}

// 导出公开 API
window.renderSummary = renderSummary;

})();
