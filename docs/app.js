// src/core/constants.js
/**
 * v13 核心常量 — 单一真相来源
 * 
 * 依赖: 无（零依赖模块）
 * 影响: 全系统所有模块
 * 
 * 本文件包含对照档 1.0 中散落在 6 个文件的所有常量：
 * - config.js: PRODUCTION, UI_COLORS, firebaseConfig, 系统识别
 * - storage.js: STORAGE_KEYS (16 个 key)
 * - sync.js: Firebase 路径 (7 条)
 * - hotel-config-presets.js: CASINO_ORDER
 * - 散落各处的硬编码值: 地点选项, 用語, 快捷键
 */

// ============================================================================
// 系统识别
// ============================================================================
var APP = {
  VERSION:       'v13.0.0',
  TITLE:         '澳門洗碼報表',
  SYSTEM_NAME:   '博盈國際會',
  SYSTEM_SUB:    '洗碼管理系統',
  SYSTEM_EN:     'BOYING INTERNATIONAL CLUB',
  LOGIN_TITLE:   '授 權 驗 證',
  LOGO_CHAR:     '\u2660',  // ♠
  PWD_PLAIN:     'macau888',
  PWD_ENCODED:   'bWFjYXU4ODg=',  // btoa('macau888')
};

// ============================================================================
// 时间与安全
// ============================================================================
var CONFIG = {
  SESSION_TIMEOUT:  30 * 60 * 1000,  // 30 分钟
  MAX_PW_ATTEMPTS:  5,
  LOCK_DURATION:     60 * 1000,      // 60 秒
  DRAFT_EXPIRY:      2 * 60 * 60 * 1000,  // 2 小时
  BACKUP_RETENTION:   7,             // 保留 7 天
  SYNC_RETRY_MAX:     3,
  SYNC_RETRY_BASE:    500,           // 首次重试延迟 (ms)
  PRODUCTION:         false,         // 生产模式开关
};

// ============================================================================
// localStorage 键 (对照档第四节 - 16 个 key)
// ============================================================================
var STORAGE_KEYS = {
  DATA:              'macau_data',            // 交易数组 (AES加密)
  FUND:              'macau_fund_data',        // 公基金 (AES加密)
  AGENT_WALLETS:     'macau_agent_wallets',    // 代理钱包 (AES加密)
  AGENT_LIST:        'macau_agent_list',       // 代理名单 (纯JSON)
  DRAFT:             'macau_draft',            // 交易表单草稿
  CONFIG:            'macau_config',           // { workingMonth }
  ARCHIVES:          'macau_archives',         // 月度存档
  SAVED_FILTERS:     'macau_saved_filters',    // 查询已存筛选
  BACKUP_LIST:       'macau_backup_list',      // 备份清单
  BACKUP_PREFIX:     'macau_backup_',          // 备份前缀 + YYYY-MM-DD
  WORKING_MONTH:     'macau_working_month',    // 工作月份
  AUTH:              'macau_auth',             // 登入授权旗标
  LAST_BACKUP_DATE:  'macau_last_backup_date', // 最后备份日期
  RM_BOOKINGS:       'rm_bookings',            // 订房资料
  RM_LAST_ID:        'rm_last_id',             // 最后订房ID
  HC_CONFIG:         'hc_config',              // 酒店设定
  HC_PRESET_VERSION: 'hc_preset_version',      // 酒店预设版本号
  APP_VERSION:       'macau_app_version',      // 版本快取清除
};

// ============================================================================
// Firebase 配置
// ============================================================================
var FIREBASE_CONFIG = {
  apiKey:             'AIzaSyDPLDEr5QnMQ_AD-z7Wppt2fylxWoBuxj0U',
  authDomain:         'macau-sync.firebaseapp.com',
  databaseURL:        'https://macau-sync-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:          'macau-sync',
  storageBucket:      'macau-sync.appspot.com',
  messagingSenderId:  '5394959664910',
  appId:              '1:5394959664910:web:f445ede79937711fdd65f',
  measurementId:      'G-8BFD758YCF',
};

// ============================================================================
// Firebase 数据库路径 (对照档第九节 - 7 条路径)
// ============================================================================
var FB_PATH = {
  TXS:             'macau_data/txs',
  FUND:            'macau_data/fundWithdrawals',
  AGENT_LIST:      'macau_data/agentList',
  AGENT_WALLETS:   'macau_data/agentWallets',
  WORKING_MONTH:   'macau_data/workingMonth',
  RM_BOOKINGS:     'macau_data/rmBookings',
  ARCHIVES:        'macau_data/archives',
  CONNECTED:       '.info/connected',
};

// ============================================================================
// 事件名称 (Event Bus — v13 新架构核心)
// ============================================================================
var EVENTS = {
  // 交易
  TX_CREATED:       'tx:created',
  TX_UPDATED:       'tx:updated',
  TX_DELETED:       'tx:deleted',
  TXS_LOADED:       'txs:loaded',
  // 公基金
  FUND_CREATED:     'fund:created',
  FUND_UPDATED:     'fund:updated',
  FUND_DELETED:     'fund:deleted',
  FUND_LOADED:      'fund:loaded',
  // 代理钱包
  WALLET_CREATED:   'wallet:created',
  WALLET_UPDATED:   'wallet:updated',
  WALLET_DELETED:   'wallet:deleted',
  WALLETS_LOADED:   'wallets:loaded',
  // 代理名单
  AGENT_LIST_UPDATED: 'agentList:updated',
  AGENT_LIST_LOADED:  'agentList:loaded',
  // 订房
  BOOKING_CREATED:  'booking:created',
  BOOKING_UPDATED:  'booking:updated',
  BOOKING_DELETED:  'booking:deleted',
  BOOKINGS_LOADED:  'bookings:loaded',
  // 酒店设定
  HC_CONFIG_UPDATED: 'hcConfig:updated',
  HC_CONFIG_LOADED:  'hcConfig:loaded',
  // 月份
  MONTH_CHANGED:    'month:changed',
  MONTH_CLOSED:     'month:closed',
  // 同步
  SYNC_START:       'sync:start',
  SYNC_COMPLETE:    'sync:complete',
  SYNC_ERROR:       'sync:error',
  CONNECTION_CHANGED: 'connection:changed',
  CRYPTO_READY:      'crypto:ready',
  // 页面
  PAGE_CHANGED:     'page:changed',
  // UI
  TOAST:            'ui:toast',
  LOADING_SHOW:     'ui:loading:show',
  LOADING_HIDE:     'ui:loading:hide',
  MODAL_OPEN:       'ui:modal:open',
  MODAL_CLOSE:      'ui:modal:close',
  // KPI 跳转
  KPI_CLICK:        'kpi:click',
  CHART_CLICK:      'chart:click',
};

// ============================================================================
// 设计系统颜色 (对照档第五节)
// ============================================================================
var UI_COLORS = {
  // 背景层次
  bgBase:           '#0a0a0f',
  bgSurface:        '#0d1117',
  bgElevated:       '#161b22',
  // 文字
  textPrimary:      '#e6edf3',
  textSecondary:    '#8b949e',
  textMuted:        '#6e7681',
  // 科技冷色
  techCyan:         '#00d4ff',
  skyBlue:          '#0095ff',
  electricViolet:   '#7c3aed',
  // 中式点缀
  goldSoft:         '#c9a84c',
  goldLight:        '#D4A844',
  goldDim:          '#8B6914',
  vermilion:        '#c0392b',
  // 状态色
  danger:           '#f85149',
  warning:          '#f0a500',
  success:          '#2dd4a0',
  info:             '#58a6ff',
  cashOrange:       '#e67e22',
  // 边框
  borderSubtle:     'rgba(255,255,255,0.06)',
  borderGold:       'rgba(201,168,76,0.12)',
  borderGoldStrong: 'rgba(212,175,55,0.3)',
};

// ============================================================================
// 地点选项 (对照档第八节 - 7 个)
// ============================================================================
var VENUE_OPTIONS = [
  { label: '新濠(勵盈1)', casino: '新濠天地' },
  { label: '新濠(勵盈2)', casino: '新濠天地' },
  { label: '銀河(金門1)', casino: '銀河' },
  { label: '銀河(金門8)', casino: '銀河' },
  { label: '金沙(御匾會)', casino: '金沙' },
  { label: '永利(永利會)', casino: '永利' },
  { label: '上葡京',       casino: '上葡京' },
];

// ============================================================================
// 体系排序 (对照档模块20)
// ============================================================================
var CASINO_ORDER = ['新濠天地', '新濠影滙', '金沙', '銀河', '永利', '上葡京'];

// ============================================================================
// 页面清单 (对照档第四节)
// ============================================================================
var PAGES = [
  { id: 'page-overview',  name: 'overview',  label: '總覽',      icon: '\uD83D\uDCCA', shortcut: '1' },
  { id: 'page-all',       name: 'all',       label: '全部交易',   icon: '\uD83D\uDCCB', shortcut: '2' },
  { id: 'page-query',     name: 'query',     label: '查詢',      icon: '\uD83D\uDD0D', shortcut: '3' },
  { id: 'page-summary',   name: 'summary',   label: '統計',      icon: '\uD83D\uDCCA', shortcut: '4' },
  { id: 'page-room',      name: 'room',      label: '房務系統',   icon: '\uD83C\uDFE8', shortcut: '5' },
  { id: 'page-wallet',    name: 'wallet',    label: '總錢包',     icon: '\uD83D\uDCB3', shortcut: '6' },
];

// ============================================================================
// 快捷键清单 (对照档第十三节)
// ============================================================================
var SHORTCUTS = [
  { keys: 'Ctrl+1',    desc: '切換到總覽頁',       action: 'page:overview' },
  { keys: 'Ctrl+2',    desc: '切換到全部交易頁',    action: 'page:all' },
  { keys: 'Ctrl+3',    desc: '切換到查詢頁',        action: 'page:query' },
  { keys: 'Ctrl+4',    desc: '切換到統計頁',        action: 'page:summary' },
  { keys: 'Ctrl+5',    desc: '切換到房務系統頁',    action: 'page:room' },
  { keys: 'Ctrl+6',    desc: '切換到總錢包頁',      action: 'page:wallet' },
  { keys: 'Ctrl+N',    desc: '新增交易',            action: 'tx:new' },
  { keys: 'Ctrl+S',    desc: '儲存資料',            action: 'sync:manual' },
  { keys: 'Ctrl+F',    desc: '快速搜索',            action: 'search:focus' },
  { keys: '?',         desc: '顯示快捷鍵幫助',      action: 'shortcut:help' },
  { keys: 'Escape',    desc: '關閉當前彈窗',        action: 'modal:close' },
];

// ============================================================================
// 用語对照表 (对照档第十二节)
// ============================================================================
var TERMS = {
  volume:       '洗碼量',
  rate:         '碼佣率',
  comm:         '佣金',
  bonus:        '碼糧',
  fund:         '公基金',
  drawn:        '已提領',
  undrawn:      '未提領',
  cash:         '現金寄放',
  deposit:      '存入',
  cashDeposit:  '自存現金',
  withdraw:     '提領',
  rolling:      '轉碼',
  save:         '儲存',
  load:         '讀取',
  edit:         '編輯',
  delete:       '刪除',
  cancel:       '取消',
  add:          '新增',
  query:        '查詢',
  summary:      '統計',
  overview:     '總覽',
  note:         '備註',
  all:          '全部',
  venue:        '場地',
  agent:        '代理',
  client:       '客戶',
  totalWallet:  '總錢包',
  monthlyClose: '月末結算',
  sync:         '同步',
  export:       '匯出',
  import:       '匯入',
  backup:       '備份',
  restore:      '還原',
  draft:        '草稿',
  room:         '房務系統',
  booking:      '訂房',
  hotelConfig:  '酒店設定',
  casino:       '體系',
  roomType:     '房型',
  checkIn:      '入住',
  checkOut:     '退房',
  nights:       '天數',
  pricePerNight:'單價',
  totalCost:    '總費用',
  threshold:    '轉碼門檻',
  free:         '免費',
  paid:         '付費',
  quotaUsage:   '額度使用率',
  locked:       '已鎖定',
  login:        '登入',
  password:     '密碼',
  verify:       '驗證',
  connecting:   '連線中',
  synced:       '已同步',
  processing:   '處理中',
};

// ============================================================================
// 交易类型选项
// ============================================================================
var TX_TYPES = [
  { value: 'rolling', label: '轉碼' },
  { value: 'cash',    label: '現金寄放' },
];

// ============================================================================
// CDN 依赖 (对照档第十四节)
// ============================================================================
var CDN = {
  FIREBASE_APP:      'https://cdn.jsdelivr.net/npm/firebase@10.12.0/firebase-app-compat.js',
  FIREBASE_DB:       'https://cdn.jsdelivr.net/npm/firebase@10.12.0/firebase-database-compat.js',
  CRYPTOJS:          'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js',
  CHARTJS:           'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
};

// ============================================================================
// Toast 时序 (对照档第十七节)
// ============================================================================
var TOAST_TIMING = {
  DURATION:          3500,  // 常规 Toast 显示时长
  CRUD_DONE:         0,     // CRUD 完成 → 立即
  SYNCING_DELAY:     350,   // "同步中" 延迟
  SYNC_DONE_DELAY:   950,   // "同步成功" 总延迟
};

// ============================================================================
// 默认工作月份键
// ============================================================================
var DEFAULT_WORKING_MONTH = '';  // 空 = 使用当前月份

// ============================================================================
// 手机版断点
// ============================================================================
var BREAKPOINT = {
  MOBILE:  700,
  TABLET:  1023,
  DESKTOP: 1024,
};

// src/utils/format.js
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

// src/utils/dom.js
/**
 * v13 DOM 操作工具
 * 
 * 依赖: 无（原生 DOM API）
 * 影响: ui/*, pages/*, data/*
 */

// ============================================================================
// 选择器
// ============================================================================

/**
 * 单个元素选择
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector);
}

/**
 * 多元素选择
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector);
}

// ============================================================================
// 创建元素
// ============================================================================

/**
 * 快速创建 DOM 元素
 * @param {string} tag - 标签名
 * @param {object} [attrs] - 属性 { className, id, textContent, innerHTML, ... }
 * @param {...(Element|string)} [children]
 * @returns {Element}
 */
function h(tag, attrs, children) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var key in attrs) {
      if (key === 'className') {
        el.className = attrs[key];
      } else if (key === 'textContent') {
        el.textContent = attrs[key];
      } else if (key === 'innerHTML') {
        el.innerHTML = attrs[key];
      } else if (key === 'style' && typeof attrs[key] === 'object') {
        for (var s in attrs[key]) {
          el.style[s] = attrs[key][s];
        }
      } else if (key.indexOf('on') === 0 && typeof attrs[key] === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
      } else {
        el.setAttribute(key, attrs[key]);
      }
    }
  }
  var args = Array.prototype.slice.call(arguments, 2);
  for (var i = 0; i < args.length; i++) {
    var child = args[i];
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  return el;
}

// ============================================================================
// 表格构建
// ============================================================================

/**
 * 快速创建表格
 * @param {string[][]} data - 二维数组 [[cell1, cell2, ...], ...]
 * @param {object} [opts]
 * @param {string} [opts.className] - table 的 class
 * @param {string[]} [opts.headers] - 表头
 * @param {function} [opts.onRowClick] - 行点击回调 (rowIndex, trElement)
 * @returns {HTMLTableElement}
 */
function buildTable(data, opts) {
  opts = opts || {};
  var table = document.createElement('table');
  if (opts.className) table.className = opts.className;

  if (opts.headers) {
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    for (var i = 0; i < opts.headers.length; i++) {
      var th = document.createElement('th');
      th.textContent = opts.headers[i];
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  var tbody = document.createElement('tbody');
  for (var r = 0; r < data.length; r++) {
    var row = document.createElement('tr');
    for (var c = 0; c < data[r].length; c++) {
      var td = document.createElement('td');
      td.textContent = data[r][c] != null ? String(data[r][c]) : '';
      row.appendChild(td);
    }
    if (opts.onRowClick) {
      (function(idx) {
        row.addEventListener('click', function() {
          opts.onRowClick(idx, row);
        });
      })(r);
      row.style.cursor = 'pointer';
    }
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  return table;
}

// ============================================================================
// 表单操作
// ============================================================================

/**
 * 收集表单数据
 * @param {Element} formEl - 表单容器
 * @param {string[]} fields - 字段名数组
 * @returns {object}
 */
function collectForm(formEl, fields) {
  var data = {};
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var el = formEl.querySelector('[name="' + f + '"]');
    if (el) {
      data[f] = el.value;
    }
  }
  return data;
}

/**
 * 填充表单
 * @param {Element} formEl
 * @param {object} data
 */
function fillForm(formEl, data) {
  for (var key in data) {
    var el = formEl.querySelector('[name="' + key + '"]');
    if (el) {
      el.value = data[key] != null ? data[key] : '';
    }
  }
}

/**
 * 重置表单
 * @param {Element} formEl
 */
function resetForm(formEl) {
  var inputs = formEl.querySelectorAll('input, select, textarea');
  for (var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false;
    } else {
      el.value = '';
    }
  }
}

// ============================================================================
// 显示/隐藏
// ============================================================================

/**
 * 显示元素
 * @param {Element|string} el
 * @param {string} [display='block']
 */
function show(el, display) {
  el = typeof el === 'string' ? $(el) : el;
  if (el) el.style.display = display || 'block';
}

/**
 * 隐藏元素
 * @param {Element|string} el
 */
function hide(el) {
  el = typeof el === 'string' ? $(el) : el;
  if (el) el.style.display = 'none';
}

/**
 * 切换元素可见性
 * @param {Element|string} el
 * @param {boolean} visible
 * @param {string} [display='block']
 */
function toggle(el, visible, display) {
  el = typeof el === 'string' ? $(el) : el;
  if (!el) return;
  el.style.display = visible ? (display || 'block') : 'none';
}

// ============================================================================
// 事件委托
// ============================================================================

/**
 * 事件委托
 * @param {Element} parent
 * @param {string} eventType
 * @param {string} selector
 * @param {function} handler
 */
function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, function(e) {
    var target = e.target;
    while (target && target !== parent) {
      if (target.matches(selector)) {
        handler.call(target, e);
        return;
      }
      target = target.parentElement;
    }
  });
}

// ============================================================================
// 节流与防抖
// ============================================================================

/**
 * 防抖
 * @param {function} func
 * @param {number} wait - 毫秒
 * @returns {function}
 */
function debounce(func, wait) {
  var timer = null;
  return function() {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() {
      func.apply(ctx, args);
    }, wait);
  };
}

/**
 * 节流
 * @param {function} func
 * @param {number} limit - 毫秒
 * @returns {function}
 */
function throttle(func, limit) {
  var inThrottle = false;
  return function() {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}

// src/utils/crypto.js
/**
 * v13 加密/解密模块
 * 
 * 依赖: core/constants.js (APP.PWD_ENCODED), CryptoJS (CDN)
 * 影响: core/store.js (localStorage 持久化)
 * 
 * 对照档: 第七节模块2, 第十节安全防护
 * 
 * ⚠️ 致命教训 (v11.0-v11.2.6):
 * CryptoJS CDN 缺失 6 个版本，加密静默失败降级为纯 JSON 存储。
 * v13 必须在初始化时检测 CryptoJS 是否可用，不可用时在 UI 上明确报错。
 */

// ============================================================================
// 全局加密实例
// ============================================================================
var _cryptoReady = false;
var _cryptoError = '';
var _cryptoPollTimer = null;
var _cryptoRetryDone = false;

/**
 * 检测 CryptoJS 是否可用
 * @returns {boolean}
 */
function checkCrypto() {
  if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
    _cryptoReady = true;
    _cryptoError = '';
    if (_cryptoPollTimer) { clearInterval(_cryptoPollTimer); _cryptoPollTimer = null; }
    _cryptoRetryDone = true;
    return true;
  }
  _cryptoReady = false;
  _cryptoError = 'CryptoJS 未載入 — 加密功能不可用，請檢查 CDN 連線';
  console.error('[v13:crypto] FATAL: CryptoJS is not defined. Encryption is UNAVAILABLE.');

  // ★ 如果还没设置重试，启动轮询（参照 Firebase 模式）
  if (!_cryptoRetryDone) {
    _cryptoRetryDone = true;
    _startCryptoPoll();
  }

  return false;
}

/**
 * 获取加密是否就绪
 * @returns {boolean}
 */
function isCryptoReady() {
  return _cryptoReady;
}

/**
 * 启动 CryptoJS 轮询重试
 * 当 CDN 异步加载晚于 app.js 执行时，通过轮询等待 CryptoJS 就绪
 */
function _startCryptoPoll() {
  var pollCount = 0;
  _cryptoPollTimer = setInterval(function() {
    pollCount++;
    if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
      _cryptoReady = true;
      _cryptoError = '';
      clearInterval(_cryptoPollTimer);
      _cryptoPollTimer = null;
      console.log('[v13:crypto] ✅ CryptoJS loaded via poll #' + pollCount + ' — encryption ACTIVE');

      // ★ 加密就绪后：尝试从 localStorage 重新加载加密数据
      // 之前因为 decryptData 返回 [] 导致数据丢失，现在重新解密
      try {
        var rawTxs = localStorage.getItem(STORAGE_KEYS.DATA);
        if (rawTxs && rawTxs.indexOf('ENC:') === 0) {
          var decrypted = decryptData(rawTxs);
          if (decrypted.length > 0) {
            State.set('txs', decrypted);
            Events.emit(EVENTS.TXS_LOADED, decrypted);
            console.log('[v13:crypto] 🔓 Restored ' + decrypted.length + ' encrypted TXS records');
          }
        }
        var rawFund = localStorage.getItem(STORAGE_KEYS.FUND);
        if (rawFund && rawFund.indexOf('ENC:') === 0) {
          var decFund = decryptData(rawFund);
          if (decFund.length > 0) {
            State.set('fundWithdrawals', decFund);
            Events.emit(EVENTS.FUND_LOADED, decFund);
            console.log('[v13:crypto] 🔓 Restored ' + decFund.length + ' encrypted FUND records');
          }
        }
        var rawWallets = localStorage.getItem(STORAGE_KEYS.AGENT_WALLETS);
        if (rawWallets && rawWallets.indexOf('ENC:') === 0) {
          var decWallets = decryptWallets(rawWallets);
          if (decWallets && Object.keys(decWallets).length > 0) {
            State.set('agentWallets', decWallets);
            Events.emit(EVENTS.WALLETS_LOADED, decWallets);
            console.log('[v13:crypto] 🔓 Restored encrypted WALLET records');
          }
        }
      } catch(re) {
        console.error('[v13:crypto] Crypto restore error:', re);
      }

      // ★ 触发加密就绪事件
      Events.emit(EVENTS.CRYPTO_READY);
    }

    if (pollCount >= 30) {
      clearInterval(_cryptoPollTimer);
      _cryptoPollTimer = null;
      console.error('[v13:crypto] ❌ CryptoJS failed to load after 30s. Encryption permanently DISABLED.');
      console.error('[v13:crypto]    请检查: 1) 网络是否可访问 cdn.jsdelivr.net  2) 防火墙/广告拦截器是否屏蔽');
    }
  }, 1000);
}

/**
 * 获取加密错误信息
 * @returns {string}
 */
function getCryptoError() {
  return _cryptoError;
}

// ============================================================================
// 密码管理 (sessionStorage)
// ============================================================================

/**
 * 从 sessionStorage 读取密码
 * @returns {string}
 */
function getSessionPw() {
  return sessionStorage.getItem('_pw') || '';
}

/**
 * 设定密码 (sessionStorage + 全局变量)
 * @param {string} pw
 */
function setSessionPw(pw) {
  sessionStorage.setItem('_pw', pw);
  if (typeof SYNC_PASSWORD !== 'undefined') {
    SYNC_PASSWORD = pw;
  }
}

/**
 * 清除密码
 */
function clearSessionPw() {
  sessionStorage.removeItem('_pw');
  if (typeof SYNC_PASSWORD !== 'undefined') {
    SYNC_PASSWORD = '';
  }
}

/**
 * 验证密码
 * @param {string} input - 用户输入
 * @returns {boolean}
 */
function verifyPassword(input) {
  var decoded = atob(APP.PWD_ENCODED);
  return input === decoded;
}

// ============================================================================
// AES 加密/解密
// ============================================================================

/**
 * 获取加密密钥 (密码的 SHA256 hash)
 * @returns {string}
 */
function _getEncKey() {
  var pw = getSessionPw();
  if (!pw) pw = atob(APP.PWD_ENCODED);  // 回退默认密码
  return CryptoJS.SHA256(pw).toString();
}

/**
 * AES 加密对象 → 字符串
 * @param {object} obj
 * @returns {string} "ENC:" + Base64密文
 */
function encryptData(obj) {
  if (!_cryptoReady) {
    console.warn('[v13:crypto] encryptData: CryptoJS not ready, storing as plain JSON');
    return JSON.stringify(obj);
  }
  try {
    var json = JSON.stringify(obj);
    var key = _getEncKey();
    var encrypted = CryptoJS.AES.encrypt(json, key).toString();
    return 'ENC:' + encrypted;
  } catch (e) {
    console.error('[v13:crypto] encryptData error:', e);
    return JSON.stringify(obj);
  }
}

/**
 * 解密字符串 → 数组/对象
 * 向下兼容旧版未加密格式
 * @param {string} str - "ENC:xxx" 或 JSON 字符串
 * @returns {Array|Object}
 */
function decryptData(str) {
  if (!str) return [];
  // 非加密格式 → 直接 JSON 解析
  if (str.indexOf('ENC:') !== 0) {
    try {
      var parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('[v13:crypto] decryptData: legacy JSON parse error:', e);
      return [];
    }
  }
  // 加密格式 → AES 解密
  if (!_cryptoReady) {
    console.error('[v13:crypto] decryptData: CryptoJS not ready, cannot decrypt');
    return [];
  }
  try {
    var ciphertext = str.slice(4);
    var key = _getEncKey();
    var bytes = CryptoJS.AES.decrypt(ciphertext, key);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
      console.error('[v13:crypto] decryptData: decryption returned empty (wrong password?)');
      return [];
    }
    var result = JSON.parse(plaintext);
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('[v13:crypto] decryptData error:', e);
    return [];
  }
}

/**
 * AES 加密代理钱包对象
 * @param {object} obj - { agentName: [records] }
 * @returns {string}
 */
function encryptWallets(obj) {
  if (!_cryptoReady) {
    console.warn('[v13:crypto] encryptWallets: CryptoJS not ready');
    return JSON.stringify(obj);
  }
  try {
    var json = JSON.stringify(obj);
    var key = _getEncKey();
    return CryptoJS.AES.encrypt(json, key).toString();
  } catch (e) {
    console.error('[v13:crypto] encryptWallets error:', e);
    return JSON.stringify(obj);
  }
}

/**
 * 解密代理钱包
 * @param {string} str
 * @returns {object}
 */
function decryptWallets(str) {
  if (!str) return {};
  if (!_cryptoReady) {
    console.error('[v13:crypto] decryptWallets: CryptoJS not ready');
    return {};
  }
  try {
    var key = _getEncKey();
    var bytes = CryptoJS.AES.decrypt(str, key);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) return {};
    return JSON.parse(plaintext);
  } catch (e) {
    console.error('[v13:crypto] decryptWallets error:', e);
    return {};
  }
}

// src/core/events.js
/**
 * v13 Event Bus — 核心解耦机制
 * 
 * 依赖: 无（零依赖模块）
 * 影响: 全系统所有模块
 * 
 * 设计原则:
 * - 发布-订阅模式，完全解耦模块
 * - A 只 emit 事件，B 只 on 事件，互不直接调用
 * - 错误在单个 handler 中不会影响其他 handler
 * - 开发模式下记录所有事件流用于调试
 * 
 * 使用方式:
 *   Events.on('tx:created', function(tx) { renderTable(); });
 *   Events.emit('tx:created', newTx);
 *   Events.off('tx:created', handlerFn);
 */

var Events = (function() {
  'use strict';

  // 事件监听器映射: { eventName: [handler1, handler2, ...] }
  var _listeners = {};

  // 是否开启调试日志
  var _debug = false;

  /**
   * 订阅事件
   * @param {string} event - 事件名 (如 'tx:created')
   * @param {function} handler - 回调函数
   * @returns {function} 取消订阅函数
   */
  function on(event, handler) {
    if (!_listeners[event]) {
      _listeners[event] = [];
    }
    _listeners[event].push(handler);
    if (_debug) console.log('[v13:events] on:', event, '(total ' + _listeners[event].length + ')');

    // 返回取消订阅函数
    return function() {
      off(event, handler);
    };
  }

  /**
   * 取消订阅
   * @param {string} event
   * @param {function} handler - 如果省略，取消该事件的所有监听器
   */
  function off(event, handler) {
    if (!_listeners[event]) return;
    if (!handler) {
      delete _listeners[event];
      if (_debug) console.log('[v13:events] off ALL:', event);
      return;
    }
    for (var i = _listeners[event].length - 1; i >= 0; i--) {
      if (_listeners[event][i] === handler) {
        _listeners[event].splice(i, 1);
      }
    }
    if (_listeners[event].length === 0) {
      delete _listeners[event];
    }
    if (_debug) console.log('[v13:events] off:', event);
  }

  /**
   * 发布事件
   * @param {string} event - 事件名
   * @param {...*} args - 传递给 handler 的参数
   */
  function emit(event) {
    var handlers = _listeners[event];
    if (!handlers || handlers.length === 0) {
      if (_debug) console.log('[v13:events] emit (no listeners):', event);
      return;
    }
    if (_debug) console.log('[v13:events] emit:', event, '(to ' + handlers.length + ' listeners)');

    // 复制参数（去掉 event 名）
    var args = Array.prototype.slice.call(arguments, 1);

    // 逐个执行，handler 中的错误不影响其他 handler
    for (var i = 0; i < handlers.length; i++) {
      try {
        handlers[i].apply(null, args);
      } catch (e) {
        console.error('[v13:events] handler error for', event + ':', e);
      }
    }
  }

  /**
   * 一次性订阅
   * @param {string} event
   * @param {function} handler
   */
  function once(event, handler) {
    var wrapper = function() {
      handler.apply(null, arguments);
      off(event, wrapper);
    };
    on(event, wrapper);
  }

  /**
   * 开启/关闭调试
   * @param {boolean} enabled
   */
  function debug(enabled) {
    _debug = !!enabled;
  }

  /**
   * 查看所有已注册的事件（调试用）
   * @returns {object}
   */
  function listAll() {
    var result = {};
    for (var evt in _listeners) {
      result[evt] = _listeners[evt].length;
    }
    return result;
  }

  /**
   * 移除所有监听器（仅用于测试/重置）
   */
  function reset() {
    _listeners = {};
    if (_debug) console.log('[v13:events] reset: all listeners cleared');
  }

  // 公开 API
  return {
    on:       on,
    off:      off,
    emit:     emit,
    once:     once,
    debug:    debug,
    listAll:  listAll,
    reset:    reset,
  };
})();

// src/core/state.js
/**
 * v13 State Manager — 集中状态管理
 * 
 * 依赖: core/events.js (Events)
 * 影响: 全系统所有模块
 * 
 * 设计原则:
 * - 单一数据源: 所有数据通过 state.get() / state.set() 读写
 * - 自动通知: set() 后自动 emit 对应事件
 * - 不可直接修改: 通过 state.update() 做不可变更新
 * - 对比档核心数据结构 (第八节) 在这里严格定义
 */

