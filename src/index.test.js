import test from 'ava';
import deepImmutable, {
  merge,
  concat,
  replace,
  select,
  selectAll,
  setIn,
  collect,
  map,
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
    select('a.b.c', replace(false)),
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

test('can compose multiple deep updates together', (t) => {
  const state = deepImmutable({
    a: {
      b: true,
      c: [1, 2, 3],
    },
    we: {
      are: {
        going: 'deep',
      },
    },
  }, selectAll({
    'we.are': setIn('going', replace({ further: { than: 'before' } })),
    'a': setIn('c', map(v => v * 2)),
  }));

  t.deepEqual(state, {
    a: {
      b: true,
      c: [2, 4, 6],
    },
    we: {
      are: {
        going: { further: { than: 'before' } },
      },
    },
  });
});

test('can perform multiple updates on a single point', (t) => {
  const state = deepImmutable({ value: 1 }, select('value', collect([
    replace(v => v * 5),
    replace(v => v - 1),
    replace(v => v * v),
  ])));

  t.deepEqual(state, { value: 16 });
});

test('can concat arrays', (t) => {
  const state = deepImmutable([1, 2, 3], concat([4, 5, 6]));

  t.deepEqual(state, [1, 2, 3, 4, 5, 6]);
});
