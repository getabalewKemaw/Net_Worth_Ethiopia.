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
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
                <UserIcon size={16} color="#10B981" />
              </View>
              <View>
                <Text className="text-lg font-extrabold text-white">Assign Branch Staff</Text>
                <Text className="text-xs text-emerald-400 font-semibold">
                  {branchName ? `${branchName} · Counter Operator` : 'Authorize Sales Cashier'}
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <XIcon size={20} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Info Banner */}
          <View className="mt-3.5 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <Text className="text-xs text-slate-300 leading-relaxed">
              Enter the staff member&apos;s email address. If they already have an account, their branch access activates immediately. If not, their invite will automatically link upon registration.
            </Text>
          </View>

          {/* Staff Email Input */}
          <View className="mt-4">
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Staff Email Address *
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. cashier.bole@gmail.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </View>

          {/* Staff Name / Nickname */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Staff Name / Nickname (Optional)
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chala (Day Shift)"
              placeholderTextColor="#64748B"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </View>

          {/* Role Selection */}
          <View className="mt-3.5">
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
              Staff Counter Role
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setRole('sales')}
                className={`flex-1 py-3 px-3 rounded-xl border flex-row items-center justify-center gap-2 ${
                  role === 'sales'
                    ? 'bg-emerald-950/60 border-emerald-500'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <Text className="text-base">🛒</Text>
                <View>
                  <Text
                    className={`text-xs font-bold ${
                      role === 'sales' ? 'text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    Sales Cashier
                  </Text>
                  <Text className="text-[10px] text-slate-400">
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
              className="flex-1 py-3.5 rounded-xl border border-slate-700 items-center justify-center active:opacity-70"
            >
              <Text className="text-sm font-bold text-slate-300">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-2 py-3.5 px-6 rounded-xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row gap-2 active:opacity-80"
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
