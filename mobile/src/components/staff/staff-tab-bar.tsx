import React from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface StaffTabBarProps {
  state: {
    routes: { key: string; name: string }[];
    index: number;
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (event: any) => any;
    navigate: (routeName: string) => void;
  };
}

const TAB_CONFIGS: Record<string, { label: string; icon: string; activeColor: string }> = {
  index: {
    label: 'Counter Sales',
    icon: '🧾',
    activeColor: '#10B981',
  },
  dube: {
    label: 'Customer Dube',
    icon: '👥',
    activeColor: '#F59E0B',
  },
  expenses: {
    label: 'Expenses',
    icon: '💸',
    activeColor: '#EF4444',
  },
};

export function StaffTabBar({ state, descriptors, navigation }: StaffTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View style={styles.barInner}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name] || {
            label: route.name,
            icon: '📋',
            activeColor: '#10B981',
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && { backgroundColor: 'rgba(15, 23, 42, 0.9)' },
              ]}
              hitSlop={4}
            >
              <View style={styles.iconWrapper}>
                <Text style={{ fontSize: isFocused ? 20 : 18 }}>{config.icon}</Text>
                {isFocused && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: config.activeColor },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? '#FFFFFF' : '#94A3B8',
                    fontWeight: isFocused ? '800' : '600',
                  },
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
