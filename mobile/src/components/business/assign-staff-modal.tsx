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
import type { StaffAssignment, StaffRole } from '@/types/staff';
import { XIcon, CheckCircleIcon, UserIcon } from '@/components/icons';

interface AssignStaffModalProps {
  visible: boolean;
  branchId: string;
  branchName?: string;
  existingStaff: StaffAssignment[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export function AssignStaffModal({
  visible,
  branchId,
  branchName,
  existingStaff,
  onClose,
  onSuccess,
}: AssignStaffModalProps) {
  const assignStaff = useStaffStore((s) => s.assignStaff);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('sales');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setEmail('');
    setName('');
    setRole('sales');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Please enter the staff member\'s email address.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const alreadyAssigned = existingStaff.some(
      (s) => s.email.toLowerCase() === trimmedEmail
    );

    if (alreadyAssigned) {
      Alert.alert(
        'Already Assigned',
        `A staff member with email "${trimmedEmail}" is already assigned to this branch.`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await assignStaff(
        branchId,
        trimmedEmail,
        name.trim() || undefined,
        role
      );

      handleClose();
      Alert.alert(
        'Staff Assigned Successfully',
        `Assigned ${trimmedEmail} to ${branchName || 'this branch'}. The next time this person logs into the app, they will automatically be routed to their assigned branch counter.`
      );
      await onSuccess();
    } catch (err: any) {
      console.error('[AssignStaffModal] Assignment failed:', err);
      Alert.alert('Assignment Failed', err?.message || 'Could not assign staff member.');
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
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center border border-emerald-200">
                <UserIcon size={16} color="#065F46" />
              </View>
              <View>
                <Text className="text-lg font-extrabold text-slate-900">Assign Branch Staff</Text>
                <Text className="text-xs text-[#065F46] font-semibold">
                  {branchName ? `${branchName} · Counter Operator` : 'Authorize Sales Cashier'}
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Info Banner */}
          <View className="mt-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <Text className="text-xs text-slate-600 leading-relaxed">
              Enter the staff member&apos;s email address. If they already have an account, their branch access activates immediately. If not, their invite will automatically link upon registration.
            </Text>
          </View>

          {/* Staff Email Input */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Staff Email Address *
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. cashier.bole@gmail.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </View>

          {/* Staff Name / Nickname */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Staff Name / Nickname (Optional)
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chala (Day Shift)"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </View>

          {/* Role Selection */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Staff Counter Role
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setRole('sales')}
                className={`flex-1 py-3 px-3 rounded-xl border flex-row items-center justify-center gap-2 ${
                  role === 'sales'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className="text-base">🛒</Text>
                <View>
                  <Text
                    className={`text-xs font-bold ${
                      role === 'sales' ? 'text-emerald-900' : 'text-slate-600'
                    }`}
                  >
                    Sales Cashier
                  </Text>
                  <Text className="text-[10px] text-slate-500">
                    POS & Dube Checkout
                  </Text>
                </View>
              </Pressable>
            </View>
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
                  <Text className="text-sm font-black text-white">Assign Staff</Text>
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
