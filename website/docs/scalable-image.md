---
id: scalable-image
title: Scalable Image
slug: /apis/scalable-image
---

`Scalable Image`

## Usage

```tsx
import {
  ScalableImage,
  GalleryItemType
} from 'react-native-gallery-toolkit';

const image: GalleryItemType = {
  id: '4',
  width: 250,
  height: 250,
  uri: 'https://placekitten.com/250/250',
};

export default function App() {
  return (
    <View style={{flex: 1}}>
      <ScalableImage
        width={image.width}
        height={image.height}
        source={image.uri}
      />
    </View>
  );
}
```

## Props

### `source`

### `width`

### `height`

### `canvasDimensions`

### `enabled` 

### `timingConfig` 

### `outerGestureHandlerRefs`

### `outerGestureHandlerActive`

### `MAX_SCALE`

### `MIN_SCALE`

### `renderImage`

## Handlers

### `onStateChange`

### `onScale`

### `onGestureStart`

### `onGestureRelease`

### `onEnd`