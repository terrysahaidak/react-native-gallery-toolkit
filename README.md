<p align="center">
  <h1 align="center">Reanimated Gallery</h1>
  <h3 align="center"> Reanimated 2 powered Gallery implementation</h3>
</p>


# Development status

Currently, I'm refactoring Pager and Lightbox components in order to enable galleries without lightbox as well as an ability to change some of params of both pager and lightbox

The library will have few options:

- StandaloneGallery - ability to show pager with images as a new screen. Without lightbox transition.
- Gallery - regular list of photos with transition to and from pager.
- Lightbox - single photo with/without transform abilities.
- ImageTransformer - standalone component with abilities to transform image (pinch to zoom, pan).

![Gallery in action gif](gifs/promo.gif)

## Examples

The source code for the example (showcase) app is under the [`Example/`](https://github.com/terrysahaidak/reanimated-gallery/blob/master/Example/) directory.
Clone the repo, go to the Example/ folder and run:

```
npm install
```

### Running on iOS

Before running the app, install the cocoapods dependencies:

```
cd ios && pod install && cd ..
```

Now, you can start the app:

```
npm run ios
```

### Running on Android

```
npm run android
```

## LICENSE

[MIT](LICENSE)
