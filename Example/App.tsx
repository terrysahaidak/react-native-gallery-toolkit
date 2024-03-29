import {
  NavigationContainer,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StatusBar, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ImageTransformerTest from './src/ImageTransformerExamples';
import PagerTest from './src/PagerExamples';
import ScalableImage from './src/ScalableImageExamples';
import SimpleGalleryTest from './src/SimpleGalleryExamples';

const Stack = createStackNavigator();

const routes: React.ComponentProps<typeof Stack.Screen>[] = [
  { name: 'Image Transformer', component: ImageTransformerTest },
  { name: 'Pager', component: PagerTest },
  { name: 'Scalable image', component: ScalableImage },
  { name: 'Simple gallery', component: SimpleGalleryTest },
];

export function RoutesList({
  routes,
}: {
  routes: React.ComponentProps<typeof Stack.Screen>[];
}) {
  const nav = useNavigation();

  return (
    <ScrollView>
      {routes.map((route) => (
        <RectButton
          key={route.name}
          onPress={() => nav.navigate(route.name)}
          style={{
            height: 64,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: 'white',
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ fontSize: 18 }}>{route.name}</Text>
          <Text style={{ fontSize: 24, color: '#4D4D4D' }}>➡</Text>
        </RectButton>
      ))}
    </ScrollView>
  );
}

export function Home() {
  useFocusEffect(() => {
    StatusBar.setHidden(false);
  });

  return <RoutesList routes={routes} />;
}

export default function App() {
  return (
    <>
      <StatusBar translucent showHideTransition="fade" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            gestureEnabled: false,
            headerShown: false,
            headerBackTitleVisible: false,
          }}
          headerMode="screen"
        >
          <Stack.Screen
            options={{
              headerShown: true,
            }}
            component={Home}
            name="Examples"
          />

          {routes.map((route) => (
            <Stack.Screen key={route.name} {...route} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
