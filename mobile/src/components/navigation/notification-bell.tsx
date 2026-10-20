import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useUnreadCount } from "@/hooks/use-notifications";

export function NotificationBell() {
  const { unread } = useUnreadCount();
  const count = unread > 99 ? "99+" : unread > 0 ? String(unread) : null;

  return (
    <Pressable
      onPress={() => router.push("/notifications" as any)}
      hitSlop={8}
      style={{ padding: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
    >
      <View style={{ position: "relative" }}>
        <Text style={{ fontSize: 22 }}>🔔</Text>
        {count && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 4,
              borderRadius: 8,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{count}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