var State = (function() {
  'use strict';

  // ========================================================================
  // 初始状态
  // ========================================================================
  var _state = {
    // --- 核心数据 ---
    txs: [],                  // 交易记录 [{id, _fbKey, date, ...}]
    fundWithdrawals: [],      // 公基金 [{_fbKey, id, date, type, amount, note}]
    agentWallets: {},         // 代理钱包 { agentName: [records] }
    agentList: [],            // 代理名单 [name1, name2, ...]
    bookings: [],             // 订房记录 [{id, _fbKey, ...}]
    hotelConfig: [],          // 酒店设定 [{id, _fbKey, casino, hotel, ...}]
    workingMonth: '',         // 工作月份 "YYYY-MM"
    archives: {},             // 月度存档
    savedFilters: {},         // 查询已存筛选
    backupList: [],           // 备份清单

    // --- UI 状态 ---
    currentPage: 'overview',  // 当前页面
    editingId: null,          // 交易编辑中的 _fbKey
    fundEditingId: null,      // 公基金编辑中
    walletEditingId: null,    // 代理钱包编辑中
    bookingEditingId: null,   // 订房编辑中
    hcEditingId: null,        // 酒店设定编辑中
    syncConnected: true,      // Firebase 连接状态
    isLocked: false,          // 月末是否已锁定
    currentTimeFilter: null,  // 总览时间筛选器
    isModalOpen: false,       // 是否有弹窗开启（影响快捷键行为）
    sidebarCollapsed: false,  // 侧边栏是否折叠

    // --- 排序 ---
    sortState: { table: '', col: '', asc: true },

    // --- 自增 ID ---
    nextId: 1,                // 交易 ID
    fundNextId: 1,            // 公基金 ID
    walletNextId: 1,          // 代理钱包 ID
    bookingNextId: 1,         // 订房 ID
    hcNextId: 1,              // 酒店设定 ID

    // --- 密码 ---
    password: '',             // 当前密码 (sessionStorage 同步)

    // --- 草稿 ---
    draftTimer: null,         // 草稿防抖 timer
  };

  // ========================================================================
  // 全局变量兼容 (旧代码引用的 var 变量)
  // 这些变量由 State.set 自动同步，旧模块可通过 var 直接访问
  // ========================================================================
  window.txs = _state.txs;
  window.fundWithdrawals = _state.fundWithdrawals;
  window.agentWallets = _state.agentWallets;
  window.agentList = _state.agentList;
  window.workingMonth = _state.workingMonth;
  window.nextId = _state.nextId;
  window.fundNextId = _state.fundNextId;
  window.agentWalletNextId = _state.walletNextId;
  window.editId = _state.editingId;
  window.sortState = _state.sortState;
  window._syncConnected = _state.syncConnected;
  window._draftTimer = _state.draftTimer;
  window.__currentTimeFilter = _state.currentTimeFilter;

  // ========================================================================
  // 事件→State 路径映射 (set() 自动 emit 的事件)
  // ========================================================================
  var _pathEvents = {
    'txs':               EVENTS.TXS_LOADED,
    'fundWithdrawals':   EVENTS.FUND_LOADED,
    'agentWallets':      EVENTS.WALLETS_LOADED,
    'agentList':         EVENTS.AGENT_LIST_LOADED,
    'bookings':          EVENTS.BOOKINGS_LOADED,
    'hotelConfig':       EVENTS.HC_CONFIG_LOADED,
    'workingMonth':      EVENTS.MONTH_CHANGED,
    'currentPage':       EVENTS.PAGE_CHANGED,
    'syncConnected':     EVENTS.CONNECTION_CHANGED,
  };

  // ========================================================================
  // 公开方法
  // ========================================================================

  /**
   * 获取状态值
   * @param {string} key - 状态键名
   * @returns {*}
   */
  function get(key) {
    if (!key) return _state;
    return _state[key];
  }

  /**
   * 设定状态值 (会触发对应事件)
   * @param {string} key - 状态键名
   * @param {*} value - 新值
   * @param {boolean} [silent=false] - 是否抑制事件
   */
  function set(key, value, silent) {
    var oldValue = _state[key];
    _state[key] = value;

    // 同步全局变量
    _syncGlobals(key, value);

    // 自动 emit 对应事件
    if (!silent && _pathEvents[key]) {
      Events.emit(_pathEvents[key], value, oldValue);
    }
  }

  /**
   * 批量设定 (所有设完后 emit 一次事件)
   * @param {object} updates - { key: value, ... }
   * @param {string} [event] - 统一 emit 的事件名
   */
  function batchSet(updates, event) {
    for (var key in updates) {
      _state[key] = updates[key];
      _syncGlobals(key, updates[key]);
    }
    if (event) {
      Events.emit(event, updates);
    }
  }

  /**
   * 不可变更新数组/对象
   * @param {string} key - 状态键名
   * @param {function} updater - (currentValue) → newValue
   * @param {boolean} [silent=false]
   * @returns {*} 新值
   */
  function update(key, updater, silent) {
    var newValue = updater(_state[key]);
    set(key, newValue, silent);
    return newValue;
  }

  /**
   * 获取下一个自增 ID
   * @param {string} type - 'tx'|'fund'|'wallet'|'booking'|'hc'
   * @returns {number}
   */
  function nextId(type) {
    var keyMap = {
      tx:      'nextId',
      fund:    'fundNextId',
      wallet:  'walletNextId',
      booking: 'bookingNextId',
      hc:      'hcNextId',
    };
    var key = keyMap[type] || 'nextId';
    var id = _state[key];
    _state[key] = id + 1;
    _syncGlobals(key, _state[key]);
    return id;
  }

  /**
   * 重设自增 ID
   * @param {string} type
   * @param {number} value
   */
  function resetNextId(type, value) {
    var keyMap = {
      tx: 'nextId', fund: 'fundNextId', wallet: 'walletNextId',
      booking: 'bookingNextId', hc: 'hcNextId',
    };
    var key = keyMap[type] || 'nextId';
    _state[key] = value;
    _syncGlobals(key, value);
  }

  /**
   * 重置全部状态 (仅用于登出/测试)
   */
  function reset() {
    _state.txs = [];
    _state.fundWithdrawals = [];
    _state.agentWallets = {};
    _state.agentList = [];
    _state.bookings = [];
    _state.hotelConfig = [];
    _state.workingMonth = '';
    _state.archives = {};
    _state.savedFilters = {};
    _state.backupList = [];
    _state.currentPage = 'overview';
    _state.editingId = null;
    _state.fundEditingId = null;
    _state.walletEditingId = null;
    _state.bookingEditingId = null;
    _state.hcEditingId = null;
    _state.isLocked = false;
    _state.currentTimeFilter = null;
    _state.isModalOpen = false;
    _state.sidebarCollapsed = false;
    _state.sortState = { table: '', col: '', asc: true };
    _state.nextId = 1;
    _state.fundNextId = 1;
    _state.walletNextId = 1;
    _state.bookingNextId = 1;
    _state.hcNextId = 1;
    _state.password = '';
    _state.draftTimer = null;
    _syncAllGlobals();
  }

  // ========================================================================
  // 内部方法
  // ========================================================================

  /**
   * 同步全局变量
   */
  function _syncGlobals(key, value) {
    var map = {
      'txs':              function(v) { window.txs = v; },
      'fundWithdrawals':  function(v) { window.fundWithdrawals = v; },
      'agentWallets':     function(v) { window.agentWallets = v; },
      'agentList':        function(v) { window.agentList = v; },
      'workingMonth':     function(v) { window.workingMonth = v; },
      'nextId':           function(v) { window.nextId = v; },
      'fundNextId':       function(v) { window.fundNextId = v; },
      'walletNextId':     function(v) { window.agentWalletNextId = v; },
      'editingId':        function(v) { window.editId = v; },
      'sortState':        function(v) { window.sortState = v; },
      'syncConnected':    function(v) { window._syncConnected = v; },
      'draftTimer':       function(v) { window._draftTimer = v; },
      'currentTimeFilter':function(v) { window.__currentTimeFilter = v; },
    };
    if (map[key]) map[key](value);
  }

  /**
   * 同步所有全局变量
   */
  function _syncAllGlobals() {
    for (var key in _state) {
      _syncGlobals(key, _state[key]);
    }
  }

  // ========================================================================
  // 公开 API
  // ========================================================================
  return {
    get:          get,
    set:          set,
    batchSet:     batchSet,
    update:       update,
    nextId:       nextId,
    resetNextId:  resetNextId,
    reset:        reset,
  };
})();

// src/core/store.js
/**
 * v13 Store — localStorage 持久化层
 * 
 * 依赖: core/constants.js (STORAGE_KEYS), utils/crypto.js (encryptData/decryptData)
 * 影响: 全系统 CRUD 操作
 * 
 * 对照档: 第七节模块12 (backup.js), 第六节 localStorage 键
 * 
 * 职责:
 * - 所有 localStorage 读写统一入口
 * - AES 加密/解密透明处理
 * - 保存后自动 emit 对应事件
 */

var Store = (function() {
  'use strict';

  // ========================================================================
  // 基础读写
  // ========================================================================

  /**
   * 储存到 localStorage
   * @param {string} key - STORAGE_KEYS 中的键名或自定义字符串
   * @param {*} data - 要储存的数据
   * @param {boolean} [encrypt=false] - 是否 AES 加密
   */
  function save(key, data, encrypt) {
    try {
      var value = encrypt ? encryptData(data) : JSON.stringify(data);
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('[v13:store] save error for', key + ':', e);
      try {
        // 可能是存储空间不足，尝试清除旧备份后重试
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e2) {
        console.error('[v13:store] save retry also failed for', key + ':', e2);
      }
    }
  }

  /**
   * 从 localStorage 读取
   * @param {string} key
   * @param {boolean} [decrypt=false] - 是否 AES 解密
   * @returns {*}
   */
  function load(key, decrypt) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      if (decrypt) {
        return decryptData(raw);
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('[v13:store] load error for', key + ':', e);
      return null;
    }
  }

  /**
   * 删除 localStorage 键
   * @param {string} key
   */
  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[v13:store] remove error for', key + ':', e);
    }
  }

  // ========================================================================
  // 专项存取 (对照档第六节 — 16 个 key)
  // ========================================================================

  // --- 交易 ---
  function saveTxs(txs) {
    save(STORAGE_KEYS.DATA, txs, true);
  }
  function loadTxs() {
    return load(STORAGE_KEYS.DATA, true) || [];
  }

  // --- 公基金 ---
  function saveFund(fund) {
    save(STORAGE_KEYS.FUND, fund, true);
  }
  function loadFund() {
    return load(STORAGE_KEYS.FUND, true) || [];
  }

  // --- 代理钱包 ---
  function saveWallets(wallets) {
    save(STORAGE_KEYS.AGENT_WALLETS, wallets, true);
  }
  function loadWallets() {
    return load(STORAGE_KEYS.AGENT_WALLETS, true) || {};
  }

  // --- 代理名单 ---
  function saveAgentList(list) {
    save(STORAGE_KEYS.AGENT_LIST, list, false);
  }
  function loadAgentList() {
    return load(STORAGE_KEYS.AGENT_LIST, false) || [];
  }

  // --- 草稿 ---
  function saveDraft(draft) {
    save(STORAGE_KEYS.DRAFT, draft, false);
  }
  function loadDraft() {
    return load(STORAGE_KEYS.DRAFT, false);
  }

  // --- 配置 ---
  function saveConfig(config) {
    save(STORAGE_KEYS.CONFIG, config, false);
  }
  function loadConfig() {
    return load(STORAGE_KEYS.CONFIG, false) || {};
  }

  // --- 工作月份 ---
  function saveWorkingMonth(month) {
    localStorage.setItem(STORAGE_KEYS.WORKING_MONTH, month);
  }
  function loadWorkingMonth() {
    return localStorage.getItem(STORAGE_KEYS.WORKING_MONTH) || '';
  }

  // --- 月度存档 ---
  function saveArchives(archives) {
    save(STORAGE_KEYS.ARCHIVES, archives, false);
  }
  function loadArchives() {
    return load(STORAGE_KEYS.ARCHIVES, false) || {};
  }

  // --- 已存筛选 ---
  function saveFilters(filters) {
    save(STORAGE_KEYS.SAVED_FILTERS, filters, false);
  }
  function loadFilters() {
    return load(STORAGE_KEYS.SAVED_FILTERS, false) || {};
  }

  // --- 备份 ---
  function saveBackupList(list) {
    save(STORAGE_KEYS.BACKUP_LIST, list, false);
  }
  function loadBackupList() {
    return load(STORAGE_KEYS.BACKUP_LIST, false) || [];
  }
  function saveBackup(dateStr, data) {
    save(STORAGE_KEYS.BACKUP_PREFIX + dateStr, data, false);
  }
  function loadBackup(dateStr) {
    return load(STORAGE_KEYS.BACKUP_PREFIX + dateStr, false);
  }

  // --- 授权 ---
  function saveAuth(val) {
    localStorage.setItem(STORAGE_KEYS.AUTH, val || '1');
  }
  function loadAuth() {
    return localStorage.getItem(STORAGE_KEYS.AUTH);
  }

  // --- 最后备份日期 ---
  function saveLastBackupDate(dateStr) {
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, dateStr);
  }
  function loadLastBackupDate() {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE) || '';
  }

  // --- 订房 ---
  function saveBookings(bookings) {
    save(STORAGE_KEYS.RM_BOOKINGS, bookings, false);
  }
  function loadBookings() {
    var bookings = load(STORAGE_KEYS.RM_BOOKINGS, false) || [];
    // 数据迁移：修正旧数据中 month 字段格式 (YYYY/MM → YYYY-MM)
    var fixed = 0;
    for (var i = 0; i < bookings.length; i++) {
      if (bookings[i].month && bookings[i].month.indexOf('/') >= 0) {
        bookings[i].month = bookings[i].month.replace(/\//g, '-');
        fixed++;
      }
      if (bookings[i].checkIn && bookings[i].checkIn.indexOf('/') >= 0) {
        bookings[i].checkIn = bookings[i].checkIn.replace(/\//g, '-');
      }
      if (bookings[i].checkOut && bookings[i].checkOut.indexOf('/') >= 0) {
        bookings[i].checkOut = bookings[i].checkOut.replace(/\//g, '-');
      }
    }
    if (fixed > 0) {
      console.log('[v13:store] Migrated ' + fixed + ' bookings: month format YYYY/MM → YYYY-MM');
      // 保存修正后的数据
      save(STORAGE_KEYS.RM_BOOKINGS, bookings, false);
    }
    return bookings;
  }
  function saveBookingLastId(id) {
    localStorage.setItem(STORAGE_KEYS.RM_LAST_ID, String(id));
  }
  function loadBookingLastId() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.RM_LAST_ID), 10) || 0;
  }

  // --- 酒店设定 ---
  function saveHCConfig(config) {
    save(STORAGE_KEYS.HC_CONFIG, config, false);
  }
  function loadHCConfig() {
    return load(STORAGE_KEYS.HC_CONFIG, false) || [];
  }
  function saveHCPresetVersion(ver) {
    localStorage.setItem(STORAGE_KEYS.HC_PRESET_VERSION, String(ver));
  }
  function loadHCPresetVersion() {
    return localStorage.getItem(STORAGE_KEYS.HC_PRESET_VERSION) || '';
  }

  // --- 版本 ---
  function saveAppVersion(ver) {
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, ver);
  }
  function loadAppVersion() {
    return localStorage.getItem(STORAGE_KEYS.APP_VERSION) || '';
  }

  // ========================================================================
  // 一键全量保存/加载
  // ========================================================================

  /**
   * 将 State 全部写入 localStorage
   */
  function saveAll() {
    saveTxs(State.get('txs'));
    saveFund(State.get('fundWithdrawals'));
    saveWallets(State.get('agentWallets'));
    saveAgentList(State.get('agentList'));
    saveBookings(State.get('bookings'));
    saveHCConfig(State.get('hotelConfig'));
    saveArchives(State.get('archives'));
    saveConfig({ workingMonth: State.get('workingMonth') });
    saveWorkingMonth(State.get('workingMonth'));
    saveFilters(State.get('savedFilters'));
    saveBackupList(State.get('backupList'));
    saveAuth('1');
    saveAppVersion(APP.VERSION);
  }

  /**
   * 从 localStorage 全部加载到 State
   * @param {boolean} [silent=false] - 是否抑制事件
   */
  function loadAll(silent) {
    State.batchSet({
      txs:             loadTxs(),
      fundWithdrawals: loadFund(),
      agentWallets:    loadWallets(),
      agentList:       loadAgentList(),
      bookings:        loadBookings(),
      hotelConfig:     loadHCConfig(),
      archives:        loadArchives(),
      savedFilters:    loadFilters(),
      backupList:      loadBackupList(),
      workingMonth:    loadWorkingMonth(),
    }, silent ? null : 'store:loaded');

    // 自增 ID 恢复
    var txs = State.get('txs');
    if (txs.length > 0) {
      var maxId = 0;
      for (var i = 0; i < txs.length; i++) {
        if (txs[i].id > maxId) maxId = txs[i].id;
      }
      State.resetNextId('tx', maxId + 1);
    }

    var bookings = State.get('bookings');
    if (bookings.length > 0) {
      var maxBId = loadBookingLastId();
      State.resetNextId('booking', maxBId + 1);
    }
  }

  // ========================================================================
  // 公开 API
  // ========================================================================
  return {
    // 基础
    save:         save,
    load:         load,
    remove:       remove,
    // 专项
    saveTxs:            saveTxs,
    loadTxs:            loadTxs,
    saveFund:           saveFund,
    loadFund:           loadFund,
    saveWallets:        saveWallets,
    loadWallets:        loadWallets,
    saveAgentList:      saveAgentList,
    loadAgentList:      loadAgentList,
    saveDraft:          saveDraft,
    loadDraft:          loadDraft,
    saveConfig:         saveConfig,
    loadConfig:         loadConfig,
    saveWorkingMonth:   saveWorkingMonth,
    loadWorkingMonth:   loadWorkingMonth,
    saveArchives:       saveArchives,
    loadArchives:       loadArchives,
    saveFilters:        saveFilters,
    loadFilters:        loadFilters,
    saveBackupList:     saveBackupList,
    loadBackupList:     loadBackupList,
    saveBackup:         saveBackup,
    loadBackup:         loadBackup,
    saveAuth:           saveAuth,
    loadAuth:           loadAuth,
    saveLastBackupDate: saveLastBackupDate,
    loadLastBackupDate: loadLastBackupDate,
    saveBookings:       saveBookings,
    loadBookings:       loadBookings,
    saveBookingLastId:  saveBookingLastId,
    loadBookingLastId:  loadBookingLastId,
    saveHCConfig:       saveHCConfig,
    loadHCConfig:       loadHCConfig,
    saveHCPresetVersion:saveHCPresetVersion,
    loadHCPresetVersion:loadHCPresetVersion,
    saveAppVersion:     saveAppVersion,
    loadAppVersion:     loadAppVersion,
    // 全量
    saveAll:      saveAll,
    loadAll:      loadAll,
  };
})();

// src/calc/finance.js
/**
 * v13 财务计算模块
 * 
 * 依赖: utils/format.js (fmt, toNum, calcComm, calcFund, calcUndrawn)
 *        core/state.js (State)
 * 
 * 对照档: 第十一节核心计算公式
 * 
 * 全部纯函数，无副作用，100% 可测试。
 * 这是防止「差钱」问题的最后一道防线。
 */

// ============================================================================
// 单笔交易计算
// ============================================================================

/**
 * 从交易对象计算完整金额
 * @param {object} tx - 交易对象
 * @returns {object} { comm, fund, undrawn }
 */
function calcTxAmounts(tx) {
  var vol = toNum(tx.volume);
  var rate = toNum(tx.rate);
  var comm = calcComm(vol, rate);
  var bonus = toNum(tx.bonus);
  var drawn = toNum(tx.drawn);
  var fund = calcFund(comm, bonus);
  var undrawn = calcUndrawn(bonus, drawn);
  return {
    comm:    comm,
    fund:    fund,
    undrawn: undrawn,
  };
}

/**
 * 验证交易金额一致性 (comm = bonus + fund)
 * @param {object} tx
 * @returns {boolean}
 */
function validateTxAmounts(tx) {
  var amounts = calcTxAmounts(tx);
  return amounts.comm === toNum(tx.bonus) + toNum(tx.fund);
}

// ============================================================================
// 聚合计算
// ============================================================================

/**
 * 计算所有交易的洗码量总和
 * @param {Array} txs - 交易数组
 * @returns {number}
 */
function totalVolume(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].volume);
  }
  return sum;
}

/**
 * 计算所有交易的佣金总和
 * @param {Array} txs
 * @returns {number}
 */
function totalComm(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].comm);
  }
  return sum;
}

/**
 * 计算所有交易的码粮总和
 * @param {Array} txs
 * @returns {number}
 */
function totalBonus(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].bonus);
  }
  return sum;
}

/**
 * 计算所有交易的公基金总和
 * @param {Array} txs
 * @returns {number}
 */
function totalFund(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].fund);
  }
  return sum;
}

/**
 * 计算所有交易的已提领总和
 * @param {Array} txs
 * @returns {number}
 */
function totalDrawn(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].drawn);
  }
  return sum;
}

/**
 * 计算所有交易的未提领总和
 * @param {Array} txs
 * @returns {number}
 */
function totalUndrawn(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].undrawn);
  }
  return sum;
}

/**
 * 计算所有交易的现金寄放总和
 * @param {Array} txs
 * @returns {number}
 */
function totalCash(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].cash) || 0;
  }
  return sum;
}

// ============================================================================
// 公基金余额计算 (对照档第十一节)
// ============================================================================

/**
 * 计算公基金余额
 * 余额 = 所有佣金总和 + 公基金存入 - 公基金提领
 * @param {Array} txs - 交易数组 (佣金来源)
 * @param {Array} fundWithdrawals - 公基金记录
 * @returns {number}
 */
function calcFundBalance(txs, fundWithdrawals) {
  var balance = totalFund(txs);
  for (var i = 0; i < fundWithdrawals.length; i++) {
    var fw = fundWithdrawals[i];
    if (fw.type === 'deposit' || fw.type === 'cash_deposit') {
      balance += toNum(fw.amount);
    } else if (fw.type === 'withdraw') {
      balance -= toNum(fw.amount);
    }
  }
  return Math.max(0, balance);
}

// ============================================================================
// 代理钱包余额计算 (对照档第十一节)
// ============================================================================

/**
 * 计算单个代理的钱包余额
 * 余额 = 码粮 + 现金寄放 + 钱包存入 + 钱包自存现金 - 已提领(交易+钱包)
 * @param {string} agentName - 代理名
 * @param {Array} txs - 交易数组
 * @param {object} agentWallets - 代理钱包 { agentName: [records] }
 * @returns {number}
 */
function calcAgentBalance(agentName, txs, agentWallets) {
  // 从交易中计算该代理的码粮和现金寄放
  var bonusSum = 0;
  var cashSum = 0;
  var drawnSum = 0;
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    if (tx.agent === agentName) {
      bonusSum += toNum(tx.bonus);
      cashSum += toNum(tx.cash) || 0;
      drawnSum += toNum(tx.drawn);
    }
  }

  // 从代理钱包中计算存入和提领
  var awDeposit = 0;
  var awCashDep = 0;
  var awWithdraw = 0;
  var records = agentWallets[agentName] || [];
  for (var j = 0; j < records.length; j++) {
    var r = records[j];
    if (r.type === 'deposit') {
      awDeposit += toNum(r.amount);
    } else if (r.type === 'cash_deposit') {
      awCashDep += toNum(r.amount);
    } else if (r.type === 'withdraw') {
      awWithdraw += toNum(r.amount);
    }
  }

  var balance = bonusSum + cashSum + awDeposit + awCashDep - Math.max(awWithdraw, drawnSum);
  return Math.max(0, balance);
}

/**
 * 计算总钱包余额 (所有代理 + 公基金)
 * @param {Array} txs
 * @param {Array} fundWithdrawals
 * @param {object} agentWallets
 * @returns {number}
 */
function calcTotalWallet(txs, fundWithdrawals, agentWallets) {
  var total = calcFundBalance(txs, fundWithdrawals);
  // 去重代理名
  var agents = {};
  for (var i = 0; i < txs.length; i++) {
    var a = txs[i].agent;
    if (a) agents[a] = true;
  }
  for (var agent in agentWallets) {
    agents[agent] = true;
  }
  for (var name in agents) {
    total += calcAgentBalance(name, txs, agentWallets);
  }
  return total;
}

// ============================================================================
// 房务计算
// ============================================================================

/**
 * 计算订房的额度使用率
 * @param {Array} bookings - 订房数组
 * @param {Array} txs - 交易数组 (用于计算总洗码量)
 * @param {string} [month] - 指定月份 "YYYY-MM"
 * @returns {object} { totalVolume, usedThreshold, remainingThreshold, usageRate }
 */
function calcRoomQuota(bookings, txs, month) {
  var totalVolume = 0;
  // 月份归一化 ("2026/06" → "2026-06")
  var normMonth = month ? month.replace(/\//g, '-') : '';

  for (var i = 0; i < txs.length; i++) {
    // 日期归一化后再匹配 (支持 "YYYY-MM-DD" 和 "YYYY/MM/DD")
    var txDate = (txs[i].date || '').replace(/\//g, '-');
    if (!normMonth || txDate.indexOf(normMonth) === 0) {
      totalVolume += toNum(txs[i].volume);
    }
  }

  var usedThreshold = 0;
  for (var j = 0; j < bookings.length; j++) {
    // month 字段归一化后再匹配
    var bkMonth = (bookings[j].month || '').replace(/\//g, '-');
    if (!normMonth || bkMonth === normMonth) {
      usedThreshold += toNum(bookings[j].threshold) || 0;
    }
  }

  var remaining = Math.max(0, totalVolume - usedThreshold);
  // 额度使用率计算
  // 业务规则：
  //   1. 有出场量 → 使用率 = 已用额度 / 总出场量
  //   2. 无出场量但有登记额度 → 100%（超额，无出场量支撑却已占用额度）
  //   3. 无任何数据 → 0%
  var rate;
  if (totalVolume > 0) {
    rate = (usedThreshold / totalVolume) * 100;
  } else if (usedThreshold > 0) {
    rate = 100; // 无出场但有登记额度 = 100%已用
  } else {
    rate = 0;
  }

  return {
    totalVolume:      totalVolume,
    usedThreshold:    usedThreshold,
    remainingThreshold: remaining,
    usageRate:        Math.min(100, rate),
  };
}

// ============================================================================
// 月末结算验证
// ============================================================================

/**
 * 验证月末结算数据一致性
 * @param {string} month - "YYYY-MM"
 * @param {Array} txs - 当月交易
 * @param {Array} fundWithdrawals
 * @param {object} agentWallets
 * @returns {object} { balanced, issues: [] }
 */
function validateMonthBalance(month, txs, fundWithdrawals, agentWallets) {
  var issues = [];
  var monthTxs = [];

  for (var i = 0; i < txs.length; i++) {
    // ★ 防御：跳过 undefined 或没有 date 的墓碑条目
    if (!txs[i] || !txs[i].date) continue;
    if (txs[i].date.indexOf(month) === 0) {
      monthTxs.push(txs[i]);
    }
  }

  // 检查每笔交易的佣金 = 码粮 + 公基金
  for (var j = 0; j < monthTxs.length; j++) {
    if (!validateTxAmounts(monthTxs[j])) {
      issues.push('交易 #' + monthTxs[j].id + ' 佣金与码粮+公基金不一致');
    }
  }

  // 检查未提领 = max(0, 码粮 - 已提领)
  for (var k = 0; k < monthTxs.length; k++) {
    var tx = monthTxs[k];
    var expectedUndrawn = calcUndrawn(toNum(tx.bonus), toNum(tx.drawn));
    if (toNum(tx.undrawn) !== expectedUndrawn) {
      issues.push('交易 #' + tx.id + ' 未提领计算错误: ' + tx.undrawn + ' ≠ ' + expectedUndrawn);
    }
  }

  return {
    balanced: issues.length === 0,
    issues:   issues,
  };
}

// src/calc/stats.js
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

// src/calc/filters.js
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
    // ★ 防御：跳过 undefined 或没有 date 的墓碑条目
    if (!txs[i] || !txs[i].date) continue;
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

// src/data/transactions.js
/**
 * v13 交易数据模块
 * 
 * 依赖: core/state.js (State), core/events.js (Events), core/store.js (Store)
 *        utils/format.js (nowStr, getDow, calcComm, calcFund, calcUndrawn)
 *        calc/finance.js (calcTxAmounts, validateTxAmounts)
 *        calc/filters.js (sortTxs)
 * 
 * 对照档: 第七节模块4 + 模块5
 * 
 * 事件: emit tx:created, tx:updated, tx:deleted
 */

// ============================================================================
// CRUD 操作
// ============================================================================

/**
 * 新增交易
 * @param {object} formData - 表单数据 { type, date, agent, client, venue, volume, rate, bonus, drawn, cash, note }
 * @returns {object} 新增的交易对象
 */
function createTx(formData) {
  var txs = State.get('txs');
  var month = State.get('workingMonth');

  // 计算金额
  var vol = toNum(formData.volume);
  var rate = toNum(formData.rate);
  var comm = calcComm(vol, rate);
  var bonus = toNum(formData.bonus);
  var drawn = toNum(formData.drawn);
  var fund = calcFund(comm, bonus);
  var undrawn = calcUndrawn(bonus, drawn);

  // 生成 _fbKey
  var fbKey = generateFbKey();

  var tx = {
    id:         State.nextId('tx'),
    _fbKey:     fbKey,
    _createdAt: Date.now(),
    _updatedAt: Date.now(),
    date:    formData.date || nowStr(),
    dow:     getDow(formData.date || nowStr()),
    type:    formData.type || 'rolling',
    agent:   formData.agent || '',
    client:  formData.client || '',
    venue:   formData.venue || '',
    volume:  vol,
    rate:    rate,
    comm:    comm,
    bonus:   bonus,
    drawn:   drawn,
    undrawn: undrawn,
    fund:    fund,
    cash:    toNum(formData.cash) || 0,
    note:    formData.note || '',
  };

  // 更新 State
  State.update('txs', function(arr) {
    arr.push(tx);
    return arr;
  });

  // 持久化
  Store.saveTxs(State.get('txs'));

  // ★ 即時同步到 Firebase
  console.log('[v13:tx] 📤 createTx → calling syncTxToFirebase... fbKey=' + tx._fbKey + ' type=' + tx.type);
  syncTxToFirebase(tx);

  // 通知事件
  Events.emit(EVENTS.TX_CREATED, tx);

  return tx;
}

/**
 * 编辑交易
 * @param {string} fbKey - 交易的 _fbKey
 * @param {object} formData - 新表单数据
 * @returns {object|null} 更新后的交易对象，找不到返回 null
 */
function updateTx(fbKey, formData) {
  var txs = State.get('txs');
  var updated = null;

  State.update('txs', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._fbKey === fbKey) {
        var vol = toNum(formData.volume);
        var rate = toNum(formData.rate);
        var comm = calcComm(vol, rate);
        var bonus = toNum(formData.bonus);
        var drawn = toNum(formData.drawn);
        var fund = calcFund(comm, bonus);
        var undrawn = calcUndrawn(bonus, drawn);

        arr[i].date    = formData.date || arr[i].date;
        arr[i].dow     = getDow(formData.date || arr[i].date);
        arr[i].type    = formData.type != null ? formData.type : arr[i].type;
        arr[i].agent   = formData.agent != null ? formData.agent : arr[i].agent;
        arr[i].client  = formData.client != null ? formData.client : arr[i].client;
        arr[i].venue   = formData.venue != null ? formData.venue : arr[i].venue;
        arr[i].volume  = vol;
        arr[i].rate    = rate;
        arr[i].comm    = comm;
        arr[i].bonus   = bonus;
        arr[i].drawn   = drawn;
        arr[i].undrawn = undrawn;
        arr[i].fund    = fund;
        arr[i].cash    = toNum(formData.cash) || 0;
        arr[i].note    = formData.note != null ? formData.note : arr[i].note;
        arr[i]._updatedAt = Date.now();

        updated = arr[i];
        break;
      }
    }
    return arr;
  });

  if (!updated) return null;

  // 持久化
  Store.saveTxs(State.get('txs'));

  // ★ 即時同步到 Firebase
  syncTxToFirebase(updated);

  // 通知事件
  Events.emit(EVENTS.TX_UPDATED, updated);

  return updated;
}

/**
 * 删除交易
 * @param {string} fbKey - 交易的 _fbKey
 * @returns {object|null} 被删除的交易对象，找不到返回 null
 */
function deleteTx(fbKey) {
  console.log('[v13:tx] 🔵 deleteTx ENTERED, fbKey=' + fbKey + ', 當前 txs 數量=' + State.get('txs').length);
  var deleted = null;

  State.update('txs', function(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i]._fbKey === fbKey) {
        deleted = arr[i];
        arr.splice(i, 1);
        console.log('[v13:tx] 🗑️  從陣列移除 index=' + i + ', 剩餘=' + arr.length);
        break;
      }
    }
    return arr;
  });

  if (!deleted) {
    console.warn('[v13:tx] ⚠️ deleteTx 未找到 fbKey=' + fbKey + '! 可能已被刪除');
    return null;
  }

  console.log('[v13:tx] 💾 持久化 Storage...');
  // 持久化
  Store.saveTxs(State.get('txs'));

  console.log('[v13:tx] 🔥 從 Firebase 移除...');
  // ★ 即時從 Firebase 刪除
  removeTxFromFirebase(fbKey);

  // 通知事件
  Events.emit(EVENTS.TX_DELETED, deleted);
  console.log('[v13:tx] ✅ deleteTx 完成, 新 txs 數量=' + State.get('txs').length);

  return deleted;
}

// ============================================================================
// 查询
// ============================================================================

/**
 * 按 _fbKey 查找交易
 * @param {string} fbKey
 * @returns {object|null}
 */
function getTxByKey(fbKey) {
  var txs = State.get('txs');
  for (var i = 0; i < txs.length; i++) {
    if (txs[i]._fbKey === fbKey) return txs[i];
  }
  return null;
}

/**
 * 按 ID 查找交易
 * @param {number} id
 * @returns {object|null}
 */
function getTxById(id) {
  var txs = State.get('txs');
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].id === id) return txs[i];
  }
  return null;
}

/**
 * 获取所有交易 (副本)
 * @returns {Array}
 */
function getAllTxs() {
  return State.get('txs').slice();
}

/**
 * 获取指定月份的交易
 * @param {string} month - "YYYY-MM"
 * @returns {Array}
 */
function getTxsForMonth(month) {
  return filterByMonth(State.get('txs'), month);
}

// ============================================================================
// 排序
// ============================================================================

/**
 * 表格排序 (切换升序/降序)
 * @param {string} tableId - 表格 ID (用于状态记录)
 * @param {string} colName - 列名
 * @returns {Array} 排序后的数组 (不修改 State)
 */
function sortTable(tableId, colName) {
  var ss = State.get('sortState');
  if (ss.table === tableId && ss.col === colName) {
    ss.asc = !ss.asc;
  } else {
    ss.table = tableId;
    ss.col = colName;
    ss.asc = true;
  }
  State.set('sortState', ss);
  return sortTxs(State.get('txs'), colName, ss.asc);
}

// ============================================================================
// 月末结算
// ============================================================================

/**
 * 月末结算：锁定当月
 * 将当月交易打包到 archives，然后不再允许当月交易
 * @returns {object} { success, month, txCount }
 */
