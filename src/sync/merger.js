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

  // ★ 不过滤墓碑 — 墓碑由 watchers.js 在客户端侧过滤
  //   Transaction 写回 Firebase 时需要保留墓碑，否则其他设备收不到删除通知
  for (var k in merged) {
    result.push(merged[k]);
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
      result.push(recordMap[k]);  // ★ 不过滤墓碑 — 由 watchers.js 在客户端侧过滤
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
 * 合并订房数组（时间戳决胜策略，与 mergeTxs 一致）
 * @param {Array} local - 本地订房数组
 * @param {Array} remote - 远端订房数组
 * @returns {Array} 合并结果（含墓碑，由调用方过滤）
 */
function mergeBookings(local, remote) {
  var merged = {};

  // 先收集本地
  for (var i = 0; i < local.length; i++) {
    var key = local[i]._fbKey;
    if (key) merged[key] = local[i];
  }
  // 再合并远端（时间戳决胜）
  for (var j = 0; j < remote.length; j++) {
    var rKey = remote[j]._fbKey;
    if (rKey) {
      if (merged[rKey]) {
        var localTs  = merged[rKey]._updatedAt || 0;
        var remoteTs = remote[j]._updatedAt || 0;
        if (remoteTs > localTs) {
          // 远端更新（包括墓碑 _deleted:true）胜出
          merged[rKey] = remote[j];
        }
      } else {
        // 本地没有 → 远端胜出（包括新增和墓碑）
        merged[rKey] = remote[j];
      }
    }
  }

  // ★ 不过滤墓碑 — 由 watchers.js 在客户端侧过滤
  var result = [];
  for (var k in merged) {
    result.push(merged[k]);
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
