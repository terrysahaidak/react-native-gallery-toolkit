import React, { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, runOnUI } from 'react-native-reanimated';

const dimensions = Dimensions.get('window');

export function normalizeDimensions(
  item: {
    width: number;
    height: number;
  },
  resultWidth = dimensions.width,
) {
  const scaleFactor = item.width / resultWidth;
  const targetHeight = item.height / scaleFactor;

  return {
    targetWidth: resultWidth,
    targetHeight,
  };
}

export function friction(value: number) {
  'worklet';

  const MAX_FRICTION = 30;
  const MAX_VALUE = 200;

  const res = Math.max(
    1,
    Math.min(
      MAX_FRICTION,
      1 + (Math.abs(value) * (MAX_FRICTION - 1)) / MAX_VALUE,
    ),
  );

  if (value < 0) {
    return -res;
  }

  return res;
}

// in order to simultaneousHandlers to work
// we need to trigger rerender of the screen
// so refs will be valid then
export function fixGestureHandler() {
  const [, set] = useState(0);

  useEffect(() => {
    set((v) => v + 1);
  }, []);
}

export function getShouldRender(
  index: number,
  activeIndex: number,
  diffValue = 3,
) {
  const diff = Math.abs(index - activeIndex);

  if (diff > diffValue) {
    return false;
  }

  return true;
}

export function clamp(
  value: number,
  lowerBound: number,
  upperBound: number,
) {
  'worklet';

  return Math.min(Math.max(lowerBound, value), upperBound);
}

export const workletNoop = () => {
  'worklet';
};

export const typedMemo: <T>(c: T) => T = React.memo;

export function clampVelocity(
  velocity: number,
  minVelocity: number,
  maxVelocity: number,
) {
  'worklet';

  if (velocity > 0) {
    return Math.min(Math.max(velocity, minVelocity), maxVelocity);
  } else {
    return Math.max(Math.min(velocity, -minVelocity), -maxVelocity);
  }
}

export function runOnce(fn: Function) {
  const ref = useRef<null | true>(null);

  if (!ref.current) {
    fn();
    ref.current = true;
  }
}

export function assertWorkletCreator(packageName: string) {
  return function assert(fn: (...args: any[]) => any) {
    // @ts-expect-error
    if (!fn.__worklet)
      throw new Error(
        `${packageName}: ${fn.name} change should be a worklet. Did you forget to add "worklet" directive?`,
      );
  };
}

export function runOnJSorUI(cb: any) {
  'worklet';

  console.log(Object.keys(cb));

  if (cb && cb.__worklet) {
    return runOnUI(cb);
  }

  return runOnJS(cb);
}
