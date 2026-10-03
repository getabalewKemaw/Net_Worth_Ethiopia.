import React from 'react';
import {
  View,
  Modal,
  Pressable,
  Linking,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import {
  PhoneIcon,
  Edit3Icon,
  CheckIcon,
} from '@/components/icons';
import type { DebtItem } from '@/types/bidr';

interface DebtDetailModalProps {
  visible: boolean;
  debt: DebtItem | null;
  onClose: () => void;
  onSettle: (debt: DebtItem) => void;
  onEdit: (debt: DebtItem) => void;
}

export function DebtDetailModal({
  visible,
  debt,
  onClose,
  onSettle,
  onEdit,
}: DebtDetailModalProps) {
  const colors = useTheme();

  if (!debt) return null;

  const handleCall = () => {
    if (!debt.customerPhone) return;
    const cleanPhone = debt.customerPhone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert('Error', `Cannot call ${cleanPhone}`);
      })
      .catch(() => Alert.alert('Error', 'Failed to open phone dialer'));
  };

  const isPending = debt.status === 'pending';
  const isSettled = debt.status === 'settled';

  const formattedDueDate = debt.dueDate
    ? new Date(debt.dueDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No promised deadline';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.handleBar} />
        <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Dube Record Details</ThemedText>

        {/* Balance Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: '#E5E7EB' }]}>
          <ThemedText style={styles.summaryLabel}>Total Balance</ThemedText>
          <ThemedText style={[styles.summaryAmount, { color: isSettled ? '#065F46' : colors.text }]}>
            {debt.amount.toLocaleString()} ETB
          </ThemedText>

          <View style={styles.customerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                {debt.customerName || 'Walk-in Customer'}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {debt.customerPhone || 'No contact phone'}
              </ThemedText>
            </View>

            {debt.customerPhone && (
              <Pressable
                onPress={handleCall}
                style={[styles.callBtn, { backgroundColor: 'rgba(217, 119, 6, 0.12)' }]}
              >
                <PhoneIcon size={14} color="#D97706" />
                <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#D97706' }}>Call</ThemedText>
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Item description</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>{debt.description}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Promised payment date</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>{formattedDueDate}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Status</ThemedText>
            <ThemedText
              style={[
                styles.infoValue,
                { color: isSettled ? '#065F46' : '#D97706', textTransform: 'capitalize', fontWeight: '800' },
              ]}
            >
              {debt.status}
            </ThemedText>
          </View>

          {debt.notes && (
            <View style={[styles.notesCard, { backgroundColor: colors.background, borderColor: '#E5E7EB' }]}>
              <ThemedText style={styles.infoLabel}>Terms & notes</ThemedText>
              <ThemedText style={[styles.notesText, { color: colors.text }]}>{debt.notes}</ThemedText>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.editBtn, { borderColor: '#E5E7EB', backgroundColor: colors.background }]}
              onPress={() => {
                onClose();
                onEdit(debt);
              }}
            >
              <Edit3Icon size={16} color={colors.textSecondary} />
              <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Edit / Extend</ThemedText>
            </Pressable>

            {isPending && (
              <Pressable
                style={[styles.settleBtn, { backgroundColor: '#D97706' }]}
                onPress={() => {
                  onClose();
                  onSettle(debt);
                }}
              >
                <CheckIcon size={16} color="#FFF" strokeWidth={2.5} />
                <ThemedText style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>Settle Dube</ThemedText>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 13,
    marginTop: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  settleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
});
