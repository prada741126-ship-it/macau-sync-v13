/**
 * v13 键盘快捷键
 * 依赖: core/state.js, core/events.js, core/constants.js (SHORTCUTS)
 * 对照档: 第十三节快捷键清单
 */

function initKeyboard() {
  document.addEventListener('keydown', function(e) {
    // 如果弹窗开启，忽略部分快捷键
    if (State.get('isModalOpen') && e.key !== 'Escape') return;

    var ctrl = e.ctrlKey || e.metaKey;

    // Ctrl + 1~5: 切换页面
    if (ctrl && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      var pageNames = ['overview', 'all', 'query', 'summary', 'room'];
      showPage(pageNames[parseInt(e.key) - 1]);
      return;
    }

    // Ctrl + N: 新增交易
    if (ctrl && e.key === 'n') {
      e.preventDefault();
      Events.emit('tx:new');
      return;
    }

    // Ctrl + S: 储存
    if (ctrl && e.key === 's') {
      e.preventDefault();
      Events.emit('sync:manual');
      showToast('正在同步...', 'info');
      syncUploadAll();
      return;
    }

    // Ctrl + F: 搜索
    if (ctrl && e.key === 'f') {
      e.preventDefault();
      Events.emit('search:focus');
      return;
    }

    // Ctrl + ◀ (ArrowLeft): 上个月
    if (ctrl && e.key === 'ArrowLeft') {
      e.preventDefault();
      if (typeof switchMonth === 'function') switchMonth(-1);
      return;
    }

    // Ctrl + ▶ (ArrowRight): 下个月
    if (ctrl && e.key === 'ArrowRight') {
      e.preventDefault();
      if (typeof switchMonth === 'function') switchMonth(1);
      return;
    }

    // ?: 快捷键帮助
    if (e.key === '?' && !ctrl) {
      e.preventDefault();
      openModal('shortcut-help-modal');
      return;
    }

    // Escape: 关闭弹窗
    if (e.key === 'Escape') {
      if (isModalOpen()) {
        closeAllModals();
      }
      return;
    }
  });
}
