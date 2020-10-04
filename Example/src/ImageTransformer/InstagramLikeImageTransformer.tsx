import React, { useCallback } from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import { GalleryItemType, ScalableImage } from '../../../src';
import Animated, {
  Extrapolate,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { DetachedHeader } from '../DetachedHeader';
import { useSharedValue } from '../../../src/utils';

const { height, width } = Dimensions.get('window');

const image: GalleryItemType = {
  id: '4',
  width: 300,
  height: 400,
  uri: 'https://placekitten.com/300/400',
};

export default function StandaloneGalleryBasicScreen() {
  const headerHeight = useHeaderHeight();

  const opacity = useSharedValue(0);

  const overlayStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: 'black',
  }));

  const onScale = useCallback((scale: number) => {
    'worklet';

    opacity.value = interpolate(
      scale,
      [1, 2],
      [0, 0.3],
      Extrapolate.CLAMP,
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <DetachedHeader.Container>
        <DetachedHeader />
      </DetachedHeader.Container>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, overlayStyles]}
      />

      <View
        style={{
          zIndex: 0,
          flex: 1,
        }}
      >
        <ScalableImage
          windowDimensions={{
            height: height,
            width,
          }}
          width={image.width}
          height={image.height}
          source={image.uri}
          onScale={onScale}
          onGestureStart={() => {
            StatusBar.setHidden(true);
          }}
          onGestureRelease={() => {
            StatusBar.setHidden(false);
          }}
        />
      </View>
    </View>
  );
}
