import React, { useContext, useEffect } from 'react';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import { generateImageList } from '../utils/generateImageList';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  GalleryItemType,
  LightBoxItem,
  LightboxItemPayloadType,
  useAnimatedGestureHandler,
  useSharedValue,
} from '../../../src';

const dimensions = Dimensions.get('window');

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

const LIST = generateImageList(3);

interface ListItemProps {
  item: GalleryItemType;
  index: number;
  onPress: (
    payload: LightboxItemPayloadType<GalleryItemType>,
  ) => void;
}

const AnimatedImage = Animated.createAnimatedComponent(
  Image,
) as typeof Image;

const GalleryContext = React.createContext<null | {}>(null);

interface ProviderProps {
  children: JSX.Element;
}

function GalleryProvider({ children }: ProviderProps) {
  return (
    <GalleryContext.Provider value={null}>
      {children}
    </GalleryContext.Provider>
  )
}

function useGalleryContext() {
  return useContext(GalleryContext);
}

function useGalleryItem(index: number) {
  const ref = useAnimatedRef<any>();
  const opacity = useSharedValue(1);
  const styles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const gallery = useGalleryContext();

  useEffect(() => {

  }, []);

  const onGestureEvent = useAnimatedGestureHandler({
    onFinish: (_evt, _ctx, isCanceledOrFailed) => {
      if (isCanceledOrFailed) {
        return;
      }

      // measure the image
      // width/height and position to animate from it to the full screen one
      const measurements = measure(ref);

      x.value = measurements.pageX;
      y.value = measurements.pageY;
      width.value = measurements.width;
      height.value = measurements.height;
    },
  });

  return {
    ref,
    styles,
    onGestureEvent,
  };
}

function ListItem({ item, onPress, index }: ListItemProps) {
  const { ref, onGestureEvent, styles } = useGalleryItem(index);

  return (
    <TapGestureHandler onGestureEvent={onGestureEvent}>
      <AnimatedImage
        ref={ref}
        style={[LIST.getContainerStyle(index), styles]}
        source={{ uri: item.uri }}
        width={LIST.IMAGE_SIZE}
        height={LIST.IMAGE_SIZE}
      />
    </TapGestureHandler>
  );
}

export function LightboxSharedTransitionList() {
  const nav = useNavigation();

  function onNavigate() {
    nav.navigate('LightboxSharedTransitionScreen', {});
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.list}>
        {LIST.images.map((item, index) => (
          <ListItem
            key={item.id}
            onPress={onNavigate}
            index={index}
            item={item}
          />
        ))}
      </ScrollView>
    </View>
  );
}
