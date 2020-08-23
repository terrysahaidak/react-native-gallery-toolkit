import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Dimensions,
  View,
  Text,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Video from 'react-native-video';

// eslint-disable-next-line import/no-extraneous-dependencies
import { StandaloneGallery } from 'reanimated-gallery';

import {
  RectButton,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useScreens } from 'react-native-screens';
import { createAnimatedGestureHandler } from '../../src/useAnimatedGestureHandler';

useScreens(true);

const dimensions = Dimensions.get('window');

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const heights = [300, 400, 500, 540, 580, 600];

type GalleryItemType =
  | {
      type: 'image';
      id: string;
      width: number;
      height: number;
      uri: string;
    }
  | {
      type: 'video';
      id: string;
      uri: string;
    };

const images: GalleryItemType[] = Array.from(
  { length: 5 },
  (_, index) => {
    const height =
      heights[getRandomIntInclusive(0, heights.length - 1)];

    return {
      type: 'image',
      id: index.toString(),
      uri: `https://picsum.photos/id/${index + 100}/${height}/400`,
      width: height,
      height: dimensions.width,
    };
  },
);

images.push({
  type: 'video',
  id: '8',
  uri:
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
});

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
        backgroundColor: 'black',
        padding: 16,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: 'white' }}>{text}</Text>
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

  const translateY = useSharedValue(1);

  const galleryRef = useRef<StandaloneGallery<GalleryItemType>>(null);

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
  const aStyles2 = useAnimatedStyle(() => {
    if (headerShown.value) {
      return {
        opacity: withTiming(0),
      };
    }

    return {
      opacity: withTiming(1),
    };
  });

  function handleClose() {
    nav.goBack();
  }

  const handler = useCallback(
    createAnimatedGestureHandler<PanGestureHandlerGestureEvent, {}>({
      shouldHandleEvent: (evt) => {
        'worklet';

        return (
          evt.numberOfPointers === 1 &&
          Math.abs(evt.velocityX) < Math.abs(evt.velocityY)
        );
      },

      onActive: (evt) => {
        'worklet';

        translateY.value = evt.translationY;
      },

      onEnd: () => {
        if (translateY.value > 80) {
          handleClose();
        } else {
          translateY.value = withTiming(0);
        }
      },
    }),
    [],
  );

  const translateStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'black',
          },
          aStyles2,
        ]}
      />

      <Animated.View
        style={[translateStyles, StyleSheet.absoluteFill]}
      >
        <StandaloneGallery
          ref={galleryRef}
          initialIndex={1}
          items={images}
          keyExtractor={(item) => item.id}
          gutterWidth={24}
          onIndexChange={onIndexChange}
          getItem={(data, i) => {
            return data[i];
          }}
          renderPage={({ item, ...rest }) => {
            if (item.type === 'image') {
              return (
                <StandaloneGallery.ImageRenderer
                  item={item}
                  {...rest}
                />
              );
            }

            return null;

            // return (
            //   <Video
            //     // controls
            //     // paused
            //     style={{
            //       ...StyleSheet.absoluteFillObject,
            //       top: 120,
            //       bottom: 120,
            //     }}
            //     source={{ uri: item.uri }}
            //   />
            // );
          }}
          onInteraction={() => {
            hide();
          }}
          onTap={() => {
            toggleHeaderShown();
          }}
          onDoubleTap={(isScaled) => {
            if (!isScaled) {
              hide();
            }
          }}
          numToRender={2}
          onGesture={(evt, isActive) => {
            'worklet';

            if (isActive.value) {
              handler(evt);
            }
          }}
          // onPagerTranslateChange={(translateX) => {
          //   console.log(translateX);
          // }}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            flexDirection: 'row',
            position: 'absolute',
            padding: 20,
            bottom: 0,
            left: 0,
            right: 0,
            flex: 1,
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: 'white',
          },
          aStyles,
        ]}
      >
        <Button onPress={onBack} text="Back" />

        <Text>Index: {index}</Text>

        <Button onPress={onNext} text="Next" />
      </Animated.View>
    </View>
  );
}
