/**
 * v13 DOM 操作工具
 * 
 * 依赖: 无（原生 DOM API）
 * 影响: ui/*, pages/*, data/*
 */

// ============================================================================
// 选择器
// ============================================================================

/**
 * 单个元素选择
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector);
}

/**
 * 多元素选择
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector);
}

// ============================================================================
// 创建元素
// ============================================================================

/**
 * 快速创建 DOM 元素
 * @param {string} tag - 标签名
 * @param {object} [attrs] - 属性 { className, id, textContent, innerHTML, ... }
 * @param {...(Element|string)} [children]
 * @returns {Element}
 */
function h(tag, attrs, children) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var key in attrs) {
      if (key === 'className') {
        el.className = attrs[key];
      } else if (key === 'textContent') {
        el.textContent = attrs[key];
      } else if (key === 'innerHTML') {
        el.innerHTML = attrs[key];
      } else if (key === 'style' && typeof attrs[key] === 'object') {
        for (var s in attrs[key]) {
          el.style[s] = attrs[key][s];
        }
      } else if (key.indexOf('on') === 0 && typeof attrs[key] === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
      } else {
        el.setAttribute(key, attrs[key]);
      }
    }
  }
  var args = Array.prototype.slice.call(arguments, 2);
  for (var i = 0; i < args.length; i++) {
    var child = args[i];
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  return el;
}

// ============================================================================
// 表格构建
// ============================================================================

/**
 * 快速创建表格
 * @param {string[][]} data - 二维数组 [[cell1, cell2, ...], ...]
 * @param {object} [opts]
 * @param {string} [opts.className] - table 的 class
 * @param {string[]} [opts.headers] - 表头
 * @param {function} [opts.onRowClick] - 行点击回调 (rowIndex, trElement)
 * @returns {HTMLTableElement}
 */
function buildTable(data, opts) {
  opts = opts || {};
  var table = document.createElement('table');
  if (opts.className) table.className = opts.className;

  if (opts.headers) {
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    for (var i = 0; i < opts.headers.length; i++) {
      var th = document.createElement('th');
      th.textContent = opts.headers[i];
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  var tbody = document.createElement('tbody');
  for (var r = 0; r < data.length; r++) {
    var row = document.createElement('tr');
    for (var c = 0; c < data[r].length; c++) {
      var td = document.createElement('td');
      td.textContent = data[r][c] != null ? String(data[r][c]) : '';
      row.appendChild(td);
    }
    if (opts.onRowClick) {
      (function(idx) {
        row.addEventListener('click', function() {
          opts.onRowClick(idx, row);
        });
      })(r);
      row.style.cursor = 'pointer';
    }
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  return table;
}

// ============================================================================
// 表单操作
// ============================================================================

/**
 * 收集表单数据
 * @param {Element} formEl - 表单容器
 * @param {string[]} fields - 字段名数组
 * @returns {object}
 */
function collectForm(formEl, fields) {
  var data = {};
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var el = formEl.querySelector('[name="' + f + '"]');
    if (el) {
      data[f] = el.value;
    }
  }
  return data;
}

/**
 * 填充表单
 * @param {Element} formEl
 * @param {object} data
 */
function fillForm(formEl, data) {
  for (var key in data) {
    var el = formEl.querySelector('[name="' + key + '"]');
    if (el) {
      el.value = data[key] != null ? data[key] : '';
    }
  }
}

/**
 * 重置表单
 * @param {Element} formEl
 */
function resetForm(formEl) {
  var inputs = formEl.querySelectorAll('input, select, textarea');
  for (var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false;
    } else {
      el.value = '';
    }
  }
}

// ============================================================================
// 显示/隐藏
// ============================================================================

/**
 * 显示元素
 * @param {Element|string} el
 * @param {string} [display='block']
 */
function show(el, display) {
  el = typeof el === 'string' ? $(el) : el;
  if (el) el.style.display = display || 'block';
}

/**
 * 隐藏元素
 * @param {Element|string} el
 */
function hide(el) {
  el = typeof el === 'string' ? $(el) : el;
  if (el) el.style.display = 'none';
}

/**
 * 切换元素可见性
 * @param {Element|string} el
 * @param {boolean} visible
 * @param {string} [display='block']
 */
function toggle(el, visible, display) {
  el = typeof el === 'string' ? $(el) : el;
  if (!el) return;
  el.style.display = visible ? (display || 'block') : 'none';
}

// ============================================================================
// 事件委托
// ============================================================================

/**
 * 事件委托
 * @param {Element} parent
 * @param {string} eventType
 * @param {string} selector
 * @param {function} handler
 */
function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, function(e) {
    var target = e.target;
    while (target && target !== parent) {
      if (target.matches(selector)) {
        handler.call(target, e);
        return;
      }
      target = target.parentElement;
    }
  });
}

// ============================================================================
// 节流与防抖
// ============================================================================

/**
 * 防抖
 * @param {function} func
 * @param {number} wait - 毫秒
 * @returns {function}
 */
function debounce(func, wait) {
  var timer = null;
  return function() {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() {
      func.apply(ctx, args);
    }, wait);
  };
}

/**
 * 节流
 * @param {function} func
 * @param {number} limit - 毫秒
 * @returns {function}
 */
function throttle(func, limit) {
  var inThrottle = false;
  return function() {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}
