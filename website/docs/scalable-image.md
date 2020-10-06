---
id: scalable-image
title: Scalable Image
slug: /apis/scalable-image
---

`Scalable Image`

> TODO: add preview here

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

Image source, this could be a local or remote image.

> `required:` YES | `type:` ImageRequireSource | string | `default:` undefined


### `width`

Image width.

> `required:` YES | `type:` number | `default:` undefined

### `height`

Image height.

> `required:` YES | `type:` number | `default:` undefined

### `canvasDimensions`

, usually it will be the window dimensions.

> `required:` NO | `type:` { width?: number; height?: number; } | `default:` Dimensions.get('window')

### `enabled` 

Enable gesture interaction.

> `required:` NO | `type:` boolean | `default:` true

### `timingConfig` 

Animation `duration` and `easing` configs.

> `required:` NO | `type:` { duration: number, easing: Easing } | `default:` { duration: 250, easing: Easing.bezier(0.33, 0.01, 0, 1) }

### `outerGestureHandlerRefs`

Array of gesture handler references that should work simultaneously with inner gesture handler.

> `required:` NO | `type:` Array<\React.Ref<\GestureHandler>> | `default:` []

### `outerGestureHandlerActive`

a Reanimated shared value to indicate out gesture active state.

> `required:` NO | `type:` Animated.SharedValue<\boolean> | `default:` undefined

### `style`

View style that will be applied to the image container.

> `required:` NO | `type:` ViewStyle | `default:` undefined

### `MAX_SCALE`

Maximum scale value.

> `required:` NO | `type:` number | `default:` 3

### `MIN_SCALE`

Minimum scale value.

> `required:` NO | `type:` number | `default:` 1

### `renderImage`

Callback method to handle image rendering.

> `required:` NO | `type:` (props: RenderScalableImageProps) => JSX.Element | `default:` undefined

## Handlers

### `onStateChange`

Fires when internal gesture become active, this could be a **Worklet or Function**.

> `required:` NO | `type:` (isActive: boolean) => void | `default:` undefined

### `onScale`

Fires when image scale changes, this could be a **Worklet or Function**.

> `required:` NO | `type:` (scale: number) => void | `default:` undefined

### `onGestureStart`

Fires when internal gesture starts, this could be a **Worklet or Function**.

> `required:` NO | `type:` () => void | `default:` undefined

### `onGestureRelease`

Fires when internal gesture releases, this could be a **Worklet or Function**.

> `required:` NO | `type:` () => void | `default:` undefined

### `onEnd`

Fires when animation ends, this could be a **Worklet or Function**.

> `required:` NO | `type:` () => void | `default:` undefined
