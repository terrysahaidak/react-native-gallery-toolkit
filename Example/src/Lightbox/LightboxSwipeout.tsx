import React, { forwardRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  SwipeoutProps,
  LightboxTransitionProps,
  useSharedValue,
  LightboxTransition,
  Swipeout,
  LightboxImperativeHandlers,
} from '../../../src';

type LightboxSwipeoutProps = SwipeoutProps &
  Omit<LightboxTransitionProps, 'children'> & {
    toValue: number;
    backdropColor?: string;
  };

export const LightboxSwipeout = forwardRef<
  LightboxImperativeHandlers,
  LightboxSwipeoutProps
>(
  (
    {
      toValue,
      onSwipeFailure,
      onActive,
      backdropColor = 'black',
      callback,
      measurements,
      source,
      renderOverlayComponent,
      targetDimensions,
      children,
      onSwipeSuccess,
      onReady,
    },
    ref,
  ) => {
    const backdropOpacity = useSharedValue(1);

    function _onSwipeActive(translateY: number) {
      'worklet';

      backdropOpacity.value = interpolate(
        Math.abs(translateY),
        [0, toValue],
        [1, 0.7],
        Extrapolate.CLAMP,
      );

      if (onActive) {
        onActive(translateY);
      }
    }

    function _onSwipeSuccess() {
      'worklet';

      if (onSwipeSuccess) {
        onSwipeSuccess();
      }

      backdropOpacity.value = withTiming(0, {
        duration: 100,
      });
    }

    function _onSwipeFailure() {
      'worklet';

      if (onSwipeFailure) {
        onSwipeFailure();
      }

      backdropOpacity.value = withTiming(1);
    }

    const customBackdropStyles = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacity.value,
      };
    }, []);

    const renderBackdropComponent = useCallback<
      LightboxTransitionProps['renderBackdropComponent']
    >(
      ({ animatedStyles }) => (
        <Animated.View
          style={[StyleSheet.absoluteFill, customBackdropStyles]}
        >
          <Animated.View
            style={[
              animatedStyles,
              {
                backgroundColor: backdropColor,
              },
            ]}
          />
        </Animated.View>
      ),
      [],
    );

    return (
      <LightboxTransition
        ref={ref}
        measurements={measurements}
        source={source}
        targetDimensions={targetDimensions}
        renderBackdropComponent={renderBackdropComponent}
        renderOverlayComponent={renderOverlayComponent}
        onReady={onReady}
      >
        <Swipeout
          onActive={_onSwipeActive}
          onSwipeSuccess={_onSwipeSuccess}
          onSwipeFailure={_onSwipeFailure}
          callback={callback}
        >
          {children}
        </Swipeout>
      </LightboxTransition>
    );
  },
);
