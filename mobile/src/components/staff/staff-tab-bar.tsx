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
    activeColor: '#065F46',
  },
  dube: {
    label: 'Customer Dube',
    icon: '👥',
    activeColor: '#D97706',
  },
  expenses: {
    label: 'Expenses',
    icon: '💸',
    activeColor: '#DC2626',
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
            activeColor: '#065F46',
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
                isFocused && { backgroundColor: `${config.activeColor}14` },
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
                    color: isFocused ? config.activeColor : '#64748B',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
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
