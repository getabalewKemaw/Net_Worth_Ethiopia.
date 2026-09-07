import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

export function CategoryBadge({ category }: { category: string }) {
  const colors = useTheme();
  return (
    <View style={{
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      backgroundColor: `${colors.expense}18`,
      borderColor: `${colors.expense}40`,
    }}>
      <ThemedText style={{ fontSize: 11, fontWeight: "700", color: colors.expense }}>{category}</ThemedText>
    </View>
  );
}
