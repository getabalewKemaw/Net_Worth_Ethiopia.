import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '@/components/icons';

interface PolicySection {
  id: string;
  number: string;
  title: string;
  summary: string;
  points: string[];
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'collection',
    number: '01',
    title: 'Information Collection & Scope',
    summary:
      'We collect only the essential business information required to provide intelligent bookkeeping, sales tracking, and multi-branch management.',
    points: [
      'Merchant Identity: Name, email address, and profile picture provided through authorized Google OAuth authentication.',
      'Business Registry: Business entity name, Tax Identification Number (TIN), commercial registration number, and operating branch locations.',
      'Financial Records: Sales orders, itemized expenses, physical cash drawer counts, and customer debt (Bidr / Dube) ledgers.',
      'Device Metadata: Network connectivity state and device identifier used exclusively to manage local offline SQLite sync queues.',
    ],
  },
  {
    id: 'sms-parsing',
    number: '02',
    title: 'SMS Payment Parsing & Transparency',
    summary:
      'On Android devices, NetWorth requests READ_SMS permission exclusively to detect and ingest inbound digital payment notifications.',
    points: [
      'Strict Provider Whitelist: Incoming SMS messages are processed only if sent by certified Ethiopian financial institutions (Telebirr, CBE Birr, Awash Bank, Bank of Abyssinia, Dashen Bank).',
      'Local On-Device Parsing: SMS parsing heuristics execute on your local device to extract transaction amount, sender name, and reference code.',
      'Zero Personal SMS Access: Personal conversations, non-bank messages, and two-factor authentication (2FA) verification codes are strictly ignored and never read or logged.',
      'Permission Control: You can revoke or grant SMS reading permissions at any time through Android system settings.',
    ],
  },
  {
    id: 'storage',
    number: '03',
    title: 'Local-First Storage & Cloud Synchronization',
    summary:
      'NetWorth Ethiopia utilizes a local-first database architecture to ensure uninterrupted merchant operations even in low-connectivity environments.',
    points: [
      'Encrypted Local SQLite: Your records are saved immediately to on-device SQLite storage so sales, expenses, and debts are never blocked by poor network.',
      'Automatic Cloud Sync: When an active internet connection is detected, pending transactions synchronize with our secure PostgreSQL cloud cluster.',
      'TLS 1.3 Transport: All network transmissions between the mobile client and NetWorth API endpoints are encrypted using standard TLS 1.3 / HTTPS protocols.',
    ],
  },
  {
    id: 'zero-credentials',
    number: '04',
    title: 'Banking Credential Confidentiality',
    summary:
      'NetWorth Ethiopia is an accounting and financial intelligence platform. We never request, capture, or store banking credentials.',
    points: [
      'No Bank Passwords or PINs: NetWorth never prompts you for Telebirr PINs, CBE mobile banking passwords, or ATM credentials.',
      'No Direct Fund Movement: The application reads payment confirmation records to update your bookkeeping; it cannot initiate debits or fund transfers.',
      'Read-Only Settlement Tracking: Payment reconciliation is based solely on verifiable digital confirmation codes.',
    ],
  },
  {
    id: 'sharing',
    number: '05',
    title: 'Zero Third-Party Commercial Sharing',
    summary:
      'Your business ledgers, customer credit lists, and revenue figures belong solely to your enterprise.',
    points: [
      'No Data Monetization: We never sell, rent, or lease merchant transaction ledgers or customer debt lists to marketers, advertisers, or third-party brokers.',
      'No External Trackers: The application does not contain behavioral ad trackers or commercial analytics SDKs.',
      'Funder Dossier Consent: The Business Health loan dossier link can only be shared with lenders or banks when you explicitly export or generate it.',
    ],
  },
  {
    id: 'rights',
    number: '06',
    title: 'Merchant Data Rights & Deletion',
    summary:
      'You maintain full ownership and governance over all financial records stored on NetWorth Ethiopia.',
    points: [
      'Data Portability: Merchants can export sales registers, expense summaries, and customer debt balances at any time.',
      'Permanent Account Deletion: You may request complete deletion of your business account, branches, and historical transactions from our servers.',
      'Local Cache Clearing: Uninstalling the application or wiping app storage immediately purges all on-device SQLite records.',
    ],
  },
  {
    id: 'compliance',
    number: '07',
    title: 'Regulatory & Ethiopian Law Alignment',
    summary:
      'Our practices adhere to applicable Ethiopian digital commerce and electronic communications frameworks.',
    points: [
      'Electronic Transactions Proclamation: Complies with Proclamation No. 1205/2020 governing electronic commerce, records, and digital signatures.',
      'National Bank of Ethiopia (NBE): Follows financial confidentiality and consumer transparency directives for fintech software solutions.',
    ],
  },
  {
    id: 'contact',
    number: '08',
    title: 'Contact Us & Data Protection Inquiries',
    summary:
      'For any privacy inquiries, data subject access requests, or policy questions, please contact our privacy compliance team.',
    points: [
      'Email: privacy@networth.et / support@networth.et',
      'Headquarters: Addis Ababa, Ethiopia',
      'Response SLA: All data governance and security inquiries are addressed within 3 business days.',
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const colors = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={8}
        >
          <ThemedText style={styles.backBtnText}>←</ThemedText>
        </Pressable>

        <View style={styles.headerTitleGroup}>
          <ThemedText style={styles.headerTitle}>Privacy & Policy</ThemedText>
          <ThemedText style={styles.headerSubtitle}>NetWorth Ethiopia • Data Protection</ThemedText>
        </View>

        <Image
          source={require('@/assets/images/logo/networth.jpg')}
          style={styles.headerLogo}
          contentFit="cover"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Trust Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <ShieldCheckIcon size={26} color="#065F46" strokeWidth={2.4} />
          </View>
          <View style={styles.heroTextContainer}>
            <ThemedText style={styles.heroTitle}>Your Business Data Belongs to You</ThemedText>
            <ThemedText style={styles.heroDescription}>
              NetWorth Ethiopia is engineered with a local-first architecture. Your sales, expenses, and
              customer credit records remain private, resilient offline, and protected with enterprise encryption.
            </ThemedText>
          </View>
        </View>

        {/* 4 Trust Highlights Grid */}
        <View style={styles.highlightsGrid}>
          <View style={styles.highlightCard}>
            <View style={[styles.highlightIconBadge, { backgroundColor: '#ECFDF5' }]}>
              <ThemedText style={{ fontSize: 16 }}>🛡️</ThemedText>
            </View>
            <ThemedText style={styles.highlightTitle}>Local SQLite</ThemedText>
            <ThemedText style={styles.highlightText}>
              Transactions stay on your device for fast offline reliability.
            </ThemedText>
          </View>

          <View style={styles.highlightCard}>
            <View style={[styles.highlightIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <ThemedText style={{ fontSize: 16 }}>🔒</ThemedText>
            </View>
            <ThemedText style={styles.highlightTitle}>Zero PIN Access</ThemedText>
            <ThemedText style={styles.highlightText}>
              We never ask for or store your bank passwords or PINs.
            </ThemedText>
          </View>

          <View style={styles.highlightCard}>
            <View style={[styles.highlightIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <ThemedText style={{ fontSize: 16 }}>💬</ThemedText>
            </View>
            <ThemedText style={styles.highlightTitle}>SMS Scoped</ThemedText>
            <ThemedText style={styles.highlightText}>
              Only verified bank confirmation texts are processed.
            </ThemedText>
          </View>

          <View style={styles.highlightCard}>
            <View style={[styles.highlightIconBadge, { backgroundColor: '#F5F3FF' }]}>
              <ThemedText style={{ fontSize: 16 }}>🔐</ThemedText>
            </View>
            <ThemedText style={styles.highlightTitle}>TLS 1.3 Sync</ThemedText>
            <ThemedText style={styles.highlightText}>
              Cloud synchronization is protected with transport encryption.
            </ThemedText>
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionHeaderLabel}>OFFICIAL POLICY CLAUSES</ThemedText>
          <View style={styles.sectionHeaderLine} />
        </View>

        {/* Policy Section Cards */}
        {POLICY_SECTIONS.map((section) => (
          <View key={section.id} style={styles.policyCard}>
            <View style={styles.policyCardHeader}>
              <View style={styles.sectionNumberBadge}>
                <ThemedText style={styles.sectionNumberText}>{section.number}</ThemedText>
              </View>
              <ThemedText style={styles.policyCardTitle}>{section.title}</ThemedText>
            </View>

            <ThemedText style={styles.policyCardSummary}>{section.summary}</ThemedText>

            <View style={styles.pointsList}>
              {section.points.map((pt, idx) => (
                <View key={idx} style={styles.pointRow}>
                  <View style={styles.pointDot} />
                  <ThemedText style={styles.pointText}>{pt}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Bottom Assurance Card */}
        <View style={styles.assuranceCard}>
          <View style={styles.assuranceHeader}>
            <CheckCircleIcon size={20} color="#065F46" strokeWidth={2.4} />
            <ThemedText style={styles.assuranceTitle}>Compliance Verification</ThemedText>
          </View>
          <ThemedText style={styles.assuranceBody}>
            This privacy policy is actively maintained by the NetWorth Ethiopia engineering and legal governance team.
            Last reviewed and effective as of October 2026.
          </ThemedText>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Image
            source={require('@/assets/images/logo/networth.jpg')}
            style={styles.footerLogo}
            contentFit="cover"
          />
          <ThemedText style={styles.footerText}>
            NetWorth Ethiopia • Secure Merchant Bookkeeping
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerTitleGroup: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#065F46',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
    fontWeight: '500',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  highlightCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  highlightIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  highlightText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 2,
  },
  sectionHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionNumberBadge: {
    backgroundColor: '#065F46',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  policyCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  policyCardSummary: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 12,
  },
  pointsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 9,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
    marginTop: 6,
  },
  pointText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    flex: 1,
    fontWeight: '500',
  },
  assuranceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  assuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  assuranceBody: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#166534',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 12,
  },
  footerLogo: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
