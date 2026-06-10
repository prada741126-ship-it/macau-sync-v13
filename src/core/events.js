/**
 * v13 Event Bus — 核心解耦机制
 * 
 * 依赖: 无（零依赖模块）
 * 影响: 全系统所有模块
 * 
 * 设计原则:
 * - 发布-订阅模式，完全解耦模块
 * - A 只 emit 事件，B 只 on 事件，互不直接调用
 * - 错误在单个 handler 中不会影响其他 handler
 * - 开发模式下记录所有事件流用于调试
 * 
 * 使用方式:
 *   Events.on('tx:created', function(tx) { renderTable(); });
 *   Events.emit('tx:created', newTx);
 *   Events.off('tx:created', handlerFn);
 */

var Events = (function() {
  'use strict';

  // 事件监听器映射: { eventName: [handler1, handler2, ...] }
  var _listeners = {};

  // 是否开启调试日志
  var _debug = false;

  /**
   * 订阅事件
   * @param {string} event - 事件名 (如 'tx:created')
   * @param {function} handler - 回调函数
   * @returns {function} 取消订阅函数
   */
  function on(event, handler) {
    if (!_listeners[event]) {
      _listeners[event] = [];
    }
    _listeners[event].push(handler);
    if (_debug) console.log('[v13:events] on:', event, '(total ' + _listeners[event].length + ')');

    // 返回取消订阅函数
    return function() {
      off(event, handler);
    };
  }

  /**
   * 取消订阅
   * @param {string} event
   * @param {function} handler - 如果省略，取消该事件的所有监听器
   */
  function off(event, handler) {
    if (!_listeners[event]) return;
    if (!handler) {
      delete _listeners[event];
      if (_debug) console.log('[v13:events] off ALL:', event);
      return;
    }
    for (var i = _listeners[event].length - 1; i >= 0; i--) {
      if (_listeners[event][i] === handler) {
        _listeners[event].splice(i, 1);
      }
    }
    if (_listeners[event].length === 0) {
      delete _listeners[event];
    }
    if (_debug) console.log('[v13:events] off:', event);
  }

  /**
   * 发布事件
   * @param {string} event - 事件名
   * @param {...*} args - 传递给 handler 的参数
   */
  function emit(event) {
    var handlers = _listeners[event];
    if (!handlers || handlers.length === 0) {
      if (_debug) console.log('[v13:events] emit (no listeners):', event);
      return;
    }
    if (_debug) console.log('[v13:events] emit:', event, '(to ' + handlers.length + ' listeners)');

    // 复制参数（去掉 event 名）
    var args = Array.prototype.slice.call(arguments, 1);

    // 逐个执行，handler 中的错误不影响其他 handler
    for (var i = 0; i < handlers.length; i++) {
      try {
        handlers[i].apply(null, args);
      } catch (e) {
        console.error('[v13:events] handler error for', event + ':', e);
      }
    }
  }

  /**
   * 一次性订阅
   * @param {string} event
   * @param {function} handler
   */
  function once(event, handler) {
    var wrapper = function() {
      handler.apply(null, arguments);
      off(event, wrapper);
    };
    on(event, wrapper);
  }

  /**
   * 开启/关闭调试
   * @param {boolean} enabled
   */
  function debug(enabled) {
    _debug = !!enabled;
  }

  /**
   * 查看所有已注册的事件（调试用）
   * @returns {object}
   */
  function listAll() {
    var result = {};
    for (var evt in _listeners) {
      result[evt] = _listeners[evt].length;
    }
    return result;
  }

  /**
   * 移除所有监听器（仅用于测试/重置）
   */
  function reset() {
    _listeners = {};
    if (_debug) console.log('[v13:events] reset: all listeners cleared');
  }

  // 公开 API
  return {
    on:       on,
    off:      off,
    emit:     emit,
    once:     once,
    debug:    debug,
    listAll:  listAll,
    reset:    reset,
  };
})();
