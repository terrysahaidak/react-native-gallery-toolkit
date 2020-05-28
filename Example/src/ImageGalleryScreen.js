import React from 'react';
import FastImage from 'react-native-fast-image';
import {
  Dimensions,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {
  useGalleryItem,
  GalleryProvider,
  GalleryOverlay,
} from './Gallery';

const dimensions = Dimensions.get('window');

const ImageComponent = Platform.select({
  android: Image,
  ios: FastImage,
});

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const heights = [300, 400, 500, 540, 580, 600];

const images = Array.from({ length: 3 }, (_, index) => {
  const height =
    heights[getRandomIntInclusive(0, heights.length - 1)];

  return {
    uri: `https://picsum.photos/id/${index + 200}/${height}/400`,
    width: height,
    height: dimensions.width,
  };
});

const GUTTER_WIDTH = 3;
const NUMBER_OF_IMAGES = 4;
const IMAGE_SIZE =
  (dimensions.width - GUTTER_WIDTH * (NUMBER_OF_IMAGES - 1)) /
  NUMBER_OF_IMAGES;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

function ImageList({ images, onItemPress }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {images.map((item, i) => (
        <ListItem
          onPress={onItemPress}
          key={i}
          index={i}
          item={item}
        />
      ))}
    </ScrollView>
  );
}

function ListItem({ item, index }) {
  const { ref, onPress } = useGalleryItem({
    index,
    item,
  });

  const containerStyle = {
    marginRight: (index + 1) % 4 === 0 ? 0 : GUTTER_WIDTH,
    marginBottom: GUTTER_WIDTH,
  };

  return (
    <TouchableWithoutFeedback
      style={containerStyle}
      onPress={onPress}
    >
      <ImageComponent
        ref={ref}
        source={{ uri: item.uri }}
        style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
        resizeMode={FastImage.resizeMode.cover}
      />
    </TouchableWithoutFeedback>
  );
}

export default function ImageGalleryScreen() {
  // const dimensions = normalizeDimensions(images[0]);
  // return (
  //   <ImageTransformer
  //     {...{
  //       width: dimensions.targetWidth,
  //       height: dimensions.targetHeight,
  //       uri: images[0].uri,
  //     }}
  //   />
  // );

  return (
    <GalleryOverlay>
      <GalleryProvider totalCount={images.length}>
        <ImageList images={images} />
      </GalleryProvider>
    </GalleryOverlay>
  );
}
