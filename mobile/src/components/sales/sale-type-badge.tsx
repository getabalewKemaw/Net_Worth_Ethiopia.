import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { SaleType } from "@/types/sales";

export function SaleTypeBadge({ saleType }: { saleType: SaleType }) {
  const isDube = saleType === "dube";
  return (
    <View style={{
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      backgroundColor: isDube ? "#FEF3C718" : "#F0FDF418",
      borderColor: isDube ? "#D9770640" : "#065F4640",
    }}>
      <ThemedText style={{ fontSize: 11, fontWeight: "800", color: isDube ? "#D97706" : "#065F46" }}>
        {isDube ? "📜 Dube" : "⚡ Instant"}
      </ThemedText>
    </View>
  );
}
