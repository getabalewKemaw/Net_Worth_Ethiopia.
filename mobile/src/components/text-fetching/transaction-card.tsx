import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BANK_PROVIDERS } from '@/constants/text-fetching';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  XIcon,
  PlusIcon,
} from '@/components/icons';
import type { ParsedBankTransaction } from '@/types/text-fetching';

interface TransactionCardProps {
  transaction: ParsedBankTransaction;
  onConvertToSale: (txn: ParsedBankTransaction) => void;
  onConvertToExpense: (txn: ParsedBankTransaction) => void;
  onDismiss: (txn: ParsedBankTransaction) => void;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatRelativeDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return 'Recently';

  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionCard({
  transaction,
  onConvertToSale,
  onConvertToExpense,
  onDismiss,
}: TransactionCardProps) {
  const colors = useTheme();
  const [showRaw, setShowRaw] = useState(false);

  const config = BANK_PROVIDERS[transaction.provider] || BANK_PROVIDERS.unknown;
  const isDeposit = transaction.transactionFlow === 'deposit';
  const isPending = transaction.importStatus === 'pending';

  return (
    <View
      className="mx-4 mb-3 p-4 rounded-2xl border"
      style={{
        backgroundColor: colors.backgroundElement,
        borderColor: colors.backgroundSelected,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Top Row: Provider Badge + Time + Flow Badge */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center gap-2">
          {/* Bank Provider Pill */}
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: config.badgeBg }}
          >
            <Text style={{ fontSize: 13 }}>{config.icon}</Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: config.badgeTextColor,
              }}
            >
              {config.displayName}
            </Text>
          </View>

          {/* Time Received */}
          <Text className="text-xs font-medium text-slate-400">
            {formatRelativeDate(transaction.timestamp)}
          </Text>
        </View>

        {/* Inflow vs Outflow Badge */}
        <View
          className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: isDeposit ? '#ECFDF5' : '#FEF2F2',
          }}
        >
          {isDeposit ? (
            <ArrowDownLeftIcon size={14} color="#059669" strokeWidth={2.5} />
          ) : (
            <ArrowUpRightIcon size={14} color="#DC2626" strokeWidth={2.5} />
          )}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: isDeposit ? '#059669' : '#DC2626',
            }}
          >
            {isDeposit ? 'Received' : 'Sent'}
          </Text>
        </View>
      </View>

      {/* Main Row: Counterparty & Amount */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-3">
          <Text
            className="text-base font-extrabold text-slate-900 dark:text-slate-100"
            numberOfLines={1}
          >
            {transaction.counterparty ||
              (isDeposit ? 'Anonymous Sender' : 'Outgoing Payment')}
          </Text>

          {/* Reference & Account Subtitle */}
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs font-semibold text-slate-500">
              Ref: {transaction.transactionRef}
            </Text>
            {transaction.accountMasked && (
              <Text className="text-xs text-slate-400">
                • {transaction.accountMasked}
              </Text>
            )}
          </View>
        </View>

        {/* Big Amount */}
        <View className="items-end">
          <Text
            style={{
              fontSize: 17,
              fontWeight: '900',
              color: isDeposit ? '#059669' : '#DC2626',
            }}
          >
            {isDeposit ? '+' : '-'}ETB {formatMoney(transaction.amount)}
          </Text>
          {transaction.currentBalance !== null && (
            <Text className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Bal: ETB {formatMoney(transaction.currentBalance)}
            </Text>
          )}
        </View>
      </View>

      {/* Expandable Raw SMS Preview */}
      <Pressable
        onPress={() => setShowRaw(!showRaw)}
        className="py-1 mb-2"
      >
        <Text
          className="text-xs text-slate-400 dark:text-slate-500 italic"
          numberOfLines={showRaw ? undefined : 1}
        >
          💬 "{transaction.rawBody.trim()}"
        </Text>
      </Pressable>

      {/* Status Bar or Action Buttons */}
      <View className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        {isPending ? (
          <>
            {/* Quick Dismiss / Ignore */}
            <Pressable
              onPress={() => onDismiss(transaction)}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg active:opacity-60"
            >
              <XIcon size={14} color="#94A3B8" />
              <Text className="text-xs font-semibold text-slate-400">Ignore</Text>
            </Pressable>

            {/* Main Action Button */}
            {isDeposit ? (
              <Pressable
                onPress={() => onConvertToSale(transaction)}
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text className="text-xs font-black text-white tracking-wide">
                  Convert to Sale
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => onConvertToExpense(transaction)}
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl active:opacity-80"
                style={{ backgroundColor: '#D97706' }}
              >
                <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text className="text-xs font-black text-white tracking-wide">
                  Convert to Expense
                </Text>
              </Pressable>
            )}
          </>
        ) : (
          <View className="flex-row items-center justify-between w-full">
            <View className="flex-row items-center gap-1.5">
              <CheckCircleIcon
                size={16}
                color={
                  transaction.importStatus === 'ignored' ? '#94A3B8' : '#059669'
                }
              />
              <Text
                className="text-xs font-bold"
                style={{
                  color:
                    transaction.importStatus === 'ignored'
                      ? '#94A3B8'
                      : '#059669',
                }}
              >
                {transaction.importStatus === 'converted_sale' &&
                  'Recorded as Bookkeeping Sale'}
                {transaction.importStatus === 'converted_expense' &&
                  'Recorded as Bookkeeping Expense'}
                {transaction.importStatus === 'settled_debt' &&
                  'Matched & Settled Customer Debt'}
                {transaction.importStatus === 'ignored' &&
                  'Ignored from Bookkeeping'}
              </Text>
            </View>

            {transaction.importStatus === 'ignored' && (
              <Pressable
                onPress={() => onConvertToSale(transaction)}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
              >
                <Text className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Restore
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
