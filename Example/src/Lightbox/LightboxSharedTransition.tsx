import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { generateImageList } from '../utils/generateImageList';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
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
  LightboxTransition,
  Swipeout,
} from '../../../src';
import {
  LightboxSharedTransitionListNavigationProp,
  LightboxSharedTransitionScreenRoute,
} from '.';
import { DetachedHeader } from '../DetachedHeader';
import { useSharedValue } from '../../../src/utils';

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

const LIST = generateImageList(10);

interface ListItemProps {
  item: GalleryItemType;
  index: number;
  onPress: (payload: LightboxItemPayloadType) => void;
}

function ListItem({ item, onPress, index }: ListItemProps) {
  return (
    <LightBoxItem index={index} onPress={onPress}>
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

  function onNavigate(payload: LightboxItemPayloadType) {
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
  const route = useRoute<LightboxSharedTransitionScreenRoute>();

  const { payload, list } = route.params;

  const item = list[payload.index];

  const theme = useTheme();

  const controlsHidden = useSharedValue(true);

  const controlsStyles = useAnimatedStyle(() => ({
    opacity: controlsHidden.value ? withTiming(0) : withTiming(1),
    transform: [
      {
        translateY: controlsHidden.value
          ? withTiming(-100, {
              duration: 400,
            })
          : withTiming(0, {
              duration: 400,
            }),
      },
    ],
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
  }));

  function handleBack() {
    nav.setOptions({ animationEnabled: false });
    nav.goBack();
  }

  const backdropOpacity = useSharedValue(1);
  const toValue = dimensions.height;

  function onSwipeActive(translateY: number) {
    'worklet';

    backdropOpacity.value = interpolate(
      Math.abs(translateY),
      [0, toValue],
      [1, 0.7],
      Extrapolate.CLAMP,
    );

    if (Math.abs(translateY) > 8 && !controlsHidden.value) {
      controlsHidden.value = true;
    }
  }

  function onSwipeSuccess() {
    'worklet';

    backdropOpacity.value = withTiming(0, {
      duration: 100,
    });
  }

  function onSwipeFailure() {
    'worklet';

    controlsHidden.value = false;
    backdropOpacity.value = withTiming(1);
  }

  function onLightboxReady() {
    controlsHidden.value = false;
  }

  const customBackdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  }, []);

  return (
    <View style={s.container}>
      <LightboxTransition
        measurements={payload as Measurements}
        source={item.uri}
        targetDimensions={{
          width: item.width,
          height: item.height,
        }}
        onReady={onLightboxReady}
        renderBackdropComponent={({ animatedStyles }) => (
          <Animated.View
            style={[StyleSheet.absoluteFill, customBackdropStyles]}
          >
            <Animated.View
              style={[
                animatedStyles,
                {
                  backgroundColor: theme.colors.background,
                },
              ]}
            />
          </Animated.View>
        )}
        renderOverlayComponent={() => (
          <Animated.View style={controlsStyles}>
            <DetachedHeader.Container>
              <DetachedHeader />
            </DetachedHeader.Container>
          </Animated.View>
        )}
      >
        <Swipeout
          onActive={onSwipeActive}
          onSwipeSuccess={onSwipeSuccess}
          onSwipeFailure={onSwipeFailure}
          callback={handleBack}
        >
          {({ onGesture, shouldHandleEvent }) => (
            <StandaloneGallery
              items={list}
              shouldPagerHandleGestureEvent={shouldHandleEvent}
              onShouldHideControls={(shouldHide: boolean) => {
                controlsHidden.value = shouldHide;
              }}
              initialIndex={payload.index}
              onPagerEnabledGesture={onGesture}
            />
          )}
        </Swipeout>
      </LightboxTransition>
    </View>
  );
}
