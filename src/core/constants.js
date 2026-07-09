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
  VERSION:       'v13.0.3',
  TITLE:         '澳門洗碼報表',
  SYSTEM_NAME:   '博盈國際會',
  SYSTEM_SUB:    '洗碼管理系統',
  SYSTEM_EN:     'BOYING INTERNATIONAL CLUB',
  LOGIN_TITLE:   '授 權 驗 證',
  LOGO_CHAR:     '\u2660',  // ♠
  PWD_HASH:       '8204868322789a563871ffa6e828a1f096b4c4cec66706ee848283fae65551d6',  // SHA-256('macau888')
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
  TOMBSTONE_TTL_MS:   30 * 24 * 60 * 60 * 1000,  // 墓碑保留 30 天，超期后从 Firebase 清除
  PRODUCTION:         false,         // 生产模式开关
};

// ============================================================================
// localStorage 键 (对照档第四节 - 20 个 key)
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
  RECENTLY_DELETED:  'macau_recently_deleted', // 最近删除追踪
  LAST_SYNC_TIME:    'macau_last_sync_time',   // 最后同步时间 ISO
};

// ============================================================================
// Firebase 配置
// ============================================================================
var FIREBASE_CONFIG = {
  apiKey:             'AIzaSyCStj_Wm-xCvxAph4gcCIMtGT-UlNzBdo',
  authDomain:         'macau-sync.firebaseapp.com',
  databaseURL:        'https://macau-sync-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:          'macau-sync',
  storageBucket:      'macau-sync.firebasestorage.app',
  messagingSenderId:  '539459664910',
  appId:              '1:539459664910:web:9627911e6308621ffdd05f',
  measurementId:      'G-46M047PFMP',
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
  HC_CONFIG:       'macau_data/hcConfig',
  ARCHIVES:        'macau_data/archives',
  CLEARED_AT:      'macau_data/_clearedAt',
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
