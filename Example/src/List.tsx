import { RectButton } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  NavigationContainer,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {
  createStackNavigator,
  Header,
  StackHeaderProps,
} from '@react-navigation/stack';
import { View, Text, StatusBar } from 'react-native';
import { useGalleryInit } from 'reanimated-gallery';
import Animated from 'react-native-reanimated';
import StandaloneGalleryScreen, {
  useToggleOpacity,
} from './StandaloneGalleryScreen';
import StandaloneGalleryBasicScreen from './StandaloneGalleryBasicScreen';

const Stack = createStackNavigator();

function ListItem({ title }: { title: string }) {
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
  useFocusEffect(() => {
    StatusBar.setHidden(false);
  });

  return (
    <>
      <ListItem title="Standalone basic" />
      <ListItem title="Standalone full featured" />
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

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

export default function App() {
  useGalleryInit();
  return (
    <>
      <StatusBar translucent showHideTransition="fade" />
      <NavigationContainer>
        <Stack.Navigator headerMode="screen">
          <Stack.Screen component={Home} name="Home" />
          <Stack.Screen
            component={StandaloneGalleryBasicScreen}
            name="Standalone basic"
          />
          <Stack.Screen
            name="Standalone full featured"
            component={StandaloneGalleryScreen}
            options={({ route }) => ({
              cardStyleInterpolator: forFade,
              headerTransparent: true,
              headerBackground: () => (
                <View style={{ backgroundColor: 'white', flex: 1 }} />
              ),
              gestureEnabled: false,
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
    </>
  );
}
