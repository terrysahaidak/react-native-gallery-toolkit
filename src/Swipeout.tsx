import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  GestureHandlerGestureEventNativeEvent,
  PanGestureHandlerEventExtra,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { createAnimatedGestureHandler } from './useAnimatedGestureHandler';
import {
  useAnimatedReaction,
  useSharedValue,
  workletNoop,
} from './utils';

const dimensions = Dimensions.get('window');

export interface SwipeoutProps {
  children: ({
    onGesture,
    shouldHandleEvent,
  }: {
    onGesture: (
      evt: GestureHandlerGestureEventNativeEvent &
        PanGestureHandlerEventExtra,
    ) => void;
    shouldHandleEvent: () => boolean;
  }) => JSX.Element;
  onActive?: (translateY: number) => void;
  onTranslateChange?: (translateY: number) => void;
  toValue?: number;
  onSwipeSuccess?: () => void;
  onSwipeFailure?: () => void;
  callback?: () => void;
}

export function Swipeout({
  children,
  onActive,
  toValue = dimensions.height,
  onSwipeSuccess = workletNoop,
  onSwipeFailure = workletNoop,
  onTranslateChange = workletNoop,
  callback,
}: SwipeoutProps) {
  const translateY = useSharedValue(0);

  const translateStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  }, []);

  function shouldHandleEvent() {
    'worklet';

    return translateY.value === 0;
  }

  useAnimatedReaction(
    () => translateY.value,
    (value) => {
      onTranslateChange(value);

      if (Math.abs(value) >= toValue + 100) {
        cancelAnimation(translateY);
      }
    },
  );

  const handler = useCallback(
    createAnimatedGestureHandler<PanGestureHandlerGestureEvent, {}>({
      shouldHandleEvent: (evt) => {
        'worklet';

        return (
          evt.numberOfPointers === 1 &&
          Math.abs(evt.velocityX) < Math.abs(evt.velocityY)
        );
      },

      onActive: (evt) => {
        'worklet';

        translateY.value = evt.translationY;

        if (onActive) {
          onActive(translateY.value);
        }
      },

      onEnd: (evt) => {
        const enoughVelocity = Math.abs(evt.velocityY) > 30;
        const rightDirection =
          (evt.translationY > 0 && evt.velocityY > 0) ||
          (evt.translationY < 0 && evt.velocityY < 0);

        if (enoughVelocity && rightDirection) {
          const maybeInvert = (v: number) => {
            const invert = evt.velocityY < 0;
            return invert ? -v : v;
          };

          translateY.value = withSpring(
            maybeInvert(toValue * 2),
            {
              stiffness: 50,
              damping: 30,
              mass: 1,
              overshootClamping: true,
              velocity:
                Math.abs(evt.velocityY) < 1200
                  ? maybeInvert(1200)
                  : evt.velocityY,
            },
            callback,
          );
          if (onSwipeSuccess) {
            onSwipeSuccess();
          }
        } else {
          if (onSwipeFailure) {
            onSwipeFailure();
          }
          translateY.value = withSpring(0, {
            stiffness: 1000,
            damping: 500,
            mass: 2,
            restDisplacementThreshold: 10,
            restSpeedThreshold: 10,
            velocity: evt.velocityY,
          });
        }
      },
    }),
    [],
  );

  return (
    <Animated.View style={[translateStyles, StyleSheet.absoluteFill]}>
      {children({ onGesture: handler, shouldHandleEvent })}
    </Animated.View>
  );
}
