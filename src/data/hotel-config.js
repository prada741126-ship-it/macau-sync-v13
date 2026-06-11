/**
 * v13 酒店设定数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 *        calc/filters.js (filterHCConfig)
 * 对照档: 第七节模块20 + 模块21
 * 
 * 事件: emit hcConfig:updated
 */

var PRESET_VERSION = '2';

// ============================================================================
// 预设数据 (对照档模块20)
// 数据来源：用户提供的三张酒店房价图片
// ============================================================================
var PRESET_CONFIG = [
  // ========= 新濠天地 — 摩珀斯 (6) =========
  { casino: '新濠天地', hotel: '摩珀斯', code: 'MPK',   room: '摩珀斯套房(大床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'MPPK',  room: '摩珀斯套房(雙床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'MPT',   room: '摩珀斯豪華套房',         weekday: 2720,  weekend: 3000,  special: 4200,  threshold: 180 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'MCPT',  room: '摩珀斯2房奢房',          weekday: 4200,  weekend: 4500,  special: 6000,  threshold: 500 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'MPS',   room: '摩珀斯3房奢房',          weekday: 6000,  weekend: 6500,  special: 8900,  threshold: 1000 },
  { casino: '新濠天地', hotel: '摩珀斯', code: 'MES',   room: '摩珀斯總統套房',         weekday: 10000, weekend: 11000, special: 13800, threshold: 3000 },

  // ========= 新濠天地 — 頣居 (8) =========
  { casino: '新濠天地', hotel: '頣居',  code: 'NPK',   room: '頣居客房(大床)',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NPKV',  room: '頣居客房(雙床)',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NPQ',   room: '頣居豪華客房',           weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 180 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NPQV',  room: '頣居豪華客房(雙床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 180 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NDS',   room: '頣居套房',               weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 500 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NCDS',  room: '頣居豪華套房',           weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 1000 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NPS',   room: '頣居2房奢房',            weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 3000 },
  { casino: '新濠天地', hotel: '頣居',  code: 'NPSV',  room: '頣居3房奢房',            weekday: 8000,  weekend: 8500,  special: 10000, threshold: 3000 },

  // ========= 新濠影滙 — 明星滙 (6) =========
  { casino: '新濠影滙', hotel: '明星滙', code: 'CRC',   room: '明星滙客房(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'CRT',   room: '明星滙客房(雙床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'CDX',   room: '明星滙豪華客房',         weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 180 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'CDT',   room: '明星滙豪華客房(雙床)',   weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 180 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'CSS',   room: '明星滙套房',             weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 300 },
  { casino: '新濠影滙', hotel: '明星滙', code: 'SDK',   room: '明星滙豪華套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 1000 },

  // ========= 新濠影滙 — 巨星滙 (4) =========
  { casino: '新濠影滙', hotel: '巨星滙', code: 'SDT',   room: '巨星滙套房(雙床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠影滙', hotel: '巨星滙', code: 'STS',   room: '巨星滙豪華客房',         weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 300 },
  { casino: '新濠影滙', hotel: '巨星滙', code: 'SPS',   room: '巨星滙豪華套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 1000 },
  { casino: '新濠影滙', hotel: '巨星滙', code: 'SGS',   room: '巨星滙總統套房',         weekday: 8000,  weekend: 8500,  special: 10000, threshold: 3000 },

  // ========= 新濠影滙 — 映星滙 (7) =========
  { casino: '新濠影滙', hotel: '映星滙',  code: 'EDK',   room: '映星滙客房(大床)',         weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '新濠影滙', hotel: '映星滙',  code: 'EDT',   room: '映星滙客房(雙床)',         weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '新濠影滙', hotel: '映星滙',  code: 'EG1',   room: '映星滙套房',               weekday: 2700,  weekend: 3000,  special: 4200,  threshold: 180 },
  { casino: '新濠影滙', hotel: '映星滙',  code: 'EO1',   room: '映星滙豪華客房',           weekday: 4200,  weekend: 4500,  special: 6900,  threshold: 350 },
  { casino: '新濠影滙', hotel: '映星滙',  code: 'EG2',   room: '映星滙2房奢房',            weekday: 6800,  weekend: 6500,  special: 8000,  threshold: 1000 },
  { casino: '新濠影滙', hotel: '映星滙',  code: 'ES2',   room: '映星滙3房奢房',            weekday: 8000,  weekend: 8500,  special: 10000, threshold: 3000 },
  { casino: '新濠影滙', hotel: '映星滙',  code: 'EP3',   room: '映星滙總統套房',           weekday: 16000, weekend: 16000, special: 18000, threshold: 3000 },

  // ========= 新濠天地 — 君悅 (12) =========
  { casino: '新濠天地', hotel: '君悅',  code: 'KING',  room: '君悅客房(大床)',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠天地', hotel: '君悅',  code: 'TWIN',  room: '君悅客房(雙床)',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '新濠天地', hotel: '君悅',  code: 'DLXX',  room: '君悅豪華客房(大床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 180 },
  { casino: '新濠天地', hotel: '君悅',  code: 'DLXT',  room: '君悅豪華客房(雙床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 180 },
  { casino: '新濠天地', hotel: '君悅',  code: 'CLDK',  room: '君悅角套房(大床)',       weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 350 },
  { casino: '新濠天地', hotel: '君悅',  code: 'CLDT',  room: '君悅角套房(雙床)',       weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 350 },
  { casino: '新濠天地', hotel: '君悅',  code: 'GRSK',  room: '君悅豪華套房',           weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 1000 },
  { casino: '新濠天地', hotel: '君悅',  code: 'GRXS',  room: '君悅行政套房',           weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 3000 },
  { casino: '新濠天地', hotel: '君悅',  code: 'PREM',  room: '君悅總理套房',           weekday: 10000, weekend: 11000, special: 13000, threshold: 3000 },
  { casino: '新濠天地', hotel: '君悅',  code: 'DIPL',  room: '君悅外交套房',           weekday: 15000, weekend: 16500, special: 18600, threshold: 3000 },
  { casino: '新濠天地', hotel: '君悅',  code: 'PRES',  room: '君悅總統套房',           weekday: 20000, weekend: 22000, special: 26000, threshold: 3000 },
  { casino: '新濠天地', hotel: '君悅',  code: 'CHHN',  room: '君悅主席套房',           weekday: 30000, weekend: 32000, special: 36000, threshold: 3000 },

  // ========= 金沙 — 倫敦人名滙 (11) =========
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'R2',    room: '倫敦人名滙客房(大床)',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'RK',    room: '倫敦人名滙客房(雙床)',         weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'V2',    room: '倫敦人名滙豪華客房(大床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'VK',    room: '倫敦人名滙豪華客房(雙床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'LS2',   room: '倫敦人名滙套房(大床)',         weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'LSK',   room: '倫敦人名滙套房(雙床)',         weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'GS2',   room: '倫敦人名滙行政套房',           weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 300 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'GSK',   room: '倫敦人名滙行政套房(雙床)',     weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 300 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'CS2',   room: '倫敦人名滙主席套房',           weekday: 8000,  weekend: 8500,  special: 10000, threshold: 300 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'GC2',   room: '倫敦人名滙總理套房',           weekday: 10000, weekend: 11000, special: 13000, threshold: 300 },
  { casino: '金沙',     hotel: '倫敦人名滙',   code: 'TS',    room: '倫敦人名滙總統套房',           weekday: 15000, weekend: 16000, special: 18000, threshold: 300 },

  // ========= 金沙 — 倫敦人 (7) =========
  { casino: '金沙',     hotel: '倫敦人', code: 'KC',    room: '倫敦人客房(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '金沙',     hotel: '倫敦人', code: 'TC',    room: '倫敦人客房(雙床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 60 },
  { casino: '金沙',     hotel: '倫敦人', code: 'KS',    room: '倫敦人套房(大床)',       weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人', code: 'TS2',   room: '倫敦人套房(雙床)',       weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人', code: 'DBK1',  room: '倫敦人雙床套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 150 },
  { casino: '金沙',     hotel: '倫敦人', code: 'DBKD2', room: '倫敦人2房套房',          weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 300 },
  { casino: '金沙',     hotel: '倫敦人', code: 'DBKQD3',room: '倫敦人3房套房',          weekday: 8000,  weekend: 8500,  special: 10000, threshold: 300 },

  // ========= 金沙 — 御園 (8) =========
  { casino: '金沙',     hotel: '御園',   code: 'CM1',   room: '御園客房(大床)',         weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 150 },
  { casino: '金沙',     hotel: '御園',   code: 'CG1',   room: '御園客房(雙床)',         weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 150 },
  { casino: '金沙',     hotel: '御園',   code: 'CGD1',  room: '御園豪華客房(大床)',     weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙',     hotel: '御園',   code: 'CMD1',  room: '御園豪華客房(雙床)',     weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 150 },
  { casino: '金沙',     hotel: '御園',   code: 'CK2',   room: '御園套房',               weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 300 },
  { casino: '金沙',     hotel: '御園',   code: 'CKD2',  room: '御園2房套房',            weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 300 },
  { casino: '金沙',     hotel: '御園',   code: 'CV3',   room: '御園3房套房',            weekday: 8000,  weekend: 8500,  special: 10000, threshold: 300 },
  { casino: '金沙',     hotel: '御園',   code: 'CVS4',  room: '御園4房套房',            weekday: 10000, weekend: 11000, special: 13000, threshold: 300 },

  // ========= 銀河 — 銀河酒店 (6) =========
  { casino: '銀河',     hotel: '銀河酒店', code: 'GM01',  room: '銀河客房(大床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '銀河',     hotel: '銀河酒店', code: 'GM01T', room: '銀河客房(雙床)',       weekday: 1200,  weekend: 1500,  special: 2200,  threshold: 80 },
  { casino: '銀河',     hotel: '銀河酒店', code: 'GM04',  room: '銀河豪華套房(大床)',   weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 200 },
  { casino: '銀河',     hotel: '銀河酒店', code: 'GM06',  room: '銀河套房',             weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 400 },
  { casino: '銀河',     hotel: '銀河酒店', code: 'GM07',  room: '銀河豪華套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 400 },
  { casino: '銀河',     hotel: '銀河酒店', code: 'GM08',  room: '銀河總統套房',         weekday: 8000,  weekend: 8500,  special: 10000, threshold: 400 },

  // ========= 銀河 — 大倉 (6) =========
  { casino: '銀河',     hotel: '大倉',    code: 'OK01',  room: '大倉客房(大床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河',     hotel: '大倉',    code: 'OK02',  room: '大倉客房(雙床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河',     hotel: '大倉',    code: 'OK03',  room: '大倉豪華套房',         weekday: 2700,  weekend: 3000,  special: 4200,  threshold: 200 },
  { casino: '銀河',     hotel: '大倉',    code: 'OK05',  room: '大倉套房',             weekday: 4200,  weekend: 4500,  special: 6000,  threshold: 400 },
  { casino: '銀河',     hotel: '大倉',    code: 'OK06',  room: '大倉豪華套房',         weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 400 },
  { casino: '銀河',     hotel: '大倉',    code: 'OK07',  room: '大倉總統套房',         weekday: 10000, weekend: 11000, special: 13000, threshold: 400 },

  // ========= 銀河 — 悦榕莊 (5) =========
  { casino: '銀河',     hotel: '悦榕莊',  code: 'BT01',  room: '悦榕莊客房(大床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 80 },
  { casino: '銀河',     hotel: '悦榕莊',  code: 'BT02',  room: '悦榕莊客房(雙床)',     weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 80 },
  { casino: '銀河',     hotel: '悦榕莊',  code: 'BT03',  room: '悦榕莊套房',           weekday: 3000,  weekend: 3200,  special: 4500,  threshold: 200 },
  { casino: '銀河',     hotel: '悦榕莊',  code: 'BT05',  room: '悦榕莊別墅',           weekday: 8000,  weekend: 8500,  special: 10000, threshold: 400 },
  { casino: '銀河',     hotel: '悦榕莊',  code: 'BT06',  room: '悦榕莊海景別墅',       weekday: 10000, weekend: 11000, special: 13000, threshold: 400 },

  // ========= 銀河 — JW萬豪 (6) =========
  { casino: '銀河',     hotel: 'JW萬豪',    code: 'JW01',  room: 'JW萬豪客房(大床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河',     hotel: 'JW萬豪',    code: 'JW02',  room: 'JW萬豪客房(雙床)',       weekday: 1500,  weekend: 1800,  special: 2700,  threshold: 80 },
  { casino: '銀河',     hotel: 'JW萬豪',    code: 'JW03',  room: 'JW萬豪豪華客房',         weekday: 2700,  weekend: 3000,  special: 4200,  threshold: 200 },
  { casino: '銀河',     hotel: 'JW萬豪',    code: 'JW05',  room: 'JW萬豪套房',             weekday: 4200,  weekend: 4500,  special: 6000,  threshold: 200 },
  { casino: '銀河',     hotel: 'JW萬豪',    code: 'JW06',  room: 'JW萬豪行政套房',         weekday: 6000,  weekend: 6500,  special: 8000,  threshold: 200 },
  { casino: '銀河',     hotel: 'JW萬豪',    code: 'JW08',  room: 'JW萬豪總統套房',         weekday: 15000, weekend: 16000, special: 18000, threshold: 200 },

  // ========= 銀河 — 麗絲卡爾登 (5) =========
  { casino: '銀河',     hotel: '麗絲卡爾登', code: 'RC01', room: '麗絲卡爾登客房(大床)',   weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 200 },
  { casino: '銀河',     hotel: '麗絲卡爾登', code: 'RC03', room: '麗絲卡爾登客房(雙床)',   weekday: 1800,  weekend: 2000,  special: 3000,  threshold: 200 },
  { casino: '銀河',     hotel: '麗絲卡爾登', code: 'RC05', room: '麗絲卡爾登套房',         weekday: 4500,  weekend: 5000,  special: 6500,  threshold: 200 },
  { casino: '銀河',     hotel: '麗絲卡爾登', code: 'RC06', room: '麗絲卡爾登豪華套房',     weekday: 8000,  weekend: 8500,  special: 10000, threshold: 200 },
  { casino: '銀河',     hotel: '麗絲卡爾登', code: 'RC07', room: '麗絲卡爾登總統套房',     weekday: 16000, weekend: 16000, special: 18000, threshold: 200 },

  // ========= 永利 — 保留原预设 =========
  { casino: '永利',     hotel: '永利皇宮',   code: 'WL1', room: '標準套房', weekday: 2200, weekend: 2800, special: 3500, threshold: 100 },

  // ========= 上葡京 — 保留原预设 =========
  { casino: '上葡京',   hotel: '上葡京',     code: 'GP1', room: '標準套房', weekday: 1800, weekend: 2200, special: 2800, threshold: 80 },
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
  Store.saveHCPresetVersion(PRESET_VERSION);
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
