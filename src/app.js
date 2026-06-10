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

  // ========================================================================
  // 第一步: CDN 依赖检测 (致命错误不可静默)
  // ========================================================================
  function checkDependencies() {
    var errors = [];

    if (typeof firebase === 'undefined') {
      errors.push('Firebase SDK 未載入');
    }

    if (!checkCrypto()) {
      errors.push(getCryptoError());
    }

    if (typeof Chart === 'undefined') {
      console.warn('[v13:app] Chart.js not loaded — 图表功能不可用');
    }

    if (errors.length > 0) {
      var msg = errors.join('\n');
      console.error('[v13:app] FATAL DEPENDENCY ERRORS:\n' + msg);
      // UI 上显示错误
      showToast(msg, 'error', 10000);
      return false;
    }

    console.log('[v13:app] All CDN dependencies verified ✓');
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
  // 第三步: Firebase 初始化
  // ========================================================================
  function initFirebaseAndSync() {
    if (!initFirebase()) {
      console.error('[v13:app] Firebase initialization failed');
      return false;
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

    // 填充下拉
    _populateDropdowns();

    // 启动 Firebase 监听器
    startWatchers();

    // 手动同步一次
    syncUploadAll();
    syncDownloadAll();

    // 渲染初始页面
    renderAll();
    renderOverview();

    // 初始化房务系统
    if (typeof RM !== 'undefined') RM.init();

    // 设置回顶部按钮
    _setupBackToTop();

    // 设置侧边栏事件
    _setupSidebar();

    // 设置月份切换
    _setupMonthBar();

    // 每日自动备份
    try { autoBackupCheck(); } catch(e) {}

    // 事件监听: 数据变更后自动刷新
    _setupAutoRefresh();

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
    });

    Events.on(EVENTS.TX_CREATED, function() { renderAll(); renderOverview(); });
    Events.on(EVENTS.TX_UPDATED, function() { renderAll(); renderOverview(); });
    Events.on(EVENTS.TX_DELETED, function() { renderAll(); renderOverview(); });

    Events.on(EVENTS.FUND_CREATED, function() { renderOverview(); });
    Events.on(EVENTS.FUND_UPDATED, function() { renderOverview(); });
    Events.on(EVENTS.FUND_DELETED, function() { renderOverview(); });
  }

  // ========================================================================
  // 启动!
  // ========================================================================
  function boot() {
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
