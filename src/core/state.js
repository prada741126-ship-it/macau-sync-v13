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
