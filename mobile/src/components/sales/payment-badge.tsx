import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { PAYMENT_METHODS } from "@/constants/sales";
import type { PaymentMethod } from "@/types/sales";

export function PaymentBadge({ method }: { method: PaymentMethod }) {
  const pm = PAYMENT_METHODS.find((p) => p.key === method)!;
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, backgroundColor: pm.color + "18", borderColor: pm.color + "40" }}>
      <ThemedText style={{ fontSize: 11, fontWeight: "700", color: pm.color }}>{pm.label}</ThemedText>
    </View>
  );
}
