/**
 * v13 筛选与排序模块
 * 
 * 依赖: utils/format.js (toNum, monthStart, monthEnd), core/constants.js (VENUE_OPTIONS)
 * 
 * 全部纯函数，无副作用，100% 可测试。
 */

// ============================================================================
// 时间筛选
// ============================================================================

/**
 * 按工作月份筛选
 * @param {Array} txs
 * @param {string} month - "YYYY-MM"
 * @returns {Array}
 */
function filterByMonth(txs, month) {
  if (!month) return txs;
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].date.indexOf(month) === 0) {
      result.push(txs[i]);
    }
  }
  return result;
}

/**
 * 按日期范围筛选
 * @param {Array} txs
 * @param {string} dateFrom - "YYYY-MM-DD"
 * @param {string} dateTo - "YYYY-MM-DD"
 * @returns {Array}
 */
function filterByDateRange(txs, dateFrom, dateTo) {
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    var d = txs[i].date;
    if (!d) continue;
    if (dateFrom && d < dateFrom) continue;
    if (dateTo && d > dateTo) continue;
    result.push(txs[i]);
  }
  return result;
}

/**
 * 按年份筛选
 * @param {Array} txs
 * @param {string} year - "YYYY"
 * @returns {Array}
 */
function filterByYear(txs, year) {
  if (!year) return txs;
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].date && txs[i].date.indexOf(year + '-') === 0) {
      result.push(txs[i]);
    }
  }
  return result;
}

/**
 * 时间筛选器封装 (本月/上月/下月/本年/全部)
 * @param {Array} txs
 * @param {object} filter - { type: 'month'|'year'|'all', value: string }
 * @returns {Array}
 */
function filterByTime(txs, filter) {
  if (!filter || filter.type === 'all') return txs;
  if (filter.type === 'year') return filterByYear(txs, filter.value);
  if (filter.type === 'month') return filterByMonth(txs, filter.value);
  return txs;
}

// ============================================================================
// 字段筛选
// ============================================================================

/**
 * 按代理筛选
 * @param {Array} txs
 * @param {string} agent - 代理名 (空=全部)
 * @returns {Array}
 */
function filterByAgent(txs, agent) {
  if (!agent) return txs;
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent === agent) {
      result.push(txs[i]);
    }
  }
  return result;
}

/**
 * 按地点筛选
 * @param {Array} txs
 * @param {string} venue
 * @returns {Array}
 */
function filterByVenue(txs, venue) {
  if (!venue) return txs;
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].venue === venue) {
      result.push(txs[i]);
    }
  }
  return result;
}

/**
 * 按类型筛选
 * @param {Array} txs
 * @param {string} type - 'rolling' | 'cash' (空=全部)
 * @returns {Array}
 */
function filterByType(txs, type) {
  if (!type) return txs;
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].type === type) {
      result.push(txs[i]);
    }
  }
  return result;
}

/**
 * 按洗码量范围筛选
 * @param {Array} txs
 * @param {number} min
 * @param {number} max
 * @returns {Array}
 */
function filterByVolumeRange(txs, min, max) {
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    var v = toNum(txs[i].volume);
    if (min != null && v < min) continue;
    if (max != null && v > max) continue;
    result.push(txs[i]);
  }
  return result;
}

/**
 * 关键词搜索 (搜索代理、客户、备注、地点)
 * @param {Array} txs
 * @param {string} keyword
 * @returns {Array}
 */
function searchTxs(txs, keyword) {
  if (!keyword) return txs;
  var kw = keyword.toLowerCase();
  var result = [];
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var searchStr = [
      tx.agent || '',
      tx.client || '',
      tx.note || '',
      tx.venue || '',
      tx.date || '',
    ].join(' ').toLowerCase();
    if (searchStr.indexOf(kw) >= 0) {
      result.push(tx);
    }
  }
  return result;
}

// ============================================================================
// 组合筛选
// ============================================================================

/**
 * 多条件组合筛选
 * @param {Array} txs
 * @param {object} criteria - { month, agent, venue, type, keyword, dateFrom, dateTo, volMin, volMax }
 * @returns {Array}
 */
