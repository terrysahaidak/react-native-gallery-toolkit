import { normalizeDimensions } from './utils';

export class GalleryState {
  constructor(fn, totalCount) {
    this._showFunction = fn;
    this.images = [];
    this.currentIndex = null;
    this._onChangeListeners = [];
    this.totalCount = totalCount;
  }

  get activeItem() {
    return this.images[this.currentIndex];
  }

  addImage({ ref, index, opacity, item }) {
    this.images[index] = {
      ref,
      index,
      opacity,
      item,
      measurements: {},
    };
  }

  async setActiveIndex(index) {
    this.currentIndex = index;

    await this._measure(this.activeItem);

    this._triggerListeners(this.activeItem);
  }

  addOnChangeListener(cb) {
    this._onChangeListeners.push(cb);

    return () => {
      this._onChangeListeners.filter((i) => i === cb);
    };
  }

  async onShow(index) {
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

  _measure(item) {
    return new Promise((resolve, reject) =>
      item.ref.current
        .getNode()
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

  _triggerListeners(item) {
    this._onChangeListeners.forEach((cb) => cb(item));
  }
}
