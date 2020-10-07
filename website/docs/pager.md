---
id: pager
title: Pager
slug: /apis/pager
---

`Pager`

> TODO: add preview here

## Usage

```tsx
// todo
```

## Props

### `initialIndex`

Initial page index.

> `required:` YES | `type:` number | `default:` undefined

### `initialDiffValue`

@todo

> `required:` YES | `type:` number | `default:` 0


### `totalCount`

Total pages count.

> `required:` YES | `type:` number | `default:` undefined

### `pages`

Pages @todo

> `required:` YES | `type:` Array<\GalleryItemType> | `default:` undefined

### `width`

Pager width, usually it will be the window width.

> `required:` NO | `type:` number | `default:` Dimensions.get('window').width

### `gutterWidth` 

Page gutter width.

> `required:` NO | `type:` number | `default:` Dimensions.get('window').width / 14

### `numToRender`

Number of pages to be render.

> `required:` NO | `type:` number | `default:` 2


### `shouldRenderGutter`

Should page gutter be render. 

> `required:` NO | `type:` boolean | `default:` undefined

### `verticallyEnabled`

Enable vertical gesture interaction.

> `required:` NO | `type:` boolean | `default:` true

### `outerGestureHandlerRefs`

Array of gesture handler references that should work simultaneously with inner gesture handler.

> `required:` NO | `type:` Array<\React.Ref<\GestureHandler>> | `default:` []

### `springConfig`

Animation spring configs.

> `required:` NO | `type:` Reanimated.WithSpringConfig | `default:` [default config](./src/Pager.tsx#L307)

### `pagerWrapperStyles`

Pager wrapper style.

> `required:` NO | `type:` ViewStyle | `default:` undefined

### `renderPage`

Callback method to handle page rendering.

> `required:` NO | `type:` (props: RenderPageProps, index: number) => JSX.Element | `default:` undefined

### `getItem` 

Callback method to get item for a given item at the specified index.

> `required:` NO | `type:` (data: GalleryItemType[], index: number) => GalleryItemType | `default:` undefined

### `keyExtractor`

Callback method to extract a unique key for a given item at the specified index.

> `required:` YES | `type:` (item: GalleryItemType, index: number) => string | `default:` undefined

### `shouldHandleGestureEvent`

Callback method to decide whether gesture should be handled or ignored, this could be a **Worklet or Function**.

> `required:` NO | `type:` (event: PanGestureHandlerGestureEvent.nativeEvent) => boolean | `default:` undefined


## Handlers

### `onIndexChange`

Fires when active index changes, this could be a **Worklet or Function**.

> `required:` NO | `type:` (nextIndex: number) => void | `default:` undefined 

### `onPagerTranslateChange`

Fires when page `translateX` changes, this could be a **Worklet or Function**.

> `required:` NO | `type:` (translateX: number) => void | `default:` undefined 

### `onGesture` 

Executes on pager's gesture, this could be a **Worklet or Function**.

> `required:` NO | `type:` (event: PanGestureHandlerGestureEvent, isActive: SharedValue<\boolean>) => void | `default:` undefined 