function closeCurrentMonth() {
  var month = State.get('workingMonth');
  if (!month) {
    return { success: false, error: '无效的工作月份' };
  }

  var monthTxs = getTxsForMonth(month);

  // 保存到 archives
  var archives = State.get('archives') || {};
  archives[month] = {
    txs: monthTxs,
    closedAt: nowStr(),
    txCount: monthTxs.length,
    totalVolume: totalVolume(monthTxs),
    totalComm: totalComm(monthTxs),
  };
  State.set('archives', archives);
  Store.saveArchives(archives);

  // 锁定
  State.set('isLocked', true);

  // 通知事件
  Events.emit(EVENTS.MONTH_CLOSED, { month: month, txCount: monthTxs.length });

  return { success: true, month: month, txCount: monthTxs.length };
}

// ============================================================================
// Firebase Key 生成
// ============================================================================

/**
 * 生成 Firebase push key (客户端模拟)
 * 格式: -Lxxxxxxx (Firebase push key 风格)
 * @returns {string}
 */
function generateFbKey() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var result = '-L';
  for (var i = 0; i < 18; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// 批量操作
// ============================================================================

/**
 * 批量导入交易
 * @param {Array} importTxs - 待导入的交易数组
 * @param {boolean} [replace=false] - 是否替换现有数据
 * @returns {number} 导入数量
 */
function importTxs(importTxs, replace) {
  if (replace) {
    State.set('txs', []);
    State.resetNextId('tx', 1);
  }

  var count = 0;
  State.update('txs', function(arr) {
    for (var i = 0; i < importTxs.length; i++) {
      var tx = importTxs[i];
      // 确保有 _fbKey
      if (!tx._fbKey) tx._fbKey = generateFbKey();
      // 确保有 id
      if (!tx.id) tx.id = State.nextId('tx');
      // 重新计算金额
      var vol = toNum(tx.volume);
      var rate = toNum(tx.rate);
      tx.comm = calcComm(vol, rate);
      tx.bonus = toNum(tx.bonus);
      tx.drawn = toNum(tx.drawn);
      tx.fund = calcFund(tx.comm, tx.bonus);
      tx.undrawn = calcUndrawn(tx.bonus, tx.drawn);
      tx.cash = toNum(tx.cash) || 0;
      arr.push(tx);
      count++;
    }
    return arr;
  });

  Store.saveTxs(State.get('txs'));
  Events.emit(EVENTS.TXS_LOADED, State.get('txs'));
  return count;
}

/**
 * 清除所有交易
 */
function clearAllTxs() {
  State.set('txs', []);
  State.resetNextId('tx', 1);
  Store.saveTxs([]);
  Events.emit(EVENTS.TXS_LOADED, []);
}

/**
 * 重新计算所有交易的金额 (校正用)
 * @returns {number} 被修正的交易数
 */
function recalcAllTxs() {
  var fixedCount = 0;
  State.update('txs', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      var tx = arr[i];
      var comm = calcComm(toNum(tx.volume), toNum(tx.rate));
      var fund = calcFund(comm, toNum(tx.bonus));
      var undrawn = calcUndrawn(toNum(tx.bonus), toNum(tx.drawn));
      if (tx.comm !== comm || tx.fund !== fund || tx.undrawn !== undrawn) {
        tx.comm = comm;
        tx.fund = fund;
        tx.undrawn = undrawn;
        fixedCount++;
      }
    }
    return arr;
  });

  if (fixedCount > 0) {
    Store.saveTxs(State.get('txs'));
    Events.emit(EVENTS.TXS_LOADED, State.get('txs'));
  }

  return fixedCount;
}

// src/data/fund.js
/**
 * v13 公基金数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js, utils/format.js (nowStr, toNum)
 * 对照档: 第七节模块8
 * 
 * 事件: emit fund:created, fund:updated, fund:deleted
 */

// ============================================================================
// CRUD
// ============================================================================

/**
 * 新增公基金记录
 * @param {object} data - { date, type:'deposit'|'cash_deposit'|'withdraw', amount, note }
 * @returns {object}
 */
function createFund(data) {
  var fbKey = generateFbKey();
  var record = {
    _fbKey:     fbKey,
    _createdAt: Date.now(),
    _updatedAt: Date.now(),
    id:     State.nextId('fund'),
    date:   data.date || nowStr(),
    type:   data.type || 'deposit',
    amount: toNum(data.amount),
    note:   data.note || '',
  };

  State.update('fundWithdrawals', function(arr) {
    arr.push(record);
    return arr;
  });

  Store.saveFund(State.get('fundWithdrawals'));
  syncFundToFirebase(record);
  Events.emit(EVENTS.FUND_CREATED, record);
  return record;
}

/**
 * 编辑公基金记录
 * @param {string} fbKey
 * @param {object} data
 * @returns {object|null}
 */
function updateFund(fbKey, data) {
  var updated = null;
  State.update('fundWithdrawals', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._fbKey === fbKey) {
        if (data.date != null)   arr[i].date = data.date;
        if (data.type != null)   arr[i].type = data.type;
        if (data.amount != null) arr[i].amount = toNum(data.amount);
        if (data.note != null)   arr[i].note = data.note;
        arr[i]._updatedAt = Date.now();
        updated = arr[i];
        break;
      }
    }
    return arr;
  });

  if (!updated) return null;
  Store.saveFund(State.get('fundWithdrawals'));
  syncFundToFirebase(updated);
  Events.emit(EVENTS.FUND_UPDATED, updated);
  return updated;
}

/**
 * 删除公基金记录
 * @param {string} fbKey
 * @returns {object|null}
 */
function deleteFund(fbKey) {
  var deleted = null;
  State.update('fundWithdrawals', function(arr) {
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
  Store.saveFund(State.get('fundWithdrawals'));
  removeFundFromFirebase(fbKey);
  Events.emit(EVENTS.FUND_DELETED, deleted);
  return deleted;
}

// ============================================================================
// 查询
// ============================================================================

/**
 * 获取公基金余额
 * @returns {number}
 */
function getFundBalance() {
  return calcFundBalance(State.get('txs'), State.get('fundWithdrawals'));
}

/**
 * 获取所有公基金记录
 * @returns {Array}
 */
function getAllFunds() {
  return State.get('fundWithdrawals').slice();
}

// src/data/wallets.js
/**
 * v13 代理钱包数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js, utils/format.js (nowStr, toNum)
 *        calc/finance.js (calcAgentBalance, calcTotalWallet)
 * 对照档: 第七节模块9
 * 
 * 事件: emit wallet:created, wallet:updated, wallet:deleted
 */

// ============================================================================
// CRUD
// ============================================================================

/**
 * 新增代理钱包记录
 * @param {string} agentName - 代理名
 * @param {object} data - { date, type:'deposit'|'cash_deposit'|'withdraw', amount, note }
 * @returns {object}
 */
function createWallet(agentName, data) {
  var fbKey = generateFbKey();
  var record = {
    _fbKey:     fbKey,
    _createdAt: Date.now(),
    _updatedAt: Date.now(),
    id:     State.nextId('wallet'),
    date:   data.date || nowStr(),
    type:   data.type || 'deposit',
    amount: toNum(data.amount),
    note:   data.note || '',
  };

  State.update('agentWallets', function(wallets) {
    if (!wallets[agentName]) wallets[agentName] = [];
    wallets[agentName].push(record);
    return wallets;
  });

  Store.saveWallets(State.get('agentWallets'));
  syncWalletToFirebase(agentName, record);
  Events.emit(EVENTS.WALLET_CREATED, { agent: agentName, record: record });
  return record;
}

/**
 * 编辑代理钱包记录
 * @param {string} agentName
 * @param {string} fbKey
 * @param {object} data
 * @returns {object|null}
 */
function updateWallet(agentName, fbKey, data) {
  var updated = null;
  State.update('agentWallets', function(wallets) {
    var records = wallets[agentName];
    if (!records) return wallets;
    for (var i = 0; i < records.length; i++) {
      if (records[i]._fbKey === fbKey) {
        if (data.date != null)   records[i].date = data.date;
        if (data.type != null)   records[i].type = data.type;
        if (data.amount != null) records[i].amount = toNum(data.amount);
        if (data.note != null)   records[i].note = data.note;
        records[i]._updatedAt = Date.now();
        updated = records[i];
        break;
      }
    }
    return wallets;
  });

  if (!updated) return null;
  Store.saveWallets(State.get('agentWallets'));
  syncWalletToFirebase(agentName, updated);
  Events.emit(EVENTS.WALLET_UPDATED, { agent: agentName, record: updated });
  return updated;
}

/**
 * 删除代理钱包记录
 * @param {string} agentName
 * @param {string} fbKey
 * @returns {object|null}
 */
function deleteWallet(agentName, fbKey) {
  var deleted = null;
  State.update('agentWallets', function(wallets) {
    var records = wallets[agentName];
    if (!records) return wallets;
    for (var i = records.length - 1; i >= 0; i--) {
      if (records[i]._fbKey === fbKey) {
        deleted = records[i];
        records.splice(i, 1);
        break;
      }
    }
    // 清空空代理
    if (records.length === 0) {
      delete wallets[agentName];
    }
    return wallets;
  });

  if (!deleted) return null;
  Store.saveWallets(State.get('agentWallets'));
  removeWalletFromFirebase(agentName, fbKey);
  Events.emit(EVENTS.WALLET_DELETED, { agent: agentName, record: deleted });
  return deleted;
}

// ============================================================================
// 查询
// ============================================================================

/**
 * 获取指定代理的钱包记录
 * @param {string} agentName
 * @returns {Array}
 */
function getWalletRecords(agentName) {
  var wallets = State.get('agentWallets');
  return (wallets[agentName] || []).slice();
}

/**
 * 获取指定代理的钱包余额
 * @param {string} agentName
 * @returns {number}
 */
function getAgentBalance(agentName) {
  return calcAgentBalance(agentName, State.get('txs'), State.get('agentWallets'));
}

/**
 * 获取总钱包余额
 * @returns {number}
 */
function getTotalWallet() {
  return calcTotalWallet(State.get('txs'), State.get('fundWithdrawals'), State.get('agentWallets'));
}

/**
 * 同步代理已提领 (将代理钱包中的提领同步到交易中)
 * @param {string} agentName
 */
function syncAgentDrawn(agentName) {
  var txs = State.get('txs');
  var wallets = State.get('agentWallets');
  var records = wallets[agentName] || [];

  // 计算钱包中的总提领
  var totalWithdrawn = 0;
  for (var i = 0; i < records.length; i++) {
    if (records[i].type === 'withdraw') {
      totalWithdrawn += records[i].amount;
    }
  }

  // 更新该代理所有交易的 drawn
  var changed = false;
  State.update('txs', function(arr) {
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].agent === agentName) {
        var bonus = toNum(arr[j].bonus);
        // 按比例分配已提领
        var drawn = bonus > 0 ? Math.min(totalWithdrawn, bonus) : 0;
        if (arr[j].drawn !== drawn) {
          arr[j].drawn = drawn;
          arr[j].undrawn = calcUndrawn(bonus, drawn);
          changed = true;
        }
        totalWithdrawn -= drawn;
        if (totalWithdrawn <= 0) totalWithdrawn = 0;
      }
    }
    return arr;
  });

  if (changed) {
    Store.saveTxs(State.get('txs'));
    Events.emit(EVENTS.TXS_LOADED, State.get('txs'));
  }
}

// src/data/agents.js
/**
 * v13 代理名单数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 * 对照档: 第七节模块11
 * 
 * 事件: emit agentList:updated
 */

/**
 * 新增代理
 * @param {string} name
 * @returns {object} { success, name }
 */
function addAgent(name) {
  if (!name || !name.trim()) {
    return { success: false, error: '代理名称不可为空' };
  }
  name = name.trim();

  var list = State.get('agentList');
  if (list.indexOf(name) >= 0) {
    return { success: false, error: '代理 "' + name + '" 已存在' };
  }

  State.update('agentList', function(arr) {
    arr.push(name);
    arr.sort(function(a, b) { return a.localeCompare(b); });
    return arr;
  });

  Store.saveAgentList(State.get('agentList'));
  syncAgentListToFirebase(State.get('agentList'));
  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
  return { success: true, name: name };
}

/**
 * 删除代理
 * @param {string} name
 * @returns {object}
 */
function removeAgent(name) {
  var removed = false;
  State.update('agentList', function(arr) {
    var idx = arr.indexOf(name);
    if (idx >= 0) {
      arr.splice(idx, 1);
      removed = true;
    }
    return arr;
  });

  if (!removed) {
    return { success: false, error: '代理 "' + name + '" 不存在' };
  }

  Store.saveAgentList(State.get('agentList'));
  syncAgentListToFirebase(State.get('agentList'));
  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
  return { success: true, name: name };
}

/**
 * 重命名代理 (同时更新所有交易和钱包)
 * @param {string} oldName
 * @param {string} newName
 * @returns {object}
 */
function renameAgent(oldName, newName) {
  if (!newName || !newName.trim()) {
    return { success: false, error: '新名称不可为空' };
  }
  newName = newName.trim();

  var list = State.get('agentList');
  if (oldName === newName) {
    return { success: true, name: newName };
  }
  if (list.indexOf(newName) >= 0) {
    return { success: false, error: '代理 "' + newName + '" 已存在' };
  }

  // 更新名单
  State.update('agentList', function(arr) {
    var idx = arr.indexOf(oldName);
    if (idx >= 0) arr[idx] = newName;
    arr.sort(function(a, b) { return a.localeCompare(b); });
    return arr;
  });

  // 更新交易中的代理名
  State.update('txs', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].agent === oldName) arr[i].agent = newName;
    }
    return arr;
  });

  // 更新钱包
  State.update('agentWallets', function(wallets) {
    if (wallets[oldName]) {
      wallets[newName] = wallets[oldName];
      delete wallets[oldName];
    }
    return wallets;
  });

  Store.saveAgentList(State.get('agentList'));
  Store.saveTxs(State.get('txs'));
  Store.saveWallets(State.get('agentWallets'));

  syncAgentListToFirebase(State.get('agentList'));

  Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));
  Events.emit(EVENTS.TXS_LOADED, State.get('txs'));

  return { success: true, name: newName };
}

/**
 * 获取所有代理
 * @returns {Array}
 */
function getAllAgents() {
  return State.get('agentList').slice();
}

/** 从经纪人管理面板新增代理 (供 HTML onclick) */
function addAgentFromMgr() {
  var nameEl = document.getElementById('mgr-agent-name');
  if (!nameEl) return;
  var name = nameEl.value.trim();
  if (!name) {
    showToast('请输入代理名称', 'warning');
    return;
  }
  var result = addAgent(name);
  if (result.success) {
    showToast('代理 ' + name + ' 已新增', 'success');
    nameEl.value = '';

    // 刷新代理列表 (调度事件)
    Events.emit(EVENTS.AGENT_LIST_UPDATED, State.get('agentList'));

    // 重新填充下拉选单
    var agentSel = document.getElementById('rm-agent');
    if (agentSel && typeof RM !== 'undefined' && RM.populateAgentDropdown) {
      RM.populateAgentDropdown();
    }
    var agentFilter = document.getElementById('rm-agent-filter');
    if (agentFilter && typeof RM !== 'undefined' && RM.populateAgentFilter) {
      RM.populateAgentFilter();
    }
  } else {
    showToast(result.error || '新增失败', 'error');
  }
}

// src/data/bookings.js
/**
 * v13 订房数据模块
 * 
 * 依赖: core/state.js, core/events.js, core/store.js
 *        utils/format.js (nowStr, calcNights, calcTotalCost, toNum)
 * 对照档: 第七节模块18 (RM 对象 24 方法)
 * 
 * 事件: emit booking:created, booking:updated, booking:deleted
 */

// ============================================================================
// CRUD
// ============================================================================

/**
 * 归一化日期字符串为 YYYY-MM 格式 (用于 month 字段)
 * 支持 YYYY/MM/DD 和 YYYY-MM-DD 输入
 */
function normalizeMonth(dateStr) {
  if (!dateStr) return nowStr().substring(0, 7); // "YYYY-MM"
  return dateStr.replace(/\//g, '-').substring(0, 7);
}

/**
 * 新增订房
 * @param {object} data
 * @returns {object}
 */
function createBooking(data) {
  var fbKey = generateFbKey();
  var nights = calcNights(data.checkIn, data.checkOut);
  var price = toNum(data.pricePerNight);
  var totalCost = nights * price;

  var booking = {
    id:            State.nextId('booking'),
    _fbKey:        fbKey,
    _createdAt:    Date.now(),
    _updatedAt:    Date.now(),
    date:          data.date || nowStr(),
    month:         normalizeMonth(data.checkIn),
    agent:         data.agent || '',
    client:        data.client || '',
    casino:        data.casino || '',
    hotel:         data.hotel || '',
    roomType:      data.roomType || '',
    checkIn:       data.checkIn || '',
    checkOut:      data.checkOut || '',
    nights:        nights,
    pricePerNight: price,
    threshold:     toNum(data.threshold),
    totalCost:     totalCost,
    status:        data.status || (toNum(data.threshold) > 0 ? '免費' : '付費'),
    note:          data.note || '',
  };

  State.update('bookings', function(arr) {
    arr.push(booking);
    return arr;
  });

  Store.saveBookings(State.get('bookings'));
  Store.saveBookingLastId(booking.id);
  syncBookingToFirebase(booking);
  Events.emit(EVENTS.BOOKING_CREATED, booking);
  return booking;
}

/**
 * 编辑订房
 * @param {string} fbKey
 * @param {object} data
 * @returns {object|null}
 */
function updateBooking(fbKey, data) {
  var updated = null;
  State.update('bookings', function(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._fbKey === fbKey) {
        var b = arr[i];
        if (data.agent != null)         b.agent = data.agent;
        if (data.client != null)        b.client = data.client;
        if (data.casino != null)        b.casino = data.casino;
        if (data.hotel != null)         b.hotel = data.hotel;
        if (data.roomType != null)      b.roomType = data.roomType;
        if (data.checkIn != null)       b.checkIn = data.checkIn;
        if (data.checkOut != null)      b.checkOut = data.checkOut;
        if (data.pricePerNight != null) b.pricePerNight = toNum(data.pricePerNight);
        if (data.threshold != null)     b.threshold = toNum(data.threshold);
        if (data.note != null)          b.note = data.note;
        if (data.status != null)        b.status = data.status;
        // 重算
        b.nights = calcNights(b.checkIn, b.checkOut);
        b.totalCost = b.nights * b.pricePerNight;
        b.month = normalizeMonth(b.checkIn);
        b._updatedAt = Date.now();
        updated = b;
        break;
      }
    }
    return arr;
  });

  if (!updated) return null;
  Store.saveBookings(State.get('bookings'));
  syncBookingToFirebase(updated);
  Events.emit(EVENTS.BOOKING_UPDATED, updated);
  return updated;
}

/**
 * 删除订房
 * @param {string} fbKey
 * @returns {object|null}
 */
function deleteBooking(fbKey) {
  var deleted = null;
  State.update('bookings', function(arr) {
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
  Store.saveBookings(State.get('bookings'));
  removeBookingFromFirebase(fbKey);
  Events.emit(EVENTS.BOOKING_DELETED, deleted);
  return deleted;
}

// ============================================================================
// 查询
// ============================================================================

/**
 * 获取指定订房
 * @param {number} id
 * @returns {object|null}
 */
function getBookingById(id) {
  var bookings = State.get('bookings');
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].id === id) return bookings[i];
  }
  return null;
}

/**
 * 获取所有订房
 * @returns {Array}
 */
function getAllBookings() {
  return State.get('bookings').slice();
}

// src/data/hotel-config.js
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

// src/data/backup.js
/**
 * v13 备份系统
 * 
 * 依赖: core/state.js, core/store.js, core/constants.js (CONFIG, STORAGE_KEYS)
 *        utils/format.js (nowStr)
 * 对照档: 第七节模块12
 */

/**
 * 执行备份 (打包全部数据)
 * @returns {object} { date, data }
 */
function doBackup() {
  var dateStr = nowStr();
  var backupData = {
    version:        APP.VERSION,
    backupDate:     dateStr,
    txs:            State.get('txs'),
    fundWithdrawals:State.get('fundWithdrawals'),
    agentWallets:   State.get('agentWallets'),
    agentList:      State.get('agentList'),
    bookings:       State.get('bookings'),
    hotelConfig:    State.get('hotelConfig'),
    archives:       State.get('archives'),
    workingMonth:   State.get('workingMonth'),
  };

  // 保存备份
  Store.saveBackup(dateStr, backupData);

  // 更新备份列表
  var list = Store.loadBackupList();
  if (list.indexOf(dateStr) < 0) {
    list.push(dateStr);
    list.sort().reverse();  // 最新在前
  }
  Store.saveBackupList(list);
  State.set('backupList', list);

  // 更新最后备份日期
  Store.saveLastBackupDate(dateStr);

  // 清理旧备份
  cleanOldBackups();

  return { date: dateStr, data: backupData, list: list };
}

/**
 * 获取备份列表
 * @returns {Array} 日期字符串数组
 */
function getBackupList() {
  return Store.loadBackupList();
}

/**
 * 从指定日期还原
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {object} { success, error? }
 */
function restoreFromBackup(dateStr) {
  var data = Store.loadBackup(dateStr);
  if (!data) {
    return { success: false, error: '找不到备份: ' + dateStr };
  }

  try {
    // 批量恢复数据
    State.batchSet({
      txs:              data.txs || [],
      fundWithdrawals:  data.fundWithdrawals || [],
      agentWallets:     data.agentWallets || {},
      agentList:        data.agentList || [],
      bookings:         data.bookings || [],
      hotelConfig:      data.hotelConfig || [],
      archives:         data.archives || {},
      workingMonth:     data.workingMonth || '',
    });

    // 恢复自增 ID
    var maxTxId = 0, maxFundId = 0, maxWalletId = 0, maxBookingId = 0, maxHcId = 0;
    var txs = data.txs || [];
    for (var i = 0; i < txs.length; i++) { if (txs[i].id > maxTxId) maxTxId = txs[i].id; }
    var funds = data.fundWithdrawals || [];
    for (var j = 0; j < funds.length; j++) { if (funds[j].id > maxFundId) maxFundId = funds[j].id; }
    var bookings = data.bookings || [];
    for (var k = 0; k < bookings.length; k++) { if (bookings[k].id > maxBookingId) maxBookingId = bookings[k].id; }
    var hc = data.hotelConfig || [];
    for (var l = 0; l < hc.length; l++) { if (hc[l].id > maxHcId) maxHcId = hc[l].id; }
    // 钱包 ID
    var wallets = data.agentWallets || {};
    for (var agent in wallets) {
      var records = wallets[agent];
      for (var m = 0; m < records.length; m++) {
        if (records[m].id > maxWalletId) maxWalletId = records[m].id;
      }
    }

    State.resetNextId('tx', maxTxId + 1);
    State.resetNextId('fund', maxFundId + 1);
    State.resetNextId('wallet', maxWalletId + 1);
    State.resetNextId('booking', maxBookingId + 1);
    State.resetNextId('hc', maxHcId + 1);

    // 持久化全部
    Store.saveAll();

    // 通知事件
    Events.emit(EVENTS.TXS_LOADED, State.get('txs'));
    Events.emit(EVENTS.BOOKINGS_LOADED, State.get('bookings'));

    return { success: true };
  } catch (e) {
    console.error('[v13:backup] restore error:', e);
    return { success: false, error: '还原失败: ' + e.message };
  }
}

/**
 * 清理旧备份 (保留最近 7 天)
 */
function cleanOldBackups() {
  var list = Store.loadBackupList();
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CONFIG.BACKUP_RETENTION);
  var cutoffStr = cutoff.toISOString().substring(0, 10);

  var newList = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i] >= cutoffStr) {
      newList.push(list[i]);
    } else {
      // 删除旧备份
      Store.remove(STORAGE_KEYS.BACKUP_PREFIX + list[i]);
    }
  }

  Store.saveBackupList(newList);
  State.set('backupList', newList);
}

/**
 * 导出所有备份为 JSON
 * @returns {object}
 */
function exportAllBackups() {
  var list = getBackupList();
  var result = { exportDate: nowStr(), appVersion: APP.VERSION, backups: {} };
  for (var i = 0; i < list.length; i++) {
    var data = Store.loadBackup(list[i]);
    if (data) {
      result.backups[list[i]] = data;
    }
  }
  return result;
}

/**
 * 从导出的备份 JSON 导入
 * @param {object} exportData
 * @param {string} [targetDate] - 指定还原日期，不指定则用最新的
 * @returns {object} { success, date }
 */
function importFromBackupExport(exportData, targetDate) {
  if (!exportData || !exportData.backups) {
    return { success: false, error: '无效的备份数据' };
  }

  var dates = Object.keys(exportData.backups).sort().reverse();
  var date = targetDate || dates[0];
  if (!date) {
    return { success: false, error: '备份数据中没有可用日期' };
  }

  var data = exportData.backups[date];
  if (!data) {
    return { success: false, error: '找不到日期 ' + date + ' 的备份' };
  }

  // 先保存到 localStorage
  Store.saveBackup(date, data);
  var list = Store.loadBackupList();
  if (list.indexOf(date) < 0) {
    list.push(date);
    list.sort().reverse();
    Store.saveBackupList(list);
  }

  // 执行还原
  return restoreFromBackup(date);
}

/**
 * 每日自动备份检查
 */
function autoBackupCheck() {
  var lastDate = Store.loadLastBackupDate();
  var today = nowStr();
  if (lastDate !== today) {
    doBackup();
  }
}

// src/data/csv.js
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

// src/data/draft.js
/**
 * v13 草稿管理模块
 * 
 * 依赖: core/state.js, core/store.js, core/constants.js (CONFIG)
 *        utils/format.js (nowStr)
 * 对照档: 第七节模块4 (saveDraft/loadDraft/clearDraft)
 */

/**
 * 保存交易表单草稿 (带 2 秒防抖)
 * @param {object} formData - 表单数据
 */
function saveDraft(formData) {
  // 清除旧 timer
  var timer = State.get('draftTimer');
  if (timer) clearTimeout(timer);

  // 2 秒防抖
  var newTimer = setTimeout(function() {
    var draft = {
      data:      formData,
      savedAt:   nowStr(),
      expiresAt: Date.now() + CONFIG.DRAFT_EXPIRY,
    };
    Store.saveDraft(draft);
    State.set('draftTimer', null);
  }, 2000);

  State.set('draftTimer', newTimer);
}

/**
 * 立即保存草稿 (不防抖)
 * @param {object} formData
 */
function saveDraftNow(formData) {
  var timer = State.get('draftTimer');
  if (timer) clearTimeout(timer);

  var draft = {
    data:      formData,
    savedAt:   nowStr(),
    expiresAt: Date.now() + CONFIG.DRAFT_EXPIRY,
  };
  Store.saveDraft(draft);
  State.set('draftTimer', null);
}

/**
 * 读取草稿
 * @returns {object|null} 表单数据，过期返回 null
 */
function loadDraft() {
  var draft = Store.loadDraft();
  if (!draft || !draft.data) return null;

  // 检查过期
  if (draft.expiresAt && Date.now() > draft.expiresAt) {
    clearDraft();
    return null;
  }

  return draft.data;
}

/**
 * 清除草稿
 */
function clearDraft() {
  var timer = State.get('draftTimer');
  if (timer) clearTimeout(timer);
  Store.remove(STORAGE_KEYS.DRAFT);
  State.set('draftTimer', null);
}

/**
 * 是否有草稿
 * @returns {boolean}
 */
function hasDraft() {
  return loadDraft() !== null;
}

// src/sync/firebase.js
/**
 * v13 Firebase 初始化与连接监控
 * 
 * 依赖: core/constants.js (FIREBASE_CONFIG, FB_PATH, EVENTS)
 *        core/events.js (Events)
 *        core/state.js (State)
 * 对照档: 第七节模块10, 第九节同步机制
 */

// ============================================================================
// 初始化
// ============================================================================

var _db = null;              // Firebase database 实例
var _fbRetryDone = false;    // 是否已完成重试/setup
var _fbPollTimer = null;     // 轮询定时器

/**
 * 真正执行 Firebase 初始化
 * @returns {object|null}
 */
function _doInitFirebase() {
  if (typeof firebase === 'undefined') return null;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    _db = firebase.database();
    console.log('[v13:firebase] ✅ Connected! _db ready, database:', _db.ref.toString().substring(0,30));
    _watchConnection();
    return _db;
  } catch (e) {
    console.error('[v13:firebase] Init error:', e);
    return null;
  }
}

/**
 * 初始化成功后补启动 watchers + 同步
 */
function _onFirebaseReady() {
  console.log('[v13:firebase] 🚀 Starting watchers + sync...');
  try { startWatchers(); } catch(e) { console.error('[v13:firebase] startWatchers error:', e); }
  try { syncDownloadAll(); } catch(e) { console.error('[v13:firebase] syncDownloadAll error:', e); }
}

/**
 * 初始化 Firebase（多层回退保障）
 * 1. 立即尝试（如果 SDK 已加载）
 * 2. load 事件重试（兼容 document.readyState===complete）
 * 3. 1秒间隔轮询 最多 30 次
 * @returns {object|null} database 实例，未就绪时返回 null
 */
function initFirebase() {
  // 如果已经连上了，直接返回
  if (_db) return _db;

  // 立即尝试
  var result = _doInitFirebase();
  if (result) {
    _fbRetryDone = true;
    // ★ 首次成功也触发 onFirebaseReady（延迟，等连接真正建立后再同步）
    // 但不在 initAppAfterLogin 之前启动 watchers，避免与后续 initAppAfterLogin 双重注册
    // 标记需要延迟同步，由 _watchConnection 在连通时触发
    return result;
  }

  // 还没连上 — 安排重试
  if (_fbRetryDone) return null;  // 已经安排过了
  _fbRetryDone = true;

  console.warn('[v13:firebase] Firebase SDK not loaded yet, setting up retry...');

  // 策略A: load 事件（处理 document.readyState 问题）
  function tryInitViaEvent() {
    if (!_db) {
      console.log('[v13:firebase] ⏳ Retry via event...');
      _doInitFirebase();
      if (_db) _onFirebaseReady();
    }
  }

  if (document.readyState === 'complete') {
    // 页面已完全加载，直接用 setTimeout 延迟执行
    console.log('[v13:firebase] Page already loaded, scheduling retry...');
    setTimeout(tryInitViaEvent, 500);
  } else {
    window.addEventListener('load', tryInitViaEvent);
  }

  // 策略B: 轮询（兜底 — 处理 load 永远不触发的情况）
  var pollCount = 0;
  _fbPollTimer = setInterval(function() {
    pollCount++;
    if (typeof firebase !== 'undefined' && !_db) {
      console.log('[v13:firebase] ⏳ Poll #' + pollCount + ' — Firebase SDK detected, initializing...');
      _doInitFirebase();
      if (_db) {
        clearInterval(_fbPollTimer);
        _fbPollTimer = null;
        _onFirebaseReady();
      }
    }
    if (pollCount >= 30) {
      clearInterval(_fbPollTimer);
      _fbPollTimer = null;
      if (!_db) {
        console.error('[v13:firebase] ❌ Firebase SDK failed to load after 30s. Sync disabled.');
        console.error('[v13:firebase]    请检查: 1) 网络是否可访问 cdn.jsdelivr.net  2) 防火墙/广告拦截器是否屏蔽');
      }
    }
  }, 1000);

  return null;
}

/**
 * 获取 database 实例
 * @returns {object|null}
 */
function getDB() {
  return _db;
}

/**
 * 创建数据库引用
 * @param {string} path - 数据库路径
 * @returns {object} Firebase ref
 */
function dbRef(path) {
  if (!_db) return null;
  return _db.ref(path);
}

// ============================================================================
// 连接监控 (对照档第九节)
// ============================================================================

function _watchConnection() {
  if (!_db) return;

  var connectedRef = _db.ref(FB_PATH.CONNECTED);
  connectedRef.on('value', function(snap) {
    var connected = snap.val() === true;
    var prevConnected = State.get('syncConnected');
    State.set('syncConnected', connected);
    Events.emit(EVENTS.CONNECTION_CHANGED, connected);

    if (connected) {
      console.log('[v13:firebase] ✅ Firebase RTDB 已連線');
      // 安全网：2 秒后推送本地数据到 Firebase（transaction 合并，幂等）
      setTimeout(function() {
        if (!State.get('syncConnected')) return;
        console.log('[v13:firebase] 🔄 安全網推送...');
        try { syncUploadAll(); } catch(e) { console.error('[v13:firebase] syncUploadAll error:', e); }
      }, 2000);
    } else {
      // 只有从 connected→disconnected 变化时才警告（避免首次 false 状态误报）
      if (prevConnected === true) {
        console.warn('[v13:firebase] ⚠️ Firebase RTDB 斷線');
      }
    }
  });
}

// ============================================================================
// CRUD 即时写入 (对照档第九节 - 个别即时写入)
// ============================================================================

/**
 * 同步单笔交易到 Firebase
 * @param {object} tx
 */
