import React from "react";
import { View, Pressable } from "react-native";
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
    <View className="gap-1.5">
      <ThemedText className="text-sm font-semibold mb-1">Business Type *</ThemedText>
      <View className="gap-2.5">
        {BUSINESS_TYPES.map((t) => {
          const selected = selectedType === t.value;
          return (
            <Pressable
              key={t.value}
              className="flex-row p-3.5 rounded-xl items-center gap-3 border-[1.5px] active:opacity-80"
              style={[
                { backgroundColor: theme.backgroundElement, borderColor: "transparent" },
                selected ? { borderColor: theme.primary, backgroundColor: theme.backgroundSelected } : null,
              ]}
              onPress={() => onSelect(t.value)}
            >
              <ThemedText className="text-[26px]">{t.icon}</ThemedText>
              <View className="flex-1 gap-0.5">
                <ThemedText className="text-[15px] font-bold" style={{ color: theme.text }}>{t.label}</ThemedText>
                <ThemedText className="text-xs" style={{ color: theme.textSecondary }}>{t.desc}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? <ThemedText className="text-red-600 text-xs">{error}</ThemedText> : null}
    </View>
  );
};
