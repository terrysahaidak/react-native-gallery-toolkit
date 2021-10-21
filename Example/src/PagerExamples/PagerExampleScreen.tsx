import { Pager, RenderPageProps } from '@gallery-toolkit/pager';
import React, { useCallback } from 'react';
import { Image } from 'react-native';
import { generateImageList, ImageItem } from '../helpers';

const LIST = generateImageList(100);

export function PagerExampleScreen() {
  const renderPage = useCallback(
    (props: RenderPageProps<ImageItem>) => {
      return (
        <Image
          source={{ uri: props.item.uri }}
          style={{ width: props.width, height: props.item.height }}
        />
      );
    },
    [],
  );

  return (
    <Pager
      initialIndex={0}
      totalCount={LIST.images.length}
      keyExtractor={(item) => item.id}
      pages={LIST.images}
      renderPage={renderPage}
    />
  );
}
