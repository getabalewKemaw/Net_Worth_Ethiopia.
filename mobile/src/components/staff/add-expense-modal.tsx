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
          <View style={styles.headerRow}>
            <View style={styles.headerTitleLeft}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 16 }}>💸</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Record Petty Expense</Text>
                <Text style={styles.headerSubtitle}>Deducted from Drawer Cash · Branch Locked</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} style={{ padding: 4 }}>
              <XIcon size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Amount Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Expense Amount (ETB) *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.etbPrefix}>ETB</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                autoFocus
                style={styles.amountInput}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Packaging bags, Cleaning supplies, Transport"
              placeholderTextColor="#94A3B8"
              style={styles.standardInput}
            />
          </View>

          {/* Category Chips */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Expense Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Note (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Approved by shop supervisor"
              placeholderTextColor="#94A3B8"
              style={styles.standardInput}
            />
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
                  <Text style={styles.submitBtnText}>Record Expense</Text>
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 1,
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
    color: '#DC2626',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    paddingVertical: 0,
  },
  standardInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  categoryChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#B91C1C',
    fontWeight: '800',
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
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#B91C1C',
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
