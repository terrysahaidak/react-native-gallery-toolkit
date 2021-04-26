import React, { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { generateImageList } from '../utils/generateImageList';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  useTheme,
} from '@react-navigation/native';
import {
  GalleryItemType,
  LightBoxItem,
  LightboxItemPayloadType,
  Measurements,
  StandaloneGallery,
  LightboxTransitionProps,
  LightboxSwipeout,
} from '../../../src';
import {
  LightboxSharedTransitionListNavigationProp,
  LightboxSharedTransitionScreenRoute,
} from '.';
import { DetachedHeader } from '../DetachedHeader';
import { useControls } from '../hooks/useControls';

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

const AnimatedImage = Animated.createAnimatedComponent(
  Image,
) as typeof Image;

const LIST = generateImageList(3);

interface ListItemProps {
  item: GalleryItemType;
  index: number;
  onPress: (
    payload: LightboxItemPayloadType<GalleryItemType>,
  ) => void;
}

function ListItem({ item, onPress, index }: ListItemProps) {
  return (
    <LightBoxItem item={item} index={index} onPress={onPress}>
      <AnimatedImage
        style={LIST.getContainerStyle(index)}
        source={{ uri: item.uri }}
        width={LIST.IMAGE_SIZE}
        height={LIST.IMAGE_SIZE}
      />
    </LightBoxItem>
  );
}

export function LightboxSharedTransitionList() {
  const nav = useNavigation<
    LightboxSharedTransitionListNavigationProp
  >();

  function onNavigate(
    payload: LightboxItemPayloadType<GalleryItemType>,
  ) {
    nav.navigate('LightboxSharedTransitionScreen', {
      payload,
      list: LIST.images,
    });
  }

  return (
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
  );
}

export function LightboxSharedTransition() {
  const nav = useNavigation();
  const theme = useTheme();
  const route = useRoute<LightboxSharedTransitionScreenRoute>();

  const { payload, list } = route.params;
  const { item } = payload;
  const targetDimensions = {
    width: item.width,
    height: item.height,
  };

  const {
    controlsHidden,
    controlsStyles,
    setControlsHidden,
  } = useControls();

  const handleBack = useCallback(() => {
    nav.setOptions({ animationEnabled: false });
    nav.goBack();
  }, []);

  const toValue = dimensions.height; // over the screen
  function onSwipeActive(translateY: number) {
    'worklet';

    if (Math.abs(translateY) > 8 && !controlsHidden.value) {
      setControlsHidden(true);
    }
  }

  function onSwipeFailure() {
    'worklet';

    setControlsHidden(false);
  }

  const renderOverlayComponent = useCallback<
    LightboxTransitionProps['renderOverlayComponent']
  >(
    ({ animationProgress }) => (
      <Animated.View
        style={useAnimatedStyle(() => ({
          opacity: animationProgress.value,
        }))}
      >
        <Animated.View style={controlsStyles}>
          <DetachedHeader.Container>
            <DetachedHeader />
          </DetachedHeader.Container>
        </Animated.View>
      </Animated.View>
    ),
    [],
  );

  return (
    <View style={s.container}>
      <LightboxSwipeout
        measurements={payload as Measurements}
        source={item.uri}
        targetDimensions={targetDimensions}
        renderOverlayComponent={renderOverlayComponent}
        onActive={onSwipeActive}
        callback={handleBack}
        onSwipeFailure={onSwipeFailure}
        backdropColor={theme.colors.background}
        toValue={toValue}
      >
        {({ onGesture, shouldHandleEvent }) => (
          <StandaloneGallery
            items={list}
            numToRender={10}
            shouldPagerHandleGestureEvent={shouldHandleEvent}
            onShouldHideControls={setControlsHidden}
            initialIndex={payload.index}
            onPagerEnabledGesture={onGesture}
          />
        )}
      </LightboxSwipeout>
    </View>
  );
}
