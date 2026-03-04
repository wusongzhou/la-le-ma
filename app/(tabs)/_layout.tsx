import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors, DoodleShadows } from '@/components/ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.mintDark,
        tabBarInactiveTintColor: Colors.text.secondary,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '记录',
          tabBarIcon: ({ focused }) => <TabIcon icon="timer-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '历史',
          tabBarIcon: ({ focused }) => <TabIcon icon="list-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '统计',
          tabBarIcon: ({ focused }) => <TabIcon icon="bar-chart-outline" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, focused }: { icon: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.15 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
      opacity: withTiming(focused ? 1 : 0.6, { duration: 200 }),
    };
  });

  return (
    <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
      <Ionicons
        name={icon}
        size={26}
        color={focused ? Colors.mintDark : Colors.text.secondary}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    borderRadius: 32,
    height: 72,
    paddingBottom: 10,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 0,
    borderWidth: 2,
    borderColor: Colors.border.mint,
    ...DoodleShadows.floating,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 36,
    borderRadius: 18,
  },
});
