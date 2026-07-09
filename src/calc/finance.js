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
// 轻量 Memoization（引用比较 + 参数指纹）
// ============================================================================

var _calcCache = {};

/**
 * 包装纯函数，添加引用级缓存
 * 仅当输入数组引用相同且额外参数一致时才返回缓存
 * @param {function} fn
 * @param {string} name
 * @returns {function}
 */
function _memoCalc(fn, name) {
  return function(txs) {
    var extraArgs = Array.prototype.slice.call(arguments, 1);
    var cached = _calcCache[name];
    if (cached && cached.ref === txs && JSON.stringify(extraArgs) === cached.args) {
      return cached.result;
    }
    var result = fn.apply(null, arguments);
    _calcCache[name] = { ref: txs, args: JSON.stringify(extraArgs), result: result };
    return result;
  };
}

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
var totalVolume = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].volume);
  }
  return sum;
}, 'totalVolume');

/**
 * 计算所有交易的佣金总和
 * @param {Array} txs
 * @returns {number}
 */
var totalComm = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].comm);
  }
  return sum;
}, 'totalComm');

/**
 * 计算所有交易的码粮总和
 * @param {Array} txs
 * @returns {number}
 */
var totalBonus = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].bonus);
  }
  return sum;
}, 'totalBonus');

/**
 * 计算所有交易的公基金总和
 * @param {Array} txs
 * @returns {number}
 */
var totalFund = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].fund);
  }
  return sum;
}, 'totalFund');

/**
 * 计算所有交易的已提领总和
 * @param {Array} txs
 * @returns {number}
 */
var totalDrawn = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].drawn);
  }
  return sum;
}, 'totalDrawn');

/**
 * 计算所有交易的未提领总和
 * @param {Array} txs
 * @returns {number}
 */
var totalUndrawn = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].undrawn);
  }
  return sum;
}, 'totalUndrawn');

/**
 * 计算所有交易的现金寄放总和
 * @param {Array} txs
 * @returns {number}
 */
var totalCash = _memoCalc(function(txs) {
  var sum = 0;
  for (var i = 0; i < txs.length; i++) {
    sum += toNum(txs[i].cash) || 0;
  }
  return sum;
}, 'totalCash');

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
 *
 * 餘額 = 碼糧 + 現金寄放 + 錢包存入 + 錢包自存現金 - 已領碼糧(tx.drawn) - 錢包提領
 *
 * 已領碼糧 (tx.drawn) 和錢包提領 (wallet withdraw) 是兩筆獨立的扣減，
 * 必須分別減掉，不能取 max 也不能省略任何一項。
 *
 * @param {string} agentName - 代理名
 * @param {Array} txs - 交易数组
 * @param {object} agentWallets - 代理钱包 { agentName: [records] }
 * @returns {number}
 */
function calcAgentBalance(agentName, txs, agentWallets) {
  // 从交易中计算该代理的碼糧、現金寄放、已領碼糧
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

  // 从代理钱包中计算存入和提領
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

  // ★ 正確公式：所有收入 - 已領碼糧 - 錢包提領（兩筆獨立扣減）
  var balance = bonusSum + cashSum + awDeposit + awCashDep - drawnSum - awWithdraw;
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
  // 月份归一化 (使用 extractMonth 处理各种日期格式)
  var normMonth = extractMonth(month || '');

  for (var i = 0; i < txs.length; i++) {
    // ★ 使用 extractMonth 提取交易月份，支持 "YYYY-MM-DD" 和 "YYYY/MM/DD" 及无前导零格式
    var txMonth = extractMonth(txs[i].date);
    if (!normMonth || txMonth === normMonth) {
      totalVolume += toNum(txs[i].volume);
    }
  }

  var usedThreshold = 0;
  for (var j = 0; j < bookings.length; j++) {
    // ★ 使用 extractMonth 提取订房月份
    var bkMonth = extractMonth(bookings[j].month) || extractMonth(bookings[j].checkIn);
    if (!normMonth || bkMonth === normMonth) {
      usedThreshold += toNum(bookings[j].threshold) || 0;
    }
  }

  // ★ 剩余额度 = 总洗码量 - 已用转变门槛（可为负数，表示不足）
  var remaining = totalVolume - usedThreshold;
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
    totalVolume:        totalVolume,
    usedThreshold:      usedThreshold,
    remainingThreshold: remaining,
    usageRate:          rate,
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
