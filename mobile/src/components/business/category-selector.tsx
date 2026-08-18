import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";
import { BUSINESS_TYPES } from "@/constants/business";

interface CategorySelectorProps {
  selectedType: string;
  onSelect: (type: typeof BUSINESS_TYPES[number]["value"]) => void;
  error?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedType, onSelect, error }) => {
  const theme = useTheme();

  return (
    <View style={styles.typeContainer}>
      <ThemedText style={styles.label}>Business Type *</ThemedText>
      <View style={styles.typeGrid}>
        {BUSINESS_TYPES.map((t) => {
          const selected = selectedType === t.value;
          return (
            <Pressable
              key={t.value}
              style={[
                styles.typeCard,
                { backgroundColor: theme.backgroundElement },
                selected ? { borderColor: theme.primary, borderWidth: 2, backgroundColor: theme.backgroundSelected } : null,
              ]}
              onPress={() => onSelect(t.value)}
            >
              <ThemedText style={styles.typeIcon}>{t.icon}</ThemedText>
              <View style={styles.typeCardTextContainer}>
                <ThemedText style={[styles.typeLabelText, { color: theme.text }]}>{t.label}</ThemedText>
                <ThemedText style={[styles.typeDescText, { color: theme.textSecondary }]}>{t.desc}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  typeContainer: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  typeGrid: {
    gap: 10,
  },
  typeCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  typeIcon: {
    fontSize: 26,
  },
  typeCardTextContainer: {
    flex: 1,
    gap: 2,
  },
  typeLabelText: {
    fontSize: 15,
    fontWeight: "700",
  },
  typeDescText: {
    fontSize: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
});
