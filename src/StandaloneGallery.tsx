import React from 'react';
import { Dimensions } from 'react-native';

import { GalleryItemType } from './types';

import { Pager, RenderPageProps, PagerProps } from './Pager';
import {
  ImageTransformer,
  ImageTransformerProps,
} from './ImageTransformer';

const dimensions = Dimensions.get('window');

interface Handlers<T> {
  onTap?: ImageTransformerProps['onTap'];
  onDoubleTap?: ImageTransformerProps['onDoubleTap'];
  onInteraction?: ImageTransformerProps['onInteraction'];
  onPagerTranslateChange?: (translateX: number) => void;
  onGesture?: PagerProps<T>['onGesture'];
  shouldPagerHandleGestureEvent?: PagerProps<
    T
  >['shouldHandleGestureEvent'];
}

export interface StandaloneGalleryHandler {
  goNext: () => void;
  goBack: () => void;
  setIndex: (nextIndex: number) => void;
}

interface ImageRendererProps<T> extends Handlers<T> {
  item: RenderPageProps<T>['item'];
  pagerProps: RenderPageProps<T>;
  width: number;
  height: number;
  renderImage?: ImageTransformerProps['renderImage'];
}

export interface StandaloneGalleryProps<ItemT>
  extends Handlers<ItemT> {
  items: ReadonlyArray<ItemT>;
  renderPage?: (props: ImageRendererProps<ItemT>) => JSX.Element;
  renderImage?: ImageTransformerProps['renderImage'];
  keyExtractor?: (item: ItemT, index: number) => string;
  initialIndex?: number;
  width?: number;
  height?: number;
  numToRender?: number;
  gutterWidth?: number;
  onIndexChange?: (nextIndex: number) => void;
  getItem?: (data: ReadonlyArray<ItemT>, index: number) => ItemT;
}

function isImageItemType(type: any): type is GalleryItemType {
  return (
    typeof type === 'object' &&
    'width' in type &&
    'height' in type &&
    'source' in type
  );
}

export function ImageRenderer<T = unknown>({
  item,
  pagerProps,
  width,
  height,
  onDoubleTap,
  onTap,
  onInteraction,
  renderImage,
}: ImageRendererProps<T>) {
  if (!isImageItemType(item)) {
    throw new Error(
      'ImageRenderer: item should have both width and height',
    );
  }

  const scaleFactor = item.width / width;
  const targetHeight = item.height / scaleFactor;

  return (
    <ImageTransformer
      outerGestureHandlerActive={pagerProps.isPagerInProgress}
      isActive={pagerProps.isActive}
      windowDimensions={{ width, height }}
      height={targetHeight}
      renderImage={renderImage}
      onStateChange={pagerProps.onPageStateChange}
      outerGestureHandlerRefs={pagerProps.pagerRefs}
      uri={item.uri}
      width={width}
      onDoubleTap={onDoubleTap}
      onTap={onTap}
      onInteraction={onInteraction}
    />
  );
}

export class StandaloneGallery<ItemT> extends React.PureComponent<
  StandaloneGalleryProps<ItemT>,
  {
    localIndex: number;
  }
> {
  static ImageRenderer = ImageRenderer;

  tempIndex: number = this.props.initialIndex ?? 0;

  constructor(props: StandaloneGalleryProps<ItemT>) {
    super(props);

    this._renderPage = this._renderPage.bind(this);
    this._keyExtractor = this._keyExtractor.bind(this);
  }

  state = {
    localIndex: this.props.initialIndex ?? 0,
  };

  get totalCount() {
    return this.props.items.length;
  }

  private setLocalIndex(nextIndex: number) {
    this.setState({
      localIndex: nextIndex,
    });
  }

  private setTempIndex(nextIndex: number) {
    this.tempIndex = nextIndex;
  }

  setIndex(nextIndex: number) {
    this.setLocalIndex(nextIndex);
  }

  goNext() {
    const nextIndex = this.tempIndex + 1;
    if (nextIndex > this.totalCount - 1) {
      console.warn(
        'StandaloneGallery: Index cannot be bigger than pages count',
      );
      return;
    }

    this.setIndex(nextIndex);
  }

  goBack() {
    const nextIndex = this.tempIndex - 1;

    if (nextIndex < 0) {
      console.warn('StandaloneGallery: Index cannot be negative');
      return;
    }

    this.setIndex(nextIndex);
  }

  _keyExtractor(item: ItemT, index: number) {
    if (typeof this.props.keyExtractor === 'function') {
      return this.props.keyExtractor(item, index);
    }

    return index.toString();
  }

  _renderPage(pagerProps: RenderPageProps<ItemT>) {
    const {
      onDoubleTap,
      onTap,
      onInteraction,
      width = dimensions.width,
      height = dimensions.height,
      renderPage,
      renderImage,
    } = this.props;

    const props = {
      item: pagerProps.item,
      width,
      height,
      pagerProps,
      onDoubleTap,
      onTap,
      onInteraction,
      renderImage,
    };

    if (typeof renderPage === 'function') {
      return renderPage(props);
    }

    return <ImageRenderer {...props} />;
  }

  render() {
    const {
      items,
      gutterWidth,
      onIndexChange,
      getItem,
      width = dimensions.width,
      onPagerTranslateChange,
      numToRender,
      onGesture,
      shouldPagerHandleGestureEvent,
    } = this.props;

    const setTempIndex = (index: number) => {
      this.setTempIndex(index);
    };

    function onIndexChangeWorklet(nextIndex: number) {
      'worklet';

      setTempIndex(nextIndex);

      if (onIndexChange) {
        onIndexChange(nextIndex);
      }
    }

    return (
      <Pager
        totalCount={this.totalCount}
        getItem={getItem}
        keyExtractor={this._keyExtractor}
        initialIndex={this.state.localIndex}
        pages={items}
        width={width}
        gutterWidth={gutterWidth}
        onIndexChange={onIndexChangeWorklet}
        onPagerTranslateChange={onPagerTranslateChange}
        shouldHandleGestureEvent={shouldPagerHandleGestureEvent}
        onGesture={onGesture}
        renderPage={this._renderPage}
        numToRender={numToRender}
      />
    );
  }
}
