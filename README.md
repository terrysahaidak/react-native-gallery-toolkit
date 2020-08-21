<p align="center">
  <h1 align="center">Reanimated Gallery</h1>
  <h3 align="center"> Reanimated 2 powered Gallery implementation</h3>
</p>

# Development status

Currently, only standalone gallery (which you can render on a separate screen) is available. I'm preparing documentation for Pager and ImageTransformer components. For more info see Roadmap.

![Gallery in action gif](gifs/promo.gif)

## Installation

Use npm or yarn to install the library

```bash
npm i --save reanimated-gallery
```

> Also, you need to install latest [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) (then new 2 version) and [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler), and follow their installation instructions.

Expo is not currently supported because it doesn't support Reanimated 2.

## Usage

### Standalone gallery

Standalone gallery renders Pager which supports thousands of images thanks to virtualization. Each page renders ImageTransformer component which gives ability to pinch-to-zoom, double tap to zoom, also you can run custom callbacks and worklets on on tab, double tap, pan.

```tsx
import {
  StandaloneGallery,
  GalleryItemType,
  StandaloneGalleryHandler,
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

export default function App() {
  return <StandaloneGallery images={images} />;
}

```

For full example see [Examples](#examples).

### ImagePager

WIP

### ImageTransformer

WIP

## Props



## Examples

The source code for the example (showcase) app is under the [`Example/`](https://github.com/terrysahaidak/reanimated-gallery/blob/master/Example/) directory.
Clone the repo, go to the Example/ folder and run:

```bash
npm install
```

### Running on iOS

Before running the app, install the cocoapods dependencies:

```bash
npx pod-install
```

Now, you can start the app:

```bash
npm run ios
```

### Running on Android

```bash
npm run android
```

## LICENSE

[MIT](LICENSE)
