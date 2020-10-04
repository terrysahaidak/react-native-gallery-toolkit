import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import {
  GalleryItemType,
  ScalableImage,
  Pager,
  RenderPageProps,
} from '../../../../src';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Extrapolate,
  interpolate,
  withTiming,
  delay,
} from 'react-native-reanimated';
import { DetachedHeader } from '../../DetachedHeader';
import { useControls } from '../../hooks/useControls';
import { generateImageList } from '../../utils/generateImageList';
import { getConstants } from '../../utils/getConstants';
import s from './styles';
import { normalizeDimensions } from '../../../../src/utils';

const { width } = Dimensions.get('window');

const heart = require('../../../assets/images/Heart.svg');
const bubble = require('../../../assets/images/Bubble.svg');
const airplane = require('../../../assets/images/Airplane.svg');
const bookmark = require('../../../assets/images/Bookmark.svg');

const data = [
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
      <Image
        source={heart}
        style={{ height: 22, width: 22, marginLeft: 10 }}
      />
      <Image
        source={bubble}
        style={{ height: 22, width: 22, marginLeft: 10 }}
      />
      <Image
        source={airplane}
        style={{ height: 22, width: 22, marginLeft: 10 }}
      />
    </View>
    <Image
      source={bookmark}
      style={{ height: 22, width: 22, marginRight: 10 }}
    />
  </View>
);

function RenderItem({
  index: _index,
  activeItemIndex,
  item: { images, name },
  setControlsHidden,
}: {
  index: number;
  activeItemIndex: Animated.SharedValue<number>;
  item: {
    name: string;
    images: GalleryItemType[];
  };
  setControlsHidden: (shouldHide: boolean) => void;
}) {
  const opacity = useSharedValue(0);
  const backgroundScale = useSharedValue(0);

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

  function keyExtractor({ id }: { id: string }) {
    return id;
  }

  const canvasHeight = Math.max(
    ...normalizedImages.map((item) => item.height),
  );

  function RenderPage({
    item,
    width,
  }: RenderPageProps<GalleryItemType>) {
    return (
      <ScalableImage
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

  return (
    <Animated.View style={s.itemContainer}>
      <Header uri={images[0].uri} name={name} />
      <Animated.View pointerEvents="none" style={overlayStyles} />
      <View style={[s.itemPager, { height: canvasHeight }]}>
        {images.length === 1 ? (
          <ScalableImage
            windowDimensions={{
              height: canvasHeight,
              width: width, //normalizeDimensions(images[0]).targetWidth,
            }}
            source={images[0].uri}
            width={images[0].width}
            height={images[0].height}
            onScale={onScale}
            onGestureStart={onGestureStart}
            onGestureRelease={onGestureRelease}
          />
        ) : (
          <Pager
            pages={images}
            totalCount={images.length}
            keyExtractor={keyExtractor}
            initialIndex={0}
            width={width}
            gutterWidth={0}
            verticallyEnabled={false}
            renderPage={RenderPage}
          />
        )}
      </View>
      <Footer />
    </Animated.View>
  );
}

export default function CarouselLikeInstagramScreen() {
  const activeItemIndex = useSharedValue(-1);

  const { controlsStyles, setControlsHidden } = useControls();

  const { APPBAR_HEIGHT, STATUSBAR_HEIGHT } = getConstants();

  return (
    <>
      <Animated.View style={controlsStyles}>
        <DetachedHeader.Container>
          <DetachedHeader />
        </DetachedHeader.Container>
      </Animated.View>
      <FlatList
        contentInset={{ top: APPBAR_HEIGHT }}
        contentContainerStyle={{ paddingTop: STATUSBAR_HEIGHT }}
        data={data}
        keyExtractor={({ id }) => `${id}`}
        renderItem={(item) => (
          <RenderItem
            {...item}
            activeItemIndex={activeItemIndex}
            setControlsHidden={setControlsHidden}
          />
        )}
        CellRendererComponent={({
          children,
          index,
          style,
          ...props
        }) => {
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
        }}
      />
    </>
  );
}
