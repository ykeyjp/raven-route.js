import * as raven from '@ykey/raven';
import Pattern from '../util/pattern';

export default class Route {
  constructor(options) {
    this.parent = options.parent;
    this.$ = {};
    this.component = null;
  }

  init() {
    if (this.$.path) {
      this.pattern = new Pattern(this.$.path);
    }
  }

  /**
   * @param {string} path
   * @return {PromiseLike|false}
   */
  exec(path) {
    if (this.pattern) {
      const result = this.pattern.match(path);
      if (result === false) {
        if (this.component) {
          this.component.dispose();
          this.component = null;
        }
        return false;
      }
      if (this.component) {
        const params = Object.assign(this.$, this.$.params || {}, result);
        return this.component.update(params);
      }
      if (raven.utils.componentManager.has(this.$.to)) {
        const info = raven.utils.componentManager.get(this.$.to);
        const Base = info.base;
        this.component = new Base(Object.assign({parent: this.parent}, info));
        Object.assign(this.component.$, this.$.params || {}, result);
        this.component.$yield = [];
        if (info.init instanceof Function) {
          info.init.call(this.component);
        }
        return this.component.render();
      }
    }
    return false;
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
    return Promise.resolve(this);
  }

  dispose() {
    this.parent = null;
    if (this.component) {
      this.component.dispose();
      this.component = null;
    }
  }
}
