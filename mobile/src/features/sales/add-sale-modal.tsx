import React, { useState } from "react";
import {
  View,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { DUE_PRESETS, PAYMENT_METHODS } from "@/constants/sales";
import type { SaleInput, SaleType, PaymentMethod } from "@/types/sales";

const formatFutureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getDueRelativeText = (dateStr: string): string => {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return "Promised pay date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays > 1) return `Pay in ${diffDays} days`;
  if (diffDays === -1) return "Due yesterday (overdue)";
  return `${Math.abs(diffDays)} days overdue`;
};

export function AddSaleModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: SaleInput) => void;
}) {
  const colors = useTheme();
  const [saleType, setSaleType] = useState<SaleType>("instant");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [dueDate, setDueDate] = useState(formatFutureDate(7));
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(7);
  const [isCustomDate, setIsCustomDate] = useState(false);

  const reset = () => {
    setSaleType("instant");
    setDesc("");
    setAmount("");
    setCustomer("");
    setPhone("");
    setMethod("cash");
    setDueDate(formatFutureDate(7));
    setSelectedPreset(7);
    setIsCustomDate(false);
  };

  const handleSelectPreset = (days: number) => {
    setSelectedPreset(days);
    setIsCustomDate(false);
    setDueDate(formatFutureDate(days));
  };

  const handleSelectCustom = () => {
    setSelectedPreset("custom");
    setIsCustomDate(true);
  };

  const adjustDueDateDays = (delta: number) => {
    const parsed = new Date(dueDate);
    const baseDate = isNaN(parsed.getTime()) ? new Date() : parsed;
    baseDate.setDate(baseDate.getDate() + delta);
    setDueDate(baseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    setSelectedPreset("custom");
  };

  const handleSubmit = () => {
    if (!desc.trim() || !amount.trim()) {
      Alert.alert("Missing Info", "Please enter a description and amount.");
      return;
    }
    if (saleType === "dube") {
      if (!customer.trim()) {
        Alert.alert("Missing Info", "Customer name is required for Dube (debt) sales.");
        return;
      }
      if (!phone.trim()) {
        Alert.alert("Missing Info", "Phone number is required for Dube (debt) sales.");
        return;
      }
      if (!dueDate.trim()) {
        Alert.alert("Missing Info", "Promised payment date is required for Dube (debt) sales.");
        return;
      }
    }
    onAdd({
      description: desc.trim(),
      amount: parseFloat(amount),
      customer: customer.trim() || undefined,
      phone: phone.trim() || undefined,
      paymentMethod: method,
      saleType,
      dueDate: saleType === "dube" ? dueDate.trim() : undefined,
    });
    reset();
    onClose();
  };

  const isDube = saleType === "dube";
  const accentColor = isDube ? "#D97706" : "#065F46";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.handleBar} />
          <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Record New Sale</ThemedText>

          <View style={[styles.saleTypePill, { backgroundColor: colors.background }]}>
            <Pressable style={[styles.toggleBtn, !isDube && styles.toggleBtnActive]} onPress={() => setSaleType("instant")}>
              {!isDube && <View style={[styles.toggleBtnBg, { backgroundColor: "#065F46" }]} />}
              <ThemedText style={[styles.toggleBtnText, { color: !isDube ? "#FFF" : colors.textSecondary }]}>⚡  Instant</ThemedText>
            </Pressable>
            <Pressable style={[styles.toggleBtn, isDube && styles.toggleBtnActive]} onPress={() => setSaleType("dube")}>
              {isDube && <View style={[styles.toggleBtnBg, { backgroundColor: "#D97706" }]} />}
              <ThemedText style={[styles.toggleBtnText, { color: isDube ? "#FFF" : colors.textSecondary }]}>📜  Dube (Debt)</ThemedText>
            </Pressable>
          </View>

          {isDube && (
            <View style={[styles.dubeNote, { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }]}>
              <ThemedText style={{ fontSize: 12, color: "#92400E", fontWeight: "600", lineHeight: 18 }}>
                📜 Dube means credit sale. Customer name, phone, and promised pay date are required.
              </ThemedText>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <ThemedText style={styles.inputLabel}>Item / Description *</ThemedText>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: "#E5E7EB" }]} placeholder="e.g. Injera 10 plates" placeholderTextColor={colors.textSecondary} value={desc} onChangeText={setDesc} />

            <ThemedText style={styles.inputLabel}>Amount (ETB) *</ThemedText>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: "#E5E7EB" }]} placeholder="0.00" placeholderTextColor={colors.textSecondary} keyboardType="numeric" value={amount} onChangeText={setAmount} />

            <ThemedText style={styles.inputLabel}>Customer Name{isDube ? " *" : " (optional)"}</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: isDube && !customer.trim() ? "#FBBF24" : "#E5E7EB",
                },
              ]}
              placeholder={isDube ? "Required for Dube sales" : "Customer name (optional)"}
              placeholderTextColor={isDube ? "#D97706" : colors.textSecondary}
              value={customer}
              onChangeText={setCustomer}
            />

            <ThemedText style={styles.inputLabel}>Phone Number{isDube ? " *" : " (optional)"}</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: isDube && !phone.trim() ? "#FBBF24" : "#E5E7EB",
                },
              ]}
              placeholder={isDube ? "Required — e.g. 0912345678" : "e.g. 0912345678 (optional)"}
              placeholderTextColor={isDube ? "#D97706" : colors.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {isDube && (
              <View style={{ marginBottom: 16 }}>
                <ThemedText style={styles.inputLabel}>Promised Payment Date *</ThemedText>

                <View style={styles.duePresetsRow}>
                  {DUE_PRESETS.map((p) => {
                    const isSelected = selectedPreset === p.days;
                    return (
                      <Pressable
                        key={p.days}
                        onPress={() => handleSelectPreset(p.days)}
                        style={[
                          styles.duePresetChip,
                          {
                            borderColor: isSelected ? "#D97706" : "#E5E7EB",
                            backgroundColor: isSelected ? "#FEF3C7" : colors.background,
                          },
                        ]}
                      >
                        <ThemedText style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#D97706" : colors.textSecondary }}>
                          {p.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={handleSelectCustom}
                    style={[
                      styles.duePresetChip,
                      {
                        borderColor: selectedPreset === "custom" ? "#D97706" : "#E5E7EB",
                        backgroundColor: selectedPreset === "custom" ? "#FEF3C7" : colors.background,
                      },
                    ]}
                  >
                    <ThemedText style={{ fontSize: 12, fontWeight: "700", color: selectedPreset === "custom" ? "#D97706" : colors.textSecondary }}>
                      ✏️ Other
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={[styles.dueDateCard, { backgroundColor: colors.background, borderColor: selectedPreset === "custom" ? "#D97706" : "#FCD34D" }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <ThemedText style={{ fontSize: 16 }}>📅</ThemedText>
                      {isCustomDate ? (
                        <TextInput
                          style={[styles.dueDateInput, { color: colors.text }]}
                          value={dueDate}
                          onChangeText={(val) => {
                            setDueDate(val);
                            setSelectedPreset("custom");
                          }}
                          placeholder="e.g. Sep 25, 2026"
                          placeholderTextColor={colors.textSecondary}
                          autoFocus={selectedPreset === "custom"}
                        />
                      ) : (
                        <ThemedText style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{dueDate}</ThemedText>
                      )}
                    </View>
                    <ThemedText style={{ fontSize: 11, fontWeight: "600", color: "#B45309", marginTop: 3, marginLeft: 22 }}>
                      {getDueRelativeText(dueDate)}
                    </ThemedText>
                  </View>

                  <View style={styles.dueStepperRow}>
                    <Pressable onPress={() => adjustDueDateDays(-1)} style={[styles.dueStepBtn, { borderColor: "#FCD34D", backgroundColor: "#FEF3C7" }]}>
                      <ThemedText style={{ fontSize: 15, fontWeight: "800", color: "#92400E" }}>−</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => adjustDueDateDays(1)} style={[styles.dueStepBtn, { borderColor: "#FCD34D", backgroundColor: "#FEF3C7" }]}>
                      <ThemedText style={{ fontSize: 15, fontWeight: "800", color: "#92400E" }}>+</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {!isDube && (
              <>
                <ThemedText style={styles.inputLabel}>Payment Method</ThemedText>
                <View style={styles.methodRow}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = method === pm.key;
                    return (
                      <Pressable
                        key={pm.key}
                        onPress={() => setMethod(pm.key)}
                        style={[
                          styles.methodBtn,
                          {
                            borderColor: isSelected ? pm.color : "#E5E7EB",
                            backgroundColor: isSelected ? pm.color + "18" : colors.background,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <ThemedText style={{ fontSize: 13 }}>{pm.icon}</ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={{
                              fontSize: 12,
                              lineHeight: 16,
                              fontWeight: "700",
                              color: isSelected ? pm.color : colors.text,
                            }}
                          >
                            {pm.name}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <View style={[styles.modalActions, { marginTop: 8 }]}>
            <Pressable style={[styles.cancelBtn, { borderColor: "#E5E7EB" }]} onPress={() => { reset(); onClose(); }}>
              <ThemedText style={{ fontWeight: "700", color: "#6B7280" }}>Cancel</ThemedText>
            </Pressable>
            <Pressable style={[styles.submitBtn, { backgroundColor: accentColor }]} onPress={handleSubmit}>
              <ThemedText style={{ fontWeight: "800", color: "#FFF", fontSize: 15 }}>{isDube ? "Record Dube" : "Add Sale"}</ThemedText>
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
  dubeNote: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
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
  methodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  duePresetsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  duePresetChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dueDateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dueDateInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 0,
  },
  dueStepperRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dueStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  saleTypePill: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 3,
    gap: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },
  toggleBtnActive: {},
  toggleBtnBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 11,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: "800",
    zIndex: 1,
  },
});
