import { ScalableImage } from '@gallery-toolkit/scalable-image';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  useWorkletCallback,
} from 'react-native-reanimated';
import { DetachedHeader } from '../DetachedHeader';
import { useControls } from '../hooks/useControls';

const image = {
  id: '4',
  width: 250,
  height: 250,
  uri: 'https://placekitten.com/250/250',
};

export default function StandaloneGalleryBasicScreen() {
  const { controlsStyles, setControlsHidden } = useControls();

  const opacity = useSharedValue(0);

  const overlayStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      backgroundColor: 'black',
    };
  });

  const onScale = useWorkletCallback((scale: number) => {
    opacity.value = interpolate(
      scale,
      [1, 2],
      [0, 0.3],
      Extrapolate.CLAMP,
    );
  }, []);

  const onGestureStartCallback = () => {
    StatusBar.setHidden(true);
  };
  const onGestureReleaseCallback = () => {
    StatusBar.setHidden(false);
  };

  const onGestureStart = useWorkletCallback(() => {
    setControlsHidden(true);
    runOnJS(onGestureStartCallback)();
  });

  const onGestureRelease = useWorkletCallback(() => {
    setControlsHidden(false);
    runOnJS(onGestureReleaseCallback)();
  });

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, overlayStyles]}
      />

      <View
        style={{
          zIndex: 0,
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ScalableImage
          width={image.width}
          height={image.height}
          source={image.uri}
          onScale={onScale}
          onGestureStart={onGestureStart}
          onGestureRelease={onGestureRelease}
        />
      </View>

      <Animated.View style={controlsStyles}>
        <DetachedHeader.Container>
          <DetachedHeader />
        </DetachedHeader.Container>
      </Animated.View>
    </View>
  );
}
