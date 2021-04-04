export const compose = (state, immutableAction) => typeof immutableAction === 'function'
  ? immutableAction(state)
  : immutableAction;

export const merge = (immutableAction) => (state) => ({
  ...state,
  ...compose(state, immutableAction),
});

export const concat = (immutableAction) => (state) => state
  .concat(compose(state, immutableAction));

export const setIn = (key, immutableAction) => (state) => {
  const value = Array.isArray(state)
    ? [...state]
    : { ...state };

  value[key] = compose(value[key], immutableAction);

  return value;
};

export const replace = (object) => (previous) => typeof object === 'function'
  ? object(previous)
  : object;

export const selectArray = (path, immutableAction) => (state) => {
  if (path.length === 0) {
    return compose(state, immutableAction);
  }

  const key = path[0];

  return compose(state, setIn(
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
    return compose(memo, select(path, pathsWithActions[path]));
  }, state);
};

export const collect = (immutableActions) => (state) => {
  return immutableActions.reduce(
    (memo, action) => compose(memo, action),
    state,
  );
};

export const map = (fn) => replace(
  array => array.map((value, index) => compose(value, fn(value, index)))
);

export const range = (start, length, immutableAction) => state => (
  state.slice(0, start)
    .concat(compose(state.slice(start, start + length), immutableAction))
    .concat(state.slice(start + length))
);
