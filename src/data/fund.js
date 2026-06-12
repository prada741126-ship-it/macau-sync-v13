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
