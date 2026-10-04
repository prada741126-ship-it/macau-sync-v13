/**
 * v13 自动回归测试
 * 
 * 覆盖: 格式化 / 计算 / 筛选 / CRUD / 数据结构
 * 目标: 64+ 测试用例，全 PASS 才允许部署
 */

var TESTS_PASSED = 0;
var TESTS_FAILED = 0;
var TESTS_TOTAL = 0;

function test(name, fn) {
  TESTS_TOTAL++;
  try {
    fn();
    TESTS_PASSED++;
    console.log('  ✓', name);
  } catch (e) {
    TESTS_FAILED++;
    console.error('  ✗', name, '—', e.message);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error((msg || '') + ' Expected: ' + expected + ', Got: ' + actual);
  }
}

// Password rotation: exercise the shipped validator and legacy ciphertext paths.
console.log('\n--- auth rotation ---');
var _testCrypto = require('crypto');
var _testFs = require('fs');
var _testPath = require('path');
var _nextPassword = Buffer.from('WlptbTI4MzE=', 'base64').toString();
var _oldPassword = Buffer.from('bWFjYXU4ODg=', 'base64').toString();
var _oldHash = _testCrypto.createHash('sha256').update(_oldPassword).digest('hex');
var _newHash = _testCrypto.createHash('sha256').update(_nextPassword).digest('hex');
window.CryptoJS = {
  SHA256: function(value) { return { toString: function() { return _testCrypto.createHash('sha256').update(value).digest('hex'); } }; },
  AES: {
    encrypt: function(json, key) { return { toString: function() { return Buffer.from(JSON.stringify({ key: key, json: json })).toString('base64'); } }; },
    decrypt: function(ciphertext, key) { return { toString: function() { var parsed = JSON.parse(Buffer.from(ciphertext, 'base64').toString()); return parsed.key === key ? parsed.json : 'garbled'; } }; }
  },
  enc: { Utf8: {} }
};

test('new password passes while previous password fails', function() {
  assertEqual(APP.PWD_HASH, _newHash);
  assert(verifyPassword(_nextPassword));
  assert(!verifyPassword(_oldPassword));
});

test('fallback validator uses the same new password', function() {
  var template = _testFs.readFileSync(_testPath.join(__dirname, '..', 'template.html'), 'utf8');
  var encoded = template.match(/var _v13_APP_PWD = '([^']+)'/);
  assert(encoded, 'fallback verifier missing');
  assert(Buffer.from(encoded[1], 'base64').toString() === _nextPassword, 'fallback password mismatch');
});

test('fallback entry rejects old input and accepts new input', function() {
  var template = _testFs.readFileSync(_testPath.join(__dirname, '..', 'template.html'), 'utf8');
  var start = template.indexOf('var _v13_APP_PWD');
  window.atob = function(value) { return Buffer.from(value, 'base64').toString('binary'); };
  window.eval(template.slice(start, template.indexOf('</script>', start)));
  assert(window._v13b64d('WlptbTI4MzE=') === _nextPassword, 'fallback decoder mismatch');
  var input = document.createElement('input');
  input.id = 'pw-input';
  document.body.appendChild(input);
  var error = document.createElement('div');
  error.id = 'pw-error';
  document.body.appendChild(error);
  var overlay = document.createElement('div');
  overlay.id = 'pw-overlay';
  document.body.appendChild(overlay);
  input.value = _oldPassword;
  window._v13LoginFallback();
  assertEqual(sessionStorage.getItem('macau_auth'), null);
  input.value = _nextPassword;
  window._v13LoginFallback();
  assert(sessionStorage.getItem('macau_auth') === APP.AUTH_TOKEN, 'fallback did not authenticate: ' + error.textContent);
  logout();
  input.remove(); error.remove(); overlay.remove();
});

