import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificationItem } from "@/service/notification.service";

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}) {
  const isUnread = !item.readAt;
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={{
        padding: 16,
        backgroundColor: isUnread ? "#ECFDF5" : "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {isUnread && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#065F46" }} />
            )}
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
              {item.title}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: "#4B5563", marginTop: 4 }}>{item.body}</Text>
        </View>
        <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "500" }}>
          {formatRelative(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { items: rawItems, unread, loading, refreshing, error, refresh, markRead, markAllRead } =
    useNotifications();
  const items = rawItems ?? [];

  const handlePress = async (item: NotificationItem) => {
    if (!item.readAt) await markRead(item.id);
    const route = (item.data as any)?.route;
    if (route) {
      router.push(route);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20, color: "#111827" }}>←</Text>
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>Notifications</Text>
          {unread > 0 && (
            <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
              {unread} unread
            </Text>
          )}
        </View>
        <Pressable
          onPress={markAllRead}
          disabled={unread === 0}
          hitSlop={8}
          style={{ padding: 8, opacity: unread === 0 ? 0.35 : 1 }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#065F46" }}>Mark all</Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#065F46" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 15, color: "#EF4444", textAlign: "center", marginBottom: 8 }}>
            {error}
          </Text>
          <Pressable onPress={() => refresh()} style={{ padding: 12 }}>
            <Text style={{ color: "#065F46", fontWeight: "700" }}>Retry</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
            No notifications yet
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4, textAlign: "center" }}>
            When a Dube goes overdue, you'll be notified here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationRow item={item} onPress={handlePress} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#065F46"
              colors={["#065F46"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}

