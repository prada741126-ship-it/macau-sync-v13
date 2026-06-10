/**
 * v13 加密/解密模块
 * 
 * 依赖: core/constants.js (APP.PWD_ENCODED), CryptoJS (CDN)
 * 影响: core/store.js (localStorage 持久化)
 * 
 * 对照档: 第七节模块2, 第十节安全防护
 * 
 * ⚠️ 致命教训 (v11.0-v11.2.6):
 * CryptoJS CDN 缺失 6 个版本，加密静默失败降级为纯 JSON 存储。
 * v13 必须在初始化时检测 CryptoJS 是否可用，不可用时在 UI 上明确报错。
 */

// ============================================================================
// 全局加密实例
// ============================================================================
var _cryptoReady = false;
var _cryptoError = '';

/**
 * 检测 CryptoJS 是否可用
 * @returns {boolean}
 */
function checkCrypto() {
  if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
    _cryptoReady = true;
    _cryptoError = '';
    return true;
  }
  _cryptoReady = false;
  _cryptoError = 'CryptoJS 未載入 — 加密功能不可用，請檢查 CDN 連線';
  console.error('[v13:crypto] FATAL: CryptoJS is not defined. Encryption is UNAVAILABLE.');
  return false;
}

/**
 * 获取加密是否就绪
 * @returns {boolean}
 */
function isCryptoReady() {
  return _cryptoReady;
}

/**
 * 获取加密错误信息
 * @returns {string}
 */
function getCryptoError() {
  return _cryptoError;
}

// ============================================================================
// 密码管理 (sessionStorage)
// ============================================================================

/**
 * 从 sessionStorage 读取密码
 * @returns {string}
 */
function getSessionPw() {
  return sessionStorage.getItem('_pw') || '';
}

/**
 * 设定密码 (sessionStorage + 全局变量)
 * @param {string} pw
 */
function setSessionPw(pw) {
  sessionStorage.setItem('_pw', pw);
  if (typeof SYNC_PASSWORD !== 'undefined') {
    SYNC_PASSWORD = pw;
  }
}

/**
 * 清除密码
 */
function clearSessionPw() {
  sessionStorage.removeItem('_pw');
  if (typeof SYNC_PASSWORD !== 'undefined') {
    SYNC_PASSWORD = '';
  }
}

/**
 * 验证密码
 * @param {string} input - 用户输入
 * @returns {boolean}
 */
function verifyPassword(input) {
  var decoded = atob(APP.PWD_ENCODED);
  return input === decoded;
}

// ============================================================================
// AES 加密/解密
// ============================================================================

/**
 * 获取加密密钥 (密码的 SHA256 hash)
 * @returns {string}
 */
function _getEncKey() {
  var pw = getSessionPw();
  if (!pw) pw = atob(APP.PWD_ENCODED);  // 回退默认密码
  return CryptoJS.SHA256(pw).toString();
}

/**
 * AES 加密对象 → 字符串
 * @param {object} obj
 * @returns {string} "ENC:" + Base64密文
 */
function encryptData(obj) {
  if (!_cryptoReady) {
    console.warn('[v13:crypto] encryptData: CryptoJS not ready, storing as plain JSON');
    return JSON.stringify(obj);
  }
  try {
    var json = JSON.stringify(obj);
    var key = _getEncKey();
    var encrypted = CryptoJS.AES.encrypt(json, key).toString();
    return 'ENC:' + encrypted;
  } catch (e) {
    console.error('[v13:crypto] encryptData error:', e);
    return JSON.stringify(obj);
  }
}

/**
 * 解密字符串 → 数组/对象
 * 向下兼容旧版未加密格式
 * @param {string} str - "ENC:xxx" 或 JSON 字符串
 * @returns {Array|Object}
 */
function decryptData(str) {
  if (!str) return [];
  // 非加密格式 → 直接 JSON 解析
  if (str.indexOf('ENC:') !== 0) {
    try {
      var parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('[v13:crypto] decryptData: legacy JSON parse error:', e);
      return [];
    }
  }
  // 加密格式 → AES 解密
  if (!_cryptoReady) {
    console.error('[v13:crypto] decryptData: CryptoJS not ready, cannot decrypt');
    return [];
  }
  try {
    var ciphertext = str.slice(4);
    var key = _getEncKey();
    var bytes = CryptoJS.AES.decrypt(ciphertext, key);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
      console.error('[v13:crypto] decryptData: decryption returned empty (wrong password?)');
      return [];
    }
    var result = JSON.parse(plaintext);
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('[v13:crypto] decryptData error:', e);
    return [];
  }
}

/**
 * AES 加密代理钱包对象
 * @param {object} obj - { agentName: [records] }
 * @returns {string}
 */
function encryptWallets(obj) {
  if (!_cryptoReady) {
    console.warn('[v13:crypto] encryptWallets: CryptoJS not ready');
    return JSON.stringify(obj);
  }
  try {
    var json = JSON.stringify(obj);
    var key = _getEncKey();
    return CryptoJS.AES.encrypt(json, key).toString();
  } catch (e) {
    console.error('[v13:crypto] encryptWallets error:', e);
    return JSON.stringify(obj);
  }
}

/**
 * 解密代理钱包
 * @param {string} str
 * @returns {object}
 */
function decryptWallets(str) {
  if (!str) return {};
  if (!_cryptoReady) {
    console.error('[v13:crypto] decryptWallets: CryptoJS not ready');
    return {};
  }
  try {
    var key = _getEncKey();
    var bytes = CryptoJS.AES.decrypt(str, key);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) return {};
    return JSON.parse(plaintext);
  } catch (e) {
    console.error('[v13:crypto] decryptWallets error:', e);
    return {};
  }
}
