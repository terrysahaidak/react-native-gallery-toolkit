import React from 'react';

import {
  StandaloneGallery,
  GalleryItemType,
} from 'reanimated-gallery';

const images: GalleryItemType[] = [
  {
    id: '1',
    width: 300,
    height: 300,
    uri: 'https://placekitten.com/300/300',
  },
  {
    id: '2',
    width: 400,
    height: 200,
    uri: 'https://placekitten.com/400/200',
  },
];

export default function StandaloneGalleryBasicScreen() {
  return <StandaloneGallery items={images} />;
}
