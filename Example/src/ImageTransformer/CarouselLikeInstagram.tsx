import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
  { id: 1, images },
  { id: 2, images },
  { id: 3, images },
  { id: 4, images },
  { id: 5, images },
];

const s = StyleSheet.create({
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

export default function CarouselLikeInstagramScreen() {
  function keyExtractor(item, index) {
    return index.toString();
  }

  function onIndexChangeWorklet(nextIndex) {
    'worklet';
  }

  const sIndex = useSharedValue(-1);
  const opacity = useSharedValue(0);
  const headerZindex = useSharedValue(1);

  const onScale = useCallback((scale: number) => {
    'worklet';

    opacity.value = interpolate(
      scale,
      [1, 2],
      [0, 0.3],
      Extrapolate.CLAMP,
    );

    headerZindex.value = interpolate(
      scale,
      [1, 2],
      [1, 0],
      Extrapolate.CLAMP,
    );
  }, []);

  const renderItem = ({ index: _index }: { index: number }) => (
    <Animated.View style={s.itemContainer}>
      <View style={s.itemHeader}>
        <Text>Some header info</Text>
      </View>
      <View style={s.itemPager}>
        <Pager
          pages={images}
          totalCount={images.length}
          keyExtractor={keyExtractor}
          initialIndex={0}
          width={width}
          gutterWidth={0}
          onIndexChange={onIndexChangeWorklet}
          renderPage={({ width: _width, item }) => {
            return (
              <ScalableImage
                windowDimensions={{
                  height: item.height,
                  width,
                }}
                width={item.width}
                height={item.height}
                source={item.uri}
                onScale={onScale}
                onGestureStart={() => {
                  StatusBar.setHidden(true);
                  sIndex.value = _index;
                }}
                onGestureRelease={() => {
                  StatusBar.setHidden(false);
                  console.log('onGestureRelease!');
                }}
              />
            );
          }}
        />
      </View>
      <View style={s.footerItem}>
        <Text>Some footer info</Text>
      </View>
    </Animated.View>
  );
  return (
    <View style={{ zIndex: 1, flex: 1 }}>
      <FlatList
        contentContainerStyle={{ marginVertical: 89 }}
        data={data}
        keyExtractor={({ id }) => `${id}`}
        renderItem={renderItem}
        CellRendererComponent={({
          children,
          index,
          style,
          ...props
        }) => {
          const animatedStyles = useAnimatedStyle(() => {
            if (
              sIndex.value !== -1 &&
              sIndex.value === index &&
              opacity.value > 0
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
    </View>
  );
}
