import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStaffStore } from '@/store/staff-store';

export function ShiftDrawerCard() {
  const shiftMetrics = useStaffStore((s) => s.shiftMetrics);
  const assignedBranchName = useStaffStore((s) => s.assignedBranchName);

  const cashInDrawer = shiftMetrics?.netCashInDrawer ?? shiftMetrics?.cashInDrawer ?? 0;
  const telebirr = shiftMetrics?.telebirrCollected ?? 0;
  const cbeBirr = shiftMetrics?.cbeBirrCollected ?? 0;
  const dubeSettled = shiftMetrics?.dubeRecovered ?? 0;
  const totalVolume = shiftMetrics?.totalShiftVolume ?? (cashInDrawer + telebirr + cbeBirr);
  const expenses = shiftMetrics?.expenseVolume ?? 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Today's Shift Drawer</Text>
          <Text style={styles.subtitle}>
            {assignedBranchName ? `${assignedBranchName} Counter` : 'Shift Reconciliation'}
          </Text>
        </View>

        <View style={styles.volumeRight}>
          <Text style={styles.volumeLabel}>Shift Volume</Text>
          <Text style={styles.volumeValue}>
            {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>
      </View>

      {/* Primary Drawer Cash Callout */}
      <View style={styles.cashBox}>
        <View style={styles.cashLeft}>
          <View style={styles.cashIconBg}>
            <Text style={{ fontSize: 18 }}>💵</Text>
          </View>
          <View>
            <Text style={styles.cashTitle}>Physical Cash in Drawer</Text>
            <Text style={styles.cashSubtitle}>Handover count at shift close</Text>
          </View>
        </View>
        <Text style={styles.cashAmount}>
          {cashInDrawer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
        </Text>
      </View>

      {/* Digital Mobile Money & Debt Recovery Breakdown */}
      <View style={styles.channelsRow}>
        {/* Telebirr */}
        <View style={[styles.channelChip, styles.telebirrChip]}>
          <Text style={[styles.channelLabel, { color: '#6D28D9' }]}>📱 Telebirr</Text>
          <Text style={[styles.channelValue, { color: '#4C1D95' }]} numberOfLines={1}>
            {telebirr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>

        {/* CBE Birr */}
        <View style={[styles.channelChip, styles.cbeChip]}>
          <Text style={[styles.channelLabel, { color: '#1D4ED8' }]}>🏦 CBE Birr</Text>
          <Text style={[styles.channelValue, { color: '#1E3A8A' }]} numberOfLines={1}>
            {cbeBirr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>

        {/* Dube Settled */}
        <View style={[styles.channelChip, styles.dubeChip]}>
          <Text style={[styles.channelLabel, { color: '#B45309' }]}>👥 Dube Settled</Text>
          <Text style={[styles.channelValue, { color: '#78350F' }]} numberOfLines={1}>
            {dubeSettled.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>
      </View>

      {/* Expenses Drawer Deduction Notice */}
      {expenses > 0 && (
        <View style={styles.expenseDeductionRow}>
          <Text style={styles.expenseDeductionLabel}>💸 Petty Expenses Paid:</Text>
          <Text style={styles.expenseDeductionAmount}>
            -{expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  volumeRight: {
    alignItems: 'flex-end',
  },
  volumeLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  cashBox: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cashLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cashTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cashSubtitle: {
    fontSize: 11,
    color: '#047857',
  },
  cashAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#065F46',
  },
  channelsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  channelChip: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
  },
  telebirrChip: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  cbeChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  dubeChip: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  channelLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  channelValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  expenseDeductionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseDeductionLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  expenseDeductionAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