function syncTxToFirebase(tx) {
  console.log('[v13:firebase] 🔵 syncTxToFirebase ENTERED, _db=' + (!!_db) + ', fbKey=' + (tx && tx._fbKey));
  if (!tx._fbKey) {
    console.warn('[v13:firebase] syncTx skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncTx deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncTxToFirebase(tx); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncTx WRITE:', tx._fbKey, 'agent=' + (tx.agent || '?'), 'vol=' + (tx.volume || 0));
    _db.ref(FB_PATH.TXS + '/' + tx._fbKey).set(tx, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncTx FAILED:', tx._fbKey, err.message || err);
        enqueueUpload(function() { syncTxToFirebase(tx); });
      } else {
        console.log('[v13:firebase] ✅ syncTx OK:', tx._fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncTx error:', e);
  }
}

/**
 * 从 Firebase 删除单笔交易
 * @param {string} fbKey
 */
function removeTxFromFirebase(fbKey) {
  if (!_db) {
    console.warn('[v13:firebase] removeTx deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeTxFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeTx TOMBSTONE:', fbKey);
    // ★ 墓碑策略：不设 null，而是写一个墓碑对象
    // 这样另一端的 mergeTxs 可以识别并移除该条目
    _db.ref(FB_PATH.TXS + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeTx FAILED:', fbKey, err.message || err);
        enqueueUpload(function() { removeTxFromFirebase(fbKey); });
      } else {
        console.log('[v13:firebase] ✅ removeTx TOMBSTONE OK:', fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] removeTx error:', e);
  }
}

/**
 * 同步单笔公基金到 Firebase
 * @param {object} record
 */
function syncFundToFirebase(record) {
  if (!record._fbKey) {
    console.warn('[v13:firebase] syncFund skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncFund deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncFundToFirebase(record); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncFund WRITE:', record._fbKey);
    _db.ref(FB_PATH.FUND + '/' + record._fbKey).set(record, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncFund FAILED:', record._fbKey, err.message || err);
        enqueueUpload(function() { syncFundToFirebase(record); });
      } else {
        console.log('[v13:firebase] ✅ syncFund OK:', record._fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncFund error:', e);
  }
}

/**
 * 从 Firebase 删除单笔公基金
 * @param {string} fbKey
 */
function removeFundFromFirebase(fbKey) {
  if (!_db) {
    console.warn('[v13:firebase] removeFund deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeFundFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeFund TOMBSTONE:', fbKey);
    _db.ref(FB_PATH.FUND + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeFund FAILED:', fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeFund TOMBSTONE OK:', fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] removeFund error:', e);
  }
}

/**
 * 同步单笔代理钱包到 Firebase
 * @param {string} agent
 * @param {object} record
 */
function syncWalletToFirebase(agent, record) {
  if (!record._fbKey) {
    console.warn('[v13:firebase] syncWallet skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncWallet deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncWalletToFirebase(agent, record); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncWallet WRITE:', agent, record._fbKey);
    _db.ref(FB_PATH.AGENT_WALLETS + '/' + encodeFirebaseKey(agent) + '/' + record._fbKey).set(record, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncWallet FAILED:', agent, record._fbKey, err.message || err);
        enqueueUpload(function() { syncWalletToFirebase(agent, record); });
      } else {
        console.log('[v13:firebase] ✅ syncWallet OK:', agent, record._fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncWallet error:', e);
  }
}

/**
 * 从 Firebase 删除单笔代理钱包
 * @param {string} agent
 * @param {string} fbKey
 */
function removeWalletFromFirebase(agent, fbKey) {
  if (!_db) {
    console.warn('[v13:firebase] removeWallet deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeWalletFromFirebase(agent, fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeWallet TOMBSTONE:', agent, fbKey);
    _db.ref(FB_PATH.AGENT_WALLETS + '/' + encodeFirebaseKey(agent) + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeWallet FAILED:', agent, fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeWallet TOMBSTONE OK:', agent, fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] removeWallet error:', e);
  }
}

/**
 * 同步单笔订房到 Firebase
 * @param {object} booking
 */
function syncBookingToFirebase(booking) {
  if (!booking._fbKey) {
    console.warn('[v13:firebase] syncBooking skipped: missing _fbKey');
    return;
  }
  if (!_db) {
    console.warn('[v13:firebase] syncBooking deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncBookingToFirebase(booking); });
    return;
  }
  try {
    console.log('[v13:firebase] 🚀 syncBooking WRITE:', booking._fbKey);
    _db.ref(FB_PATH.RM_BOOKINGS + '/' + booking._fbKey).set(booking, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ syncBooking FAILED:', booking._fbKey, err.message || err);
        enqueueUpload(function() { syncBookingToFirebase(booking); });
      } else {
        console.log('[v13:firebase] ✅ syncBooking OK:', booking._fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncBooking error:', e);
  }
}

/**
 * 从 Firebase 删除单笔订房
 * @param {string} fbKey
 */
function removeBookingFromFirebase(fbKey) {
  if (!_db) {
    console.warn('[v13:firebase] removeBooking deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { removeBookingFromFirebase(fbKey); });
    return;
  }
  try {
    console.log('[v13:firebase] 🗑️  removeBooking TOMBSTONE:', fbKey);
    _db.ref(FB_PATH.RM_BOOKINGS + '/' + fbKey).set({
      _fbKey: fbKey,
      _deleted: true,
      _updatedAt: Date.now()
    }, function(err) {
      if (err) {
        console.error('[v13:firebase] ❌ removeBooking FAILED:', fbKey, err.message || err);
      } else {
        console.log('[v13:firebase] ✅ removeBooking TOMBSTONE OK:', fbKey);
      }
    });
  } catch (e) {
    console.error('[v13:firebase] removeBooking error:', e);
  }
}

/**
 * 同步代理名单到 Firebase（用 transaction 原子合併，防止并发丢失）
 * @param {Array} agentList - 當前本地代理名單
 */
function syncAgentListToFirebase(agentList) {
  if (!_db) {
    console.warn('[v13:firebase] syncAgentList deferred (_db null) → auto-enqueue');
    enqueueUpload(function() { syncAgentListToFirebase(agentList); });
    return;
  }
  try {
    _db.ref(FB_PATH.AGENT_LIST).transaction(function(remote) {
      if (!remote || !Array.isArray(remote)) return agentList;
      // 原子合併：本地 + 遠端（去重）
      var merged = remote.slice();
      for (var i = 0; i < agentList.length; i++) {
        if (merged.indexOf(agentList[i]) === -1) {
          merged.push(agentList[i]);
        }
      }
      merged.sort(function(a, b) { return a.localeCompare(b); });
      // 只有当真正有变化时才返回新值（返回 undefined 表示中止事务）
      if (JSON.stringify(merged) === JSON.stringify(remote)) return;
      return merged;
    }, function(err, committed, snapshot) {
      if (err) {
        console.error('[v13:firebase] syncAgentList transaction FAILED:', err.message || err);
        // 失败时重试（用 enqueueUpload 排队）
        enqueueUpload(function() { syncAgentListToFirebase(agentList); });
      }
    });
  } catch (e) {
    console.error('[v13:firebase] syncAgentList error:', e);
  }
}

// ============================================================================
// 格式转换 (对照档第九节)
// ============================================================================

/**
 * Firebase 物件格式 → 本地数组
 * @param {object} obj - Firebase snapshot value
 * @returns {Array}
 */
function fbObjToArray(obj) {
  if (!obj) return [];
  var result = [];
  for (var key in obj) {
    var item = obj[key];
    if (item && typeof item === 'object') {
      item._fbKey = item._fbKey || key;
      result.push(item);
    }
  }
  return result;
}

/**
 * 本地数组 → Firebase 物件格式
 * @param {Array} arr
 * @returns {object}
 */
function fbArrayToObj(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    var key = arr[i]._fbKey;
    if (key) {
      obj[key] = arr[i];
    }
  }
  return obj;
}

/**
 * 代理钱包 → Firebase 巢状物件
 * @param {object} wallets - { agentName: [records] }
 * @returns {object}
 */
function fbWalletsToObj(wallets) {
  var obj = {};
  for (var agent in wallets) {
    var encoded = encodeFirebaseKey(agent);
    obj[encoded] = fbArrayToObj(wallets[agent]);
  }
  return obj;
}

/**
 * Firebase 巢状物件 → 代理钱包
 * @param {object} obj
 * @returns {object}
 */
function fbObjToWallets(obj) {
  if (!obj) return {};
  var wallets = {};
  for (var encoded in obj) {
    var agent = decodeFirebaseKey(encoded);
    wallets[agent] = fbObjToArray(obj[encoded]);
  }
  return wallets;
}

// ============================================================================
// Firebase Key 编码 (处理特殊字符)
// ============================================================================

function encodeFirebaseKey(str) {
  return str.replace(/\./g, '_DOT_')
            .replace(/#/g, '_HASH_')
            .replace(/\$/g, '_DOLLAR_')
            .replace(/\[/g, '_LB_')
            .replace(/\]/g, '_RB_')
            .replace(/\//g, '_SLASH_');
}

function decodeFirebaseKey(encoded) {
  return encoded.replace(/_DOT_/g, '.')
                .replace(/_HASH_/g, '#')
                .replace(/_DOLLAR_/g, '$')
                .replace(/_LB_/g, '[')
                .replace(/_RB_/g, ']')
                .replace(/_SLASH_/g, '/');
}

// src/sync/uploader.js
/**
 * v13 上传队列与批量同步
 * 
 * 依赖: sync/firebase.js (getDB, dbRef, fbObjToArray, fbArrayToObj, fbWalletsToObj)
 *        core/state.js, core/events.js, core/constants.js (FB_PATH, EVENTS, CONFIG)
 * 对照档: 第九节 syncUpload() + _syncSet()
 */

// ============================================================================
// 上传队列
// ============================================================================

var _uploadQueue = [];
var _uploading = false;

/**
 * 入队上传任务
 * @param {function} task - 返回 Promise 的上传函数
 */
function enqueueUpload(task) {
  _uploadQueue.push(task);
  if (!_uploading) {
    _processQueue();
  }
}

function _processQueue() {
  if (_uploadQueue.length === 0) {
    _uploading = false;
    return;
  }

  // ★ 如果 Firebase 还没就绪，延迟处理（不退队，不丢数据）
  if (!getDB()) {
    _uploading = false;
    setTimeout(_processQueue, 1000);
    return;
  }

  _uploading = true;
  var task = _uploadQueue.shift();

  try {
    task();
  } catch (e) {
    console.error('[v13:uploader] Queue task error:', e);
  }

  // 逐任务处理（串行，避免 Firebase 限制）
  setTimeout(_processQueue, 100);
}

// ============================================================================
// 批量上传 (对照档 syncUpload)
// ============================================================================

/**
 * 全量同步到 Firebase (7 路径)
 */
function syncUploadAll() {
  if (!getDB()) {
    console.warn('[v13:uploader] Firebase not initialized, skip syncUpload');
    return;
  }

  Events.emit(EVENTS.SYNC_START);

  var txs = State.get('txs');
  var fundWithdrawals = State.get('fundWithdrawals');
  var agentList = State.get('agentList');
  var agentWallets = State.get('agentWallets');
  var workingMonth = State.get('workingMonth');
  var bookings = State.get('bookings');
  var archives = State.get('archives');

  var db = getDB();

  // 1. 交易：transaction 原子合併 (個別 CRUD 已即時推送，此為安全網)
  // ★ FIX: mergeTxs(local, remote) — 第一个参数是本地，第二个是远端
  db.ref(FB_PATH.TXS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(txs);
    var rArr = fbObjToArray(remote);
    var merged = mergeTxs(txs, rArr);  // ✓ local=txs, remote=rArr
    console.log('[v13:uploader] TXS transaction: local=' + txs.length + ' remote=' + rArr.length + ' merged=' + merged.length);
    return fbArrayToObj(merged);
  }, function(err, committed, snapshot) {
    if (err) {
      console.error('[v13:uploader] TXS transaction FAILED:', err.message || err);
    } else if (committed) {
      console.log('[v13:uploader] ✅ TXS transaction committed, ' + (snapshot ? snapshot.numChildren() : '?') + ' entries on Firebase');
    }
  });

  // 2. 公基金：transaction 原子合併
  db.ref(FB_PATH.FUND).transaction(function(remote) {
    if (!remote) return fbArrayToObj(fundWithdrawals);
    var rArr = fbObjToArray(remote);
    var localMap = {};
    for (var fi = 0; fi < fundWithdrawals.length; fi++) {
      localMap[fundWithdrawals[fi]._fbKey] = fundWithdrawals[fi];
    }
    for (var fj = 0; fj < rArr.length; fj++) {
      var fKey = rArr[fj]._fbKey;
      if (!localMap[fKey]) {
        localMap[fKey] = rArr[fj];
      } else {
        var lTs = localMap[fKey]._updatedAt || 0;
        var rTs = rArr[fj]._updatedAt || 0;
        if (rTs > lTs) localMap[fKey] = rArr[fj];
      }
    }
    var mf = [];
    for (var fk in localMap) {
      if (!localMap[fk]._deleted) mf.push(localMap[fk]);
    }  // ★ 墓碑过滤
    return fbArrayToObj(mf);
  });

  // 3. 代理名單：transaction 原子合併
  db.ref(FB_PATH.AGENT_LIST).transaction(function(remote) {
    if (!remote || !Array.isArray(remote)) return agentList;
    return mergeAgentLists(agentList, remote);
  });

  // 4. 代理钱包：transaction 原子合併
  // ★ FIX: mergeWallets(local, remote) — local=agentWallets, remote=rw
  db.ref(FB_PATH.AGENT_WALLETS).transaction(function(remote) {
    if (!remote) return fbWalletsToObj(agentWallets);
    var rw = fbObjToWallets(remote);
    return fbWalletsToObj(mergeWallets(agentWallets, rw));
  });

  // 5. 工作月份
  db.ref(FB_PATH.WORKING_MONTH).set(workingMonth);

  // 6. 订房：transaction 原子合併
  db.ref(FB_PATH.RM_BOOKINGS).transaction(function(remote) {
    if (!remote) return fbArrayToObj(bookings);
    var rArr = fbObjToArray(remote);
    var localMap = {};
    for (var bi = 0; bi < bookings.length; bi++) {
      localMap[bookings[bi]._fbKey] = bookings[bi];
    }
    for (var bj = 0; bj < rArr.length; bj++) {
      var bKey = rArr[bj]._fbKey;
      if (!localMap[bKey]) {
        localMap[bKey] = rArr[bj];
      } else {
        var blTs = localMap[bKey]._updatedAt || 0;
        var brTs = rArr[bj]._updatedAt || 0;
        if (brTs > blTs) localMap[bKey] = rArr[bj];
      }
    }
    var mb = [];
    for (var bk in localMap) {
      if (!localMap[bk]._deleted) mb.push(localMap[bk]);
    }  // ★ 墓碑过滤
    return fbArrayToObj(mb);
  });

  // 7. 月度存档
  db.ref(FB_PATH.ARCHIVES).set(archives);

  Events.emit(EVENTS.SYNC_COMPLETE);
}

/**
 * 带重试的 set
 * @param {object} ref - Firebase ref
 * @param {*} data
 */
function syncSetWithRetry(ref, data, attempt) {
  if (!attempt) attempt = 0;
  if (attempt >= CONFIG.SYNC_RETRY_MAX) {
    console.error('[v13:uploader] syncSet max retries reached');
    return;
  }

  try {
    ref.set(data, function(err) {
      if (err) {
        var delay = CONFIG.SYNC_RETRY_BASE * Math.pow(2, attempt);
        console.warn('[v13:uploader] syncSet retry in', delay, 'ms (attempt', attempt + 1, ')');
        setTimeout(function() {
          syncSetWithRetry(ref, data, attempt + 1);
        }, delay);
      }
    });
  } catch (e) {
    var delay = CONFIG.SYNC_RETRY_BASE * Math.pow(2, attempt);
    setTimeout(function() {
      syncSetWithRetry(ref, data, attempt + 1);
    }, delay);
  }
}

// src/sync/watchers.js
/**
 * v13 Firebase 即时监听器
 * 
 * 依赖: sync/firebase.js (getDB, fbObjToArray, fbObjToWallets)
 *        core/state.js, core/events.js, core/store.js
 *        core/constants.js (FB_PATH, EVENTS, STORAGE_KEYS, CONFIG)
 * 对照档: 第九节 initSync() — 7 个监听器
 */

var _watchers = {};  // 已注册的监听器引用

/**
 * 启动所有 Firebase 即时监听器 (对照档 initSync)
 */
function startWatchers() {
  var db = getDB();
  if (!db) {
    console.error('[v13:watchers] Cannot start — Firebase not initialized');
    return false;
  }

  // 1. 监听交易
  _watchers.txs = db.ref(FB_PATH.TXS).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('txs');

    // 用 mergeTxs 合并（时间戳胜出策略）
    var merged = mergeTxs(local, remote);

    console.log('[v13:watchers] TXS onValue: remote=' + remote.length + ' local=' + local.length + ' merged=' + merged.length);

    // 检测是否真正有变化（按长度+内容）
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      console.log('[v13:watchers] TXS CHANGED: ' + local.length + ' → ' + merged.length + ' entries');
      State.set('txs', merged);
      Store.saveTxs(merged);
      Events.emit(EVENTS.TXS_LOADED, merged);
    }
  });

  // 2. 监听公基金
  _watchers.fund = db.ref(FB_PATH.FUND).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('fundWithdrawals');

    // 用 mergeArrays 合并（本地有+远端没有 → 保留本地；远端有+本地没有 → 加入）
    var merged = mergeArrays(local, remote);

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('fundWithdrawals', merged);
      Store.saveFund(merged);
      Events.emit(EVENTS.FUND_LOADED, merged);
    }
  });

  // 3. 监听代理名单
  _watchers.agentList = db.ref(FB_PATH.AGENT_LIST).on('value', function(snap) {
    var remote = snap.val();
    if (!remote || !Array.isArray(remote)) return;

    var local = State.get('agentList');
    var merged = mergeAgentLists(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('agentList', merged);
      Store.saveAgentList(merged);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, merged);
    }
  });

  // 4. 监听代理钱包
  _watchers.agentWallets = db.ref(FB_PATH.AGENT_WALLETS).on('value', function(snap) {
    var remote = fbObjToWallets(snap.val());
    if (!remote || Object.keys(remote).length === 0) return;

    var local = State.get('agentWallets');
    if (JSON.stringify(local) !== JSON.stringify(remote)) {
      State.set('agentWallets', remote);
      Store.saveWallets(remote);
      Events.emit(EVENTS.WALLETS_LOADED, remote);
    }
  });

  // 5. 监听工作月份
  _watchers.workingMonth = db.ref(FB_PATH.WORKING_MONTH).on('value', function(snap) {
    var remote = snap.val();
    if (remote && remote !== State.get('workingMonth')) {
      State.set('workingMonth', remote);
      Store.saveWorkingMonth(remote);
      Events.emit(EVENTS.MONTH_CHANGED, remote);
    }
  });

  // 6. 监听订房
  _watchers.bookings = db.ref(FB_PATH.RM_BOOKINGS).on('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('bookings');

    // 用 mergeArrays 合并，避免直接覆盖导致本地独有订房丢失
    var merged = mergeArrays(local, remote);

    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('bookings', merged);
      Store.saveBookings(merged);
      Events.emit(EVENTS.BOOKINGS_LOADED, merged);
    }
  });

  // 7. 监听月度存档
  _watchers.archives = db.ref(FB_PATH.ARCHIVES).on('value', function(snap) {
    var remote = snap.val();
    if (remote) {
      State.set('archives', remote);
      Store.saveArchives(remote);
    }
  });

  console.log('[v13:watchers] All 7 watchers started');
  return true;
}

/**
 * 停止所有监听器
 */
function stopWatchers() {
  var db = getDB();
  if (!db) return;

  for (var key in _watchers) {
    try {
      var path = FB_PATH[key.toUpperCase()];
      if (path) db.ref(path).off('value', _watchers[key]);
    } catch (e) {
      console.error('[v13:watchers] Error stopping watcher:', key, e);
    }
  }
  _watchers = {};
  console.log('[v13:watchers] All watchers stopped');
}

/**
 * 手动全量同步 (从 Firebase 拉取，走 merge 逻辑避免覆盖本地数据)
 */
function syncDownloadAll() {
  var db = getDB();
  if (!db) return;

  db.ref(FB_PATH.TXS).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('txs');
    var merged = mergeTxs(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('txs', merged);
      Store.saveTxs(merged);
      Events.emit(EVENTS.TXS_LOADED, merged);
    }
  });

  db.ref(FB_PATH.FUND).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('fundWithdrawals');
    var merged = mergeArrays(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('fundWithdrawals', merged);
      Store.saveFund(merged);
      Events.emit(EVENTS.FUND_LOADED, merged);
    }
  });

  db.ref(FB_PATH.AGENT_LIST).once('value', function(snap) {
    var remote = snap.val();
    if (!remote || !Array.isArray(remote)) return;
    var local = State.get('agentList');
    var merged = mergeAgentLists(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('agentList', merged);
      Store.saveAgentList(merged);
      Events.emit(EVENTS.AGENT_LIST_UPDATED, merged);
    }
  });

  db.ref(FB_PATH.AGENT_WALLETS).once('value', function(snap) {
    var remote = fbObjToWallets(snap.val());
    var local = State.get('agentWallets');
    var merged = mergeWallets(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('agentWallets', merged);
      Store.saveWallets(merged);
      Events.emit(EVENTS.WALLETS_LOADED, merged);
    }
  });

  db.ref(FB_PATH.WORKING_MONTH).once('value', function(snap) {
    var month = snap.val();
    if (month) {
      State.set('workingMonth', month);
      Store.saveWorkingMonth(month);
      Events.emit(EVENTS.MONTH_CHANGED, month);
    }
  });

  db.ref(FB_PATH.RM_BOOKINGS).once('value', function(snap) {
    var remote = fbObjToArray(snap.val());
    var local = State.get('bookings');
    var merged = mergeArrays(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      State.set('bookings', merged);
      Store.saveBookings(merged);
      Events.emit(EVENTS.BOOKINGS_LOADED, merged);
    }
  });

  db.ref(FB_PATH.ARCHIVES).once('value', function(snap) {
    var archives = snap.val();
    if (archives) {
      State.set('archives', archives);
      Store.saveArchives(archives);
    }
  });
}

// src/sync/merger.js
/**
 * v13 冲突合并模块
 * 
 * 依赖: core/state.js
 * 对照档: 第九节同步机制 (本地优先策略)
 * 
 * 策略: 本地时间戳优先 → 本地操作时间 > 远端更新时间 → 本地胜出
 *       如果本地没有 timestamp，则远端胜出
 */

/**
 * 合并交易数组 (本地优先)
 * @param {Array} local - 本地交易数组
 * @param {Array} remote - 远端交易数组
 * @returns {Array} 合并结果
 */
function mergeTxs(local, remote) {
  var merged = {};
  var result = [];

  // 收集所有 fbKey
  for (var i = 0; i < local.length; i++) {
    var key = local[i]._fbKey;
    if (key) merged[key] = local[i];
  }
  for (var j = 0; j < remote.length; j++) {
    var rKey = remote[j]._fbKey;
    if (rKey) {
      if (merged[rKey]) {
        // 冲突解决：取本地 _updatedAt 和远端 _updatedAt 大的
        var localTs = merged[rKey]._updatedAt || 0;
        var remoteTs = remote[j]._updatedAt || 0;
        if (remoteTs > localTs) {
          // 远端胜出（可能是墓碑 _deleted:true）
          merged[rKey] = remote[j];
        }
      } else {
        // 本地没有 → 远端胜出（包括墓碑）
        merged[rKey] = remote[j];
      }
    }
  }

  // ★ 墓碑过滤：排除 _deleted:true 的远端墓碑条目
  // 墓碑机制：删除时写 {_fbKey, _deleted:true, _updatedAt} 而非 set(null)
  // 这样 mergeTxs 能识别删除操作并同步移除
  for (var k in merged) {
    if (!merged[k]._deleted) {
      result.push(merged[k]);
    }
  }

  return result;
}

/**
 * 合并代理钱包
 * @param {object} local
 * @param {object} remote
 * @returns {object}
 */
function mergeWallets(local, remote) {
  var merged = {};
  var allAgents = {};

  for (var ag in local) { allAgents[ag] = true; }
  for (var ag in remote) { allAgents[ag] = true; }

  for (var agent in allAgents) {
    var localRecords = local[agent] || [];
    var remoteRecords = remote[agent] || [];
    var recordMap = {};

    for (var i = 0; i < localRecords.length; i++) {
      var key = localRecords[i]._fbKey;
      if (key) recordMap[key] = localRecords[i];
    }
    for (var j = 0; j < remoteRecords.length; j++) {
      var rKey = remoteRecords[j]._fbKey;
      if (rKey) {
        if (recordMap[rKey]) {
          var localTs = recordMap[rKey]._updatedAt || 0;
          var remoteTs = remoteRecords[j]._updatedAt || 0;
          if (remoteTs > localTs) {
            recordMap[rKey] = remoteRecords[j];
          }
        } else {
          recordMap[rKey] = remoteRecords[j];
        }
      }
    }

    var result = [];
    for (var k in recordMap) {
      // ★ 墓碑过滤：排除 _deleted:true 的远端删除标记
      if (!recordMap[k]._deleted) {
        result.push(recordMap[k]);
      }
    }
    if (result.length > 0) {
      merged[agent] = result;
    }
  }

  return merged;
}

/**
 * 合并数组 (通用，本地优先)
 * @param {Array} local
 * @param {Array} remote
 * @returns {Array}
 */
function mergeArrays(local, remote) {
  var map = {};

  for (var i = 0; i < local.length; i++) {
    var key = local[i]._fbKey || local[i].id || i;
    map[key] = local[i];
  }
  for (var j = 0; j < remote.length; j++) {
    var rKey = remote[j]._fbKey || remote[j].id || j + '_r';
    if (!map[rKey]) {
      map[rKey] = remote[j];
    }
  }

  var result = [];
  for (var k in map) {
    // ★ 墓碑过滤：排除 _deleted:true 的远端删除标记
    if (!map[k]._deleted) {
      result.push(map[k]);
    }
  }
  return result;
}

/**
 * 合并代理名單（純字符串數組，兩邊去重合併）
 * @param {Array} local - 本地名單 ['代理A','代理B']
 * @param {Array} remote - 遠端名單 ['代理B','代理C']
 * @returns {Array} 合併結果 ['代理A','代理B','代理C']
 */
function mergeAgentLists(local, remote) {
  var merged = remote.slice();
  for (var i = 0; i < local.length; i++) {
    if (merged.indexOf(local[i]) === -1) {
      merged.push(local[i]);
    }
  }
  merged.sort(function(a, b) { return a.localeCompare(b); });
  return merged;
}

// src/ui/toast.js
/**
 * v13 Toast 通知模块
 * 
 * 依赖: core/constants.js (TOAST_TIMING, UI_COLORS)
 * 对照档: 第七节模块3, 第十七节 Toast 时序
 * 
 * 事件: 监听 ui:toast
 */

/**
 * 显示 Toast 通知
 * @param {string} msg - 消息内容
 * @param {string} [type='info'] - 'success'|'warning'|'error'|'info'
 * @param {number} [duration=3500] - 毫秒
 */
function showToast(msg, type, duration) {
  if (!msg) return;

  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = msg;

  // 颜色
  var colors = {
    success: UI_COLORS.success,
    warning: UI_COLORS.warning,
    error:   UI_COLORS.danger,
    info:    UI_COLORS.info,
  };
  var color = colors[type] || UI_COLORS.info;

  toast.style.cssText = [
    'padding: 12px 20px',
    'margin-bottom: 8px',
    'border-radius: ' + '8px',
    'background: ' + UI_COLORS.bgElevated,
    'color: ' + UI_COLORS.textPrimary,
    'border-left: 3px solid ' + color,
    'font-size: 14px',
    'box-shadow: 0 4px 16px rgba(0,0,0,0.3)',
    'opacity: 0',
    'transform: translateX(20px)',
    'transition: all 0.3s ease',
    'pointer-events: auto',
    'max-width: 360px',
    'word-break: break-word',
  ].join(';');

  container.appendChild(toast);

  // 入场动画
  requestAnimationFrame(function() {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // 自动移除
  var d = duration || TOAST_TIMING.DURATION;
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(function() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, d);
}

/**
 * CRUD 标准 Toast 时序 (对照档第十七节)
 *   showToast('已完成', 'success')
 *   → 350ms
 *   showToast('同步中…', 'info')
 *   → 950ms (总)
 *   showToast('同步成功', 'success')
 */
function toastCRUDDone() {
  showToast('已完成', 'success');
  setTimeout(function() {
    showToast('同步中…', 'info');
  }, TOAST_TIMING.SYNCING_DELAY);
  setTimeout(function() {
    showToast('同步成功', 'success');
  }, TOAST_TIMING.SYNC_DONE_DELAY);
}

/**
 * Toast: 操作失败
 * @param {string} msg
 */
function toastError(msg) {
  showToast(msg || '操作失敗', 'error');
}

/**
 * Toast: 警告
 * @param {string} msg
 */
function toastWarn(msg) {
  showToast(msg, 'warning');
}

// 监听 Event Bus
Events.on(EVENTS.TOAST, function(data) {
  showToast(data.msg, data.type, data.duration);
});

// src/ui/modal.js
/**
 * v13 Modal 管理
 * 依赖: core/events.js
 */

var _openModals = [];

function openModal(id, data) {
  var modal = document.getElementById(id);
  if (!modal) return;

  modal.style.display = 'flex';
  _openModals.push(id);
  State.set('isModalOpen', true);

  // 点击背景关闭
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal(id);
  });
}

function closeModal(id) {
  if (!id && _openModals.length > 0) {
    id = _openModals[_openModals.length - 1];
  }

  var modal = document.getElementById(id);
  if (!modal) return;

  modal.style.display = 'none';
  _openModals = _openModals.filter(function(m) { return m !== id; });
  State.set('isModalOpen', _openModals.length > 0);
}

function closeAllModals() {
  for (var i = _openModals.length - 1; i >= 0; i--) {
    var m = document.getElementById(_openModals[i]);
    if (m) m.style.display = 'none';
  }
  _openModals = [];
  State.set('isModalOpen', false);
}

function isModalOpen() {
  return _openModals.length > 0;
}

// 监听事件
Events.on(EVENTS.MODAL_OPEN, function(data) { openModal(data.id, data.data); });
Events.on(EVENTS.MODAL_CLOSE, function(data) { closeModal(data ? data.id : null); });

// src/ui/keyboard.js
/**
 * v13 键盘快捷键
 * 依赖: core/state.js, core/events.js, core/constants.js (SHORTCUTS)
 * 对照档: 第十三节快捷键清单
 */

function initKeyboard() {
  document.addEventListener('keydown', function(e) {
    // 如果弹窗开启，忽略部分快捷键
    if (State.get('isModalOpen') && e.key !== 'Escape') return;

    var ctrl = e.ctrlKey || e.metaKey;

    // Ctrl + 1~5: 切换页面
    if (ctrl && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      var pageNames = ['overview', 'all', 'query', 'summary', 'room'];
      showPage(pageNames[parseInt(e.key) - 1]);
      return;
    }

    // Ctrl + N: 新增交易
    if (ctrl && e.key === 'n') {
      e.preventDefault();
      Events.emit('tx:new');
      return;
    }

    // Ctrl + S: 储存
    if (ctrl && e.key === 's') {
      e.preventDefault();
      Events.emit('sync:manual');
      showToast('正在同步...', 'info');
      syncUploadAll();
      return;
    }

    // Ctrl + F: 搜索
    if (ctrl && e.key === 'f') {
      e.preventDefault();
      Events.emit('search:focus');
      return;
    }

    // ?: 快捷键帮助
    if (e.key === '?' && !ctrl) {
      e.preventDefault();
      openModal('shortcut-help-modal');
      return;
    }

    // Escape: 关闭弹窗
    if (e.key === 'Escape') {
      if (isModalOpen()) {
        closeAllModals();
      }
      return;
    }
  });
}

// src/core/router.js
/**
 * v13 页面路由模块
 * 
 * 依赖: core/state.js, core/events.js, core/constants.js (PAGES)
 * 对照档: 第七节模块6 (showPage)
 */

/**
 * 切换到指定页面
 * @param {string} pageName - 'overview'|'all'|'query'|'summary'|'room'|'wallet'
 * @param {Element} [sidebarEl] - 侧边栏点击的元素
 */
function showPage(pageName, sidebarEl) {
  // 隐藏所有页面
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove('active');
  }

  // 显示目标页面
  var target = document.getElementById('page-' + pageName);
  if (target) {
    target.classList.add('active');

    // 淡入动画
    target.style.opacity = '0';
    target.style.transition = 'opacity 0.2s ease';
    requestAnimationFrame(function() {
      target.style.opacity = '1';
    });
  }

  // 更新侧边栏高亮
  var items = document.querySelectorAll('.sb-item[data-page]');
  for (var j = 0; j < items.length; j++) {
    items[j].classList.remove('active');
  }
  if (sidebarEl) {
    sidebarEl.classList.add('active');
  }

  // 更新 topbar 标题
  var title = document.getElementById('topbar-title');
  if (title) {
    var pageInfo = getPageInfo(pageName);
    if (pageInfo) title.textContent = pageInfo.label;
  }

  // 更新 State
  State.set('currentPage', pageName);
  Events.emit(EVENTS.PAGE_CHANGED, pageName);

  // 刷新对应页面数据
  _refreshPage(pageName);
}

/**
 * 获取页面信息
 * @param {string} name
 * @returns {object|null}
 */
function getPageInfo(name) {
  for (var i = 0; i < PAGES.length; i++) {
    if (PAGES[i].name === name) return PAGES[i];
  }
  return null;
}

/**
 * 页面切换后刷新数据
 */
function _refreshPage(pageName) {
  switch (pageName) {
    case 'overview':
      if (typeof renderOverview === 'function') renderOverview();
      break;
    case 'all':
      if (typeof renderAll === 'function') renderAll();
      break;
    case 'query':
      if (typeof renderQuery === 'function') renderQuery();
      else if (typeof doQuery === 'function') doQuery();
      break;
    case 'summary':
      if (typeof renderSummary === 'function') renderSummary();
      break;
    case 'room':
      if (typeof RM !== 'undefined' && RM.render) RM.render();
      break;
    case 'wallet':
      if (typeof renderWallet === 'function') renderWallet();
      break;
  }
}

