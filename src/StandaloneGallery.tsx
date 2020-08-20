import React, { useState, useRef } from 'react';
import { Dimensions, Image } from 'react-native';
import { GalleryItemType } from './types';

import { ImagePager, RenderPageProps } from './Pager';
import { ImageTransformer } from './ImageTransformer';

const dimensions = Dimensions.get('window');

type Handlers = {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onInteraction?: () => void;
};

type StandaloneGalleryProps = {
  images: GalleryItemType[];
  initialIndex: number;
  width?: number;
  height?: number;
  ImageComponent: React.ComponentType<any>;
  gutterWidth?: number;
  onIndexChange?: (nextIndex: number) => void;
  getItem?: (
    data: GalleryItemType[],
    index: number,
  ) => GalleryItemType;
} & Handlers;

export type StandaloneGalleryHandler = {
  goNext: () => void;
  goBack: () => void;
  setIndex: (nextIndex: number) => void;
};

type PageRenderer = {
  pagerProps: RenderPageProps<GalleryItemType>;
  width: number;
  height: number;
  ImageComponent: React.ComponentType<any>;
} & Handlers;

function PageRenderer({
  pagerProps,
  width,
  height,
  ImageComponent,
  onDoubleTap,
  onTap,
  onInteraction,
}: PageRenderer) {
  // TODO: Handle case when pagerProps.page is a promise

  const scaleFactor = pagerProps.page.width / width;
  const targetHeight = pagerProps.page.height / scaleFactor;

  return (
    <ImageTransformer
      outerGestureHandlerActive={pagerProps.isPagerInProgress}
      isActive={pagerProps.isActive}
      windowDimensions={{ width, height }}
      height={targetHeight}
      onStateChange={pagerProps.onPageStateChange}
      width={width}
      outerGestureHandlerRefs={pagerProps.pagerRefs}
      uri={pagerProps.page.uri}
      ImageComponent={ImageComponent}
      onDoubleTap={onDoubleTap}
      onTap={onTap}
      onInteraction={onInteraction}
    />
  );
}

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
      getItem,
      onDoubleTap,
      onTap,
      onInteraction,
    },
    ref,
  ) => {
    const tempIndex = useRef(initialIndex);
    const [localIndex, setLocalIndex] = useState(initialIndex);

    const totalCount = images.length;

    React.useImperativeHandle(ref, () => ({
      setIndex(nextIndex: number) {
        setLocalIndex(nextIndex);
      },

      goNext() {
        const nextIndex = tempIndex.current + 1;
        if (nextIndex > totalCount - 1) {
          console.warn(
            'StandaloneGallery: Index cannot be bigger than pages count',
          );
          return;
        }

        this.setIndex(nextIndex);
      },

      goBack() {
        const nextIndex = tempIndex.current - 1;

        if (nextIndex < 0) {
          console.warn('StandaloneGallery: Index cannot be negative');
          return;
        }

        this.setIndex(nextIndex);
      },
    }));

    function _onIndexChange(nextIndex: number) {
      tempIndex.current = nextIndex;

      if (onIndexChange) {
        onIndexChange(nextIndex);
      }
    }

    return (
      <ImagePager
        totalCount={totalCount}
        getItem={getItem}
        keyExtractor={(item) => item.id}
        initialIndex={localIndex}
        pages={images}
        width={width}
        gutterWidth={gutterWidth}
        onIndexChange={_onIndexChange}
        renderPage={(props) => (
          <PageRenderer
            width={width}
            height={height}
            key={props.page.id}
            pagerProps={props}
            ImageComponent={ImageComponent}
            onDoubleTap={onDoubleTap}
            onTap={onTap}
            onInteraction={onInteraction}
          />
        )}
      />
    );
  },
);
