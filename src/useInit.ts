import {
  runOnUI,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useRef } from 'react';
import { withDecay } from './withDecay';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import * as vec from './vectors';

const { useSharedValue, ...usedVectors } = vec;

function useRunOnce(cb) {
  const ref = useRef(null);

  if (ref.current === null) {
    cb();
    ref.current = true;
  }
}

const usedWorklets = {
  withTiming,
  withSpring,
  bezier: Easing.bezier,
  interpolate,
  withDecay,
  useAnimatedGestureHandler,
  ...usedVectors,
};

export function useInit() {
  useRunOnce(
    runOnUI(() => {
      'worklet';

      const x = {};
      Object.keys(usedWorklets).forEach((key) => {
        x[key] = usedWorklets[key];
      });
    }),
  );
}
