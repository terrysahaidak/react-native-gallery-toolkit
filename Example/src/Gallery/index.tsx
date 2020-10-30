import React from 'react';
import { Easing } from 'react-native';
import {
  createStackNavigator,
  StackNavigationProp,
  StackCardInterpolationProps,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { List } from '../Navigation';
import { HeaderPropsScrapper } from '../DetachedHeader';
import {
  GalleryItemType,
  GalleryProvider,
  LightboxItemPayloadType,
} from '../../../src';
import { PhotosListScreen } from './PhotosListScreen';
import { PhotoViewScreen } from './PhotoViewScreen';

const Stack = createStackNavigator();

type RootStackParamList = {
  'Photo List': undefined;
  'Photo View': {
    list: GalleryItemType[];
    index: number;
  };
};

export type PhotoViewScreenRoute = RouteProp<
  RootStackParamList,
  'Photo View'
>;
export type PhotoListNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Photo List'
>;

export default function App() {
  return (
    <GalleryProvider>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: false,
        }}
        initialRouteName="Photo List"
        headerMode="screen"
      >
        <Stack.Screen
          component={PhotosListScreen}
          name="Photo List"
        />
        <Stack.Screen
          component={PhotoViewScreen}
          options={{
            title: '',
            animationEnabled: false,
            header: HeaderPropsScrapper,
            cardStyle: {
              backgroundColor: 'transparent',
            },
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTintColor: 'white',
          }}
          name="Photo View"
        />
      </Stack.Navigator>
    </GalleryProvider>
  );
}
