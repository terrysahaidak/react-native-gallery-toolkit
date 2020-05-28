import React, {
  useState,
  useRef,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnUI,
  interpolate,
  Easing,
  Extrapolate,
  withTiming,
  withSpring,
  useEvent,
  cancelAnimation,
  useDerivedValue,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import {
  Dimensions,
  StyleSheet,
  View,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import { ImageTransformer } from './ImageTransformer';
import { normalizeDimensions } from './utils';

const dimensions = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'black',
  },
  pager: {
    flex: 1,
    flexDirection: 'row',
  },
});

const AnimatedFastImage = Animated.createAnimatedComponent(
  Platform.OS === 'android' ? Image : FastImage,
);

class Gallery {
  constructor(fn, totalCount) {
    this._showFunction = fn;
    this.images = [];
    this.currentIndex = null;
    this._onChangeListeners = [];
    this.totalCount = totalCount;
  }

  get activeItem() {
    return this.images[this.currentIndex];
  }

  addImage({ ref, index, opacity, item }) {
    this.images[index] = {
      ref,
      index,
      opacity,
      item,
      measurements: {},
    };
  }

  async setActiveIndex(index) {
    this.currentIndex = index;

    await this._measure(this.activeItem);

    this._triggerListeners(this.activeItem);
  }

  addOnChangeListener(cb) {
    this._onChangeListeners.push(cb);

    return () => {
      this._onChangeListeners.filter((i) => i !== cb);
    };
  }

  async onShow(index) {
    await this.setActiveIndex(index);

    this._showFunction(this);
  }

  onClose() {
    this._showFunction(null);
  }

  _measure(item) {
    return new Promise((resolve, reject) =>
      item.ref.current.measure(
        (x, y, width, height, pageX, pageY) => {
          if (width === 0 && height === 0) {
            reject();
            return;
          }

          const { targetWidth, targetHeight } = normalizeDimensions(
            item.item,
          );

          item.measurements = {
            width,
            height,
            x: pageX,
            y: pageY,
            targetHeight,
            targetWidth,
          };

          resolve();
        },
      ),
    );
  }

  _triggerListeners(item) {
    this._onChangeListeners.forEach((cb) => cb(item));
  }
}

const GalleryOverlayContext = React.createContext(null);
const GalleryContext = React.createContext(null);

export function useGalleryItem({ index, item }) {
  const gallery = useContext(GalleryContext);
  const ref = useRef();

  useEffect(() => {
    gallery.addImage({ ref, index, item });
  }, []);

  const onPress = useCallback(() => {
    gallery.onShow(index);
  }, []);

  return {
    ref,
    onPress,
  };
}

export function GalleryProvider({ totalCount, children }) {
  const setActiveGallery = useContext(GalleryOverlayContext);
  const [gallery] = useState(
    new Gallery(setActiveGallery, totalCount),
  );

  return (
    <GalleryContext.Provider value={gallery}>
      {children}
    </GalleryContext.Provider>
  );
}

export function GalleryOverlay({ children }) {
  const [activeGallery, setActiveGallery] = useState(null);

  return (
    <GalleryOverlayContext.Provider value={setActiveGallery}>
      <View style={StyleSheet.absoluteFill}>
        {children}

        {activeGallery && <ImageTransition gallery={activeGallery} />}
      </View>
    </GalleryOverlayContext.Provider>
  );
}

function Gutter({ width }) {
  return <View style={{ width }} />;
}

