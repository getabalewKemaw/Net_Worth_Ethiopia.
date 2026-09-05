import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';

export default function SalesScreen() {
  const colors = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <HamburgerHeader activeTabId="sales" />

      <View className="flex-1 items-center justify-center px-6 pb-20">
        {/* Decorative Cart/Sales Icon Badge */}
        <View style={styles.iconCircle}>
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
              fill="rgba(16, 185, 129, 0.12)"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3 6H21"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* Coming Soon Pill */}
        <View style={styles.pillBadge}>
          <ThemedText className="text-[12px] font-extrabold text-[#10B981] uppercase tracking-wider">
            Coming Soon...
          </ThemedText>
        </View>

        <ThemedText className="text-[24px] font-black text-center mt-4 mb-2 tracking-tight" style={{ color: colors.text }}>
          Sales & Transactions
        </ThemedText>

        <ThemedText className="text-[14px] text-center max-w-[280px] leading-5 font-normal" style={{ color: colors.textSecondary }}>
          Sales recording, digital payments (Telebirr & CBE Birr), and receipt tracking are under active development.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 16,
  },
  pillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
});
