import React, { useState, useRef } from 'react';
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
    const tempIndex = useRef(initialIndex);
    const [localIndex, setLocalIndex] = useState(initialIndex);

    React.useImperativeHandle(ref, () => ({
      setIndex(nextIndex: number) {
        setLocalIndex(nextIndex);
      },

      goNext() {
        this.setIndex(tempIndex.current + 1);
      },

      goBack() {
        const nextIndex = tempIndex.current - 1;

        if (nextIndex < 0) {
          throw new Error(
            'StandaloneGallery: Index cannot be negative',
          );
        }

        this.setIndex(nextIndex);
      },
    }));

    async function _onIndexChange(nextIndex: number) {
      tempIndex.current = nextIndex;

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
