import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { RoutesList } from '../../App';
import { HeaderPropsScrapper } from '../DetachedHeader';
import InstagramFeed from './InstagramFeed/InstagramFeed';
import ScalableImageExample from './ScalableImageExample';

const Stack = createStackNavigator();

const routes: React.ComponentProps<typeof Stack.Screen>[] = [
  {
    name: 'Scalable image',
    options: {
      header: HeaderPropsScrapper,
    },
    component: ScalableImageExample,
  },
  {
    name: 'Instagram Feed',
    component: InstagramFeed,
    options: {
      header: HeaderPropsScrapper,
    },
    // @ts-ignore
    headerBackTitleVisible: false,
    title: 'Instagram',
  },
];

function Home() {
  return <RoutesList routes={routes} />;
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
      {routes.map((route) => (
        <Stack.Screen key={route.name} {...route} />
      ))}
    </Stack.Navigator>
  );
}
