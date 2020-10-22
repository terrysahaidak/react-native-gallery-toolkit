import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { PanGestureHandlerGestureEvent, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolate,
  interpolate,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { createAnimatedGestureHandler, useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import { useAnimatedReaction, useSharedValue } from './utils';

export interface Measurements {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface DimensionsType {
  width: number;
  height: number;
}

function resolveDimensions(
  measurements: Measurements,
  targetDimensions: DimensionsType,
  dimensions: DimensionsType,
) {
  const x = useSharedValue(measurements.x, true);
  const y = useSharedValue(measurements.y, true);
  const width = useSharedValue(measurements.width, true);
  const height = useSharedValue(measurements.height, true);

  const targetWidth = useSharedValue(dimensions.width, true);
  const scaleFactor = targetDimensions.width / targetWidth.value;
  const targetHeight = useSharedValue(
    targetDimensions.height / scaleFactor,
    true,
  );

  return {
    x,
    y,
    width,
    height,
    targetWidth,
    targetHeight,
  };
}


const defaultTimingConfig = {
  duration: 300,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

const defaultFadeTimingConfig = {
  duration: 500,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};


const AnimatedImage = Animated.createAnimatedComponent(Image);

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
      dimensions = Dimensions.get('window'),
      ...rest
    },
    ref,
  ) => {
    const {
      x,
      y,
      width,
      height,
      targetWidth,
      targetHeight,
    } = resolveDimensions(measurements, targetDimensions, dimensions);

    const imageSource =
      typeof source === 'string'
        ? {
            uri: source,
          }
        : source;

    const backdropOpacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animationProgress = useSharedValue(0);

    const opacity = useSharedValue(0);
    const imageOpacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const targetX = useSharedValue(0);
    const targetY = useSharedValue(
      (dimensions.height - targetHeight.value) / 2,
      true,
    );

    const translateX = useSharedValue(0);

    function onTranslateChange(translateY: number) {
      backdropOpacity.value = interpolate(
        Math.abs(translateY),
        [0, toValue + 100],
        [1, 0],
        Extrapolate.CLAMP,
      );
    }

    const customBackdropStyles = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacity.value,
      };
    }, []);



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
      createAnimatedGestureHandler<PanGestureHandlerGestureEvent, {}>(
        {
          shouldHandleEvent: (evt) => {
            'worklet';
            // if (_WORKLET) {
            //   console.log(_WORKLET);
            // }

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
            'worklet';

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
        },
      ),
      [],
    );

    const [renderChildren, setRenderChildren] = useState<boolean>(
      false,
    );

    useEffect(() => {
      onReady();
      animationProgress.value = withTiming(1, timingConfig, () => {
        'worklet';

        opacity.value = 1;
        setRenderChildren(true);
      });
    }, []);

    function runHideAnimation(cb: Function) {
      'worklet';

      imageOpacity.value = 1;
      opacity.value = 0;
      animationProgress.value = withTiming(0, timingConfig, () => {
        'worklet';

        cb();
      });
    }

    function runFadeOutAnimation(cb: Function) {
      'worklet';

      opacity.value = withTiming(0, fadeTimingConfig);
      animationProgress.value = withTiming(
        0,
        fadeTimingConfig,
        () => {
          'worklet';

          cb();
        },
      );
    }

    // useImperativeHandle(ref, () => ({
    //   hide(cb, shouldFade) {
    //     if (shouldFade) {
    //       runFadeOutAnimation(cb);
    //     } else {
    //       runHideAnimation(cb);
    //     }
    //   },
    // }));

    // we need to hide lightbox component
    // after children is rendered
    function onChildrenLayout() {
      if (imageOpacity.value === 0) {
        return;
      }

      requestAnimationFrame(() => {
        imageOpacity.value = 0;
      });
    }

    const backdropStyles = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        opacity: animationProgress.value,
      };
    });

    const childrenAnimateStyle = useAnimatedStyle(
      () => ({
        opacity: opacity.value,
      }),
      [],
    );

    const imageStyles = useAnimatedStyle(() => {
      const interpolateProgress = (range: [number, number]) =>
        interpolate(animationProgress.value, [0, 1], range);

      const top =
        translateY.value +
        interpolateProgress([y.value, targetY.value]);
      const left =
        translateX.value +
        interpolateProgress([x.value, targetX.value]);

      return {
        opacity: imageOpacity.value,
        position: 'absolute',
        top,
        left,
        width: interpolateProgress([width.value, targetWidth.value]),
        height: interpolateProgress([
          height.value,
          targetHeight.value,
        ]),
        transform: [
          {
            scale: scale.value,
          },
        ],
      };
    });

    return (
      <View style={StyleSheet.absoluteFillObject}>
        {renderBackdropComponent &&
          renderBackdropComponent({
            animatedStyles: backdropStyles,
            animationProgress,
          })}

        <Animated.View style={StyleSheet.absoluteFillObject}>
          {typeof renderImage === 'function' ? (
            renderImage({
              source: imageSource,
              width: targetWidth.value,
              height: targetHeight.value,
              imageStyles,
            })
          ) : (
            <AnimatedImage
              source={imageSource}
              style={[
                {
                  width: targetWidth.value,
                  height: targetHeight.value,
                },
                imageStyles,
              ]}
            />
          )}
        </Animated.View>

        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            childrenAnimateStyle,
          ]}
        >
          {renderChildren && (
            <Animated.View
              style={[StyleSheet.absoluteFillObject, ,]}
              onLayout={onChildrenLayout}
            >
              <Animated.View
                style={[translateStyles, StyleSheet.absoluteFill]}
              >
                {children({ onGesture: handler, shouldHandleEvent })}
              </Animated.View>
            </Animated.View>
          )}
        </Animated.View>

        {renderOverlayComponent &&
          renderOverlayComponent({ animationProgress })}
      </View>
    );
  },
);
