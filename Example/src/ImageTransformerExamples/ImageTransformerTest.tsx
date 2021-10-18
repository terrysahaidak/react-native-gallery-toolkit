import { ImageTransformer } from '@gallery-toolkit/image-transformer';
import { useHeaderHeight } from '@react-navigation/stack';
import React from 'react';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const image = {
  id: '4',
  width: 400,
  height: 300,
  uri: 'https://placekitten.com/400/300',
};

export default function StandaloneGalleryBasicScreen() {
  const headerHeight = useHeaderHeight();
  return (
    <ImageTransformer
      windowDimensions={{
        height: height - headerHeight,
        width,
      }}
      width={image.width}
      height={image.height}
      source={image.uri}
    />
  );
}
