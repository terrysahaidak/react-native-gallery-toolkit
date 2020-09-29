import React from 'react';
import { Easing } from 'react-native';
import {
  createStackNavigator,
  StackNavigationProp,
  StackCardInterpolationProps,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import {
  LightboxSharedTransition,
  LightboxSharedTransitionList,
} from './LightboxSharedTransition';
import { List } from '../Navigation';
import { HeaderPropsScrapper } from '../DetachedHeader';
import {
  GalleryItemType,
  LightboxItemPayloadType,
} from '../../../src';
import { LightboxModalExample } from './LightboxModalExample';

const Stack = createStackNavigator();

function Home() {
  return (
    <List items={['Lightbox Shared Transition', 'Lightbox Modal']} />
  );
}

type RootStackParamList = {
  'Lightbox Shared Transition': undefined;
  LightboxSharedTransitionScreen: {
    list: GalleryItemType[];
    payload: LightboxItemPayloadType<GalleryItemType>;
  };
};

export type LightboxSharedTransitionScreenRoute = RouteProp<
  RootStackParamList,
  'LightboxSharedTransitionScreen'
>;
export type LightboxSharedTransitionListNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Lightbox Shared Transition'
>;

const sharedTransitionNavigationConfig: StackNavigationOptions = {
  transitionSpec: {
    // disable open animation
    open: {
      animation: 'timing',
      config: {
        duration: 0,
        easing: Easing.step0,
      },
    },
    // iOS slide animation
    close: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 10,
        restSpeedThreshold: 10,
      },
    },
  },
  // animate only card slide
  cardStyleInterpolator: ({
    current,
    layouts: { screen },
  }: StackCardInterpolationProps) => {
    const translateFocused = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.width, 0],
      extrapolate: 'clamp',
    });

    return {
      cardStyle: {
        transform: [{ translateX: translateFocused }],
      },
    };
  },
  // make sure to enable animation
  // we disable it when we do swipeout
  animationEnabled: true,
  // make sure card is transparent
  cardOverlayEnabled: false,
  cardStyle: {
    backgroundColor: 'transparent',
  },
};

export default function App() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
      }}
      initialRouteName="List"
      headerMode="screen"
    >
      <Stack.Screen component={Home} name="List" />
      <Stack.Screen
        component={LightboxSharedTransitionList}
        name="Lightbox Shared Transition"
      />
      <Stack.Screen
        component={LightboxSharedTransition}
        options={{
          title: '',
          ...sharedTransitionNavigationConfig,
          headerStyle: {
            elevation: 0,
          },
          header: HeaderPropsScrapper,
        }}
        name="LightboxSharedTransitionScreen"
      />
      <Stack.Screen
        component={LightboxModalExample}
        name="Lightbox Modal"
      />
    </Stack.Navigator>
  );
}
