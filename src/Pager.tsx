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
  runOnUI,
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

const GUTTER_WIDTH = Math.round(dimensions.width / 14);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
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
  isActive: Animated.SharedValue<boolean>;
  isPagerInProgress: Animated.SharedValue<boolean>;
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
  currentIndex: Animated.SharedValue<number>;
  isPagerInProgress: Animated.SharedValue<boolean>;
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
    currentIndex,
    isPagerInProgress,
  }) => {
    const isActive = useDerivedValue(() => {
      // return currentIndex.value === index;
      return false;
    });

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
              width,
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
            isActive,
            isPagerInProgress,
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
  numToRender?: number;
  width?: number;
  gutterWidth?: number;
  onIndexChange?: (nextIndex: number) => void;
  renderPage: (props: RenderPageProps<T>) => JSX.Element;
  shouldRenderGutter?: boolean;
  keyExtractor: (item: T, index: number) => string;
  getItem?: (data: T[], index: number) => T;
  pagerWrapperStyles?: any;
  // gallery: GalleryState;
};

export function ImagePager<TPage>({
  pages,
  initialIndex,
  totalCount,
  numToRender = 2,
  onIndexChange,
  renderPage,
  width = dimensions.width,
  gutterWidth = GUTTER_WIDTH,
  shouldRenderGutter = true,
  keyExtractor,
  pagerWrapperStyles = {},
  getItem,
}: IImagePager<TPage>) {
  fixGestureHandler();

  // make sure to not calculate translate with gutter
  // if we don't want to render it
  if (!shouldRenderGutter) {
    gutterWidth = 0;
  }

  const getPageTranslate = (i: number) => {
    'worklet';

    const t = i * width;
    const g = gutterWidth * i;
    return -(t + g);
  };

  const pagerRef = useRef(null);
  const tapRef = useRef(null);

  const isActive = useSharedValue(true);

  function onPageStateChange(value: boolean) {
    'worklet';

    isActive.value = value;
  }

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
    return length.value * width + gutterWidth * length.value - 2;
  });

  const onIndexChangeCb = useCallback((nextIndex) => {
    'worklet';

    if (onIndexChange) {
      onIndexChange(nextIndex);
    }

    setActiveIndex(nextIndex);
  }, []);

  useEffect(() => {
    runOnUI(() => {
      offsetX.value = getPageTranslate(initialIndex);
      index.value = initialIndex;
      onIndexChangeCb(initialIndex);
    })();
  }, [initialIndex]);

  const onChangePageAnimation = (noVelocity?: boolean) => {
    'worklet';

    offsetX.value = withSpring(
      toValueAnimation.value,
      {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        velocity: noVelocity ? 0 : velocity.value,
      },
      (isCanceled) => {
        if (!isCanceled) {
          velocity.value = 0;
        }
      },
    );
  };

  // S3 Pager
  const canSwipe = useDerivedValue(() => {
    const nextTranslate = offsetX.value + gestureTranslationX.value;

    if (nextTranslate > 0) {
      return false;
    }

    const totalTranslate =
      width * (length.value - 1) + gutterWidth * (length.value - 1);

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
      Math.floor(Math.abs(getPageTranslate(index.value))) !==
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
      return evt.numberOfPointers === 1 && isActive.value;
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
        ? -getPageTranslate(nextIndex)
        : -getPageTranslate(index.value));

      onChangePageAnimation(!shouldMoveToNextPage);

      if (shouldMoveToNextPage) {
        index.value = nextIndex;
        onIndexChangeCb(nextIndex);
      }
    },
  });

  const onTap = useAnimatedGestureHandler({
    shouldHandleEvent: (evt) => {
      return evt.numberOfPointers === 1 && isActive.value;
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

    const pageToUse =
      typeof getItem === 'undefined' ? page : getItem(pages, i);

    return (
      <Page
        key={keyExtractor(page, i)}
        page={pageToUse}
        currentIndex={index}
        pagerRefs={pagerRefs}
        onPageStateChange={onPageStateChange}
        index={i}
        length={totalCount}
        gutterWidth={gutterWidth}
        renderPage={renderPage}
        getPageTranslate={getPageTranslate}
        width={width}
        isPagerInProgress={isPagerInProgress}
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
          minDeltaX={10}
          minDeltaY={10}
        >
          <Animated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler
              ref={tapRef}
              maxDeltaX={10}
              maxDeltaY={10}
              simultaneousHandlers={[pagerRef]}
              onGestureEvent={onTap}
            >
              <Animated.View
                style={[StyleSheet.absoluteFill, pagerWrapperStyles]}
              >
                <Animated.View style={StyleSheet.absoluteFill}>
                  <Animated.View style={[styles.pager, pagerStyles]}>
                    {pagesToRender}
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
}
