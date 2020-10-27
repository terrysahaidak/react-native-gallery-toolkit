import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import {
  ScrollView,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { generateImageList } from '../utils/generateImageList';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  Dimensions,
  Image,
  ScaledSize,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  GalleryItemType,
  LightboxItemPayloadType,
  useAnimatedGestureHandler,
  useSharedValue,
} from '../../../src';
import { PhotoListNavigationProp } from '.';

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

const AnimatedImage = Animated.createAnimatedComponent(
  Image,
) as typeof Image;

export interface GalleryManagerItem {
  index: number;
  ref: React.Ref<unknown>;
  sharedValues: {
    width: Animated.SharedValue<number>;
    height: Animated.SharedValue<number>;
    targetWidth: Animated.SharedValue<number>;
    targetHeight: Animated.SharedValue<number>;
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
    opacity: Animated.SharedValue<number>;
  };
}

export interface GalleryManagerItems {
  [index: number]: GalleryManagerItem;
}

interface GalleryManagerInitProps {
  sv: Animated.SharedValue<null>;
}

class GalleryManager {
  private _isInitialized = false;
  private _sv: Animated.SharedValue<null | GalleryManagerItems>;

  public items: GalleryManagerItems = {};

  public get isInitialized() {
    return this._isInitialized;
  }

  public get measurementsByIndex() {
    return this._sv;
  }

  public resolveItem(index: number) {
    return this.items[index];
  }

  public init({ sv }: GalleryManagerInitProps) {
    this._sv = sv;

    this._isInitialized = true;
  }

  public reset() {
    this._isInitialized = false;
    this.items = {};
    this._sv.value = null;
  }

  public registerItem(index: number, ref, sharedValues) {
    const exists = !!this.items[index];

    if (exists) {
      return;
    }

    this._addItem(index, ref, sharedValues);
  }

  private _addItem(
    index: number,
    ref: GalleryManagerItem['ref'],
    sharedValues: GalleryManagerItem['sharedValues'],
  ) {
    this.items[index] = {
      index,
      ref,
      sharedValues,
    };

    this._sv.value = this.items;
  }
}

const GalleryContext = React.createContext<null | GalleryManager>(
  null,
);

interface ProviderProps {
  children: JSX.Element;
}

export function GalleryProvider({ children }: ProviderProps) {
  const galleryManager = useMemo(() => new GalleryManager(), []);

  return (
    <GalleryContext.Provider value={galleryManager}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGalleryManager() {
  const gallery = useContext(GalleryContext);

  return gallery;
}

interface DimensionsType {
  width: number;
  height: number;
}

function measureItem(
  item: DimensionsType,
  ref: React.RefObject<any>,
  sharedValues: GalleryManagerItem['sharedValues'],
  windowDimensions: ScaledSize,
) {
  'worklet';

  const measurements = measure(ref);

  sharedValues.x.value = measurements.pageX;
  sharedValues.y.value = measurements.pageY;
  sharedValues.width.value = measurements.width;
  sharedValues.height.value = measurements.height;

  sharedValues.targetWidth.value = windowDimensions.width;
  const scaleFactor = item.width / sharedValues.targetWidth.value;
  sharedValues.targetHeight.value = item.height / scaleFactor;
}

function useGalleryItem(
  index: number,
  item: GalleryItemType,
  onPress: (itemIndex: number) => void,
  windowDimensions: ScaledSize,
) {
  const ref = useAnimatedRef<any>();

  const opacity = useSharedValue(1);
  const styles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const targetWidth = useSharedValue(0);
  const targetHeight = useSharedValue(0);

  const galleryManager = useGalleryManager();

  useEffect(() => {
    galleryManager.registerItem(index, ref, {
      x,
      y,
      width,
      height,
      targetWidth,
      targetHeight,
      opacity,
    });
  }, []);

  const onGestureEvent = useAnimatedGestureHandler({
    onFinish: (_evt, _ctx, isCanceledOrFailed) => {
      if (isCanceledOrFailed) {
        return;
      }

      // measure the image
      // width/height and position to animate from it to the full screen one
      measureItem(
        item,
        ref,
        {
          x,
          y,
          width,
          height,
          targetWidth,
          targetHeight,
          opacity,
        },
        windowDimensions,
      );

      onPress(index);
    },
  });

  return {
    ref,
    styles,
    onGestureEvent,
  };
}

interface ListItemProps {
  item: GalleryItemType;
  index: number;
  onPress: (index: number) => void;
}

function ListItem({ item, onPress, index }: ListItemProps) {
  const dimensions = useWindowDimensions();
  const { ref, onGestureEvent, styles } = useGalleryItem(
    index,
    item,
    onPress,
    dimensions,
  );

  return (
    <TapGestureHandler onGestureEvent={onGestureEvent}>
      <AnimatedImage
        ref={ref}
        style={[
          LIST.getContainerStyle(index),
          {
            width: LIST.IMAGE_SIZE,
            height: LIST.IMAGE_SIZE,
          },
          styles,
        ]}
        source={{ uri: item.uri }}
        width={LIST.IMAGE_SIZE}
        height={LIST.IMAGE_SIZE}
      />
    </TapGestureHandler>
  );
}

interface GalleryProps {
  children: JSX.Element;
}

export function GalleryList({ children }: GalleryProps) {
  const galleryManager = useGalleryManager();
  const sv = useSharedValue(null);

  useLayoutEffect(() => {
    galleryManager.init({
      sv,
    });

    return () => {
      galleryManager.reset();
    };
  }, []);

  return children;
}

export function PhotosListScreen() {
  const nav = useNavigation<PhotoListNavigationProp>();

  function onNavigate(itemIndex: number) {
    nav.navigate('Photo View', {
      index: itemIndex,
      list: LIST.images,
    });
  }

  return (
    <GalleryList>
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
    </GalleryList>
  );
}
