import {
  useNavigation,
  useRoute,
  useTheme,
} from '@react-navigation/native';
import React, { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import { PhotoViewScreenRoute } from '.';
import { GalleryView } from '../../../src';
import { DetachedHeader } from '../DetachedHeader';
import { useControls } from '../hooks/useControls';

export function PhotoViewScreen() {
  const nav = useNavigation();
  const theme = useTheme();
  const dim = useWindowDimensions();
  const { index, list } = useRoute<PhotoViewScreenRoute>().params;

  const { setControlsHidden, controlsStyles } = useControls();

  const renderOverlayComponent = useCallback(
    () => (
      <Animated.View style={[controlsStyles]}>
        <DetachedHeader.Container>
          <DetachedHeader />
        </DetachedHeader.Container>
      </Animated.View>
    ),
    [],
  );

  return (
    <GalleryView
      backdropColor="black"
      windowDimensions={dim}
      onShouldHideControls={setControlsHidden}
      onHide={nav.goBack}
      initialIndex={index}
      items={list}
      ImageComponent={FastImage}
      renderOverlayComponent={renderOverlayComponent}
    />
  );
}
