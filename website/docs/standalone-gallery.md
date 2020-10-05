---
id: standalone-gallery
title: Standalone Gallery
slug: /apis/standalone-gallery
---

`Standalone Gallery` renders Pager which supports thousands of images thanks to virtualization. Each page renders `ImageTransformer` component which gives ability to pinch-to-zoom, double tap to zoom, also you can run custom callbacks and worklets on on tab, double tap, pan.

> TODO: add preview here

## Usage

```tsx
import {
  StandaloneGallery,
  GalleryItemType,
  StandaloneGalleryHandler,
} from 'react-native-gallery-toolkit';

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

export default function App() {
  return <StandaloneGallery items={images} />;
}
```

## Base Props

### `items`

The array of items to render. But can also accept `Map`, `Set`, or `Object` with keys. If the type is not array, then `getTotalCount` and `getItem` should be defined too.

> `required:` YES | `type:` Array<[GalleryItemType](./types/gallery-item-type)> | `default:` undefined

### `width`

Viewport width, usually it will be the window width.

> `required:` NO | `type:` number | `default:` Dimensions.get('window').width

### `height`

Viewport height, usually it will be the window height.

> `required:` NO | `type:` number | `default:` Dimensions.get('window').height

### `numToRender`

How many pages should be rendered at the same time.

> `required:` NO | `type:` number | `default:` 2

### `gutterWidth`

The width of the gutter between pages.

> `required:` NO | `type:` number | `default:` 0

### `initialIndex`

The initial page index.

> `required:` NO | `type:` number | `default:` 0

### `keyExtractor`

Callback which extract the key of the page. Receives current item of the provided items as well as current index.

> `required:` NO | `type:` (item: T, index: number) => string | `default:` Uses index as a key by default

## Advance Props

### `getTotalCount`

If the type of `items` is not an array, then this method should be defined to provide the total count of items	

> `required:` NO* | `type:` (data: T) => number	 | `default:` undefined | \* Required when items is not an array

### `getItem`

If the type of `items` is not an array, then this method should be defined to provide the current item based on the index. Can return either the `item` or `undefined`.	

> `required:` NO* | `type:` (data: T, index: number) => ItemT or undefined | `default:` undefined | \* Required when items is not an array

### `renderImage`

Callback that can be used to render custom image component. As an example, it can be used to render custom loading/error states.

> `required:` NO | `type:` (props: RenderImageProps, item: ItemT, index: number) => JSX.Element	 | `default:` undefined

### `renderPage`

Callback that can be used to render custom page. Can be used to display some non-image pages such as Video, for instance.

> `required:` NO | `type:` (props: ImageRendererProps<\T>, index: number) => JSX.Element | `default:` ImageRenderer

## Handlers

### `onIndexChange`

Fires when active index changes, this could be a **Worklet or Function**.

> `required:` NO | `type:` (nextIndex: number) => void | `default:` undefined 

### `onTap`

Executes when tap image transformer receives tap, this could be a **Worklet or Function**.

> `required:` NO | `type:` () => void | `default:` undefined 

### `onDoubleTap`

Executes when tap image transformer receives double-tap, this could be a **Worklet or Function**.

> `required:` NO | `type:` () => void | `default:` undefined 

### `onInteraction`

Is called when either pan or scale has happened, this could be a **Worklet or Function**.

> `required:` NO | `type:` (type: 'scale' | 'pan') => void | `default:` undefined 

### `onPagerTranslateChange`

Executes on pager's horizontal pan, this could be a **Worklet or Function**.

> `required:` NO | `type:` (translateX: number) => void	 | `default:` undefined 

### `onGesture`

Executes on pager's gesture, this could be a **Worklet or Function**.

> `required:` NO | `type:` (event: PanGestureHandlerGestureEvent, isActive: SharedValue<\boolean>) => void | `default:` undefined 

### `shouldPagerHandleGestureEvent`

Worklet that will be passed to pager's `shouldHandleEvent` to determine should pager handle this event. Can be used to handle "swipe down to close", this could be **only Worklet**.

> `required:` NO | `type:` (event: PanGestureHandlerGestureEvent) => boolean | `default:` undefined 

## Methods

### `goNext`

Changes the active index forward.

> `type:` () => void 

### `goBack`

Changes the active index backward.

> `type:` () => void 

### `setIndex`

Sets the active index.

> `type:` (nextIndex: number) => void

