import {
  ImageRendererProps,
  SimpleGallery,
  SimpleGalleryItemType,
} from '@gallery-toolkit/simple-gallery';
import { useHeaderHeight } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, Text } from 'react-native';

const { height } = Dimensions.get('window');

const images = new Map<number, SimpleGalleryItemType>([
  [
    1,
    {
      width: 300,
      height: 300,
      uri: 'https://placekitten.com/300/300',
    },
  ],
  [
    2,
    {
      width: 400,
      height: 200,
      uri: 'https://placekitten.com/400/200',
    },
  ],
]);

interface PageProps
  extends ImageRendererProps<SimpleGalleryItemType> {
  index: number;
}

function Page(props: PageProps) {
  if (typeof props.item === 'undefined') {
    return <Text>Index {props.index} is Undefined</Text>;
  }

  return <SimpleGallery.ImageRenderer {...props} />;
}

export default function StandaloneMap() {
  const initialIndex = 1;
  const headerHeight = useHeaderHeight();

  const totalCount = 3;

  function handleIndexChange(i: number) {
    'worklet';
    console.log(i);
    // you can fetch more items and store it to the map here
  }

  return (
    <SimpleGallery
      initialIndex={initialIndex}
      onIndexChange={handleIndexChange}
      height={height - headerHeight}
      renderPage={(props, i) => <Page {...props} index={i} />}
      getItem={(data, i) => data.get(i)}
      items={images}
      getTotalCount={() => totalCount}
    />
  );
}
