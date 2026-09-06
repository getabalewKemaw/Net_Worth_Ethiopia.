import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";

export function SectionSummary({ total, count, label, color }: { total: number; count: number; label: string; color: string }) {
  return (
    <View style={{
      marginTop: 14,
      marginBottom: 12,
      padding: 16,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: color,
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    }}>
      <ThemedText style={{ fontSize: 11, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.8 }}>
        Today&apos;s {label}
      </ThemedText>
      <ThemedText style={{ fontSize: 26, fontWeight: "900", color, marginTop: 2 }}>
        {total.toLocaleString()} ETB
      </ThemedText>
      <ThemedText style={{ fontSize: 12, color: "#9CA3AF", fontWeight: "500" }}>{count} {label.toLowerCase()}</ThemedText>
    </View>
  );
}
