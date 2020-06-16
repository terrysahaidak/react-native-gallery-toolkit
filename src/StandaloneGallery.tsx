import React, { useContext, useState } from 'react';
import { IGalleryItem, GalleryState } from './GalleryState';
import {
  GalleryOverlayContext,
  GalleryContext,
  GalleryOverlay,
} from './Provider';
import { ImagePager } from './Pager';

type StandaloneGalleryProps = {
  images: IGalleryItem[];
};

export function StandaloneGallery({
  images,
}: StandaloneGalleryProps) {
  const [gallery] = useState(
    new GalleryState({
      images,
    }),
  );

  return <ImagePager gallery={gallery} />;
}
