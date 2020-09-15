import React from 'react';
import Animated from 'react-native-reanimated';
import { normalizeDimensions } from '../src/utils';
import { GalleryItemType } from '../src/types';

export type IShowFunction = (value: GalleryState | null) => void;

type IMeasurements = {
  width: number;
  height: number;
  targetWidth: number;
  targetHeight: number;
  x: number;
  y: number;
};

export type IGalleryImage = {
  ref: React.RefObject<Animated.Image>;
  index: number;
  opacity: Animated.SharedValue<number>;
  item: GalleryItemType;
  measurements?: IMeasurements;
};

type IOnChangeCallback = (item: IGalleryImage) => void;

type GalleryStateProps = {
  fn: IShowFunction;
  images?: GalleryItemType[];
  totalCount: number;
};

export class GalleryState {
  private _showFunction: IShowFunction;

  private currentIndex: number | null;

  private _onChangeListeners: IOnChangeCallback[];

  public images: IGalleryImage[];

  public totalCount: number;

  constructor({ images = [], fn, totalCount }: GalleryStateProps) {
    this._showFunction = fn;
    this.images = [];
    this.currentIndex = null;
    this._onChangeListeners = [];
    this.totalCount = totalCount;
  }

  get activeItem() {
    if (this.currentIndex === null) {
      return null;
    }

    return this.images[this.currentIndex];
  }

  addImage(item: IGalleryImage) {
    if (this.images[item.index]) {
      return;
    }

    this.images[item.index] = item;
  }

  async setActiveIndex(index: number) {
    this.currentIndex = index;

    await this._measure(this.activeItem!);

    this._triggerListeners(this.activeItem!);
  }

  addOnChangeListener(cb: IOnChangeCallback) {
    this._onChangeListeners.push(cb);

    return () => {
      this._onChangeListeners.filter((i) => i === cb);
    };
  }

  async onShow(index: number) {
    await this.setActiveIndex(index);

    this._showFunction(this);
  }

  onClose() {
    this._showFunction(null);
    this._clearListener();
    this.currentIndex = null;
  }

  _clearListener() {
    this._onChangeListeners = [];
  }

  _measure(item: IGalleryImage) {
    return new Promise((resolve, reject) =>
      item.ref
        .current!.getNode()
        .measure((x, y, width, height, pageX, pageY) => {
          if (width === 0 && height === 0) {
            reject();
            return;
          }

          const { targetWidth, targetHeight } = normalizeDimensions(
            item.item,
          );

          item.measurements = {
            width,
            height,
            x: pageX,
            y: pageY,
            targetHeight,
            targetWidth,
          };

          resolve();
        }),
    );
  }

  _triggerListeners(item: IGalleryImage) {
    this._onChangeListeners.forEach((cb) => cb(item));
  }
}
