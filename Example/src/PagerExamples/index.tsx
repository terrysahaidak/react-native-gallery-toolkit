import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PagerExampleScreen } from './PagerExampleScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
      }}
      initialRouteName="Pager"
      headerMode="screen"
    >
      <Stack.Screen component={PagerExampleScreen} name="Pager" />
    </Stack.Navigator>
  );
}
