import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { RoutesList } from '../../App';
import Basic from './Basic';
import FullFeatured from './FullFeatured';
import Mapping from './Map';

const Stack = createStackNavigator();

const routes: React.ComponentProps<typeof Stack.Screen>[] = [
  { name: 'Basic', component: Basic },
  { name: 'Map()', component: Mapping },
  {
    name: 'Custom full featured',
    component: FullFeatured,
    options: FullFeatured.options,
  },
];

function StandaloneHome() {
  return <RoutesList routes={routes} />;
}

export default function App() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
      }}
      // initialRouteName="Basic"
      headerMode="screen"
    >
      <Stack.Screen component={StandaloneHome} name="Standalone" />
      {routes.map((route) => (
        <Stack.Screen key={route.name} {...route} />
      ))}
    </Stack.Navigator>
  );
}
