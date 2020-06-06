import React, {
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import {
  GalleryState,
  IShowFunction,
  IGalleryItem,
} from './GalleryState';
import { ImagePager } from './Pager';

const GalleryOverlayContext = React.createContext<IShowFunction | null>(
  null,
);
const GalleryContext = React.createContext<GalleryState | null>(null);

type IUseGalleryItem = {
  index: number;
  item: IGalleryItem;
};

export function useGalleryItem({ index, item }: IUseGalleryItem) {
  const gallery = useContext(GalleryContext);
  const ref = useRef<Animated.Image>();
  const opacity = useSharedValue(1);

  useEffect(() => {
    gallery!.addImage({ ref, index, item, opacity });
  }, []);

  const onPress = useCallback(() => {
    gallery!.onShow(index);
  }, []);

  return {
    opacity,
    ref,
    onPress,
  };
}

type IGalleryProviderProps = {
  totalCount: number;
  children: React.ReactNode;
};

export function GalleryProvider({
  totalCount,
  children,
}: IGalleryProviderProps) {
  const setActiveGallery = useContext(GalleryOverlayContext)!;
  const [gallery] = useState(
    new GalleryState(setActiveGallery, totalCount),
  );

  return (
    <GalleryContext.Provider value={gallery}>
      {children}
    </GalleryContext.Provider>
  );
}

type IGalleryOverlayProps = {
  children: React.ReactNode;
};

export function GalleryOverlay({ children }: IGalleryOverlayProps) {
  const [activeGallery, setActiveGallery] = useState<unknown>(
    null,
  ) as [GalleryState, IShowFunction];

  return (
    <GalleryOverlayContext.Provider value={setActiveGallery}>
      <View style={StyleSheet.absoluteFill}>
        {children}

        {activeGallery && <ImagePager gallery={activeGallery} />}
      </View>
    </GalleryOverlayContext.Provider>
  );
}
