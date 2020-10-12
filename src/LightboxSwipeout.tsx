import React, { forwardRef, useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
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
} from './';

type NonNullable<U> = Exclude<U, undefined | null>;

type LightboxSwipeoutProps = SwipeoutProps &
  Omit<LightboxTransitionProps, 'children'> & {
    toValue?: number;
    backdropColor?: string;
  };

export const LightboxSwipeout = forwardRef<
  LightboxImperativeHandlers,
  LightboxSwipeoutProps
>(
  (
    {
      toValue = Dimensions.get('window').height,
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
      renderImage,
      onReady,
      ...rest
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
        duration: 200,
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
      NonNullable<LightboxTransitionProps['renderBackdropComponent']>
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

    const _renderOverlayComponent = useCallback<
      NonNullable<LightboxTransitionProps['renderOverlayComponent']>
    >((props) => {
      const animatedStyles = useAnimatedStyle(
        () => ({
          opacity: backdropOpacity.value,
        }),
        [],
      );

      return (
        <Animated.View
          style={[
            { top: 0, bottom: 0, position: 'absolute' },
            animatedStyles,
          ]}
        >
          {renderOverlayComponent!(props)}
        </Animated.View>
      );
    }, []);

    return (
      <LightboxTransition
        {...rest}
        ref={ref}
        measurements={measurements}
        source={source}
        targetDimensions={targetDimensions}
        renderBackdropComponent={renderBackdropComponent}
        renderOverlayComponent={
          renderOverlayComponent ? _renderOverlayComponent : undefined
        }
        onReady={onReady}
        renderImage={renderImage}
      >
        <Swipeout
          toValue={toValue}
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
