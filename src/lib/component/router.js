const manager = require('../manager');
const Route = require('./route');

class Router {
  constructor(options) {
    this.parent = options.parent;
    this.$ = {};
    this.routes = [];
    this.dummy = document.createTextNode('');
  }

  init() {
    manager.registerRouter(this);
  }

  /**
   * @param {string} path
   * @param {boolean} isReturn
   * @return {PromiseLike}
   */
  exec(path, isReturn = false) {
    if (!Array.isArray(this.$yield)) {
      return Promise.resolve([]);
    }
    if (this.$.base) {
      if (!path.startsWith(this.$.base)) {
        return Promise.resolve([]);
      }
      path = path.slice(this.$.base.length);
    }
    const routes = this.$yield.filter(r => r instanceof Route);
    for (let i = 0, l = routes.length; i < l; ++i) {
      const defer = routes[i].exec(path);
      if (defer) {
        return defer.then(nodes => {
          if (!isReturn && this.dummy.parentElement) {
            if (Array.isArray(nodes)) {
              nodes.forEach(node => {
                this.dummy.parentElement.insertBefore(node, this.dummy);
              });
            } else {
              this.dummy.parentElement.insertBefore(nodes, this.dummy);
            }
          }
          return nodes;
        });
      }
    }
    Promise.resolve([]);
  }

  /**
   * @param {any} $
   * @return {PromiseLike}
   */
  update($) {
    Object.assign(this.$, $);
    return this.render();
  }

  /**
   * @return {PromiseLike}
   */
  render() {
    return this.exec(manager.current(), true).then(nodes => {
      if (Array.isArray(nodes)) {
        nodes.push(this.dummy);
      } else {
        nodes = [nodes, this.dummy];
      }
      return nodes;
    });
  }

  dispose() {
    manager.unregisterRouter(this);
    this.routes = [];
    this.parent = null;
  }
}

module.exports = Router;
