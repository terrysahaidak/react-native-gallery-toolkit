import { RectButton } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createStackNavigator,
  TransitionPresets,
  Header,
  StackHeaderProps,
} from '@react-navigation/stack';
import { View, Text, Platform } from 'react-native';
import { useGalleryInit } from 'reanimated-gallery';
import Animated from 'react-native-reanimated';
import StandaloneGalleryScreen, {
  useToggleOpacity,
} from './StandaloneGalleryScreen';

const Stack = createStackNavigator();

function ListItem({ title }) {
  const nav = useNavigation();
  return (
    <RectButton
      onPress={() => nav.navigate(title)}
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
      <Text style={{ fontSize: 18 }}>{title}</Text>
      <Text style={{ fontSize: 24, color: '#4D4D4D' }}>➡</Text>
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

function CustomHeader({
  headerProps,
  headerShown,
}: {
  headerProps: StackHeaderProps;
  route: any;
  headerShown: boolean;
}) {
  const styles = useToggleOpacity(headerShown);

  return (
    <Animated.View style={styles}>
      <Header {...headerProps} />
    </Animated.View>
  );
}

export default function App() {
  useGalleryInit();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          ...(Platform.OS === 'android'
            ? TransitionPresets.ScaleFromCenterAndroid
            : TransitionPresets.DefaultTransition),
        }}
        headerMode="screen"
      >
        <Stack.Screen component={Home} name="Home" />
        <Stack.Screen
          name="Standalone"
          component={StandaloneGalleryScreen}
          options={({ route }) => ({
            headerTransparent: true,
            headerBackground: () => (
              <View style={{ backgroundColor: 'white', flex: 1 }} />
            ),
            header: (headerProps) => (
              <CustomHeader
                headerShown={route?.params?.headerShown ?? true}
                headerProps={headerProps}
                route={route}
              />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
