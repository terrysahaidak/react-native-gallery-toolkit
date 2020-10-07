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

type | default | required
------ | ------ | ------
number | undefined | YES

### `initialDiffValue`

@todo

type | default | required
------ | ------ | ------
number | 0 | YES


### `totalCount`

Total pages count.

type | default | required
------ | ------ | ------
number | undefined | YES

### `pages`

Pages @todo

type | default | required
------ | ------ | ------
Array<\GalleryItemType> | undefined | YES

### `width`

Pager width, usually it will be the window width.

type | default | required
------ | ------ | ------
number | Dimensions.get('window').width | NO

### `gutterWidth` 

Page gutter width.

type | default | required
------ | ------ | ------
number | Dimensions.get('window').width / 14 | NO

### `numToRender`

Number of pages to be render.

type | default | required
------ | ------ | ------
number | 2 | NO


### `shouldRenderGutter`

Should page gutter be render. 

type | default | required
------ | ------ | ------
boolean | undefined | NO

### `verticallyEnabled`

Enable vertical gesture interaction.

type | default | required
------ | ------ | ------
boolean | true | NO

### `outerGestureHandlerRefs`

Array of gesture handler references that should work simultaneously with inner gesture handler.

type | default | required
------ | ------ | ------
Array<\React.Ref<\GestureHandler>> | [] | NO

### `springConfig`

Animation spring configs.

type | default | required
------ | ------ | ------
Reanimated.WithSpringConfig | [default config](./src/Pager.tsx#L307) | NO

### `pagerWrapperStyles`

Pager wrapper style.

type | default | required
------ | ------ | ------
ViewStyle | undefined | NO

### `renderPage`

Callback method to handle page rendering.

type | default | required
------ | ------ | ------
(props: RenderPageProps, index: number) => JSX.Element | undefined | NO

### `getItem` 

Callback method to get item for a given item at the specified index.

type | default | required
------ | ------ | ------
(data: GalleryItemType[], index: number) => GalleryItemType | undefined | NO

### `keyExtractor`

Callback method to extract a unique key for a given item at the specified index.

type | default | required
------ | ------ | ------
(item: GalleryItemType, index: number) => string | undefined | YES

### `shouldHandleGestureEvent`

Callback method to decide whether gesture should be handled or ignored, this could be a **Worklet or Function**.

type | default | required
------ | ------ | ------
(event: PanGestureHandlerGestureEvent.nativeEvent) => boolean | undefined | NO


## Handlers

### `onIndexChange`

Fires when active index changes, this could be a **Worklet or Function**.

type | default | required
------ | ------ | ------
(nextIndex: number) => void | undefined  | NO

### `onPagerTranslateChange`

Fires when page `translateX` changes, this could be a **Worklet or Function**.

type | default | required
------ | ------ | ------
(translateX: number) => void | undefined  | NO

### `onGesture` 

Executes on pager's gesture, this could be a **Worklet or Function**.

type | default | required
------ | ------ | ------
(event: PanGestureHandlerGestureEvent, isActive: SharedValue<\boolean>) => void | undefined  | NO
