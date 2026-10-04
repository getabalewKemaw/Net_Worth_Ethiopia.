import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { XIcon, CheckIcon } from '@/components/icons';
import { useSalesStore } from '@/store/sales-store';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import { useBusinessStore } from '@/store/business-store';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import type { ParsedBankTransaction } from '@/types/text-fetching';
import type { ExpenseInput } from '@/types/sales';

interface ConvertExpenseModalProps {
  visible: boolean;
  transaction: ParsedBankTransaction | null;
  onClose: () => void;
  onSuccess?: (expenseId: string) => void;
}

const EXPENSE_CATEGORIES = [
  'Utilities',
  'Supplier',
  'Inventory',
  'Rent',
  'Salary',
  'Transportation',
  'Other',
];

export function ConvertExpenseModal({
  visible,
  transaction,
  onClose,
  onSuccess,
}: ConvertExpenseModalProps) {
  const colors = useTheme();
  const { addExpense } = useSalesStore();
  const { markTransactionConverted } = useTextFetchingStore();
  const { activeBusiness, activeBranch } = useBusinessStore();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState('Supplier');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!transaction) return;

    setAmount(transaction.amount ? String(transaction.amount) : '');
    setRecipient(transaction.counterparty || '');

    const providerConfig = BANK_PROVIDERS[transaction.provider] || BANK_PROVIDERS.unknown;
    setDescription(
      transaction.counterparty
        ? `Payment to ${transaction.counterparty}`
        : `Expense via ${providerConfig.displayName}`
    );
    setNotes(
      `SMS Ref: ${transaction.transactionRef} via ${providerConfig.displayName}${
        transaction.accountMasked ? ` • Account: ${transaction.accountMasked}` : ''
      }`
    );
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive expense amount.');
      return;
    }

    const businessId = activeBusiness?.id || 'default_business';
    const branchId = activeBranch?.id || 'default_branch';

    try {
      setIsSubmitting(true);

      const expensePayload: ExpenseInput = {
        amount: parsedAmount,
        description: description.trim() || `Expense via ${transaction.provider}`,
        category,
        notes: notes.trim() || undefined,
        businessId,
        branchId,
      };

      const savedExpense = await addExpense(businessId, branchId, expensePayload);

      // Update SMS transaction state in local SQLite and store
      await markTransactionConverted(transaction.id, 'converted_expense', savedExpense.id);

      setIsSubmitting(false);
      onClose();
      Alert.alert('Expense Recorded', `Successfully recorded expense of ETB ${parsedAmount}.`);
      onSuccess?.(savedExpense.id);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err?.message || 'Failed to record bookkeeping expense.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
          onPress={onClose}
        />

        <View
          className="rounded-t-3xl border-t p-5"
          style={{
            backgroundColor: colors.backgroundElement,
            borderColor: colors.backgroundSelected,
            maxHeight: '90%',
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-black text-slate-900 dark:text-slate-100">
                Convert SMS to Expense
              </Text>
              <Text className="text-xs text-slate-400 font-medium">
                SMS Ref: {transaction.transactionRef}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center bg-slate-100 dark:bg-slate-800"
            >
              <XIcon size={16} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {/* Amount Field */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Expense Amount (ETB) *
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                className="px-4 py-3 rounded-2xl border text-xl font-black text-rose-600 dark:text-rose-400"
                style={{
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.backgroundSelected,
                }}
              />
            </View>

            {/* Recipient / Payee */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Payee / Beneficiary
              </Text>
              <TextInput
                value={recipient}
                onChangeText={setRecipient}
                placeholder="e.g. Ethio Trading PLC / Landlord"
                className="px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 dark:text-slate-200"
                style={{
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.backgroundSelected,
                }}
              />
            </View>

            {/* Expense Category Chips */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Expense Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className="px-3 py-1.5 rounded-xl border active:opacity-80"
                      style={{
                        backgroundColor: isSelected ? '#D97706' : colors.backgroundSelected,
                        borderColor: isSelected ? '#D97706' : colors.backgroundSelected,
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: isSelected ? '#FFFFFF' : '#64748B' }}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Description */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Expense description"
                className="px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 dark:text-slate-200"
                style={{
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.backgroundSelected,
                }}
              />
            </View>

            {/* Notes */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Bookkeeping Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Bank reference notes"
                className="px-3.5 py-2 rounded-xl border text-xs font-medium text-slate-600 dark:text-slate-300"
                style={{
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.backgroundSelected,
                }}
              />
            </View>

            {/* Confirm Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl active:opacity-85 mt-2"
              style={{ backgroundColor: '#D97706' }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CheckIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
              )}
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                {isSubmitting ? 'Recording Expense...' : 'Confirm Bookkeeping Expense'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
