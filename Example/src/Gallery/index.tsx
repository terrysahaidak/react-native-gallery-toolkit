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

const Stack = createStackNavigator();

function Home() {
  return <List items={['Photos List']} />;
}

export default function App() {
  return (
    <GalleryProvider>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: false,
        }}
        initialRouteName="List"
        headerMode="screen"
      >
        <Stack.Screen component={Home} name="List" />
        <Stack.Screen
          component={PhotosListScreen}
          name="Google Photos"
        />
        <Stack.Screen
          component={PhotoViewScreen}
          options={{
            title: '',
            animationEnabled: false,
          }}
          name="LightboxSharedTransitionScreen"
        />
      </Stack.Navigator>
    </GalleryProvider>
  );
}
