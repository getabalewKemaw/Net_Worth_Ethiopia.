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

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; icon: string; bg: string; activeBorder: string }[] = [
  { key: 'cash', label: 'Cash (Drawer)', icon: '💵', bg: 'bg-emerald-950/60', activeBorder: 'border-emerald-500' },
  { key: 'telebirr', label: 'Telebirr', icon: '📱', bg: 'bg-violet-950/60', activeBorder: 'border-violet-500' },
  { key: 'cbe', label: 'CBE Birr', icon: '🏦', bg: 'bg-blue-950/60', activeBorder: 'border-blue-500' },
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
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
                <Text className="text-base">🤝</Text>
              </View>
              <View>
                <Text className="text-lg font-extrabold text-white">Settle Customer Debt</Text>
                <Text className="text-xs text-emerald-400 font-semibold">Shift Drawer Reconciliation</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <XIcon size={20} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Customer & Debt Overview Card */}
          <View className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-bold text-white">
                {debt.customerName || 'Anonymous Customer'}
              </Text>
              {debt.customerPhone && (
                <Text className="text-xs text-slate-400 mt-0.5">
                  📞 {debt.customerPhone}
                </Text>
              )}
              <Text className="text-[11px] text-slate-400 mt-1">
                Due: {debt.dueDate || 'No due date'}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[10px] text-amber-400 font-bold uppercase">
                Balance Due
              </Text>
              <Text className="text-xl font-black text-amber-300">
                {debt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
              Payment Form Received *
            </Text>
            <View className="flex-row gap-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = paymentMethod === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setPaymentMethod(opt.key)}
                    className={`flex-1 py-3 px-2 rounded-xl border items-center justify-center ${
                      isSelected
                        ? `${opt.bg} ${opt.activeBorder} shadow-sm`
                        : 'bg-slate-900 border-slate-800 opacity-60'
                    }`}
                  >
                    <Text className="text-lg mb-1">{opt.icon}</Text>
                    <Text
                      className={`text-xs font-extrabold text-center ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Receipt / Cashier Note */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Settlement Note (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Paid in full at Bole counter"
              placeholderTextColor="#64748B"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
          </View>

          {/* Action Buttons */}
          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 py-3.5 rounded-xl border border-slate-700 items-center justify-center active:opacity-70"
            >
              <Text className="text-sm font-bold text-slate-300">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={isSubmitting}
              className="flex-2 py-3.5 px-6 rounded-xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row gap-2 active:opacity-80"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircleIcon size={16} color="#FFFFFF" />
                  <Text className="text-sm font-black text-white">Confirm Settlement</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 12,
  },
});
