import { RectButton } from 'react-native-gesture-handler';
import React from 'react';
import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { useGalleryInit } from 'reanimated-gallery';
import StandaloneGalleryScreen from './StandaloneGalleryScreen';

const Stack = createStackNavigator();

function ListItem({ title }) {
  const nav = useNavigation();
  return (
    <RectButton
      onPress={() => nav.navigate(title)}
      style={{
        height: 80,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
      }}
    >
      <Text>{title}</Text>
    </RectButton>
  );
}

function Home() {
  return (
    <>
      <ListItem title="Standalone" />
    </>
  );
}

export default function App() {
  useGalleryInit();

  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="screen">
        <Stack.Screen component={Home} name="Home" />
        <Stack.Screen
          name="Standalone"
          component={StandaloneGalleryScreen}
          options={() => ({
            headerTransparent: true,
            headerBackground: () => (
              <View style={{ backgroundColor: 'white', flex: 1 }} />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
