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
  makeMutable,
  runOnUI,
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
import { useHeaderHeight } from '@react-navigation/stack';

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

const LIST = generateImageList(10);

const AnimatedImage = Animated.createAnimatedComponent(
  Image,
) as typeof Image;

export interface GalleryManagerItem {
  index: number;
  ref: React.Ref<unknown>;
}

export interface GalleryManagerSharedValues {
  width: Animated.SharedValue<number>;
  height: Animated.SharedValue<number>;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  activeIndex: Animated.SharedValue<number>;
}

export interface GalleryManagerItems {
  [index: number]: GalleryManagerItem;
}

interface GalleryManagerInitProps {
  sv: Animated.SharedValue<null>;
}

class GalleryManager {
  private _isInitialized = false;
  private refsByIndexSV: Animated.SharedValue<null | GalleryManagerItems> = makeMutable(
    {},
  );
  public sharedValues: GalleryManagerSharedValues = {
    width: makeMutable(0),
    height: makeMutable(0),
    x: makeMutable(0),
    y: makeMutable(0),
    opacity: makeMutable(1),
    activeIndex: makeMutable(0),
  };

  public items = new Map<number, any>();

  public get isInitialized() {
    return this._isInitialized;
  }

  public resolveItem(index: number) {
    return this.items.get(index);
  }

  public init({ sv }: GalleryManagerInitProps) {
    this._isInitialized = true;
  }

  public reset() {
    this._isInitialized = false;
    this.items.clear();
    this.refsByIndexSV.value = null;
  }

  public resetSharedValues() {
    const {
      width,
      height,
      opacity,
      activeIndex,
      x,
      y,
    } = this.sharedValues;
    runOnUI(() => {
      width.value = 0;
      height.value = 0;
      opacity.value = 1;
      activeIndex.value = -1;
      x.value = 0;
      y.value = 0;
    })();
  }

  public registerItem(index: number, ref) {
    if (this.items.has(index)) {
      return;
    }

    this._addItem(index, ref);
  }

  private _addItem(index: number, ref: GalleryManagerItem['ref']) {
    this.items.set(index, {
      index,
      ref,
    });

    console.log('register', index, this.items);

    this.refsByIndexSV.value = this._convertMapToObject(this.items);
  }

  private _convertMapToObject<
    T extends Map<string | number, unknown>
  >(map: T) {
    const obj = {};
    for (let [key, value] of map) {
      obj[key] = value;
    }
    return obj;
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

export function measureItem(
  ref: React.RefObject<any>,
  sharedValues: GalleryManagerSharedValues,
) {
  'worklet';

  const measurements = measure(ref);

  console.log(measurements);

  sharedValues.x.value = measurements.pageX;
  sharedValues.y.value = measurements.pageY;
  sharedValues.width.value = measurements.width;
  sharedValues.height.value = measurements.height;
}

function useGalleryItem(
  index: number,
  onPress: (itemIndex: number) => void,
) {
  const galleryManager = useGalleryManager();
  const ref = useAnimatedRef<any>();

  const { opacity, activeIndex } = galleryManager.sharedValues;

  const styles = useAnimatedStyle(() => ({
    opacity: activeIndex.value === index ? opacity.value : 1,
  }));

  useEffect(() => {
    galleryManager.registerItem(index, ref);
  }, []);

  const onGestureEvent = useAnimatedGestureHandler({
    onFinish: (_evt, _ctx, isCanceledOrFailed) => {
      if (isCanceledOrFailed) {
        return;
      }

      // measure the image
      // width/height and position to animate from it to the full screen one
      measureItem(ref, galleryManager.sharedValues);

      activeIndex.value = index;

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
  const headerHeight = useHeaderHeight();
  const { ref, onGestureEvent, styles } = useGalleryItem(
    index,
    onPress,
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
