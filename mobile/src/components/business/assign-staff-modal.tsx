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
          <View style={styles.headerRow}>
            <View style={styles.headerTitleLeft}>
              <View style={styles.iconCircle}>
                <UserIcon size={16} color="#065F46" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Assign Branch Staff</Text>
                <Text style={styles.headerSubtitle}>
                  {branchName ? `${branchName} · Counter Operator` : 'Authorize Sales Cashier'}
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} style={{ padding: 4 }}>
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Enter the staff member&apos;s email address. If they already have an account, their branch access activates immediately. If not, their invite will automatically link upon registration.
            </Text>
          </View>

          {/* Staff Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Staff Email Address *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. cashier.bole@gmail.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              style={styles.standardInput}
            />
          </View>

          {/* Staff Name / Nickname */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Staff Name / Nickname (Optional)</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chala (Day Shift)"
              placeholderTextColor="#94A3B8"
              style={styles.standardInput}
            />
          </View>

          {/* Role Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Staff Counter Role</Text>
            <View style={styles.roleSelectionRow}>
              <Pressable
                onPress={() => setRole('sales')}
                style={[
                  styles.roleCard,
                  role === 'sales' && styles.roleCardActive,
                ]}
              >
                <Text style={{ fontSize: 18 }}>🛒</Text>
                <View>
                  <Text
                    style={[
                      styles.roleTitle,
                      { color: role === 'sales' ? '#064E3B' : '#475569' },
                    ]}
                  >
                    Sales Cashier
                  </Text>
                  <Text style={styles.roleSubtitle}>
                    POS & Dube Checkout
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircleIcon size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Assign Staff</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    marginTop: 1,
  },
  infoBanner: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  infoBannerText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  formGroup: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  standardInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  roleSelectionRow: {
    flexDirection: 'row',
  },
  roleCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  roleSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  actionsRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#065F46',
    borderWidth: 1,
    borderColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
