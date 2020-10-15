import React, { useCallback, useRef, useState } from 'react';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import { generateImageList } from '../utils/generateImageList';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  StatusBar,
  Text,
} from 'react-native';
import {
  GalleryItemType,
  LightBoxItem,
  LightboxItemPayloadType,
  Measurements,
  StandaloneGallery,
  LightboxTransitionProps,
  LightboxImperativeHandlers,
  LightboxSwipeout,
} from '../../../src';
import { useControls } from '../hooks/useControls';
import { normalizeDimensions } from '../../../src/utils';
import { Portal } from 'react-native-portalize';

const dimensions = Dimensions.get('window');

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight || 20,
  },
  backButtonContainer: {
    padding: 7,
    marginVertical: 8,
    marginHorizontal: 7,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  backButton: {
    width: 24,
    height: 24,
  },

  text: {
    marginVertical: 16,
  },
});

const AnimatedImage = Animated.createAnimatedComponent(
  Image,
) as typeof Image;

const LIST = generateImageList(2);

interface ListItemProps {
  item: GalleryItemType;
  index: number;
  onPress: (
    payload: LightboxItemPayloadType<GalleryItemType>,
  ) => void;
}

function ListItem({ index, item, onPress }: ListItemProps) {
  const { targetHeight, targetWidth } = normalizeDimensions(item);
  return (
    <LightBoxItem index={index} item={item} onPress={onPress}>
      <AnimatedImage
        resizeMethod="resize"
        source={{ uri: item.uri }}
        style={{
          width: targetWidth - 32,
          height: targetHeight,
        }}
      />
    </LightBoxItem>
  );
}

export function LightboxModalExample() {
  const [
    selectedItem,
    setSelectedItem,
  ] = useState<LightboxItemPayloadType<GalleryItemType> | null>(null);

  function onNavigate(
    payload: LightboxItemPayloadType<GalleryItemType>,
  ) {
    setSelectedItem(payload);
  }

  function onClose() {
    setSelectedItem(null);
  }
  const [image1, image2] = LIST.images;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.list}>
        <Text style={s.text}>
          On the other hand, we denounce with righteous indignation
          and dislike men who are so beguiled and demoralized by the
          charms of pleasure of the moment, so blinded by desire, that
          they cannot foresee the pain and trouble that are bound to
          ensue; and equal blame belongs to those who fail in their
          duty through weakness of will, which is the same as saying
          through shrinking from toil and pain.
        </Text>

        <ListItem
          index={0}
          key={image1.id}
          onPress={onNavigate}
          item={image1}
        />

        <Text style={s.text}>
          These cases are perfectly simple and easy to distinguish. In
          a free hour, when our power of choice is untrammelled and
          when nothing prevents our being able to do what we like
          best, every pleasure is to be welcomed and every pain
          avoided. But in certain circumstances and owing to the
          claims of duty or the obligations of business it will
          frequently occur that pleasures have to be repudiated and
          annoyances accepted. The wise man therefore always holds in
          these matters to this principle of selection: he rejects
          pleasures to secure other greater pleasures, or else he
          endures pains to avoid worse pains
        </Text>

        <ListItem
          index={1}
          key={image2.id}
          onPress={onNavigate}
          item={image2}
        />
      </ScrollView>

      {selectedItem && (
        <Portal>
          <LightboxModal
            onClose={onClose}
            selectedItem={selectedItem}
            list={LIST.images}
          />
        </Portal>
      )}
    </View>
  );
}

const backButton = require('./back-icon.png');

function CustomHeading({ onPress }) {
  return (
    <View style={s.headerContainer}>
      <RectButton onPress={onPress} style={s.backButtonContainer}>
        <View>
          <Image style={s.backButton} source={backButton} />
        </View>
      </RectButton>
    </View>
  );
}

interface LightboxModalProps {
  list: GalleryItemType[];
  selectedItem: LightboxItemPayloadType<GalleryItemType>;
  onClose: () => void;
}

function LightboxModal({
  list,
  selectedItem,
  onClose,
}: LightboxModalProps) {
  const lightboxRef = useRef<LightboxImperativeHandlers>(null);

  const targetDimensions = {
    width: selectedItem.item.width,
    height: selectedItem.item.height,
  };

  const activeIndex = useRef<number>(selectedItem.index);

  function onIndexChange(index: number) {
    activeIndex.current = index;
  }

  const {
    controlsHidden,
    controlsStyles,
    setControlsHidden,
  } = useControls();

  const handleClose = useCallback(() => {
    onClose();
  }, []);

  const handleBack = useCallback(() => {
    StatusBar.setBarStyle('dark-content');
    lightboxRef.current.hide(
      onClose,
      selectedItem.index !== activeIndex.current,
    );
  }, []);

  // make sure to use white status bar
  // because backdrop is black
  function onReady() {
    StatusBar.setBarStyle('light-content');
  }

  const toValue = dimensions.height;

  function onSwipeActive(translateY: number) {
    'worklet';

    if (Math.abs(translateY) > 8 && !controlsHidden.value) {
      setControlsHidden(true);
    }
  }

  function onSwipeSuccess() {
    'worklet';

    StatusBar.setBarStyle('dark-content');
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
          <CustomHeading onPress={handleBack} />
        </Animated.View>
      </Animated.View>
    ),
    [],
  );

  return (
    <View style={s.container}>
      <LightboxSwipeout
        ref={lightboxRef}
        onReady={onReady}
        measurements={selectedItem as Measurements}
        source={selectedItem.item.uri}
        targetDimensions={targetDimensions}
        renderOverlayComponent={renderOverlayComponent}
        onActive={onSwipeActive}
        onSwipeSuccess={onSwipeSuccess}
        onSwipeFailure={onSwipeFailure}
        callback={handleClose}
        toValue={toValue}
      >
        {({ onGesture, shouldHandleEvent }) => (
          <StandaloneGallery
            items={list}
            onIndexChange={onIndexChange}
            shouldPagerHandleGestureEvent={shouldHandleEvent}
            onShouldHideControls={setControlsHidden}
            initialIndex={selectedItem.index}
            onPagerEnabledGesture={onGesture}
          />
        )}
      </LightboxSwipeout>
    </View>
  );
}
