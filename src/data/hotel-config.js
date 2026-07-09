/**
 * v13 酒店设定数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 *        calc/filters.js (filterHCConfig)
 * 对照档: 第七节模块20 + 模块21
 * 
 * 事件: emit hcConfig:updated
 */

var PRESET_VERSION = '3';

// ============================================================================
// 预设数据 — 参照 Agent 2.0 新版洗碼門檻 (2026-06)
// 数据来源: Agent 2.0 HOTEL_MAP (t290380662002-collab.github.io)
// 门檻值以 Agent 2.0 平日 demand 为基准
// 房价为 v13 原有数据或依房型等级估算
// ============================================================================
var PRESET_CONFIG = [
  // ========= 金沙 — 倫敦人名滙 (名匯) — Agent 2.0新版 (3) =========
  { casino: '金沙', hotel: '倫敦人名滙', code: 'RK',   room: '名匯普通房',           weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '金沙', hotel: '倫敦人名滙', code: 'LS2',  room: '名匯一房一廳',         weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙', hotel: '倫敦人名滙', code: 'N2B',  room: '名匯兩房一廳',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 400 },

  // ========= 金沙 — 御園 — Agent 2.0新版 (2) =========
  { casino: '金沙', hotel: '御園', code: 'CM1',  room: '御園一房一廳',         weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 150 },
  { casino: '金沙', hotel: '御園', code: 'CK2',  room: '御園兩房一廳',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 400 },

  // ========= 金沙 — 倫敦人 (酒店) — Agent 2.0新版 (3) =========
  { casino: '金沙', hotel: '倫敦人', code: 'KC',   room: '路易套房',           weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '金沙', hotel: '倫敦人', code: 'KS',   room: '溫莎套房',           weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 120 },
  { casino: '金沙', hotel: '倫敦人', code: 'TC',   room: '雙床',               weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },

  // ========= 金沙 — 御匯 — Agent 2.0新增 (2) =========
  { casino: '金沙', hotel: '御匯', code: 'TC2',  room: '御匯兩房一廳',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 60 },
  { casino: '金沙', hotel: '御匯', code: 'TPS',  room: '御匯兩房一廳(雙床)',   weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 60 },

  // ========= 新濠天地 — 摩珀斯 — Agent 2.0新版 (7) =========
  { casino: '新濠天地', hotel: '摩珀斯', code: 'PK',   room: '摩珀斯豪華客房(大床)',     weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'PT',   room: '摩珀斯豪華客房(雙床)',     weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'CPK',  room: '摩珀斯行政豪華(大床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 100 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'CPT',  room: '摩珀斯行政豪華(雙床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 100 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'PS',   room: '摩珀斯豪華套房',           weekday: 2720,  weekend: 3000,  special: 4200,  threshold: 120 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'ES',   room: '摩珀斯尊尚套房',           weekday: 4200,  weekend: 4500,  special: 6000,  threshold: 200 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'S1',   room: '摩珀斯尊致套房',           weekday: 6000,  weekend: 6500,  special: 8900,  threshold: 1000 },

  // ========= 新濠天地 — 頣居 — Agent 2.0新版 (5) =========
  { casino: '新濠天地', hotel: '頣居',  code: 'PK_N',  room: '頣居尊尚客房(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠天地', hotel: '頣居',  code: 'PQ',    room: '頣居尊尚雙床',             weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠天地', hotel: '頣居',  code: 'DS',    room: '頣居豪華套房',             weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 120 },
  { casino: '新濠天地', hotel: '頣居',  code: 'PS_N',  room: '頣居尊尚套房',             weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 200 },
  { casino: '新濠天地', hotel: '頣居',  code: 'V1',    room: '頣居套房',                 weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 1000 },

  // ========= 新濠天地 — 君悅 — Agent 2.0新版 (3) =========
  { casino: '新濠天地', hotel: '君悅',  code: 'DLXK',  room: '君悅豪華客房(大床)',       weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 30 },
  { casino: '新濠天地', hotel: '君悅',  code: 'DLX1',  room: '君悅豪華客房(雙床)',       weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 30 },
  { casino: '新濠天地', hotel: '君悅',  code: 'GRSK',  room: '君悅套房(大床)',           weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 50 },

  // ========= 新濠影滙 — 明星滙 — Agent 2.0新版 (3) =========
  { casino: '新濠影滙', hotel: '明星滙', code: 'CRK',   room: '明星滙經典(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 30 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'CRT',   room: '明星滙經典雙床',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 30 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'CDK',   room: '明星滙豪華(大床)',       weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 30 },

  // ========= 新濠影滙 — 巨星滙 — Agent 2.0新版 (3) =========
  { casino: '新濠影滙', hotel: '巨星滙', code: 'SDK',   room: '巨星滙尊貴(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '新濠影滙', hotel: '巨星滙', code: 'SDT',   room: '巨星滙尊貴(雙床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '新濠影滙', hotel: '巨星滙', code: 'SPS',   room: '巨星滙行政套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 200 },

  // ========= 新濠影滙 — 映星滙 — Agent 2.0新版 (4) =========
  { casino: '新濠影滙', hotel: '映星滙', code: 'EDK',   room: '映星滙套房(大床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 60 },
  { casino: '新濠影滙', hotel: '映星滙', code: 'EDT',   room: '映星滙套房(雙床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 60 },
  { casino: '新濠影滙', hotel: '映星滙', code: 'EG1',   room: '映星滙悠然套房',         weekday: 2700,  weekend: 3000,  special: 4200,  threshold: 100 },
  { casino: '新濠影滙', hotel: '映星滙', code: 'ES1',   room: '映星滙華麗套房',         weekday: 4200,  weekend: 4500,  special: 6900,  threshold: 200 },

  // ========= 永利 — 永利皇宮 — Agent 2.0新版 (9) =========
  { casino: '永利', hotel: '永利皇宮', code: 'CRK',   room: '大床',               weekday: 2200,  weekend: 2800,  special: 3500,  threshold: 160 },
  { casino: '永利', hotel: '永利皇宮', code: 'CRT',   room: '雙床',               weekday: 2200,  weekend: 2800,  special: 3500,  threshold: 180 },
  { casino: '永利', hotel: '永利皇宮', code: 'LCRK',  room: '湖景大床',           weekday: 2500,  weekend: 3300,  special: 4500,  threshold: 220 },
  { casino: '永利', hotel: '永利皇宮', code: 'LCRT',  room: '湖景雙床',           weekday: 2500,  weekend: 3300,  special: 4500,  threshold: 240 },
  { casino: '永利', hotel: '永利皇宮', code: 'EXEC',  room: '行政套房',           weekday: 3000,  weekend: 3800,  special: 5200,  threshold: 190 },
  { casino: '永利', hotel: '永利皇宮', code: 'PRS',   room: '珀麗套',             weekday: 3500,  weekend: 4200,  special: 5800,  threshold: 230 },
  { casino: '永利', hotel: '永利皇宮', code: 'PRD',   room: '珀麗雙套',           weekday: 3500,  weekend: 4200,  special: 5800,  threshold: 230 },
  { casino: '永利', hotel: '永利皇宮', code: 'LPRS',  room: '湖景珀麗套',         weekday: 4500,  weekend: 5800,  special: 7800,  threshold: 390 },
  { casino: '永利', hotel: '永利皇宮', code: 'LPRX',  room: '湖景尊貴珀麗套',     weekday: 4500,  weekend: 5800,  special: 7800,  threshold: 390 },

  // ========= 上葡京 — Agent 2.0新版 (4) =========
  { casino: '上葡京', hotel: '老佛爺', code: 'LFK',   room: '上葡京老佛爺',       weekday: 1800,  weekend: 2200,  special: 2800,  threshold: 0 },
  { casino: '上葡京', hotel: '老佛爺', code: 'LFT',   room: '上葡京老佛爺雙床',   weekday: 1800,  weekend: 2200,  special: 2800,  threshold: 0 },
  { casino: '上葡京', hotel: '西塔',   code: 'XTK',   room: '上葡京西塔大床',     weekday: 1800,  weekend: 2200,  special: 2800,  threshold: 0 },
  { casino: '上葡京', hotel: '西塔',   code: 'XTT',   room: '上葡京西塔雙床',     weekday: 1800,  weekend: 2200,  special: 2800,  threshold: 0 },

  // ========= 銀河 — JW萬豪 (萬豪) — Agent 2.0新版 (3) =========
  { casino: '銀河', hotel: 'JW萬豪', code: 'JW01',   room: '萬豪大床',           weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河', hotel: 'JW萬豪', code: 'JW01T',  room: '萬豪雙床',           weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河', hotel: 'JW萬豪', code: 'JW06',   room: '萬豪一房一廳',       weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 200 },

  // ========= 銀河 — 麗絲卡爾登 (麗思) — Agent 2.0新版 (1) =========
  { casino: '銀河', hotel: '麗絲卡爾登', code: 'RC01', room: '麗思一房一廳',       weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 200 },

  // ======== v13保留房型 (Agent 2.0无对应，维持原门檻待核实) ========
  // 銀河 — 銀河酒店 (6)
  { casino: '銀河', hotel: '銀河酒店', code: 'GM01',  room: '銀河客房(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '銀河', hotel: '銀河酒店', code: 'GM01T', room: '銀河客房(雙床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '銀河', hotel: '銀河酒店', code: 'GM04',  room: '銀河豪華套房(大床)',   weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 200 },
  { casino: '銀河', hotel: '銀河酒店', code: 'GM06',  room: '銀河套房',             weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 400 },
  { casino: '銀河', hotel: '銀河酒店', code: 'GM07',  room: '銀河豪華套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 400 },
  { casino: '銀河', hotel: '銀河酒店', code: 'GM08',  room: '銀河總統套房',         weekday: 8000,  weekend: 8500,  special: 10000, threshold: 400 },
  // 銀河 — 大倉 (6)
  { casino: '銀河', hotel: '大倉',    code: 'OK01',  room: '大倉客房(大床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河', hotel: '大倉',    code: 'OK02',  room: '大倉客房(雙床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河', hotel: '大倉',    code: 'OK03',  room: '大倉豪華套房',         weekday: 2700,  weekend: 3000,  special: 4200,  threshold: 200 },
  { casino: '銀河', hotel: '大倉',    code: 'OK05',  room: '大倉套房',             weekday: 4200,  weekend: 4500,  special: 6000,  threshold: 400 },
  { casino: '銀河', hotel: '大倉',    code: 'OK06',  room: '大倉豪華套房',         weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 400 },
  { casino: '銀河', hotel: '大倉',    code: 'OK07',  room: '大倉總統套房',         weekday: 10000, weekend: 11000, special: 13000, threshold: 400 },
  // 銀河 — 悦榕莊 (5)
  { casino: '銀河', hotel: '悦榕莊',  code: 'BT01',  room: '悦榕莊客房(大床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 80 },
  { casino: '銀河', hotel: '悦榕莊',  code: 'BT02',  room: '悦榕莊客房(雙床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 80 },
  { casino: '銀河', hotel: '悦榕莊',  code: 'BT03',  room: '悦榕莊套房',           weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 200 },
  { casino: '銀河', hotel: '悦榕莊',  code: 'BT05',  room: '悦榕莊別墅',           weekday: 8000,  weekend: 8500,  special: 10000, threshold: 400 },
  { casino: '銀河', hotel: '悦榕莊',  code: 'BT06',  room: '悦榕莊海景別墅',       weekday: 10000, weekend: 11000, special: 13000, threshold: 400 },
  // 銀河 — 麗絲卡爾登 保留 (4)
  { casino: '銀河', hotel: '麗絲卡爾登', code: 'RC03', room: '麗絲卡爾登客房(雙床)',   weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 200 },
  { casino: '銀河', hotel: '麗絲卡爾登', code: 'RC05', room: '麗絲卡爾登套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 200 },
  { casino: '銀河', hotel: '麗絲卡爾登', code: 'RC06', room: '麗絲卡爾登豪華套房',     weekday: 8000,  weekend: 8500,  special: 10000, threshold: 200 },
  { casino: '銀河', hotel: '麗絲卡爾登', code: 'RC07', room: '麗絲卡爾登總統套房',     weekday: 16000, weekend: 16000, special: 18000, threshold: 200 },
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
  // ★ Firebase 同步
  try { syncHCConfigToFirebase(entry); } catch(e) { console.error('[hc] createHC sync error:', e); }
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
  // ★ Firebase 同步
  try { syncHCConfigToFirebase(updated); } catch(e) { console.error('[hc] updateHC sync error:', e); }
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
  // ★ 追踪最近删除 + Firebase 墓碑同步
  try { trackRecentlyDeleted('hc', fbKey); } catch(e) { console.error('[hc] trackRecentlyDeleted error:', e); }
  try { removeHCFromFirebase(fbKey); } catch(e) { console.error('[hc] deleteHC sync error:', e); }
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
  Store.saveHCPresetVersion(PRESET_VERSION);
  Events.emit(EVENTS.HC_CONFIG_UPDATED, preset);
  // ★ Firebase 同步：逐笔推送所有预设
  try {
    for (var j = 0; j < preset.length; j++) {
      syncHCConfigToFirebase(preset[j]);
    }
  } catch(e) { console.error('[hc] resetHCToPreset sync error:', e); }
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
