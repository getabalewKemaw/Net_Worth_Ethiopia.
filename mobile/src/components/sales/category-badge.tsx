import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <View style={{
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      backgroundColor: "#F59E0B18",
      borderColor: "#F59E0B40",
    }}>
      <ThemedText style={{ fontSize: 11, fontWeight: "700", color: "#D97706" }}>{category}</ThemedText>
    </View>
  );
}
