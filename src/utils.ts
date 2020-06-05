import { Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { IGalleryItem } from './GalleryState';

const dimensions = Dimensions.get('window');

export function normalizeDimensions(
  item: IGalleryItem,
  targetWidth = dimensions.width,
) {
  const scaleFactor = item.width / targetWidth;
  const targetHeight = item.height / scaleFactor;

  return {
    targetWidth,
    targetHeight,
  };
}

export function friction(value: number) {
  'worklet';

  const MAX_FRICTION = 30;
  const MAX_VALUE = 200;

  const res = Math.max(
    1,
    Math.min(
      MAX_FRICTION,
      1 + (Math.abs(value) * (MAX_FRICTION - 1)) / MAX_VALUE,
    ),
  );

  if (value < 0) {
    return -res;
  }

  return res;
}

// in order to simultaneousHandlers to work
// we need to trigger rerender of the screen
// so refs will be valid then
export function fixGestureHandler() {
  const [, set] = useState(0);

  useEffect(() => {
    set((v) => v + 1);
  }, []);
}

export function getShouldRender(
  index: number,
  activeIndex: number,
  diffValue = 3,
) {
  const diff = Math.abs(index - activeIndex);

  if (diff > diffValue) {
    return false;
  }

  return true;
}

export function clamp(
  value: number,
  lowerBound: number,
  upperBound: number,
) {
  'worklet';

  return Math.min(Math.max(lowerBound, value), upperBound);
}
