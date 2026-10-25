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
          <View style={styles.headerRow}>
            <View style={styles.headerTitleLeft}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 16 }}>📝</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Issue Customer Dube</Text>
                <Text style={styles.headerSubtitle}>Store Credit Notebook · Branch Locked</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} style={{ padding: 4 }}>
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            {/* Customer Details */}
            <View style={styles.inputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Customer Name *</Text>
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="e.g. Almaz Kebede"
                  placeholderTextColor="#94A3B8"
                  style={styles.standardInput}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Phone (Optional)</Text>
                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="0911234567"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  style={styles.standardInput}
                />
              </View>
            </View>

            {/* Credit Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Credit Amount (ETB) *</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.etbPrefix}>ETB</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={styles.amountInput}
                />
              </View>
            </View>

            {/* Promised Due Date Presets */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Promised Due Date</Text>
              <View style={styles.presetsRow}>
                {DUE_PRESETS.map((preset) => {
                  const isSelected = selectedDays === preset.days;
                  return (
                    <Pressable
                      key={preset.days}
                      onPress={() => handleSelectDays(preset.days)}
                      style={[
                        styles.presetChip,
                        isSelected && styles.presetChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.dueDateHelperText}>Due: {dueDate}</Text>
            </View>

            {/* Item / Items Description */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Items Taken / Note</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. 2 cartons of cooking oil, 1 bag sugar"
                placeholderTextColor="#94A3B8"
                style={styles.standardInput}
              />
            </View>
          </ScrollView>

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
                  <Text style={styles.submitBtnText}>Record Dube</Text>
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
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
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
    color: '#92400E',
    fontWeight: '600',
    marginTop: 1,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formGroup: {
    marginTop: 12,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  etbPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    paddingVertical: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#78350F',
    fontWeight: '800',
  },
  dueDateHelperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  actionsRow: {
    marginTop: 18,
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
