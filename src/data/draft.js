/**
 * v13 草稿管理模块
 * 
 * 依赖: core/state.js, core/store.js, core/constants.js (CONFIG)
 *        utils/format.js (nowStr)
 * 对照档: 第七节模块4 (saveDraft/loadDraft/clearDraft)
 */

/**
 * 保存交易表单草稿 (带 2 秒防抖)
 * @param {object} formData - 表单数据
 */
function saveDraft(formData) {
  // 清除旧 timer
  var timer = State.get('draftTimer');
  if (timer) clearTimeout(timer);

  // 2 秒防抖
  var newTimer = setTimeout(function() {
    var draft = {
      data:      formData,
      savedAt:   nowStr(),
      expiresAt: Date.now() + CONFIG.DRAFT_EXPIRY,
    };
    Store.saveDraft(draft);
    State.set('draftTimer', null);
  }, 2000);

  State.set('draftTimer', newTimer);
}

/**
 * 立即保存草稿 (不防抖)
 * @param {object} formData
 */
function saveDraftNow(formData) {
  var timer = State.get('draftTimer');
  if (timer) clearTimeout(timer);

  var draft = {
    data:      formData,
    savedAt:   nowStr(),
    expiresAt: Date.now() + CONFIG.DRAFT_EXPIRY,
  };
  Store.saveDraft(draft);
  State.set('draftTimer', null);
}

/**
 * 读取草稿
 * @returns {object|null} 表单数据，过期返回 null
 */
function loadDraft() {
  var draft = Store.loadDraft();
  if (!draft || !draft.data) return null;

  // 检查过期
  if (draft.expiresAt && Date.now() > draft.expiresAt) {
    clearDraft();
    return null;
  }

  return draft.data;
}

/**
 * 清除草稿
 */
function clearDraft() {
  var timer = State.get('draftTimer');
  if (timer) clearTimeout(timer);
  Store.remove(STORAGE_KEYS.DRAFT);
  State.set('draftTimer', null);
}

/**
 * 是否有草稿
 * @returns {boolean}
 */
function hasDraft() {
  return loadDraft() !== null;
}
