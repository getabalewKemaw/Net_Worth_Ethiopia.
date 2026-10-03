import React, { useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import {
  CheckCircleIcon,
  XIcon,
  CheckIcon,
  BanknoteIcon,
  PhoneIcon,
  ShieldAlertIcon,
} from '@/components/icons';
import type { DebtItem, SettleDebtPayload } from '@/types/bidr';
import type { PaymentMethod } from '@/types/sales';

interface SettleDebtModalProps {
  visible: boolean;
  debt: DebtItem | null;
  onClose: () => void;
  onConfirm: (id: string, payload: SettleDebtPayload) => Promise<any>;
}

const CLEAN_PAYMENT_CHANNELS: { key: PaymentMethod; name: string; icon: (color: string) => React.ReactNode }[] = [
  { key: 'telebirr', name: 'Telebirr', icon: (color) => <PhoneIcon size={14} color={color} /> },
  { key: 'cbe', name: 'CBE Birr / CBE', icon: (color) => <ShieldAlertIcon size={14} color={color} /> },
  { key: 'cash', name: 'Cash', icon: (color) => <BanknoteIcon size={14} color={color} /> },
];

export function SettleDebtModal({
  visible,
  debt,
  onClose,
  onConfirm,
}: SettleDebtModalProps) {
  const colors = useTheme();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!debt) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(debt.id, {
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      onClose();
      Alert.alert(
        'Settled successfully',
        `Debt for ${debt.customerName || 'Customer'} has been marked as settled.`
      );
    } catch (err: any) {
      Alert.alert('Settlement failed', err?.message || 'Could not settle debt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.handleBar} />

          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <View className="flex-row items-center gap-2">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon size={16} color="#D97706" />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>
                Settle Dube record
              </Text>
            </View>

            <Pressable onPress={onClose} hitSlop={8}>
              <XIcon size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Amount Overview Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
            <Text style={styles.summaryLabel}>Amount to receive</Text>
            <Text style={[styles.summaryAmount, { color: colors.text }]}>
              {debt.amount.toLocaleString()}{' '}
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>ETB</Text>
            </Text>
            <Text style={[styles.summaryCustomer, { color: colors.textSecondary }]}>
              Customer: <Text style={{ fontWeight: '700', color: colors.text }}>{debt.customerName || 'Walk-in'}</Text> • {debt.description}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Payment Channel Selector (Zero Emojis) */}
            <Text style={styles.inputLabel}>Payment method</Text>
            <View style={styles.methodRow}>
              {CLEAN_PAYMENT_CHANNELS.map((pm) => {
                const isSelected = paymentMethod === pm.key;
                const activeColor = '#D97706';
                return (
                  <Pressable
                    key={pm.key}
                    onPress={() => setPaymentMethod(pm.key)}
                    style={[
                      styles.methodBtn,
                      {
                        borderColor: isSelected ? activeColor : colors.backgroundSelected,
                        backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.1)' : colors.background,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {pm.icon(isSelected ? activeColor : colors.textSecondary)}
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: isSelected ? activeColor : colors.text,
                        }}
                      >
                        {pm.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Notes */}
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="e.g. Telebirr Txn ID, paid in person..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable style={[styles.cancelBtn, { borderColor: colors.backgroundSelected }]} onPress={onClose}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.submitBtn, { backgroundColor: '#D97706', opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckIcon size={15} color="#FFF" strokeWidth={2.5} />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>Confirm settle</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryCustomer: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
