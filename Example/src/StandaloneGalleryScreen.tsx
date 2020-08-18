import React, { useRef, useState } from 'react';
import { Dimensions, Image, View, Text } from 'react-native';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  useGalleryInit,
  StandaloneGallery,
  GalleryItemType,
  StandaloneGalleryHandler,
} from 'reanimated-gallery';

import { RectButton } from 'react-native-gesture-handler';

const dimensions = Dimensions.get('window');

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const heights = [300, 400, 500, 540, 580, 600];

const images: GalleryItemType[] = Array.from(
  { length: 2 },
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

// const images: GalleryItemType[] = [
//   {
//     id: '1',
//     source: require('./assets/magenta_1.jpg'),
//     width: 3072,
//     height: 4608,
//   },
//   {
//     id: '2',
//     source: require('./assets/magenta_2.jpg'),
//     width: 2316,
//     height: 3088,
//   },
// ];

export default function ImageGalleryScreen() {
  useGalleryInit();

  const [index, setIndex] = useState(20);

  const galleryRef = useRef<StandaloneGalleryHandler>(null);

  function onIndexChange(nextIndex: number) {
    setIndex(nextIndex);
  }

  function onNext() {
    galleryRef.current!.goNext();
  }

  function onBack() {
    galleryRef.current!.goBack();
  }

  return (
    <View style={{ backgroundColor: 'black', flex: 1 }}>
      <StandaloneGallery
        ref={galleryRef}
        ImageComponent={Image}
        initialIndex={1}
        images={images}
        gutterWidth={24}
        onIndexChange={onIndexChange}
        getItem={(data, i) => {
          return data[i];
        }}
        onInteraction={() => {
          'worklet';

          console.log('Interaction');
        }}
        onTap={() => {
          'worklet';

          console.log('tap');
        }}
        onDoubleTap={() => {
          'worklet';

          console.log('double tap');
        }}
        // onPagerTranslateChange={() => {}}
      />

      <View
        style={{
          flexDirection: 'row',
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          flex: 1,
          justifyContent: 'space-around',
        }}
      >
        <RectButton onPress={onBack}>
          <Text style={{ color: 'white' }}>Back</Text>
        </RectButton>

        <Text style={{ color: 'white' }}>{index}</Text>

        <RectButton onPress={onNext}>
          <Text style={{ color: 'white' }}>Next</Text>
        </RectButton>
      </View>
    </View>
  );
}
