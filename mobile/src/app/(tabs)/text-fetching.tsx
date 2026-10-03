import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';

/**
 * Text Fetching Screen (Coming Soon)
 * Automated SMS, CBE Birr & telebirr transaction parser tab.
 */
export default function TextFetchingScreen() {
  const colors = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header with Hamburger Navigation */}
      <HamburgerHeader activeTabId="text-fetching" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO COMING SOON CARD */}
        <View style={styles.heroCard}>
          {/* Status Badge */}
          <View style={styles.comingSoonBadge}>
            <View style={styles.pulseDot} />
            <ThemedText style={styles.comingSoonText}>COMING SOON</ThemedText>
          </View>

          {/* Central Icon Representation */}
          <View style={styles.iconCircle}>
            <ThemedText style={{ fontSize: 38 }}>📲</ThemedText>
          </View>

          <ThemedText style={styles.heroTitle}>Text & SMS Fetching</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Automated transaction parsing for Ethiopian mobile banking & payment notifications.
          </ThemedText>
        </View>

        {/* PLANNED FEATURES PREVIEW */}
        <View style={styles.previewContainer}>
          <ThemedText style={styles.sectionHeader}>WHAT TO EXPECT</ThemedText>

          {/* Feature 1 */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#ECFDF5' }]}>
              <ThemedText style={{ fontSize: 20 }}>💬</ThemedText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={styles.featureTitle}>telebirr & CBE Birr Auto-Detect</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Automatically reads incoming payment SMS from 127 (telebirr) and CBE Birr, matching customer payments in real time.
              </ThemedText>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
              <ThemedText style={{ fontSize: 20 }}>🏦</ThemedText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={styles.featureTitle}>Commercial Bank Support</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Parses transaction notifications from Awash Bank, Bank of Abyssinia, Dashen Bank, and Nib International Bank.
              </ThemedText>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#FEF3C7' }]}>
              <ThemedText style={{ fontSize: 20 }}>⚡</ThemedText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={styles.featureTitle}>1-Tap Ledger Entry</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Converts bank SMS confirmation codes into verified bookkeeping sales entries with zero manual typing errors.
              </ThemedText>
            </View>
          </View>

          {/* Feature 4 */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#F3E8FF' }]}>
              <ThemedText style={{ fontSize: 20 }}>🔒</ThemedText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={styles.featureTitle}>100% Private & On-Device</ThemedText>
              <ThemedText style={styles.featureDescription}>
                SMS parsing runs strictly on your phone. Non-financial text messages are completely ignored and never uploaded.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* STATUS FOOTER NOTE */}
        <View style={styles.infoBanner}>
          <ThemedText style={styles.infoBannerIcon}>ℹ️</ThemedText>
          <ThemedText style={styles.infoBannerText}>
            Our engineering team is actively building text parser integrations. Stay tuned for the next app update!
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    gap: 12,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  previewContainer: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 18,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoBannerIcon: {
    fontSize: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 17,
  },
});
