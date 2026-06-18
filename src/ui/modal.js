/**
 * v13 Modal 管理
 * 依赖: core/events.js
 */

var _openModals = [];

function openModal(id, data) {
  var modal = document.getElementById(id);
  if (!modal) return;

  modal.style.display = 'flex';
  _openModals.push(id);
  State.set('isModalOpen', true);

  // 点击背景关闭
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal(id);
  });
}

function closeModal(id) {
  if (!id && _openModals.length > 0) {
    id = _openModals[_openModals.length - 1];
  }

  var modal = document.getElementById(id);
  if (!modal) return;

  modal.style.display = 'none';
  _openModals = _openModals.filter(function(m) { return m !== id; });
  State.set('isModalOpen', _openModals.length > 0);
}

function closeAllModals() {
  for (var i = _openModals.length - 1; i >= 0; i--) {
    var m = document.getElementById(_openModals[i]);
    if (m) m.style.display = 'none';
  }
  _openModals = [];
  State.set('isModalOpen', false);
}

function isModalOpen() {
  return _openModals.length > 0;
}

// ============================================================================
// 全局自訂確認框（替代 window.confirm，兼容手機/iOS Safari/微信内嵌）
// ============================================================================

var _confirmCallback = null;

/**
 * 顯示自訂確認框（異步，不阻塞主線程）
 * @param {string} msg - 確認訊息
 * @param {function} onConfirm - 用戶點擊「確定」後的回調
 * @param {object} [opts] - 可選: { okText, cancelText, okColor }
 */
function showConfirm(msg, onConfirm, opts) {
  var bg = document.getElementById('g-confirm-bg');
  var msgEl = document.getElementById('g-confirm-msg');
  var okBtn = document.getElementById('g-confirm-ok');
  var cancelBtn = document.getElementById('g-confirm-cancel');

  if (!bg || !msgEl || !okBtn || !cancelBtn) {
    // 降級到原生 confirm（桌面端兜底）
    if (window.confirm(msg)) onConfirm();
    return;
  }

  opts = opts || {};
  msgEl.textContent = msg;
  okBtn.textContent = opts.okText || '確定';
  okBtn.style.background = opts.okColor || '#e53935';
  cancelBtn.textContent = opts.cancelText || '取消';

  bg.style.display = 'flex';
  _confirmCallback = onConfirm;

  // 確定
  okBtn.onclick = function() {
    bg.style.display = 'none';
    _confirmCallback = null;
    onConfirm();
  };

  // 取消
  cancelBtn.onclick = function() {
    bg.style.display = 'none';
    _confirmCallback = null;
  };

  // 點背景取消
  bg.onclick = function(e) {
    if (e.target === bg) {
      bg.style.display = 'none';
      _confirmCallback = null;
    }
  };
}

// 监听事件
Events.on(EVENTS.MODAL_OPEN, function(data) { openModal(data.id, data.data); });
Events.on(EVENTS.MODAL_CLOSE, function(data) { closeModal(data ? data.id : null); });
