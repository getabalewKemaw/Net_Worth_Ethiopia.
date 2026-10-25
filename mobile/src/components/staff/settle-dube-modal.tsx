import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useStaffStore } from '@/store/staff-store';
import { localBidrRepo } from '@/repositories/local-bidr.repo';
import type { DebtItem } from '@/types/bidr';
import type { PaymentMethod } from '@/types/sales';
import { XIcon, CheckCircleIcon } from '@/components/icons';

interface SettleDubeModalProps {
  visible: boolean;
  debt: DebtItem | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

interface PaymentOption {
  key: PaymentMethod;
  label: string;
  icon: string;
  bg: string;
  activeBorder: string;
  activeText: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { key: 'cash', label: 'Cash (Drawer)', icon: '💵', bg: '#ECFDF5', activeBorder: '#059669', activeText: '#064E3B' },
  { key: 'telebirr', label: 'Telebirr', icon: '📱', bg: '#F5F3FF', activeBorder: '#7C3AED', activeText: '#4C1D95' },
  { key: 'cbe', label: 'CBE Birr', icon: '🏦', bg: '#EFF6FF', activeBorder: '#2563EB', activeText: '#1E3A8A' },
];

export function SettleDubeModal({
  visible,
  debt,
  onClose,
  onSuccess,
}: SettleDubeModalProps) {
  const staffProfile = useStaffStore((s) => s.staffProfile);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!debt) return null;

  const handleClose = () => {
    setNotes('');
    setPaymentMethod('cash');
    onClose();
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      await localBidrRepo.settleDebtAtomic(debt.id, {
        paymentMethod,
        notes: notes.trim() || undefined,
        recordedById: staffProfile?.userId || null,
        recordedByName: staffProfile?.name || 'Cashier (Sales)',
      });

      handleClose();
      Alert.alert(
        'Dube Settled',
        `Successfully received ${debt.amount.toLocaleString()} ETB from ${debt.customerName || 'Customer'} via ${paymentMethod.toUpperCase()}. Shift drawer updated.`
      );
      await onSuccess();
    } catch (err: any) {
      console.error('[SettleDubeModal] Settle error:', err);
      Alert.alert('Settlement Failed', err?.message || 'Could not settle debt record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleLeft}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 16 }}>🤝</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Settle Customer Debt</Text>
                <Text style={styles.headerSubtitle}>Shift Drawer Reconciliation</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} style={{ padding: 4 }}>
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Customer & Debt Overview Card */}
          <View style={styles.overviewCard}>
            <View>
              <Text style={styles.customerName}>
                {debt.customerName || 'Anonymous Customer'}
              </Text>
              {debt.customerPhone && (
                <Text style={styles.customerPhone}>
                  📞 {debt.customerPhone}
                </Text>
              )}
              <Text style={styles.dueDateText}>
                Due: {debt.dueDate || 'No due date'}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.balanceLabel}>Balance Due</Text>
              <Text style={styles.balanceValue}>
                {debt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Payment Form Received *</Text>
            <View style={styles.methodsRow}>
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = paymentMethod === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setPaymentMethod(opt.key)}
                    style={[
                      styles.methodBtn,
                      isSelected && {
                        backgroundColor: opt.bg,
                        borderColor: opt.activeBorder,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.methodText,
                        { color: isSelected ? opt.activeText : '#475569' },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Receipt / Cashier Note */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Settlement Note (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Paid in full at Bole counter"
              placeholderTextColor="#94A3B8"
              style={styles.standardInput}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={isSubmitting}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircleIcon size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Confirm Settlement</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    marginTop: 1,
  },
  overviewCard: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  customerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dueDateText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 2,
  },
  formGroup: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  standardInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  actionsRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#065F46',
    borderWidth: 1,
    borderColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
