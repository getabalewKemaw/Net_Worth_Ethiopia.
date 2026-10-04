import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { XIcon, CheckIcon, CheckCircleIcon, UserIcon } from '@/components/icons';
import { useBidrStore } from '@/store/bidr-store';
import { useTextFetchingStore } from '@/store/text-fetching-store';
import { useBusinessStore } from '@/store/business-store';
import type { ParsedBankTransaction } from '@/types/text-fetching';
import type { DebtItem } from '@/types/bidr';
import type { PaymentMethod } from '@/types/sales';

interface MatchBidrModalProps {
  visible: boolean;
  transaction: ParsedBankTransaction | null;
  onClose: () => void;
  onSuccess?: (debtId: string) => void;
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function MatchBidrModal({
  visible,
  transaction,
  onClose,
  onSuccess,
}: MatchBidrModalProps) {
  const colors = useTheme();
  const { debts, settle } = useBidrStore();
  const { markTransactionConverted } = useTextFetchingStore();
  const { activeBusiness, activeBranch } = useBusinessStore();

  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter for unsettled debts and sort matches to the top
  const candidates = useMemo(() => {
    if (!transaction) return [];

    const activeDebts = debts.filter((d) => d.status !== 'settled');
    const counterpartyNorm = transaction.counterparty ? normalize(transaction.counterparty) : '';

    return activeDebts.map((debt) => {
      const nameNorm = normalize(debt.customerName || '');
      const phoneNorm = normalize(debt.customerPhone || '');

      let score = 0;
      if (counterpartyNorm && (nameNorm.includes(counterpartyNorm) || counterpartyNorm.includes(nameNorm))) {
        score += 5;
      }
      if (phoneNorm && counterpartyNorm && (phoneNorm.includes(counterpartyNorm) || counterpartyNorm.includes(phoneNorm))) {
        score += 10;
      }
      if (Math.abs(debt.amount - transaction.amount) < 0.01) {
        score += 3; // Exact amount match
      }

      return { debt, score };
    }).sort((a, b) => b.score - a.score);
  }, [debts, transaction]);

  // Auto-select best candidate on mount
  React.useEffect(() => {
    if (candidates.length > 0 && candidates[0].score > 0) {
      setSelectedDebtId(candidates[0].debt.id);
    } else if (candidates.length > 0) {
      setSelectedDebtId(candidates[0].debt.id);
    } else {
      setSelectedDebtId(null);
    }
  }, [candidates]);

  if (!transaction) return null;

  const selectedDebt = candidates.find((c) => c.debt.id === selectedDebtId)?.debt || null;

  const handleSettleDebt = async () => {
    if (!selectedDebt) {
      Alert.alert('No Debt Selected', 'Please select a customer debt to settle.');
      return;
    }

    const businessId = activeBusiness?.id || 'default_business';
    const branchId = activeBranch?.id || 'default_branch';
    const paymentMethod: PaymentMethod =
      transaction.provider === 'telebirr' ? 'telebirr' : 'cbe';

    try {
      setIsSubmitting(true);

      const notes = `Settled via bank SMS Ref: ${transaction.transactionRef} (${transaction.provider})`;

      await settle(
        selectedDebt.id,
        {
          paymentMethod,
          notes,
        },
        businessId,
        branchId
      );

      // Mark SMS transaction as settled debt
      await markTransactionConverted(transaction.id, 'settled_debt', selectedDebt.id);

      setIsSubmitting(false);
      onClose();
      Alert.alert(
        'Debt Settled',
        `Successfully settled debt of ETB ${selectedDebt.amount} for ${
          selectedDebt.customerName || 'Customer'
        }.`
      );
      onSuccess?.(selectedDebt.id);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err?.message || 'Failed to settle customer debt.');
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
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-lg font-black text-slate-900 dark:text-slate-100">
                Match & Settle Customer Debt
              </Text>
              <Text className="text-xs text-slate-400 font-medium">
                Incoming payment from {transaction.counterparty || 'Customer'}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center bg-slate-100 dark:bg-slate-800"
            >
              <XIcon size={16} color="#64748B" />
            </Pressable>
          </View>

          {/* Incoming Transfer Highlight Card */}
          <View
            className="p-3.5 rounded-2xl mb-3 flex-row items-center justify-between border"
            style={{
              backgroundColor: '#ECFDF5',
              borderColor: '#A7F3D0',
            }}
          >
            <View className="flex-1 pr-2">
              <Text className="text-xs font-bold text-emerald-800">
                Incoming Bank Transfer
              </Text>
              <Text className="text-sm font-extrabold text-slate-800">
                {transaction.counterparty || 'Unknown Customer'}
              </Text>
              <Text className="text-[11px] text-slate-500 font-medium">
                Ref: {transaction.transactionRef}
              </Text>
            </View>
            <Text className="text-base font-black text-emerald-700">
              +ETB {transaction.amount.toFixed(2)}
            </Text>
          </View>

          {/* Debt Selection List */}
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
            Select Active Debt To Settle ({candidates.length} open)
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
            style={{ maxHeight: 260 }}
          >
            {candidates.length > 0 ? (
              candidates.map(({ debt, score }) => {
                const isSelected = selectedDebtId === debt.id;
                const isExactAmount = Math.abs(debt.amount - transaction.amount) < 0.01;

                return (
                  <Pressable
                    key={debt.id}
                    onPress={() => setSelectedDebtId(debt.id)}
                    className="p-3.5 rounded-2xl border flex-row items-center justify-between active:opacity-85"
                    style={{
                      backgroundColor: isSelected
                        ? '#F0FDF4'
                        : colors.backgroundSelected,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.backgroundSelected,
                      borderWidth: isSelected ? 2 : 1,
                    }}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: isSelected ? colors.primary : '#E2E8F0',
                        }}
                      >
                        <UserIcon
                          size={18}
                          color={isSelected ? '#FFFFFF' : '#64748B'}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                            {debt.customerName || 'Walk-in Customer'}
                          </Text>
                          {score >= 5 && (
                            <View className="px-1.5 py-0.2 rounded bg-amber-100 border border-amber-300">
                              <Text className="text-[10px] font-black text-amber-800">
                                Likely Match
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-xs text-slate-400 font-medium">
                          {debt.customerPhone || 'No phone recorded'}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                        ETB {debt.amount.toFixed(2)}
                      </Text>
                      {isExactAmount && (
                        <Text className="text-[10px] font-extrabold text-emerald-600">
                          🎯 Exact Amount
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View className="p-6 items-center">
                <Text className="text-sm text-slate-400 font-medium text-center">
                  No active customer debts found in Bidr store.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Settle Action Button */}
          <Pressable
            onPress={handleSettleDebt}
            disabled={isSubmitting || !selectedDebt}
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl active:opacity-85 mt-2"
            style={{
              backgroundColor: selectedDebt ? colors.primary : '#CBD5E1',
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <CheckCircleIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text className="text-sm font-black text-white uppercase tracking-wider">
              {isSubmitting
                ? 'Settling Debt...'
                : selectedDebt
                ? `Settle Debt for ${selectedDebt.customerName || 'Customer'}`
                : 'Select Debt to Settle'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
