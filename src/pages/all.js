/**
 * v13 全部交易页渲染
 * 
 * 依赖: core/state.js, calc/filters.js (filterByMonth, sortTxs)
 *        utils/format.js (fmt, fmtMoney, toNum), utils/dom.js ($, h)
 * 对照档: 第七节模块14
 * 
 * 命名空间: 仅导出 renderAll / _allGoToPage（分页 HTML onclick 需全局），其余内部变量私有化
 */

(function() {

// 表格排序状态
var _allSortCol = 'date';   // 默认按日期排序
var _allSortDir = 'desc';   // 默认最新在前
var _allTableSortInited = false;

// ★ 搜索和分页状态
var _allSearchQuery = '';
var _allCurrentPage = 1;
var _allPageSize = 50;  // 每页显示笔数
var _allLastRenderedKey = '';  // 快取最後渲染資料的特徵值，避免重複重建 DOM

/** 初始化全部交易表排序表头点击 */
function _initAllTableSort() {
  var ths = document.querySelectorAll('#all-table th.th-sortable');
  for (var i = 0; i < ths.length; i++) {
    (function(th) {
      th.style.cursor = 'pointer';
      th.addEventListener('click', function() {
        var col = th.getAttribute('data-sort');
        if (!col) return;
        if (_allSortCol === col) {
          _allSortDir = _allSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          _allSortCol = col;
          _allSortDir = 'asc';
        }
        // 更新 UI 指示器
        var allThs = document.querySelectorAll('#all-table th.th-sortable');
        for (var j = 0; j < allThs.length; j++) {
          allThs[j].classList.remove('th-sort-asc', 'th-sort-desc');
        }
        th.classList.add(_allSortDir === 'asc' ? 'th-sort-asc' : 'th-sort-desc');
        renderAll();
      });
    })(ths[i]);
  }
}

/** ★ 搜索过滤交易 */
function _filterTxsBySearch(txs, query) {
  if (!query) return txs;
  var q = query.toLowerCase().trim();
  var results = [];
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    if (!tx) continue;
    // 搜索代理、客户、地点、备注
    var agent = (tx.agent || '').toLowerCase();
    var client = (tx.client || '').toLowerCase();
    var venue = (tx.venue || '').toLowerCase();
    var note = (tx.note || '').toLowerCase();
    if (agent.indexOf(q) !== -1 || client.indexOf(q) !== -1 ||
        venue.indexOf(q) !== -1 || note.indexOf(q) !== -1) {
      results.push(tx);
    }
  }
  return results;
}

function renderAll() {
  var txs = State.get('txs');
  var month = State.get('workingMonth');

  // ★ 读取搜索框
  var searchInput = document.getElementById('all-search');
  var newQuery = searchInput ? searchInput.value : '';
  if (newQuery !== _allSearchQuery) {
    _allSearchQuery = newQuery;
    _allCurrentPage = 1;  // 搜索改变时重置页码
  }

  // ★ 首次初始化排序表头
  if (!_allTableSortInited) { _initAllTableSort(); _allTableSortInited = true; }

  // ★ try-catch 包裹，防止单个渲染阶段崩溃导致页面卡死
  try {
    if (month) txs = filterByMonth(txs, month);
  } catch (e) {
    console.error('[v13:all] filterByMonth 崩溃:', e);
  }

  // ★ 应用搜索过滤
  txs = _filterTxsBySearch(txs, _allSearchQuery);

  // ★ 应用排序
  if (_allSortCol) {
    try { txs = sortTxs(txs, _allSortCol, _allSortDir === 'asc'); } catch (e) { console.error('[v13:all] sort 崩溃:', e); }
  }

  try {
    _renderAllKPI(txs);
  } catch (e) {
    console.error('[v13:all] _renderAllKPI 崩溃:', e);
  }

  try {
    _renderAllTable(txs);
  } catch (e) {
    console.error('[v13:all] _renderAllTable 崩溃:', e);
  }

  try {
    _renderAllPagination(txs);
  } catch (e) {
    console.error('[v13:all] _renderAllPagination 崩溃:', e);
  }
}

function _renderAllKPI(txs) {
  var mini = $('#all-kpi-mini');
  if (!mini) return;

  var _totalVol = totalVolume(txs);
  var _totalComm = totalComm(txs);
  var _totalBonus = totalBonus(txs);
  var _totalFund = totalFund(txs);

  mini.innerHTML = '';

  var items = [
    { label: '📊 ' + TERMS.volume, raw: _totalVol, cuOpts: { suffix: '萬' },       accent: 'cyan',  color: UI_COLORS.techCyan },
    { label: '💰 ' + TERMS.comm,   raw: _totalComm, cuOpts: { prefix: '¥' },         accent: 'blue',  color: UI_COLORS.skyBlue },
    { label: '🎁 ' + TERMS.bonus,  raw: _totalBonus, cuOpts: { prefix: '¥' },        accent: 'violet', color: UI_COLORS.electricViolet },
    { label: '🏦 ' + TERMS.fund,   raw: _totalFund, cuOpts: { prefix: '¥' },        accent: 'gold',  color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var item = h('div', { className: 'kpi-card' });
    item.style.borderLeft = '3px solid ' + items[i].color;
    item.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '" style="font-size:18px">0</div>';
    mini.appendChild(item);
  }

  // ★ countUp 动画
  var vals = mini.querySelectorAll('.kpi-card-value');
  for (var j = 0; j < vals.length; j++) {
    if (items[j] && items[j].raw != null && typeof countUp === 'function') {
      countUp(vals[j], items[j].raw, items[j].cuOpts);
    }
  }
}

function _renderAllTable(txs) {
  var tbody = document.querySelector('#all-table tbody');
  if (!tbody) return;

  var msg = $('#all-msg');

  // ★ 分页
  var totalRows = txs.length;
  var totalPages = Math.ceil(totalRows / _allPageSize) || 1;
  if (_allCurrentPage > totalPages) _allCurrentPage = totalPages;
  var startIdx = (_allCurrentPage - 1) * _allPageSize;
  var endIdx = Math.min(startIdx + _allPageSize, totalRows);
  var pageTxs = txs.slice(startIdx, endIdx);

  // ★ 建立特徵值：排序欄位+方向+搜索詞+頁碼+所有 fx._fbKey 串聯
  var keys = '';
  for (var ki = 0; ki < pageTxs.length; ki++) {
    if (pageTxs[ki]) keys += (pageTxs[ki]._fbKey || '') + '|';
  }
  var renderKey = _allSortCol + ':' + _allSortDir + ':' + _allSearchQuery + ':' + _allCurrentPage + ':' + keys;
  if (renderKey === _allLastRenderedKey) return;  // 資料完全相同，跳過 DOM 重建
  _allLastRenderedKey = renderKey;

  if (totalRows === 0) {
    tbody.innerHTML = '';
    if (msg) msg.style.display = 'block';
    return;
  }
  if (msg) msg.style.display = 'none';

  // ★ 使用 DocumentFragment 批量插入，避免每次 appendChild 觸發 reflow
  var frag = document.createDocumentFragment();
  for (var i = 0; i < pageTxs.length; i++) {
    // ★ 防御：跳过 undefined 的墓碑条目
    if (!pageTxs[i]) continue;
    (function(tx) {
      var tr = h('tr', {
        'data-fbkey': tx._fbKey,
        onclick: function() {
          var key = this.getAttribute('data-fbkey');
          Events.emit('tx:edit:request', key);
        }
      });
      tr.style.cursor = 'pointer';

      // ★ 类型彩色标签 (#28) — 用 DOM 元素避免被 h() 當文字處理
      var typeClass = tx.type === 'cash' ? 'cash' : 'roll';
      var typeLabel = tx.type === 'cash' ? '現金' : '轉碼';
      var typeSpan = document.createElement('span');
      typeSpan.className = 'tx-type-tag ' + typeClass;
      typeSpan.textContent = typeLabel;
      var cells = [
        typeSpan,
        tx.date,
        tx.agent,
        tx.client || '-',
        tx.venue || '-',
        fmtDec(tx.volume, 1) + '萬',
        fmtMoney(tx.comm),
        fmtMoney(tx.bonus),
        fmtMoney(tx.drawn),
        fmtMoney(tx.undrawn),
        tx.note || '-',
      ];

      for (var j = 0; j < cells.length; j++) {
        var tdAttrs = {};
        // 數字欄位: 洗碼量/佣金/碼糧/已提領/未提領 → 右對齊 + 等寬數字
        if (j >= 5 && j <= 9) tdAttrs.class = 'text-right num-mono';
        var td = h('td', tdAttrs, cells[j]);
        tr.appendChild(td);
      }

      // 操作按钮 — 用 IIFE 捕捉当前 tx，避免闭包陷阱
      var fbKey = tx._fbKey;
      var tdBtn = h('td');
      var delBtn = h('button', {
        className: 'btn btn-danger btn-sm'
      }, '刪除');
      delBtn.onclick = (function(key) {
        return function(e) {
          e.stopPropagation();
          console.log('[v13:all] 🗑️ 刪除按鈕點擊, fbKey=' + key);
          showConfirm('確定刪除這筆交易？', function() {
            console.log('[v13:all] 📤 呼叫 deleteTx(' + key + ')...');
            var result = deleteTx(key);
            console.log('[v13:all] deleteTx 返回: ' + (result ? '成功 (' + result._fbKey + ')' : 'null (刪除失敗!)'));
            toastCRUDDone();
            console.log('[v13:all] 🔄 重新渲染 renderAll()...');
            try {
              renderAll();
            } catch (e) {
              console.error('[v13:all] renderAll 崩潰:', e);
              // 数据已删除并持久化，即使渲染崩溃也不会丢失
              console.log('[v13:all] ⚠️ 數據已成功刪除，請手動刷新頁面');
            }
            console.log('[v13:all] ✅ renderAll 完成, 當前 txs 數量: ' + State.get('txs').length);
          });
        };
      })(fbKey);
      tdBtn.appendChild(delBtn);
      tr.appendChild(tdBtn);

      frag.appendChild(tr);  // 加入 Fragment（不觸發 reflow）
    })(pageTxs[i]);
  }

  // ★ 一次性清空並插入（僅觸發 1 次 reflow）
  while (tbody.firstChild) { tbody.removeChild(tbody.firstChild); }
  tbody.appendChild(frag);
}

/** ★ 渲染分页控件 */
function _renderAllPagination(txs) {
  var container = document.getElementById('all-pagination');
  if (!container) return;
  
  var totalRows = txs.length;
  var totalPages = Math.ceil(totalRows / _allPageSize) || 1;
  
  if (totalRows === 0 || totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  var startIdx = (_allCurrentPage - 1) * _allPageSize + 1;
  var endIdx = Math.min(_allCurrentPage * _allPageSize, totalRows);
  
  var html = '<div class="pagination-bar">';
  html += '<span class="page-info">第 ' + startIdx + '-' + endIdx + ' 筆，共 ' + totalRows + ' 筆</span>';
  html += '<div class="page-btns">';
  
  // 上一页
  if (_allCurrentPage > 1) {
    html += '<button class="page-btn" onclick="_allGoToPage(' + (_allCurrentPage - 1) + ')">‹ 上一頁</button>';
  }
  
  // 页码按钮 (显示最多 5 个页码)
  var startPage = Math.max(1, _allCurrentPage - 2);
  var endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
  
  if (startPage > 1) {
    html += '<button class="page-btn" onclick="_allGoToPage(1)">1</button>';
    if (startPage > 2) html += '<span class="page-ellipsis">...</span>';
  }
  
  for (var p = startPage; p <= endPage; p++) {
    if (p === _allCurrentPage) {
      html += '<button class="page-btn active">' + p + '</button>';
    } else {
      html += '<button class="page-btn" onclick="_allGoToPage(' + p + ')">' + p + '</button>';
    }
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += '<span class="page-ellipsis">...</span>';
    html += '<button class="page-btn" onclick="_allGoToPage(' + totalPages + ')">' + totalPages + '</button>';
  }
  
  // 下一页
  if (_allCurrentPage < totalPages) {
    html += '<button class="page-btn" onclick="_allGoToPage(' + (_allCurrentPage + 1) + ')">下一頁 ›</button>';
  }
  
  html += '</div></div>';
  container.innerHTML = html;
}

/** ★ 跳转到指定页 */
function _allGoToPage(page) {
  _allCurrentPage = page;
  renderAll();
  // 滚动到表格顶部
  var table = document.getElementById('all-table');
  if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 导出公开 API — 仅 renderAll（refreshAllViews 调用）与 _allGoToPage（分页 HTML onclick 生成）
window.renderAll = renderAll;
window._allGoToPage = _allGoToPage;

})();
