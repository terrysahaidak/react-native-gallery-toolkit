import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  GestureHandlerGestureEventNativeEvent,
  PanGestureHandlerEventExtra,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PhotoViewScreenRoute } from '.';
import {
  createAnimatedGestureHandler,
  GalleryItemType,
  StandaloneGallery,
  useAnimatedReaction,
  useSharedValue,
} from '../../../src';
import {
  useGalleryManager,
  GalleryManagerItems,
  GalleryManagerItem,
} from './PhotosListScreen';

const defaultTimingConfig = {
  duration: 300,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

interface LightboxSwipeoutProps {
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
  source: any;
  timingConfig: Animated.WithTimingConfig;
  toValue: number;
  sharedValues: GalleryManagerItem['sharedValues'];
  windowDimensions: ScaledSize;
}

function LightboxSwipeout({
  children,
  source,
  timingConfig = defaultTimingConfig,
  toValue = Dimensions.get('window').height,
  sharedValues,
  windowDimensions = Dimensions.get('window'),
  callback,
}: LightboxSwipeoutProps) {
  const imageSource =
    typeof source === 'string'
      ? {
          uri: source,
        }
      : source;

  const animationProgress = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const [renderChildren, setRenderChildren] = useState<boolean>(
    false,
  );

  const {
    x,
    y,
    targetHeight,
    targetWidth,
    width,
    height,
    opacity,
  } = sharedValues;

  const runHideAnimation = useCallback(() => {
    'worklet';
  }, []);

  const shouldHandleEvent = () => {
    'worklet';

    return translateY.value === 0;
  };

  useAnimatedReaction(
    () => translateY.value,
    (value) => {
      // onTranslateChange(value);

      if (Math.abs(value) >= toValue + 100) {
        cancelAnimation(translateY);
      }
    },
  );

  useEffect(() => {
    // onReady();
    animationProgress.value = withTiming(1, timingConfig, () => {
      'worklet';

      // opacity.value = 1;
      // setRenderChildren(true);
    });
  }, []);

  const handler = useCallback(
    createAnimatedGestureHandler<PanGestureHandlerGestureEvent, {}>({
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

        // if (onActive) {
        //   onActive(translateY.value);
        // }
      },

      onEnd: (evt) => {
        'worklet';

        const enoughVelocity = Math.abs(evt.velocityY) > 30;
        const rightDirection =
          (evt.translationY > 0 && evt.velocityY > 0) ||
          (evt.translationY < 0 && evt.velocityY < 0);

        if (enoughVelocity && rightDirection) {
          const elementVisible = false;

          if (elementVisible) {
            // imageOpacity.value = 1;
            // opacity.value = 0;
            animationProgress.value = withTiming(
              0,
              timingConfig,
              () => {
                'worklet';

                callback();
              },
            );
          } else {
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
              () => {
                'worklet';

                callback();
              },
            );
          }
        } else {
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

  const childrenAnimateStyle = useAnimatedStyle(
    () => ({
      // opacity: childOpacity.value,
    }),
    [],
  );

  const imageStyles = useAnimatedStyle(() => {
    const interpolateProgress = (range: [number, number]) =>
      interpolate(animationProgress.value, [0, 1], range);

    const targetX = 0;
    const targetY =
      (windowDimensions.height - targetHeight.value) / 2;

    const top =
      translateY.value + interpolateProgress([y.value, targetY]);
    const left =
      translateX.value + interpolateProgress([x.value, targetX]);

    return {
      opacity: opacity.value,
      position: 'absolute',
      top,
      left,
      width: interpolateProgress([width.value, targetWidth.value]),
      height: interpolateProgress([height.value, targetHeight.value]),
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });
  return (
    <>
      <Animated.View style={imageStyles}>
        {children({ onGesture: handler, shouldHandleEvent })}
      </Animated.View>
    </>
  );
}

interface DimensionsType {
  width: number;
  height: number;
}

interface GalleryViewProps {
  initialIndex: number;
  items: GalleryItemType[];
  getItem?: (index: number, items: unknown) => GalleryItemType;
}

function GalleryView({
  initialIndex,
  items,
  getItem,
  onBack,
}: GalleryViewProps) {
  const galleryManager = useGalleryManager();

  const localIndexSv = useSharedValue(initialIndex);

  const [localIndex, setLocalIndex] = useState(initialIndex);

  const item = Array.isArray(items)
    ? items[localIndex]
    : getItem(localIndex, items);

  const managerItem = galleryManager.resolveItem(initialIndex);

  // useAnimatedReaction(
  //   () => {
  //     return [galleryManager.measurementsByIndex.value, localIndexSv] as any;
  //   },
  //   ([measurementsByIndex, index]: [GalleryManagerItems, number]) => {
  //     const item = measurementsByIndex[index];
  //   },
  // );

  const onIndexChange = useCallback((nextIndex: number) => {
    setLocalIndex(nextIndex);
    // galleryManager.setActiveIndex(nextIndex);
  }, []);

  return (
    <LightboxSwipeout
      callback={onBack}
      sharedValues={managerItem.sharedValues}
      source={item.uri}
    >
      {({ onGesture, shouldHandleEvent }) => (
        <StandaloneGallery
          items={items}
          onIndexChange={onIndexChange}
          shouldPagerHandleGestureEvent={shouldHandleEvent}
          // onShouldHideControls={setControlsHidden}
          initialIndex={initialIndex}
          onPagerEnabledGesture={onGesture}
        />
      )}
    </LightboxSwipeout>
  );
}

export function PhotoViewScreen() {
  const nav = useNavigation();
  const { index, list } = useRoute<PhotoViewScreenRoute>().params;

  return (
    <GalleryView
      onBack={nav.goBack}
      initialIndex={index}
      items={list}
    />
  );
}
