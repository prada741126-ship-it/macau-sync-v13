/**
 * v13 认证模块
 * 
 * 依赖: core/constants.js (APP, CONFIG), core/state.js, core/events.js
 *        utils/crypto.js (verifyPassword, setSessionPw, clearSessionPw)
 *        core/store.js (saveAuth, loadAuth)
 * 对照档: 第七节模块6, 第十节安全防护, 第十六节自动登入
 */

// ============================================================================
// 状态
// ============================================================================
var _pwAttempts = 0;
var _pwLockTimer = null;
var _sessionTimer = null;
var _locked = false;

// ============================================================================
// 登入
// ============================================================================

/**
 * 验证密码
 * @param {string} input - 用户输入
 * @returns {object} { success, error? }
 */
function checkPassword(input) {
  // 检查是否锁定
  if (_locked) {
    return { success: false, error: '密碼驗證已鎖定，請稍後再試' };
  }

  if (verifyPassword(input)) {
    // 成功
    _pwAttempts = 0;
    setSessionPw(input);
    Store.saveAuth('1');
    hidePasswordOverlay();
    startSessionTimer();
    Events.emit('auth:success');
    return { success: true };
  }

  // 失败
  _pwAttempts++;
  if (_pwAttempts >= CONFIG.MAX_PW_ATTEMPTS) {
    _lockPassword();
    return { success: false, error: '密碼錯誤次數過多，已鎖定 60 秒' };
  }

  return { success: false, error: '密碼錯誤，還剩 ' + (CONFIG.MAX_PW_ATTEMPTS - _pwAttempts) + ' 次機會' };
}

function _lockPassword() {
  _locked = true;
  clearTimeout(_pwLockTimer);
  _pwLockTimer = setTimeout(function() {
    _locked = false;
    _pwAttempts = 0;
    _pwLockTimer = null;
  }, CONFIG.LOCK_DURATION);
}

// ============================================================================
// UI
// ============================================================================

/**
 * 隐藏密码遮罩层
 */
function hidePasswordOverlay() {
  var overlay = document.getElementById('pw-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
    setTimeout(function() {
      overlay.style.display = 'none';
    }, 500);
  }
}

/**
 * 显示密码遮罩层
 */
function showPasswordOverlay() {
  var overlay = document.getElementById('pw-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    var input = document.getElementById('pw-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

/**
 * 自动登入 (对照档第十六节)
 */
function autoLogin() {
  // 检查 sessionStorage
  if (sessionStorage.getItem('macau_auth') === '1') {
    hidePasswordOverlay();
    setSessionPw(APP.PWD_HASH);
    startSessionTimer();
    return true;
  }
  // 检查 localStorage
  if (Store.loadAuth() === '1') {
    hidePasswordOverlay();
    setSessionPw(APP.PWD_HASH);
    sessionStorage.setItem('macau_auth', '1');
    startSessionTimer();
    return true;
  }
  return false;
}

// ============================================================================
// 会话管理
// ============================================================================

function startSessionTimer() {
  resetSession();
  // 监听用户活动
  document.addEventListener('mousemove', resetSession);
  document.addEventListener('keydown', resetSession);
  document.addEventListener('touchstart', resetSession);
}

function resetSession() {
  clearTimeout(_sessionTimer);
  _sessionTimer = setTimeout(function() {
    logout();
  }, CONFIG.SESSION_TIMEOUT);
}

function logout() {
  clearSessionPw();
  sessionStorage.removeItem('macau_auth');
  Store.remove(STORAGE_KEYS.AUTH);
  showPasswordOverlay();
  Events.emit('auth:logout');
}

// ============================================================================
// 远端访问检测
// ============================================================================

function isRemoteAccess() {
  // 检测是否通过远端 URL 访问
  var host = window.location.host;
  return host.indexOf('railway.app') >= 0 || host.indexOf('github.io') >= 0;
}
