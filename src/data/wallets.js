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
