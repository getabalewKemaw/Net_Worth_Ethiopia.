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

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; icon: string; bg: string; activeBorder: string; activeText: string }[] = [
  { key: 'cash', label: 'Cash', icon: '💵', bg: 'bg-emerald-50', activeBorder: 'border-emerald-600', activeText: 'text-emerald-950' },
  { key: 'telebirr', label: 'Telebirr', icon: '📱', bg: 'bg-violet-50', activeBorder: 'border-violet-600', activeText: 'text-violet-950' },
  { key: 'cbe', label: 'CBE Birr', icon: '🏦', bg: 'bg-blue-50', activeBorder: 'border-blue-600', activeText: 'text-blue-950' },
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
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center border border-emerald-200">
                <Text className="text-base">🛒</Text>
              </View>
              <View>
                <Text className="text-lg font-extrabold text-slate-900">Record Counter Sale</Text>
                <Text className="text-xs text-[#065F46] font-semibold">Instant Checkout · 0ms Latency</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Amount Input */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Sale Amount (ETB) *
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <Text className="text-xl font-extrabold text-[#065F46] mr-2">ETB</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                autoFocus
                className="flex-1 text-2xl font-black text-slate-900"
              />
            </View>
          </View>

          {/* Payment Method Selector */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Payment Method *
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
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className="text-lg mb-1">{opt.icon}</Text>
                    <Text
                      className={`text-xs font-extrabold ${
                        isSelected ? opt.activeText : 'text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Item / Description Note
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. 5kg Sugar, Coffee, Retail checkout"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900"
            />
          </View>

          {/* Optional Customer Name */}
          <View className="mt-3">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Customer Name (Optional)
            </Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="e.g. Walk-in or Customer Name"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
            />
          </View>

          {/* Action Buttons */}
          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white items-center justify-center active:opacity-70"
            >
              <Text className="text-sm font-bold text-slate-700">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-2 py-3.5 px-6 rounded-xl bg-[#065F46] border border-emerald-800 items-center justify-center flex-row gap-2 active:opacity-80"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircleIcon size={16} color="#FFFFFF" />
                  <Text className="text-sm font-black text-white">Record Sale</Text>
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
});
