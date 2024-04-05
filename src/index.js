/**
 * Use exported functions to create and compose immutable updates.
 *
 * @name composable
 * @summary Compose a new immutable update.
 * @example
 * import { composable, replace } from 'composable-state';
 * const newState = composable('bar', replace('foo'));
 * console.log(newState); // 'foo'
 * @example
 * import { composable, select, replace } from 'composable-state';
 * const newState = composable(
 *   { foo: { bar: true } },
 *   select('foo.bar', replace(old => !old)),
 * );
 * console.log(newState); // { foo: { bar: false } }
 * @param {Object|String|Number|Boolean} state
 * @param {Function} immutableAction
 * @return {Object}
 */
export const composable = (state, immutableAction) => typeof immutableAction === 'function'
  ? immutableAction(state)
  : immutableAction;

/**
 * @name merge
 * @summary Immutable action to merge current context with an object
 * @example
 * import { composable, merge } from 'composable-state';
 * const newState = composable(
 *   { foo: 'bar' },
 *   merge({ fizz: 'buzz' }),
 * );
 * console.log(newState); // { foo: 'bar', fizz: 'buzz' }
 * @param {Function} immutableAction
 * @return {Function}
 */
export const merge = (immutableAction) => (state) => ({
  ...state,
  ...composable(state, immutableAction),
});

/**
 * There is no type checking, but the current context must be an array.
 * Most JS engines should throw an error around this, which will be a good hint.
 *
 * @name concat
 * @summary Immutable action to concatinate an array
 * @example
 * import { composable, concat } from 'composable-state';
 * const newState = composable(
 *   [1, 2, 3],
 *   concat([4, 5, 6]),
 * );
 * console.log(newState); // [1, 2, 3, 4, 5, 6]
 * @param {Function} immutableAction
 * @return {Function}
 */
export const concat = (immutableAction) => (state) => state
  .concat(composable(state, immutableAction));

/**
 * This is effectively the same as selecting into an object or array and replacing a value.
 * The main objective is to replace a one off value without adding additional select and replace immutable actions directly into your update.
 *
 * @name setIn
 * @summary Runs an immutable update into an object without changing the context
 * @example
 * import { composable, setIn } from 'composable-state';
 * const newState = composable(
 *   { name: 'Bob' },
 *   setIn('name', 'Alex'),
 *   // Long form: select('name', replace('Alex'))
 * );
 * console.log(newState); // { name: 'Alex' }
 * @param {Function} immutableActions
 * @return {Function}
 */
export const setIn = (key, immutableAction) => (state) => {
  const value = Array.isArray(state)
    ? [...state]
    : { ...state };

  value[key] = composable(value[key], immutableAction);

  return value;
};

/**
 * There are two variants of how replace works.
 * The first is passing a strict value, like a string, number, or boolean, and the old value will simply be overwritten.
 * The second is passing a function, which passes the old value, allowing you to perform a calculation using the old value.
 * This is the only immutable action that cannot further compose a value
 *
 * @name replace
 * @summary Replace the value at the current state context
 * @example
 * import { composable, replace } from 'composable-state';
 * const newState = composable(1, replace(999));
 * console.log(newState); // 999
 * @example
 * import { composable, replace } from 'composable-state';
 * const newState = composable(1, replace((old) => old + 1));
 * console.log(newState); // 2
 * @param {any} update
 * @return {Function}
 */
export const replace = (update) => (state) => typeof update === 'function'
  ? update(state)
  : update;

/**
 * Dig into an object, where each element in the array is a child key.
 * This will change the current state context for any child immutable action.
 *
 * @name selectArray
 * @summary Change the state context for an immutable action
 * @example
 * import { composable, selectArray, replace } from 'composable-state';
 * const newState = composable(
 *   { foo: { bar: 123 } },
 *   selectArray(
 *     ['foo', 'bar'],
 *     replace(456),
 *   )
 * );
 * console.log(newState); // { foo: { bar: 456 } }
 * @param {array} path
 * @param {Function} immutableAction
 * @return {Function}
 */
export const selectArray = (path, immutableAction) => (state) => {
  if (path.length === 0) {
    return composable(state, immutableAction);
  }

  const key = path[0];

  return composable(state, setIn(
    key,
    selectArray(path.slice(1), immutableAction)
  ));
};

