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
  var deleted = null;

  State.update('txs', function(arr) {
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

  // 持久化
  Store.saveTxs(State.get('txs'));

  // 通知事件
  Events.emit(EVENTS.TX_DELETED, deleted);

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
