import test from 'ava';
import {
  compose,
  merge,
  concat,
  replace,
  select,
  selectAll,
  setIn,
  collect,
  map,
  splice,
  range,
} from './index.js';

test('can update a top level variable', (t) => {
  const state = compose(
    { text: 'hello' },
    merge({ text: 'goodbye' }),
  );

  t.deepEqual(state, { text: 'goodbye' });
});

test('merge preserves items', (t) => {
  const state = compose(
    { foo: [], text: 'hello' },
    merge({ text: 'goodbye' }),
  );

  t.deepEqual(state, { foo: [], text: 'goodbye' });
});

test('replace completely changes the object', (t) => {
  const state = compose(
    { foo: [], text: 'hello' },
    replace({ done: true }),
  );

  t.deepEqual(state, { done: true });
});

test('can update a single value in an array', (t) => {
  const state = compose(
    [10, 9, 8, 7],
    setIn(1, 999),
  );

  t.deepEqual(state, [10, 999, 8, 7]);
});

test('can select deeply and update an item', (t) => {
  const state = compose(
    { a: { b: { c: true } } },
    select('a.b.c', replace(false)),
  );

  t.deepEqual(state, { a: { b: { c: false } } });
});

test('can replace with callback', (t) => {
  const state = compose(
    [10, 9, 8, 7],
    setIn(1, replace((old) => old + 1)),
  );

  t.deepEqual(state, [10, 10, 8, 7]);
});

test('can compose multiple deep updates together', (t) => {
  const state = compose({
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
  const state = compose({ value: 1 }, select('value', collect([
    replace(v => v * 5),
    replace(v => v - 1),
    replace(v => v * v),
  ])));

  t.deepEqual(state, { value: 16 });
});

test('can concat arrays', (t) => {
  const state = compose([1, 2, 3], concat([4, 5, 6]));

  t.deepEqual(state, [1, 2, 3, 4, 5, 6]);
});

test('can splice into an array to add elements', (t) => {
  const state = compose([1, 2, 5, 6], splice(2, 0, [3, 4]));

  t.deepEqual(state, [1, 2, 3, 4, 5, 6]);
});

test('can splice to delete items in an array', (t) => {
  const state = compose([1, 2, 999, 1000, 3, 4], splice(2, 2));

  t.deepEqual(state, [1, 2, 3, 4]);
});

test('can operate on a range of an array', (t) => {
  const state = compose([1, 2, 3, 4, 5, 6], range(1, 3, map((value) => value * 2)));

  t.deepEqual(state, [1, 4, 6, 8, 5, 6]);
});

test('can use range to delete items in an array', (t) => {
  const state = compose([1, 2, 99, 100, 3, 4], range(2, 2, replace([])));

  t.deepEqual(state, [1, 2, 3, 4]);
});

test('can use range to add items', (t) => {
  const state = compose([1, 2, 5, 6], range(2, 0, replace([3, 4])));

  t.deepEqual(state, [1, 2, 3, 4, 5, 6]);
});
