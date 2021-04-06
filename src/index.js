export const composable = (state, immutableAction) => typeof immutableAction === 'function'
  ? immutableAction(state)
  : immutableAction;

export const merge = (immutableAction) => (state) => ({
  ...state,
  ...composable(state, immutableAction),
});

export const concat = (immutableAction) => (state) => state
  .concat(composable(state, immutableAction));

export const setIn = (key, immutableAction) => (state) => {
  const value = Array.isArray(state)
    ? [...state]
    : { ...state };

  value[key] = composable(value[key], immutableAction);

  return value;
};

export const replace = (object) => (previous) => typeof object === 'function'
  ? object(previous)
  : object;

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

export const select = (path, immutableAction) => selectArray(
  path.split('.'),
  immutableAction,
);

export const selectAll = (pathsWithActions) => (state) => {
  return Object.keys(pathsWithActions).reduce((memo, path) => {
    return composable(memo, select(path, pathsWithActions[path]));
  }, state);
};

export const collect = (immutableActions) => (state) => {
  return immutableActions.reduce(
    (memo, action) => composable(memo, action),
    state,
  );
};

export const map = (fn) => replace(
  array => array.map((value, index) => composable(value, fn(value, index)))
);

export const range = (start, length, immutableAction) => state => (
  state.slice(0, start)
    .concat(composable(state.slice(start, start + length), immutableAction))
    .concat(state.slice(start + length))
);
