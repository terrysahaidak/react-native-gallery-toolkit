import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Image,
  StyleSheet,
  View,
  ImageRequireSource,
  Dimensions,
} from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import { useSharedValue, workletNoop } from './utils';

export interface Measurements {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface LightboxItemPayloadType<T> extends Measurements {
  index?: number;
  item: T;
}

export interface LightBoxItemProps<T> {
  item: T;
  children: JSX.Element;
  index?: number;
  onPress: (payload: LightboxItemPayloadType<T>) => void;
}

export function LightBoxItem<T>({
  children,
  onPress,
  index,
  item,
}: LightBoxItemProps<T>) {
  const ref = useAnimatedRef<Animated.View>();

  function handlePress(measurements: Measurements) {
    onPress({
      ...measurements,
      item,
      index,
    });
  }

  const handler = useAnimatedGestureHandler({
    onFinish: (_evt, _ctx, isCanceledOrFailed) => {
      if (isCanceledOrFailed) {
        return;
      }

      // measure the image
      // width/height and position to animate from it to the full screen one
      const measurements = measure(ref);

      const { width, height, pageX: x, pageY: y } = measurements;

      handlePress({
        width,
        height,
        x,
        y,
      });
    },
  });

  const opacityStyles = useAnimatedStyle(() => {
    return {
      // opacity: opacity.value,
    };
  });

  return (
    <TapGestureHandler onGestureEvent={handler}>
      <Animated.View ref={ref} style={opacityStyles}>
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

const defaultTimingConfig = {
  duration: 300,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

const defaultFadeTimingConfig = {
  duration: 500,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

export interface RenderLightboxImageProps {
  width: number;
  height: number;
  source: { uri: string } | ImageRequireSource;
  imageStyles: ReturnType<typeof useAnimatedStyle>;
}

interface DimensionsType {
  width: number;
  height: number;
}

export interface LightboxTransitionProps {
  source: ImageRequireSource | string;
  measurements: Measurements;
  dimensions?: DimensionsType;
  targetDimensions: DimensionsType;
  children: JSX.Element;
  renderBackdropComponent?: (props: {
    animatedStyles: ReturnType<typeof useAnimatedStyle>;
    animationProgress: Animated.SharedValue<number>;
  }) => JSX.Element;
  renderOverlayComponent?: (props: {
    animationProgress: Animated.SharedValue<number>;
  }) => JSX.Element;
  onReady?: () => void;
  renderImage?: (props: RenderLightboxImageProps) => JSX.Element;
  timingConfig?: Animated.WithTimingConfig;
  fadeTimingConfig?: Animated.WithTimingConfig;
}

export interface LightboxImperativeHandlers {
  hide: (cb: Function, shouldFade?: boolean) => void;
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

export const LightboxTransition = forwardRef<
  LightboxImperativeHandlers,
  LightboxTransitionProps
>(
  (
    {
      source,
      measurements,
      dimensions = Dimensions.get('window'),
      targetDimensions,
      children,
      renderImage,
      renderBackdropComponent,
      renderOverlayComponent,
      onReady = workletNoop,
      timingConfig = defaultTimingConfig,
      fadeTimingConfig = defaultFadeTimingConfig,
    },
    ref,
  ) => {
    const [renderChildren, setRenderChildren] = useState<boolean>(
      false,
    );

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
    const translateY = useSharedValue(0);

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

    useEffect(() => {
      onReady();
      animationProgress.value = withTiming(1, timingConfig, () => {
        'worklet';

        opacity.value = 1;
        setRenderChildren(true);
      });
    }, []);

    function runHideAnimation(cb: Function) {
      "worklet";

      imageOpacity.value = 1;
      opacity.value = 0;
      animationProgress.value = withTiming(0, timingConfig, () => {
        'worklet';

        cb();
      });
    }

    function runFadeOutAnimation(cb: Function) {
      "worklet";

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

    useImperativeHandle(ref, () => ({
      hide(cb, shouldFade) {
        if (shouldFade) {
          runFadeOutAnimation(cb);
        } else {
          runHideAnimation(cb);
        }
      },
    }));

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
              {children}
            </Animated.View>
          )}
        </Animated.View>

        {renderOverlayComponent &&
          renderOverlayComponent({ animationProgress })}
      </View>
    );
  },
);
