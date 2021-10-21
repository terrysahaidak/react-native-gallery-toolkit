import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  useWorkletCallback,
  withTiming,
} from 'react-native-reanimated';

export function useControls() {
  const controlsHidden = useSharedValue(false);

  const translateYConfig = {
    duration: 400,
    easing: Easing.bezier(0.33, 0.01, 0, 1),
  };

  const controlsStyles = useAnimatedStyle(() => {
    return {
      opacity: controlsHidden.value ? withTiming(0) : withTiming(1),
      transform: [
        {
          translateY: controlsHidden.value
            ? withTiming(-100, translateYConfig)
            : withTiming(0, translateYConfig),
        },
      ],
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 1,
    };
  });

  const setControlsHidden = useWorkletCallback((hidden: boolean) => {
    if (controlsHidden.value === hidden) {
      return;
    }

    controlsHidden.value = hidden;
  }, []);

  return {
    controlsHidden,
    controlsStyles,
    setControlsHidden,
  };
}
