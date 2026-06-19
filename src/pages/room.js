/**
 * v13 房务系统 (RM 对象)
 * 依赖: core/state.js, data/bookings.js, data/hotel-config.js
 *        utils/format.js, utils/dom.js, calc/finance.js (calcRoomQuota)
 * 对照档: 第七节模块18 (24 方法)
 *
 * 日期下拉函数现由 bridge.js 提供（通用版）：
 *   initDateSels / readDateSels / setDateSels
 */

var RM = {
  bookings: [],
  lastId: 0,
  editingId: null,

  /** 现在日期 */
  nowStr: function() { return nowStr(); },

  /** 格式化 */
  fmt: function(n) { return fmt(n); },

  // ===== 加载/保存 =====
  load: function() {
    RM.bookings = State.get('bookings');
    RM.lastId = State.get('bookingNextId') - 1;
  },
  save: function() {
    State.set('bookings', RM.bookings);
    Store.saveBookings(RM.bookings);
    Store.saveBookingLastId(RM.lastId);
  },

  // ===== 下拉填充 =====
  populateCasinoDropdown: function() {
    var sel = $('#rm-casino');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇體系</option>';
    var config = getAllHC();
    var seen = {};
    for (var i = 0; i < config.length; i++) {
      if (!seen[config[i].casino]) {
        seen[config[i].casino] = true;
        sel.appendChild(h('option', { value: config[i].casino }, config[i].casino));
      }
    }
  },

  populateHotelDropdown: function(casino) {
    var sel = $('#rm-hotel');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇酒店</option>';
    var hotels = getHotelsByCasino(casino);
    for (var i = 0; i < hotels.length; i++) {
      sel.appendChild(h('option', { value: hotels[i] }, hotels[i]));
    }
  },

  populateRoomDropdown: function(casino, hotel) {
    var sel = $('#rm-room');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇房型</option>';
    var rooms = getRoomsByHotel(casino, hotel);
    for (var i = 0; i < rooms.length; i++) {
      var opt = h('option', {
        value: rooms[i].room,
        'data-price': rooms[i].weekday,
        'data-threshold': rooms[i].threshold
      }, rooms[i].room + ' (¥' + rooms[i].weekday + '/晚, 門檻' + rooms[i].threshold + '萬)');
      sel.appendChild(opt);
    }
  },

  populateAgentDropdown: function() {
    var sel = $('#rm-agent');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇代理</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      sel.appendChild(h('option', { value: agents[i] }, agents[i]));
    }
  },

  populateAgentFilter: function() {
    var sel = $('#rm-agent-filter');
    if (!sel) return;
    sel.innerHTML = '<option value="">全部代理</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      sel.appendChild(h('option', { value: agents[i] }, agents[i]));
    }
  },

  // ===== 联动 =====
  onCasinoChange: function() {
    var casino = ($('#rm-casino') || {}).value;
    RM.populateHotelDropdown(casino);
    // 自动选第一间酒店（跳过「選擇酒店」空选项）
    var hotelSel = $('#rm-hotel');
    if (hotelSel && hotelSel.options.length > 1) {
      hotelSel.selectedIndex = 1;
      RM.onHotelChange();
    } else {
      if (hotelSel) hotelSel.value = '';
      if ($('#rm-room')) $('#rm-room').innerHTML = '<option value="">選擇房型</option>';
    }
  },

  onHotelChange: function() {
    var casino = $('#rm-casino').value;
    var hotel = $('#rm-hotel').value;
    RM.populateRoomDropdown(casino, hotel);
  },

  onRoomChange: function() {
    var sel = $('#rm-room');
    if (!sel || !sel.selectedOptions || !sel.selectedOptions[0]) return;
    var opt = sel.selectedOptions[0];
    var price = opt.getAttribute('data-price');
    var threshold = opt.getAttribute('data-threshold');
    if ($('#rm-price')) $('#rm-price').value = price || '';
    if ($('#rm-threshold')) $('#rm-threshold').value = threshold || '';
    RM.updatePrice();
  },

  // ===== 计算 =====
  calcNights: function() {
    // 先从三联动 select 合成日期并写入 hidden input
    var checkIn  = readDateSels('rm-checkin');
    var checkOut = readDateSels('rm-checkout');
    var nights = calcNights(checkIn, checkOut);
    if ($('#rm-nights')) $('#rm-nights').value = nights;
    RM.calcTotal();
  },

  calcTotal: function() {
    var nights = toNum(($('#rm-nights') || {}).value);
    var price = toNum(($('#rm-price') || {}).value);
    if ($('#rm-total')) $('#rm-total').value = nights * price;
    RM.updatePrice();
  },

  updatePrice: function() {
    var threshold = toNum(($('#rm-threshold') || {}).value);
    var statusEl = $('#rm-status');
    if (statusEl) statusEl.value = threshold > 0 ? '免費' : '付費';
  },

  // ===== CRUD =====
  openModal: function(id) {
    RM.editingId = id || null;
    RM.populateCasinoDropdown();
    RM.populateAgentDropdown();

    if (id) {
      // 编辑：先初始化日期下拉，再用订房数据覆盖
      initDateSels('rm-checkin');
      initDateSels('rm-checkout');
      var b = getBookingById(id);
      if (b) {
        RM._fillForm(b);
      }
    } else {
      // 新建：先清空表单，再初始化日期下拉（默认为今天）
      RM._resetForm();
      initDateSels('rm-checkin');
      initDateSels('rm-checkout');
    }

    var modal = $('#rm-modal-bg');
    if (modal) modal.style.display = 'flex';
  },

  closeModal: function() {
    var modal = $('#rm-modal-bg');
    if (modal) modal.style.display = 'none';
    RM.editingId = null;
  },

  saveForm: function() {
    // 先合成日期值到 hidden input
    readDateSels('rm-checkin');
    readDateSels('rm-checkout');

    var data = {
      agent:    ($('#rm-agent') || {}).value,
      client:   ($('#rm-client') || {}).value,
      casino:   ($('#rm-casino') || {}).value,
      hotel:    ($('#rm-hotel') || {}).value,
      roomType: ($('#rm-room') || {}).value,
      checkIn:  ($('#rm-checkin') || {}).value,
      checkOut: ($('#rm-checkout') || {}).value,
      nights:   toNum(($('#rm-nights') || {}).value),
      pricePerNight: toNum(($('#rm-price') || {}).value),
      threshold: toNum(($('#rm-threshold') || {}).value),
      totalCost: toNum(($('#rm-total') || {}).value),
      status:   ($('#rm-status') || {}).value,
      note:     ($('#rm-note') || {}).value,
    };

    if (RM.editingId) {
      var b = getBookingById(RM.editingId);
      if (b) {
        updateBooking(b._fbKey, data);
      }
    } else {
      createBooking(data);
    }

    RM.load();
    RM.closeModal();
    RM.render();
    toastCRUDDone();
  },

  delete: function(id) {
    showConfirm('確定刪除這筆訂房？', function() {
      var b = getBookingById(id);
      if (b) {
        deleteBooking(b._fbKey);
        RM.load();
        RM.render();
        toastCRUDDone();
      }
    });
  },

  // ===== 渲染 =====
  render: function() {
    RM.load();
    var bookings = RM.bookings;

    // 筛选
    var agentFilter = ($('#rm-agent-filter') || {}).value;
    var monthFilter = ($('#rm-month-filter') || {}).value || State.get('workingMonth');

    if (agentFilter) bookings = filterBookingsByAgent(bookings, agentFilter);
    if (monthFilter) bookings = filterBookingsByMonth(bookings, monthFilter);

    RM._renderTable(bookings);
    RM._updateQuota(monthFilter);
  },

  _renderTable: function(bookings) {
    var tbody = document.querySelector('.room-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var tr = h('tr', { onclick: function() { RM.openModal(this._bId); } });
      tr._bId = b.id;
      tr.style.cursor = 'pointer';

      var cells = [
        b.date, b.agent, b.client, b.casino, b.hotel, b.roomType,
        b.checkIn, b.checkOut, b.nights, '¥' + fmt(b.pricePerNight),
        '¥' + fmt(b.totalCost), b.status
      ];

      for (var j = 0; j < cells.length; j++) {
        var tdAttrs = {};
        if (j >= 8 && j <= 10) tdAttrs.class = 'text-right num-mono';
        tr.appendChild(h('td', tdAttrs, String(cells[j])));
      }

      // 操作
      var tdBtn = h('td');
      var delBtn = h('button', {
        style: 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px',
        onclick: function(e) {
          e.stopPropagation();
          RM.delete(this._dId);
        }
      }, '刪');
      delBtn._dId = b.id;
      tdBtn.appendChild(delBtn);
      tr.appendChild(tdBtn);
      tbody.appendChild(tr);
    }
  },

  _updateQuota: function(month) {
    var txs = State.get('txs');
    var quota = calcRoomQuota(RM.bookings, txs, month);

    // 当月订房计数
    var normMonth = month ? month.replace(/\//g, '-') : '';
    var roomCount = 0;
    for (var i = 0; i < RM.bookings.length; i++) {
      var bm = (RM.bookings[i].month || '').replace(/\//g, '-');
      if (!normMonth || bm === normMonth) { roomCount++; }
    }

    // 调试日志
    console.log('[v13:room] _updateQuota month=' + month + ' txs=' + (txs ? txs.length : 0) + ' totalVol=' + quota.totalVolume + ' usedThr=' + quota.usedThreshold + ' rooms=' + roomCount);

    var pct = Math.min(100, Math.max(0, quota.usageRate));
    var el = $('.rm-quota-bar');
    if (el) {
      el.style.width = pct.toFixed(1) + '%';
      // 动态颜色：<50% green, 50-80% yellow, >80% red
      if (pct > 80) {
        el.style.background = 'var(--danger)';
      } else if (pct > 50) {
        el.style.background = 'var(--warning)';
      } else {
        el.style.background = 'var(--success)';
      }
    }

    var rateEl = $('.rm-quota-rate');
    if (rateEl) {
      rateEl.textContent = pct.toFixed(1) + '%';
      if (pct > 80) {
        rateEl.style.color = 'var(--danger)';
      } else if (pct > 50) {
        rateEl.style.color = 'var(--warning)';
      } else {
        rateEl.style.color = 'var(--success)';
      }
    }

    var volEl = $('.rm-quota-volume');
    if (volEl) {
      volEl.textContent = '0萬';
      if (typeof countUp === 'function') countUp(volEl, quota.totalVolume || 0, { suffix: '萬' });
      else volEl.textContent = fmt(quota.totalVolume) + '萬';
    }

    var usedEl = $('.rm-quota-used');
    if (usedEl) {
      usedEl.textContent = '0萬';
      if (typeof countUp === 'function') countUp(usedEl, quota.usedThreshold || 0, { suffix: '萬' });
      else usedEl.textContent = fmt(quota.usedThreshold) + '萬';
    }

    var remEl = $('.rm-quota-rem');
    if (remEl) {
      remEl.textContent = '0萬';
      if (typeof countUp === 'function') countUp(remEl, quota.remainingThreshold || 0, { suffix: '萬' });
      else remEl.textContent = fmt(quota.remainingThreshold) + '萬';
      // 赤字时显示红色
      if (quota.remainingThreshold < 0) {
        remEl.style.color = 'var(--danger)';
      } else {
        remEl.style.color = '';
      }
    }

    var countEl = $('.rm-booking-count');
    if (countEl) {
      countEl.textContent = '0間';
      if (typeof countUp === 'function') countUp(countEl, roomCount || 0, { suffix: '間' });
      else countEl.textContent = roomCount + '間';
    }
  },

  // ===== 辅助 =====
  _fillForm: function(b) {
    var fields = { 'rm-agent': b.agent, 'rm-client': b.client, 'rm-casino': b.casino,
                   'rm-checkin': b.checkIn, 'rm-checkout': b.checkOut,
                   'rm-nights': b.nights, 'rm-price': b.pricePerNight,
                   'rm-threshold': b.threshold, 'rm-total': b.totalCost,
                   'rm-status': b.status, 'rm-note': b.note };
    for (var id in fields) {
      var el = $('#' + id);
      if (el) el.value = fields[id] != null ? fields[id] : '';
    }
    // 日期反填到三联动 select
    setDateSels('rm-checkin',  b.checkIn);
    setDateSels('rm-checkout', b.checkOut);
    // 联动
    RM.populateHotelDropdown(b.casino);
    if ($('#rm-hotel')) $('#rm-hotel').value = b.hotel;
    RM.populateRoomDropdown(b.casino, b.hotel);
    if ($('#rm-room')) $('#rm-room').value = b.roomType;
  },

  _resetForm: function() {
    var ids = ['rm-agent', 'rm-client', 'rm-casino', 'rm-hotel', 'rm-room',
               'rm-checkin', 'rm-checkout', 'rm-nights', 'rm-price',
               'rm-threshold', 'rm-total', 'rm-status', 'rm-note'];
    for (var i = 0; i < ids.length; i++) {
      var el = $('#' + ids[i]);
      if (el) el.value = '';
    }
    // 清空日期三联动
    var dateSels = ['rm-checkin-y','rm-checkin-m','rm-checkin-d','rm-checkout-y','rm-checkout-m','rm-checkout-d'];
    for (var j = 0; j < dateSels.length; j++) {
      var ds = $('#' + dateSels[j]);
      if (ds) ds.value = '';
    }
  },

  // CSV
  exportCSV: function() { exportBookingsCSV(); },
  importCSV: function() { var inp = $('#rm-file-input'); if (inp) inp.click(); },
  handleImport: function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var result = importBookingsCSV(ev.target.result);
      if (result.success) {
        RM.load();
        RM.render();
        showToast('匯入 ' + result.count + ' 筆訂房', 'success');
      }
    };
    reader.readAsText(file, 'UTF-8');
  },

  // 初始化
  init: function() {
    RM.load();
    RM.populateCasinoDropdown();
    RM.populateAgentDropdown();
    RM.populateAgentFilter();
    RM.render();
    Events.on(EVENTS.BOOKINGS_LOADED, function() { RM.load(); RM.render(); });
  }
};

