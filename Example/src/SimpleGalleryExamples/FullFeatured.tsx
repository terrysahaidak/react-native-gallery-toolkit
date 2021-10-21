// eslint-disable-next-line import/no-extraneous-dependencies
import { createAnimatedGestureHandler } from '@gallery-toolkit/common';
import type { RenderImageProps } from '@gallery-toolkit/image-transformer';
import {

  SimpleGallery
} from '@gallery-toolkit/simple-gallery';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationOptions } from '@react-navigation/stack';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions, Image, StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  PanGestureHandlerGestureEvent,
  RectButton
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  useWorkletCallback,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DetachedHeader,
  HeaderPropsScrapper
} from './DetachedHeader';

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

const s = StyleSheet.create({
  button: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: { color: 'white' },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    ...StyleSheet.absoluteFillObject,
  },
  bottomBar: {
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
});

function Button({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) {
  return (
    <RectButton onPress={onPress} style={s.button}>
      <Text style={s.buttonText}>{text}</Text>
    </RectButton>
  );
}

export function useToggleOpacity(
  prop: Animated.SharedValue<boolean>,
) {
  const translateY = useSharedValue(1);

  const styles = useAnimatedStyle(() => {
    if (prop.value) {
      return {
        opacity: withTiming(1),
        transform: [{ translateY: 0 }],
      };
    }

    return {
      opacity: withTiming(0, undefined, () => {
        translateY.value = -99999;
      }),
      transform: [{ translateY: translateY.value }],
    };
  }, []);

  return styles;
}

function ImageRender({
  width,
  height,
  source,
  onLoad,
  index,
}: RenderImageProps & {
  index: number;
}) {
  const [isLoading, setLoadingState] = useState(true);
  const [isError, setErrorState] = useState(false);

  return (
    <>
      {isLoading && (
        <View style={[s.loadingContainer, { width, height }]}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      )}
      {isError && (
        <View
          style={[
            {
              width,
              height,
            },
            s.errorContainer,
          ]}
        >
          <Text>Error loading image</Text>
        </View>
      )}
      <Image
        testID={`image-${index}`}
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

export default function FullFeatured() {
  const nav = useNavigation();

  const [index, setIndex] = useState(1);
  const headerShown = useSharedValue(true);

  const translateY = useSharedValue(0);
  const bottomTranslateY = useSharedValue(0);

  const galleryRef = useRef<SimpleGallery<GalleryItemType[]>>(
    null,
  );

  const onIndexChange = useWorkletCallback((nextIndex: number) => {
    runOnJS(setIndex)(nextIndex);
  }, []);

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

  const opacityAnimatedStyles = useToggleOpacity(headerShown);

  const translateYAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bottomTranslateY.value }],
    };
  }, []);

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
        'worklet';

        if (translateY.value > 80) {
          translateY.value = withTiming(
            -800,
            undefined,
            runOnJS(handleClose),
          );
        } else {
          translateY.value = withTiming(0);
          bottomTranslateY.value = withTiming(0);
        }
      },
    }),
    [],
  );

  const translateStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  }, []);

  const onInteraction = useWorkletCallback(() => {
    runOnJS(hide)();
  }, []);

  const onTap = useWorkletCallback(() => {
    runOnJS(toggleHeaderShown)();
  }, []);

  const onDoubleTap = useWorkletCallback((isScaled: boolean) => {
    if (!isScaled) {
      runOnJS(hide);
    }
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: 'black'  }}>
      <CustomHeader
        topInset={insets.top}
        bottomTranslateY={bottomTranslateY}
        headerShown={headerShown}
      />

      <Animated.View
        style={[translateStyles, StyleSheet.absoluteFill]}
      >
        <SimpleGallery
          ref={galleryRef}
          initialIndex={1}
          items={images}
          keyExtractor={(item) => item.id}
          gutterWidth={56}
          onIndexChange={onIndexChange}
          renderImage={(props, _, index) => {
            return <ImageRender index={index} {...props} />;
          }}
          renderPage={({ item, ...rest }) => {
            if (item.type === 'image') {
              return (
                <SimpleGallery.ImageRenderer item={item} {...rest} />
              );
            }

            // TODO: Figure out why Video component is not working
            return (
              <View>
                <Text>I can be a video</Text>
              </View>
            );
          }}
          onInteraction={onInteraction}
          onTap={onTap}
          onDoubleTap={onDoubleTap}
          numToRender={2}
          shouldPagerHandleGestureEvent={
            shouldPagerHandleGestureEvent
          }
          onPagerEnabledGesture={handler}
          // onPagerTranslateChange={(translateX) => {
          //   console.log(translateX);
          // }}
        />
      </Animated.View>

      <Animated.View
        style={[
          s.bottomBar,
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

function CustomHeader({
  bottomTranslateY,
  headerShown,
  topInset,
}: {
  bottomTranslateY: Animated.SharedValue<number>;
  headerShown: Animated.SharedValue<boolean>;
  topInset: number;
}) {
  const style = useAnimatedStyle(() => {
    return {
      paddingTop: topInset,
      zIndex: 1,
      transform: [
        {
          translateY: bottomTranslateY.value * -1,
        },
      ],
    };
  }, []);

  const opacityAnimatedStyles = useToggleOpacity(headerShown);

  return (
    <Animated.View style={[style, opacityAnimatedStyles]}>
      <DetachedHeader />
    </Animated.View>
  );
}

FullFeatured.options = (): StackNavigationOptions => ({
  header: HeaderPropsScrapper,
});
