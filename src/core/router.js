/**
 * v13 页面路由模块
 * 
 * 依赖: core/state.js, core/events.js, core/constants.js (PAGES)
 * 对照档: 第七节模块6 (showPage)
 */

/**
 * 切换到指定页面
 * @param {string} pageName - 'overview'|'all'|'query'|'summary'|'room'
 * @param {Element} [sidebarEl] - 侧边栏点击的元素
 */
function showPage(pageName, sidebarEl) {
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

  // 更新 topbar 标题
  var title = document.getElementById('topbar-title');
  if (title) {
    var pageInfo = getPageInfo(pageName);
    if (pageInfo) title.textContent = pageInfo.label;
  }

  // 更新 State
  State.set('currentPage', pageName);
  Events.emit(EVENTS.PAGE_CHANGED, pageName);

  // 刷新对应页面数据
  _refreshPage(pageName);
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
      if (typeof doQuery === 'function') doQuery();
      break;
    case 'summary':
      if (typeof renderSummary === 'function') renderSummary();
      break;
    case 'room':
      if (typeof RM !== 'undefined' && RM.render) RM.render();
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
