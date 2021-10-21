import { SimpleGallery } from '@gallery-toolkit/simple-gallery';
import { useHeaderHeight } from '@react-navigation/stack';
import React from 'react';
import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const images = [
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
  {
    id: '3',
    width: 400,
    height: 200,
    uri: 'https://placekitten.com/400/200',
  },
  {
    id: '4',
    width: 400,
    height: 200,
    uri: 'https://placekitten.com/400/200',
  },
];

export default function StandaloneGalleryBasicScreen() {
  const headerHeight = useHeaderHeight();
  return (
    <SimpleGallery height={height - headerHeight} items={images} />
  );
}
