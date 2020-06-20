import React from 'react';
import { Dimensions, Image } from 'react-native';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  useGalleryInit,
  StandaloneGallery,
  GalleryItemType,
} from 'reanimated-gallery';

const dimensions = Dimensions.get('window');

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const heights = [300, 400, 500, 540, 580, 600];

const images: GalleryItemType[] = Array.from(
  { length: 300 },
  (_, index) => {
    const height =
      heights[getRandomIntInclusive(0, heights.length - 1)];

    return {
      id: index.toString(),
      uri: `https://picsum.photos/id/${index + 200}/${height}/400`,
      width: height,
      height: dimensions.width,
    };
  },
);

export default function ImageGalleryScreen() {
  useGalleryInit();

  return (
    <StandaloneGallery
      ImageComponent={Image}
      initialIndex={20}
      images={images}
    />
  );
}
