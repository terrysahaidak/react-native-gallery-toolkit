import {
  clamp,
  fixGestureHandler,
  normalizeDimensions,
  useAnimatedGestureHandler,
  vectors,
  workletNoop,
} from '@gallery-toolkit/common';
import React, { useCallback, useRef } from 'react';
import {
  Dimensions,
  Image,
  ImageRequireSource,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const defaultTimingConfig = {
  duration: 250,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

export interface RenderScalableImageProps {
  width: number;
  height: number;
  source: { uri: string } | ImageRequireSource;
  onLoad: () => void;
}

export interface ScalableImageReusableProps {
  renderImage?: (props: RenderScalableImageProps) => JSX.Element;
  MAX_SCALE?: number;
  MIN_SCALE?: number;
}

export interface ScalableImageProps
  extends ScalableImageReusableProps {
  outerGestureHandlerRefs?: React.Ref<any>[];
  source?: ImageRequireSource | string;
  width: number;
  height: number;
  canvasDimensions?: {
    width: number;
    height: number;
  };
  onStateChange?: (isActive: boolean) => void;
  onScale?: (scale: number) => void;

  onGestureStart?: () => void;
  onGestureRelease?: () => void;
  onEnd?: () => void;

  outerGestureHandlerActive?: Animated.SharedValue<boolean>;

  timingConfig?: Animated.WithTimingConfig;
  style?: ViewStyle;
  enabled?: boolean;
}

const AnimatedImageComponent = Animated.createAnimatedComponent(
  Image,
);

export const ScalableImage = React.memo<ScalableImageProps>(
  ({
    outerGestureHandlerRefs = [],
    source,
    width,
    height,
    onStateChange = workletNoop,
    renderImage,

    canvasDimensions,
    outerGestureHandlerActive,

    style,
    onScale = workletNoop,
    onGestureRelease = workletNoop,
    onGestureStart = workletNoop,
    onEnd = workletNoop,

    MAX_SCALE = 3,
    MIN_SCALE = 1,
    timingConfig = defaultTimingConfig,

    enabled = true,
  }) => {
    fixGestureHandler();

    if (typeof source === 'undefined') {
      throw new Error(
        'ScalableImage: either source or uri should be passed to display an image',
      );
    }

    const imageSource =
      typeof source === 'string'
        ? {
            uri: source,
          }
        : source;

    const interactionsEnabled = useSharedValue(false);
    const setInteractionsEnabled = useCallback((value: boolean) => {
      interactionsEnabled.value = value;
    }, []);
    const onLoadImageSuccess = useCallback(() => {
      setInteractionsEnabled(true);
    }, []);

    const pinchRef = useRef(null);

    const scale = useSharedValue(1);
    const scaleOffset = useSharedValue(1);
    const scaleTranslation = vectors.useSharedVector(0, 0);

    const { targetWidth, targetHeight } = normalizeDimensions(
      {
        width,
        height,
      },
      canvasDimensions?.width ?? Dimensions.get('window').width,
    );

    const canvas = vectors.create(
      canvasDimensions?.width ?? targetWidth,
      canvasDimensions?.height ?? targetHeight,
    );

    const onScaleEvent = useAnimatedGestureHandler<
      PinchGestureHandlerGestureEvent,
      {
        origin: vectors.Vector<number>;
        adjustFocal: vectors.Vector<number>;
        gestureScale: number;
        nextScale: number;
      }
    >({
      onInit: (_, ctx) => {
        ctx.origin = vectors.create(0, 0);
        ctx.gestureScale = 1;
      },

      shouldHandleEvent: (evt) => {
        return (
          evt.numberOfPointers === 2 &&
          scale.value === 1 &&
          interactionsEnabled.value &&
          (typeof outerGestureHandlerActive !== 'undefined'
            ? !outerGestureHandlerActive.value
            : true)
        );
      },

      beforeEach: (evt, ctx) => {
        // calculate the overall scale value
        // also limits this.event.scale
        ctx.nextScale = clamp(
          evt.scale * scaleOffset.value,
          MIN_SCALE,
          MAX_SCALE,
        );

        if (ctx.nextScale > MIN_SCALE && ctx.nextScale < MAX_SCALE) {
          ctx.gestureScale = evt.scale;
        }

        // this is just to be able to use with vectors
        const focal = vectors.create(evt.focalX, evt.focalY);
        const CENTER = vectors.divide(canvas, 2);

        // it alow us to scale into different point even then we pan the image
        ctx.adjustFocal = vectors.sub(focal, CENTER);
      },

      afterEach: (evt, ctx) => {
        if (evt.state === 5) {
          return;
        }

        scale.value = ctx.nextScale;
      },

      onStart: (_, ctx) => {
        vectors.set(ctx.origin, ctx.adjustFocal);

        onGestureStart();
      },

      onActive: (_, ctx) => {
        const pinch = vectors.sub(ctx.adjustFocal, ctx.origin);

        const nextTranslation = vectors.add(
          pinch,
          ctx.origin,
          vectors.multiply(-1, ctx.gestureScale, ctx.origin),
        );

        vectors.set(scaleTranslation, nextTranslation);
      },

      onEnd: (_, ctx) => {
        onGestureRelease();
        // reset gestureScale value
        ctx.gestureScale = 1;

        // store scale value
        scale.value = withTiming(1, timingConfig, () => {
          'worklet';

          onEnd();
        });
        vectors.set(scaleTranslation, () =>
          withTiming(0, timingConfig),
        );
      },
    });

    const animatedStyles = useAnimatedStyle<ViewStyle>(() => {
      const noScaleTranslation =
        scaleTranslation.x.value === 0 &&
        scaleTranslation.y.value === 0;

      const isInactive = scale.value === 1 && noScaleTranslation;

      onStateChange(isInactive);

      onScale(scale.value);

      return {
        transform: [
          {
            translateX: scaleTranslation.x.value,
          },
          {
            translateY: scaleTranslation.y.value,
          },
          { scale: scale.value },
        ],
      };
    }, []);

    return (
      <Animated.View
        style={[{ width: targetWidth, height: targetHeight }, style]}
      >
        <PinchGestureHandler
          enabled={enabled}
          ref={pinchRef}
          onGestureEvent={onScaleEvent}
          simultaneousHandlers={[...outerGestureHandlerRefs]}
        >
          <Animated.View style={StyleSheet.absoluteFillObject}>
            <Animated.View style={animatedStyles}>
              {typeof renderImage === 'function' ? (
                renderImage({
                  source: imageSource,
                  width: targetWidth,
                  height: targetHeight,
                  onLoad: onLoadImageSuccess,
                })
              ) : (
                <AnimatedImageComponent
                  onLoad={onLoadImageSuccess}
                  source={imageSource}
                  style={{
                    width: targetWidth,
                    height: targetHeight,
                  }}
                />
              )}
            </Animated.View>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    );
  },
);
