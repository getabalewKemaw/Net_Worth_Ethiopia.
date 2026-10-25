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
import { localSalesRepo } from '@/repositories/local-sales.repo';
import type { PaymentMethod } from '@/types/sales';
import { XIcon, CheckCircleIcon } from '@/components/icons';

interface QuickSaleModalProps {
  visible: boolean;
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
  { key: 'cash', label: 'Cash', icon: '💵', bg: '#ECFDF5', activeBorder: '#059669', activeText: '#064E3B' },
  { key: 'telebirr', label: 'Telebirr', icon: '📱', bg: '#F5F3FF', activeBorder: '#7C3AED', activeText: '#4C1D95' },
  { key: 'cbe', label: 'CBE Birr', icon: '🏦', bg: '#EFF6FF', activeBorder: '#2563EB', activeText: '#1E3A8A' },
];

export function QuickSaleModal({ visible, onClose, onSuccess }: QuickSaleModalProps) {
  const staffProfile = useStaffStore((s) => s.staffProfile);
  const assignedBusinessId = useStaffStore((s) => s.assignedBusinessId);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setAmount('');
    setDescription('');
    setPaymentMethod('cash');
    setCustomerName('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid sale amount in ETB.');
      return;
    }

    if (!assignedBusinessId || !assignedBranchId) {
      Alert.alert('Branch Error', 'Missing assigned branch context. Please re-authenticate.');
      return;
    }

    try {
      setIsSubmitting(true);
      const saleDesc = description.trim() || 'Counter Sale';

      await localSalesRepo.createSaleAtomic(
        {
          description: saleDesc,
          amount: parsedAmount,
          saleType: 'instant',
          paymentMethod,
          customer: customerName.trim() || undefined,
          recordedById: staffProfile?.userId || null,
          recordedByName: staffProfile?.name || 'Cashier (Sales)',
        },
        assignedBusinessId,
        assignedBranchId
      );

      handleClose();
      await onSuccess();
    } catch (err: any) {
      console.error('[QuickSaleModal] Error recording sale:', err);
      Alert.alert('Sale Recording Failed', err?.message || 'Could not save sale locally.');
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

          {/* Title & Close */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleLeft}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 16 }}>🛒</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Record Counter Sale</Text>
                <Text style={styles.headerSubtitle}>Instant Checkout · 0ms Latency</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} style={{ padding: 4 }}>
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Amount Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Sale Amount (ETB) *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.etbPrefix}>ETB</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                autoFocus
                style={styles.amountTextInput}
              />
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Payment Method *</Text>
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

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Item / Description Note</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. 5kg Sugar, Coffee, Retail checkout"
              placeholderTextColor="#94A3B8"
              style={styles.standardInput}
            />
          </View>

          {/* Optional Customer Name */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Customer Name (Optional)</Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="e.g. Walk-in or Customer Name"
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
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircleIcon size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Record Sale</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  etbPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    paddingVertical: 0,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  standardInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
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
