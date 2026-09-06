import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';

export default function BidrScreen() {
  const colors = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <HamburgerHeader activeTabId="bidr" />

      <View className="flex-1 items-center justify-center px-6 pb-20">
        {/* Decorative Bidr/Ledger Icon Badge */}
        <View style={styles.iconCircle}>
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
              fill="rgba(217, 119, 6, 0.12)"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 7H15"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M9 11H13"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {/* Coming Soon Pill */}
        <View style={styles.pillBadge}>
          <ThemedText className="text-[12px] font-extrabold text-[#D97706] uppercase tracking-wider">
            Coming Soon...
          </ThemedText>
        </View>

        <ThemedText className="text-[24px] font-black text-center mt-4 mb-2 tracking-tight" style={{ color: colors.text }}>
          Bidr & Debt Tracking
        </ThemedText>

        <ThemedText className="text-[14px] text-center max-w-[280px] leading-5 font-normal" style={{ color: colors.textSecondary }}>
          Customer store credit records, payment terms, and automated repayment tracking are under active development.
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
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
    marginBottom: 16,
  },
  pillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
});
