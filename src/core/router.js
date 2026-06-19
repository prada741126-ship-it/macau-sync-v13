/**
 * v13 页面路由模块
 * 
 * 依赖: core/state.js, core/events.js, core/constants.js (PAGES)
 * 对照档: 第七节模块6 (showPage)
 */

/** 页面切换进度条控制器 */
var _progressTimer = null;

function _startProgress() {
  var bar = document.getElementById('page-progress-bar');
  if (!bar) return;
  bar.classList.remove('done');
  bar.classList.add('active');
  bar.style.width = '0%';
  // 强制回流后动画到 ~80%
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      bar.style.width = '75%';
    });
  });
}

function _finishProgress() {
  var bar = document.getElementById('page-progress-bar');
  if (!bar) return;
  bar.style.width = '100%';
  bar.classList.add('done');
  bar.classList.remove('active');
  // 动画完成后重置
  setTimeout(function() {
    bar.style.width = '0%';
    bar.classList.remove('done');
  }, 600);
}

/**
 * 切换到指定页面
 * @param {string} pageName - 'overview'|'all'|'query'|'summary'|'room'|'wallet'
 * @param {Element} [sidebarEl] - 侧边栏点击的元素
 */
function showPage(pageName, sidebarEl) {
  // 启动进度条
  _startProgress();

  // 隐藏所有页面
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove('active');
  }

  // 显示目标页面
  var target = document.getElementById('page-' + pageName);
  if (target) {
    target.classList.add('active');

    // 淡入动画
    target.style.opacity = '0';
    target.style.transition = 'opacity 0.2s ease';
    requestAnimationFrame(function() {
      target.style.opacity = '1';
    });
  }

  // 更新侧边栏高亮
  var items = document.querySelectorAll('.sb-item[data-page]');
  for (var j = 0; j < items.length; j++) {
    items[j].classList.remove('active');
  }
  if (sidebarEl) {
    sidebarEl.classList.add('active');
  }

  // 更新 topbar 标题 + 副标题
  var titleEl = document.getElementById('topbar-title');
  var subtitleEl = document.getElementById('topbar-subtitle');
  if (titleEl) {
    var pageInfo = getPageInfo(pageName);
    if (pageInfo) titleEl.textContent = pageInfo.label;
  }
  if (subtitleEl) {
    var workingMonth = State.get('workingMonth') || '';
    var subtitles = {
      overview: workingMonth ? '月份: ' + workingMonth : '',
      all:      '全部交易记录',
      query:    '自定义查询',
      summary:  workingMonth ? '月份: ' + workingMonth : '',
      room:     '房间管理系统',
      wallet:   '钱包资金流水'
    };
    subtitleEl.textContent = subtitles[pageName] || '';
  }

  // 更新 State
  State.set('currentPage', pageName);
  Events.emit(EVENTS.PAGE_CHANGED, pageName);

  // 刷新对应页面数据
  _refreshPage(pageName);

  // 完成进度条
  _finishProgress();
}

/**
 * 获取页面信息
 * @param {string} name
 * @returns {object|null}
 */
function getPageInfo(name) {
  for (var i = 0; i < PAGES.length; i++) {
    if (PAGES[i].name === name) return PAGES[i];
  }
  return null;
}

/**
 * 页面切换后刷新数据
 */
function _refreshPage(pageName) {
  switch (pageName) {
    case 'overview':
      if (typeof renderOverview === 'function') renderOverview();
      break;
    case 'all':
      if (typeof renderAll === 'function') renderAll();
      break;
    case 'query':
      if (typeof renderQuery === 'function') renderQuery();
      else if (typeof doQuery === 'function') doQuery();
      break;
    case 'summary':
      if (typeof renderSummary === 'function') renderSummary();
      break;
    case 'room':
      if (typeof RM !== 'undefined' && RM.render) RM.render();
      break;
    case 'wallet':
      if (typeof renderWallet === 'function') renderWallet();
      break;
  }
}

// 监听事件
Events.on(EVENTS.PAGE_CHANGED, function(pageName) {
  // 同步侧边栏 active
  var items = document.querySelectorAll('.sb-item[data-page]');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', items[i].getAttribute('data-page') === pageName);
  }
});
