/**
 * v13 格式化与计算工具
 * 
 * 依赖: core/constants.js (TERMS)
 * 影响: data/*, pages/*, charts/*
 * 
 * 对照档: 第七节模块1 + 第十一节核心计算公式
 * 所有纯函数，无副作用，100% 可测试
 */

// ============================================================================
// 日期工具
// ============================================================================

/**
 * 获取今天的 GMT+8 日期字符串
 * @returns {string} "YYYY-MM-DD"
 */
function nowStr() {
  var d = new Date();
  // GMT+8 矫正
  d.setTime(d.getTime() + (8 * 60 * 60 * 1000));
  var y = d.getUTCFullYear();
  var m = String(d.getUTCMonth() + 1).padStart(2, '0');
  var day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

/**
 * 日期字符串 → 周X
 * @param {string} ds - "YYYY-MM-DD"
 * @returns {string} "周一" ~ "周日"
 */
function getDow(ds) {
  var d = new Date(ds + 'T00:00:00+08:00');
  var days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[d.getUTCDay()] || '';
}

/**
 * 获取当前月份字符串
 * @returns {string} "YYYY-MM"
 */
function currentMonth() {
  var d = new Date();
  d.setTime(d.getTime() + (8 * 60 * 60 * 1000));
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
}

/**
 * 从日期字符串提取月份 (YYYY-MM)
 * 支持 "YYYY-MM-DD", "YYYY/MM/DD", "YYYY-M-D", "YYYY/M/D" 等格式
 * @param {string} dateStr
 * @returns {string} "YYYY-MM" 或空字符串
 */
function extractMonth(dateStr) {
  if (!dateStr) return '';
  var parts = String(dateStr).split(/[-\/]/);
  if (parts.length < 2) return '';
  var year = parts[0];
  var month = parts[1];
  if (!year || !month) return '';
  // 确保月份两位数
  if (month.length === 1) month = '0' + month;
  return year + '-' + month;
}

/**
 * 获取月份的第一天
 * @param {string} ym - "YYYY-MM"
 * @returns {string} "YYYY-MM-01"
 */
function monthStart(ym) {
  return ym + '-01';
}

/**
 * 获取月份的最后一天
 * @param {string} ym - "YYYY-MM"
 * @returns {string} "YYYY-MM-DD"
 */
function monthEnd(ym) {
  var parts = ym.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  // 下个月的第 0 天 = 本月最后一天
  var lastDay = new Date(Date.UTC(y, m, 0));
  var day = String(lastDay.getUTCDate()).padStart(2, '0');
  return ym + '-' + day;
}

// ============================================================================
// 数字格式化
// ============================================================================

/**
 * 数字 → 千分位字符串
 * @param {number} n
 * @returns {string} e.g. "1,234,567"
 */
function fmt(n) {
  if (n == null || isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 数字 → 带小数千分位
 * @param {number} n
 * @param {number} [dec=2] 小数位数
 * @returns {string}
 */
function fmtDec(n, dec) {
  if (dec === undefined) dec = 2;
  if (n == null || isNaN(n)) return '0.00';
  return n.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 金额格式化 (¥ 前缀)
 * @param {number} n
 * @returns {string} e.g. "¥1,234,567"
 */
function fmtMoney(n) {
  return '\u00A5' + fmt(n);
}

/**
 * 字符串 → 数字 (去千分位/万字/逗号)
 * @param {string|number} s
 * @returns {number}
 */
function toNum(s) {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  // 移除所有非数字字符（保留小数点、负号）
  var cleaned = String(s).replace(/[^\d.\-]/g, '');
  var n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ============================================================================
// 核心计算公式 (对照档第十一节)
// ============================================================================

/**
 * 佣金 = Math.ceil(洗码量 × 10000 × 码佣率 / 100)
 * @param {number} vol - 洗码量 (万)
 * @param {number} rate - 码佣率 (%)
 * @returns {number} 佣金 (元)
 */
function calcComm(vol, rate) {
  vol = toNum(vol);
  rate = toNum(rate);
  if (!vol || !rate) return 0;
  return Math.ceil(vol * 10000 * rate / 100);
}

/**
 * 公基金 = 佣金 - 码粮
 * @param {number} comm - 佣金
 * @param {number} bonus - 码粮
 * @returns {number}
 */
function calcFund(comm, bonus) {
  comm = toNum(comm);
  bonus = toNum(bonus);
  return comm - bonus;
}

/**
 * 未提领 = max(0, 码粮 - 已提领)
 * @param {number} bonus - 码粮
 * @param {number} drawn - 已提领
 * @returns {number}
 */
function calcUndrawn(bonus, drawn) {
  bonus = toNum(bonus);
  drawn = toNum(drawn);
  return Math.max(0, bonus - drawn);
}

/**
 * 房务总费用 = 天数 × 单价
 * @param {number} nights
 * @param {number} pricePerNight
 * @returns {number}
 */
function calcTotalCost(nights, pricePerNight) {
  nights = toNum(nights);
  pricePerNight = toNum(pricePerNight);
  return nights * pricePerNight;
}

/**
 * 房务天数 = 退房日期 - 入住日期
 * @param {string} checkIn - "YYYY-MM-DD"
 * @param {string} checkOut - "YYYY-MM-DD"
 * @returns {number}
 */
function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  var d1 = new Date(checkIn + 'T00:00:00+08:00');
  var d2 = new Date(checkOut + 'T00:00:00+08:00');
  var diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, diff);
}

// ============================================================================
// 调试日志
// ============================================================================

/**
 * 统一日志输出 (PRODUCTION=false 时输出)
 * @param {string} module - 模块名
 * @param {string} level - 'log'|'warn'|'error'
 * @param {...*} args
 */
function log(module, level, args) {
  if (window.CONFIG && window.CONFIG.PRODUCTION) return;
  var prefix = '[v13:' + module + ']';
  var extra = Array.prototype.slice.call(arguments, 2);
  var method = console[level] || console.log;
  method.apply(console, [prefix].concat(extra));
}
