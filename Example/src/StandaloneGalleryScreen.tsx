import React, { useRef, useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  View,
  Text,
  StatusBar,
} from 'react-native';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  StandaloneGallery,
  GalleryItemType,
  StandaloneGalleryHandler,
} from 'reanimated-gallery';

import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const dimensions = Dimensions.get('window');

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const heights = [300, 400, 500, 540, 580, 600];

const images: GalleryItemType[] = Array.from(
  { length: 5 },
  (_, index) => {
    const height =
      heights[getRandomIntInclusive(0, heights.length - 1)];

    return {
      id: index.toString(),
      uri: `https://picsum.photos/id/${index + 100}/${height}/400`,
      width: height,
      height: dimensions.width,
    };
  },
);

function Button({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) {
  return (
    <RectButton
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
      }}
    >
      <Text>{text}</Text>
    </RectButton>
  );
}

export function useToggleOpacity(prop: boolean) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(1);
  const styles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (prop) {
      translateY.value = 0;
      opacity.value = withTiming(1);
    } else {
      opacity.value = withTiming(0, undefined, () => {
        translateY.value = -99999;
      });
    }
  }, [prop]);

  return styles;
}

export default function ImageGalleryScreen() {
  const nav = useNavigation();

  const [index, setIndex] = useState(20);
  const headerShown = useSharedValue(true);

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

  function setHeaderShown(value: boolean) {
    headerShown.value = value;
    nav.setParams({ headerShown: value });

    StatusBar.setHidden(!value);
  }

  function toggleHeaderShown() {
    const nextValue = !headerShown.value;
    setHeaderShown(nextValue);
  }

  function hide() {
    setHeaderShown(false);
  }

  const aStyles = useToggleOpacity(headerShown.value);

  return (
    <View style={{ backgroundColor: 'black', flex: 1 }}>
      <StatusBar translucent />
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
          hide();
        }}
        onTap={() => {
          toggleHeaderShown();
        }}
        onDoubleTap={() => {
          hide();
        }}
        // onPagerTranslateChange={() => {}}
      />

      <Animated.View
        style={[
          {
            flexDirection: 'row',
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            flex: 1,
            justifyContent: 'space-around',
            alignItems: 'center',
          },
          aStyles,
        ]}
      >
        <Button onPress={onBack} text="Back" />

        <Text style={{ color: 'white' }}>{index}</Text>

        <Button onPress={onNext} text="Next" />
      </Animated.View>
    </View>
  );
}
