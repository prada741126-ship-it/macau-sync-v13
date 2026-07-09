/**
 * v13 Build Tool — 零依赖构建系统
 * 
 * 合并 CSS + JS → dist/index.html
 * 自动版本替换
 * 本地环境自动执行测试
 * 生产环境跳过测试
 * 
 * 用法: node build.js
 */

const fs = require('fs');
const path = require('path');

// ========================================================================
// 配置
// ========================================================================
const BASE_DIR = __dirname;
const VERSION_FILE = path.join(BASE_DIR, 'version.json');
const TEMPLATE = path.join(BASE_DIR, 'template.html');
const DIST_DIR = path.join(BASE_DIR, 'dist');
const OUTPUT = path.join(DIST_DIR, 'index.html');
const TEST_FILE = path.join(BASE_DIR, 'test', 'test.js');

// CSS 文件 (按顺序)
const CSS_FILES = [
  'css/variables.css',
  'css/layout.css',
  'css/components.css',
  'css/china-theme.css',
  'css/mobile.css',
  'css/print.css',    // 打印样式（@media print）
];

// JS 文件 (按依赖顺序)
const JS_FILES = [
  // Phase 1: 地基 (零依赖)
  'src/core/constants.js',
  'src/utils/format.js',
  'src/utils/dom.js',
  'src/utils/crypto.js',
  'src/utils/countup.js',
  'src/core/events.js',
  'src/core/state.js',
  'src/core/store.js',

  // Phase 2: 计算层
  'src/calc/finance.js',
  'src/calc/stats.js',
  'src/calc/filters.js',

  // Phase 3: 数据层
  'src/data/transactions.js',
  'src/data/fund.js',
  'src/data/wallets.js',
  'src/data/agents.js',
  'src/data/bookings.js',
  'src/data/hotel-config.js',
  'src/data/backup.js',
  'src/data/csv.js',
  'src/data/draft.js',

  // Phase 4: 同步层
  'src/sync/firebase.js',
  'src/sync/uploader.js',
  'src/sync/watchers.js',
  'src/sync/merger.js',
  'src/sync/recently-deleted.js',

  // Phase 5-6: UI + Pages + Charts
  'src/ui/toast.js',
  'src/ui/modal.js',
  'src/ui/keyboard.js',
  'src/core/router.js',
  'src/core/auth.js',
  'src/pages/overview.js',
  'src/pages/all.js',
  'src/pages/query.js',
  'src/pages/summary.js',
  'src/pages/room.js',
  'src/pages/wallet.js',
  'src/charts/trend.js',
  'src/charts/rank.js',

  // Phase 7: Bridge (HTML onclick → JS glue, 最后加载)
  'src/bridge/bridge.js',

  // Phase 8: Entry point (最后)
  'src/app.js',
];

// ========================================================================
// 构建
// ========================================================================

function readVersion() {
  const raw = fs.readFileSync(VERSION_FILE, 'utf-8');
  return JSON.parse(raw);
}

