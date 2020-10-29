import React from 'react';
import {
  FlatList,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { generateImageList } from '../utils/generateImageList';
import {
  GalleryItemType,
  GalleryList,
  useGalleryItem,
} from '../../../src';
import { PhotoListNavigationProp } from '.';

const LIST = generateImageList(100);

const AnimatedImage = Animated.createAnimatedComponent(
  Image,
) as typeof Image;

interface ListItemProps {
  item: GalleryItemType;
  index: number;
  onPress: (index: number) => void;
}

function ListItem({ item, onPress, index }: ListItemProps) {
  const { ref, onGestureEvent, styles } = useGalleryItem(
    index,
    onPress,
  );

  return (
    <TapGestureHandler onGestureEvent={onGestureEvent}>
      <AnimatedImage
        ref={ref}
        style={[
          LIST.getContainerStyle(index),
          {
            width: LIST.IMAGE_SIZE,
            height: LIST.IMAGE_SIZE,
          },
          styles,
        ]}
        source={{ uri: item.uri }}
      />
    </TapGestureHandler>
  );
}

export function PhotosListScreen() {
  const nav = useNavigation<PhotoListNavigationProp>();

  function onNavigate(itemIndex: number) {
    nav.navigate('Photo View', {
      index: itemIndex,
      list: LIST.images,
    });
  }

  return (
    <GalleryList>
      <FlatList
        data={LIST.images}
        numColumns={4}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <ListItem
            key={item.id}
            onPress={onNavigate}
            index={index}
            item={item}
          />
        )}
      />
    </GalleryList>
  );
}
