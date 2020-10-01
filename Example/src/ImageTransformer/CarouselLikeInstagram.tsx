import React, { useCallback } from 'react';
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import {
  GalleryItemType,
  ScalableImage,
  Pager,
} from 'react-native-gallery-toolkit';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Extrapolate,
  interpolate,
  withTiming,
  delay,
} from 'react-native-reanimated';
import { DetachedHeader } from '../DetachedHeader';
import { useControls } from '../hooks/useControls';
import { generateImageList } from '../utils/generateImageList';

const { width } = Dimensions.get('window');

const images = generateImageList(10);
const data = [
  { id: '1', ...images },
  { id: '2', ...images },
  { id: '3', ...images },
  { id: '4', ...images },
  { id: '5', ...images },
];

const s = StyleSheet.create({
  containerStyle: {
    paddingTop: 89,
  },
  itemContainer: {
    height: 470,
    backgroundColor: 'white',
  },
  itemHeader: {
    height: 30,
  },
  itemPager: {},
  footerItem: {
    height: 70,
    zIndex: -1,
  },
});

function RenderItem({
  index: _index,
  sIndex,
  item: { id, images },
  setControlsHidden,
}: {
  index: number;
  sIndex: Animated.SharedValue<number>;
  item: { id: string; images: GalleryItemType[] };
  setControlsHidden: (shouldHide: boolean) => void;
}) {
  const opacity = useSharedValue(0);
  const saveScale = useSharedValue(0);
  const headerZindex = useSharedValue(1);

  const onScale = useCallback((scale: number) => {
    'worklet';

    opacity.value = interpolate(
      scale,
      [1, 2],
      [0, 0.7],
      Extrapolate.CLAMP,
    );

    headerZindex.value = interpolate(
      scale,
      [1, 2],
      [1, 0],
      Extrapolate.CLAMP,
    );

    saveScale.value = scale;
  }, []);

  const onGestureStart = (_index: number) => {
    'worklet';

    setControlsHidden(true);
    StatusBar.setHidden(true);
    sIndex.value = _index;
  };
  const onGestureRelease = (_index: number) => {
    'worklet';

    sIndex.value = delay(200, withTiming(-1)); //delay for smooth hiding background opacity
    setControlsHidden(false);
    StatusBar.setHidden(false);
  };

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
          scale: saveScale.value > 1 ? 3 : 0,
        },
      ],
    };
  });

  function keyExtractor({ id }: { id: string }) {
    return id;
  }

  function RenderPage({ item, width: _width }) {
    const localHeight = Math.min(_width, item.height); //for proper image dimensions
    return (
      <ScalableImage
        windowDimensions={{
          height: localHeight,
          width: _width,
        }}
        width={_width}
        height={localHeight}
        source={item.uri}
        onScale={onScale}
        onGestureStart={() => onGestureStart(_index)}
        onGestureRelease={onGestureRelease}
      />
    );
  }
  return (
    <Animated.View style={s.itemContainer}>
      <View style={s.itemHeader}>
        <Text>Some header info</Text>
      </View>
      <Animated.View pointerEvents="none" style={overlayStyles} />
      <View style={[s.itemPager, { height: width }]}>
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
      </View>
      <View style={s.footerItem}>
        <Text>Some footer info</Text>
      </View>
    </Animated.View>
  );
}

export default function CarouselLikeInstagramScreen() {
  const sIndex = useSharedValue(-1);

  const { controlsStyles, setControlsHidden } = useControls();

  return (
    <>
      <Animated.View style={controlsStyles}>
        <DetachedHeader.Container>
          <DetachedHeader />
        </DetachedHeader.Container>
      </Animated.View>
      <FlatList
        contentContainerStyle={s.containerStyle}
        data={data}
        keyExtractor={({ id }) => `${id}`}
        renderItem={(item) => (
          <RenderItem
            {...item}
            sIndex={sIndex}
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
            if (sIndex.value !== -1 && sIndex.value === index) {
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
