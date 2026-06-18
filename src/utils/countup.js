/**
 * v13 countUp 數字滾動動畫
 * 用法: countUp(el, rawValue, { prefix, suffix, duration })
 *
 * 範例:
 *   countUp(valueEl, 1234567, { suffix: '萬' }) → "1,234,567萬"
 *   countUp(valueEl, 45000, { prefix: '¥' })    → "¥45,000"
 *
 * 機制: easeOutCubic 緩出曲線，600ms 完成
 * 特點: 不依賴任何外部庫，純 requestAnimationFrame
 */

function countUp(el, rawValue, opts) {
  if (!el || rawValue == null) return;

  opts = opts || {};
  var duration = opts.duration || 600;
  var prefix = opts.prefix || '';
  var suffix = opts.suffix || '';
  var decimals = (opts.decimals != null) ? opts.decimals : 0;

  var startTs = null;

  function fmtNum(n) {
    if (decimals > 0) {
      var parts = n.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function tick(ts) {
    if (!startTs) startTs = ts;
    var progress = Math.min((ts - startTs) / duration, 1);
    // easeOutCubic: 1 - (1-t)³
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = rawValue * eased;
    el.textContent = prefix + fmtNum(current) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}
