const handleAction = (state, immutableAction) => typeof immutableAction === 'function'
  ? immutableAction(state)
  : immutableAction;

export const merge = (immutableAction) => (state) => ({
  ...state,
  ...handleAction(state, immutableAction),
});

export const setIn = (key, immutableAction) => (state) => {
  const value = Array.isArray(state)
    ? [...state]
    : { ...state };

  value[key] = handleAction(value[key], immutableAction);

  return value;
};

export const replace = (object) => (previous) => typeof object === 'function'
  ? object(previous)
  : object;

export const select = (path, immutableAction) => (state) => {
  if (path.length === 0) {
    return handleAction(state, immutableAction);
  }

  const key = path[0];

  return handleAction(state, setIn(
    key,
    select(path.slice(1), immutableAction)
  ));
};

export const update = () => () => null;

export default handleAction;
