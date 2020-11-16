import { useEffect, useLayoutEffect } from 'react';
import {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useAnimatedGestureHandler } from '../useAnimatedGestureHandler';
import {
  GalleryManagerSharedValues,
  useGalleryManager,
} from './GalleryManager';

interface GalleryProps {
  children: JSX.Element;
}

export function GalleryList({ children }: GalleryProps) {
  const galleryManager = useGalleryManager();

  useLayoutEffect(() => {
    galleryManager.init();

    return () => {
      galleryManager.reset();
    };
  }, []);

  return children;
}

export function measureItem(
  ref: React.RefObject<any>,
  sharedValues: GalleryManagerSharedValues,
) {
  'worklet';

  const measurements = measure(ref);

  sharedValues.x.value = measurements.pageX;
  sharedValues.y.value = measurements.pageY;
  sharedValues.width.value = measurements.width;
  sharedValues.height.value = measurements.height;
}

export function setOffTheScreen(
  sharedValues: GalleryManagerSharedValues,
) {
  'worklet';

  sharedValues.x.value = 999999;
  sharedValues.y.value = 999999;
  sharedValues.width.value = 0;
  sharedValues.height.value = 0;
}

export function useGalleryItem(
  index: number,
  onPress: (itemIndex: number) => void,
) {
  const galleryManager = useGalleryManager();
  const ref = useAnimatedRef<any>();

  const { opacity, activeIndex } = galleryManager!.sharedValues;

  const styles = useAnimatedStyle(() => ({
    opacity: activeIndex.value === index ? opacity.value : 1,
  }));

  useEffect(() => {
    galleryManager.registerItem(index, ref);
  }, []);

  const onGestureEvent = useAnimatedGestureHandler({
    onFinish: (_evt, _ctx, isCanceledOrFailed) => {
      if (isCanceledOrFailed) {
        return;
      }

      // measure the image
      // width/height and position to animate from it to the full screen one
      measureItem(ref, galleryManager.sharedValues);

      activeIndex.value = index;

      runOnJS(onPress)(index);
    },
  });

  return {
    ref,
    styles,
    onGestureEvent,
  };
}
