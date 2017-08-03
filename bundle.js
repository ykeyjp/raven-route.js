const fs = require('fs');
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('uglify-js');
const plugins = [resolve(), commonjs(), buble()];
const moduleName = 'raven.route';
const config = {
  entry: 'es6/index.js',
  dest: 'dist/raven.route.js',
  format: 'iife',
  moduleName: moduleName,
  context: 'window',
  sourceMap: false,
  plugins: plugins,
};
rollup
  .rollup(config)
  .then(bundle => {
    return bundle
      .generate({
        format: 'iife',
        moduleName: config.moduleName,
      })
      .then(result => {
        const minify = uglify.minify(result.code, {
          sourceMap: {
            filename: `${moduleName}.js`,
            url: `${moduleName}.js.map`,
          },
        });
        !fs.existsSync('dist') && fs.mkdirSync('dist');
        fs.writeFileSync(`dist/${moduleName}.js`, result.code);
        fs.writeFileSync(`dist/${moduleName}.min.js`, minify.code);
        fs.writeFileSync(`dist/${moduleName}.js.map`, minify.map);
      });
  })
  .catch(err => console.log(err));
