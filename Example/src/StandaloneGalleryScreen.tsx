import React from 'react';
import { Dimensions, StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  useGalleryInit,
  StandaloneGallery,
} from 'reanimated-gallery';

const dimensions = Dimensions.get('window');

const ImageComponent = Animated.createAnimatedComponent(Image);

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const heights = [300, 400, 500, 540, 580, 600];

const images = Array.from({ length: 300 }, (_, index) => {
  const height =
    heights[getRandomIntInclusive(0, heights.length - 1)];

  return {
    uri: `https://picsum.photos/id/${index + 200}/${height}/400`,
    width: height,
    height: dimensions.width,
  };
});

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default function ImageGalleryScreen() {
  useGalleryInit();

  return (
    <StandaloneGallery images={images} />
  );
}
