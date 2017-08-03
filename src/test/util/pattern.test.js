import test from 'ava';
import Pattern from '../../lib/util/pattern';

test('static', t => {
  const pattern = new Pattern('/path/to/uri');
  t.deepEqual(pattern.match('/path/to/uri'), {});
  t.is(pattern.match('/path/to/url'), false);
});

test('wildcard', t => {
  const pattern = new Pattern('/path/to/...');
  t.deepEqual(pattern.match('/path/to/uri'), {params: ['uri']});
  t.deepEqual(pattern.match('/path/to/uri/sub'), {params: ['uri', 'sub']});
});

test('params', t => {
  const pattern = new Pattern('/path/to/:id/:name');
  t.deepEqual(pattern.match('/path/to/1/foo'), {id: 1, name: 'foo'});
  t.deepEqual(pattern.match('/path/to/2/bar'), {id: 2, name: 'bar'});
  t.deepEqual(pattern.match('/path/to/3/'), false);
  t.deepEqual(pattern.match('/path/to/'), false);
});

test('params + wildcard', t => {
  const pattern = new Pattern('/path/to/:id/:name/...');
  t.deepEqual(pattern.match('/path/to/0/baz/data'), {
    id: 0,
    name: 'baz',
    params: ['data'],
  });
  t.deepEqual(pattern.match('/path/to/1/foo'), {
    id: 1,
    name: 'foo',
    params: [],
  });
  t.deepEqual(pattern.match('/path/to/2/bar'), {
    id: 2,
    name: 'bar',
    params: [],
  });
  t.deepEqual(pattern.match('/path/to/3/'), false);
  t.deepEqual(pattern.match('/path/to/'), false);
});
