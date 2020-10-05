import React from 'react';
import {
  createStackNavigator,
  Header,
} from '@react-navigation/stack';

import ImageTransformerTest from './ImageTransformerTest';
import InstagramLikeImageTransformer from './InstagramLikeImageTransformer';
import InstagramFeed from './InstagramFeed/InstagramFeed';

import { List } from '../Navigation';
import { HeaderPropsScrapper } from '../DetachedHeader';

const Stack = createStackNavigator();

function Home() {
  return (
    <List
      items={[
        'Image Transformer',
        'Scalable image',
        'Instagram Feed',
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
      initialRouteName="Transformer"
      headerMode="screen"
    >
      <Stack.Screen component={Home} name="Transformer" />
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
          headerBackTitleVisible: false,
          title: 'Instagram',
        }}
        component={InstagramFeed}
        name="Instagram Feed"
      />
    </Stack.Navigator>
  );
}