test('old remembered login and session are refused', function() {
  localStorage.setItem(STORAGE_KEYS.AUTH, '1');
  sessionStorage.setItem('macau_auth', '1');
  sessionStorage.setItem('_pw', _oldPassword);
  assert(!autoLogin());
  assertEqual(sessionStorage.getItem('macau_auth'), null);
  assertEqual(sessionStorage.getItem('_pw'), null);
  assertEqual(localStorage.getItem(STORAGE_KEYS.AUTH), null);
});

test('current remembered login can resume', function() {
  Store.saveAuth(APP.AUTH_TOKEN);
  assert(autoLogin());
  assertEqual(sessionStorage.getItem('macau_auth'), APP.AUTH_TOKEN);
  assertEqual(sessionStorage.getItem('_pw'), APP.PWD_HASH);
  logout();
});

test('legacy encrypted records load and new writes use new key', function() {
  checkCrypto();
  var txs = [{ id: 1 }];
  var fund = [{ id: 2 }];
  var wallets = { agent: [{ id: 3 }] };
  localStorage.setItem(STORAGE_KEYS.DATA, 'ENC:' + window.CryptoJS.AES.encrypt(JSON.stringify(txs), _oldHash).toString());
  localStorage.setItem(STORAGE_KEYS.FUND, 'ENC:' + window.CryptoJS.AES.encrypt(JSON.stringify(fund), _oldHash).toString());
  localStorage.setItem(STORAGE_KEYS.AGENT_WALLETS, 'ENC:' + window.CryptoJS.AES.encrypt(JSON.stringify(wallets), _oldHash).toString());
  assertEqual(Store.loadTxs()[0].id, 1);
  assertEqual(Store.loadFund()[0].id, 2);
  assertEqual(Store.loadWallets().agent[0].id, 3);
  Store.saveTxs(txs);
  Store.saveFund(fund);
  Store.saveWallets(wallets);
  var encrypted = [STORAGE_KEYS.DATA, STORAGE_KEYS.FUND, STORAGE_KEYS.AGENT_WALLETS];
  encrypted.forEach(function(key) {
    var raw = localStorage.getItem(key);
    assert(raw.indexOf('ENC:') === 0);
    assert(window.CryptoJS.AES.decrypt(raw.slice(4), _newHash).toString());
    assertEqual(JSON.parse(Buffer.from(raw.slice(4), 'base64').toString()).key, _newHash);
  });
});

// ============================================================================
// 格式化工具测试
// ============================================================================

console.log('\n--- utils/format.js ---');

test('fmt(0) → "0"', function() {
  assertEqual(fmt(0), '0');
});

test('fmt(1234567) → "1,234,567"', function() {
  assertEqual(fmt(1234567), '1,234,567');
});

test('fmt(1000) → "1,000"', function() {
  assertEqual(fmt(1000), '1,000');
});

test('fmt(null) → "0"', function() {
  assertEqual(fmt(null), '0');
});

test('toNum("1,234") → 1234', function() {
  assertEqual(toNum('1,234'), 1234);
});

test('toNum("") → 0', function() {
  assertEqual(toNum(''), 0);
});

test('toNum(456) → 456', function() {
  assertEqual(toNum(456), 456);
});

test('nowStr() 格式 YYYY-MM-DD', function() {
  var s = nowStr();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(s), 'Invalid format: ' + s);
});

test('getDow 返回周X格式', function() {
  var dow = getDow('2026-06-10');
  assert(/^周[一二三四五六日]$/.test(dow), 'Invalid dow: ' + dow);
});

test('extractMonth("2026-06-15") → "2026-06"', function() {
  assertEqual(extractMonth('2026-06-15'), '2026-06');
});

test('extractMonth("2026/06/15") → "2026-06"', function() {
  assertEqual(extractMonth('2026/06/15'), '2026-06');
});

test('extractMonth("2026-6-15") → "2026-06"', function() {
  assertEqual(extractMonth('2026-6-15'), '2026-06');
});

test('extractMonth("2026/6/15") → "2026-06"', function() {
  assertEqual(extractMonth('2026/6/15'), '2026-06');
});

