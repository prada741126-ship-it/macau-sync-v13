/**
 * v13 CSV 汇出/汇入模块
 * 
 * 依赖: core/state.js, utils/format.js (fmt, toNum, nowStr)
 *        calc/filters.js (filterByMonth)
 * 对照档: 第七节 CSV 相关功能
 */

// ============================================================================
// 交易 CSV 汇出
// ============================================================================

/**
 * 交易数组 → CSV 字符串
 * @param {Array} txs
 * @returns {string}
 */
function txsToCSV(txs) {
  var header = '日期,類型,代理,客戶,地點,洗碼量(萬),碼佣率(%),佣金,碼糧,公基金,已提領,未提領,現金寄放,備註';
  var rows = [header];

  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var row = [
      tx.date || '',
      tx.type === 'cash' ? '現金' : '轉碼',
      csvEscape(tx.agent),
      csvEscape(tx.client),
      csvEscape(tx.venue),
      tx.volume != null ? tx.volume : 0,
      tx.rate != null ? tx.rate : 0,
      tx.comm != null ? tx.comm : 0,
      tx.bonus != null ? tx.bonus : 0,
      tx.fund != null ? tx.fund : 0,
      tx.drawn != null ? tx.drawn : 0,
      tx.undrawn != null ? tx.undrawn : 0,
      tx.cash != null ? tx.cash : 0,
      csvEscape(tx.note),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * 下载 CSV 文件
 * @param {string} csvContent
 * @param {string} filename
 */
function downloadCSV(csvContent, filename) {
  // BOM for Excel 中文兼容
  var BOM = '\uFEFF';
  var blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 汇出交易 CSV
 * @param {string} [month] - 可选指定月份
 */
function exportTxsCSV(month) {
  var txs = month ? filterByMonth(State.get('txs'), month) : State.get('txs');
  var csv = txsToCSV(txs);
  var filename = '交易明細_' + (month || nowStr()) + '.csv';
  downloadCSV(csv, filename);
}

// ============================================================================
// 交易 CSV 汇入
// ============================================================================

/**
 * 解析 CSV 字符串 → 交易数组
 * @param {string} csvText
 * @returns {object} { success, txs: [], errors: [] }
 */
function parseTxsCSV(csvText) {
  var lines = csvText.split('\n');
  if (lines.length < 2) {
    return { success: false, errors: ['CSV 格式无效（至少需要标题行和数据行）'] };
  }

  var txs = [];
  var errors = [];

  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var cols = parseCSVLine(line);
    if (cols.length < 10) {
      errors.push('第 ' + (i + 1) + ' 行列数不足，已跳过');
      continue;
    }

    try {
      var tx = {
        date:   cols[0] || '',
        type:   cols[1] === '現金' ? 'cash' : 'rolling',
        agent:  cols[2] || '',
        client: cols[3] || '',
        venue:  cols[4] || '',
        volume: toNum(cols[5]),
        rate:   toNum(cols[6]),
        comm:   toNum(cols[7]),
        bonus:  toNum(cols[8]),
        fund:   toNum(cols[9]),
        drawn:  toNum(cols[10]),
        undrawn:toNum(cols[11]),
        cash:   toNum(cols[12]),
        note:   cols[13] || '',
      };
      txs.push(tx);
    } catch (e) {
      errors.push('第 ' + (i + 1) + ' 行解析失败: ' + e.message);
    }
  }

  return { success: true, txs: txs, errors: errors };
}

/**
 * 汇入交易 CSV (追加或替换)
 * @param {string} csvText
 * @param {boolean} [replace=false]
 * @returns {object} { success, count, errors }
 */
function importTxsCSV(csvText, replace) {
  var result = parseTxsCSV(csvText);
  if (!result.success) return result;

  var count = importTxs(result.txs, replace);
  return { success: true, count: count, errors: result.errors };
}

// ============================================================================
// 订房 CSV 汇出
// ============================================================================

/**
 * 订房数组 → CSV 字符串
 * @param {Array} bookings
 * @returns {string}
 */
function bookingsToCSV(bookings) {
  var header = '日期,月份,代理,客戶,體系,酒店,房型,入住,退房,天數,單價,轉碼門檻(萬),總費用,狀態,備註';
  var rows = [header];

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var row = [
      b.date || '',
      b.month || '',
      csvEscape(b.agent),
      csvEscape(b.client),
      csvEscape(b.casino),
      csvEscape(b.hotel),
      csvEscape(b.roomType),
      b.checkIn || '',
      b.checkOut || '',
      b.nights || 0,
      b.pricePerNight || 0,
      b.threshold || 0,
      b.totalCost || 0,
      b.status || '',
      csvEscape(b.note),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * 汇出订房 CSV
 * @param {string} [month]
 */
function exportBookingsCSV(month) {
  var bookings = month ? filterBookingsByMonth(State.get('bookings'), month) : State.get('bookings');
  var csv = bookingsToCSV(bookings);
  var filename = '訂房明細_' + (month || nowStr()) + '.csv';
  downloadCSV(csv, filename);
}

/**
 * 解析订房 CSV
 * @param {string} csvText
 * @returns {object}
 */
function parseBookingsCSV(csvText) {
  var lines = csvText.split('\n');
  if (lines.length < 2) {
    return { success: false, errors: ['CSV 格式无效'] };
  }

  var bookings = [];
  var errors = [];

  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var cols = parseCSVLine(line);
    if (cols.length < 11) {
      errors.push('第 ' + (i + 1) + ' 行列数不足');
      continue;
    }

    try {
      var booking = {
        date:          cols[0] || '',
        month:         cols[1] || '',
        agent:         cols[2] || '',
        client:        cols[3] || '',
        casino:        cols[4] || '',
        hotel:         cols[5] || '',
        roomType:      cols[6] || '',
        checkIn:       cols[7] || '',
        checkOut:      cols[8] || '',
        nights:        toNum(cols[9]),
        pricePerNight: toNum(cols[10]),
        threshold:     toNum(cols[11]),
        totalCost:     toNum(cols[12]),
        status:        cols[13] || '付費',
        note:          cols[14] || '',
      };
      bookings.push(booking);
    } catch (e) {
      errors.push('第 ' + (i + 1) + ' 行解析失败');
    }
  }

  return { success: true, bookings: bookings, errors: errors };
}

/**
 * 汇入订房 CSV
 * @param {string} csvText
 * @param {boolean} [replace=false]
 * @returns {object}
 */
function importBookingsCSV(csvText, replace) {
  var result = parseBookingsCSV(csvText);
  if (!result.success) return result;

  if (replace) {
    State.set('bookings', []);
    State.resetNextId('booking', 1);
  }

  var count = 0;
  for (var i = 0; i < result.bookings.length; i++) {
    createBooking(result.bookings[i]);
    count++;
  }

  return { success: true, count: count, errors: result.errors };
}

// ============================================================================
// CSV 工具函数
// ============================================================================

/**
 * CSV 字段转义 (含逗号或引号时加上双引号)
 * @param {string} str
 * @returns {string}
 */
function csvEscape(str) {
  if (!str) return '';
  str = String(str);
  if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * 解析一行 CSV (处理引号内逗号)
 * @param {string} line
 * @returns {Array}
 */
function parseCSVLine(line) {
  var result = [];
  var current = '';
  var inQuotes = false;

  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;  // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
