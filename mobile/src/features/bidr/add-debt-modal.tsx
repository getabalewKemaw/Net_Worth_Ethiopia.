import React, { useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import {
  XIcon,
  CalendarIcon,
  CheckIcon,
  Edit3Icon,
} from '@/components/icons';
import { BIDR_DUE_PRESETS } from '@/constants/bidr';
import type { PaymentMethod } from '@/types/sales';

interface AddDebtModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone?: string | null;
    dueDate?: string | null;
    notes?: string | null;
  }) => Promise<any>;
}

const getDueRelativeText = (dateStr: string): string => {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 'Promised pay date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays > 1) return `Pay in ${diffDays} days`;
  if (diffDays === -1) return 'Due yesterday (overdue)';
  return `${Math.abs(diffDays)} days overdue`;
};

const formatFutureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function AddDebtModal({
  visible,
  onClose,
  onConfirm,
}: AddDebtModalProps) {
  const colors = useTheme();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDateObj, setDueDateObj] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [dueDateStr, setDueDateStr] = useState(() => formatFutureDate(7));
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(7);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDescription('');
    setAmount('');
    setNotes('');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDateObj(d);
    setDueDateStr(formatFutureDate(7));
    setSelectedPreset(7);
    setIsCustomDate(false);
    setIsSubmitting(false);
  };

  const handleSelectPreset = (days: number) => {
    setSelectedPreset(days);
    setIsCustomDate(false);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDateObj(d);
    setDueDateStr(
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );
  };

  const handleSelectCustom = () => {
    setSelectedPreset('custom');
    setIsCustomDate(true);
  };

  const adjustDueDateDays = (delta: number) => {
    const baseDate = dueDateObj && !isNaN(dueDateObj.getTime()) ? new Date(dueDateObj) : new Date();
    baseDate.setDate(baseDate.getDate() + delta);
    setDueDateObj(baseDate);
    setDueDateStr(
      baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );
    setSelectedPreset('custom');
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('Customer Name Required', 'Please enter the name of the customer taking credit.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Item Description Required', 'Please enter what goods or items were taken on credit.');
      return;
    }
    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid credit balance amount greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      let parsedDueDate: string | null = null;
      if (dueDateObj && !isNaN(dueDateObj.getTime())) {
        parsedDueDate = dueDateObj.toISOString();
      } else if (dueDateStr.trim()) {
        const parsed = new Date(dueDateStr);
        if (!isNaN(parsed.getTime())) {
          parsedDueDate = parsed.toISOString();
        }
      }

      await onConfirm({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        description: description.trim(),
        amount: Math.round(parsedAmount),
        paymentMethod: 'cash',
        dueDate: parsedDueDate,
        notes: notes.trim() || null,
      });

      reset();
      onClose();
      Alert.alert('Dube Recorded', `Dube balance of ${parsedAmount.toLocaleString()} ETB registered successfully.`);
    } catch (err: any) {
      Alert.alert('Failed to Record Dube', err?.message || 'Could not save Dube record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.handleBar} />

          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <View className="flex-row items-center gap-2">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon size={16} color="#D97706" strokeWidth={2.5} />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>
                Record Dube
              </Text>
            </View>

            <Pressable onPress={onClose} hitSlop={8}>
              <XIcon size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Customer Name */}
            <Text style={styles.inputLabel}>Customer name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="e.g. Abebe Balcha"
              placeholderTextColor={colors.textSecondary}
              value={customerName}
              onChangeText={setCustomerName}
            />

            {/* Customer Phone */}
            <Text style={styles.inputLabel}>Customer phone (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="e.g. 0911234567"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />

            {/* Item Description */}
            <Text style={styles.inputLabel}>Items taken on credit *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="e.g. 2 bags of sugar, 5L oil"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />

            {/* Amount */}
            <Text style={styles.inputLabel}>Balance amount (ETB) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="e.g. 1500"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Promised Due Date */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Promised repayment date</Text>
              <View style={styles.duePresetsRow}>
                {BIDR_DUE_PRESETS.map((p) => {
                  const isSelected = selectedPreset === p.days;
                  return (
                    <Pressable
                      key={p.days}
                      onPress={() => handleSelectPreset(p.days)}
                      style={[
                        styles.duePresetChip,
                        {
                          borderColor: isSelected ? '#D97706' : colors.backgroundSelected,
                          backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.1)' : colors.background,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#D97706' : colors.textSecondary }}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={handleSelectCustom}
                  style={[
                    styles.duePresetChip,
                    {
                      borderColor: selectedPreset === 'custom' ? '#D97706' : colors.backgroundSelected,
                      backgroundColor: selectedPreset === 'custom' ? 'rgba(217, 119, 6, 0.1)' : colors.background,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Edit3Icon size={12} color={selectedPreset === 'custom' ? '#D97706' : colors.textSecondary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: selectedPreset === 'custom' ? '#D97706' : colors.textSecondary }}>
                      Other
                    </Text>
                  </View>
                </Pressable>
              </View>

              <View style={[styles.dueDateCard, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CalendarIcon size={15} color="#D97706" />
                    {isCustomDate ? (
                      <TextInput
                        style={[styles.dueDateInput, { color: colors.text }]}
                        value={dueDateStr}
                        onChangeText={(val) => {
                          setDueDateStr(val);
                          setSelectedPreset('custom');
                        }}
                        placeholder="e.g. Sep 25, 2026"
                        placeholderTextColor={colors.textSecondary}
                        autoFocus={selectedPreset === 'custom'}
                      />
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{dueDateStr || 'Select date'}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginTop: 3, marginLeft: 21 }}>
                    {getDueRelativeText(dueDateStr)}
                  </Text>
                </View>

                <View style={styles.dueStepperRow}>
                  <Pressable onPress={() => adjustDueDateDays(-1)} style={[styles.dueStepBtn, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>−</Text>
                  </Pressable>
                  <Pressable onPress={() => adjustDueDateDays(1)} style={[styles.dueStepBtn, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.inputLabel}>Terms & notes (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected, minHeight: 60 }]}
              placeholder="Repayment agreement notes or collateral..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable style={[styles.cancelBtn, { borderColor: colors.backgroundSelected }]} onPress={onClose}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.submitBtn, { backgroundColor: '#D97706', opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckIcon size={15} color="#FFF" strokeWidth={2.5} />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>Save Dube</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  duePresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  duePresetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  dueDateInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0,
  },
  dueStepperRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dueStepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
