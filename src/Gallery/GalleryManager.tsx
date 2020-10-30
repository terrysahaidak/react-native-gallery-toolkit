import React, { useContext, useMemo } from 'react';

import Animated, {
  // @ts-ignore
  makeMutable,
  runOnUI,
} from 'react-native-reanimated';

export interface GalleryManagerItem {
  index: number;
  ref: React.RefObject<unknown>;
}

export interface GalleryManagerSharedValues {
  width: Animated.SharedValue<number>;
  height: Animated.SharedValue<number>;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  activeIndex: Animated.SharedValue<number>;
  targetWidth: Animated.SharedValue<number>;
  targetHeight: Animated.SharedValue<number>;
}

export interface GalleryManagerItems {
  [index: number]: GalleryManagerItem;
}

class GalleryManager {
  private _isInitialized = false;
  private _timeout: NodeJS.Timeout | null = null;

  public refsByIndexSV: Animated.SharedValue<
    GalleryManagerItems
  > = makeMutable({});

  public sharedValues: GalleryManagerSharedValues = {
    width: makeMutable(0),
    height: makeMutable(0),
    x: makeMutable(0),
    y: makeMutable(0),
    opacity: makeMutable(1),
    activeIndex: makeMutable(0),
    targetWidth: makeMutable(0),
    targetHeight: makeMutable(0),
  };

  public items = new Map<number, any>();

  public get isInitialized() {
    return this._isInitialized;
  }

  public resolveItem(index: number) {
    return this.items.get(index);
  }

  public init() {
    this._isInitialized = true;
  }

  public reset() {
    this._isInitialized = false;
    this.items.clear();
    this.refsByIndexSV.value = {};
  }

  public resetSharedValues() {
    const {
      width,
      height,
      opacity,
      activeIndex,
      x,
      y,
    } = this.sharedValues;
    runOnUI(() => {
      'worklet';

      width.value = 0;
      height.value = 0;
      opacity.value = 1;
      activeIndex.value = -1;
      x.value = 0;
      y.value = 0;
    })();
  }

  public registerItem(index: number, ref: React.RefObject<unknown>) {
    if (this.items.has(index)) {
      return;
    }

    this._addItem(index, ref);
  }

  private _addItem(index: number, ref: GalleryManagerItem['ref']) {
    this.items.set(index, {
      index,
      ref,
    });

    // debounce it
    if (this._timeout !== null) {
      clearTimeout(this._timeout);
    }

    this._timeout = setTimeout(() => {
      this.refsByIndexSV.value = this._convertMapToObject(this.items);

      this._timeout = null;
    }, 16);
  }

  private _convertMapToObject<
    T extends Map<string | number, unknown>
  >(map: T) {
    const obj = {};
    for (let [key, value] of map) {
      // @ts-ignore
      obj[key] = value;
    }
    return obj;
  }
}

const GalleryContext = React.createContext<null | GalleryManager>(
  null,
);

interface ProviderProps {
  children: JSX.Element;
}

export function GalleryProvider({ children }: ProviderProps) {
  const galleryManager = useMemo(() => new GalleryManager(), []);

  return (
    <GalleryContext.Provider value={galleryManager}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGalleryManager() {
  const gallery = useContext(GalleryContext);

  if (!gallery) {
    throw new Error(
      'Cannot retrieve gallery manager from the context. Did you forget to wrap the app with GalleryProvider?',
    );
  }

  return gallery;
}
