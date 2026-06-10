/**
 * v13 酒店设定数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 *        calc/filters.js (filterHCConfig)
 * 对照档: 第七节模块20 + 模块21
 * 
 * 事件: emit hcConfig:updated
 */

// ============================================================================
// 预设数据 (对照档模块20)
// ============================================================================
var PRESET_CONFIG = [
  { casino: '新濠天地', hotel: '摩柏斯',    code: 'KP1', room: '標準套房', weekday: 2000, weekend: 2500, special: 3000, threshold: 80 },
  { casino: '新濠天地', hotel: '摩柏斯',    code: 'KP2', room: '豪華套房', weekday: 2800, weekend: 3500, special: 4200, threshold: 120 },
  { casino: '新濠影滙', hotel: '新濠影滙',  code: 'ST1', room: '標準房',   weekday: 1500, weekend: 2000, special: 2500, threshold: 60 },
  { casino: '金沙',     hotel: '威尼斯人',  code: 'VN1', room: '標準套房', weekday: 1800, weekend: 2200, special: 2800, threshold: 80 },
  { casino: '金沙',     hotel: '巴黎人',    code: 'PR1', room: '標準套房', weekday: 1600, weekend: 2000, special: 2500, threshold: 70 },
  { casino: '銀河',     hotel: '銀河酒店',  code: 'GL1', room: '標準套房', weekday: 2000, weekend: 2500, special: 3000, threshold: 100 },
  { casino: '永利',     hotel: '永利澳門',  code: 'WL1', room: '標準套房', weekday: 2200, weekend: 2800, special: 3500, threshold: 100 },
  { casino: '上葡京',   hotel: '上葡京',    code: 'GP1', room: '標準套房', weekday: 1800, weekend: 2200, special: 2800, threshold: 80 },
];

// ============================================================================
// CRUD
// ============================================================================

/**
 * 新增酒店设定
 * @param {object} data
 * @returns {object}
 */
function createHC(data) {
  var entry = {
    _fbKey:    generateFbKey(),
    id:        State.nextId('hc'),
    casino:    data.casino || '',
    hotel:     data.hotel || '',
    code:      data.code || '',
    room:      data.room || '',
    weekday:   toNum(data.weekday),
    weekend:   toNum(data.weekend),
    special:   toNum(data.special),
    threshold: toNum(data.threshold),
  };

  State.update('hotelConfig', function(arr) {
    arr.push(entry);
    return arr;
  });

  Store.saveHCConfig(State.get('hotelConfig'));
  Events.emit(EVENTS.HC_CONFIG_UPDATED, State.get('hotelConfig'));
  return entry;
}

/**
 * 编辑酒店设定
 * @param {string} fbKey
 * @param {object} data
 * @returns {object|null}
 */
function updateHC(fbKey, data) {
  var updated = null;
  State.update('hotelConfig', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._fbKey === fbKey) {
        if (data.casino != null)    arr[i].casino = data.casino;
        if (data.hotel != null)     arr[i].hotel = data.hotel;
        if (data.code != null)      arr[i].code = data.code;
        if (data.room != null)      arr[i].room = data.room;
        if (data.weekday != null)   arr[i].weekday = toNum(data.weekday);
        if (data.weekend != null)   arr[i].weekend = toNum(data.weekend);
        if (data.special != null)   arr[i].special = toNum(data.special);
        if (data.threshold != null) arr[i].threshold = toNum(data.threshold);
        updated = arr[i];
        break;
      }
    }
    return arr;
  });

  if (!updated) return null;
  Store.saveHCConfig(State.get('hotelConfig'));
  Events.emit(EVENTS.HC_CONFIG_UPDATED, State.get('hotelConfig'));
  return updated;
}

/**
 * 删除酒店设定
 * @param {string} fbKey
 * @returns {object|null}
 */
function deleteHC(fbKey) {
  var deleted = null;
  State.update('hotelConfig', function(arr) {
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
  Store.saveHCConfig(State.get('hotelConfig'));
  Events.emit(EVENTS.HC_CONFIG_UPDATED, State.get('hotelConfig'));
  return deleted;
}

/**
 * 重置为预设数据
 */
function resetHCToPreset() {
  // 深度复制预设
  var preset = JSON.parse(JSON.stringify(PRESET_CONFIG));
  for (var i = 0; i < preset.length; i++) {
    preset[i]._fbKey = generateFbKey();
    preset[i].id = i + 1;
  }
  State.set('hotelConfig', preset);
  State.resetNextId('hc', preset.length + 1);
  Store.saveHCConfig(preset);
  Events.emit(EVENTS.HC_CONFIG_UPDATED, preset);
  return preset.length;
}

/**
 * 获取所有酒店设定
 * @returns {Array}
 */
function getAllHC() {
  return State.get('hotelConfig').slice();
}

/**
 * 获取指定体系的酒店列表
 * @param {string} casino
 * @returns {Array}
 */
function getHotelsByCasino(casino) {
  var config = State.get('hotelConfig');
  var hotels = {};
  for (var i = 0; i < config.length; i++) {
    if (config[i].casino === casino) {
      hotels[config[i].hotel] = true;
    }
  }
  return Object.keys(hotels);
}

/**
 * 获取指定酒店的房型列表
 * @param {string} casino
 * @param {string} hotel
 * @returns {Array}
 */
function getRoomsByHotel(casino, hotel) {
  var config = State.get('hotelConfig');
  var result = [];
  for (var i = 0; i < config.length; i++) {
    if (config[i].casino === casino && config[i].hotel === hotel) {
      result.push(config[i]);
    }
  }
  return result;
}
