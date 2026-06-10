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
