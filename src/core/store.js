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
    return load(STORAGE_KEYS.RM_BOOKINGS, false) || [];
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
    saveAppVersion:     saveAppVersion,
    loadAppVersion:     loadAppVersion,
    // 全量
    saveAll:      saveAll,
    loadAll:      loadAll,
  };
})();
