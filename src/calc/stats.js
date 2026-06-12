/**
 * v13 统计聚合模块
 * 
 * 依赖: utils/format.js (toNum), core/constants.js (VENUE_OPTIONS)
 * 
 * 全部纯函数，无副作用，100% 可测试。
 */

// ============================================================================
// 按维度聚合
// ============================================================================

/**
 * 按代理聚合
 * @param {Array} txs - 交易数组
 * @returns {Array} [{ agent, volume, comm, bonus, fund, drawn, undrawn, cash, count }]
 */
function aggregateByAgent(txs) {
  var map = {};
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var agent = tx.agent || '(未指定)';
    if (!map[agent]) {
      map[agent] = { agent: agent, volume: 0, comm: 0, bonus: 0, fund: 0, drawn: 0, undrawn: 0, cash: 0, count: 0 };
    }
    map[agent].volume  += toNum(tx.volume);
    map[agent].comm    += toNum(tx.comm);
    map[agent].bonus   += toNum(tx.bonus);
    map[agent].fund    += toNum(tx.fund);
    map[agent].drawn   += toNum(tx.drawn);
    map[agent].undrawn += toNum(tx.undrawn);
    map[agent].cash    += toNum(tx.cash) || 0;
    map[agent].count   += 1;
  }
  var result = [];
  for (var key in map) {
    result.push(map[key]);
  }
  return result;
}

/**
 * 按地点聚合
 * @param {Array} txs
 * @returns {Array} [{ venue, volume, comm, bonus, fund, drawn, undrawn, cash, count }]
 */
function aggregateByVenue(txs) {
  var map = {};
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var venue = tx.venue || '(未指定)';
    if (!map[venue]) {
      map[venue] = { venue: venue, volume: 0, comm: 0, bonus: 0, fund: 0, drawn: 0, undrawn: 0, cash: 0, count: 0 };
    }
    map[venue].volume  += toNum(tx.volume);
    map[venue].comm    += toNum(tx.comm);
    map[venue].bonus   += toNum(tx.bonus);
    map[venue].fund    += toNum(tx.fund);
    map[venue].drawn   += toNum(tx.drawn);
    map[venue].undrawn += toNum(tx.undrawn);
    map[venue].cash    += toNum(tx.cash) || 0;
    map[venue].count   += 1;
  }
  var result = [];
  for (var key in map) {
    result.push(map[key]);
  }
  return result;
}

/**
 * 按月份聚合
 * @param {Array} txs
 * @returns {Array} [{ month, volume, comm, bonus, fund, drawn, undrawn, cash, count }]
 */
function aggregateByMonth(txs) {
  var map = {};
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var month = (tx.date || '').substring(0, 7);
    if (!month) continue;
    if (!map[month]) {
      map[month] = { month: month, volume: 0, comm: 0, bonus: 0, fund: 0, drawn: 0, undrawn: 0, cash: 0, count: 0 };
    }
    map[month].volume  += toNum(tx.volume);
    map[month].comm    += toNum(tx.comm);
    map[month].bonus   += toNum(tx.bonus);
    map[month].fund    += toNum(tx.fund);
    map[month].drawn   += toNum(tx.drawn);
    map[month].undrawn += toNum(tx.undrawn);
    map[month].cash    += toNum(tx.cash) || 0;
    map[month].count   += 1;
  }
  var result = [];
  for (var key in map) {
    result.push(map[key]);
  }
  result.sort(function(a, b) { return a.month.localeCompare(b.month); });
  return result;
}

/**
 * 按日期聚合 (每日洗码量趋势)
 * @param {Array} txs
 * @param {string} [month] - 指定月份 "YYYY-MM"
 * @returns {Array} [{ date, volume, count }]
 */
function aggregateByDay(txs, month) {
  var map = {};
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    // ★ 防御：跳过 undefined 的墓碑条目
    if (!tx) continue;
    var date = tx.date;
    if (!date) continue;
    if (month && date.indexOf(month) !== 0) continue;
    if (!map[date]) {
      map[date] = { date: date, volume: 0, count: 0 };
    }
    map[date].volume += toNum(tx.volume);
    map[date].count  += 1;
  }
  var result = [];
  for (var key in map) {
    result.push(map[key]);
  }
  result.sort(function(a, b) { return a.date.localeCompare(b.date); });
  return result;
}