test('extractMonth("") → ""', function() {
  assertEqual(extractMonth(''), '');
});

// ============================================================================
// 计算公式测试
// ============================================================================

console.log('\n--- calc 公式 ---');

test('calcComm(10, 1.5) → 1500', function() {
  assertEqual(calcComm(10, 1.5), 1500);
});

test('calcComm(0, 1.5) → 0', function() {
  assertEqual(calcComm(0, 1.5), 0);
});

test('calcComm(1.23, 0.8) → 99', function() {
  // 1.23 * 10000 * 0.8 / 100 = 98.4 → ceil = 99
  assertEqual(calcComm(1.23, 0.8), 99);
});

test('calcFund(1500, 1000) → 500', function() {
  assertEqual(calcFund(1500, 1000), 500);
});

test('calcFund(1000, 1500) → -500', function() {
  assertEqual(calcFund(1000, 1500), -500);
});

test('calcUndrawn(1000, 300) → 700', function() {
  assertEqual(calcUndrawn(1000, 300), 700);
});

test('calcUndrawn(1000, 1500) → 0', function() {
  assertEqual(calcUndrawn(1000, 1500), 0);
});

test('calcNights("2026-06-01", "2026-06-03") → 2', function() {
  assertEqual(calcNights('2026-06-01', '2026-06-03'), 2);
});

test('calcTotalCost(3, 2000) → 6000', function() {
  assertEqual(calcTotalCost(3, 2000), 6000);
});

// ============================================================================
// 聚合统计测试
// ============================================================================

console.log('\n--- calc/stats.js ---');

var sampleTxs = [
  { id: 1, _fbKey: '-La', date: '2026-06-01', type: 'rolling', agent: '代理A', venue: '新濠(勵盈1)', volume: 10, rate: 1.5, comm: 1500, bonus: 1000, drawn: 300, undrawn: 700, fund: 500, cash: 0 },
  { id: 2, _fbKey: '-Lb', date: '2026-06-02', type: 'rolling', agent: '代理A', venue: '銀河(金門1)', volume: 20, rate: 1.2, comm: 2400, bonus: 1800, drawn: 500, undrawn: 1300, fund: 600, cash: 0 },
  { id: 3, _fbKey: '-Lc', date: '2026-06-03', type: 'rolling', agent: '代理B', venue: '金沙(御匾會)', volume: 15, rate: 1.0, comm: 1500, bonus: 1000, drawn: 1000, undrawn: 0, fund: 500, cash: 0 },
];

test('totalVolume → 45', function() {
  assertEqual(totalVolume(sampleTxs), 45);
});

test('totalComm → 5400', function() {
  assertEqual(totalComm(sampleTxs), 5400);
});

test('totalBonus → 3800', function() {
  assertEqual(totalBonus(sampleTxs), 3800);
});

test('totalFund → 1600', function() {
  assertEqual(totalFund(sampleTxs), 1600);
});

test('totalDrawn → 1800', function() {
  assertEqual(totalDrawn(sampleTxs), 1800);
});

test('totalUndrawn → 2000', function() {
  assertEqual(totalUndrawn(sampleTxs), 2000);
});

test('aggregateByAgent → 2 agents', function() {
  var agg = aggregateByAgent(sampleTxs);
  assertEqual(agg.length, 2);
  // 代理A: vol=30
  var a = agg.find(function(x) { return x.agent === '代理A'; });
  assert(a != null, '代理A not found');
  assertEqual(a.volume, 30);
});

test('rankByVolume → 代理A first', function() {
  var ranks = rankByVolume(sampleTxs, 10);
  assert(ranks.length >= 1);
  assertEqual(ranks[0].agent, '代理A');
  assertEqual(ranks[0].volume, 30);
});

test('calcKPI → agentCount=2, txCount=3', function() {
  var kpi = calcKPI(sampleTxs);
  assertEqual(kpi.agentCount, 2);
  assertEqual(kpi.txCount, 3);
});

test('calcFundBalance → 1600 (no fund withdrawals)', function() {
  assertEqual(calcFundBalance(sampleTxs, []), 1600);
});

