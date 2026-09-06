import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <ThemedText style={{ fontSize: 44 }}>🛒</ThemedText>
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