function filterTxs(txs, criteria) {
  if (!criteria) return txs;
  var result = txs;

  if (criteria.month)    result = filterByMonth(result, criteria.month);
  if (criteria.dateFrom || criteria.dateTo) result = filterByDateRange(result, criteria.dateFrom, criteria.dateTo);
  if (criteria.agent)    result = filterByAgent(result, criteria.agent);
  if (criteria.venue)    result = filterByVenue(result, criteria.venue);
  if (criteria.type)     result = filterByType(result, criteria.type);
  if (criteria.keyword)  result = searchTxs(result, criteria.keyword);
  if (criteria.volMin != null || criteria.volMax != null) result = filterByVolumeRange(result, criteria.volMin, criteria.volMax);

  return result;
}

// ============================================================================
// 排序
// ============================================================================

/**
 * 单列排序
 * @param {Array} txs
 * @param {string} col - 列名
 * @param {boolean} [asc=true] - 升序
 * @returns {Array} 新数组 (不修改原数组)
 */
function sortTxs(txs, col, asc) {
  var result = txs.slice();
  var numericCols = { volume:1, rate:1, comm:1, bonus:1, drawn:1, undrawn:1, fund:1, cash:1, id:1, nights:1, totalCost:1, pricePerNight:1, threshold:1 };
  var dir = asc ? 1 : -1;

  result.sort(function(a, b) {
    var va = a[col];
    var vb = b[col];
    if (numericCols[col]) {
      va = toNum(va);
      vb = toNum(vb);
      return (va - vb) * dir;
    }
    // 字符串排序
    va = (va || '').toString();
    vb = (vb || '').toString();
    return va.localeCompare(vb) * dir;
  });

  return result;
}

/**
 * 多列排序 (先按 col1, 再按 col2)
 * @param {Array} txs
 * @param {Array} sortDefs - [{ col, asc }, ...]
 * @returns {Array}
 */
function sortTxsMulti(txs, sortDefs) {
  var result = txs.slice();
  result.sort(function(a, b) {
    for (var i = 0; i < sortDefs.length; i++) {
      var def = sortDefs[i];
      var va = a[def.col];
      var vb = b[def.col];
      var cmp = 0;
      if (typeof va === 'number') {
        cmp = va - vb;
      } else {
        cmp = (va || '').toString().localeCompare((vb || '').toString());
      }
      if (cmp !== 0) {
        return def.asc ? cmp : -cmp;
      }
    }
    return 0;
  });
  return result;
}

// ============================================================================
// 订房筛选
// ============================================================================

/**
 * 订房按体系筛选
 * @param {Array} bookings
 * @param {string} casino
 * @returns {Array}
 */
function filterBookingsByCasino(bookings, casino) {
  if (!casino) return bookings;
  var result = [];
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].casino === casino) result.push(bookings[i]);
  }
  return result;
}

/**
 * 订房按酒店筛选
 * @param {Array} bookings
 * @param {string} hotel
 * @returns {Array}
 */
function filterBookingsByHotel(bookings, hotel) {
  if (!hotel) return bookings;
  var result = [];
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].hotel === hotel) result.push(bookings[i]);
  }
  return result;
}

/**
 * 订房按月份筛选
 * @param {Array} bookings
 * @param {string} month - "YYYY-MM"
 * @returns {Array}
 */
function filterBookingsByMonth(bookings, month) {
  if (!month) return bookings;
  var result = [];
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].month === month) result.push(bookings[i]);
  }
  return result;
}

// ============================================================================
// 酒店设定筛选
// ============================================================================

/**
 * 酒店设定筛选
 * @param {Array} hcConfig
 * @param {object} criteria - { casino, hotel, keyword }
 * @returns {Array}
 */
function filterHCConfig(hcConfig, criteria) {
  if (!criteria) return hcConfig;
  var result = hcConfig;
  if (criteria.casino) {
    result = result.filter(function(h) { return h.casino === criteria.casino; });
  }
  if (criteria.hotel) {
    result = result.filter(function(h) { return h.hotel === criteria.hotel; });
  }
  if (criteria.keyword) {
    var kw = criteria.keyword.toLowerCase();
    result = result.filter(function(h) {
      return (h.hotel + h.casino + h.room + h.code).toLowerCase().indexOf(kw) >= 0;
    });
  }
  return result;
}
