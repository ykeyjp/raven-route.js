export interface IPatternResult {
  [key: string]: string | number | boolean | null | undefined | any[];
  params?: (string | number | boolean | null | undefined)[];
}

type GeneratorFunc = (url: string) => IPatternResult | false;

export default class Pattern {
  private path: string;
  private parser: GeneratorFunc | null;

  constructor(path: string) {
    this.path = path;
    this.parser = createParser(path);
  }

  match(url: string): IPatternResult | false {
    if (this.parser) {
      return this.parser(url);
    }
    if (url === this.path) {
      return {};
    }
    return false;
  }
}

function createParser(path: string): GeneratorFunc | null {
  if (path.indexOf(':') !== -1) {
    return withParams(path);
  }
  if (path.endsWith('...')) {
    return endAny(path);
  }
  return null;
}

function endAny(path: string): GeneratorFunc {
  path = path.slice(0, path.length - 3);
  const re = new RegExp('^' + path + '(.*)$', '');
  return generateWildcardParser(re);
}

function generateWildcardParser(re: RegExp): GeneratorFunc {
  return function(url) {
    const match = re.exec(url);
    if (match) {
      return {params: match[1].split('/').map(cast)};
    }
    return false;
  };
}

function withParams(path: string): GeneratorFunc {
  const named: string[] = [];
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

function generateParamsParser(re: RegExp, named: string[]): GeneratorFunc {
  return function(url: string) {
    const match = re.exec(url);
    if (match) {
      const params: IPatternResult = {};
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

function cast(val: string): string | number | boolean | null | undefined {
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
