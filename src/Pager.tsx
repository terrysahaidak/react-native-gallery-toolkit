import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  Dimensions,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useAnimatedGestureHandler } from './useAnimatedGestureHandler';
import {
  friction,
  fixGestureHandler,
  getShouldRender,
} from './utils';

const dimensions = Dimensions.get('window');

const GUTTER_WIDTH = dimensions.width / 14;
const FAR_FAR_AWAY = 9999;

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

type IGutterProps = {
  width: number;
};

function Gutter({ width }: IGutterProps) {
  return <View style={{ width }} />;
}

type PageRefs = [
  React.Ref<TapGestureHandler>,
  React.Ref<PanGestureHandler>,
];

export type RenderPageProps<T> = {
  index: number;
  pagerRefs: PageRefs;
  onPageStateChange: (value: boolean) => void;
  page: T;
  width: number;
};

type IPageProps = {
  page: any;
  pagerRefs: PageRefs;
  onPageStateChange: (value: boolean) => void;
  gutterWidth: number;
  index: number;
  length: number;
  renderPage: (props: RenderPageProps<any>) => JSX.Element;
  shouldRenderGutter: boolean;
  getPageTranslate: (index: number) => number;
  width: number;
};

const Page = React.memo<IPageProps>(
  ({
    pagerRefs,
    page,
    onPageStateChange,
    gutterWidth,
    index,
    length,
    renderPage,
    shouldRenderGutter,
    getPageTranslate,
    width,
  }) => {
    // const targetWidth = dimensions.width;
    // const scaleFactor = page.item.width / targetWidth;
    // const targetHeight = page.item.height / scaleFactor;

    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: -getPageTranslate(index),
        }}
      >
        <View
          style={[
            {
              flex: 1,
              width: dimensions.width,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          {renderPage({
            index,
            pagerRefs,
            onPageStateChange,
            page,
            width,
          })}
        </View>

        {index !== length - 1 && shouldRenderGutter && (
          <Gutter width={gutterWidth} />
        )}
      </View>
    );
  },
);

type IImagePager<T> = {
  initialIndex: number;
  totalCount: number;
  pages: T[];
  numToRender: number;
  width?: number;
  gutterWidth?: number;
  onIndexChangeAsync: (nextIndex: number) => Promise<void>;
  renderPage: (props: RenderPageProps<T>) => JSX.Element;
  shouldRenderGutter?: boolean;
  keyExtractor: (item: T, index: number) => string;
  // gallery: GalleryState;
};

