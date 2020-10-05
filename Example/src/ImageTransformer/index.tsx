import React from 'react';
import {
  createStackNavigator,
  Header,
} from '@react-navigation/stack';

import ImageTransformerTest from './ImageTransformerTest';
import InstagramLikeImageTransformer from './InstagramLikeImageTransformer';
import CarouselLikeInstagram from './CarouselLikeInstagram/CarouselLikeInstagram';

import { List } from '../Navigation';
import { HeaderPropsScrapper } from '../DetachedHeader';

const Stack = createStackNavigator();

function Home() {
  return (
    <List
      items={[
        'Image Transformer',
        'Scalable image',
        'Instagram Like Feed',
      ]}
    />
  );
}

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
        component={ImageTransformerTest}
        name="Image Transformer"
      />
      <Stack.Screen
        options={{
          header: HeaderPropsScrapper,
        }}
        component={InstagramLikeImageTransformer}
        name="Scalable image"
      />
      <Stack.Screen
        options={{
          header: HeaderPropsScrapper,
        }}
        component={CarouselLikeInstagram}
        name="Instagram Like Feed"
      />
    </Stack.Navigator>
  );
}
