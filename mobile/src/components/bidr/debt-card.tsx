import React from 'react';
import { View, Pressable, Text, Linking, Alert } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import {
  PhoneIcon,
  CheckIcon,
} from '@/components/icons';
import { getDebtStatusDisplay } from '@/lib/bidr-utils';
import type { DebtItem } from '@/types/bidr';

interface DebtCardProps {
  debt: DebtItem;
  onPress: (debt: DebtItem) => void;
  onSettle: (debt: DebtItem) => void;
}

export function DebtCard({ debt, onPress, onSettle }: DebtCardProps) {
  const colors = useTheme();

  const handlePhonePress = (e: any) => {
    e.stopPropagation();
    if (!debt.customerPhone) return;
    const cleanPhone = debt.customerPhone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert('Unable to call', `Cannot place a call to ${cleanPhone}`);
      })
      .catch(() => Alert.alert('Error', 'Failed to open phone dialer'));
  };

  const status = getDebtStatusDisplay(debt);
  const customerName = debt.customerName || 'Walk-in Customer';
  const initial = customerName.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => onPress(debt)}
      className="mx-5 mb-3.5 p-4 rounded-2xl border active:opacity-95"
      style={{
        backgroundColor: colors.backgroundElement,
        borderColor: colors.backgroundSelected,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Top Row: Avatar + Info + Amount */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.backgroundSelected }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              {initial}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                letterSpacing: -0.2,
              }}
              numberOfLines={1}
            >
              {customerName}
            </Text>

            <Text
              style={{
                fontSize: 13,
                fontWeight: '400',
                color: colors.textSecondary,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {debt.description}
            </Text>
          </View>
        </View>

        {/* Right: Amount & Status */}
        <View className="items-end">
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: debt.status === 'settled' ? '#065F46' : colors.text,
              letterSpacing: -0.2,
            }}
          >
            {debt.amount.toLocaleString()}{' '}
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
              ETB
            </Text>
          </Text>

          <View className="flex-row items-center gap-1.5 mt-1.5">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: status.dotColor }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: status.color,
              }}
            >
              {status.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Row for Pending Records */}
      {debt.status === 'pending' && (
        <View
          className="flex-row items-center justify-between pt-3 mt-3 border-t"
          style={{ borderColor: colors.backgroundSelected }}
        >
          {debt.customerPhone ? (
            <Pressable
              onPress={handlePhonePress}
              className="flex-row items-center gap-2 py-1.5 px-2.5 rounded-xl active:bg-slate-100 dark:active:bg-slate-800"
              hitSlop={6}
            >
              <PhoneIcon size={14} color="#065F46" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#065F46',
                }}
              >
                {debt.customerPhone}
              </Text>
            </Pressable>
          ) : (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '400',
                color: colors.textSecondary,
              }}
            >
              No phone registered
            </Text>
          )}

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onSettle(debt);
            }}
            className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl active:opacity-85"
            style={{
              backgroundColor: '#065F46',
              shadowColor: '#065F46',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <CheckIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Settle
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
