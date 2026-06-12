/**
 * v13 订房数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 *        utils/format.js (nowStr, calcNights, calcTotalCost, toNum)
 * 对照档: 第七节模块18 (RM 对象 24 方法)
 * 
 * 事件: emit booking:created, booking:updated, booking:deleted
 */

// ============================================================================
// CRUD
// ============================================================================

/**
 * 归一化日期字符串为 YYYY-MM 格式 (用于 month 字段)
 * 支持 YYYY/MM/DD 和 YYYY-MM-DD 输入
 */
function normalizeMonth(dateStr) {
  if (!dateStr) return nowStr().substring(0, 7); // "YYYY-MM"
  return dateStr.replace(/\//g, '-').substring(0, 7);
}

/**
 * 新增订房
 * @param {object} data
 * @returns {object}
 */
function createBooking(data) {
  var fbKey = generateFbKey();
  var nights = calcNights(data.checkIn, data.checkOut);
  var price = toNum(data.pricePerNight);
  var totalCost = nights * price;

  var booking = {
    id:            State.nextId('booking'),
    _fbKey:        fbKey,
    _createdAt:    Date.now(),
    _updatedAt:    Date.now(),
    date:          data.date || nowStr(),
    month:         normalizeMonth(data.checkIn),
    agent:         data.agent || '',
    client:        data.client || '',
    casino:        data.casino || '',
    hotel:         data.hotel || '',
    roomType:      data.roomType || '',
    checkIn:       data.checkIn || '',
    checkOut:      data.checkOut || '',
    nights:        nights,
    pricePerNight: price,
    threshold:     toNum(data.threshold),
    totalCost:     totalCost,
    status:        data.status || (toNum(data.threshold) > 0 ? '免費' : '付費'),
    note:          data.note || '',
  };

  State.update('bookings', function(arr) {
    arr.push(booking);
    return arr;
  });

  Store.saveBookings(State.get('bookings'));
  Store.saveBookingLastId(booking.id);
  Events.emit(EVENTS.BOOKING_CREATED, booking);
  return booking;
}

/**
 * 编辑订房
 * @param {string} fbKey
 * @param {object} data
 * @returns {object|null}
 */
function updateBooking(fbKey, data) {
  var updated = null;
  State.update('bookings', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._fbKey === fbKey) {
        var b = arr[i];
        if (data.agent != null)         b.agent = data.agent;
        if (data.client != null)        b.client = data.client;
        if (data.casino != null)        b.casino = data.casino;
        if (data.hotel != null)         b.hotel = data.hotel;
        if (data.roomType != null)      b.roomType = data.roomType;
        if (data.checkIn != null)       b.checkIn = data.checkIn;
        if (data.checkOut != null)      b.checkOut = data.checkOut;
        if (data.pricePerNight != null) b.pricePerNight = toNum(data.pricePerNight);
        if (data.threshold != null)     b.threshold = toNum(data.threshold);
        if (data.note != null)          b.note = data.note;
        if (data.status != null)        b.status = data.status;
        // 重算
        b.nights = calcNights(b.checkIn, b.checkOut);
        b.totalCost = b.nights * b.pricePerNight;
        b.month = normalizeMonth(b.checkIn);
        b._updatedAt = Date.now();
        updated = b;
        break;
      }
    }
    return arr;
  });

  if (!updated) return null;
  Store.saveBookings(State.get('bookings'));
  Events.emit(EVENTS.BOOKING_UPDATED, updated);
  return updated;
}

/**
 * 删除订房
 * @param {string} fbKey
 * @returns {object|null}
 */
function deleteBooking(fbKey) {
  var deleted = null;
  State.update('bookings', function(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i]._fbKey === fbKey) {
        deleted = arr[i];
        arr.splice(i, 1);
        break;
      }
    }
    return arr;
  });

  if (!deleted) return null;
  Store.saveBookings(State.get('bookings'));
  Events.emit(EVENTS.BOOKING_DELETED, deleted);
  return deleted;
}

// ============================================================================
// 查询
// ============================================================================

/**
 * 获取指定订房
 * @param {number} id
 * @returns {object|null}
 */
function getBookingById(id) {
  var bookings = State.get('bookings');
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].id === id) return bookings[i];
  }
  return null;
}

/**
 * 获取所有订房
 * @returns {Array}
 */
function getAllBookings() {
  return State.get('bookings').slice();
}
