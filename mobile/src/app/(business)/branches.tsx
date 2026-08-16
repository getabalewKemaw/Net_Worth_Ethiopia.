import { StyleSheet, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useBusinessStore } from "@/store/business-store";

export default function BranchesScreen() {
  const colors = useTheme();

  // Zustand State selectors
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const branches = useBusinessStore((state) => state.branches);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const switchBranch = useBusinessStore((state) => state.switchBranch);
  const isPending = useBusinessStore((state) => state.isPending);

  const handleSelectBranch = (branchId: string) => {
    switchBranch(branchId);
    router.replace("/");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>← Back</ThemedText>
        </Pressable>
        <View style={styles.titleRow}>
          <View>
            <ThemedText type="title">Branches</ThemedText>
            <ThemedText style={styles.subtitle}>
              Active: {activeBusiness?.name || "No Business"}
            </ThemedText>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(business)/create-branch")}
          >
            <ThemedText style={styles.addBtnText}>+ Add</ThemedText>
          </Pressable>
        </View>
      </View>

      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No branches registered for this business.</ThemedText>
              <Pressable
                style={[styles.addBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
                onPress={() => router.push("/(business)/create-branch")}
              >
                <ThemedText style={styles.addBtnText}>Add First Branch</ThemedText>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = activeBranch?.id === item.id;
            return (
              <Pressable
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundElement },
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => handleSelectBranch(item.id)}
              >
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.branchName}>{item.name}</ThemedText>
                  {isSelected && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.badgeText}>Active</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.branchCode}>Code: {item.branchCode || "N/A"}</ThemedText>
                <ThemedText style={styles.branchDetails}>
                  {item.address}, {item.city}
                </ThemedText>
                {item.phoneNumber && (
                  <ThemedText style={styles.branchDetails}>Phone: {item.phoneNumber}</ThemedText>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: 14,
    color: "#60646C",
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    padding: 24,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 4,
  },
  cardSelected: {
    borderColor: "#535233",
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  branchName: {
    fontSize: 16,
    fontWeight: "600",
  },
  branchCode: {
    fontSize: 12,
    color: "#60646C",
    fontFamily: "monospace",
  },
  branchDetails: {
    fontSize: 14,
    color: "#60646C",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#60646C",
    textAlign: "center",
  },
});
