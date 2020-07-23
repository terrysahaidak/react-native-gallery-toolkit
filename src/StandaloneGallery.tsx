import React, { useState } from 'react';
import { Dimensions, Image } from 'react-native';
import { GalleryItemType } from './types';

import { ImagePager } from './Pager';
import { ImageTransformer } from './ImageTransformer';

const dimensions = Dimensions.get('window');

type StandaloneGalleryProps = {
  images: GalleryItemType[];
  initialIndex: number;
  width?: number;
  height?: number;
  ImageComponent: React.ComponentType<any>;
  gutterWidth?: number;
  onIndexChange?: (nextIndex: number) => void;
};

export type StandaloneGalleryHandler = {
  goNext: () => void;
  goBack: () => void;
  setIndex: (nextIndex: number) => void;
};

export const StandaloneGallery = React.forwardRef<
  StandaloneGalleryHandler,
  StandaloneGalleryProps
>(
  (
    {
      images,
      width = dimensions.width,
      height = dimensions.height,
      ImageComponent = Image,
      gutterWidth,
      initialIndex,
      onIndexChange,
    },
    ref,
  ) => {
    const [localIndex, setLocalIndex] = useState(initialIndex);

    React.useImperativeHandle(ref, () => ({
      setIndex(nextIndex: number) {
        setLocalIndex(nextIndex);
      },

      goNext() {
        this.setIndex(localIndex + 1);
      },

      goBack() {
        this.setIndex(localIndex - 1);
      },
    }));

    async function _onIndexChange(nextIndex: number) {
      setLocalIndex(nextIndex);

      if (onIndexChange) {
        onIndexChange(nextIndex);
      }
    }

    return (
      <ImagePager
        totalCount={images.length}
        keyExtractor={(item) => item.id}
        initialIndex={localIndex}
        pages={images}
        width={width}
        gutterWidth={gutterWidth}
        onIndexChangeAsync={_onIndexChange}
        renderPage={(props) => {
          const scaleFactor = props.page.width / width;
          const targetHeight = props.page.height / scaleFactor;

          return (
            <ImageTransformer
              isActive={props.isActive}
              windowDimensions={{ width, height }}
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
  },
);
