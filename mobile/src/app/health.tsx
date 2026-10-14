import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessStore } from '@/store/business-store';

export default function BusinessHealthScreen() {
  const colors = useTheme();
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);

  const previewPillars = [
    {
      icon: '💵',
      title: 'Currency & Cash Flow Trajectory',
      description:
        'Comprehensive monthly & annual tracking of gross inflows (instant sales + collected credit) vs outflows (expenses).',
    },
    {
      icon: '📈',
      title: 'Growth & Velocity Analytics',
      description:
        'Month-over-Month (MoM) and Year-over-Year (YoY) percentage changes to measure genuine business expansion.',
    },
    {
      icon: '🏬',
      title: 'Multi-Branch Performance Breakdown',
      description:
        'Per-branch revenue, operational overhead, and profit contribution shares across all operating locations.',
    },
    {
      icon: '🏦',
      title: 'Bank & Loan Readiness Dossier',
      description:
        'Verifiable financial footprint (Telebirr & CBE digital trails) designed to support working capital loans and funding applications.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </Pressable>

        <View style={styles.titleRow}>
          <View>
            <ThemedText style={styles.screenTitle}>Business Health</ThemedText>
            <ThemedText style={styles.businessSubtitle}>
              {activeBusiness?.name || 'NetWorth Ethiopia'} · Financial Intelligence
            </ThemedText>
          </View>
          <View style={styles.previewBadge}>
            <ThemedText style={styles.previewBadgeText}>COMING SOON</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Announcement Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBadge}>
            <ThemedText style={styles.heroIcon}>⭐️</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>
            Financial Health & Loan Dossier
          </ThemedText>
          <ThemedText style={styles.heroDescription}>
            We are engineering a comprehensive financial pulse engine. Track your
            currency flows, multi-year growth velocity, and generate bank-ready proof
            for working capital loans and funding programs.
          </ThemedText>
        </View>

        {/* Feature Preview Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>What&apos;s Coming in this Module</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Verified financial intelligence for Ethiopian merchants
          </ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          {previewPillars.map((item, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <ThemedText style={styles.featureIcon}>{item.icon}</ThemedText>
              </View>
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.footerAction}>
          <Pressable
            style={styles.returnBtn}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Return to Dashboard"
          >
            <ThemedText style={styles.returnBtnText}>Return to Dashboard</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
    marginBottom: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  businessSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  previewBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#064E3B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroIcon: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#A7F3D0',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  cardsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },
  footerAction: {
    marginTop: 8,
  },
  returnBtn: {
    backgroundColor: '#065F46',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