/** 房务标签切换 */
function switchRoomTab(tab, el) {
  // 高亮当前标签
  var tabs = document.querySelectorAll('#page-room .room-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  if (el) el.classList.add('active');

  // 切换面板 (HTML ID 格式: room-tab-xxx, class: room-tab-content)
  var panels = document.querySelectorAll('#page-room .room-tab-content');
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.remove('active');
    panels[j].style.display = 'none';
  }
  var target = document.getElementById('room-tab-' + tab);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
    // 切换到酒店设定时刷新列表
    if (tab === 'config') {
      hcRender();
    }
  }
}

// 全域桥接 (供 HTML onclick)
function rmOpenModal(id)     { RM.openModal(id || null); }
function rmCloseModal()      { RM.closeModal(); }
function rmOnCasinoChange()  { RM.onCasinoChange(); }
function rmOnHotelChange()   { RM.onHotelChange(); }
function rmOnRoomChange()    { RM.onRoomChange(); }
function rmCalcNights()      { RM.calcNights(); }
function rmCalcTotal()       { RM.calcTotal(); }
function rmUpdatePrice()     { RM.updatePrice(); }
function rmSaveForm()        { RM.saveForm(); }
function rmRender()          { RM.render(); }
function rmExportCSV()       { RM.exportCSV(); }
function rmImportCSV()       { RM.importCSV(); }
