import React, { useCallback, useMemo, useRef } from 'react';
import {
  Dimensions,
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
  FlatListProps,
} from 'react-native';
import {
  GalleryItemType,
  ScalableImage,
  Pager,
  RenderPageProps,
  normalizeDimensions,
} from '../../../../src';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Extrapolate,
  interpolate,
  withTiming,
  delay,
} from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { DetachedHeader } from '../../DetachedHeader';
import { useControls } from '../../hooks/useControls';
import { generateImageList } from '../../utils/generateImageList';
import { getConstants } from '../../utils/getConstants';
import s from './styles';

const { width } = Dimensions.get('window');

const heart = require('../../../assets/images/Heart.svg');
const bubble = require('../../../assets/images/Bubble.svg');
const airplane = require('../../../assets/images/Airplane.svg');
const bookmark = require('../../../assets/images/Bookmark.svg');

interface ListItemT {
  id: string;
  name: string;
  images: GalleryItemType[];
}

const data: ListItemT[] = [
  {
    id: '1',
    name: 'Spock',
    images: generateImageList(1, 256, 300).images,
  },
  {
    id: '2',
    name: 'Kirk',
    images: generateImageList(12, 200, 400).images,
  },
  {
    id: '3',
    name: 'Leonard',
    images: generateImageList(4, 50, 350).images,
  },
  {
    id: '4',
    name: 'James',
    images: generateImageList(1, 20, 300).images,
  },
  {
    id: '5',
    name: 'Hikaru',
    images: generateImageList(5, 213, 400).images,
  },
  {
    id: '6',
    name: 'Scotty',
    images: generateImageList(5, 14, 450).images,
  },
];

const Header = ({ uri, name }) => (
  <View style={s.itemHeader}>
    <Image source={{ uri }} style={s.image} />
    <Text style={{ paddingLeft: 10 }}>{name}</Text>
  </View>
);
const Footer = () => (
  <View style={s.footerItem}>
    <View style={s.row}>
      <Image source={heart} style={s.icon} />
      <Image
        source={bubble}
        style={s.icon}
      />
      <Image
        source={airplane}
        style={s.icon}
      />
    </View>
    <Image
      source={bookmark}
      style={s.iconBookmark}
    />
  </View>
);

const Pagination = ({ length, activeIndexInPager }) => {
  const dots = Array.from({ length: length }, (v, i) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const color =
        activeIndexInPager.value === i ? '#178EED' : '#A7A7A7';
      const dimensions = activeIndexInPager.value === i ? 6 : 4.5;

      return {
        backgroundColor: color,
        width: dimensions,
        height: dimensions,
        borderRadius: 3,
        marginHorizontal: 1.5,
      };
    }, []);
    return (
      <Animated.View style={animatedDotStyle} key={i}></Animated.View>
    );
  });

  return (
    <View style={[s.paginationContainer]}>
      {dots}
    </View>
  );
};

interface RenderItemProps {
  index: number;
  activeItemIndex: Animated.SharedValue<number>;
  item: {
    name: string;
    images: GalleryItemType[];
  };
  setControlsHidden: (shouldHide: boolean) => void;
  scrollViewRef: React.Ref<ScrollView>;
}