const Page = React.memo(
  ({
    shouldRender,
    pagerRefs,
    page,
    onPageStateChange,
    gutterWidth,
    index,
    length,
  }) => {
    const targetWidth = dimensions.width;
    const scaleFactor = page.item.width / targetWidth;
    const targetHeight = page.item.height / scaleFactor;

    return (
      <>
        {shouldRender ? (
          <View
            style={[
              {
                width: dimensions.width,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            {/* <AnimatedFastImage
              source={{ uri: page.item.uri }}
              style={{
                width: targetWidth,
                height: targetHeight,
              }}
              // pagerActive={isActive}
              // {...page}
            /> */}
            <ImageTransformer
              {...{
                pagerRefs,
                onPageStateChange,
                uri: page.item.uri,
                width: targetWidth,
                height: targetHeight,
              }}
            />
          </View>
        ) : (
          <View
            style={{
              width: dimensions.width,
            }}
          />
        )}
        {index !== length - 1 && <Gutter width={gutterWidth} />}
      </>
    );
  },
);

function useRunOnce(cb) {
  const ref = useRef(null);

  if (ref.current === null) {
    cb();
    ref.current = true;
  }
}

function useSharedVector(x, y) {
  return {
    x: useSharedValue(x),
    y: useSharedValue(y),
  };
}

function getShouldRender(index, activeIndex, diffValue = 3) {
  const diff = Math.abs(index - activeIndex);

  if (diff > diffValue) {
    return false;
  }

  return true;
}

const GUTTER_WIDTH = dimensions.width / 14;
const FAR_FAR_AWAY = 9999;

const friction = (value) => {
  'worklet';

  const MAX_FRICTION = 30;
  const MAX_VALUE = 200;

  const res = Math.max(
    1,
    Math.min(
      MAX_FRICTION,
      1 + (Math.abs(value) * (MAX_FRICTION - 1)) / MAX_VALUE,
    ),
  );

  if (value < 0) {
    return -res;
  }

  return res;
};

const getPageTranslate = (i) => {
  const t = i * dimensions.width;
  const g = GUTTER_WIDTH * i;
  return -(t + g);
};

// in order to simultaneousHandlers to work
// we need to trigger rerender of the screen
// so refs will be valid then
function fixGestureHandler() {
  const [, set] = useState(0);

  useEffect(() => {
    set((v) => v + 1);
  }, []);
}

/**
 * @typedef {Object} IImageTransitionProps
 * @property {Gallery} gallery
 */

/**
 * @param {IImageTransitionProps} - Props
 */
function ImageTransition({ gallery }) {
  fixGestureHandler();

  const pagerRef = useRef();
  const tapRef = useRef();

  const isActive = useSharedValue(true);

  function onPageStateChange(value) {
    'worklet';

    isActive.value = value;
  }

  const imageWrapperPosition = useSharedValue(0);
  const pagerPosition = useSharedValue(FAR_FAR_AWAY);

  const setPagerVisible = (value) => {
    'worklet';

    imageWrapperPosition.value = value ? FAR_FAR_AWAY : 0;
    pagerPosition.value = value ? 0 : FAR_FAR_AWAY;
  };

  // S1: Image transition stuff
  const { measurements, item } = gallery.activeItem;

  const [activeImage, setActiveImage] = useState(item.uri);

  const animationProgress = useSharedValue(0);
  const scale = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);
  const statusBarFix = Platform.OS === 'android' ? 12 : 0;

  const x = useSharedValue(measurements.x);
  const width = useSharedValue(measurements.width);
  const height = useSharedValue(measurements.height);
  const targetWidth = useSharedValue(measurements.targetWidth);
  const targetHeight = useSharedValue(measurements.targetHeight);
  const y = useSharedValue(measurements.y);
  const target = useSharedVector(
    0,
    (dimensions.height - measurements.targetHeight) / 2 -
      statusBarFix,
  );
  const translate = useSharedVector(0, 0);

  useEffect(() => {
    const disposer = gallery.addOnChangeListener((nextItem) => {
      x.value = nextItem.measurements.x;
      width.value = nextItem.measurements.width;
      height.value = nextItem.measurements.height;
      targetWidth.value = nextItem.measurements.targetWidth;
      targetHeight.value = nextItem.measurements.targetHeight;
      y.value = nextItem.measurements.y;
      target.y.value =
        (dimensions.height - nextItem.measurements.targetHeight) / 2 -
        statusBarFix;

      setCurrentImageOpacity(0);

      setActiveImage(nextItem.item.uri);
    });

    return disposer;
  }, []);

  function setCurrentImageOpacity(value) {
    try {
      gallery.activeItem.ref.current.setNativeProps({
        style: {
          opacity: value,
        },
      });
    } catch (err) {
      console.log('Error changing opacity');
    }
  }

  // S1: Callbacks
  function afterOpen() {
    setCurrentImageOpacity(0);
  }

  function onClose() {
    setCurrentImageOpacity(1);

    gallery.onClose();
  }

  // S1: Animations
  const openAnimation = () => {
    'worklet';

    const easing = Easing.bezier(0.33, 0.01, 0, 1);

    animationProgress.value = withTiming(
      1,
      {
        duration: 400,
        easing,
      },
      () => {
        setPagerVisible(true);
        afterOpen();
      },
    );
    backdropOpacity.value = withTiming(1, {
      duration: 400,
      easing,
    });
  };

  // S1: Styles

  const imageStyles = useAnimatedStyle(() => {
    const i = (range) =>
      interpolate(
        animationProgress.value,
        [0, 1],
        range,
        Extrapolate.CLAMP,
      );

    const translateY =
      translate.y.value + i([y.value, target.y.value]);
    const translateX =
      translate.x.value + i([x.value, target.x.value]);

    return {
      // position: 'absolute',
      top: translateY,
      left: translateX,
      width: i([width.value, targetWidth.value]),
      height: i([height.value, targetHeight.value]),
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  const backdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  // S2: Pager related stuff
  const [diffValue, setDiffValue] = useState(1);
  const [activeIndex, setActiveIndex] = useState(
    gallery.activeItem.index,
  );

  useEffect(() => {
    setTimeout(() => {
      // setDiffValue(1);
    }, 300);
    // setTimeout(() => {
    //   setDiffValue(2);
    // }, 500);
  }, []);

  const index = useSharedValue(gallery.activeItem.index);
  const length = useSharedValue(gallery.totalCount);
  const pagerX = useSharedValue(0);
  const toValueAnimation = useSharedValue(
    getPageTranslate(gallery.activeItem.index),
  );
  const gestureTranslationX = useSharedValue(0);

  const offsetX = useSharedValue(
    getPageTranslate(gallery.activeItem.index),
  );

  const getTranslate = (i) => {
    'worklet';

    const t = i * dimensions.width;
    const g = GUTTER_WIDTH * i;
    return t + g;
  };

  function onIndexChange() {
    const nextIndex = index.value;

    setActiveIndex(nextIndex);

    setCurrentImageOpacity(1);

    gallery.setActiveIndex(nextIndex);
  }

  const onChangePageAnimation = (velocity) => {
    'worklet';

    offsetX.value = withSpring(toValueAnimation.value, {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      velocity,
    });
  };

  // S3 Pager
  const canSwipe = useDerivedValue(() => {
    const nextTranslate = offsetX.value + gestureTranslationX.value;

    if (nextTranslate > 0) {
      return false;
    }

    const totalTranslate =
      dimensions.width * (length.value - 1) +
      GUTTER_WIDTH * (length.value - 1);

    if (nextTranslate <= -totalTranslate) {
      return false;
    }

    return true;
  });

  const getNextIndex = ({ velocity }) => {
    'worklet';

    const currentTranslate = Math.abs(getTranslate(index.value));
    const currentIndex = index.value;
    const currentOffset = Math.abs(offsetX.value);

    const nextIndex =
      velocity < 0 ? currentIndex + 1 : currentIndex - 1;

    if (
      nextIndex < currentIndex &&
      currentOffset > currentTranslate
    ) {
      return currentIndex;
    }

    if (
      nextIndex > currentIndex &&
      currentOffset < currentTranslate
    ) {
      return currentIndex;
    }

    if (nextIndex > length.value - 1 || nextIndex < 0) {
      return currentIndex;
    }

    return nextIndex;
  };

  const isPagerInProgress = useDerivedValue(() => {
    return (
      Math.floor(getTranslate(index.value)) !==
      Math.floor(Math.abs(offsetX.value + pagerX.value))
    );
  });

  const onPan = useAnimatedGestureHandler({
    shouldHandleEvent: (evt) => {
      return (
        evt.numberOfPointers === 1 &&
        isActive.value &&
        animationProgress.value === 1
      );
    },

    onEvent: (evt) => {
      gestureTranslationX.value = evt.translationX;
    },

    onStart: (evt, ctx) => {
      const isHorizontalSwipe =
        Math.abs(evt.velocityX) > Math.abs(evt.velocityY);

      if (isHorizontalSwipe || isPagerInProgress.value) {
        setPagerVisible(true);
        ctx.pagerActive = true;
      } else {
        setPagerVisible(false);
      }
    },

    onActive: (evt, ctx) => {
      if (ctx.pagerActive) {
        pagerX.value = canSwipe.value
          ? evt.translationX
          : friction(evt.translationX);
      } else {
        translate.y.value = evt.translationY;
        translate.x.value = evt.translationX;

        scale.value = interpolate(
          translate.y.value,
          [-1000, -200, 0, 200, 1000],
          [0.65, 0.65, 1, 0.65, 0.65],
          Extrapolate.CLAMP,
        );

        backdropOpacity.value = interpolate(
          translate.y.value,
          [-100, 0, 100],
          [0, 1, 0],
          Extrapolate.CLAMP,
        );
      }
    },

    onEnd: (evt, ctx) => {
      if (ctx.pagerActive) {
        offsetX.value += pagerX.value;
        pagerX.value = 0;

        const nextIndex = getNextIndex({
          velocity: evt.velocityX,
        });

        const v = Math.abs(evt.velocityX);

        const shouldMoveToNextPage = v > 10 && canSwipe.value;

        // we invert the value since the tranlationY is left to right
        toValueAnimation.value = -(shouldMoveToNextPage
          ? getTranslate(nextIndex)
          : getTranslate(index.value));

        onChangePageAnimation(evt.velocityX);

        if (shouldMoveToNextPage) {
          index.value = nextIndex;
          onIndexChange();
        }
      } else {
        const easing = Easing.bezier(0.33, 0.01, 0, 1);
        const config = {
          duration: 200,
          easing,
        };

        if (Math.abs(translate.y.value) > 40) {
          target.x.value = translate.x.value - target.x.value * -1;
          target.y.value = translate.y.value - target.y.value * -1;

          translate.x.value = 0;
          translate.y.value = 0;

          animationProgress.value = withTiming(
            0,
            {
              duration: 400,
              easing,
            },
            onClose,
          );
          scale.value = withTiming(1, {
            duration: 400,
            easing,
          });

          backdropOpacity.value = withTiming(0, config);
        } else {
          translate.x.value = withTiming(0, config);
          translate.y.value = withTiming(0, config);
          backdropOpacity.value = withTiming(1, config);
          scale.value = withTiming(1, config, () => {
            setPagerVisible(true);
          });
        }
      }
    },

    onFinish: (evt, ctx) => {
      ctx.pagerActive = false;
    },
  });

  const onTap = useAnimatedGestureHandler({
    shouldHandleEvent: (evt) => {
      return (
        evt.numberOfPointers === 1 &&
        isActive.value &&
        animationProgress.value === 1
      );
    },

    onStart: () => {
      cancelAnimation(offsetX);
    },

    onEnd: () => {
      onChangePageAnimation();
    },
  });

  const pagerWrapperStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: pagerPosition.value,
        },
      ],
    };
  });

  const pagerStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: pagerX.value + offsetX.value,
        },
      ],
    };
  });

  const imageWrapperStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: imageWrapperPosition.value,
        },
      ],
    };
  });

  useEffect(() => {
    runOnUI(openAnimation)();
  }, []);
  // useRunOnce(runOnUI(openAnimation));

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.backdrop, backdropStyles]} />

      <Animated.View style={[StyleSheet.absoluteFill]}>
        <PanGestureHandler
          ref={pagerRef}
          simultaneousHandlers={[tapRef]}
          onGestureEvent={onPan}
          onHandlerStateChange={onPan}
          minDist={10}
        >
          <Animated.View style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[StyleSheet.absoluteFill, imageWrapperStyles]}
            >
              <AnimatedFastImage
                source={{ uri: activeImage }}
                style={imageStyles}
                // resizeMode={FastImage.resizeMode.cover}
              />
            </Animated.View>

            <Animated.View
              style={[StyleSheet.absoluteFill, pagerWrapperStyles]}
            >
              <TapGestureHandler
                ref={tapRef}
                // enabled={false}
                simultaneousHandlers={[pagerRef]}
                onGestureEvent={onTap}
                onHandlerStateChange={onTap}
              >
                <Animated.View style={StyleSheet.absoluteFill}>
                  <Animated.View style={[styles.pager, pagerStyles]}>
                    {gallery.images.map((page, i) => (
                      <Page
                        key={i.toString()}
                        page={page}
                        pagerRefs={[pagerRef, tapRef]}
                        onPageStateChange={onPageStateChange}
                        index={i}
                        length={gallery.totalCount}
                        shouldRender={getShouldRender(
                          i,
                          activeIndex,
                          diffValue,
                        )}
                        gutterWidth={GUTTER_WIDTH}
                      />
                    ))}
                  </Animated.View>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
}
