import React, { useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  Image,
  ImageRequireSource,
  ViewStyle,
} from 'react-native';
import Animated, {
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import * as vec from './vectors';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import withDecay from './withDecay';
import { fixGestureHandler, clamp } from './utils';

const windowDimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const styles = {
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
};

const springConfig = {
  stiffness: 1000,
  damping: 500,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const timingConfig = {
  duration: 250,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

type IImageTransformerProps = {
  pagerRefs: React.Ref<any>[];
  source?: ImageRequireSource;
  uri?: string;
  width: number;
  height: number;
  onPageStateChange: (nextPagerState: boolean) => void;
};

export const ImageTransformer = React.memo<IImageTransformerProps>(
  ({
    pagerRefs = [],
    source,
    uri,
    width,
    height,
    onPageStateChange = () => {},
  }) => {
    fixGestureHandler();

    const imageSource = source ?? {
      uri,
    };

    const MAX_SCALE = 3;
    const MIN_SCALE = 0.7;
    const OVER_SCALE = 0.5;

    const pinchRef = useRef(null);
    const panRef = useRef(null);
    const tapRef = useRef(null);

    const panState = useSharedValue<State>(-1);
    const pinchState = useSharedValue<State>(-1);

    const scale = useSharedValue(1);
    const scaleOffset = useSharedValue(1);
    const translation = vec.useSharedVector(0, 0);
    const panVelocity = vec.useSharedVector(0, 0);
    const scaleTranslation = vec.useSharedVector(0, 0);
    const offset = vec.useSharedVector(0, 0);

    const canvas = vec.create(
      windowDimensions.width,
      windowDimensions.height,
    );
    const targetWidth = windowDimensions.width;
    const scaleFactor = width / targetWidth;
    const targetHeight = height / scaleFactor;
    const image = vec.create(targetWidth, targetHeight);

    const canPanVertically = useDerivedValue(() => {
      return windowDimensions.height < targetHeight * scale.value;
    });

    const maybeRunOnEnd = () => {
      'worklet';

      const target = vec.create(0, 0);

      const fixedScale = clamp(MIN_SCALE, scale.value, MAX_SCALE);
      const scaledImage = image.y * fixedScale;
      const rightBoundary = (canvas.x / 2) * (fixedScale - 1);

      let topBoundary = 0;

      if (canvas.y < scaledImage) {
        topBoundary = Math.abs(scaledImage - canvas.y) / 2;
      }

      const maxVector = vec.create(rightBoundary, topBoundary);
      const minVector = vec.invert(maxVector);

      if (!canPanVertically.value) {
        offset.y.value = withSpring(target.y, springConfig);
      }

      if (panState.value !== 5 || pinchState.value !== 5) {
        return;
      }

      if (
        vec.eq(offset, 0) &&
        vec.eq(translation, 0) &&
        vec.eq(scaleTranslation, 0) &&
        scale.value === 1
      ) {
        // we don't need to run any animations
        return;
      }

      if (scale.value <= 1) {
        // just center it
        vec.set(target, 0);
      } else {
        vec.set(target, vec.clamp(offset, minVector, maxVector));
      }

      const deceleration = 0.991;

      if (
        target.x === offset.x.value &&
        Math.abs(panVelocity.x.value) > 0 &&
        scale.value <= MAX_SCALE
      ) {
        offset.x.value = withDecay({
          velocity: panVelocity.x.value,
          clamp: [minVector.x, maxVector.x],
          deceleration,
        });
      } else {
        // run animation
        offset.x.value = withSpring(target.x, springConfig);
      }

      if (
        target.y === offset.y.value &&
        Math.abs(panVelocity.y.value) > 0 &&
        scale.value <= MAX_SCALE
      ) {
        offset.y.value = withDecay({
          velocity: panVelocity.y.value,
          clamp: [minVector.y, maxVector.y],
          deceleration,
        });
      } else {
        offset.y.value = withSpring(target.y, springConfig);
      }
    };

    const onPanEvent = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      {
        panOffset: vec.Vector<number>;
        pan: vec.Vector<number>;
      }
    >({
      onInit: (_, ctx) => {
        ctx.panOffset = vec.create(0, 0);
      },

      beforeEach: (evt, ctx) => {
        ctx.pan = vec.create(evt.translationX, evt.translationY);
        const velocity = vec.create(evt.velocityX, evt.velocityY);

        vec.set(panVelocity, velocity);
      },

      shouldHandleEvent: () => {
        return true;
      },

      onStart: (_, ctx) => {
        console.log('Transformer onStart')

        cancelAnimation(offset.x);
        cancelAnimation(offset.y);
        ctx.panOffset = vec.create(0, 0);
      },

      onActive: (evt, ctx) => {
        panState.value = evt.state;

        if (scale.value > 1) {
          if (evt.numberOfPointers > 1) {
            // store pan offset during the pan with two fingers (during the pinch)
            vec.set(ctx.panOffset, ctx.pan);
          } else {
            // subtract the offset and assign fixed pan
            const nextTranslate = vec.add([
              ctx.pan,
              vec.invert(ctx.panOffset),
            ]);
            translation.x.value = nextTranslate.x;

            if (canPanVertically.value) {
              translation.y.value = nextTranslate.y;
            }
          }
        }
      },

      onEnd: (evt, ctx) => {
        panState.value = evt.state;

        vec.set(ctx.panOffset, 0);
        vec.set(offset, vec.add([offset, translation]));
        vec.set(translation, 0);

        maybeRunOnEnd();
      },
    });

    const onScaleEvent = useAnimatedGestureHandler<
      PinchGestureHandlerGestureEvent,
      {
        origin: vec.Vector<number>;
        adjustFocal: vec.Vector<number>;
        gestureScale: number;
        nextScale: number;
      }
    >({
      onInit: (_, ctx) => {
        ctx.origin = vec.create(0, 0);
        ctx.gestureScale = 1;
      },

      shouldHandleEvent: () => {
        return true;
      },

      beforeEach: (evt, ctx) => {
        // calculate the overall scale value
        // also limits this.event.scale
        ctx.nextScale = clamp(
          evt.scale * scaleOffset.value,
          MIN_SCALE,
          MAX_SCALE + OVER_SCALE,
        );

        if (
          ctx.nextScale > MIN_SCALE &&
          ctx.nextScale < MAX_SCALE + OVER_SCALE
        ) {
          ctx.gestureScale = evt.scale;
        }

        // this is just to be able to use with vectors
        const focal = vec.create(evt.focalX, evt.focalY);
        const CENTER = vec.divide([canvas, 2]);

        // focal with translate offset
        // it alow us to scale into different point even then we pan the image
        ctx.adjustFocal = vec.sub([focal, vec.add([CENTER, offset])]);
      },

      afterEach: (evt, ctx) => {
        if (evt.state === 5) {
          return;
        }

        scale.value = ctx.nextScale;
      },

      onStart: (_, ctx) => {
        vec.set(ctx.origin, ctx.adjustFocal);
      },

      onActive: (evt, ctx) => {
        pinchState.value = evt.state;

        const pinch = vec.sub([ctx.adjustFocal, ctx.origin]);

        const nextTranslation = vec.add([
          pinch,
          ctx.origin,
          vec.multiply([-1, ctx.gestureScale, ctx.origin]),
        ]);

        vec.set(scaleTranslation, nextTranslation);
      },

      onEnd: (evt, ctx) => {
        // reset gestureScale value
        ctx.gestureScale = 1;
        pinchState.value = evt.state;
        // store scale value
        scaleOffset.value = scale.value;

        vec.set(offset, vec.add([offset, scaleTranslation]));
        vec.set(scaleTranslation, 0);

        if (scaleOffset.value < 1) {
          // make sure we don't add stuff below the 1
          scaleOffset.value = 1;

          // this runs the spring animation
          scale.value = withTiming(1, timingConfig);
        } else if (scaleOffset.value > MAX_SCALE) {
          scaleOffset.value = MAX_SCALE;
          scale.value = withTiming(MAX_SCALE, timingConfig);
        }

        maybeRunOnEnd();
      },
    });

    // FIXME: Tap gesture handler is not working
    const onTapEvent = useAnimatedGestureHandler({
      onStart: () => {
        cancelAnimation(offset.x);
        cancelAnimation(offset.y);
      },

      onEnd: () => {
        maybeRunOnEnd();
      },
    });

    const animatedStyles = useAnimatedStyle<ViewStyle>(() => {
      const noOffset = offset.x.value === 0 && offset.y.value === 0;
      const noTranslation =
        translation.x.value === 0 && translation.y.value === 0;
      const noScaleTranslation =
        scaleTranslation.x.value === 0 &&
        scaleTranslation.y.value === 0;

      const pagerNextState =
        scale.value === 1 &&
        noOffset &&
        noTranslation &&
        noScaleTranslation;

      onPageStateChange(pagerNextState);

      return {
        transform: [
          {
            translateX:
              scaleTranslation.x.value +
              translation.x.value +
              offset.x.value,
          },
          {
            translateY:
              scaleTranslation.y.value +
              translation.y.value +
              offset.y.value,
          },
          { scale: scale.value },
        ],
      };
    });

    return (
      <Animated.View
        style={[styles.container, { width: windowDimensions.width }]}
      >
        <PinchGestureHandler
          ref={pinchRef}
          // enabled={false}
          onGestureEvent={onScaleEvent}
          simultaneousHandlers={[panRef, tapRef, ...pagerRefs]}
          onHandlerStateChange={onScaleEvent}
        >
          <Animated.View style={styles.fill}>
            <PanGestureHandler
              ref={panRef}
              minDist={5}
              avgTouches
              simultaneousHandlers={[pinchRef, tapRef, ...pagerRefs]}
              onGestureEvent={onPanEvent}
              onHandlerStateChange={onPanEvent}
            >
              <Animated.View style={styles.fill}>
                <TapGestureHandler
                  ref={tapRef}
                  numberOfTaps={1}
                  simultaneousHandlers={[
                    pinchRef,
                    panRef,
                    ...pagerRefs,
                  ]}
                  onGestureEvent={onTapEvent}
                  onHandlerStateChange={onTapEvent}
                >
                  <Animated.View style={styles.fill}>
                    <Animated.View style={styles.wrapper}>
                      <Animated.View style={animatedStyles}>
                        <Image
                          source={imageSource}
                          // resizeMode="cover"
                          style={{
                            width: targetWidth,
                            height: targetHeight,
                          }}
                        />
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                </TapGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    );
  },
);
