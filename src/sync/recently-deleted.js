/**
 * v13 Recently Deleted Tracking Module
 * 
 * 依赖: core/constants.js (STORAGE_KEYS), core/store.js (Store)
 * 影响: sync/uploader.js (syncUploadAll transactions)
 * 
 * 用途: 追踪最近删除的 fbKey，防止 syncUploadAll 的 transaction 在墓碑到达 Firebase 前
 *       将远端旧数据"复活"回本地。删除操作（deleteTx/deleteFund/deleteWallet/deleteBooking）
 *       会将 fbKey 加入追踪表，syncUploadAll 的事务中会为这些 key 强制写入墓碑。
 * 
 * 过期策略: 60 秒后自动清理（单个 remove*FromFirebase 推送通常 < 3 秒完成）
 */

// ============================================================================
// 追踪表 (module-level, 不存入 State)
// ============================================================================
var _recentlyDeleted = [];

/**
 * 追踪删除
 * @param {string} type - 'tx' | 'fund' | 'wallet' | 'booking' | 'agent'
 * @param {string} key - fbKey
 */
function trackRecentlyDeleted(type, key) {
  if (!type || !key) return;
  // 去重
  for (var i = 0; i < _recentlyDeleted.length; i++) {
    if (_recentlyDeleted[i].type === type && _recentlyDeleted[i].key === key) {
      _recentlyDeleted[i].at = Date.now();  // 刷新时间戳
      saveRecentlyDeleted();
      return;
    }
  }
  _recentlyDeleted.push({ type: type, key: key, at: Date.now() });
  saveRecentlyDeleted();
}

/**
 * 检查是否最近删除
 * @param {string} type
 * @param {string} key
 * @returns {boolean}
 */
function isRecentlyDeleted(type, key) {
  for (var i = 0; i < _recentlyDeleted.length; i++) {
    if (_recentlyDeleted[i].type === type && _recentlyDeleted[i].key === key) {
      return true;
    }
  }
  return false;
}

/**
 * 清理过期的追踪条目
 * @param {number} [maxAge=60000] - 最长保留毫秒数 (默认 60 秒)
 * @returns {number} 清理的条目数
 */
function cleanRecentlyDeleted(maxAge) {
  if (!maxAge) maxAge = 60000;
  var now = Date.now();
  var cleaned = 0;
  for (var i = _recentlyDeleted.length - 1; i >= 0; i--) {
    if (now - _recentlyDeleted[i].at > maxAge) {
      _recentlyDeleted.splice(i, 1);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    saveRecentlyDeleted();
  }
  return cleaned;
}

// ============================================================================
// 持久化 (localStorage)
// ============================================================================

function saveRecentlyDeleted() {
  try {
    Store.save(STORAGE_KEYS.RECENTLY_DELETED, _recentlyDeleted, false);
  } catch (e) {
    console.error('[v13:rd] saveRecentlyDeleted error:', e);
  }
}

function loadRecentlyDeleted() {
  try {
    var saved = Store.load(STORAGE_KEYS.RECENTLY_DELETED, false);
    if (Array.isArray(saved)) {
      _recentlyDeleted = saved;
    }
    // 清理过期项
    cleanRecentlyDeleted();
    console.log('[v13:rd] Loaded ' + _recentlyDeleted.length + ' recently deleted entries');
  } catch (e) {
    console.error('[v13:rd] loadRecentlyDeleted error:', e);
    _recentlyDeleted = [];
  }
}

/**
 * 获取当前追踪数量
 * @returns {number}
 */
function getRecentlyDeletedCount() {
  return _recentlyDeleted.length;
}