// 监听事件
Events.on(EVENTS.PAGE_CHANGED, function(pageName) {
  // 同步侧边栏 active
  var items = document.querySelectorAll('.sb-item[data-page]');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', items[i].getAttribute('data-page') === pageName);
  }
});

// src/core/auth.js
/**
 * v13 认证模块
 * 
 * 依赖: core/constants.js (APP, CONFIG), core/state.js, core/events.js
 *        utils/crypto.js (verifyPassword, setSessionPw, clearSessionPw)
 *        core/store.js (saveAuth, loadAuth)
 * 对照档: 第七节模块6, 第十节安全防护, 第十六节自动登入
 */

// ============================================================================
// 状态
// ============================================================================
var _pwAttempts = 0;
var _pwLockTimer = null;
var _sessionTimer = null;
var _locked = false;

// ============================================================================
// 登入
// ============================================================================

/**
 * 验证密码
 * @param {string} input - 用户输入
 * @returns {object} { success, error? }
 */
function checkPassword(input) {
  // 检查是否锁定
  if (_locked) {
    return { success: false, error: '密碼驗證已鎖定，請稍後再試' };
  }

  if (verifyPassword(input)) {
    // 成功
    _pwAttempts = 0;
    setSessionPw(input);
    Store.saveAuth('1');
    hidePasswordOverlay();
    startSessionTimer();
    Events.emit('auth:success');
    return { success: true };
  }

  // 失败
  _pwAttempts++;
  if (_pwAttempts >= CONFIG.MAX_PW_ATTEMPTS) {
    _lockPassword();
    return { success: false, error: '密碼錯誤次數過多，已鎖定 60 秒' };
  }

  return { success: false, error: '密碼錯誤，還剩 ' + (CONFIG.MAX_PW_ATTEMPTS - _pwAttempts) + ' 次機會' };
}

function _lockPassword() {
  _locked = true;
  clearTimeout(_pwLockTimer);
  _pwLockTimer = setTimeout(function() {
    _locked = false;
    _pwAttempts = 0;
    _pwLockTimer = null;
  }, CONFIG.LOCK_DURATION);
}

// ============================================================================
// UI
// ============================================================================

/**
 * 隐藏密码遮罩层
 */
function hidePasswordOverlay() {
  var overlay = document.getElementById('pw-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
    setTimeout(function() {
      overlay.style.display = 'none';
    }, 500);
  }
}

/**
 * 显示密码遮罩层
 */
function showPasswordOverlay() {
  var overlay = document.getElementById('pw-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    var input = document.getElementById('pw-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

/**
 * 自动登入 (对照档第十六节)
 */
function autoLogin() {
  // 检查 sessionStorage
  if (sessionStorage.getItem('macau_auth') === '1') {
    hidePasswordOverlay();
    setSessionPw(atob(APP.PWD_ENCODED));
    startSessionTimer();
    return true;
  }
  // 检查 localStorage
  if (Store.loadAuth() === '1') {
    hidePasswordOverlay();
    setSessionPw(atob(APP.PWD_ENCODED));
    sessionStorage.setItem('macau_auth', '1');
    startSessionTimer();
    return true;
  }
  return false;
}

// ============================================================================
// 会话管理
// ============================================================================

function startSessionTimer() {
  resetSession();
  // 监听用户活动
  document.addEventListener('mousemove', resetSession);
  document.addEventListener('keydown', resetSession);
  document.addEventListener('touchstart', resetSession);
}

function resetSession() {
  clearTimeout(_sessionTimer);
  _sessionTimer = setTimeout(function() {
    logout();
  }, CONFIG.SESSION_TIMEOUT);
}

function logout() {
  clearSessionPw();
  sessionStorage.removeItem('macau_auth');
  Store.remove(STORAGE_KEYS.AUTH);
  showPasswordOverlay();
  Events.emit('auth:logout');
}

// ============================================================================
// 远端访问检测
// ============================================================================

function isRemoteAccess() {
  // 检测是否通过远端 URL 访问
  var host = window.location.host;
  return host.indexOf('railway.app') >= 0 || host.indexOf('github.io') >= 0;
}

// src/pages/overview.js
/**
 * v13 总览页渲染
 * 
 * 依赖: core/state.js, core/constants.js (UI_COLORS, TERMS)
 *        calc/finance.js (totalVolume, totalComm, totalBonus, totalFund, totalDrawn, totalUndrawn)
 *        calc/stats.js (calcKPI, rankByVolume, aggregateByDay)
 *        utils/format.js (fmt, fmtMoney), utils/dom.js ($, h)
 * 对照档: 第七节模块15
 */

function renderOverview() {
  console.log('[v13:overview] renderOverview() called, txs count:', (State.get('txs') || []).length);
  
  var txs = State.get('txs') || [];
  var filter = State.get('currentTimeFilter');
  var filteredTxs = filter ? filterByTime(txs, filter) : txs;

  var kpi = calcKPI(filteredTxs);

  // --- KPI 卡片 ---
  _renderKPI(kpi);

  // --- 每日趋势图 (委托 charts/trend.js) ---
  if (typeof renderTrendChart === 'function') {
    renderTrendChart(filteredTxs);
  }

  // --- 代理排行 (委托 charts/rank.js) ---
  if (typeof renderRankChart === 'function') {
    renderRankChart(filteredTxs);
  }

  // --- 近期动态 ---
  _renderRecentActivity(filteredTxs);
}

function _renderKPI(kpi) {
  var grid = $('#ov-kpi-grid');
  if (!grid) {
    console.error('[v13:overview] #ov-kpi-grid not found!');
    return;
  }

  var cards = [
    { label: TERMS.volume,  value: fmt(kpi.totalVolume),  unit: '萬', accent: 'cyan', color: UI_COLORS.techCyan },
    { label: TERMS.comm,    value: fmtMoney(kpi.totalComm),   accent: 'blue',  color: UI_COLORS.skyBlue },
    { label: TERMS.bonus,   value: fmtMoney(kpi.totalBonus),  accent: 'violet',color: UI_COLORS.electricViolet },
    { label: TERMS.fund,    value: fmtMoney(kpi.totalFund),   accent: 'gold',  color: UI_COLORS.goldSoft },
    { label: TERMS.drawn,   value: fmtMoney(kpi.totalDrawn),  accent: 'orange',color: UI_COLORS.warning },
    { label: TERMS.undrawn, value: fmtMoney(kpi.totalUndrawn),accent: 'red',   color: UI_COLORS.danger },
  ];

  grid.innerHTML = '';
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var card = h('div', { className: 'kpi-card', 'data-kpi': c.label.toLowerCase() });
    // 仅保留动态颜色（border-left 随 KPI 类型变化）
    card.style.borderLeft = '3px solid ' + c.color;

    var label = h('div', { className: 'kpi-card-label' }, c.label);
    var value = h('div', { className: 'kpi-card-value ' + c.accent });
    value.innerHTML = c.value + (c.unit ? ' <span style="font-size:14px;opacity:0.6">' + c.unit + '</span>' : '');

    card.appendChild(label);
    card.appendChild(value);

    // KPI 点击跳转
    card.addEventListener('click', function() {
      Events.emit(EVENTS.KPI_CLICK, { kpi: this.getAttribute('data-kpi') });
    });

    grid.appendChild(card);
  }

  // 笔数/代理数
  var info = h('div', { className: 'kpi-info' });
  info.style.cssText = 'grid-column:1/-1;text-align:center;padding:10px 0;font-size:12px;color:var(--text-muted)';
  info.textContent = '共 ' + kpi.txCount + ' 筆交易 · ' + kpi.agentCount + ' 位代理';
  grid.appendChild(info);
}

function _renderRecentActivity(txs) {
  var box = $('.timeline-box');
  if (!box) return;

  // 取最近 10 笔
  var recent = txs.slice().sort(function(a, b) {
    return (b.date || '').localeCompare(a.date || '');
  }).slice(0, 10);

  box.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:12px;color:' + UI_COLORS.textPrimary + '">近期動態</div>';

  if (recent.length === 0) {
    box.appendChild(h('div', { style: 'color:' + UI_COLORS.textMuted + ';font-size:13px' }, '尚無交易記錄'));
    return;
  }

  for (var i = 0; i < recent.length; i++) {
    var tx = recent[i];
    var item = h('div', { className: 'timeline-item' });
    item.style.cssText = 'padding:8px 0;border-bottom:1px solid ' + UI_COLORS.borderSubtle + ';font-size:13px;display:flex;justify-content:space-between;align-items:center';

    var left = h('span');
    left.innerHTML = '<span style="color:' + UI_COLORS.textMuted + '">' + tx.date + '</span> ' +
                     '<span style="color:' + UI_COLORS.techCyan + '">' + (tx.agent || '') + '</span> ' +
                     (tx.client ? '<span style="color:' + UI_COLORS.textSecondary + '">' + tx.client + '</span>' : '');

    var right = h('span', { style: 'color:' + UI_COLORS.skyBlue + ';font-weight:600' }, fmt(tx.volume) + '萬');

    item.appendChild(left);
    item.appendChild(right);
    box.appendChild(item);
  }
}

// src/pages/all.js
/**
 * v13 全部交易页渲染
 * 
 * 依赖: core/state.js, calc/filters.js (filterByMonth, sortTxs)
 *        utils/format.js (fmt, fmtMoney, toNum), utils/dom.js ($, h)
 * 对照档: 第七节模块14
 */

function renderAll() {
  var txs = State.get('txs');
  var month = State.get('workingMonth');

  // ★ try-catch 包裹，防止单个渲染阶段崩溃导致页面卡死
  try {
    if (month) txs = filterByMonth(txs, month);
  } catch (e) {
    console.error('[v13:all] filterByMonth 崩溃:', e);
  }

  try {
    _renderAllKPI(txs);
  } catch (e) {
    console.error('[v13:all] _renderAllKPI 崩溃:', e);
  }

  try {
    _renderAllTable(txs);
  } catch (e) {
    console.error('[v13:all] _renderAllTable 崩溃:', e);
  }
}

function _renderAllKPI(txs) {
  var mini = $('#all-kpi-mini');
  if (!mini) return;

  var _totalVol = totalVolume(txs);
  var _totalComm = totalComm(txs);
  var _totalBonus = totalBonus(txs);
  var _totalFund = totalFund(txs);

  mini.innerHTML = '';

  var items = [
    { label: TERMS.volume, value: fmt(_totalVol) + '萬', accent: 'cyan',  color: UI_COLORS.techCyan },
    { label: TERMS.comm,   value: fmtMoney(_totalComm),  accent: 'blue',  color: UI_COLORS.skyBlue },
    { label: TERMS.bonus,  value: fmtMoney(_totalBonus), accent: 'violet',color: UI_COLORS.electricViolet },
    { label: TERMS.fund,   value: fmtMoney(_totalFund),  accent: 'gold',  color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var item = h('div', { className: 'kpi-card' });
    item.style.borderLeft = '3px solid ' + items[i].color;
    item.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '" style="font-size:18px">' + items[i].value + '</div>';
    mini.appendChild(item);
  }
}

function _renderAllTable(txs) {
  var tbody = document.querySelector('#all-table tbody');
  if (!tbody) return;

  var msg = $('#all-msg');
  if (txs.length === 0) {
    tbody.innerHTML = '';
    if (msg) msg.style.display = 'block';
    return;
  }
  if (msg) msg.style.display = 'none';

  tbody.innerHTML = '';
  for (var i = 0; i < txs.length; i++) {
    // ★ 防御：跳过 undefined 的墓碑条目
    if (!txs[i]) continue;
    (function(tx) {
      var tr = h('tr', {
        'data-fbkey': tx._fbKey,
        onclick: function() {
          var key = this.getAttribute('data-fbkey');
          Events.emit('tx:edit:request', key);
        }
      });
      tr.style.cursor = 'pointer';

      var cells = [
        tx.type === 'cash' ? '現金' : '轉碼',
        tx.date,
        tx.agent,
        tx.client || '-',
        tx.venue || '-',
        fmt(tx.volume) + '萬',
        fmtMoney(tx.comm),
        fmtMoney(tx.bonus),
        fmtMoney(tx.drawn),
        fmtMoney(tx.undrawn),
        tx.note || '-',
      ];

      for (var j = 0; j < cells.length; j++) {
        var td = h('td', {}, cells[j]);
        tr.appendChild(td);
      }

      // 操作按钮 — 用 IIFE 捕捉当前 tx，避免闭包陷阱
      var fbKey = tx._fbKey;
      var tdBtn = h('td');
      var delBtn = h('button', {
        style: 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px'
      }, '刪除');
      delBtn.onclick = (function(key) {
        return function(e) {
          e.stopPropagation();
          console.log('[v13:all] 🗑️ 刪除按鈕點擊, fbKey=' + key);
          var confirmed = confirm('確定刪除這筆交易？');
          console.log('[v13:all] confirm 返回值: ' + confirmed);
          if (confirmed) {
            console.log('[v13:all] 📤 呼叫 deleteTx(' + key + ')...');
            var result = deleteTx(key);
            console.log('[v13:all] deleteTx 返回: ' + (result ? '成功 (' + result._fbKey + ')' : 'null (刪除失敗!)'));
            toastCRUDDone();
            console.log('[v13:all] 🔄 重新渲染 renderAll()...');
            try {
              renderAll();
            } catch (e) {
              console.error('[v13:all] renderAll 崩潰:', e);
              // 数据已删除并持久化，即使渲染崩溃也不会丢失
              console.log('[v13:all] ⚠️ 數據已成功刪除，請手動刷新頁面');
            }
            console.log('[v13:all] ✅ renderAll 完成, 當前 txs 數量: ' + State.get('txs').length);
          }
        };
      })(fbKey);
      tdBtn.appendChild(delBtn);
      tr.appendChild(tdBtn);

      tbody.appendChild(tr);
    })(txs[i]);
  }
}

// src/pages/query.js
/**
 * v13 查询页渲染
 * 依赖: core/state.js, calc/filters.js (filterTxs, sortTxs), utils/format.js, utils/dom.js ($)
 * 对照档: 第七节模块13 + v12 query.js
 */

/** 入口：弹出所有下拉并执行默认查询（本月） */
function renderQuery() {
  _populateQueryFilters();
  _setDefaultMonth();
  _highlightQuickBtn('thisMonth');
  doQuery();
}

/**
 * 从交易数据中自动检测所有出现的年份
 * @returns {number[]} 降序排列的年份列表
 */
function _detectYears() {
  var txs = State.get('txs');
  var years = {};
  var now = new Date();
  var currentYear = now.getFullYear();
  // 确保至少有当前年
  years[currentYear] = true;

  for (var i = 0; i < txs.length; i++) {
    var d = txs[i].date;
    if (d && d.length >= 4) {
      var y = parseInt(d.substring(0, 4));
      if (!isNaN(y) && y >= 2020) years[y] = true;
    }
  }

  var result = Object.keys(years).map(Number);
  result.sort(function(a, b) { return b - a; }); // 降序：最新在前
  return result;
}

/** 填充查詢頁下拉：代理、地點、月份（多年份） */
function _populateQueryFilters() {
  // ---- 代理 ----
  var agentSel = document.getElementById('query-agent');
  if (agentSel) {
    agentSel.innerHTML = '<option value="">全部代理</option><option value="__FUND__">🏦 公基金</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      var opt = document.createElement('option');
      opt.value = agents[i];
      opt.textContent = agents[i];
      agentSel.appendChild(opt);
    }
  }

  // ---- 地點（VENUE_OPTIONS 是对象数组 {label, casino}） ----
  var venueSel = document.getElementById('query-venue');
  if (venueSel) {
    venueSel.innerHTML = '<option value="">全部地點</option>';
    var venues = (typeof VENUE_OPTIONS !== 'undefined') ? VENUE_OPTIONS : [];
    for (var j = 0; j < venues.length; j++) {
      var v = venues[j];
      var opt = document.createElement('option');
      if (typeof v === 'object' && v !== null) {
        opt.value = v.label;
        opt.textContent = v.label;
      } else {
        opt.value = v;
        opt.textContent = v;
      }
      venueSel.appendChild(opt);
    }
  }

  // ---- 月份（动态检测年份） ----
  _refreshMonthDropdown();
}

/** 设定月份下拉默认值为当前月，默认填入日期范围为当月 */
function _setDefaultMonth() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var mStr = month < 10 ? '0' + month : '' + month;
  var monthValue = year + '-' + mStr;

  var monthSel = document.getElementById('query-month');
  if (monthSel) {
    // 尝试选中当前月份
    var found = false;
    var opts = monthSel.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === monthValue) {
        monthSel.selectedIndex = i;
        found = true;
        break;
      }
    }
    // 如果当前月份不在列表中（没有该年数据），默认不选
    if (!found) {
      monthSel.selectedIndex = 0;
    }
  }

  var daysInMonth = new Date(year, month, 0).getDate();
  var dateFrom = year + '-' + mStr + '-01';
  var dateTo = year + '-' + mStr + '-' + (daysInMonth < 10 ? '0' + daysInMonth : daysInMonth);

  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  if (fromEl) fromEl.value = dateFrom;
  if (toEl) toEl.value = dateTo;
}

function _highlightQuickBtn(type) {
  var btns = document.querySelectorAll('#page-query .tf-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  for (var j = 0; j < btns.length; j++) {
    if (btns[j].textContent.trim() === _quickBtnLabel(type)) {
      btns[j].classList.add('active');
    }
  }
}

function _quickBtnLabel(type) {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var map = {
    lastWeek: '上週', thisWeek: '本週', thisMonth: '本月',
    lastMonth: '上月', thisYear: '年度', custom: '自訂'
  };
  return map[type] || '';
}

/** 更新月份下拉的 option value 和选中状态（跨年支持）*/
function _refreshMonthDropdown() {
  var monthSel = document.getElementById('query-month');
  if (!monthSel) return;

  var currentValue = monthSel.value;  // 记住当前选择
  var years = _detectYears();

  monthSel.innerHTML = '<option value="">全部月份</option>';
  for (var yi = 0; yi < years.length; yi++) {
    var yr = years[yi];
    var groupOpt = document.createElement('option');
    groupOpt.value = '';
    groupOpt.textContent = '── ' + yr + ' 年 ──';
    groupOpt.disabled = true;
    groupOpt.style.cssText = 'color:var(--tech-cyan);font-weight:700;font-size:12px;';
    monthSel.appendChild(groupOpt);

    for (var m = 1; m <= 12; m++) {
      var mStr = m < 10 ? '0' + m : '' + m;
      var monOpt = document.createElement('option');
      monOpt.value = yr + '-' + mStr;
      monOpt.textContent = '  ' + m + '月';
      monthSel.appendChild(monOpt);
    }
  }

  // 恢复选择
  if (currentValue) {
    for (var i = 0; i < monthSel.options.length; i++) {
      if (monthSel.options[i].value === currentValue) {
        monthSel.selectedIndex = i;
        break;
      }
    }
  }
}

/** 执行查询 — 根据代理选择路由到不同渲染模式 */
function doQuery() {
  try {
    var agent = '';
    var agentEl = document.getElementById('query-agent');
    if (agentEl && agentEl.value) agent = agentEl.value;

    // === 公基金模式 ===
    if (agent === '__FUND__') {
      _renderFundLedger();
      return;
    }

    // === 普通 / 代理明细模式 ===
    var txs = State.get('txs');
    var criteria = {};

    // 代理
    if (agent) criteria.agent = agent;

    // 地点 (基金模式不适用)
    var venueEl = document.getElementById('query-venue');
    if (venueEl && venueEl.value) criteria.venue = venueEl.value;

    // 月份
    var monthEl = document.getElementById('query-month');
    if (monthEl && monthEl.value) criteria.month = monthEl.value;

    // 日期范围
    var fromEl = document.getElementById('query-date-from');
    var toEl = document.getElementById('query-date-to');
    if (fromEl && fromEl.value) criteria.dateFrom = fromEl.value;
    if (toEl && toEl.value) criteria.dateTo = toEl.value;

    // 关键词
    var searchEl = document.getElementById('query-search');
    if (searchEl && searchEl.value) criteria.keyword = searchEl.value;

    var filtered = filterTxs(txs, criteria);

    // 获取选定的月份（用于 pre-balance 和月份过滤）
    var queryMonth = criteria.month || '';
    if (!queryMonth && criteria.dateFrom) {
      queryMonth = criteria.dateFrom.substring(0, 7);
    }

    // === 代理明细模式 ===
    if (agent) {
      _renderAgentLedger(agent, filtered, queryMonth);
      return;
    }

    // === 普通模式（全部代理）===
    // KPI
    _renderQueryKPI(filtered);
    // 交易表格
    _renderQueryTable(filtered);
    // 代理帐务表（显示）
    _renderQueryAgentSummary(filtered);
    // 显示代理帐务汇总部
    var summarySection = document.getElementById('query-agent-summary-section');
    if (summarySection) summarySection.style.display = '';

  } catch(e) {
    console.error('[doQuery] error:', e);
    showToast('查詢失敗：' + (e.message || e), 'error');
  }
}

// ============================================================================
// 普通模式：KPI + 交易表格 + 代理汇总
// ============================================================================

function _renderQueryKPI(txs) {
  var el = $('#query-kpi');
  if (!el) return;

  var vol = totalVolume(txs);
  var comm = totalComm(txs);
  var undrawn = totalUndrawn(txs);
  var totalWallet = getTotalWallet();

  el.innerHTML = '';

  var items = [
    { label: TERMS.volume,  value: fmt(vol) + '萬', accent: 'cyan',   color: UI_COLORS.techCyan },
    { label: TERMS.comm,    value: fmtMoney(comm), accent: 'blue',    color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, value: fmtMoney(undrawn), accent: 'orange', color: UI_COLORS.warning },
    { label: '💰 總錢包',   value: fmtMoney(totalWallet), accent: 'gold',   color: UI_COLORS.goldSoft },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div', { className: 'kpi-card' });
    card.style.borderLeft = '3px solid ' + items[i].color;
    card.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '" style="font-size:20px">' + items[i].value + '</div>';
    el.appendChild(card);
  }

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = '';
}

function _renderQueryTable(txs) {
  var thead = document.getElementById('query-thead');
  var tbody = document.getElementById('query-tbody');
  if (!tbody) return;

  // 恢复默认表头
  if (thead) {
    thead.innerHTML = '<tr><th>日期</th><th>代理</th><th>地點</th><th>洗碼量</th><th>碼糧</th><th>已提領</th><th>未提領</th><th>備註</th></tr>';
  }

  tbody.innerHTML = '';
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var tr = h('tr');
    var cells = [tx.date, tx.agent, tx.venue, fmt(tx.volume) + '萬', fmtMoney(tx.bonus), fmtMoney(tx.drawn), fmtMoney(tx.undrawn), tx.note || ''];
    for (var j = 0; j < cells.length; j++) {
      tr.appendChild(h('td', {}, cells[j]));
    }
    tbody.appendChild(tr);
  }
}

function _renderQueryAgentSummary(txs) {
  var agentTable = document.querySelector('#page-query .agent-summary-table tbody');
  if (!agentTable) return;

  var agg = aggregateByAgent(txs);
  agentTable.innerHTML = '';
  for (var i = 0; i < agg.length; i++) {
    var a = agg[i];
    var balance = getAgentBalance(a.agent);
    var tr = h('tr');
    var cells = [a.agent, fmt(a.volume) + '萬', fmtMoney(a.bonus), fmtMoney(a.drawn), fmtMoney(a.undrawn), fmtMoney(balance)];
    for (var j = 0; j < cells.length; j++) {
      tr.appendChild(h('td', {}, cells[j]));
    }
    agentTable.appendChild(tr);
  }
}

// ============================================================================
// 公基金明细模式 (agent === "__FUND__")
// ============================================================================

function _renderFundLedger() {
  var txs = State.get('txs');
  var fundWithdrawals = State.get('fundWithdrawals');

  // 获取筛选条件
  var monthEl = document.getElementById('query-month');
  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  var queryMonth = monthEl && monthEl.value ? monthEl.value : '';
  var dateFrom = fromEl && fromEl.value ? fromEl.value : '';
  var dateTo = toEl && toEl.value ? toEl.value : '';

  var skipMonthFilter = !queryMonth && !dateFrom && !dateTo;

  // 构建公基金流水：交易产生的入帐 + 手动存取记录
  var allLedger = [];
  var totalFundIncome = 0;

  // 1. 从交易中提取公基金入帐
  for (var i = 0; i < txs.length; i++) {
    var fv = txs[i].fund || 0;
    if (fv > 0) {
      totalFundIncome += fv;
      allLedger.push({
        date: txs[i].date,
        desc: (txs[i].agent || '') + ' ' + (txs[i].client || ''),
        amount: fv,
        type: '入帳',
        source: 'tx',
        id: txs[i].id,
        _fbKey: txs[i]._fbKey
      });
    }
  }

  // 2. 公基金手动存取记录
  var totalDep = 0, totalCDep = 0, totalW = 0;
  for (var i = 0; i < fundWithdrawals.length; i++) {
    var r = fundWithdrawals[i];
    var rType = r.type || '';
    if (rType === 'deposit') {
      totalDep += (r.amount || 0);
    } else if (rType === 'cash_deposit') {
      totalCDep += (r.amount || 0);
    } else {
      totalW += (r.amount || 0);
    }

    var typeLabel = rType === 'deposit' ? '存入' : (rType === 'cash_deposit' ? '自存現金' : '提領');
    allLedger.push({
      date: r.date,
      desc: r.note || '',
      amount: r.amount || 0,
      type: typeLabel,
      rawType: rType,
      source: 'fund',
      id: r.id,
      _fbKey: r._fbKey
    });
  }

  allLedger.sort(function(a, b) { return a.date.localeCompare(b.date); });

  // 计算上月累计 (pre-balance)
  var preBalance = 0;
  if (!skipMonthFilter) {
    var filterMonthStart = queryMonth ? queryMonth + '-01' : dateFrom;
    for (var i = 0; i < allLedger.length; i++) {
      var e = allLedger[i];
      if (e.date < filterMonthStart) {
        if (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') {
          preBalance += e.amount;
        } else {
          preBalance -= e.amount;
        }
      }
    }
  }

  var balance = Math.max(0, totalFundIncome + totalDep + totalCDep - totalW);

  // === KPI ===
  var kpiEl = document.getElementById('query-kpi');
  if (kpiEl) {
    kpiEl.innerHTML = '';

    var kpiItems = [
      { label: '公基金總額', value: fmtMoney(totalFundIncome), color: UI_COLORS.goldSoft },
      { label: '已提領',      value: fmtMoney(totalW),          color: UI_COLORS.danger },
      { label: '可提餘額',    value: fmtMoney(balance),         color: UI_COLORS.warning },
    ];
    if (totalCDep > 0) {
      kpiItems.splice(1, 0, { label: '自存現金', value: fmtMoney(totalCDep), color: UI_COLORS.cashOrange });
    }

    for (var i = 0; i < kpiItems.length; i++) {
      var card = h('div', { className: 'kpi-card' });
      card.style.borderLeft = '3px solid ' + kpiItems[i].color;
      card.innerHTML = '<div class="kpi-card-label">' + kpiItems[i].label + '</div>' +
                       '<div class="kpi-card-value" style="font-size:20px;color:' + kpiItems[i].color + '">' + kpiItems[i].value + '</div>';
      kpiEl.appendChild(card);
    }

    // ＋ 提领 按钮
    var btnDiv = h('div', { className: 'kpi-card', style: 'display:flex;align-items:center;justify-content:center;border-left:3px solid transparent' });
    btnDiv.innerHTML = '<button class="btn btn-sm btn-primary" onclick="openFundModal()">＋ 提領</button>';
    kpiEl.appendChild(btnDiv);
  }

  // === 表格 ===
  var thead = document.getElementById('query-thead');
  var tbody = document.getElementById('query-tbody');
  if (!tbody) return;

  if (thead) {
    thead.innerHTML = '<tr><th>日期</th><th>說明</th><th class="num">入帳</th><th class="num">提領</th><th>操作</th><th class="num">基金餘額</th></tr>';
  }

  tbody.innerHTML = '';

  // 上月累计行
  if (!skipMonthFilter && preBalance > 0) {
    var pr = h('tr');
    pr.style.cssText = 'background:rgba(201,168,76,0.08);'; // derived from UI_COLORS.goldSoft
    pr.innerHTML = '<td>' + (queryMonth || dateFrom).substring(0, 7) + '-01</td><td style="color:' + UI_COLORS.goldSoft + ';font-weight:600;">上月累計</td><td class="num"></td><td class="num"></td><td></td><td class="num" style="font-weight:700;color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(preBalance) + '</td>';
    tbody.appendChild(pr);
  }

  // 数据行
  var running = preBalance;
  var filterMonthStart = queryMonth ? queryMonth + '-01' : dateFrom;

  for (var i = 0; i < allLedger.length; i++) {
    var e = allLedger[i];

    // 月份/日期过滤
    if (!skipMonthFilter) {
      if (filterMonthStart && e.date < filterMonthStart) continue;
      if (dateFrom && e.date < dateFrom) continue;
      if (dateTo && e.date > dateTo) continue;
    }

    if (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') {
      running += e.amount;
    } else {
      running -= e.amount;
    }

    var tr = h('tr');
    var typeClr = e.type === '提領' ? 'color:#f85149;font-weight:600;' : (e.type === '存入' ? 'color:#58a6ff;' : (e.type === '自存現金' ? 'color:#e67e22;font-weight:600;' : 'color:' + UI_COLORS.goldSoft + ';'));

    var delBtn = e.source === 'fund'
      ? '<button class="btn-red" onclick="deleteFundRecord(\'' + (e._fbKey || e.id) + '\')">刪除</button>'
      : '<span style="color:#6e7681;font-size:11px;">自動</span>';

    var inVal = (e.type === '入帳' || e.type === '存入' || e.type === '自存現金') ? fmtMoney(e.amount) : '';
    var outVal = (e.type === '提領') ? fmtMoney(e.amount) : '';

    tr.innerHTML = '<td>' + e.date + '</td>' +
      '<td style="' + typeClr + '">' + e.desc + '</td>' +
      '<td class="num" style="color:' + UI_COLORS.goldSoft + ';">' + inVal + '</td>' +
      '<td class="num" style="color:#f85149;">' + outVal + '</td>' +
      '<td>' + delBtn + '</td>' +
      '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';
    tbody.appendChild(tr);
  }

  // 合计行
  _appendTotalRow(tbody, running);

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = 'none';
}

// ============================================================================
// 代理對帳單模式 (指定代理时)
// ============================================================================

