import React from 'react';
import { Tabs } from 'expo-router';
import { StaffTabBar } from '@/components/staff/staff-tab-bar';

export default function StaffLayout() {
  return (
    <Tabs
      tabBar={(props) => <StaffTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Counter Sales',
        }}
      />
      <Tabs.Screen
        name="dube"
        options={{
          title: 'Customer Dube',
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
        }}
      />
    </Tabs>
  );
}
