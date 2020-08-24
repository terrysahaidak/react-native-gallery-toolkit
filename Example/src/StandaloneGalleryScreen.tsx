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
  ActivityIndicator,
} from 'react-native';
import Image from 'react-native-fast-image';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  StandaloneGallery,
  createAnimatedGestureHandler,
  RenderImageProps,
  
} from 'reanimated-gallery';

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
  type: 'image',
  id: '8',
  uri: 'https://picsum.photos/id/index/height/400',
  width: 200,
  height: 200,
});

images.push({
  type: 'video',
  id: '7',
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

function ImageRender({
  width,
  height,
  source,
  onLoad,
}: RenderImageProps) {
  const [isLoading, setLoadingState] = useState(true);
  const [isError, setErrorState] = useState(false);

  return (
    <>
      {isLoading && (
        <View
          style={{
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
            ...StyleSheet.absoluteFillObject,
          }}
        >
          <ActivityIndicator size="large" color="blue" />
        </View>
      )}
      {isError && (
        <View
          style={{
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 80,
            ...StyleSheet.absoluteFillObject,
          }}
        >
          <Text>Error loading image</Text>
        </View>
      )}
      <Image
        onError={() => {
          setErrorState(true);
        }}
        onLoad={() => {
          onLoad();
          setLoadingState(false);
        }}
        style={{
          width,
          height,
        }}
        source={source}
      />
    </>
  );
}

export default function ImageGalleryScreen() {
  const nav = useNavigation();

  const [index, setIndex] = useState(20);
  const headerShown = useSharedValue(true);

  const translateY = useSharedValue(0);
  const bottomTranslateY = useSharedValue(0);

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

  const opacityAnimatedStyles = useToggleOpacity(headerShown.value);

  const translateYAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bottomTranslateY.value }],
    };
  });

  function handleClose() {
    nav.goBack();
  }

  function shouldPagerHandleGestureEvent() {
    'worklet';

    return translateY.value === 0;
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

        bottomTranslateY.value =
          evt.translationY > 0 ? evt.translationY : 0;
      },

      onEnd: () => {
        if (translateY.value > 80) {
          translateY.value = withTiming(-800, undefined);

          handleClose();
        } else {
          translateY.value = withTiming(0);
          bottomTranslateY.value = withTiming(0);
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
        style={[translateStyles, StyleSheet.absoluteFill]}
      >
        <StandaloneGallery
          ref={galleryRef}
          initialIndex={1}
          items={images}
          keyExtractor={(item) => item.id}
          gutterWidth={24}
          onIndexChange={onIndexChange}
          renderImage={(props) => {
            return <ImageRender {...props} />;
          }}
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

            // TODO: Figure out why Video component is not working
            return (
              <View>
                <Text>I can be a video</Text>
              </View>
            );
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
          shouldPagerHandleGestureEvent={
            shouldPagerHandleGestureEvent
          }
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
          opacityAnimatedStyles,
          translateYAnimatedStyles,
        ]}
      >
        <Button onPress={onBack} text="Back" />

        <Text>Index: {index}</Text>

        <Button onPress={onNext} text="Next" />
      </Animated.View>
    </View>
  );
}