test('calcTotalWallet → correct', function() {
  var total = calcTotalWallet(sampleTxs, [], {});
  assert(total >= 0);
});

// --- calcRoomQuota ---
test('calcRoomQuota with matching data', function() {
  var bookings = [
    { month: '2026-06', threshold: 80, checkIn: '2026-06-01' },
    { month: '2026-06', threshold: 180, checkIn: '2026-06-10' },
  ];
  var txs = [
    { date: '2026-06-05', volume: 1000 },
    { date: '2026-06-15', volume: 500 },
  ];
  var q = calcRoomQuota(bookings, txs, '2026-06');
  assertEqual(q.totalVolume, 1500);
  assertEqual(q.usedThreshold, 260);
  assertEqual(q.remainingThreshold, 1240);
  assert(q.usageRate > 0 && q.usageRate < 100);
});

test('calcRoomQuota with no transactions (deficit)', function() {
  var bookings = [{ month: '2026-06', threshold: 100, checkIn: '2026-06-01' }];
  var q = calcRoomQuota(bookings, [], '2026-06');
  assertEqual(q.totalVolume, 0);
  assertEqual(q.usedThreshold, 100);
  assertEqual(q.remainingThreshold, -100);
  assertEqual(q.usageRate, 100);
});

test('calcRoomQuota with no bookings', function() {
  var txs = [{ date: '2026-06-05', volume: 1000 }];
  var q = calcRoomQuota([], txs, '2026-06');
  assertEqual(q.totalVolume, 1000);
  assertEqual(q.usedThreshold, 0);
  assertEqual(q.remainingThreshold, 1000);
  assertEqual(q.usageRate, 0);
});

test('calcRoomQuota with various date formats', function() {
  var bookings = [
    { month: '2026-06', threshold: 80, checkIn: '2026-06-01' },
    { month: '2026/6', threshold: 50, checkIn: '2026/6/15' },  // 无前导零
  ];
  var txs = [
    { date: '2026/6/5', volume: 500 },   // 斜杠+无前导零
    { date: '2026-06-20', volume: 300 },
  ];
  var q = calcRoomQuota(bookings, txs, '2026-06');
  assertEqual(q.totalVolume, 800);
  assertEqual(q.usedThreshold, 130);
});

test('calcRoomQuota with empty data', function() {
  var q = calcRoomQuota([], [], '2026-06');
  assertEqual(q.totalVolume, 0);
  assertEqual(q.usedThreshold, 0);
  assertEqual(q.remainingThreshold, 0);
  assertEqual(q.usageRate, 0);
});

// ============================================================================
// 筛选测试
// ============================================================================

console.log('\n--- calc/filters.js ---');

test('filterByMonth → 3 for 2026-06', function() {
  var r = filterByMonth(sampleTxs, '2026-06');
  assertEqual(r.length, 3);
});

test('filterByMonth → 0 for 2026-07', function() {
  var r = filterByMonth(sampleTxs, '2026-07');
  assertEqual(r.length, 0);
});

test('filterByAgent → 2 for 代理A', function() {
  var r = filterByAgent(sampleTxs, '代理A');
  assertEqual(r.length, 2);
});

test('filterByVenue → 1 for 金沙(御匾會)', function() {
  var r = filterByVenue(sampleTxs, '金沙(御匾會)');
  assertEqual(r.length, 1);
});

test('searchTxs → 1 for "代理B"', function() {
  var r = searchTxs(sampleTxs, '代理B');
  assertEqual(r.length, 1);
});

test('sortTxs by volume asc', function() {
  var r = sortTxs(sampleTxs, 'volume', true);
  assertEqual(r[0].volume, 10);
  assertEqual(r[2].volume, 20);
});

test('filterByTime month', function() {
  var r = filterByTime(sampleTxs, { type: 'month', value: '2026-06' });
  assertEqual(r.length, 3);
});

