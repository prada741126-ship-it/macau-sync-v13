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
  if (month) txs = filterByMonth(txs, month);

  // KPI 迷你
  _renderAllKPI(txs);

  // 表格
  _renderAllTable(txs);
}

function _renderAllKPI(txs) {
  var mini = $('#all-kpi-mini');
  if (!mini) return;

  var _totalVol = totalVolume(txs);
  var _totalComm = totalComm(txs);
  var _totalBonus = totalBonus(txs);
  var _totalFund = totalFund(txs);

  mini.innerHTML = '';
  mini.style.cssText = 'display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap';

  var items = [
    { label: TERMS.volume, value: fmt(_totalVol) + '萬', color: UI_COLORS.techCyan },
    { label: TERMS.comm,   value: fmtMoney(_totalComm),  color: UI_COLORS.skyBlue },
    { label: TERMS.bonus,  value: fmtMoney(_totalBonus), color: UI_COLORS.electricViolet },
    { label: TERMS.fund,   value: fmtMoney(_totalFund),  color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var item = h('div');
    item.style.cssText = 'background:' + UI_COLORS.bgElevated + ';padding:10px 16px;border-radius:8px;border:1px solid ' + UI_COLORS.borderSubtle + ';border-left:3px solid ' + items[i].color;
    item.innerHTML = '<div style="font-size:11px;color:' + UI_COLORS.textMuted + ';margin-bottom:4px">' + items[i].label + '</div>' +
                     '<div style="font-size:16px;font-weight:700;color:' + items[i].color + '">' + items[i].value + '</div>';
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
    var tx = txs[i];
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

    // 操作按钮
    var tdBtn = h('td');
    var delBtn = h('button', {
      style: 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px',
      onclick: function(e) {
        e.stopPropagation();
        if (confirm('確定刪除這筆交易？')) {
          deleteTx(tx._fbKey);
          toastCRUDDone();
          renderAll();
        }
      }
    }, '刪除');
    tdBtn.appendChild(delBtn);
    tr.appendChild(tdBtn);

    tbody.appendChild(tr);
  }
}
