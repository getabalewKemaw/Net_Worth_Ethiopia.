import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
        }}
      />
      <Tabs.Screen
        name="text-fetching"
        options={{
          title: 'Text Fetching',
        }}
      />
      <Tabs.Screen
        name="bidr"
        options={{
          title: 'Debt / Bidr',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