function _renderAgentLedger(agent, filteredTxs, queryMonth) {
  var txs = State.get('txs');
  var agentWallets = State.get('agentWallets');
  var awArr = agentWallets[agent] || [];

  // 从全部交易中计算该代理的各项汇总 (不分月份)
  var allBonus = 0, allCash = 0;
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent === agent) {
      allBonus += (txs[i].bonus || 0);
      allCash += (txs[i].cash || 0);
    }
  }

  // 钱包异动汇总
  var awDep = 0, awCDep = 0, awWithdraw = 0;
  for (var i = 0; i < awArr.length; i++) {
    var wt = awArr[i].type;
    var amt = awArr[i].amount || 0;
    if (wt === 'deposit') awDep += amt;
    else if (wt === 'cash_deposit') awCDep += amt;
    else awWithdraw += amt;
  }

  // 所有提领 = 交易中已提领 + 钱包提领
  var allDrawn = 0;
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent === agent) {
      allDrawn += (txs[i].drawn || 0);
    }
  }
  // 钱包提领也加到已提领
  allDrawn += awWithdraw;

  var awBalance = Math.max(0, allBonus + allCash + awDep + awCDep - allDrawn);

  // 取得月份过滤起止
  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  var dateFrom = fromEl && fromEl.value ? fromEl.value : '';
  var dateTo = toEl && toEl.value ? toEl.value : '';
  var skipMonthFilter = !queryMonth && !dateFrom && !dateTo;
  var filterStart = queryMonth ? queryMonth + '-01' : dateFrom;

  // === 构建合并流水 ===
  var allLedger = [];

  // 1. 交易入帐
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].agent !== agent) continue;
    var bv = txs[i].bonus || 0;
    var cv = txs[i].cash || 0;
    if (bv > 0) {
      allLedger.push({
        date: txs[i].date,
        venue: txs[i].venue || '',
        client: txs[i].client || '',
        volume: toNum(txs[i].volume) || 0,
        bonus: bv,
        rowType: 'rolling',
        type: '入帳',
        source: 'tx',
        id: txs[i].id,
        _fbKey: txs[i]._fbKey
      });
    }
    if (cv > 0) {
      allLedger.push({
        date: txs[i].date,
        venue: '現金寄放',
        client: txs[i].note || '',
        volume: 0,
        bonus: cv,
        rowType: 'cash',
        type: '入帳',
        source: 'tx',
        id: txs[i].id,
        _fbKey: txs[i]._fbKey
      });
    }
  }

  // 2. 钱包操作
  for (var i = 0; i < awArr.length; i++) {
    var r = awArr[i];
    var wt = r.type;
    if (wt === 'deposit') {
      allLedger.push({
        date: r.date,
        venue: '存入',
        client: '',
        volume: 0,
        bonus: (r.amount || 0),
        amount: r.amount || 0,
        rowType: 'aw_deposit',
        type: '存入',
        source: 'wallet',
        id: r.id,
        _fbKey: r._fbKey,
        note: r.note || ''
      });
    } else if (wt === 'cash_deposit') {
      allLedger.push({
        date: r.date,
        venue: '自存現金',
        client: '',
        volume: 0,
        bonus: (r.amount || 0),
        amount: r.amount || 0,
        rowType: 'aw_cash_dep',
        type: '自存現金',
        source: 'wallet',
        id: r.id,
        _fbKey: r._fbKey,
        note: r.note || ''
      });
    } else {
      allLedger.push({
        date: r.date,
        venue: '提領',
        client: '',
        volume: 0,
        bonus: -(r.amount || 0),
        amount: r.amount || 0,
        rowType: 'withdraw',
        type: '提領',
        source: 'wallet',
        id: r.id,
        _fbKey: r._fbKey,
        note: r.note || ''
      });
    }
  }

  allLedger.sort(function(a, b) { return a.date.localeCompare(b.date); });

  // 计算上月累计
  var preRunning = 0;
  if (!skipMonthFilter && filterStart) {
    for (var i = 0; i < allLedger.length; i++) {
      if (allLedger[i].date < filterStart) {
        preRunning += allLedger[i].bonus;
      }
    }
  }

  // === KPI ===
  var kpiEl = document.getElementById('query-kpi');
  if (kpiEl) {
    kpiEl.innerHTML = '';

    var kpiItems = [
      { label: '碼糧總額', value: fmtMoney(allBonus), color: UI_COLORS.goldSoft },
    ];
    if (allCash > 0) {
      kpiItems.push({ label: '現金寄放', value: fmtMoney(allCash), color: UI_COLORS.cashOrange });
    }
    if (awDep > 0) {
      kpiItems.push({ label: '錢包存入', value: fmtMoney(awDep), color: UI_COLORS.skyBlue });
    }
    if (awCDep > 0) {
      kpiItems.push({ label: '自存現金', value: fmtMoney(awCDep), color: UI_COLORS.cashOrange });
    }
    kpiItems.push({ label: '已提領', value: fmtMoney(allDrawn), color: UI_COLORS.danger });
    kpiItems.push({ label: '未提領', value: fmtMoney(awBalance), color: UI_COLORS.warning });

    for (var i = 0; i < kpiItems.length; i++) {
      var card = h('div', { className: 'kpi-card' });
      card.style.borderLeft = '3px solid ' + kpiItems[i].color;
      card.innerHTML = '<div class="kpi-card-label">' + kpiItems[i].label + '</div>' +
                       '<div class="kpi-card-value" style="font-size:20px;color:' + kpiItems[i].color + '">' + kpiItems[i].value + '</div>';
      kpiEl.appendChild(card);
    }

    // ＋ 異动 按钮
    var btnDiv = h('div', { className: 'kpi-card', style: 'display:flex;align-items:center;justify-content:center;border-left:3px solid transparent' });
    btnDiv.innerHTML = '<button class="btn btn-sm btn-primary" onclick="openWalletModal(\'' + agent.replace(/'/g, "\\'") + '\')">＋ 異動</button>';
    kpiEl.appendChild(btnDiv);
  }

  // === 表格 ===
  var thead = document.getElementById('query-thead');
  var tbody = document.getElementById('query-tbody');
  if (!tbody) return;

  if (thead) {
    thead.innerHTML = '<tr><th>日期</th><th>地點/說明</th><th class="num">轉碼數</th><th class="num">碼糧</th><th>操作</th><th class="num">未領餘額</th></tr>';
  }

  tbody.innerHTML = '';

  // 标题行
  var titleRow = h('tr');
  titleRow.innerHTML = '<td colspan="6" style="padding:8px 0;font-weight:700;color:' + UI_COLORS.goldSoft + ';font-size:14px;">💼 ' + agent + ' 代理對帳單</td>';
  tbody.appendChild(titleRow);

  // 上月累计行
  if (!skipMonthFilter && preRunning > 0) {
    var pr = h('tr');
    pr.style.cssText = 'background:rgba(201,168,76,0.08);'; // derived from UI_COLORS.goldSoft
    pr.innerHTML = '<td>' + filterStart.substring(0, 7) + '-01</td><td style="color:' + UI_COLORS.goldSoft + ';font-weight:600;">上月累計</td><td class="num"></td><td class="num"></td><td></td><td class="num" style="font-weight:700;color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(preRunning) + '</td>';
    tbody.appendChild(pr);
  }

  // 数据行
  var running = preRunning;
  for (var i = 0; i < allLedger.length; i++) {
    var e = allLedger[i];

    // 月份/日期过滤
    if (!skipMonthFilter) {
      if (filterStart && e.date < filterStart) continue;
      if (dateFrom && e.date < dateFrom) continue;
      if (dateTo && e.date > dateTo) continue;
    }

    running += e.bonus;
    var tr = h('tr');

    if (e.rowType === 'withdraw') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#f85149;font-weight:700;">提領' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#f85149;font-weight:700;">-' + fmtMoney(e.amount) + '</td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'aw_deposit') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#58a6ff;font-weight:700;">存入' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#58a6ff;font-weight:700;">+' + fmtMoney(e.amount) + '</td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'aw_cash_dep') {
      var val = (e._fbKey || e.id).toString();
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#e67e22;font-weight:700;">自存現金' + (e.note ? '：' + e.note : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#e67e22;font-weight:700;">+' + fmtMoney(e.amount) + '</td>' +
        '<td><button class="btn-red" onclick="deleteAgentWallet(\'' + agent.replace(/'/g, "\\'") + '\',\'' + val + '\')">刪除</button></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else if (e.rowType === 'cash') {
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td style="color:#e67e22;font-weight:700;">現金寄放' + (e.client ? '：' + e.client : '') + '</td>' +
        '<td class="num"></td>' +
        '<td class="num" style="color:#e67e22;font-weight:700;">+' + fmtMoney(e.bonus) + '</td>' +
        '<td><span style="color:#6e7681;font-size:11px;">自動</span></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';

    } else {
      var volStr = e.volume > 0 ? fmt(e.volume) + '萬' : '';
      tr.innerHTML = '<td>' + e.date + '</td>' +
        '<td>' + (e.venue || '') + '(' + (e.client || '') + ')</td>' +
        '<td class="num">' + volStr + '</td>' +
        '<td class="num" style="color:' + UI_COLORS.goldSoft + ';">' + fmtMoney(e.bonus) + '</td>' +
        '<td><span style="color:#6e7681;font-size:11px;">自動</span></td>' +
        '<td class="num" style="font-weight:700;">' + fmtMoney(Math.max(0, running)) + '</td>';
    }
    tbody.appendChild(tr);
  }

  // 合计行
  _appendTotalRow(tbody, running);

  // 隐藏代理帐务汇总
  var summarySection = document.getElementById('query-agent-summary-section');
  if (summarySection) summarySection.style.display = 'none';
}

// ============================================================================
// 共用：合计行
// ============================================================================

function _appendTotalRow(tbody, running) {
  var tr = h('tr');
  tr.style.cssText = 'background:rgba(22,27,34,0.8);font-weight:700;color:' + UI_COLORS.goldSoft + ';'; // bgElevated at 80% opacity
  tr.innerHTML = '<td></td><td style="color:' + UI_COLORS.textPrimary + ';">合計</td><td class="num"></td><td class="num"></td><td></td><td class="num" style="font-size:15px;">' + fmtMoney(Math.max(0, running)) + '</td>';
  tbody.appendChild(tr);
}

// ============================================================================
// 快速时间筛选
// ============================================================================

function quickFilter(type) {
  _highlightQuickBtn(type);

  var fromEl = document.getElementById('query-date-from');
  var toEl = document.getElementById('query-date-to');
  var customRange = document.getElementById('query-date-range');

  var now = new Date();
  var dateFrom = '';
  var dateTo = '';

  switch (type) {
    case 'lastWeek': {
      var dayOfWeek = now.getDay() || 7;
      var lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - dayOfWeek - 6);
      var lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      dateFrom = _ymd(lastMonday);
      dateTo = _ymd(lastSunday);
      break;
    }
    case 'thisWeek': {
      var dayOfWeek = now.getDay() || 7;
      var thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - dayOfWeek + 1);
      dateFrom = _ymd(thisMonday);
      dateTo = _ymd(now);
      break;
    }
    case 'thisMonth': {
      dateFrom = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-01';
      dateTo = _ymd(now);
      break;
    }
    case 'lastMonth': {
      var firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      var lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFrom = _ymd(firstDayLastMonth);
      dateTo = _ymd(lastDayLastMonth);
      break;
    }
    case 'thisYear': {
      dateFrom = now.getFullYear() + '-01-01';
      dateTo = _ymd(now);
      break;
    }
    case 'custom': {
      if (customRange) customRange.style.display = '';
      if (fromEl && !fromEl.value) fromEl.value = _ymd(now);
      if (toEl && !toEl.value) toEl.value = _ymd(now);
      doQuery();
      return;
    }
  }

  if (customRange) customRange.style.display = '';
  if (fromEl) fromEl.value = dateFrom;
  if (toEl) toEl.value = dateTo;

  doQuery();
}

function _ymd(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

// src/pages/summary.js
/**
 * v13 统计页渲染 (代理×场地聚合)
 * 依赖: calc/stats.js (aggregateByAgentVenue), utils/format.js
 * 对照档: 第七节模块10 renderSummary
 */

function renderSummary() {
  var txs = State.get('txs');
  var month = State.get('workingMonth');

  // ★ try-catch 包裹，防止未定义条目导致崩溃
  try {
    if (month) txs = filterByMonth(txs, month);
  } catch (e) {
    console.error('[v13:summary] filterByMonth 崩溃:', e);
  }

  // KPI
  try {
    _renderSummaryKPI(txs);
  } catch (e) {
    console.error('[v13:summary] _renderSummaryKPI 崩溃:', e);
  }

  // 代理×场地表
  try {
    _renderSummaryTable(txs);
  } catch (e) {
    console.error('[v13:summary] _renderSummaryTable 崩溃:', e);
  }
}

function _renderSummaryKPI(txs) {
  var el = $('#summary-kpi');
  if (!el) return;
  var kpi = calcKPI(txs);
  el.innerHTML = '';

  var items = [
    { label: '總筆數', value: kpi.txCount, accent: 'cyan',   color: UI_COLORS.techCyan },
    { label: '代理數', value: kpi.agentCount, accent: 'violet', color: UI_COLORS.electricViolet },
    { label: TERMS.volume, value: fmt(kpi.totalVolume) + '萬', accent: 'blue',    color: UI_COLORS.skyBlue },
    { label: TERMS.undrawn, value: fmtMoney(kpi.totalUndrawn), accent: 'orange',  color: UI_COLORS.warning },
  ];

  for (var i = 0; i < items.length; i++) {
    var card = h('div', { className: 'kpi-card' });
    card.style.borderLeft = '3px solid ' + items[i].color;
    card.innerHTML = '<div class="kpi-card-label">' + items[i].label + '</div>' +
                     '<div class="kpi-card-value ' + items[i].accent + '">' + items[i].value + '</div>';
    el.appendChild(card);
  }
}

function _renderSummaryTable(txs) {
  var tbody = document.querySelector('#summary-table tbody');
  if (!tbody) return;

  var data = aggregateByAgentVenue(txs);
  tbody.innerHTML = '';

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var tr = h('tr');
    var cells = [d.agent, d.venue, fmt(d.volume) + '萬', fmtMoney(d.bonus), fmtMoney(d.drawn), fmtMoney(d.undrawn)];
    for (var j = 0; j < cells.length; j++) {
      tr.appendChild(h('td', {}, cells[j]));
    }
    tbody.appendChild(tr);
  }
}

// src/pages/room.js
/**
 * v13 房务系统 (RM 对象)
 * 依赖: core/state.js, data/bookings.js, data/hotel-config.js
 *        utils/format.js, utils/dom.js, calc/finance.js (calcRoomQuota)
 * 对照档: 第七节模块18 (24 方法)
 */

// ============================================================================
// 日期下拉辅助 (年/月/日 三联动 select)
// ============================================================================

/** 填充年月日三个 select。prefix: 'rm-checkin' or 'rm-checkout' */
function rmInitDateSels(prefix, defYear, defMonth, defDay) {
  var yEl = $('#' + prefix + '-y');
  var mEl = $('#' + prefix + '-m');
  var dEl = $('#' + prefix + '-d');
  if (!yEl || !mEl || !dEl) return;

  var today = new Date();
  var curYear  = today.getFullYear();
  // 若未指定默认值，默认使用今天
  if (defYear  == null) defYear  = curYear;
  if (defMonth == null) defMonth = (today.getMonth() + 1 < 10 ? '0' : '') + (today.getMonth() + 1);
  if (defDay   == null) defDay   = (today.getDate() < 10 ? '0' : '') + today.getDate();

  // 年：当年（默认选中）前后各1年 (总计 3 年)，force rebuild
  yEl.innerHTML = '';
  var yOpt0 = document.createElement('option');
  yOpt0.value = ''; yOpt0.textContent = '年'; yEl.appendChild(yOpt0);
  for (var y = curYear - 1; y <= curYear + 1; y++) {
    var yo = document.createElement('option');
    yo.value = y; yo.textContent = y + '年';
    if (y == defYear) yo.selected = true;
    yEl.appendChild(yo);
  }
  // 月
  mEl.innerHTML = '';
  var mOpt0 = document.createElement('option');
  mOpt0.value = ''; mOpt0.textContent = '月'; mEl.appendChild(mOpt0);
  for (var m = 1; m <= 12; m++) {
    var mv = (m < 10 ? '0' : '') + m;
    var mo = document.createElement('option');
    mo.value = mv;
    mo.textContent = m + '月';
    if (mv == defMonth) mo.selected = true;
    mEl.appendChild(mo);
  }
  // 日
  dEl.innerHTML = '';
  var dOpt0 = document.createElement('option');
  dOpt0.value = ''; dOpt0.textContent = '日'; dEl.appendChild(dOpt0);
  for (var d = 1; d <= 31; d++) {
    var dv = (d < 10 ? '0' : '') + d;
    var doo = document.createElement('option');
    doo.value = dv;
    doo.textContent = d + '日';
    if (dv == defDay) doo.selected = true;
    dEl.appendChild(doo);
  }
  // 同步到 hidden input
  rmReadDateSels(prefix);
}

/** 读取三个 select 合成 YYYY-MM-DD 字符串，并同步 hidden input */
function rmReadDateSels(prefix) {
  var y = ($('#' + prefix + '-y') || {}).value;
  var m = ($('#' + prefix + '-m') || {}).value;
  var d = ($('#' + prefix + '-d') || {}).value;
  var val = (y && m && d) ? (y + '-' + m + '-' + d) : '';
  var hidden = $('#' + prefix);
  if (hidden) hidden.value = val;
  return val;
}

/** 根据 YYYY/MM/DD 字符串反填三个 select */
function rmSetDateSels(prefix, dateStr) {
  if (!dateStr) return;
  // 支持 YYYY/MM/DD 和 YYYY-MM-DD
  var parts = dateStr.replace(/-/g, '/').split('/');
  if (parts.length !== 3) return;
  var yEl = $('#' + prefix + '-y');
  var mEl = $('#' + prefix + '-m');
  var dEl = $('#' + prefix + '-d');
  if (yEl) yEl.value = parts[0];
  if (mEl) mEl.value = parts[1].length === 1 ? '0' + parts[1] : parts[1];
  if (dEl) dEl.value = parts[2].length === 1 ? '0' + parts[2] : parts[2];
  var hidden = $('#' + prefix);
  if (hidden) hidden.value = dateStr;
}

var RM = {
  bookings: [],
  lastId: 0,
  editingId: null,

  /** 现在日期 */
  nowStr: function() { return nowStr(); },

  /** 格式化 */
  fmt: function(n) { return fmt(n); },

  // ===== 加载/保存 =====
  load: function() {
    RM.bookings = State.get('bookings');
    RM.lastId = State.get('bookingNextId') - 1;
  },
  save: function() {
    State.set('bookings', RM.bookings);
    Store.saveBookings(RM.bookings);
    Store.saveBookingLastId(RM.lastId);
  },

  // ===== 下拉填充 =====
  populateCasinoDropdown: function() {
    var sel = $('#rm-casino');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇體系</option>';
    var config = getAllHC();
    var seen = {};
    for (var i = 0; i < config.length; i++) {
      if (!seen[config[i].casino]) {
        seen[config[i].casino] = true;
        sel.appendChild(h('option', { value: config[i].casino }, config[i].casino));
      }
    }
  },

  populateHotelDropdown: function(casino) {
    var sel = $('#rm-hotel');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇酒店</option>';
    var hotels = getHotelsByCasino(casino);
    for (var i = 0; i < hotels.length; i++) {
      sel.appendChild(h('option', { value: hotels[i] }, hotels[i]));
    }
  },

  populateRoomDropdown: function(casino, hotel) {
    var sel = $('#rm-room');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇房型</option>';
    var rooms = getRoomsByHotel(casino, hotel);
    for (var i = 0; i < rooms.length; i++) {
      var opt = h('option', {
        value: rooms[i].room,
        'data-price': rooms[i].weekday,
        'data-threshold': rooms[i].threshold
      }, rooms[i].room + ' (¥' + rooms[i].weekday + '/晚, 門檻' + rooms[i].threshold + '萬)');
      sel.appendChild(opt);
    }
  },

  populateAgentDropdown: function() {
    var sel = $('#rm-agent');
    if (!sel) return;
    sel.innerHTML = '<option value="">選擇代理</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      sel.appendChild(h('option', { value: agents[i] }, agents[i]));
    }
  },

  populateAgentFilter: function() {
    var sel = $('#rm-agent-filter');
    if (!sel) return;
    sel.innerHTML = '<option value="">全部代理</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      sel.appendChild(h('option', { value: agents[i] }, agents[i]));
    }
  },

  // ===== 联动 =====
  onCasinoChange: function() {
    var casino = ($('#rm-casino') || {}).value;
    RM.populateHotelDropdown(casino);
    // 自动选第一间酒店（跳过「選擇酒店」空选项）
    var hotelSel = $('#rm-hotel');
    if (hotelSel && hotelSel.options.length > 1) {
      hotelSel.selectedIndex = 1;
      RM.onHotelChange();
    } else {
      if (hotelSel) hotelSel.value = '';
      if ($('#rm-room')) $('#rm-room').innerHTML = '<option value="">選擇房型</option>';
    }
  },

  onHotelChange: function() {
    var casino = $('#rm-casino').value;
    var hotel = $('#rm-hotel').value;
    RM.populateRoomDropdown(casino, hotel);
  },

  onRoomChange: function() {
    var sel = $('#rm-room');
    if (!sel || !sel.selectedOptions || !sel.selectedOptions[0]) return;
    var opt = sel.selectedOptions[0];
    var price = opt.getAttribute('data-price');
    var threshold = opt.getAttribute('data-threshold');
    if ($('#rm-price')) $('#rm-price').value = price || '';
    if ($('#rm-threshold')) $('#rm-threshold').value = threshold || '';
    RM.updatePrice();
  },

  // ===== 计算 =====
  calcNights: function() {
    // 先从三联动 select 合成日期并写入 hidden input
    var checkIn  = rmReadDateSels('rm-checkin');
    var checkOut = rmReadDateSels('rm-checkout');
    var nights = calcNights(checkIn, checkOut);
    if ($('#rm-nights')) $('#rm-nights').value = nights;
    RM.calcTotal();
  },

  calcTotal: function() {
    var nights = toNum(($('#rm-nights') || {}).value);
    var price = toNum(($('#rm-price') || {}).value);
    if ($('#rm-total')) $('#rm-total').value = nights * price;
    RM.updatePrice();
  },

  updatePrice: function() {
    var threshold = toNum(($('#rm-threshold') || {}).value);
    var statusEl = $('#rm-status');
    if (statusEl) statusEl.value = threshold > 0 ? '免費' : '付費';
  },

  // ===== CRUD =====
  openModal: function(id) {
    RM.editingId = id || null;
    RM.populateCasinoDropdown();
    RM.populateAgentDropdown();

    if (id) {
      // 编辑：先初始化日期下拉，再用订房数据覆盖
      rmInitDateSels('rm-checkin');
      rmInitDateSels('rm-checkout');
      var b = getBookingById(id);
      if (b) {
        RM._fillForm(b);
      }
    } else {
      // 新建：先清空表单，再初始化日期下拉（默认为今天）
      RM._resetForm();
      rmInitDateSels('rm-checkin');
      rmInitDateSels('rm-checkout');
    }

    var modal = $('#rm-modal-bg');
    if (modal) modal.style.display = 'flex';
  },

  closeModal: function() {
    var modal = $('#rm-modal-bg');
    if (modal) modal.style.display = 'none';
    RM.editingId = null;
  },

  saveForm: function() {
    // 先合成日期值到 hidden input
    rmReadDateSels('rm-checkin');
    rmReadDateSels('rm-checkout');

    var data = {
      agent:    ($('#rm-agent') || {}).value,
      client:   ($('#rm-client') || {}).value,
      casino:   ($('#rm-casino') || {}).value,
      hotel:    ($('#rm-hotel') || {}).value,
      roomType: ($('#rm-room') || {}).value,
      checkIn:  ($('#rm-checkin') || {}).value,
      checkOut: ($('#rm-checkout') || {}).value,
      nights:   toNum(($('#rm-nights') || {}).value),
      pricePerNight: toNum(($('#rm-price') || {}).value),
      threshold: toNum(($('#rm-threshold') || {}).value),
      totalCost: toNum(($('#rm-total') || {}).value),
      status:   ($('#rm-status') || {}).value,
      note:     ($('#rm-note') || {}).value,
    };

    if (RM.editingId) {
      var b = getBookingById(RM.editingId);
      if (b) {
        updateBooking(b._fbKey, data);
      }
    } else {
      createBooking(data);
    }

    RM.load();
    RM.closeModal();
    RM.render();
    toastCRUDDone();
  },

  delete: function(id) {
    if (!confirm('確定刪除這筆訂房？')) return;
    var b = getBookingById(id);
    if (b) {
      deleteBooking(b._fbKey);
      RM.load();
      RM.render();
      toastCRUDDone();
    }
  },

  // ===== 渲染 =====
  render: function() {
    RM.load();
    var bookings = RM.bookings;

    // 筛选
    var agentFilter = ($('#rm-agent-filter') || {}).value;
    var monthFilter = ($('#rm-month-filter') || {}).value || State.get('workingMonth');

    if (agentFilter) bookings = filterBookingsByAgent(bookings, agentFilter);
    if (monthFilter) bookings = filterBookingsByMonth(bookings, monthFilter);

    RM._renderTable(bookings);
    RM._updateQuota(monthFilter);
  },

  _renderTable: function(bookings) {
    var tbody = document.querySelector('.room-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var tr = h('tr', { onclick: function() { RM.openModal(this._bId); } });
      tr._bId = b.id;
      tr.style.cursor = 'pointer';

      var cells = [
        b.date, b.agent, b.client, b.casino, b.hotel, b.roomType,
        b.checkIn, b.checkOut, b.nights, '¥' + fmt(b.pricePerNight),
        '¥' + fmt(b.totalCost), b.status
      ];

      for (var j = 0; j < cells.length; j++) {
        tr.appendChild(h('td', {}, String(cells[j])));
      }

      // 操作
      var tdBtn = h('td');
      var delBtn = h('button', {
        style: 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px',
        onclick: function(e) {
          e.stopPropagation();
          RM.delete(this._dId);
        }
      }, '刪');
      delBtn._dId = b.id;
      tdBtn.appendChild(delBtn);
      tr.appendChild(tdBtn);
      tbody.appendChild(tr);
    }
  },

  _updateQuota: function(month) {
    var txs = State.get('txs');
    var quota = calcRoomQuota(RM.bookings, txs, month);

    // 当月订房计数
    var normMonth = month ? month.replace(/\//g, '-') : '';
    var roomCount = 0;
    for (var i = 0; i < RM.bookings.length; i++) {
      var bm = (RM.bookings[i].month || '').replace(/\//g, '-');
      if (!normMonth || bm === normMonth) { roomCount++; }
    }

    // 调试日志
    console.log('[v13:room] _updateQuota month=' + month + ' txs=' + (txs ? txs.length : 0) + ' totalVol=' + quota.totalVolume + ' usedThr=' + quota.usedThreshold + ' rooms=' + roomCount);

    var pct = Math.min(100, quota.usageRate);
    var el = $('.rm-quota-bar');
    if (el) {
      el.style.width = pct.toFixed(1) + '%';
      // 动态颜色：<50% green, 50-80% yellow, >80% red
      if (pct > 80) {
        el.style.background = 'var(--danger)';
      } else if (pct > 50) {
        el.style.background = 'var(--warning)';
      } else {
        el.style.background = 'var(--success)';
      }
    }

    var rateEl = $('.rm-quota-rate');
    if (rateEl) {
      rateEl.textContent = pct.toFixed(1) + '%';
      if (pct > 80) {
        rateEl.style.color = 'var(--danger)';
      } else if (pct > 50) {
        rateEl.style.color = 'var(--warning)';
      } else {
        rateEl.style.color = 'var(--success)';
      }
    }

    var volEl = $('.rm-quota-volume');
    if (volEl) volEl.textContent = fmt(quota.totalVolume) + '萬';

    var usedEl = $('.rm-quota-used');
    if (usedEl) usedEl.textContent = fmt(quota.usedThreshold) + '萬';

    var remEl = $('.rm-quota-rem');
    if (remEl) remEl.textContent = fmt(quota.remainingThreshold) + '萬';

    var countEl = $('.rm-booking-count');
    if (countEl) countEl.textContent = roomCount + '間';
  },

  // ===== 辅助 =====
  _fillForm: function(b) {
    var fields = { 'rm-agent': b.agent, 'rm-client': b.client, 'rm-casino': b.casino,
                   'rm-checkin': b.checkIn, 'rm-checkout': b.checkOut,
                   'rm-nights': b.nights, 'rm-price': b.pricePerNight,
                   'rm-threshold': b.threshold, 'rm-total': b.totalCost,
                   'rm-status': b.status, 'rm-note': b.note };
    for (var id in fields) {
      var el = $('#' + id);
      if (el) el.value = fields[id] != null ? fields[id] : '';
    }
    // 日期反填到三联动 select
    rmSetDateSels('rm-checkin',  b.checkIn);
    rmSetDateSels('rm-checkout', b.checkOut);
    // 联动
    RM.populateHotelDropdown(b.casino);
    if ($('#rm-hotel')) $('#rm-hotel').value = b.hotel;
    RM.populateRoomDropdown(b.casino, b.hotel);
    if ($('#rm-room')) $('#rm-room').value = b.roomType;
  },

  _resetForm: function() {
    var ids = ['rm-agent', 'rm-client', 'rm-casino', 'rm-hotel', 'rm-room',
               'rm-checkin', 'rm-checkout', 'rm-nights', 'rm-price',
               'rm-threshold', 'rm-total', 'rm-status', 'rm-note'];
    for (var i = 0; i < ids.length; i++) {
      var el = $('#' + ids[i]);
      if (el) el.value = '';
    }
    // 清空日期三联动
    var dateSels = ['rm-checkin-y','rm-checkin-m','rm-checkin-d','rm-checkout-y','rm-checkout-m','rm-checkout-d'];
    for (var j = 0; j < dateSels.length; j++) {
      var ds = $('#' + dateSels[j]);
      if (ds) ds.value = '';
    }
  },

  // CSV
  exportCSV: function() { exportBookingsCSV(); },
  importCSV: function() { var inp = $('#rm-file-input'); if (inp) inp.click(); },
  handleImport: function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var result = importBookingsCSV(ev.target.result);
      if (result.success) {
        RM.load();
        RM.render();
        showToast('匯入 ' + result.count + ' 筆訂房', 'success');
      }
    };
    reader.readAsText(file, 'UTF-8');
  },

  // 初始化
  init: function() {
    RM.load();
    RM.populateCasinoDropdown();
    RM.populateAgentDropdown();
    RM.populateAgentFilter();
    RM.render();
    Events.on(EVENTS.BOOKINGS_LOADED, function() { RM.load(); RM.render(); });
  }
};

/** 房务标签切换 */
function switchRoomTab(tab, el) {
  // 高亮当前标签
  var tabs = document.querySelectorAll('#page-room .room-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  if (el) el.classList.add('active');

  // 切换面板 (HTML ID 格式: room-tab-xxx, class: room-tab-content)
  var panels = document.querySelectorAll('#page-room .room-tab-content');
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.remove('active');
    panels[j].style.display = 'none';
  }
  var target = document.getElementById('room-tab-' + tab);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
    // 切换到酒店设定时刷新列表
    if (tab === 'config') {
      hcRender();
    }
  }
}

// 全域桥接 (供 HTML onclick)
function rmOpenModal(id)     { RM.openModal(id || null); }
function rmCloseModal()      { RM.closeModal(); }
function rmOnCasinoChange()  { RM.onCasinoChange(); }
function rmOnHotelChange()   { RM.onHotelChange(); }
function rmOnRoomChange()    { RM.onRoomChange(); }
function rmCalcNights()      { RM.calcNights(); }
function rmCalcTotal()       { RM.calcTotal(); }
function rmUpdatePrice()     { RM.updatePrice(); }
function rmSaveForm()        { RM.saveForm(); }
function rmRender()          { RM.render(); }
function rmExportCSV()       { RM.exportCSV(); }
function rmImportCSV()       { RM.importCSV(); }

// src/pages/wallet.js
/**
 * v13 总钱包页面 (v3 — 快捷按钮时间筛选器)
 *
 * 依赖: State, Events, calc/finance.js, utils/format.js
 *
 * 页面内容:
 * 1. KPI 总览卡片 (总钱包余额、公基金余额、代理钱包总额、总存入、总提领)
 * 2. 快捷时间筛选器 (本週/上週/本月/上月/年度/自訂 — 与查询页一致)
 * 3. 总钱包流水 (合并: 公基金记录 + 代理钱包记录 + 交易佣金产生的码粮/公基金)
 * 4. 公基金卡片 (卡片式, 含汇总 + 流水明细)
 * 5. 代理钱包卡片 (同原设计)
 *
 * 筛选逻辑: 取代旧的月份下拉，改用日期范围 (dateFrom/dateTo)
 *   - 快捷按钮设定 dateFrom/dateTo，存入 State
 *   - 各渲染函数从 State 读取范围进行筛选
 *   - 「全部時間」时 dateFrom='' && dateTo='' → 不过滤
 */

// ============================================================================
// 快捷时间筛选器 (与查询页一致)
// ============================================================================

/** 快捷按钮点击处理 */
function walletQuickFilter(type) {
  _highlightWalletQuickBtn(type);

  var now = new Date();
  var dateFrom = '';
  var dateTo = '';
  var customRange = document.getElementById('wallet-date-range');
  if (customRange) customRange.style.display = 'none';

  var pad2 = function(n) { return n < 10 ? '0' + n : '' + n; };
  var ymd = function(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  };

  switch (type) {
    case 'lastWeek': {
      // 上周一 ~ 上周日
      var dow = now.getDay() || 7;
      var lastMon = new Date(now);
      lastMon.setDate(now.getDate() - dow - 6);
      var lastSun = new Date(lastMon);
      lastSun.setDate(lastMon.getDate() + 6);
      dateFrom = ymd(lastMon);
      dateTo = ymd(lastSun);
      break;
    }
    case 'thisWeek': {
      // 本周一 ~ 今天
      var dow2 = now.getDay() || 7;
      var thisMon = new Date(now);
      thisMon.setDate(now.getDate() - dow2 + 1);
      dateFrom = ymd(thisMon);
      dateTo = ymd(now);
      break;
    }
    case 'thisMonth': {
      // 本月1日 ~ 今天
      dateFrom = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-01';
      dateTo = ymd(now);
      break;
    }
    case 'lastMonth': {
      // 上月1日 ~ 上月最后一天
      var firstDayLM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      var lastDayLM = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFrom = ymd(firstDayLM);
      dateTo = ymd(lastDayLM);
      break;
    }
    case 'thisYear': {
      // 今年1/1 ~ 今天
      dateFrom = now.getFullYear() + '-01-01';
      dateTo = ymd(now);
      break;
    }
    case 'custom': {
      if (customRange) customRange.style.display = '';
      var fromEl = document.getElementById('wallet-date-from');
      var toEl = document.getElementById('wallet-date-to');
      // 保留上次的值，或默认今天
      if (fromEl && !fromEl.value) fromEl.value = ymd(now);
      if (toEl && !toEl.value) toEl.value = ymd(now);
      // custom 模式：不在这里设定范围，等用户选日期后 onchange 触发 renderWallet
      _updateWalletDateDisplay();
      renderWallet();
      return;
    }
    default: {
      // 全部時間
      break;
    }
  }

  // 设定日期输入框的值（非 custom 模式）
  var fromEl2 = document.getElementById('wallet-date-from');
  var toEl2 = document.getElementById('wallet-date-to');
  if (fromEl2 && dateFrom) fromEl2.value = dateFrom;
  if (toEl2 && dateTo) toEl2.value = dateTo;

  _updateWalletDateDisplay();
  renderWallet();
}

