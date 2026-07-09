/**
 * v13 加密/解密模块
 * 
 * 依赖: core/constants.js (APP.PWD_HASH), CryptoJS (CDN)
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
var _cryptoPollTimer = null;
var _cryptoRetryDone = false;

/**
 * 检测 CryptoJS 是否可用
 * @returns {boolean}
 */
function checkCrypto() {
  if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
    _cryptoReady = true;
    _cryptoError = '';
    if (_cryptoPollTimer) { clearInterval(_cryptoPollTimer); _cryptoPollTimer = null; }
    _cryptoRetryDone = true;
    return true;
  }
  _cryptoReady = false;
  _cryptoError = 'CryptoJS 未載入 — 加密功能不可用，請檢查 CDN 連線';
  console.error('[v13:crypto] FATAL: CryptoJS is not defined. Encryption is UNAVAILABLE.');

  // ★ 如果还没设置重试，启动轮询（参照 Firebase 模式）
  if (!_cryptoRetryDone) {
    _cryptoRetryDone = true;
    _startCryptoPoll();
  }

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
 * 启动 CryptoJS 轮询重试
 * 当 CDN 异步加载晚于 app.js 执行时，通过轮询等待 CryptoJS 就绪
 */
function _startCryptoPoll() {
  var pollCount = 0;
  _cryptoPollTimer = setInterval(function() {
    pollCount++;
    if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
      _cryptoReady = true;
      _cryptoError = '';
      clearInterval(_cryptoPollTimer);
      _cryptoPollTimer = null;
      console.log('[v13:crypto] ✅ CryptoJS loaded via poll #' + pollCount + ' — encryption ACTIVE');

      // ★ 加密就绪后：尝试从 localStorage 重新加载加密数据
      // 之前因为 decryptData 返回 [] 导致数据丢失，现在重新解密
      try {
        var rawTxs = localStorage.getItem(STORAGE_KEYS.DATA);
        if (rawTxs && rawTxs.indexOf('ENC:') === 0) {
          var decrypted = decryptData(rawTxs);
          if (decrypted.length > 0) {
            State.set('txs', decrypted);
            Events.emit(EVENTS.TXS_LOADED, decrypted);
            console.log('[v13:crypto] 🔓 Restored ' + decrypted.length + ' encrypted TXS records');
          }
        }
        var rawFund = localStorage.getItem(STORAGE_KEYS.FUND);
        if (rawFund && rawFund.indexOf('ENC:') === 0) {
          var decFund = decryptData(rawFund);
          if (decFund.length > 0) {
            State.set('fundWithdrawals', decFund);
            Events.emit(EVENTS.FUND_LOADED, decFund);
            console.log('[v13:crypto] 🔓 Restored ' + decFund.length + ' encrypted FUND records');
          }
        }
        var rawWallets = localStorage.getItem(STORAGE_KEYS.AGENT_WALLETS);
        if (rawWallets && rawWallets.indexOf('ENC:') === 0) {
          var decWallets = decryptWallets(rawWallets);
          if (decWallets && Object.keys(decWallets).length > 0) {
            State.set('agentWallets', decWallets);
            Events.emit(EVENTS.WALLETS_LOADED, decWallets);
            console.log('[v13:crypto] 🔓 Restored encrypted WALLET records');
          }
        }
      } catch(re) {
        console.error('[v13:crypto] Crypto restore error:', re);
      }

      // ★ 触发加密就绪事件
      Events.emit(EVENTS.CRYPTO_READY);
    }

    if (pollCount >= 30) {
      clearInterval(_cryptoPollTimer);
      _cryptoPollTimer = null;
      console.error('[v13:crypto] ❌ CryptoJS failed to load after 30s. Encryption permanently DISABLED.');
      console.error('[v13:crypto]    请检查: 1) 网络是否可访问 cdn.jsdelivr.net  2) 防火墙/广告拦截器是否屏蔽');
    }
  }, 1000);
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
 * 验证密码 (SHA-256 比对，不含明文)
 * @param {string} input - 用户输入
 * @returns {boolean}
 */
function verifyPassword(input) {
  if (typeof CryptoJS === 'undefined' || !CryptoJS.SHA256) {
    console.error('[v13:crypto] verifyPassword: CryptoJS not available, cannot verify');
    return false;
  }
  try {
    var hash = CryptoJS.SHA256(input).toString();
    return hash === APP.PWD_HASH;
  } catch (e) {
    console.error('[v13:crypto] verifyPassword error:', e);
    return false;
  }
}

// ============================================================================
// AES 加密/解密
// ============================================================================

/**
 * 获取加密密钥 (直接使用预计算的 SHA-256 哈希)
 * @returns {string}
 */
function _getEncKey() {
  var pw = getSessionPw();
  if (!pw) return APP.PWD_HASH;  // 回退：直接用预计算哈希
  // 如果 session 中存储的就是哈希 (autoLogin 场景)，直接使用
  if (pw === APP.PWD_HASH) return pw;
  // 用户手动登录时，session 存储的是明文，需要哈希
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