const pathSplitRegexp = /(\w+|\[[^\]]+\])/gm;

/**
 * A utility function to convert a string representation of a path to an array.
 *
 * @name pathSplit
 * @summary Convert string path to an array of keys
 * @example
 * import { composable, pathSplit } from 'composable-state';
 * console.log(pathSplit('foo.bar[key.with.dots].fizz[buzz]')); // ['foo', 'bar', 'key.with.dots', 'fizz', 'buzz']
 * @param {string} path
 * @return {array}
 */
export const pathSplit = (path) => Array.from(path.match(pathSplitRegexp))
  .map(entry => entry.replace('[', '').replace(']', ''));

/**
 * Like selectArray, but uses the string-notation for a path.
 * Internally, uses pathSplit and selectArray.
 * This will change the current state context for any child immutable action.
 *
 * @name select
 * @summary Dig into an object to perform actions on a key
 * @example
 * import { composable, select, replace } from 'composable-state';
 * const newState = composable(
 *   { foo: { bar: 123 } },
 *   selectArray(
 *     'foo.bar',
 *     replace(456),
 *   )
 * );
 * console.log(newState); // { foo: { bar: 456 } }
 * @param {array} path
 * @param {Function} immutableAction
 * @return {Function}
 */
export const select = (path, immutableAction) => selectArray(
  pathSplit(path),
  immutableAction,
);

/**
 * Like select, but instead of a single path, you may pass an object of { path1: immutableAction, path2: immutableAction, ... }
 * Internally, uses pathSplit and select.
 * This will change the state contexts for each object key.
 *
 * @name selectAll
 * @summary Dig into an object to perform actions on each path.
 * @example
 * import { composable, selectAll, replace } from 'composable-state';
 * const newState = composable(
 *   { foo: { bar: 123 }, count: 1 },
 *   selectAll({
 *    'foo.bar': replace(456),
 *    'count': replace(old => old + 1),
 *   }),
 * );
 * console.log(newState); // { foo: { bar: 456 }, count: 2 }
 * @param {object} pathsWithActions
 * @return {Function}
 */
export const selectAll = (pathsWithActions) => (state) => Object
  .keys(pathsWithActions)
  .reduce(
    (memo, path) => composable(memo, select(path, pathsWithActions[path])),
    state,
  );

/**
 * Run a list of immutable actions from the current state context.
 *
 * @name collect
 * @summary From the current state context, run an array of actions
 * @example
 * import { composable, collect, replace } from 'composable-state';
 * const numbersToAdd = [10, -3];
 * const newState = composable(
 *   { foo: 'test', count: 1 },
 *   collect([
 *     select('foo', replace('bar')),
 *     select('count', collect(
 *       numbersToAdd.map(number => replace(old => old + number)))
 *     ),
 *   ]),
 * );
 * console.log(newState); // { foo: 'bar', count: 8 }
 * @param {array} immutableActions
 * @return {Function}
 */
export const collect = (immutableActions) => (state) => immutableActions
  .reduce(
    (memo, action) => composable(memo, action),
    state,
  );

/**
 * Run an Array#map() with an immutable action in the current state context.
 * This should only be used if you know the state context is an array.
 *
 * @name map
 * @summary Run an immutable action transform each array item.
 * @example
 * import { composable, map, replace } from 'composable-state';
 * const newState = composable(
 *   [1, 2, 3],
 *   map(replace((old) => old * 10)),
 * );
 * console.log(newState); // [10, 20, 30]
 * @param {Function} immutableAction
 * @return {Function}
 */
export const map = (fn) => replace(
  array => array.map((value, index) => composable(value, fn(value, index)))
);

/**
 * 
 * This should only be used if you know the state context is an array.
 *
 * @name range
 * @summary Run an immutable action transform each array item.
 * @example
 * import { composable, map, replace } from 'composable-state';
 * const newState = composable(
 *   [1, 2, 3],
 *   map(replace((old) => old * 10)),
 * );
 * console.log(newState); // [10, 20, 30]
 * @param {Function} immutableAction
 * @return {Function}
 */
export const range = (start, length, immutableAction) => state => (
  state.slice(0, start)
    .concat(composable(state.slice(start, start + length), immutableAction))
    .concat(state.slice(start + length))
);
