import test from 'ava';
import deepImmutable, {
  merge,
  replace,
  select,
  setIn,
} from './index.js';

test('can update a top level variable', (t) => {
  const updated = deepImmutable(
    { text: 'hello' },
    merge({ text: 'goodbye' }),
  );

  t.deepEqual(updated, { text: 'goodbye' });
});

test('merge preserves items', (t) => {
  const updated = deepImmutable(
    { foo: [], text: 'hello' },
    merge({ text: 'goodbye' }),
  );

  t.deepEqual(updated, { foo: [], text: 'goodbye' });
});

test('replace completely changes the object', (t) => {
  const updated = deepImmutable(
    { foo: [], text: 'hello' },
    replace({ done: true }),
  );

  t.deepEqual(updated, { done: true });
});

test('can update a single value in an array', (t) => {
  const updated = deepImmutable(
    [10, 9, 8, 7],
    setIn(1, 999),
  );

  t.deepEqual(updated, [10, 999, 8, 7]);
});

test('can select deeply and update an item', (t) => {
  const updated = deepImmutable(
    { a: { b: { c: true } } },
    select('a.b.c'.split('.'), replace(false)),
  );

  t.deepEqual(updated, { a: { b: { c: false } } });
});

test('can replace with callback', (t) => {
  const updated = deepImmutable(
    [10, 9, 8, 7],
    setIn(1, replace((old) => old + 1)),
  );

  t.deepEqual(updated, [10, 10, 8, 7]);
});
