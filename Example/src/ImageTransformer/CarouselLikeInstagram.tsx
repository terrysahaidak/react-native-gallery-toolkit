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
  Easing,
  delay,
} from 'react-native-reanimated';
import { DetachedHeader } from '../DetachedHeader';

const { width } = Dimensions.get('window');

const defaultTimingConfig = {
  duration: 350,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

const images: GalleryItemType[] = [
  {
    id: '1',
    width: 300,
    height: 300,
    uri: 'https://placekitten.com/300/300',
  },
  {
    id: '2',
    width: 400,
    height: 200,
    uri: 'https://placekitten.com/400/200',
  },
  {
    id: '2',
    width: 400,
    height: 200,
    uri: 'https://placekitten.com/300/200',
  },
];

const data = [
  { id: '1', images },
  { id: '2', images },
  { id: '3', images },
  { id: '4', images },
  { id: '5', images },
];

const s = StyleSheet.create({
  containerStyle: {
    paddingTop: 89,
  },
  itemContainer: {
    height: 500,
    backgroundColor: 'white',
  },
  itemHeader: {
    height: 30,
  },
  itemPager: {
    height: 400,
  },
  footerItem: {
    height: 70,
    zIndex: -1,
  },
});

function RenderItem({
  index: _index,
  sIndex,
  isScaling,
  item: { id, images },
}: {
  index: number;
  sIndex: Animated.SharedValue<number>;
  isScaling: Animated.SharedValue<boolean>;
  item: { id: string; images: GalleryItemType[] };
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

    isScaling.value = true;
    StatusBar.setHidden(true);
    sIndex.value = _index;
  };
  const onGestureRelease = (_index: number) => {
    'worklet';

    sIndex.value = delay(200, withTiming(-1)); //delay for smooth hiding background opacity
    isScaling.value = false;
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

  function RenderPage({ item }) {
    return (
      <Animated.View style={{ height: item.height, width }}>
        <ScalableImage
          windowDimensions={{
            height: item.height,
            width,
          }}
          width={item.width}
          height={item.height}
          source={item.uri}
          onScale={onScale}
          onGestureStart={() => onGestureStart(_index)}
          onGestureRelease={onGestureRelease}
        />
      </Animated.View>
    );
  }
  return (
    <Animated.View style={s.itemContainer}>
      <View style={s.itemHeader}>
        <Text>Some header info</Text>
      </View>
      <Animated.View pointerEvents="none" style={overlayStyles} />
      <View style={s.itemPager}>
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
  const isScaling = useSharedValue(false);
  const headerTranslate = useSharedValue(0);

  const animatedHeaderStyles = useAnimatedStyle(() => {
    if (isScaling.value) {
      headerTranslate.value = withTiming(-100, defaultTimingConfig);
    } else {
      headerTranslate.value = withTiming(0, defaultTimingConfig);
    }

    return {
      zIndex: 1,
      transform: [
        {
          translateY: headerTranslate.value,
        },
      ],
    };
  });

  return (
    <>
      <DetachedHeader.AnimatedContainer
        animatedStyles={animatedHeaderStyles}
      >
        <DetachedHeader />
      </DetachedHeader.AnimatedContainer>
      <FlatList
        contentContainerStyle={s.containerStyle}
        data={data}
        keyExtractor={({ id }) => `${id}`}
        renderItem={(item) => (
          <RenderItem
            {...item}
            sIndex={sIndex}
            isScaling={isScaling}
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
