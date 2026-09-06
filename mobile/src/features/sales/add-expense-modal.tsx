import React, { useState } from "react";
import { View, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, Alert, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { EXPENSE_CATEGORIES } from "@/constants/sales";
import type { ExpenseInput } from "@/types/sales";

export function AddExpenseModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: ExpenseInput) => void;
}) {
  const colors = useTheme();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);

  const reset = () => {
    setDesc("");
    setAmount("");
    setCategory(EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = () => {
    if (!desc.trim() || !amount.trim()) {
      Alert.alert("Missing Info", "Please enter a description and amount.");
      return;
    }
    onAdd({ description: desc.trim(), amount: parseFloat(amount), category });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.handleBar} />
          <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Log New Expense</ThemedText>

          <ThemedText style={styles.inputLabel}>Description *</ThemedText>
          <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: "#E5E7EB" }]} placeholder="e.g. Electricity bill" placeholderTextColor={colors.textSecondary} value={desc} onChangeText={setDesc} />

          <ThemedText style={styles.inputLabel}>Amount (ETB) *</ThemedText>
          <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: "#E5E7EB" }]} placeholder="0.00" placeholderTextColor={colors.textSecondary} keyboardType="numeric" value={amount} onChangeText={setAmount} />

          <ThemedText style={styles.inputLabel}>Category</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.categoryRow}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryChip,
                    { borderColor: category === cat ? "#F59E0B" : "#E5E7EB", backgroundColor: category === cat ? "#FEF3C7" : colors.background },
                  ]}
                >
                  <ThemedText style={{ fontSize: 12, fontWeight: "700", color: category === cat ? "#D97706" : colors.textSecondary }}>
                    {cat}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={[styles.cancelBtn, { borderColor: "#E5E7EB" }]} onPress={() => { reset(); onClose(); }}>
              <ThemedText style={{ fontWeight: "700", color: "#6B7280" }}>Cancel</ThemedText>
            </Pressable>
            <Pressable style={[styles.submitBtn, { backgroundColor: "#EF4444" }]} onPress={handleSubmit}>
              <ThemedText style={{ fontWeight: "800", color: "#FFF", fontSize: 15 }}>Add Expense</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
