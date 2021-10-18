import { Pager } from '@gallery-toolkit/pager';
import React from 'react';
import { Image } from 'react-native';
import { generateImageList } from '../helpers';

const LIST = generateImageList(100);

export function PagerExampleScreen() {
  return (
    <Pager
      initialIndex={0}
      totalCount={LIST.images.length}
      keyExtractor={(item) => item.id}
      pages={LIST.images}
      renderPage={(props) => (
        <Image
          source={{ uri: props.item.uri }}
          style={{ width: props.width, height: props.item.height }}
        />
      )}
    />
  );
}
