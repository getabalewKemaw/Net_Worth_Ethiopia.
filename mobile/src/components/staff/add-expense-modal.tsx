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
import { localExpensesRepo } from '@/repositories/local-expenses.repo';
import { EXPENSE_CATEGORIES } from '@/constants/sales';
import { XIcon, CheckCircleIcon } from '@/components/icons';

interface AddStaffExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function AddStaffExpenseModal({
  visible,
  onClose,
  onSuccess,
}: AddStaffExpenseModalProps) {
  const staffProfile = useStaffStore((s) => s.staffProfile);
  const assignedBusinessId = useStaffStore((s) => s.assignedBusinessId);
  const assignedBranchId = useStaffStore((s) => s.assignedBranchId);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0] || 'Transport');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setDescription('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0] || 'Transport');
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Info', 'Please enter a description for this expense.');
      return;
    }

    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount in ETB.');
      return;
    }

    if (!assignedBusinessId || !assignedBranchId) {
      Alert.alert('Branch Error', 'Missing assigned branch context. Please re-authenticate.');
      return;
    }

    try {
      setIsSubmitting(true);

      await localExpensesRepo.createExpenseAtomic(
        {
          description: description.trim(),
          amount: parsedAmount,
          category,
          notes: notes.trim() || undefined,
          recordedById: staffProfile?.userId || null,
          recordedByName: staffProfile?.name || 'Cashier (Sales)',
        },
        assignedBusinessId,
        assignedBranchId
      );

      handleClose();
      await onSuccess();
    } catch (err: any) {
      console.error('[AddStaffExpenseModal] Error recording expense:', err);
      Alert.alert('Expense Failed', err?.message || 'Could not record expense.');
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
              <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-200">
                <Text className="text-base">💸</Text>
              </View>
              <View>
                <Text className="text-lg font-extrabold text-slate-900">Record Petty Expense</Text>
                <Text className="text-xs text-red-700 font-semibold">Deducted from Drawer Cash · Branch Locked</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Amount Input */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Expense Amount (ETB) *
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              <Text className="text-lg font-extrabold text-red-600 mr-2">ETB</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                autoFocus
                className="flex-1 text-xl font-black text-slate-900"
              />
            </View>
          </View>

          {/* Description */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Packaging bags, Cleaning supplies, Transport"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </View>

          {/* Category Chips */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Expense Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`py-1.5 px-3 rounded-xl border mr-2 ${
                      isSelected
                        ? 'bg-red-50 border-red-500'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-red-700' : 'text-slate-600'
                      }`}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Notes */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Note (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Approved by shop supervisor"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
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
              className="flex-2 py-3.5 px-6 rounded-xl bg-red-600 border border-red-700 items-center justify-center flex-row gap-2 active:opacity-80"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircleIcon size={16} color="#FFFFFF" />
                  <Text className="text-sm font-black text-white">Record Expense</Text>
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
