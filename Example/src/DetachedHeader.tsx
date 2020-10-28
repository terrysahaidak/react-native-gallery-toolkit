import React, { useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';
import { Header, StackHeaderProps } from '@react-navigation/stack';
import { View, ViewStyle } from 'react-native';

const headerPropsMap = new Map<string, StackHeaderProps>();
const subs: Array<() => void> = [];

function setProps(name: string, props: StackHeaderProps) {
  headerPropsMap.set(name, props);

  setTimeout(() => {
    subs.forEach((cb) => cb());
  }, 0);
}

function useHeaderProps() {
  const route = useRoute();

  return headerPropsMap.get(route.name);
}

export function HeaderPropsScrapper(props: StackHeaderProps) {
  setProps(props.scene.route.name, props);

  return null;
}

export function DetachedHeader() {
  const [, forceUpdate] = useState(false);
  useEffect(() => {
    const onPropsChange = () => forceUpdate((v) => !v);

    subs.push(onPropsChange);

    return () => {
      const index = subs.findIndex((i) => i === onPropsChange);

      subs.splice(index);
    };
  }, []);

  const headerProps = useHeaderProps();

  return headerProps ? <Header {...headerProps} /> : null;
}

DetachedHeader.Container = ({
  children,
  style,
}: {
  children: JSX.Element;
  style?: ViewStyle;
}) => {
  return (
    <Animated.View
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0 },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
