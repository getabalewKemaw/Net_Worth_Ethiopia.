import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
export interface BottomTabBarProps {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

// ==========================================
// Custom Beautiful SVG Icons
// ==========================================

interface IconProps {
  focused: boolean;
  color: string;
  size?: number;
}

function DashboardIcon({ focused, color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="2.5"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={focused ? '1.5' : '2'}
      />
      <Rect
        x="13"
        y="3"
        width="8"
        height="5"
        rx="2"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={focused ? '1.5' : '2'}
      />
      <Rect
        x="13"
        y="11"
        width="8"
        height="10"
        rx="2.5"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={focused ? '1.5' : '2'}
      />
      <Rect
        x="3"
        y="14"
        width="8"
        height="7"
        rx="2"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth={focused ? '1.5' : '2'}
      />
    </Svg>
  );
}

function SalesIcon({ focused, color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
        fill={focused ? `${color}18` : 'none'}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 6H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BidrIcon({ focused, color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
        fill={focused ? `${color}18` : 'none'}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 7H15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M9 11H13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ProfileIcon({ focused, color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="7"
        r="4"
        fill={focused ? `${color}25` : 'none'}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ==========================================
// Bottom Tab Bar Component
// ==========================================

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // Ethiopian Forest Emerald primary brand color
  const activeColor = '#10B981';
  const inactiveColor = '#9CA3AF';
  const activeBg = 'rgba(16, 185, 129, 0.1)';

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 12),
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Render appropriate icon based on route name
          const renderIcon = () => {
            const iconColor = isFocused ? activeColor : inactiveColor;
            switch (route.name) {
              case 'index':
                return <DashboardIcon focused={isFocused} color={iconColor} />;
              case 'sales':
                return <SalesIcon focused={isFocused} color={iconColor} />;
              case 'bidr':
                return <BidrIcon focused={isFocused} color={iconColor} />;
              case 'profile':
                return <ProfileIcon focused={isFocused} color={iconColor} />;
              default:
                return <DashboardIcon focused={isFocused} color={iconColor} />;
            }
          };

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name === 'index'
              ? 'Dashboard'
              : route.name === 'sales'
              ? 'Sales'
              : route.name === 'bidr'
              ? 'Debt / Bidr'
              : 'Profile';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabItem]}
            >
              <View
                style={[
                  styles.iconBadgeContainer,
                  isFocused && { backgroundColor: activeBg },
                ]}
              >
                {renderIcon()}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {String(label)}
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
    position: 'relative',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconBadgeContainer: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