/** 高亮当前活跃的快捷按钮 */
function _highlightWalletQuickBtn(type) {
  var btns = document.querySelectorAll('#page-wallet .tf-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  if (!type || type === 'all') return;
  var label = _walletQuickBtnLabel(type);
  for (var j = 0; j < btns.length; j++) {
    if (btns[j].textContent.trim() === label) {
      btns[j].classList.add('active');
    }
  }
}

/** 快捷按钮 type → 显示文字 */
function _walletQuickBtnLabel(type) {
  var map = {
    lastWeek: '上週', thisWeek: '本週', thisMonth: '本月',
    lastMonth: '上月', thisYear: '年度', custom: '自訂'
  };
  return map[type] || '';
}

/** 更新页面上的日期范围显示文字 */
function _updateWalletDateDisplay() {
  var disp = document.getElementById('wallet-date-display');
  if (!disp) return;
  var fromEl = document.getElementById('wallet-date-from');
  var toEl = document.getElementById('wallet-date-to');
  var from = fromEl ? fromEl.value : '';
  var to = toEl ? toEl.value : '';
  if (from && to) {
    disp.textContent = '📅 ' + from + ' ～ ' + to;
  } else if (from) {
    disp.textContent = '📅 ' + from + ' 起';
  } else if (to) {
    disp.textContent = '📅 至 ' + to;
  } else {
    disp.textContent = '📅 全部時間';
  }
}

/** 从输入框读取当前筛选范围 {dateFrom, dateTo} (空字符串=不限制) */
function _getWalletDateRange() {
  var fromEl = document.getElementById('wallet-date-from');
  var toEl = document.getElementById('wallet-date-to');
  return {
    dateFrom: (fromEl && fromEl.value) ? fromEl.value : '',
    dateTo: (toEl && toEl.value) ? toEl.value : '',
  };
}

/** 判断一条记录的日期是否在当前筛选范围内 */
function _walletDateInRange(dateStr, dateFrom, dateTo) {
  if (!dateStr) return false;
  // 归一化日期格式为 YYYY-MM-DD
  var ds = (dateStr || '').replace(/\//g, '-');
  if (dateFrom && ds < dateFrom) return false;
  if (dateTo && ds > dateTo) return false;
  return true;
}

// ============================================================================
// 渲染入口
// ============================================================================

/**
 * 渲染总钱包页面
 */
function renderWallet() {
  try {
    _updateWalletDateDisplay();
    _renderWalletKPIs();
    _renderFlowTable();
    _renderFundCard();
    _renderAgentWalletCards();
  } catch (e) {
    console.error('[v13:wallet] renderWallet error:', e);
  }
}

// ============================================================================
// KPI 统计卡片
// ============================================================================

function _renderWalletKPIs() {
  var container = document.getElementById('wallet-overview');
  if (!container) return;

  var txs = State.get('txs');
  var fundRecords = State.get('fundWithdrawals');
  var agentWallets = State.get('agentWallets');
  var range = _getWalletDateRange();

  // 筛选（KPI 按日期范围筛选）
  var filteredTxs = _filterByDateRange(txs, 'date', range);
  var filteredFunds = _filterByDateRange(fundRecords, 'date', range);
  var filteredAWs = {};
  for (var ag in agentWallets) {
    var recs = agentWallets[ag];
    var filt = _filterByDateRange(recs, 'date', range);
    if (filt.length > 0) filteredAWs[ag] = filt;
  }

  // 公基金余额 (全量、不受筛选影响 — KPI 应该是全量)
  var fundBalance = calcFundBalance(txs, fundRecords);

  // 代理钱包总额 (全量)
  var agents = {};
  for (var a1 = 0; a1 < txs.length; a1++) {
    var a = txs[a1].agent;
    if (a) agents[a] = true;
  }
  for (var ag2 in agentWallets) {
    agents[ag2] = true;
  }
  var agentTotal = 0;
  for (var name in agents) {
    agentTotal += calcAgentBalance(name, txs, agentWallets);
  }

  // 总钱包余额
  var totalWallet = getTotalWallet();

  // 总存入 (筛选范围内)
  var totalDeposit = 0;
  for (var d1 = 0; d1 < filteredFunds.length; d1++) {
    var fr = filteredFunds[d1];
    if (fr.type === 'deposit' || fr.type === 'cash_deposit') {
      totalDeposit += toNum(fr.amount);
    }
  }
  for (var ag3 in filteredAWs) {
    var recs3 = filteredAWs[ag3];
    for (var d2 = 0; d2 < recs3.length; d2++) {
      if (recs3[d2].type === 'deposit' || recs3[d2].type === 'cash_deposit') {
        totalDeposit += toNum(recs3[d2].amount);
      }
    }
  }
  // 存入也包括: 交易产生的佣金公基金 + 码粮 (视为流入)
  for (var d3 = 0; d3 < filteredTxs.length; d3++) {
    totalDeposit += toNum(filteredTxs[d3].fund);
    totalDeposit += toNum(filteredTxs[d3].bonus);
  }

  // 总提领 (筛选范围内)
  var totalWithdraw = 0;
  for (var w1 = 0; w1 < filteredFunds.length; w1++) {
    if (filteredFunds[w1].type === 'withdraw') {
      totalWithdraw += toNum(filteredFunds[w1].amount);
    }
  }
  for (var ag4 in filteredAWs) {
    var recs4 = filteredAWs[ag4];
    for (var w2 = 0; w2 < recs4.length; w2++) {
      if (recs4[w2].type === 'withdraw') {
        totalWithdraw += toNum(recs4[w2].amount);
      }
    }
  }

  var cards = [
    { label: '總錢包餘額', value: fmtMoney(totalWallet), cls: 'wk-gold' },
    { label: '公基金餘額',  value: fmtMoney(fundBalance), cls: 'wk-positive' },
    { label: '代理錢包總額', value: fmtMoney(agentTotal), cls: 'wk-positive' },
    { label: '總存入',      value: fmtMoney(totalDeposit), cls: 'wk-positive' },
    { label: '總提領',      value: fmtMoney(totalWithdraw), cls: 'wk-negative' },
  ];

  var html = '';
  for (var c = 0; c < cards.length; c++) {
    html += '<div class="wallet-kpi-card">' +
      '<div class="wk-label">' + cards[c].label + '</div>' +
      '<div class="wk-value ' + cards[c].cls + '">' + cards[c].value + '</div>' +
      '</div>';
  }
  container.innerHTML = html;
}

// ============================================================================
// 工具函式
// ============================================================================

/** 按日期范围筛选数组 (arr[field] 支持 YYYY/MM/DD 和 YYYY-MM-DD) */
function _filterByDateRange(arr, dateField, range) {
  if (!range.dateFrom && !range.dateTo) return arr;
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (_walletDateInRange(arr[i][dateField], range.dateFrom, range.dateTo)) {
      result.push(arr[i]);
    }
  }
  return result;
}

// ============================================================================
// 总钱包流水 (合并所有金流来源)
// ============================================================================

function _renderFlowTable() {
  var tbody = document.querySelector('#wallet-flow-table tbody');
  var empty = document.getElementById('wallet-flow-empty');
  if (!tbody) return;

  var txs = State.get('txs');
  var fundRecords = State.get('fundWithdrawals');
  var agentWallets = State.get('agentWallets');
  var range = _getWalletDateRange();

  // 构建统一流水条目
  var flows = [];

  // 1) 公基金记录
  var filteredFunds = _filterByDateRange(fundRecords, 'date', range);
  for (var i = 0; i < filteredFunds.length; i++) {
    var fr = filteredFunds[i];
    var typeLabel = (fr.type === 'deposit' || fr.type === 'cash_deposit') ? '存入' : '提領';
    if (fr.type === 'cash_deposit') typeLabel = '現金存入';
    flows.push({
      date: fr.date || '',
      source: '公基金',
      type: typeLabel,
      amount: toNum(fr.amount),
      sign: (fr.type === 'withdraw') ? -1 : 1,
      note: fr.note || '',
    });
  }

  // 2) 交易佣金产生的码粮和公基金
  var filteredTxs = _filterByDateRange(txs, 'date', range);
  for (var j = 0; j < filteredTxs.length; j++) {
    var tx = filteredTxs[j];
    var fundVal = toNum(tx.fund);
    var bonusVal = toNum(tx.bonus);
    var volNote = '洗碼' + fmt(tx.volume) + '萬';

    if (fundVal > 0) {
      flows.push({
        date: tx.date || '',
        source: '公基金',
        type: '佣金公基金',
        amount: fundVal,
        sign: 1,
        note: (tx.agent || '') + ' ' + volNote,
      });
    }
    if (bonusVal > 0) {
      flows.push({
        date: tx.date || '',
        source: tx.agent || '',
        type: '碼糧',
        amount: bonusVal,
        sign: 1,
        note: volNote,
      });
    }
  }

  // 3) 代理钱包记录
  for (var ag in agentWallets) {
    var recs = agentWallets[ag];
    for (var k = 0; k < recs.length; k++) {
      var wr = recs[k];
      if (!_walletDateInRange(wr.date, range.dateFrom, range.dateTo)) continue;
      var wl = '';
      if (wr.type === 'deposit') wl = '存入';
      else if (wr.type === 'cash_deposit') wl = '自存現金';
      else if (wr.type === 'withdraw') wl = '提領';
      flows.push({
        date: wr.date || '',
        source: ag,
        type: wl,
        amount: toNum(wr.amount),
        sign: (wr.type === 'withdraw') ? -1 : 1,
        note: wr.note || '',
      });
    }
  }

  if (flows.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  // 按日期降序排列
  flows.sort(function(a, b) {
    return (b.date || '').replace(/\//g, '-').localeCompare((a.date || '').replace(/\//g, '-'));
  });

  var html = '';
  for (var f = 0; f < flows.length; f++) {
    var flow = flows[f];
    var isOut = flow.sign < 0;
    var tc = isOut ? 'wf-withdraw' : 'wf-deposit';
    var prefix = isOut ? '-' : '+';
    html += '<tr>' +
      '<td>' + flow.date + '</td>' +
      '<td class="wf-source">' + flow.source + '</td>' +
      '<td class="' + tc + '">' + flow.type + '</td>' +
      '<td class="' + tc + '" style="text-align:right">' + prefix + fmtMoney(flow.amount) + '</td>' +
      '<td>' + flow.note + '</td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

// ============================================================================
// 公基金卡片
// ============================================================================

function _renderFundCard() {
  var container = document.getElementById('wallet-fund-card');
  if (!container) return;

  var txs = State.get('txs');
  var fundRecords = State.get('fundWithdrawals');
  var range = _getWalletDateRange();

  // 筛选
  var filteredFunds = _filterByDateRange(fundRecords, 'date', range);
  var filteredTxs = _filterByDateRange(txs, 'date', range);

  // 公基金余额 (全量)
  var balance = calcFundBalance(txs, fundRecords);

  // 汇总统计
  var commFundSum = 0;     // 佣金产生的公基金
  var depositSum = 0;      // 手动存入
  var cashDepSum = 0;      // 自存现金
  var withdrawSum = 0;     // 提领
  for (var k = 0; k < filteredTxs.length; k++) {
    commFundSum += toNum(filteredTxs[k].fund);
  }
  for (var m = 0; m < filteredFunds.length; m++) {
    var fr = filteredFunds[m];
    if (fr.type === 'deposit') depositSum += toNum(fr.amount);
    else if (fr.type === 'cash_deposit') cashDepSum += toNum(fr.amount);
    else if (fr.type === 'withdraw') withdrawSum += toNum(fr.amount);
  }

  // 构建明细列表 (合并佣金公基金 + 手动记录)
  var details = [];

  // 佣金公基金 (从交易中)
  for (var d1 = 0; d1 < filteredTxs.length; d1++) {
    var tx = filteredTxs[d1];
    var fv = toNum(tx.fund);
    if (fv > 0) {
      details.push({
        date: tx.date || '',
        type: '佣金公基金',
        amount: fv,
        sign: 1,
        note: (tx.agent || '') + ' 洗碼' + fmt(tx.volume) + '萬',
      });
    }
  }

  // 手动记录
  for (var d2 = 0; d2 < filteredFunds.length; d2++) {
    var fr2 = filteredFunds[d2];
    var tl = '';
    if (fr2.type === 'deposit') tl = '存入';
    else if (fr2.type === 'cash_deposit') tl = '現金存入';
    else if (fr2.type === 'withdraw') tl = '提領';
    details.push({
      date: fr2.date || '',
      type: tl,
      amount: toNum(fr2.amount),
      sign: (fr2.type === 'withdraw') ? -1 : 1,
      note: fr2.note || '',
    });
  }

  // 按日期降序
  details.sort(function(a, b) {
    return (b.date || '').replace(/\//g, '-').localeCompare((a.date || '').replace(/\//g, '-'));
  });

  // 渲染卡片 — 复用代理钱包卡片样式 (.wallet-agent-card 系列)，视觉统一
  var html = '<div class="wallet-agent-grid"><div class="wallet-agent-card">' +
    '<div class="wallet-agent-card-header">' +
      '<span class="wa-name">🏦 公基金</span>' +
      '<span class="wa-balance">' + fmtMoney(balance) + '</span>' +
    '</div>' +
    '<div class="wallet-agent-card-body">' +
      '<table>' +
        '<thead><tr><th>佣金公基金</th><th>存入</th><th>自存現金</th><th>提領</th></tr></thead>' +
        '<tbody><tr>' +
          '<td style="color:var(--success)">' + fmtMoney(commFundSum) + '</td>' +
          '<td style="color:var(--success)">' + fmtMoney(depositSum) + '</td>' +
          '<td style="color:var(--info)">' + fmtMoney(cashDepSum) + '</td>' +
          '<td style="color:var(--danger)">' + fmtMoney(withdrawSum) + '</td>' +
        '</tr></tbody>' +
      '</table>' +
    '</div>';

  // 明细 — 统一使用 .wallet-card-detail 样式
  if (details.length > 0) {
    html += '<div class="wallet-card-detail">' +
      '<table>' +
      '<thead><tr><th style="width:90px">日期</th><th>類型</th><th style="text-align:right">金額</th><th>備註</th></tr></thead>' +
      '<tbody>';

    for (var d3 = 0; d3 < details.length; d3++) {
      var dt = details[d3];
      var isOut = dt.sign < 0;
      var tc = isOut ? 'var(--danger)' : 'var(--success)';
      var prefix = isOut ? '-' : '+';
      html += '<tr>' +
        '<td>' + dt.date + '</td>' +
        '<td style="color:' + tc + '">' + dt.type + '</td>' +
        '<td style="text-align:right;color:' + tc + '">' + prefix + fmtMoney(dt.amount) + '</td>' +
        '<td>' + dt.note + '</td>' +
        '</tr>';
    }

    html += '</tbody></table></div>';
  }

  html += '</div></div>';  // 关闭 .wallet-agent-card 和 .wallet-agent-grid

  container.innerHTML = html;
}

// ============================================================================
// 代理钱包明细卡片
// ============================================================================

function _renderAgentWalletCards() {
  var container = document.getElementById('wallet-agent-cards');
  var empty = document.getElementById('wallet-agent-empty');
  if (!container) return;

  var txs = State.get('txs');
  var agentWallets = State.get('agentWallets');

  // 收集所有代理
  var agents = {};
  for (var i = 0; i < txs.length; i++) {
    var a = txs[i].agent;
    if (a) agents[a] = true;
  }
  for (var ag in agentWallets) {
    agents[ag] = true;
  }

  var agentList = Object.keys(agents).sort();
  if (agentList.length === 0) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  var html = '<div class="wallet-agent-grid">';

  for (var m = 0; m < agentList.length; m++) {
    var agentName = agentList[m];
    var balance = calcAgentBalance(agentName, txs, agentWallets);

    // 从交易中计算该代理的码粮和现金寄放
    var bonusSum = 0;
    var cashSum = 0;
    for (var n = 0; n < txs.length; n++) {
      if (txs[n].agent === agentName) {
        bonusSum += toNum(txs[n].bonus);
        cashSum += toNum(txs[n].cash) || 0;
      }
    }

    // 从钱包记录中计算各项
    var records = agentWallets[agentName] || [];
    var awDeposit = 0;
    var awCashDep = 0;
    var awWithdraw = 0;
    for (var k = 0; k < records.length; k++) {
      if (records[k].type === 'deposit') awDeposit += toNum(records[k].amount);
      else if (records[k].type === 'cash_deposit') awCashDep += toNum(records[k].amount);
      else if (records[k].type === 'withdraw') awWithdraw += toNum(records[k].amount);
    }

    html += '<div class="wallet-agent-card">' +
      '<div class="wallet-agent-card-header">' +
        '<span class="wa-name">' + agentName + '</span>' +
        '<span class="wa-balance">' + fmtMoney(balance) + '</span>' +
      '</div>' +
      '<div class="wallet-agent-card-body">' +
        '<table>' +
          '<thead><tr><th>碼糧累計</th><th>現金寄放</th><th>存入</th><th>自存現金</th><th>提領</th></tr></thead>' +
          '<tbody><tr>' +
            '<td>' + fmtMoney(bonusSum) + '</td>' +
            '<td>' + fmtMoney(cashSum) + '</td>' +
            '<td style="color:var(--success)">' + fmtMoney(awDeposit) + '</td>' +
            '<td style="color:var(--info)">' + fmtMoney(awCashDep) + '</td>' +
            '<td style="color:var(--danger)">' + fmtMoney(awWithdraw) + '</td>' +
          '</tr></tbody>' +
        '</table>' +
      '</div>';

    // 钱包流水明细 — 统一使用 .wallet-card-detail 样式
    if (records.length > 0) {
      var sorted = records.slice().sort(function(a, b) {
        return (b.date || '').replace(/\//g, '-').localeCompare((a.date || '').replace(/\//g, '-'));
      });
      var typeLabel2 = { deposit: '存入', cash_deposit: '自存現金', withdraw: '提領' };
      html += '<div class="wallet-card-detail">' +
        '<table>' +
        '<thead><tr><th style="width:90px">日期</th><th>類型</th><th style="text-align:right">金額</th><th>備註</th></tr></thead>' +
        '<tbody>';
      for (var p = 0; p < sorted.length; p++) {
        var wr = sorted[p];
        var tc = (wr.type === 'deposit' || wr.type === 'cash_deposit') ? 'var(--success)' : 'var(--danger)';
        var prefix = (wr.type === 'deposit' || wr.type === 'cash_deposit') ? '+' : '-';
        html += '<tr>' +
          '<td>' + (wr.date || '') + '</td>' +
          '<td style="color:' + tc + '">' + (typeLabel2[wr.type] || wr.type) + '</td>' +
          '<td style="text-align:right;color:' + tc + '">' + prefix + fmtMoney(toNum(wr.amount)) + '</td>' +
          '<td>' + (wr.note || '') + '</td>' +
        '</tr>';
      }
      html += '</tbody></table></div>';
    }

    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// src/charts/trend.js
/**
 * v13 图表模块 - 每日洗码量趋势
 * 依赖: Chart.js CDN, calc/stats.js (aggregateByDay), utils/format.js
 */

var _trendChart = null;

function renderTrendChart(txs, month) {
  if (typeof Chart === 'undefined') return;
  var canvas = document.querySelector('#page-overview .chart-full canvas');
  if (!canvas) return;

  var data = aggregateByDay(txs, month || State.get('workingMonth'));

  var labels = [];
  var volumes = [];
  for (var i = 0; i < data.length; i++) {
    labels.push(data[i].date.substring(5)); // MM-DD
    volumes.push(data[i].volume);
  }

  if (_trendChart) _trendChart.destroy();

  _trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '洗碼量 (萬)',
        data: volumes,
        borderColor: UI_COLORS.techCyan,
        backgroundColor: 'rgba(0,212,255,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: UI_COLORS.techCyan,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      onClick: function(e, elements) {
        if (elements.length > 0) {
          var idx = elements[0].index;
          var date = data[idx] ? data[idx].date : '';
          Events.emit(EVENTS.CHART_CLICK, { type: 'trend', date: date });
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) { return '洗碼量: ' + fmt(ctx.raw) + '萬'; }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: UI_COLORS.textSecondary, font: { size: 11 } },
          grid: { color: UI_COLORS.borderSubtle }
        },
        y: {
          ticks: { color: UI_COLORS.textSecondary, callback: function(v) { return v + '萬'; } },
          grid: { color: UI_COLORS.borderSubtle }
        }
      }
    }
  });
}

function renderRankChart(txs) {
  if (typeof Chart === 'undefined') return;
  var canvas = document.querySelector('#page-overview .ov-two-col canvas');
  if (!canvas) return;

  var ranks = rankByVolume(txs, 10);

  var labels = [];
  var volumes = [];
  var colors = [];

  var palette = [UI_COLORS.techCyan, UI_COLORS.skyBlue, UI_COLORS.electricViolet,
                 UI_COLORS.goldSoft, UI_COLORS.success, UI_COLORS.info,
                 UI_COLORS.warning, UI_COLORS.danger, UI_COLORS.cashOrange, UI_COLORS.goldDim];

  for (var i = 0; i < ranks.length; i++) {
    labels.push(ranks[i].agent);
    volumes.push(ranks[i].volume);
    colors.push(palette[i] || UI_COLORS.techCyan);
  }

  if (window._rankChart) window._rankChart.destroy();

  window._rankChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '洗碼量 (萬)',
        data: volumes,
        backgroundColor: colors,
        borderRadius: 6,
        borderWidth: 0,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onClick: function(e, elements) {
        if (elements.length > 0) {
          var idx = elements[0].index;
          var agent = ranks[idx] ? ranks[idx].agent : '';
          Events.emit(EVENTS.CHART_CLICK, { type: 'rank', agent: agent });
        }
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: UI_COLORS.textSecondary, font: { size: 11 } },
          grid: { color: UI_COLORS.borderSubtle }
        },
        y: {
          ticks: { color: UI_COLORS.textPrimary, font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderRoomChart(bookings, month) {
  var canvas = document.querySelector('#page-room .rm-chart-wrap canvas');
  if (!canvas) return;

  var agg = aggregateBookingsByMonth(bookings);
  if (month) agg = agg.filter(function(a) { return a.month === month; });

  var labels = [];
  var counts = [];
  var freeCounts = [];
  var paidCounts = [];

  for (var i = 0; i < agg.length; i++) {
    labels.push(agg[i].month);
    counts.push(agg[i].count);
    freeCounts.push(agg[i].freeCount);
    paidCounts.push(agg[i].paidCount);
  }

  if (window._roomChart) window._roomChart.destroy();

  window._roomChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '免費',
          data: freeCounts,
          backgroundColor: UI_COLORS.success,
          borderRadius: 4,
        },
        {
          label: '付費',
          data: paidCounts,
          backgroundColor: UI_COLORS.warning,
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, ticks: { color: UI_COLORS.textSecondary }, grid: { display: false } },
        y: { stacked: true, ticks: { color: UI_COLORS.textSecondary }, grid: { color: UI_COLORS.borderSubtle } }
      },
      plugins: {
        legend: {
          labels: { color: UI_COLORS.textSecondary }
        }
      }
    }
  });
}

// src/bridge/bridge.js
/**
 * v13 桥接层 — HTML onclick → JS 函数
 * 
 * HTML 模板中所有 onclick 调用必须在此处有对应全局函数。
 * 这是模板（markup）与数据/逻辑（JS 模块）之间的唯一桥梁。
 * 
 * 依赖: 所有 data/ 和 ui/ 模块已加载
 */

// ============================================================================
// 交易表单桥接
// ============================================================================

/** 当前编辑中的交易 fbKey，null 表示新增 */
var _txEditingKey = null;

/**
 * 打开交易模态框
 * @param {string|null} fbKey - 编辑时传入 fbKey，新增时传 null
 */
function _openTxModal(fbKey) {
  _txEditingKey = fbKey;
  _populateTxAgentDropdown();
  _populateTxVenueDropdown();

  var titleEl = document.getElementById('modal-title');
  var draftEl = document.getElementById('draft-indicator');

  if (fbKey) {
    // 编辑模式
    if (titleEl) titleEl.textContent = '編輯交易';
    var tx = getTxByKey(fbKey);
    if (tx) _fillTxForm(tx);
    // 检查草稿
    if (draftEl) draftEl.style.display = hasDraft(fbKey) ? 'block' : 'none';
  } else {
    // 新增模式
    if (titleEl) titleEl.textContent = '新增交易';
    _resetTxForm();
    if (draftEl) draftEl.style.display = 'none';
  }

  openModal('modal');
}

/** 填充交易表单代理下拉 */
function _populateTxAgentDropdown() {
  var sel = document.getElementById('tx-agent');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇代理</option>';
  var agents = getAllAgents();
  for (var i = 0; i < agents.length; i++) {
    var opt = document.createElement('option');
    opt.value = agents[i];
    opt.textContent = agents[i];
    sel.appendChild(opt);
  }
  // 绑定代理选择联动 → 自动填入碼佣率
  sel.onchange = _onAgentChange;
}

/** 填充交易表单地点下拉 */
function _populateTxVenueDropdown() {
  var sel = document.getElementById('tx-venue');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇地點</option>';
  var venues = (typeof VENUE_OPTIONS !== 'undefined') ? VENUE_OPTIONS : ['新濠天地', '新濠影滙', '金沙', '銀河', '永利', '上葡京'];
  for (var i = 0; i < venues.length; i++) {
    var opt = document.createElement('option');
    // VENUE_OPTIONS 是对象数组 {label, casino}
    var venue = venues[i];
    if (typeof venue === 'object' && venue !== null) {
      opt.value = venue.label || venue;
      opt.textContent = venue.label || venue;
      opt.setAttribute('data-casino', venue.casino || '');
    } else {
      opt.value = venue;
      opt.textContent = venue;
    }
    sel.appendChild(opt);
  }
}

/** 代理选择变更 → 自动填入该代理最近交易的碼佣率 */
function _onAgentChange() {
  var agentSel = document.getElementById('tx-agent');
  var rateEl = document.getElementById('tx-rate');
  if (!agentSel || !rateEl) return;
  var agent = agentSel.value;
  if (!agent) return;

  // 查找该代理最近一笔交易，取其碼佣率
  var txs = State.get('txs');
  var lastRate = null;
  for (var i = txs.length - 1; i >= 0; i--) {
    if (txs[i].agent === agent && txs[i].rate) {
      lastRate = txs[i].rate;
      break;
    }
  }
  // 若无历史交易，使用默认 0.8
  if (lastRate != null) {
    rateEl.value = lastRate;
  } else if (!rateEl.value) {
    rateEl.value = '0.8';
  }
  calc(); // 触发自动计算佣金/基金
}

/** 填写编辑表单 */
function _fillTxForm(tx) {
  var fields = {
    'tx-type':  tx.type,
    'tx-date':  tx.date,
    'tx-agent': tx.agent,
    'tx-client': tx.client,
    'tx-venue': tx.venue,
    'tx-volume': tx.volume,
    'tx-rate':   tx.rate,
    'tx-comm':   fmt(tx.comm),
    'tx-bonus':  tx.bonus,
    'tx-drawn':  tx.drawn,
    'tx-undrawn': fmt(tx.undrawn),
    'tx-fund':   fmt(tx.fund),
    'tx-cash':   tx.cash || '',
    'tx-note':   tx.note,
  };
  for (var id in fields) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id] != null ? fields[id] : '';
  }
  toggleTypeFields();
}

/** 重置新增表单 */
function _resetTxForm() {
  var ids = ['tx-type', 'tx-date', 'tx-agent', 'tx-client', 'tx-venue',
             'tx-volume', 'tx-rate', 'tx-comm', 'tx-bonus', 'tx-drawn',
             'tx-undrawn', 'tx-fund', 'tx-cash', 'tx-note'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.value = '';
  }
  var typeEl = document.getElementById('tx-type');
  if (typeEl) typeEl.value = 'rolling';
  var dateEl = document.getElementById('tx-date');
  if (dateEl) dateEl.value = nowStr();
  toggleTypeFields();
}

/** 交易类型切换 — 显示/隐藏相应字段 */
function toggleTypeFields() {
  var type = (document.getElementById('tx-type') || {}).value;
  var rollingFields = ['tx-volume', 'tx-rate', 'tx-comm', 'tx-bonus', 'tx-drawn', 'tx-undrawn', 'tx-fund'];
  var cashFields = ['tx-cash'];

  // 显示/隐藏转码字段
  for (var i = 0; i < rollingFields.length; i++) {
    var el = document.getElementById(rollingFields[i]);
    if (el) {
      var row = el.closest('.form-row');
      if (row) row.style.display = type === 'rolling' ? '' : 'none';
    }
  }

  // 显示/隐藏现金字段
  for (var j = 0; j < cashFields.length; j++) {
    var cel = document.getElementById(cashFields[j]);
    if (cel) {
      var crow = cel.closest('.form-row');
      if (crow) crow.style.display = type === 'cash' ? '' : 'none';
    }
  }
}

/** 自动计算佣金/基金/未提领 */
function calc() {
  try {
    var volEl   = document.getElementById('tx-volume');
    var rateEl  = document.getElementById('tx-rate');
    var bonusEl = document.getElementById('tx-bonus');
    var drawnEl = document.getElementById('tx-drawn');

    var vol   = toNum(volEl ? volEl.value : 0);
    var rate  = toNum(rateEl ? rateEl.value : 0);
    var bonus = toNum(bonusEl ? bonusEl.value : 0);
    var drawn = toNum(drawnEl ? drawnEl.value : 0);

    if (typeof calcComm !== 'function') {
      console.error('[calc] calcComm is not defined');
      return;
    }

    var comm = calcComm(vol, rate);
    var fund = calcFund(comm, bonus);
    var undrawn = calcUndrawn(bonus, drawn);

    var commEl = document.getElementById('tx-comm');
    if (commEl) commEl.value = Math.round(comm).toString();

    var fundEl = document.getElementById('tx-fund');
    if (fundEl) fundEl.value = Math.round(fund).toString();

    var undrawnEl = document.getElementById('tx-undrawn');
    if (undrawnEl) undrawnEl.value = Math.round(undrawn).toString();

    console.log('[calc] vol=' + vol + ' rate=' + rate + ' → comm=' + Math.round(comm) + ' fund=' + Math.round(fund) + ' undrawn=' + Math.round(undrawn));

    // 保存草稿
    if (typeof saveDraft === 'function') {
      saveDraft(getCurrentFormData());
    }
  } catch(e) {
    console.error('[calc] error:', e);
  }
}

/** 保存交易表单 */
function saveForm() {
  var data = getCurrentFormData();

  if (!data.agent) {
    showToast('請選擇代理', 'warning');
    return;
  }

  if (_txEditingKey) {
    // 编辑
    var updated = updateTx(_txEditingKey, data);
    if (updated) {
      clearDraft(_txEditingKey);
      closeModal();
      refreshAllViews();
      toastCRUDDone();
    } else {
      showToast('更新失敗', 'error');
    }
  } else {
    // 新增
    var created = createTx(data);
    if (created) {
      closeModal();
      refreshAllViews();
      toastCRUDDone();
    } else {
      showToast('新增失敗', 'error');
    }
  }
}

/** 获取当前表单数据 */
function getCurrentFormData() {
  return {
    type:   (document.getElementById('tx-type') || {}).value || 'rolling',
    date:   (document.getElementById('tx-date') || {}).value || '',
    agent:  (document.getElementById('tx-agent') || {}).value || '',
    client: (document.getElementById('tx-client') || {}).value || '',
    venue:  (document.getElementById('tx-venue') || {}).value || '',
    volume: (document.getElementById('tx-volume') || {}).value || '0',
    rate:   (document.getElementById('tx-rate') || {}).value || '0',
    bonus:  (document.getElementById('tx-bonus') || {}).value || '0',
    drawn:  (document.getElementById('tx-drawn') || {}).value || '0',
    cash:   (document.getElementById('tx-cash') || {}).value || '0',
    note:   (document.getElementById('tx-note') || {}).value || '',
  };
}

/** 刷新所有视图 */
function refreshAllViews() {
  try { renderOverview(); } catch(e) { console.error('refresh overview:', e); }
  try { renderAll(); }      catch(e) { console.error('refresh all:', e); }
  try { renderQuery(); }    catch(e) { console.error('refresh query:', e); }
  try { renderSummary(); }  catch(e) { console.error('refresh summary:', e); }
}

// ============================================================================
// 公基金表单桥接
// ============================================================================

function saveFundForm() {
  var data = {
    date:   (document.getElementById('fund-date') || {}).value || nowStr(),
    type:   (document.getElementById('fund-type') || {}).value || 'deposit',
    amount: (document.getElementById('fund-amount') || {}).value || '0',
    note:   (document.getElementById('fund-note') || {}).value || '',
  };

  if (!data.amount || toNum(data.amount) <= 0) {
    showToast('請輸入金額', 'warning');
    return;
  }

  var record = createFund(data);
  if (record) {
    closeModal('fund-modal');
    refreshAllViews();
    toastCRUDDone();
  } else {
    showToast('新增失敗', 'error');
  }
}

/** 打开公基金模态框（重置表单） */
function openFundModal() {
  var dateEl = document.getElementById('fund-date');
  if (dateEl) dateEl.value = nowStr();
  var typeEl = document.getElementById('fund-type');
  if (typeEl) typeEl.value = 'deposit';
  var amountEl = document.getElementById('fund-amount');
  if (amountEl) amountEl.value = '';
  var noteEl = document.getElementById('fund-note');
  if (noteEl) noteEl.value = '';
  openModal('fund-modal');
}

/** 删除公基金记录（从查询页调用） */
function deleteFundRecord(fbKey) {
  if (!confirm('確定刪除此筆公基金記錄？')) return;
  var result = deleteFund(fbKey);
  if (result) {
    toastCRUDDone();
    refreshAllViews();
  } else {
    showToast('刪除失敗', 'error');
  }
}

/** 删除代理钱包记录（从查询页调用） */
function deleteAgentWallet(agent, fbKey) {
  if (!confirm('確定刪除此筆錢包記錄？')) return;
  var result = deleteWallet(agent, fbKey);
  if (result) {
    toastCRUDDone();
    refreshAllViews();
  } else {
    showToast('刪除失敗', 'error');
  }
}

// ============================================================================
// 代理钱包表单桥接
// ============================================================================

var _walletAgentName = null;

