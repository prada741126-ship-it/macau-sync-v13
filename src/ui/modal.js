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

// 监听事件
Events.on(EVENTS.MODAL_OPEN, function(data) { openModal(data.id, data.data); });
Events.on(EVENTS.MODAL_CLOSE, function(data) { closeModal(data ? data.id : null); });