function RenderItem({
  index: _index,
  activeItemIndex,
  item: { images, name },
  setControlsHidden,
  scrollViewRef,
}: RenderItemProps) {
  const opacity = useSharedValue(0);
  const backgroundScale = useSharedValue(0);
  const activeIndexInPager = useSharedValue(0);

  const normalizedImages = useMemo(
    () =>
      images.map((item) => {
        const { targetWidth, targetHeight } = normalizeDimensions(
          item,
        );

        return {
          ...item,
          width: targetWidth,
          height: targetHeight,
        };
      }),
    [images],
  );

  const onScale = useCallback((scale: number) => {
    'worklet';

    opacity.value = interpolate(
      scale,
      [1, 2],
      [0, 0.7],
      Extrapolate.CLAMP,
    );

    backgroundScale.value = interpolate(
      scale,
      [1, 1.01, 2],
      [0, 4, 5],
      Extrapolate.CLAMP,
    );
  }, []);

  const onGestureStart = useCallback(() => {
    'worklet';

    setControlsHidden(true);
    StatusBar.setHidden(true);
    activeItemIndex.value = _index;
  }, []);

  const onGestureRelease = useCallback(() => {
    'worklet';

    activeItemIndex.value = delay(200, withTiming(-1)); //delay for smooth hiding background opacity
    setControlsHidden(false);
    StatusBar.setHidden(false);
  }, []);

  const overlayStyles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'black',
      opacity: opacity.value,
      transform: [
        {
          scale: backgroundScale.value,
        },
      ],
    };
  });

  const keyExtractor = useCallback(
    ({ id }: { id: string }) => id,
    [],
  );

  const canvasHeight = Math.max(
    ...normalizedImages.map((item) => item.height),
  );

  function RenderPage({
    item,
    width,
    pagerRefs,
  }: RenderPageProps<GalleryItemType>) {
    return (
      <ScalableImage
        outerGestureHandlerRefs={[...pagerRefs, scrollViewRef]}
        windowDimensions={{
          height: canvasHeight,
          width: width,
        }}
        source={item.uri}
        width={item.width}
        height={item.height}
        onScale={onScale}
        onGestureStart={onGestureStart}
        onGestureRelease={onGestureRelease}
      />
    );
  }

  function onIndexChangeWorklet(nextIndex: number) {
    'worklet';

    activeIndexInPager.value = nextIndex;
  }

  return (
    <Animated.View style={s.itemContainer}>
      <Header uri={images[0].uri} name={name} />
      <Animated.View pointerEvents="none" style={overlayStyles} />
      <View style={[s.itemPager, { height: canvasHeight }]}>
        {images.length === 1 ? (
          <ScalableImage
            windowDimensions={{
              height: canvasHeight,
              width: width,
            }}
            source={images[0].uri}
            width={images[0].width}
            height={images[0].height}
            onScale={onScale}
            outerGestureHandlerRefs={[scrollViewRef]}
            onGestureStart={onGestureStart}
            onGestureRelease={onGestureRelease}
          />
        ) : (
          <>
            <Pager
              pages={images}
              totalCount={images.length}
              keyExtractor={keyExtractor}
              initialIndex={0}
              width={width}
              gutterWidth={0}
              outerGestureHandlerRefs={[scrollViewRef]}
              verticallyEnabled={false}
              renderPage={RenderPage}
              onIndexChange={onIndexChangeWorklet}
            />

            <Pagination
              length={images.length}
              activeIndexInPager={activeIndexInPager}
            />
          </>
        )}
      </View>
      <Footer />
    </Animated.View>
  );
}

export default function CarouselLikeInstagramScreen() {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const activeItemIndex = useSharedValue(-1);

  const { controlsStyles, setControlsHidden } = useControls();

  const { APPBAR_HEIGHT, STATUSBAR_HEIGHT } = getConstants();

  const CellRendererComponent = useMemo<
    FlatListProps<ListItemT>['CellRendererComponent']
  >(
    () => ({ children, index, style, ...props }) => {
      const animatedStyles = useAnimatedStyle(() => {
        if (
          activeItemIndex.value !== -1 &&
          activeItemIndex.value === index
        ) {
          return {
            zIndex: 1,
          };
        }
        return {
          zIndex: 0,
        };
      });
      return (
        <Animated.View
          style={[animatedStyles]}
          index={index}
          {...props}
        >
          {children}
        </Animated.View>
      );
    },
    [],
  );

  return (
    <>
      <Animated.View style={controlsStyles}>
        <DetachedHeader.Container>
          <DetachedHeader />
        </DetachedHeader.Container>
      </Animated.View>
      <FlatList
        contentContainerStyle={{
          paddingTop: APPBAR_HEIGHT + STATUSBAR_HEIGHT,
        }}
        data={data}
        keyExtractor={({ id }) => id}
        renderItem={(item) => (
          <RenderItem
            {...item}
            scrollViewRef={scrollViewRef}
            activeItemIndex={activeItemIndex}
            setControlsHidden={setControlsHidden}
          />
        )}
        renderScrollComponent={(props) => (
          // @ts-ignore
          <ScrollView {...props} ref={scrollViewRef} />
        )}
        CellRendererComponent={CellRendererComponent}
      />
    </>
  );
}
