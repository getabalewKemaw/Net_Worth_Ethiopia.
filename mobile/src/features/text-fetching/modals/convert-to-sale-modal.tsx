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
import { XIcon, PlusIcon, CheckIcon } from '@/components/icons';
import { useSalesStore } from '@/store/sales-store';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import { useBusinessStore } from '@/store/business-store';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import type { ParsedBankTransaction } from '@/types/text-fetching';
import type { PaymentMethod, SaleInput } from '@/types/sales';

interface ConvertSaleModalProps {
  visible: boolean;
  transaction: ParsedBankTransaction | null;
  onClose: () => void;
  onSuccess?: (saleId: string) => void;
}

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: string }> = [
  { id: 'telebirr', label: 'telebirr', icon: '📱' },
  { id: 'cbe', label: 'CBE / CBE Birr', icon: '🏦' },
  { id: 'cash', label: 'Cash', icon: '💵' },
];

export function ConvertSaleModal({
  visible,
  transaction,
  onClose,
  onSuccess,
}: ConvertSaleModalProps) {
  const colors = useTheme();
  const { addSale } = useSalesStore();
  const { markTransactionConverted } = useTextFetchingStore();
  const { activeBusiness, activeBranch } = useBusinessStore();

  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!transaction) return;

    setAmount(transaction.amount ? String(transaction.amount) : '');
    setCustomer(transaction.counterparty || '');
    setPhone('');

    // Pre-select payment method based on bank provider
    if (transaction.provider === 'telebirr') {
      setPaymentMethod('telebirr');
    } else {
      setPaymentMethod('cbe');
    }

    const providerConfig = BANK_PROVIDERS[transaction.provider] || BANK_PROVIDERS.unknown;
    setDescription(`Sale via ${providerConfig.displayName}`);
    setNotes(
      `SMS Ref: ${transaction.transactionRef}${
        transaction.accountMasked ? ` • Account: ${transaction.accountMasked}` : ''
      }`
    );
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive sale amount.');
      return;
    }

    const businessId = activeBusiness?.id || 'default_business';
    const branchId = activeBranch?.id || 'default_branch';

    try {
      setIsSubmitting(true);

      const salePayload: SaleInput = {
        amount: parsedAmount,
        description: description.trim() || `Sale via ${transaction.provider}`,
        customer: customer.trim() || undefined,
        phone: phone.trim() || undefined,
        paymentMethod,
        saleType: 'instant',
        status: 'settled',
        paidAt: new Date().toISOString(),
        dueDate: undefined,
        businessId,
        branchId,
      };

      const savedSale = await addSale(businessId, branchId, salePayload);

      // Update SMS transaction state in local SQLite and store
      await markTransactionConverted(transaction.id, 'converted_sale', savedSale.id);

      setIsSubmitting(false);
      onClose();
      Alert.alert('Sale Recorded', `Successfully recorded sale of ETB ${parsedAmount}.`);
      onSuccess?.(savedSale.id);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err?.message || 'Failed to record bookkeeping sale.');
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
                Convert SMS to Sale
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
                Sale Amount (ETB) *
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                className="px-4 py-3 rounded-2xl border text-xl font-black text-emerald-600 dark:text-emerald-400"
                style={{
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.backgroundSelected,
                }}
              />
            </View>

            {/* Customer Details */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Customer Name
                </Text>
                <TextInput
                  value={customer}
                  onChangeText={setCustomer}
                  placeholder="e.g. Abebe Kebede"
                  className="px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 dark:text-slate-200"
                  style={{
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.backgroundSelected,
                  }}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Customer Phone
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="09... / 2519..."
                  className="px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 dark:text-slate-200"
                  style={{
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.backgroundSelected,
                  }}
                />
              </View>
            </View>

            {/* Payment Method Selector */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Payment Channel
              </Text>
              <View className="flex-row gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <Pressable
                      key={pm.id}
                      onPress={() => setPaymentMethod(pm.id)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border active:opacity-80"
                      style={{
                        backgroundColor: isSelected ? colors.primary : colors.backgroundSelected,
                        borderColor: isSelected ? colors.primary : colors.backgroundSelected,
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>{pm.icon}</Text>
                      <Text
                        className="text-xs font-bold"
                        style={{ color: isSelected ? '#FFFFFF' : '#64748B' }}
                      >
                        {pm.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Sale description"
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
              style={{ backgroundColor: colors.primary }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CheckIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
              )}
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                {isSubmitting ? 'Recording Sale...' : 'Confirm Bookkeeping Sale'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
