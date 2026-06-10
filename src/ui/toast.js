/**
 * v13 Toast 通知模块
 * 
 * 依赖: core/constants.js (TOAST_TIMING, UI_COLORS)
 * 对照档: 第七节模块3, 第十七节 Toast 时序
 * 
 * 事件: 监听 ui:toast
 */

/**
 * 显示 Toast 通知
 * @param {string} msg - 消息内容
 * @param {string} [type='info'] - 'success'|'warning'|'error'|'info'
 * @param {number} [duration=3500] - 毫秒
 */
function showToast(msg, type, duration) {
  if (!msg) return;

  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = msg;

  // 颜色
  var colors = {
    success: UI_COLORS.success,
    warning: UI_COLORS.warning,
    error:   UI_COLORS.danger,
    info:    UI_COLORS.info,
  };
  var color = colors[type] || UI_COLORS.info;

  toast.style.cssText = [
    'padding: 12px 20px',
    'margin-bottom: 8px',
    'border-radius: ' + '8px',
    'background: ' + UI_COLORS.bgElevated,
    'color: ' + UI_COLORS.textPrimary,
    'border-left: 3px solid ' + color,
    'font-size: 14px',
    'box-shadow: 0 4px 16px rgba(0,0,0,0.3)',
    'opacity: 0',
    'transform: translateX(20px)',
    'transition: all 0.3s ease',
    'pointer-events: auto',
    'max-width: 360px',
    'word-break: break-word',
  ].join(';');

  container.appendChild(toast);

  // 入场动画
  requestAnimationFrame(function() {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // 自动移除
  var d = duration || TOAST_TIMING.DURATION;
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(function() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, d);
}

/**
 * CRUD 标准 Toast 时序 (对照档第十七节)
 *   showToast('已完成', 'success')
 *   → 350ms
 *   showToast('同步中…', 'info')
 *   → 950ms (总)
 *   showToast('同步成功', 'success')
 */
function toastCRUDDone() {
  showToast('已完成', 'success');
  setTimeout(function() {
    showToast('同步中…', 'info');
  }, TOAST_TIMING.SYNCING_DELAY);
  setTimeout(function() {
    showToast('同步成功', 'success');
  }, TOAST_TIMING.SYNC_DONE_DELAY);
}

/**
 * Toast: 操作失败
 * @param {string} msg
 */
function toastError(msg) {
  showToast(msg || '操作失敗', 'error');
}

/**
 * Toast: 警告
 * @param {string} msg
 */
function toastWarn(msg) {
  showToast(msg, 'warning');
}

// 监听 Event Bus
Events.on(EVENTS.TOAST, function(data) {
  showToast(data.msg, data.type, data.duration);
});
