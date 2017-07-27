const raven = require('@ykey/raven');
const Router = require('./component/router');
const Route = require('./component/route');

const env = {
  base: '',
  started: false,
  current: '',
  routers: [],
};

function setup(options) {
  if (options) {
    base(options.base || '');
  }
  try {
    raven.tag('router', {base: Router, init: Router.prototype.init});
    raven.tag('router:map', {base: Route, init: Route.prototype.init});
  } catch (err) {}
}

/**
 * @param {string} path
 */
function base(path) {
  env.base = path;
}

/**
 * @param {string} path
 * @return {PromiseLike}
 */
function go(path) {
  if (!env.started) {
    throw new Error('not started.');
  }
  window.history.pushState({raven: true}, '', env.base + path);
  return exec(path);
}

/**
 * @param {string} path
 * @return {PromiseLike}
 */
function exec(path) {
  if (!env.started) {
    throw new Error('not started.');
  }
  env.current = path;
  return Promise.all(env.routers.map(router => router.exec(env.current)));
}

/**
 * @return {string}
 */
function current() {
  if (!env.started) {
    throw new Error('not started.');
  }
  return env.current;
}

function start() {
  if (env.started) {
    throw new Error('already started.');
  }
  env.started = true;
  window.addEventListener('popstate', _currentRouteExecute, false);
  window.addEventListener('click', _navigateListener, false);
  if (!window.history.state || !window.history.state.raven) {
    window.history.replaceState({raven: true}, '');
  }
  _currentRouteExecute();
}

function stop() {
  if (!env.started) {
    throw new Error('not started.');
  }
  env.started = false;
  window.removeEventListener('popstate', _currentRouteExecute, false);
  window.removeEventListener('click', _navigateListener, false);
}

function _navigateListener(event) {
  if (
    event.target instanceof HTMLElement &&
    event.target.hasAttribute('href')
  ) {
    const href = event.target.getAttribute('href');
    event.preventDefault();
    go(href);
  }
}

function _currentRouteExecute() {
  const path = window.location.pathname;
  if (path.startsWith(env.base)) {
    exec(path.slice(env.base.length));
  }
}

function registerRouter(router) {
  if (env.routers.indexOf(router) === -1) {
    env.routers.push(router);
  }
}

function unregisterRouter(router) {
  const index = env.routers.indexOf(router);
  if (index !== -1) {
    env.routers.splice(index, 1);
  }
}

module.exports.env = env;
module.exports.setup = setup;
module.exports.base = base;
module.exports.go = go;
module.exports.exec = exec;
module.exports.current = current;
module.exports.start = start;
module.exports.stop = stop;
module.exports.registerRouter = registerRouter;
module.exports.unregisterRouter = unregisterRouter;
