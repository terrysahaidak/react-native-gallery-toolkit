import { Dimensions } from 'react-native';

const dimensions = Dimensions.get('window');

export function normalizeDimensions(
  item,
  targetWidth = dimensions.width,
) {
  const scaleFactor = item.width / targetWidth;
  const targetHeight = item.height / scaleFactor;

  return {
    targetWidth,
    targetHeight,
  };
}