function readFileOrEmpty(filePath) {
  const fullPath = path.join(BASE_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn('  ⚠ Missing:', filePath);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function buildCSS() {
  console.log('\n📦 Building CSS...');
  let combined = '';
  for (const file of CSS_FILES) {
    const content = readFileOrEmpty(file);
    if (content) {
      console.log('  ✓', file);
      combined += '/* ' + file + ' */\n' + content + '\n';
    }
  }
  return combined;
}

function buildJS() {
  console.log('\n📦 Building JS...');
  let combined = '';
  for (const file of JS_FILES) {
    const content = readFileOrEmpty(file);
    if (content) {
      console.log('  ✓', file);
      combined += '// ' + file + '\n' + content + '\n';
    }
  }
  return combined;
}

function build() {
  console.log('='.repeat(60));
  console.log('  v13 Macau Sync — Build Tool');
  console.log('='.repeat(60));

  // 读取版本
  const version = readVersion();
  console.log('\n📋 Version:', version.version, '| Build Date:', version.buildDate);

  // 读取模板
  if (!fs.existsSync(TEMPLATE)) {
    console.error('❌ Template not found:', TEMPLATE);
    process.exit(1);
  }
  let html = fs.readFileSync(TEMPLATE, 'utf-8');

  // 合并 CSS
  const css = buildCSS();
  html = html.replace('<!-- CSS_PLACEHOLDER -->', '<style>\n' + css + '\n</style>');

  // 合并 JS → 输出为外部 app.js（避免 </script> 在 JS 字符串中导致 HTML 解析错误）
  const js = buildJS();
  const APP_JS_PATH = path.join(BASE_DIR, 'app.js');
  const DIST_APP_JS = path.join(DIST_DIR, 'app.js');
  fs.writeFileSync(APP_JS_PATH, js, 'utf-8');
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(DIST_APP_JS, js, 'utf-8');
  console.log('  ✓ app.js written:', (fs.statSync(APP_JS_PATH).size / 1024).toFixed(1), 'KB');

  // 版本替换
  const verPattern = /v\d+\.\d+(\.\d+)?/g;
  let replaceCount = 0;
  html = html.replace(verPattern, function(match) {
    replaceCount++;
    return 'v' + version.version;
  });
  // cache-busting for app.js (用構建時間戳確保每次部署唯一，強制 CDN 刷新)
  html = html.replace(/__VERSION__/g, version.version + '.' + Date.now());
  replaceCount++;
  console.log('\n🔄 Version replacements:', replaceCount);

  // BUILD_INFO
  const buildInfo = '<!-- BUILD: v' + version.version + ' | ' + version.buildDate + ' | ' + new Date().toISOString() + ' -->';
  html = html.replace('<!-- BUILD_INFO_PLACEHOLDER -->', buildInfo);

  // 输出 dist/index.html
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT, html, 'utf-8');

  // 同时输出根目录 index.html（GitHub Pages 从根目录部署）
  const ROOT_OUTPUT = path.join(BASE_DIR, 'index.html');
  fs.writeFileSync(ROOT_OUTPUT, html, 'utf-8');

  const stats = fs.statSync(OUTPUT);
  console.log('\n✅ Build complete:');
  console.log('   dist/index.html  —', (stats.size / 1024).toFixed(1), 'KB');
  console.log('   index.html       —', (fs.statSync(ROOT_OUTPUT).size / 1024).toFixed(1), 'KB (GitHub Pages root)');
  console.log('   JS modules:', JS_FILES.length);
  console.log('   CSS modules:', CSS_FILES.length);

  // 运行测试 (仅本地)
  runTests();
}

function runTests() {
  // 生产环境跳过测试
  if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    console.log('\n⏭ Skipping tests (production environment)');
    return;
  }

  console.log('\n🧪 Running tests...');

  try {
    // 检查 test.js 是否存在
    if (!fs.existsSync(TEST_FILE)) {
      console.log('  ⚠ No test.js found, skipping tests');
      return;
    }

    // 尝试加载 jsdom
    let jsdom;
    try {
      jsdom = require('jsdom');
    } catch (e) {
      console.log('  ⚠ jsdom not available, skipping automated tests');
      return;
    }

    // 运行测试
    const JSDOM = jsdom.JSDOM;
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
    });

    // 创建 DOM 结构
    const document = dom.window.document;
    const body = document.body;

    // 创建 Toast 容器
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    body.appendChild(toastContainer);

    // 注入全局
    global.window = dom.window;
    global.document = document;
    global.localStorage = dom.window.localStorage;
    global.sessionStorage = dom.window.sessionStorage;

    // 构建 JS 内容（直接合并源文件，不从 HTML 提取）
    let jsContent = '';
    for (const file of JS_FILES) {
      const fullPath = path.join(BASE_DIR, file);
      if (fs.existsSync(fullPath)) {
        jsContent += fs.readFileSync(fullPath, 'utf-8') + '\n';
      }
    }

    // 在 jsdom 中运行
    const vm = require('vm');
    const script = new vm.Script(jsContent);
    const context = vm.createContext(dom.window);
    script.runInContext(context);

    // 将 jsdom window 中的函数暴露到 global (供测试使用)
    for (const key of Object.keys(dom.window)) {
      if (typeof dom.window[key] === 'function' || (typeof dom.window[key] !== 'object' && key !== 'window' && key !== 'global' && key !== 'globalThis')) {
        global[key] = dom.window[key];
      }
    }
    // 也暴露对象
    global.Events = dom.window.Events;
    global.State = dom.window.State;
    global.Store = dom.window.Store;
    global.APP = dom.window.APP;
    global.CONFIG = dom.window.CONFIG;
    global.STORAGE_KEYS = dom.window.STORAGE_KEYS;
    global.FIREBASE_CONFIG = dom.window.FIREBASE_CONFIG;
    global.FB_PATH = dom.window.FB_PATH;
    global.EVENTS = dom.window.EVENTS;
    global.UI_COLORS = dom.window.UI_COLORS;
    global.VENUE_OPTIONS = dom.window.VENUE_OPTIONS;
    global.CASINO_ORDER = dom.window.CASINO_ORDER;
    global.PAGES = dom.window.PAGES;
    global.SHORTCUTS = dom.window.SHORTCUTS;
    global.TERMS = dom.window.TERMS;
    global.TX_TYPES = dom.window.TX_TYPES;
    global.CDN = dom.window.CDN;
    global.TOAST_TIMING = dom.window.TOAST_TIMING;
    global.PRESET_CONFIG = dom.window.PRESET_CONFIG;
    global.RM = dom.window.RM;

    // 运行 test.js
    require(TEST_FILE);

    console.log('✅ All tests passed!');
  } catch (e) {
    console.error('\n❌ Test failed:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

// ========================================================================
// 启动
// ========================================================================
build();
