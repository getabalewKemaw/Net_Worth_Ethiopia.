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
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useStaffStore } from '@/store/staff-store';
import { localBidrRepo } from '@/repositories/local-bidr.repo';
import { XIcon, CheckCircleIcon } from '@/components/icons';
import { DUE_PRESETS } from '@/constants/sales';

interface IssueDubeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const formatFutureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export function IssueDubeModal({ visible, onClose, onSuccess }: IssueDubeModalProps) {
  const staffProfile = useStaffStore((s) => s.staffProfile);
  const assignedBusinessId = useStaffStore((s) => s.assignedBusinessId);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [dueDate, setDueDate] = useState(formatFutureDate(7));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setAmount('');
    setDescription('');
    setSelectedDays(7);
    setDueDate(formatFutureDate(7));
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectDays = (days: number) => {
    setSelectedDays(days);
    setDueDate(formatFutureDate(days));
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('Missing Customer', 'Please enter customer name for customer credit/dube.');
      return;
    }

    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid debt amount.');
      return;
    }

    if (!assignedBusinessId || !assignedBranchId) {
      Alert.alert('Branch Error', 'Missing assigned branch context. Please re-authenticate.');
      return;
    }

    try {
      setIsSubmitting(true);

      await localBidrRepo.createDebtAtomic({
        businessId: assignedBusinessId,
        branchId: assignedBranchId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        amount: parsedAmount,
        description: description.trim() || 'Store Credit / Dube',
        dueDate,
        notes: notes.trim() || undefined,
        recordedById: staffProfile?.userId || null,
        recordedByName: staffProfile?.name || 'Cashier (Sales)',
      });

      handleClose();
      await onSuccess();
    } catch (err: any) {
      console.error('[IssueDubeModal] Failed to record credit:', err);
      Alert.alert('Dube Recording Failed', err?.message || 'Could not record customer credit.');
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
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center border border-amber-200">
                <Text className="text-base">📝</Text>
              </View>
              <View>
                <Text className="text-lg font-extrabold text-slate-900">Issue Customer Dube</Text>
                <Text className="text-xs text-amber-800 font-semibold">Store Credit Notebook · Branch Locked</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mt-3">
            {/* Customer Details */}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Customer Name *
                </Text>
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="e.g. Almaz Kebede"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Phone (Optional)
                </Text>
                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="0911234567"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
                />
              </View>
            </View>

            {/* Credit Amount */}
            <View className="mt-3.5">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Credit Amount (ETB) *
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                <Text className="text-lg font-extrabold text-amber-700 mr-2">ETB</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  className="flex-1 text-xl font-black text-slate-900"
                />
              </View>
            </View>

            {/* Promised Due Date Presets */}
            <View className="mt-3.5">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Promised Due Date
              </Text>
              <View className="flex-row gap-2">
                {DUE_PRESETS.map((preset) => {
                  const isSelected = selectedDays === preset.days;
                  return (
                    <Pressable
                      key={preset.days}
                      onPress={() => handleSelectDays(preset.days)}
                      className={`flex-1 py-2 px-1 rounded-xl border items-center justify-center ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-extrabold ${
                          isSelected ? 'text-amber-900' : 'text-slate-600'
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-[11px] text-slate-500 mt-1.5">
                Due: {dueDate}
              </Text>
            </View>

            {/* Item / Items Description */}
            <View className="mt-3.5">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Items Taken / Note
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. 2 cartons of cooking oil, 1 bag sugar"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="mt-5 flex-row gap-3">
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
                  <Text className="text-sm font-black text-white">Record Dube</Text>
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
    maxHeight: '85%',
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
