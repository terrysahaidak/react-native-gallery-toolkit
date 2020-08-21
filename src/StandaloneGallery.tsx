import React, { useState, useRef } from 'react';
import { Dimensions } from 'react-native';
import { GalleryItemType } from './types';

import { ImagePager, RenderPageProps } from './Pager';
import {
  ImageTransformer,
  IImageTransformerProps,
} from './ImageTransformer';

const dimensions = Dimensions.get('window');

type Handlers = {
  onTap?: IImageTransformerProps['onTap'];
  onDoubleTap?: IImageTransformerProps['onDoubleTap'];
  onInteraction?: IImageTransformerProps['onInteraction'];
  onPagerTranslateChange?: (translateX: number) => void;
};

type StandaloneGalleryProps = {
  images: GalleryItemType[];
  renderImage?: IImageTransformerProps['renderImage'];
  initialIndex: number;
  width?: number;
  height?: number;
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
  renderImage?: IImageTransformerProps['renderImage'];
} & Handlers;

function PageRenderer({
  pagerProps,
  width,
  height,
  onDoubleTap,
  onTap,
  onInteraction,
  renderImage,
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
      renderImage={renderImage}
      onStateChange={pagerProps.onPageStateChange}
      width={width}
      outerGestureHandlerRefs={pagerProps.pagerRefs}
      uri={pagerProps.page.uri}
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
      gutterWidth,
      initialIndex,
      onIndexChange,
      getItem,
      onDoubleTap,
      onTap,
      onInteraction,
      onPagerTranslateChange,
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
        onPagerTranslateChange={onPagerTranslateChange}
        renderPage={(props) => (
          <PageRenderer
            width={width}
            height={height}
            key={props.page.id}
            pagerProps={props}
            onDoubleTap={onDoubleTap}
            onTap={onTap}
            onInteraction={onInteraction}
          />
        )}
      />
    );
  },
);