/**
 * 代理×地点 交叉聚合 (用于统计页)
 * @param {Array} txs
 * @returns {Array} [{ agent, venue, volume, comm, bonus, fund, drawn, undrawn }]
 */
function aggregateByAgentVenue(txs) {
  var map = {};
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var key = (tx.agent || '') + '|||' + (tx.venue || '');
    if (!map[key]) {
      var parts = key.split('|||');
      map[key] = {
        agent:   parts[0],
        venue:   parts[1],
        volume:  0, comm: 0, bonus: 0, fund: 0, drawn: 0, undrawn: 0
      };
    }
    map[key].volume  += toNum(tx.volume);
    map[key].comm    += toNum(tx.comm);
    map[key].bonus   += toNum(tx.bonus);
    map[key].fund    += toNum(tx.fund);
    map[key].drawn   += toNum(tx.drawn);
    map[key].undrawn += toNum(tx.undrawn);
  }
  var result = [];
  for (var k in map) { result.push(map[k]); }
  return result;
}

// ============================================================================
// 排名
// ============================================================================

/**
 * 代理按洗码量排名 (Top N)
 * @param {Array} txs
 * @param {number} [topN=10]
 * @returns {Array} [{ agent, volume, rank }]
 */
function rankByVolume(txs, topN) {
  if (!topN) topN = 10;
  var agg = aggregateByAgent(txs);
  agg.sort(function(a, b) { return b.volume - a.volume; });
  var result = agg.slice(0, topN);
  for (var i = 0; i < result.length; i++) {
    result[i].rank = i + 1;
  }
  return result;
}

/**
 * 代理按佣金排名
 * @param {Array} txs
 * @param {number} [topN=10]
 * @returns {Array}
 */
function rankByComm(txs, topN) {
  if (!topN) topN = 10;
  var agg = aggregateByAgent(txs);
  agg.sort(function(a, b) { return b.comm - a.comm; });
  var result = agg.slice(0, topN);
  for (var i = 0; i < result.length; i++) {
    result[i].rank = i + 1;
  }
  return result;
}

/**
 * 地点按洗码量排名
 * @param {Array} txs
 * @returns {Array}
 */
function rankVenueByVolume(txs) {
  var agg = aggregateByVenue(txs);
  agg.sort(function(a, b) { return b.volume - a.volume; });
  for (var i = 0; i < agg.length; i++) {
    agg[i].rank = i + 1;
  }
  return agg;
}

// ============================================================================
// KPI 汇总
// ============================================================================

/**
 * 计算 KPI 摘要 (对照档总览页 KPI 卡片)
 * @param {Array} txs
 * @returns {object} { totalVolume, totalComm, totalBonus, totalFund, totalDrawn, totalUndrawn, totalCash, txCount, agentCount }
 */
function calcKPI(txs) {
  var agents = {};
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent) agents[txs[i].agent] = true;
  }

  return {
    totalVolume:  totalVolume(txs),
    totalComm:    totalComm(txs),
    totalBonus:   totalBonus(txs),
    totalFund:    totalFund(txs),
    totalDrawn:   totalDrawn(txs),
    totalUndrawn: totalUndrawn(txs),
    totalCash:    totalCash(txs),
    txCount:      txs.length,
    agentCount:   Object.keys(agents).length,
  };
}

// ============================================================================
// 订房统计
// ============================================================================

/**
 * 订房按月聚合
 * @param {Array} bookings
 * @returns {Array} [{ month, count, totalCost, totalNights }]
 */
function aggregateBookingsByMonth(bookings) {
  var map = {};
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var month = (b.checkIn || b.date || '').substring(0, 7);
    if (!month) continue;
    if (!map[month]) {
      map[month] = { month: month, count: 0, totalCost: 0, totalNights: 0, freeCount: 0, paidCount: 0 };
    }
    map[month].count += 1;
    map[month].totalCost += toNum(b.totalCost);
    map[month].totalNights += toNum(b.nights);
    if (b.status === '免費') {
      map[month].freeCount += 1;
    } else {
      map[month].paidCount += 1;
    }
  }
  var result = [];
  for (var key in map) { result.push(map[key]); }
  result.sort(function(a, b) { return a.month.localeCompare(b.month); });
  return result;
}
