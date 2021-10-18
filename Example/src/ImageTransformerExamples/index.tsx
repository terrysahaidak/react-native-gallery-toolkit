import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ImageTransformerTest from './ImageTransformerTest';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
      }}
      initialRouteName="Transformer"
      headerMode="screen"
    >
      <Stack.Screen
        component={ImageTransformerTest}
        name="Image Transformer"
      />
    </Stack.Navigator>
  );
}