test('filterTxs combined', function() {
  var r = filterTxs(sampleTxs, { agent: '代理A', venue: '銀河(金門1)' });
  assertEqual(r.length, 1);
});

// ============================================================================
// 数据结构测试
// ============================================================================

console.log('\n--- 数据结构 ---');

test('交易对象包含必需字段', function() {
  var required = ['id', '_fbKey', 'date', 'type', 'agent', 'volume', 'rate', 'comm', 'bonus', 'drawn', 'undrawn', 'fund'];
  for (var i = 0; i < sampleTxs.length; i++) {
    for (var j = 0; j < required.length; j++) {
      assert(sampleTxs[i].hasOwnProperty(required[j]), 'Missing: ' + required[j]);
    }
  }
});

test('VENUE_OPTIONS 有 7 个地点', function() {
  assertEqual(VENUE_OPTIONS.length, 7);
});

test('CASINO_ORDER 有 6 个体系', function() {
  assertEqual(CASINO_ORDER.length, 6);
});

test('PAGES 有 6 个页面', function() {
  assertEqual(PAGES.length, 6);
});

// ============================================================================
// 常量一致性测试
// ============================================================================

console.log('\n--- 常量 ---');

test('APP.VERSION 非空', function() {
  assert(APP.VERSION.length > 0);
});

test('STORAGE_KEYS 有 20 个 key', function() {
  var count = 0;
  for (var k in STORAGE_KEYS) { if (STORAGE_KEYS.hasOwnProperty(k)) count++; }
  assertEqual(count, 20); // 19 original + LAST_SYNC_TIME
});

test('FB_PATH 有 8 条路径', function() {
  var paths = [FB_PATH.TXS, FB_PATH.FUND, FB_PATH.AGENT_LIST, FB_PATH.AGENT_WALLETS,
               FB_PATH.WORKING_MONTH, FB_PATH.RM_BOOKINGS, FB_PATH.HC_CONFIG, FB_PATH.ARCHIVES];
  for (var i = 0; i < paths.length; i++) {
    assert(paths[i] && paths[i].length > 0, 'Missing path at index ' + i);
  }
});

test('EVENTS 事件名全部非空', function() {
  for (var k in EVENTS) {
    assert(EVENTS[k] && EVENTS[k].length > 0, 'Empty event: ' + k);
  }
});

test('UI_COLORS 包含关键颜色', function() {
  var keys = ['bgBase', 'textPrimary', 'techCyan', 'goldSoft', 'danger', 'success'];
  for (var i = 0; i < keys.length; i++) {
    assert(UI_COLORS[keys[i]], 'Missing color: ' + keys[i]);
  }
});

test('SHORTCUTS 有 11 个快捷键', function() {
  assertEqual(SHORTCUTS.length, 11);
});

// ============================================================================
// Event Bus 测试
// ============================================================================

console.log('\n--- Events ---');

test('Events.on + emit', function() {
  var called = false;
  Events.on('test:event', function(data) {
    called = true;
    assertEqual(data, 'hello');
  });
  Events.emit('test:event', 'hello');
  assert(called, 'Handler was not called');
  Events.off('test:event');
});

test('Events.once', function() {
  var count = 0;
  Events.once('test:once', function() { count++; });
  Events.emit('test:once');
  Events.emit('test:once');
  assertEqual(count, 1, 'Once should only fire once');
});

test('Events.off removes handler', function() {
  var count = 0;
  var handler = function() { count++; };
  Events.on('test:off', handler);
  Events.off('test:off', handler);
  Events.emit('test:off');
  assertEqual(count, 0);
});

// ============================================================================
// 报告
// ============================================================================

console.log('\n' + '='.repeat(50));
console.log('  测试完成: ' + TESTS_PASSED + '/' + TESTS_TOTAL + ' PASSED');

if (TESTS_FAILED > 0) {
  console.log('  ❌ ' + TESTS_FAILED + ' FAILED');
  process.exit(1);
} else {
  console.log('  ✅ ALL TESTS PASSED');
}
