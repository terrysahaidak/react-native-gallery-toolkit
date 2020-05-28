import { useSharedValue } from 'react-native-reanimated';

export const bind = (ctx, values) => {
  'worklet';

  if (!ctx.__boundValues) {
    ctx.__boundValues = values;
  }

  return ctx.__boundValues;
};

const _isVector = (value) => {
  'worklet';

  return typeof value.x !== 'undefined' && value.y !== 'undefined';
};

const _get = (value) => {
  'worklet';

  return typeof value.value !== 'undefined' ? value.value : value;
};

export const _reduce = (operation, prop, vectors) => {
  'worklet';

  const first = vectors[0];
  const rest = vectors.slice(1);

  const initial = _get(_isVector(first) ? first[prop] : first);

  const res = rest.reduce((acc, current) => {
    const value = _get(_isVector(current) ? current[prop] : current);
    const r = (() => {
      switch (operation) {
        case 'divide':
          if (value === 0) {
            return 0;
          }
          return acc / value;
        case 'add':
          return acc + value;
        case 'sub':
          return acc - value;
        case 'multiply':
          return acc * value;
        default:
          return acc;
      }
    })();

    return r;
  }, initial);

  return res;
};

export const useSharedVector = (x, y = x) => {
  return {
    x: useSharedValue(x),
    y: useSharedValue(y),
  };
};

export const create = (x, y) => {
  'worklet';

  return {
    x,
    y,
  };
};

export const add = (vectors) => {
  'worklet';

  return {
    x: _reduce('add', 'x', vectors),
    y: _reduce('add', 'y', vectors),
  };
};

export const sub = (vectors) => {
  'worklet';

  return {
    x: _reduce('sub', 'x', vectors),
    y: _reduce('sub', 'y', vectors),
  };
};

export const divide = (vectors) => {
  'worklet';

  return {
    x: _reduce('divide', 'x', vectors),
    y: _reduce('divide', 'y', vectors),
  };
};

export const multiply = (vectors) => {
  'worklet';

  return {
    x: _reduce('multiply', 'x', vectors),
    y: _reduce('multiply', 'y', vectors),
  };
};

export const invert = (vector) => {
  'worklet';

  return {
    x: _get(vector.x) * -1,
    y: _get(vector.y) * -1,
  };
};

export const set = (vector, value) => {
  'worklet';

  const x = _get(_isVector(value) ? value.x : value);
  const y = _get(_isVector(value) ? value.y : value);

  if (typeof vector.x.value !== 'undefined') {
    vector.x.value = x;
    vector.y.value = y;
  } else {
    vector.x = x;
    vector.y = y;
  }
};

export const min = (vectors) => {
  'worklet';

  const getMin = (prop) => {
    const values = vectors.map((item) =>
      _get(_isVector(item) ? item[prop] : item),
    );
    return Math.min.apply(void 0, values);
  };

  return {
    x: getMin('x'),
    y: getMin('y'),
  };
};

export const max = (vectors) => {
  'worklet';

  const getMax = (prop) =>
    Math.max.apply(
      void 0,
      vectors.map((item) =>
        _get(_isVector(item) ? item[prop] : item),
      ),
    );

  return {
    x: getMax('x'),
    y: getMax('y'),
  };
};

export const clamp = (value, lowerBound, upperBound) => {
  'worklet';

  return min([max([lowerBound, value]), upperBound]);
};

export const eq = (vector, value) => {
  'worklet';

  const x = _get(_isVector(value) ? value.x : value);
  const y = _get(_isVector(value) ? value.y : value);

  return _get(vector.x) === x && _get(vector.y) === y;
};
