import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  GestureHandlerGestureEventNativeEvent,
  PanGestureHandlerEventExtra,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createAnimatedGestureHandler } from './useAnimatedGestureHandler';
import { useSharedValue, workletNoop } from './utils';

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
  onActive: (traslateY: number) => void;
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

        onActive(translateY.value);
      },

      onEnd: (evt) => {
        console.log(evt.velocityY);
        if (
          Math.abs(translateY.value) > 80 &&
          Math.abs(evt.velocityY) > 30
        ) {
          const invert = evt.velocityY < 0;
          translateY.value = withSpring(
            invert ? -toValue - 20 : toValue + 20,
            {
              stiffness: 1000,
              damping: 500,
              mass: 2,
              overshootClamping: true,
              restDisplacementThreshold: 10,
              restSpeedThreshold: 10,
              velocity:
                Math.abs(evt.velocityY) < 1500 ? 1500 : evt.velocityY,
            },
            callback,
          );
          onSwipeSuccess();
        } else {
          onSwipeFailure();
          translateY.value = withTiming(0);
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