export function ImagePager<TPage>({
  pages,
  initialIndex,
  totalCount,
  numToRender,
  onIndexChangeAsync,
  renderPage,
  width = dimensions.width,
  gutterWidth = GUTTER_WIDTH,
  shouldRenderGutter = true,
  keyExtractor,
}: IImagePager<TPage>) {
  fixGestureHandler();

  // make sure to not calculate translate with gutter
  // if we don't want to render it
  if (!shouldRenderGutter) {
    gutterWidth = 0;
  }

  const getPageTranslate = useCallback((i: number) => {
    'worklet';

    const t = i * width;
    const g = gutterWidth * i;
    return t + g;
  }, []);

  const pagerRef = useRef(null);
  const tapRef = useRef(null);

  const isActive = useSharedValue(true);

  function onPageStateChange(value: boolean) {
    'worklet';

    isActive.value = value;
  }

  const imageWrapperPosition = useSharedValue(0);
  const pagerPosition = useSharedValue(0);

  const setPagerVisible = (value: boolean) => {
    'worklet';

    imageWrapperPosition.value = value ? FAR_FAR_AWAY : 0;
    pagerPosition.value = value ? 0 : FAR_FAR_AWAY;
  };

  const animationProgress = useSharedValue(1);
  const scale = useSharedValue(1);

  const velocity = useSharedValue(0);

  const [diffValue, setDiffValue] = useState(numToRender);
  useEffect(() => {
    setDiffValue(numToRender);
  }, [numToRender]);

  // S2: Pager related stuff
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const index = useSharedValue(initialIndex);
  const length = useSharedValue(totalCount);
  const pagerX = useSharedValue(0);
  const toValueAnimation = useSharedValue(
    getPageTranslate(initialIndex),
  );
  const gestureTranslationX = useSharedValue(0);

  const offsetX = useSharedValue(getPageTranslate(initialIndex));

  const totalWidth = useDerivedValue(() => {
    return (
      length.value * dimensions.width +
      GUTTER_WIDTH * length.value -
      2
    );
  });

  const onIndexChange = useCallback(async () => {
    const nextIndex = index.value;

    if (onIndexChangeAsync) {
      await onIndexChangeAsync(nextIndex);
    }

    setActiveIndex(nextIndex);
  }, []);

  const onChangePageAnimation = () => {
    'worklet';

    offsetX.value = withSpring(toValueAnimation.value, {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      velocity: velocity.value,
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

  const getNextIndex = (v: number) => {
    'worklet';

    const currentTranslate = Math.abs(getPageTranslate(index.value));
    const currentIndex = index.value;
    const currentOffset = Math.abs(offsetX.value);

    const nextIndex = v < 0 ? currentIndex + 1 : currentIndex - 1;

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
      Math.floor(getPageTranslate(index.value)) !==
      Math.floor(Math.abs(offsetX.value + pagerX.value))
    );
  });

  const onPan = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {
      pagerActive: boolean;
    }
  >({
    shouldHandleEvent: (evt) => {
      return (
        evt.numberOfPointers === 1 &&
        isActive.value &&
        animationProgress.value === 1
      );
    },

    onEvent: (evt) => {
      gestureTranslationX.value = evt.translationX;
      velocity.value = evt.velocityX;
    },

    onActive: (evt) => {
      pagerX.value = canSwipe.value
        ? evt.translationX
        : friction(evt.translationX);
    },

    onEnd: (evt) => {
      offsetX.value += pagerX.value;
      pagerX.value = 0;

      const nextIndex = getNextIndex(evt.velocityX);

      const v = Math.abs(evt.velocityX);

      const shouldMoveToNextPage = v > 10 && canSwipe.value;

      // we invert the value since the tranlationY is left to right
      toValueAnimation.value = -(shouldMoveToNextPage
        ? getPageTranslate(nextIndex)
        : getPageTranslate(index.value));

      onChangePageAnimation();

      if (shouldMoveToNextPage) {
        index.value = nextIndex;
        onIndexChange();
      }
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
      if (scale.value !== 1) {
        return;
      }
      cancelAnimation(offsetX);
    },

    onEnd: () => {
      if (scale.value !== 1) {
        return;
      }

      onChangePageAnimation();
    },
  });

  const pagerWrapperStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: 'black',
      transform: [
        {
          translateY: pagerPosition.value,
        },
      ],
    };
  });

  const pagerStyles = useAnimatedStyle<ViewStyle>(() => {
    return {
      width: totalWidth.value,
      transform: [
        {
          translateX: pagerX.value + offsetX.value,
        },
      ],
    };
  });

  const pagerRefs = useMemo<PageRefs>(() => [pagerRef, tapRef], []);

  const pagesToRender = pages.map((page, i) => {
    const shouldRender = getShouldRender(i, activeIndex, diffValue);

    if (!shouldRender) {
      return null;
    }

    return (
      <Page
        key={keyExtractor(page, i)}
        page={page}
        pagerRefs={pagerRefs}
        onPageStateChange={onPageStateChange}
        index={i}
        length={totalCount}
        gutterWidth={GUTTER_WIDTH}
        renderPage={renderPage}
        getPageTranslate={getPageTranslate}
        width={width}
        shouldRenderGutter={shouldRenderGutter}
      />
    );
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[StyleSheet.absoluteFill]}>
        <PanGestureHandler
          ref={pagerRef}
          simultaneousHandlers={[tapRef]}
          onGestureEvent={onPan}
          onHandlerStateChange={onPan}
        >
          <Animated.View style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[StyleSheet.absoluteFill, pagerWrapperStyles]}
            >
              <TapGestureHandler
                ref={tapRef}
                // TODO: Fix tap gesture handler
                enabled={false}
                simultaneousHandlers={[pagerRef]}
                onGestureEvent={onTap}
                onHandlerStateChange={onTap}
              >
                <Animated.View style={StyleSheet.absoluteFill}>
                  <Animated.View style={[styles.pager, pagerStyles]}>
                    {pagesToRender}
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
