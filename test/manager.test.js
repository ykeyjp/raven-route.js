import test from 'ava';
import raven from '@ykey/raven';
import manager from '../lib/manager';

require('browser-env')({url: 'http://localhost/foo/bar'});

test.serial('not started exception', t => {
  t.throws(() => {
    manager.go('/');
  });
  t.throws(() => {
    manager.exec('/');
  });
  t.throws(() => {
    manager.current();
  });
});

test.serial('setup', t => {
  manager.setup();
  manager.setup({});
  manager.setup({base: '/'});
  t.is(manager.env.base, '/');
});

test.serial('base', t => {
  manager.base('/foo');
  t.is(manager.env.base, '/foo');
});

test.serial('start', t => {
  t.notThrows(() => {
    manager.start();
  });
  t.throws(() => {
    manager.start();
  });
  t.is(manager.env.current, '/bar');
});

test.serial('go', t => {
  manager.go('/path-go');
  t.is(manager.env.current, '/path-go');
  t.is(manager.current(), '/path-go');
});

test.serial('exec', t => {
  manager.exec('/path-exec');
  t.is(manager.env.current, '/path-exec');
  t.is(manager.current(), '/path-exec');
});

test.serial('mount', async t => {
  manager.base('');
  document.body.innerHTML = '<app></app>';
  raven.tag('page1', {tmpl: '<div>page1</div>'});
  raven.tag('page2', {tmpl: '<div :id="$id" :data="$data">page2</div>'});
  raven.tag('app', {
    tmpl: `<router :if="$visible" base="/foo">
      <router:map path="/path1" to="page1" />
      <router:map path="/path2/:id" to="page2" :params="{data: $data}" />
      </router>`,
    init() {
      this.$.visible = true;
      this.$.data = 'foo';
    },
  });
  const el = document.querySelector('app');
  const tag = await raven.mount('app');
  t.is(el.outerHTML, '<app></app>');
  await manager.go('/foo/path1');
  t.is(el.outerHTML, '<app><div>page1</div></app>');
  await manager.go('/foo/path2/1');
  t.is(el.outerHTML, '<app><div id="1" data="foo">page2</div></app>');
  await tag.update({data: 'bar'});
  t.is(el.outerHTML, '<app><div id="1" data="bar">page2</div></app>');
  await tag.update({visible: false});
  t.is(el.outerHTML, '<app></app>');
});

test.serial('stop', t => {
  t.notThrows(() => {
    manager.stop();
  });
  t.throws(() => {
    manager.stop();
  });
});
