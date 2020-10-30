import React from 'react';
import {
  FlatList,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { generateImageList } from '../utils/generateImageList';
import {
  GalleryItemType,
  GalleryList,
  useGalleryItem,
} from '../../../src';
import { PhotoListNavigationProp } from '.';
import FastImage from 'react-native-fast-image';

const LIST = generateImageList(100);

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

  const sizeStyle = {
    width: LIST.IMAGE_SIZE,
    height: LIST.IMAGE_SIZE,
  };

  return (
    <TapGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View
        style={[styles, LIST.getContainerStyle(index), sizeStyle]}
      >
        <FastImage
          ref={ref}
          style={[sizeStyle, LIST.getContainerStyle(index)]}
          source={{ uri: item.uri }}
        />
      </Animated.View>
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
        numColumns={3}
        removeClippedSubviews
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