/** 打开代理钱包模态框 (供外部调用) */
function openWalletModal(agentName) {
  _walletAgentName = agentName || '';
  // 填充代理下拉
  var agentSel = document.getElementById('wallet-agent');
  if (agentSel) {
    agentSel.innerHTML = '<option value="">選擇代理</option>';
    var agents = getAllAgents();
    for (var i = 0; i < agents.length; i++) {
      var opt = document.createElement('option');
      opt.value = agents[i];
      opt.textContent = agents[i];
      if (agents[i] === agentName) opt.selected = true;
      agentSel.appendChild(opt);
    }
  }
  var title = document.getElementById('wallet-title');
  if (title) title.textContent = '代理錢包' + (agentName ? ' - ' + agentName : '');
  var dateEl = document.getElementById('wallet-date');
  if (dateEl) dateEl.value = nowStr();
  var typeEl = document.getElementById('wallet-type');
  if (typeEl) typeEl.value = 'deposit';
  var amountEl = document.getElementById('wallet-amount');
  if (amountEl) amountEl.value = '';
  var noteEl = document.getElementById('wallet-note');
  if (noteEl) noteEl.value = '';
  openModal('agent-wallet-modal');
}

function saveAgentWalletForm() {
  var agentSel = document.getElementById('wallet-agent');
  var agent = (agentSel && agentSel.value) ? agentSel.value : _walletAgentName;
  if (!agent) {
    showToast('請選擇代理', 'warning');
    return;
  }

  var data = {
    date:   (document.getElementById('wallet-date') || {}).value || nowStr(),
    type:   (document.getElementById('wallet-type') || {}).value || 'deposit',
    amount: (document.getElementById('wallet-amount') || {}).value || '0',
    note:   (document.getElementById('wallet-note') || {}).value || '',
  };

  if (!data.amount || toNum(data.amount) <= 0) {
    showToast('請輸入金額', 'warning');
    return;
  }

  var record = createWallet(agent, data);
  if (record) {
    closeModal('agent-wallet-modal');
    refreshAllViews();
    toastCRUDDone();
  } else {
    showToast('新增失敗', 'error');
  }
}

// ============================================================================
// 酒店设定模态框桥接
// ============================================================================

var _hcEditingKey = null;

function hcOpenModal(fbKey) {
  _hcEditingKey = fbKey || null;

  // 填充体系下拉
  _hcPopulateCasinoDropdown();

  var title = document.getElementById('hc-modal-title');
  if (fbKey) {
    if (title) title.textContent = '編輯房型';
    // 查找并填充
    var config = getAllHC();
    for (var i = 0; i < config.length; i++) {
      if (config[i]._fbKey === fbKey) {
        _hcFillForm(config[i]);
        break;
      }
    }
  } else {
    if (title) title.textContent = '新增房型';
    _hcResetForm();
  }

  // 显示 Modal
  var bg = document.getElementById('hc-modal-bg');
  if (bg) bg.style.display = 'flex';
}

function hcCloseModal() {
  var bg = document.getElementById('hc-modal-bg');
  if (bg) bg.style.display = 'none';
  _hcEditingKey = null;
}

function hcSaveModal() {
  var data = {
    casino:    (document.getElementById('hc-casino') || {}).value || '',
    hotel:     (document.getElementById('hc-hotel') || {}).value || '',
    code:      (document.getElementById('hc-code') || {}).value || '',
    room:      (document.getElementById('hc-room') || {}).value || '',
    weekday:   (document.getElementById('hc-weekday') || {}).value || '0',
    weekend:   (document.getElementById('hc-weekend') || {}).value || '0',
    special:   (document.getElementById('hc-special') || {}).value || '0',
    threshold: (document.getElementById('hc-threshold') || {}).value || '0',
  };

  if (!data.casino || !data.hotel || !data.room) {
    showToast('請填寫體系、酒店、房型', 'warning');
    return;
  }

  if (_hcEditingKey) {
    var updated = updateHC(_hcEditingKey, data);
    if (updated) {
      hcCloseModal();
      showToast('房型已更新', 'success');
      RM.render();
    }
  } else {
    var created = createHC(data);
    if (created) {
      hcCloseModal();
      showToast('房型已新增', 'success');
      RM.render();
    }
  }
}

function hcOnCasinoChange() {
  var casino = (document.getElementById('hc-casino') || {}).value;
  var hotelSel = document.getElementById('hc-hotel');
  if (!hotelSel) return;
  hotelSel.innerHTML = '<option value="">選擇酒店</option>';

  var hotels = getHotelsByCasino(casino);
  for (var i = 0; i < hotels.length; i++) {
    var opt = document.createElement('option');
    opt.value = hotels[i];
    opt.textContent = hotels[i];
    hotelSel.appendChild(opt);
  }
}

function _hcPopulateCasinoDropdown() {
  var sel = document.getElementById('hc-casino');
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇體系</option>';
  var config = getAllHC();
  var seen = {};
  for (var i = 0; i < config.length; i++) {
    if (!seen[config[i].casino]) {
      seen[config[i].casino] = true;
      var opt = document.createElement('option');
      opt.value = config[i].casino;
      opt.textContent = config[i].casino;
      sel.appendChild(opt);
    }
  }
}

function _hcFillForm(entry) {
  var fields = {
    'hc-casino': entry.casino, 'hc-hotel': entry.hotel,
    'hc-code': entry.code, 'hc-room': entry.room,
    'hc-weekday': entry.weekday, 'hc-weekend': entry.weekend,
    'hc-special': entry.special, 'hc-threshold': entry.threshold
  };
  for (var id in fields) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id] != null ? fields[id] : '';
  }
  hcOnCasinoChange(); // 填充酒店
  if (document.getElementById('hc-hotel')) {
    document.getElementById('hc-hotel').value = entry.hotel;
  }
}

function _hcResetForm() {
  var ids = ['hc-casino', 'hc-hotel', 'hc-code', 'hc-room',
             'hc-weekday', 'hc-weekend', 'hc-special', 'hc-threshold'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.value = '';
  }
}

// ============================================================================
// CSV 导入桥接
// ============================================================================

function handleCSVImport(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var result = importTxsCSV ? importTxsCSV(ev.target.result) : { success: false };
    if (result.success) {
      showToast('匯入 ' + result.count + ' 筆交易', 'success');
      refreshAllViews();
    } else {
      showToast(result.error || '匯入失敗', 'error');
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function rmHandleImport(event) {
  if (RM && RM.handleImport) {
    RM.handleImport(event);
  }
}

// ============================================================================
// 移动端侧栏
// ============================================================================

function toggleMobileSidebar() {
  var sb = document.getElementById('sidebar');
  if (sb) {
    var isOpen = sb.style.transform === 'translateX(0px)' || sb.style.left === '0px';
    sb.style.left = isOpen ? '-260px' : '0px';
    sb.style.transform = isOpen ? 'translateX(-260px)' : 'translateX(0)';
  }
}

// ============================================================================
// 代理管理列表渲染
// ============================================================================

/** 渲染代理管理列表 (agent-mgr-modal 内) */
function _renderAgentMgrList() {
  var container = document.getElementById('agent-mgr-list');
  if (!container) return;

  var agents = getAllAgents();
  container.innerHTML = '';

  if (agents.length === 0) {
    container.innerHTML = '<div style="padding:16px;color:' + UI_COLORS.textMuted + ';text-align:center">暫無代理</div>';
    return;
  }

  for (var i = 0; i < agents.length; i++) {
    (function(agentName) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid ' + UI_COLORS.borderSubtle;

      var nameSpan = document.createElement('span');
      nameSpan.textContent = agentName;
      nameSpan.style.cssText = 'font-size:14px;color:' + UI_COLORS.textPrimary;

      var btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex;gap:6px';

      // 钱包按钮
      var walletBtn = document.createElement('button');
      walletBtn.textContent = '錢包';
      walletBtn.style.cssText = 'background:' + UI_COLORS.success + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px';
      walletBtn.onclick = function() {
        closeModal('agent-mgr-modal');
        openWalletModal(agentName);
      };

      // 删除按钮
      var delBtn = document.createElement('button');
      delBtn.textContent = '刪除';
      delBtn.style.cssText = 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px';
      delBtn.onclick = function() {
        if (confirm('確定刪除代理「' + agentName + '」？')) {
          var result = removeAgent(agentName);
          if (result.success) {
            showToast('代理已刪除', 'success');
            _renderAgentMgrList();
            _populateTxAgentDropdown();
            if (RM && RM.populateAgentDropdown) RM.populateAgentDropdown();
            if (RM && RM.populateAgentFilter) RM.populateAgentFilter();
          } else {
            showToast(result.error || '刪除失敗', 'error');
          }
        }
      };

      btnGroup.appendChild(walletBtn);
      btnGroup.appendChild(delBtn);
      row.appendChild(nameSpan);
      row.appendChild(btnGroup);
      container.appendChild(row);
    })(agents[i]);
  }
}

// 监听代理管理 Modal 打开事件，刷新列表
// 注意: openModal 是同步的，我们在 agent-mgr-modal 点击后手动刷新
// 替代方案: 劫持原始 openModal
var _origOpenModal = openModal;
openModal = function(id, data) {
  var result = _origOpenModal(id, data);
  if (id === 'agent-mgr-modal') {
    setTimeout(_renderAgentMgrList, 50);
  }
  return result;
};

// ============================================================================
// 事件监听：tx:new / tx:edit:request
// ============================================================================

Events.on('tx:new', function() {
  _openTxModal(null);
});

Events.on('tx:edit:request', function(fbKey) {
  _openTxModal(fbKey);
});

// 监听交易创建/更新/删除后保存草稿
Events.on(EVENTS.TX_CREATED, function() { clearDraft(null); });
Events.on(EVENTS.TX_UPDATED, function() { clearDraft(null); });

/**
 * 手動重置為最新預設數據 (UI 按鈕調用)
 */
function hcResetPreset() {
  if (!confirm('確定要重置為最新預設數據嗎？\n這會刪除現有所有酒店設定（' + State.get('hotelConfig').length + ' 筆），並載入 ' + PRESET_CONFIG.length + ' 筆預設數據。此操作無法復原！')) return;
  try {
    var count = resetHCToPreset();
    showToast('已重置 ' + count + ' 筆酒店預設數據', 'success');
    _hcSelected = {};
    _hcLastClicked = null;
    hcRender();
  } catch(e) {
    console.error('[v13:hc] reset preset error:', e);
    showToast('重置失敗', 'error');
  }
}

/** 批量選取狀態: { fbKey: true } */
var _hcSelected = {};
/** 最後一次點擊的 fbKey (用於 Shift 範圍選取) */
var _hcLastClicked = null;

/**
 * 渲染酒店设定列表 (hc-table tbody)
 * 可选: 按 casino/hotel/search 筛选
 */
function hcRender(filterCasino, filterHotel, filterSearch) {
  var tbody = document.querySelector('.hc-table tbody');
  if (!tbody) return;

  var config = getAllHC();

  // 填充筛选下拉 (体系)
  var casSel = document.getElementById('hc-filter-casino');
  if (casSel) {
    var curCas = casSel.value;
    casSel.innerHTML = '<option value="">全部體系</option>';
    var seenCas = {};
    for (var k = 0; k < config.length; k++) {
      if (!seenCas[config[k].casino]) {
        seenCas[config[k].casino] = true;
        var co = document.createElement('option');
        co.value = config[k].casino;
        co.textContent = config[k].casino;
        if (config[k].casino === curCas) co.selected = true;
        casSel.appendChild(co);
      }
    }
  }

  // 填充筛选下拉 (酒店)
  var hotSel = document.getElementById('hc-filter-hotel');
  if (hotSel) {
    var curHot = hotSel.value;
    hotSel.innerHTML = '<option value="">全部酒店</option>';
    var seenHot = {};
    var casFil = casSel ? casSel.value : '';
    for (var m = 0; m < config.length; m++) {
      if ((!casFil || config[m].casino === casFil) && !seenHot[config[m].hotel]) {
        seenHot[config[m].hotel] = true;
        var ho = document.createElement('option');
        ho.value = config[m].hotel;
        ho.textContent = config[m].hotel;
        if (config[m].hotel === curHot) ho.selected = true;
        hotSel.appendChild(ho);
      }
    }
  }

  // 读取当前筛选条件
  var fCasino = filterCasino != null ? filterCasino : (casSel ? casSel.value : '');
  var fHotel  = filterHotel  != null ? filterHotel  : (hotSel ? hotSel.value : '');
  var fSearch = filterSearch != null ? filterSearch : (document.getElementById('hc-filter-search') || {}).value || '';
  var fSearchLower = fSearch.toLowerCase();

  // 筛选
  var filtered = config.filter(function(c) {
    if (fCasino && c.casino !== fCasino) return false;
    if (fHotel  && c.hotel  !== fHotel)  return false;
    if (fSearchLower) {
      var hay = (c.casino + c.hotel + c.code + c.room).toLowerCase();
      if (hay.indexOf(fSearchLower) < 0) return false;
    }
    return true;
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    var emptyTr = document.createElement('tr');
    var emptyTd = document.createElement('td');
    emptyTd.colSpan = 10;
    emptyTd.style.cssText = 'text-align:center;padding:24px;color:' + UI_COLORS.textMuted;
    emptyTd.textContent = '暫無資料';
    emptyTr.appendChild(emptyTd);
    tbody.appendChild(emptyTr);
    hcUpdateBatchBar();
    return;
  }

  // 收集當前可見行的 fbKey 列表 (用於 Shift 範圍選取)
  var visibleKeys = [];
  for (var i = 0; i < filtered.length; i++) {
    visibleKeys.push(filtered[i]._fbKey);
  }

  for (var i = 0; i < filtered.length; i++) {
    (function(entry, rowIndex) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-hc-key', entry._fbKey);

      // 高亮已選行
      if (_hcSelected[entry._fbKey]) {
        tr.style.background = '#fff8e1';
      }

      // checkbox 列
      var tdChk = document.createElement('td');
      tdChk.style.cssText = 'text-align:center;padding:4px';
      var chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = !!_hcSelected[entry._fbKey];
      chk.setAttribute('data-hc-key', entry._fbKey);
      chk.onclick = function(e) {
        e.stopPropagation();
        hcToggleRow(entry._fbKey, chk.checked, e);
      };
      tdChk.appendChild(chk);
      tr.appendChild(tdChk);

      var cells = [
        entry.casino, entry.hotel, entry.code, entry.room,
        '¥' + entry.weekday, '¥' + entry.weekend, '¥' + entry.special,
        entry.threshold + '萬'
      ];
      for (var j = 0; j < cells.length; j++) {
        var td = document.createElement('td');
        td.textContent = cells[j] != null ? String(cells[j]) : '';
        tr.appendChild(td);
      }
      // 操作列
      var tdOp = document.createElement('td');
      var editBtn = document.createElement('button');
      editBtn.textContent = '編輯';
      editBtn.style.cssText = 'background:' + UI_COLORS.goldSoft + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;margin-right:4px';
      editBtn.onclick = function() { hcOpenModal(entry._fbKey); };

      var delBtn = document.createElement('button');
      delBtn.textContent = '刪';
      delBtn.style.cssText = 'background:' + UI_COLORS.danger + ';color:white;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px';
      delBtn.onclick = function() {
        if (!confirm('確定刪除「' + entry.room + '」？')) return;
        var deleted = deleteHC(entry._fbKey);
        if (deleted) {
          delete _hcSelected[entry._fbKey];
          showToast('已刪除', 'success');
          hcRender();
        } else {
          showToast('刪除失敗', 'error');
        }
      };

      tdOp.appendChild(editBtn);
      tdOp.appendChild(delBtn);
      tr.appendChild(tdOp);
      tbody.appendChild(tr);
    })(filtered[i], i);
  }

  // 更新全選 checkbox 狀態
  hcUpdateSelectAllState(visibleKeys);
  hcUpdateBatchBar();
}

/** 更新全選 checkbox 的三態 (全選/半選/未選) */
function hcUpdateSelectAllState(visibleKeys) {
  var sa = document.getElementById('hc-select-all');
  if (!sa) return;
  if (!visibleKeys) {
    // 從 DOM 收集
    var rows = document.querySelectorAll('.hc-table tbody tr[data-hc-key]');
    visibleKeys = [];
    for (var r = 0; r < rows.length; r++) {
      visibleKeys.push(rows[r].getAttribute('data-hc-key'));
    }
  }
  var selCount = 0;
  for (var i = 0; i < visibleKeys.length; i++) {
    if (_hcSelected[visibleKeys[i]]) selCount++;
  }
  if (selCount === 0) {
    sa.checked = false;
    sa.indeterminate = false;
  } else if (selCount === visibleKeys.length && visibleKeys.length > 0) {
    sa.checked = true;
    sa.indeterminate = false;
  } else {
    sa.checked = false;
    sa.indeterminate = true;
  }
}

/** 更新批量操作欄顯示狀態 */
function hcUpdateBatchBar() {
  var bar = document.getElementById('hc-batch-bar');
  var countEl = document.getElementById('hc-batch-count');
  if (!bar) return;
  var count = Object.keys(_hcSelected).length;
  if (count > 0) {
    bar.style.display = 'flex';
    if (countEl) countEl.textContent = '已選 ' + count + ' 項';
  } else {
    bar.style.display = 'none';
  }
}

/** 全選 / 取消全選 */
function hcToggleSelectAll(checked) {
  var rows = document.querySelectorAll('.hc-table tbody tr[data-hc-key]');
  if (checked) {
    for (var i = 0; i < rows.length; i++) {
      var key = rows[i].getAttribute('data-hc-key');
      _hcSelected[key] = true;
    }
  } else {
    _hcSelected = {};
  }
  // 刷新列表 (保留篩選狀態)
  hcRender();
}

/** 切換單行選取 (支援 Shift 範圍選取) */
function hcToggleRow(fbKey, checked, event) {
  if (event && event.shiftKey && _hcLastClicked) {
    // Shift 範圍選取：選取 _hcLastClicked 到 fbKey 之間的所有行
    var rows = document.querySelectorAll('.hc-table tbody tr[data-hc-key]');
    var keys = [];
    for (var i = 0; i < rows.length; i++) {
      keys.push(rows[i].getAttribute('data-hc-key'));
    }
    var idxA = keys.indexOf(_hcLastClicked);
    var idxB = keys.indexOf(fbKey);
    if (idxA >= 0 && idxB >= 0) {
      var from = Math.min(idxA, idxB);
      var to   = Math.max(idxA, idxB);
      for (var j = from; j <= to; j++) {
        _hcSelected[keys[j]] = checked;
      }
    }
  } else {
    _hcSelected[fbKey] = checked;
    if (!checked) delete _hcSelected[fbKey];
  }
  _hcLastClicked = fbKey;
  // 刷新列表 (保留篩選狀態)
  hcRender();
}

/** 清除所有選取 */
function hcClearSelection() {
  _hcSelected = {};
  _hcLastClicked = null;
  var sa = document.getElementById('hc-select-all');
  if (sa) { sa.checked = false; sa.indeterminate = false; }
  hcRender();
}

/** 批量刪除所選項目 */
function hcBatchDelete() {
  var keys = Object.keys(_hcSelected);
  if (keys.length === 0) {
    showToast('請先選取要刪除的項目', 'warning');
    return;
  }
  if (!confirm('確定要批量刪除 ' + keys.length + ' 筆酒店設定？此操作無法復原！')) return;

  var deleted = 0;
  for (var i = 0; i < keys.length; i++) {
    var result = deleteHC(keys[i]);
    if (result) deleted++;
  }
  _hcSelected = {};
  _hcLastClicked = null;
  showToast('已刪除 ' + deleted + ' 筆', deleted > 0 ? 'success' : 'error');
  hcRender();
}

/**
 * 酒店设定筛选 (HTML onchange/oninput 调用)
 * 筛选变更时自动清除选取 (避免跨筛选混淆)
 */
function hcFilter() {
  _hcSelected = {};
  _hcLastClicked = null;
  hcRender();
}

// ============================================================================
// 登入桥接
// ============================================================================

/**
 * 登入按钮回调 — 读取密码调用 checkPassword，显示错误/剩余次数
 */
function _v13LoginFallback() {
  var inputEl = document.getElementById('pw-input');
  var errorEl = document.getElementById('pw-error');
  var attemptsEl = document.getElementById('pw-attempts');
  var pw = inputEl ? inputEl.value : '';

  if (!pw) {
    if (errorEl) errorEl.textContent = '請輸入密碼';
    if (attemptsEl) attemptsEl.textContent = '';
    return;
  }

  var result = (typeof checkPassword === 'function') ? checkPassword(pw) : { success: false, error: '認證模組未載入' };

  if (result.success) {
    if (errorEl) errorEl.textContent = '';
    if (attemptsEl) attemptsEl.textContent = '';
  } else {
    if (errorEl) errorEl.textContent = result.error || '驗證失敗';
    // 自动从 _pwAttempts(若可访问) 或直接隐藏
    if (attemptsEl) {
      var maxAttempts = (typeof CONFIG !== 'undefined' && CONFIG.MAX_PW_ATTEMPTS) ? CONFIG.MAX_PW_ATTEMPTS : 3;
      attemptsEl.textContent = '剩餘 ' + maxAttempts + ' 次機會';
    }
  }
}

// 监听 HC 更新事件，自动刷新列表
Events.on(EVENTS.HC_CONFIG_UPDATED, function() {
  var panel = document.getElementById('room-tab-config');
  if (panel && (panel.style.display !== 'none' && panel.classList.contains('active'))) {
    hcRender();
  }
  // 同时刷新订房表单中的体系下拉
  if (typeof RM !== 'undefined' && RM.populateCasinoDropdown) {
    RM.populateCasinoDropdown();
  }
});

// src/app.js
/**
 * v13 App 入口 — 系统初始化
 * 
 * 依赖: 全部模块 (按依赖顺序加载)
 * 对照档: 第十六节自动登入流程
 * 
 * 这是 v13 的启动入口，所有初始化逻辑集中在此。
 * 不散落在各个文件末尾的 IIFE 中。
 */

(function() {
  'use strict';

  // 全局错误捕获 - 显示在诊断面板上
  window.addEventListener('error', function(e) {
    try {
      var diag = document.getElementById('v13-boot-diag');
      if (diag) {
        diag.textContent = '✗ ' + (e.message || 'Unknown error');
        diag.style.background = '#c41';
      }
    } catch(ex) {}
  });

  // ========================================================================
  // 第一步: CDN 依赖检测 (非致命: 允许离线/屏蔽环境继续运行)
  // ========================================================================
  function checkDependencies() {
    var warnings = [];

    if (typeof firebase === 'undefined') {
      warnings.push('Firebase SDK 未載入 — 同步功能不可用');
    }

    if (!checkCrypto()) {
      warnings.push(getCryptoError() + ' — 数据以明文存储');
    }

    if (typeof Chart === 'undefined') {
      warnings.push('Chart.js 未載入 — 图表功能不可用');
    }

    if (warnings.length > 0) {
      console.warn('[v13:app] CDN dependencies missing (non-fatal):\n' + warnings.join('\n'));
    } else {
      console.log('[v13:app] All CDN dependencies verified ✓');
    }

    // 始终返回 true — 不允许 CDN 失败阻止应用启动
    return true;
  }

  // ========================================================================
  // 第二步: 版本快取清除机制 (对照档第一节)
  // ========================================================================
  function checkVersionCache() {
    var storedVer = Store.loadAppVersion();
    if (storedVer && storedVer !== APP.VERSION) {
      console.log('[v13:app] Version changed: ' + storedVer + ' → ' + APP.VERSION + ', clearing cache');
      // 保留数据，仅清除版本标记
      localStorage.removeItem(STORAGE_KEYS.APP_VERSION);
      // 强制重新载入一次
      if (!sessionStorage.getItem('_v13_reloaded')) {
        sessionStorage.setItem('_v13_reloaded', '1');
        location.replace(location.href.split('?')[0] + '?v=' + APP.VERSION);
        return false;
      }
    }
    Store.saveAppVersion(APP.VERSION);
    return true;
  }

  // ========================================================================
  // 第三步: Firebase 初始化 (非致命)
  // ========================================================================
  function initFirebaseAndSync() {
    try {
      if (!initFirebase()) {
        console.warn('[v13:app] Firebase initialization skipped (CDN unavailable)');
      }
    } catch (e) {
      console.warn('[v13:app] Firebase initialization error (non-fatal):', e.message);
    }
    return true;
  }

  // ========================================================================
  // 第四步: 从 localStorage 加载数据
  // ========================================================================
  function loadLocalData() {
    try {
      Store.loadAll(true);  // silent = true，不触发事件

      // 如果没有工作月份，设为当前月
      if (!State.get('workingMonth')) {
        State.set('workingMonth', currentMonth());
      }

      // 酒店设定预设版本检测: 版本变化时自动重置（覆盖旧数据）
      var currentPresetVer = Store.loadHCPresetVersion();
      if (currentPresetVer !== PRESET_VERSION) {
        try {
          var presetCount = resetHCToPreset();
          console.log('[v13:app] Hotel preset updated: v' + currentPresetVer + ' → v' + PRESET_VERSION + ', loaded ' + presetCount + ' entries');
        } catch(e) {
          console.error('[v13:app] Failed to update hotel preset:', e);
        }
      } else if (State.get('hotelConfig').length === 0) {
        // 首次使用（空数据）也加载预设
        try {
          var presetCount = resetHCToPreset();
          console.log('[v13:app] Hotel config preset loaded: ' + presetCount + ' entries');
        } catch(e) {
          console.error('[v13:app] Failed to load hotel preset:', e);
        }
      }

      console.log('[v13:app] Local data loaded ✓');
      return true;
    } catch (e) {
      console.error('[v13:app] Error loading local data:', e);
      return false;
    }
  }

  // ========================================================================
  // 第五步: 认证
  // ========================================================================
  function initAuth() {
    // 尝试自动登入
    autoLogin();

    // 绑定密码验证事件
    var pwBtn = document.querySelector('.pw-btn');
    if (pwBtn) {
      pwBtn.addEventListener('click', function() {
        var input = document.getElementById('pw-input');
        var errorEl = document.getElementById('pw-error');
        if (!input) return;

        var result = checkPassword(input.value);
        if (result.success) {
          if (errorEl) errorEl.style.display = 'none';
          // 登入成功后初始化应用
          initAppAfterLogin();
        } else {
          if (errorEl) {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
          }
          input.value = '';
        }
      });
    }

    // 回车键提交
    var pwInput = document.getElementById('pw-input');
    if (pwInput) {
      pwInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var btn = document.querySelector('.pw-btn');
          if (btn) btn.click();
        }
      });
    }

    // 如果已经登入（autoLogin 成功），直接初始化
    if (sessionStorage.getItem('macau_auth') === '1') {
      initAppAfterLogin();
    }
  }

  // ========================================================================
  // 第六步: 登入后初始化
  // ========================================================================
  function initAppAfterLogin() {
    console.log('[v13:app] User authenticated, initializing app...');

    // ★ 确保密码遮罩完全移除，避免阻挡点击
    var pwOverlay = document.getElementById('pw-overlay');
    if (pwOverlay) { pwOverlay.style.display = 'none'; pwOverlay.style.opacity = '0'; }

    // ★ 首先绑定交互: 先保侧栏能点、页面能切，再渲染数据
    _setupSidebar();
    _setupMonthBar();
    _setupBackToTop();
    _setupAutoRefresh();

    // 填充下拉
    try { _populateDropdowns(); } catch(e) { console.error('[v13:app] populateDropdowns error:', e); }

    // 启动 Firebase 监听器 (非致命) — watchers 在连线建立后会自动拉取远端数据
    try { startWatchers(); } catch(e) { console.warn('[v13:app] startWatchers error:', e); }

    // 立即推送本地数据到 Firebase（异步安全网）
    try { syncUploadAll(); } catch(e) { console.warn('[v13:app] syncUploadAll error:', e); }

    // 渲染: 加 try-catch 确保一个页面失败不影响其他
    try { renderOverview(); } catch(e) { console.error('[v13:app] renderOverview error:', e); }
    try { renderAll(); } catch(e) { console.error('[v13:app] renderAll error:', e); }

    // 初始化房务系统
    try { if (typeof RM !== 'undefined') RM.init(); } catch(e) { console.error('[v13:app] RM.init error:', e); }

    try { if (typeof renderWallet === 'function') renderWallet(); } catch(e) { console.error('[v13:app] renderWallet error:', e); }

    // 更新 topbar 总钱包
    try { _updateTopbarWallet(); } catch(e) {}

    // 每日自动备份
    try { autoBackupCheck(); } catch(e) {}

    // 诊断: 标记就绪
    try {
      var diag = document.getElementById('v13-boot-diag');
      if (diag) { diag.textContent = '✓ v13 就绪'; diag.style.background = '#4c1'; }
    } catch(e) {}

    console.log('[v13:app] App initialized successfully ✓');
  }

  // ========================================================================
  // 辅助函数
  // ========================================================================

  function _populateDropdowns() {
    var agents = getAllAgents();
    // 填充交易表单代理下拉
    var txAgent = $('#tx-agent');
    if (txAgent) {
      txAgent.innerHTML = '<option value="">選擇代理</option>';
      for (var i = 0; i < agents.length; i++) {
        txAgent.appendChild(h('option', { value: agents[i] }, agents[i]));
      }
    }
  }

  function _setupBackToTop() {
    var btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function _setupSidebar() {
    // 侧边栏折叠
    var toggle = $('.sb-toggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        var sidebar = $('#sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
        State.set('sidebarCollapsed', sidebar && sidebar.classList.contains('collapsed'));
      });
    }

    // 侧边栏页面切换
    var navItems = document.querySelectorAll('.sb-item[data-page]');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener('click', function() {
        var page = this.getAttribute('data-page');
        showPage(page, this);
      });
    }

    // ★ 手机底部导航绑定
    var mobileNavItems = document.querySelectorAll('.nav-item[data-page]');
    for (var mi = 0; mi < mobileNavItems.length; mi++) {
      mobileNavItems[mi].addEventListener('click', function() {
        var page = this.getAttribute('data-page');
        showPage(page);
      });
    }

    // 手机底部导航 active 状态同步
    Events.on(EVENTS.PAGE_CHANGED, function(pageName) {
      var items = document.querySelectorAll('.nav-item[data-page]');
      for (var ni = 0; ni < items.length; ni++) {
        items[ni].classList.toggle('active', items[ni].getAttribute('data-page') === pageName);
      }
    });

    // 手机侧边栏
    var overlay = $('#sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', function() {
        var sidebar = $('#sidebar');
        if (sidebar) sidebar.classList.remove('open');
        overlay.style.display = 'none';
      });
    }
  }

  function _setupMonthBar() {
    var monthEl = $('#sidebar-month');
    if (monthEl) {
      monthEl.textContent = State.get('workingMonth') || currentMonth();
    }
    Events.on(EVENTS.MONTH_CHANGED, function(month) {
      if (monthEl) monthEl.textContent = month;
    });
  }

  // 自动刷新: 数据变更 → 渲染
  function _setupAutoRefresh() {
    Events.on(EVENTS.TXS_LOADED, function() {
      var page = State.get('currentPage');
      if (page === 'overview') renderOverview();
      if (page === 'all') renderAll();
      if (page === 'query') doQuery();
      if (page === 'summary') renderSummary();
      _updateTopbarWallet();
    });

    Events.on(EVENTS.TX_CREATED, function() { renderAll(); renderOverview(); _updateTopbarWallet(); if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.TX_UPDATED, function() { renderAll(); renderOverview(); _updateTopbarWallet(); if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.TX_DELETED, function() { renderAll(); renderOverview(); _updateTopbarWallet(); if (typeof renderWallet === 'function') renderWallet(); });

    Events.on(EVENTS.FUND_CREATED, function() { renderOverview(); _updateTopbarWallet(); });
    Events.on(EVENTS.FUND_UPDATED, function() { renderOverview(); _updateTopbarWallet(); });
    Events.on(EVENTS.FUND_DELETED, function() { renderOverview(); _updateTopbarWallet(); });

    // 钱包变更 → 刷新总钱包页
    Events.on(EVENTS.FUND_CREATED, function() { if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.FUND_UPDATED, function() { if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.FUND_DELETED, function() { if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.WALLET_CREATED, function() { if (typeof renderWallet === 'function') renderWallet(); _updateTopbarWallet(); });
    Events.on(EVENTS.WALLET_UPDATED, function() { if (typeof renderWallet === 'function') renderWallet(); _updateTopbarWallet(); });
    Events.on(EVENTS.WALLET_DELETED, function() { if (typeof renderWallet === 'function') renderWallet(); _updateTopbarWallet(); });
    Events.on(EVENTS.TXS_LOADED, function() { if (typeof renderWallet === 'function') renderWallet(); });
  }

  function _updateTopbarWallet() {
    try {
      var badge = document.getElementById('total-wallet-badge');
      if (!badge) return;
      var total = getTotalWallet();
      badge.textContent = '💰 總錢包: ' + fmtMoney(total);
    } catch (e) {
      console.error('[v13:app] _updateTopbarWallet error:', e);
    }
  }

  // ========================================================================
  // 启动!
  // ========================================================================
  function boot() {
    // 诊断: 显示启动标记
    try {
      var diag = document.getElementById('v13-boot-diag');
      if (diag) { diag.style.display = 'block'; diag.textContent = 'v13 boot...'; }
    } catch(e) {}

    console.log('[v13:app] Booting v13...');
    console.log('[v13:app] Version:', APP.VERSION);
    console.log('[v13:app] Events registered:', JSON.stringify(Events.listAll()));

    // 1. 检测依赖
    if (!checkDependencies()) return;

    // 2. 检查版本快取
    if (!checkVersionCache()) return;  // 如果需要刷新，这里会 redirect

    // 3. 初始化 Firebase
    initFirebaseAndSync();

    // 4. 加载本地数据
    loadLocalData();

    // 5. 键盘快捷键
    initKeyboard();

    // 6. 认证
    initAuth();
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

