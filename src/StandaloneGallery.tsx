import React from 'react';
import { Dimensions, Image } from 'react-native';
import { GalleryItemType } from './GalleryState';

import { ImagePager } from './Pager';
import { ImageTransformer } from './ImageTransformer';

const dimensions = Dimensions.get('window');

type StandaloneGalleryProps = {
  images: GalleryItemType[];
  initialIndex: number;
  width?: number;
  ImageComponent: React.ComponentType<any>;
};

export function StandaloneGallery({
  images,
  initialIndex,
  width = dimensions.width,
  ImageComponent = Image,
}: StandaloneGalleryProps) {
  return (
    <ImagePager
      totalCount={images.length}
      keyExtractor={(item) => item.id}
      initialIndex={initialIndex}
      pages={images}
      width={width}
      renderPage={(props) => {
        const scaleFactor = props.page.width / width;
        const targetHeight = props.page.height / scaleFactor;

        return (
          <ImageTransformer
            height={targetHeight}
            onPageStateChange={props.onPageStateChange}
            width={width}
            pagerRefs={props.pagerRefs}
            uri={props.page.uri}
            ImageComponent={ImageComponent}
          />
        );
      }}
    />
  );
}
