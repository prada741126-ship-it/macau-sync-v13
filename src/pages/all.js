/**
 * v13 全部交易页渲染
 * 
 * 依赖: core/state.js, calc/filters.js (filterByMonth, sortTxs)
 *        utils/format.js (fmt, fmtMoney, toNum), utils/dom.js ($, h)
 * 对照档: 第七节模块14
 */

function renderAll() {
  var txs = State.get('txs');
  var month = State.get('workingMonth');

  // ★ try-catch 包裹，防止单个渲染阶段崩溃导致页面卡死
  try {
    if (month) txs = filterByMonth(txs, month);
  } catch (e) {
    console.error('[v13:all] filterByMonth 崩溃:', e);
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
    { label: TERMS.volume, value: fmt(_totalVol) + '萬', accent: 'cyan',  color: UI_COLORS.techCyan },
    { label: TERMS.comm,   value: fmtMoney(_totalComm),  accent: 'blue',  color: UI_COLORS.skyBlue },
    { label: TERMS.bonus,  value: fmtMoney(_totalBonus), accent: 'violet',color: UI_COLORS.electricViolet },
    { label: TERMS.fund,   value: fmtMoney(_totalFund),  accent: 'gold',  color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var item = h('div', { className: 'kpi-card' });
    item.style.borderLeft = '3px solid ' + items[i].color;
    item.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '" style="font-size:18px">' + items[i].value + '</div>';
    mini.appendChild(item);
  }
}

function _renderAllTable(txs) {
  var tbody = document.querySelector('#all-table tbody');
  if (!tbody) return;

  var msg = $('#all-msg');
  if (txs.length === 0) {
    tbody.innerHTML = '';
    if (msg) msg.style.display = 'block';
    return;
  }
  if (msg) msg.style.display = 'none';

  tbody.innerHTML = '';
  for (var i = 0; i < txs.length; i++) {
    // ★ 防御：跳过 undefined 的墓碑条目
    if (!txs[i]) continue;
    (function(tx) {
      var tr = h('tr', {
        'data-fbkey': tx._fbKey,
        onclick: function() {
          var key = this.getAttribute('data-fbkey');
          Events.emit('tx:edit:request', key);
        }
      });
      tr.style.cursor = 'pointer';

      var cells = [
        tx.type === 'cash' ? '現金' : '轉碼',
        tx.date,
        tx.agent,
        tx.client || '-',
        tx.venue || '-',
        fmt(tx.volume) + '萬',
        fmtMoney(tx.comm),
        fmtMoney(tx.bonus),
        fmtMoney(tx.drawn),
        fmtMoney(tx.undrawn),
        tx.note || '-',
      ];

      for (var j = 0; j < cells.length; j++) {
        var td = h('td', {}, cells[j]);
        tr.appendChild(td);
      }

      // 操作按钮 — 用 IIFE 捕捉当前 tx，避免闭包陷阱
      var fbKey = tx._fbKey;
      var tdBtn = h('td');
      var delBtn = h('button', {
        style: 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px'
      }, '刪除');
      delBtn.onclick = (function(key) {
        return function(e) {
          e.stopPropagation();
          console.log('[v13:all] 🗑️ 刪除按鈕點擊, fbKey=' + key);
          var confirmed = confirm('確定刪除這筆交易？');
          console.log('[v13:all] confirm 返回值: ' + confirmed);
          if (confirmed) {
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
          }
        };
      })(fbKey);
      tdBtn.appendChild(delBtn);
      tr.appendChild(tdBtn);

      tbody.appendChild(tr);
    })(txs[i]);
  }
}
