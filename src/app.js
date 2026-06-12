/**
 * v13 App 入口 — 系统初始化
 * 
 * 依赖: 全部模块 (按依赖顺序加载)
 * 对照档: 第十六节自动登入流程
 * 
 * 这是 v13 的启动入口，所有初始化逻辑集中在此。
 * 不散落在各个文件末尾的 IIFE 中。
 */

(function() {
  'use strict';

  // 全局错误捕获 - 显示在诊断面板上
  window.addEventListener('error', function(e) {
    try {
      var diag = document.getElementById('v13-boot-diag');
      if (diag) {
        diag.textContent = '✗ ' + (e.message || 'Unknown error');
        diag.style.background = '#c41';
      }
    } catch(ex) {}
  });

  // ========================================================================
  // 第一步: CDN 依赖检测 (非致命: 允许离线/屏蔽环境继续运行)
  // ========================================================================
  function checkDependencies() {
    var warnings = [];

    if (typeof firebase === 'undefined') {
      warnings.push('Firebase SDK 未載入 — 同步功能不可用');
    }

    if (!checkCrypto()) {
      warnings.push(getCryptoError() + ' — 数据以明文存储');
    }

    if (typeof Chart === 'undefined') {
      warnings.push('Chart.js 未載入 — 图表功能不可用');
    }

    if (warnings.length > 0) {
      console.warn('[v13:app] CDN dependencies missing (non-fatal):\n' + warnings.join('\n'));
    } else {
      console.log('[v13:app] All CDN dependencies verified ✓');
    }

    // 始终返回 true — 不允许 CDN 失败阻止应用启动
    return true;
  }

  // ========================================================================
  // 第二步: 版本快取清除机制 (对照档第一节)
  // ========================================================================
  function checkVersionCache() {
    var storedVer = Store.loadAppVersion();
    if (storedVer && storedVer !== APP.VERSION) {
      console.log('[v13:app] Version changed: ' + storedVer + ' → ' + APP.VERSION + ', clearing cache');
      // 保留数据，仅清除版本标记
      localStorage.removeItem(STORAGE_KEYS.APP_VERSION);
      // 强制重新载入一次
      if (!sessionStorage.getItem('_v13_reloaded')) {
        sessionStorage.setItem('_v13_reloaded', '1');
        location.replace(location.href.split('?')[0] + '?v=' + APP.VERSION);
        return false;
      }
    }
    Store.saveAppVersion(APP.VERSION);
    return true;
  }

  // ========================================================================
  // 第三步: Firebase 初始化 (非致命)
  // ========================================================================
  function initFirebaseAndSync() {
    try {
      if (!initFirebase()) {
        console.warn('[v13:app] Firebase initialization skipped (CDN unavailable)');
      }
    } catch (e) {
      console.warn('[v13:app] Firebase initialization error (non-fatal):', e.message);
    }
    return true;
  }

  // ========================================================================
  // 第四步: 从 localStorage 加载数据
  // ========================================================================
  function loadLocalData() {
    try {
      Store.loadAll(true);  // silent = true，不触发事件

      // 如果没有工作月份，设为当前月
      if (!State.get('workingMonth')) {
        State.set('workingMonth', currentMonth());
      }

      // 酒店设定预设版本检测: 版本变化时自动重置（覆盖旧数据）
      var currentPresetVer = Store.loadHCPresetVersion();
      if (currentPresetVer !== PRESET_VERSION) {
        try {
          var presetCount = resetHCToPreset();
          console.log('[v13:app] Hotel preset updated: v' + currentPresetVer + ' → v' + PRESET_VERSION + ', loaded ' + presetCount + ' entries');
        } catch(e) {
          console.error('[v13:app] Failed to update hotel preset:', e);
        }
      } else if (State.get('hotelConfig').length === 0) {
        // 首次使用（空数据）也加载预设
        try {
          var presetCount = resetHCToPreset();
          console.log('[v13:app] Hotel config preset loaded: ' + presetCount + ' entries');
        } catch(e) {
          console.error('[v13:app] Failed to load hotel preset:', e);
        }
      }

      console.log('[v13:app] Local data loaded ✓');
      return true;
    } catch (e) {
      console.error('[v13:app] Error loading local data:', e);
      return false;
    }
  }

  // ========================================================================
  // 第五步: 认证
  // ========================================================================
  function initAuth() {
    // 尝试自动登入
    autoLogin();

    // 绑定密码验证事件
    var pwBtn = document.querySelector('.pw-btn');
    if (pwBtn) {
      pwBtn.addEventListener('click', function() {
        var input = document.getElementById('pw-input');
        var errorEl = document.getElementById('pw-error');
        if (!input) return;

        var result = checkPassword(input.value);
        if (result.success) {
          if (errorEl) errorEl.style.display = 'none';
          // 登入成功后初始化应用
          initAppAfterLogin();
        } else {
          if (errorEl) {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
          }
          input.value = '';
        }
      });
    }

    // 回车键提交
    var pwInput = document.getElementById('pw-input');
    if (pwInput) {
      pwInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var btn = document.querySelector('.pw-btn');
          if (btn) btn.click();
        }
      });
    }

    // 如果已经登入（autoLogin 成功），直接初始化
    if (sessionStorage.getItem('macau_auth') === '1') {
      initAppAfterLogin();
    }
  }

  // ========================================================================
  // 第六步: 登入后初始化
  // ========================================================================
  function initAppAfterLogin() {
    console.log('[v13:app] User authenticated, initializing app...');

    // ★ 确保密码遮罩完全移除，避免阻挡点击
    var pwOverlay = document.getElementById('pw-overlay');
    if (pwOverlay) { pwOverlay.style.display = 'none'; pwOverlay.style.opacity = '0'; }

    // ★ 首先绑定交互: 先保侧栏能点、页面能切，再渲染数据
    _setupSidebar();
    _setupMonthBar();
    _setupBackToTop();
    _setupAutoRefresh();

    // 填充下拉
    try { _populateDropdowns(); } catch(e) { console.error('[v13:app] populateDropdowns error:', e); }

    // 启动 Firebase 监听器 (非致命) — watchers 在连线建立后会自动拉取远端数据
    try { startWatchers(); } catch(e) { console.warn('[v13:app] startWatchers error:', e); }

    // 尝試同步 — 如果连线已建立就立即同步，否则由 _watchConnection 在连通时补触发
    try { syncDownloadAll(); } catch(e) { console.warn('[v13:app] syncDownloadAll error:', e); }
    try { syncUploadAll(); } catch(e) { console.warn('[v13:app] syncUploadAll error:', e); }

    // 渲染: 加 try-catch 确保一个页面失败不影响其他
    try { renderOverview(); } catch(e) { console.error('[v13:app] renderOverview error:', e); }
    try { renderAll(); } catch(e) { console.error('[v13:app] renderAll error:', e); }

    // 初始化房务系统
    try { if (typeof RM !== 'undefined') RM.init(); } catch(e) { console.error('[v13:app] RM.init error:', e); }

    try { if (typeof renderWallet === 'function') renderWallet(); } catch(e) { console.error('[v13:app] renderWallet error:', e); }

    // 更新 topbar 总钱包
    try { _updateTopbarWallet(); } catch(e) {}

    // 每日自动备份
    try { autoBackupCheck(); } catch(e) {}

    // 诊断: 标记就绪
    try {
      var diag = document.getElementById('v13-boot-diag');
      if (diag) { diag.textContent = '✓ v13 就绪'; diag.style.background = '#4c1'; }
    } catch(e) {}

    console.log('[v13:app] App initialized successfully ✓');
  }

  // ========================================================================
  // 辅助函数
  // ========================================================================

  function _populateDropdowns() {
    var agents = getAllAgents();
    // 填充交易表单代理下拉
    var txAgent = $('#tx-agent');
    if (txAgent) {
      txAgent.innerHTML = '<option value="">選擇代理</option>';
      for (var i = 0; i < agents.length; i++) {
        txAgent.appendChild(h('option', { value: agents[i] }, agents[i]));
      }
    }
  }

  function _setupBackToTop() {
    var btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function _setupSidebar() {
    // 侧边栏折叠
    var toggle = $('.sb-toggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        var sidebar = $('#sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
        State.set('sidebarCollapsed', sidebar && sidebar.classList.contains('collapsed'));
      });
    }

    // 侧边栏页面切换
    var navItems = document.querySelectorAll('.sb-item[data-page]');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener('click', function() {
        var page = this.getAttribute('data-page');
        showPage(page, this);
      });
    }

    // ★ 手机底部导航绑定
    var mobileNavItems = document.querySelectorAll('.nav-item[data-page]');
    for (var mi = 0; mi < mobileNavItems.length; mi++) {
      mobileNavItems[mi].addEventListener('click', function() {
        var page = this.getAttribute('data-page');
        showPage(page);
      });
    }

    // 手机底部导航 active 状态同步
    Events.on(EVENTS.PAGE_CHANGED, function(pageName) {
      var items = document.querySelectorAll('.nav-item[data-page]');
      for (var ni = 0; ni < items.length; ni++) {
        items[ni].classList.toggle('active', items[ni].getAttribute('data-page') === pageName);
      }
    });

    // 手机侧边栏
    var overlay = $('#sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', function() {
        var sidebar = $('#sidebar');
        if (sidebar) sidebar.classList.remove('open');
        overlay.style.display = 'none';
      });
    }
  }

  function _setupMonthBar() {
    var monthEl = $('#sidebar-month');
    if (monthEl) {
      monthEl.textContent = State.get('workingMonth') || currentMonth();
    }
    Events.on(EVENTS.MONTH_CHANGED, function(month) {
      if (monthEl) monthEl.textContent = month;
    });
  }

  // 自动刷新: 数据变更 → 渲染
  function _setupAutoRefresh() {
    Events.on(EVENTS.TXS_LOADED, function() {
      var page = State.get('currentPage');
      if (page === 'overview') renderOverview();
      if (page === 'all') renderAll();
      if (page === 'query') doQuery();
      if (page === 'summary') renderSummary();
      _updateTopbarWallet();
    });

    Events.on(EVENTS.TX_CREATED, function() { renderAll(); renderOverview(); _updateTopbarWallet(); if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.TX_UPDATED, function() { renderAll(); renderOverview(); _updateTopbarWallet(); if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.TX_DELETED, function() { renderAll(); renderOverview(); _updateTopbarWallet(); if (typeof renderWallet === 'function') renderWallet(); });

    Events.on(EVENTS.FUND_CREATED, function() { renderOverview(); _updateTopbarWallet(); });
    Events.on(EVENTS.FUND_UPDATED, function() { renderOverview(); _updateTopbarWallet(); });
    Events.on(EVENTS.FUND_DELETED, function() { renderOverview(); _updateTopbarWallet(); });

    // 钱包变更 → 刷新总钱包页
    Events.on(EVENTS.FUND_CREATED, function() { if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.FUND_UPDATED, function() { if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.FUND_DELETED, function() { if (typeof renderWallet === 'function') renderWallet(); });
    Events.on(EVENTS.WALLET_CREATED, function() { if (typeof renderWallet === 'function') renderWallet(); _updateTopbarWallet(); });
    Events.on(EVENTS.WALLET_UPDATED, function() { if (typeof renderWallet === 'function') renderWallet(); _updateTopbarWallet(); });
    Events.on(EVENTS.WALLET_DELETED, function() { if (typeof renderWallet === 'function') renderWallet(); _updateTopbarWallet(); });
    Events.on(EVENTS.TXS_LOADED, function() { if (typeof renderWallet === 'function') renderWallet(); });
  }

  function _updateTopbarWallet() {
    try {
      var badge = document.getElementById('total-wallet-badge');
      if (!badge) return;
      var total = getTotalWallet();
      badge.textContent = '💰 總錢包: ' + fmtMoney(total);
    } catch (e) {
      console.error('[v13:app] _updateTopbarWallet error:', e);
    }
  }

  // ========================================================================
  // 启动!
  // ========================================================================
  function boot() {
    // 诊断: 显示启动标记
    try {
      var diag = document.getElementById('v13-boot-diag');
      if (diag) { diag.style.display = 'block'; diag.textContent = 'v13 boot...'; }
    } catch(e) {}

    console.log('[v13:app] Booting v13...');
    console.log('[v13:app] Version:', APP.VERSION);
    console.log('[v13:app] Events registered:', JSON.stringify(Events.listAll()));

    // 1. 检测依赖
    if (!checkDependencies()) return;

    // 2. 检查版本快取
    if (!checkVersionCache()) return;  // 如果需要刷新，这里会 redirect

    // 3. 初始化 Firebase
    initFirebaseAndSync();

    // 4. 加载本地数据
    loadLocalData();

    // 5. 键盘快捷键
    initKeyboard();

    // 6. 认证
    initAuth();
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
