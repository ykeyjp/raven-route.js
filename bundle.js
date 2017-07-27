const fs = require('fs');
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-re');
const uglify = require('uglify-js');
const plugins = [
  buble({
    target: {
      chrome: 52,
      firefox: 48,
      safari: 9,
      ie: 11,
      edge: 12,
      node: 6,
    },
  }),
  resolve({
    module: true,
    jsnext: true,
    main: true,
  }),
  replace({
    patterns: [
      {
        test: "require('@ykey/raven');",
        replace: 'window.raven;',
      },
    ],
  }),
  commonjs(),
];
const moduleName = 'raven.route';
const config = {
  entry: 'lib/index.js',
  dest: 'dist/raven-route.js',
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
        exports: 'default',
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
