class Pattern {
  /**
   * @param {string} path
   */
  constructor(path) {
    this.path = path;
    this.parser = createParser(path);
  }

  match(url) {
    if (this.parser) {
      return this.parser(url);
    }
    if (url === this.path) {
      return {};
    }
    return false;
  }
}
/**
 * @param {string} path
 */
function createParser(path) {
  if (path.indexOf(':') !== -1) {
    return withParams(path);
  }
  if (path.endsWith('...')) {
    return endAny(path);
  }
  return null;
}

/**
 * @param {string} path
 */
function endAny(path) {
  path = path.slice(0, path.length - 3);
  const re = new RegExp('^' + path + '(.*)$', '');
  return generateWildcardParser(re);
}

/**
 * @param {RegExp} re
 */
function generateWildcardParser(re) {
  return function(url) {
    const match = re.exec(url);
    if (match) {
      return {params: match[1].split('/').map(cast)};
    }
    return false;
  };
}

/**
 * @param {string} path
 */
function withParams(path) {
  const named = [];
  const parts = path.split('/').map(part => {
    if (part.startsWith(':')) {
      named.push(part.slice(1));
      return '([^/]+)';
    } else if (part === '...') {
      named.push('...');
      return '?(.*)$';
    }
    return part;
  });
  const re = new RegExp('^' + parts.join('/'));
  return generateParamsParser(re, named);
}

/**
 * @param {RegExp} re
 * @param {string[]} named
 */
function generateParamsParser(re, named) {
  return function(url) {
    const match = re.exec(url);
    if (match) {
      const params = {};
      named.forEach((name, i) => {
        if (name === '...') {
          if (match[i + 1].length === 0) {
            params.params = [];
          } else {
            params.params = match[i + 1].split('/').map(cast);
          }
        } else {
          params[name] = cast(match[i + 1]);
        }
      });
      return params;
    }
    return false;
  };
}

/**
 * @param {string} val
 * @return {string|number|boolean|null|undefined}
 */
function cast(val) {
  const str = val.toLowerCase();
  if (str === 'true') {
    return true;
  } else if (str === 'false') {
    return false;
  } else if (str === 'null') {
    return null;
  } else if (str === 'undefined') {
    return undefined;
  } else if (/^[1-9]?[0-9]+$/.test(str)) {
    return parseInt(str, 10);
  } else if (/^[1-9]?[0-9]+\.[0-9]+$/.test(str)) {
    return parseFloat(str);
  }
  return val;
}

module.exports = Pattern;
