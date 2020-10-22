import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import {
  PanGestureHandlerGestureEvent,
  TapGestureHandler,
} from 'react-native-gesture-handler';
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

import {
  createAnimatedGestureHandler,
  useAnimatedGestureHandler,
} from '../useAnimatedGestureHandler';
import { useAnimatedReaction, useSharedValue } from '../utils';

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

export interface GalleryItemItemPayloadType<T> extends Measurements {
  index?: number;
  item: T;
}

export interface LightBoxItemProps<T> {
  item: T;
  children: JSX.Element;
  index?: number;
  onPress: (payload: GalleryItemItemPayloadType<T>) => void;
}

export function GalleryItem<T>({
  children,
  onPress,
  index,
  item,
}: LightBoxItemProps<T>) {
  const ref = useAnimatedRef<Animated.View>();
  const opacity = useSharedValue(1);

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
      opacity: opacity.value,
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
