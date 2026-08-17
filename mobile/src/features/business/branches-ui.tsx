import React from "react";
import { StyleSheet, View, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { UseBranchesReturn } from "@/hooks/use-branches";

interface BranchesUIProps {
  hookProps: UseBranchesReturn;
}

export const BranchesUI: React.FC<BranchesUIProps> = ({ hookProps }) => {
  const colors = useTheme();

  const {
    activeBusiness,
    businesses,
    branches,
    activeBranch,
    isPending,
    handleSelectBranch,
    handleSwitchBusiness,
  } = hookProps;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>← Back</ThemedText>
        </Pressable>
        <View style={styles.titleRow}>
          <View>
            <ThemedText type="title">Business & Branches</ThemedText>
            <ThemedText style={styles.subtitle}>
              Active: {activeBusiness?.name || "No Business"}
            </ThemedText>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(business)/create-branch")}
          >
            <ThemedText style={styles.addBtnText}>+ Add Branch</ThemedText>
          </Pressable>
        </View>
      </View>

      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Section 1: Business List (Switching Console) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Your Businesses</ThemedText>
              <Pressable onPress={() => router.push("/(business)/create-business")}>
                <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>+ New Business</ThemedText>
              </Pressable>
            </View>
            <View style={styles.businessGrid}>
              {businesses.map((biz) => {
                const isActive = activeBusiness?.id === biz.id;
                return (
                  <Pressable
                    key={biz.id}
                    style={[
                      styles.businessCard,
                      { backgroundColor: colors.backgroundElement },
                      isActive && { borderColor: colors.primary, borderWidth: 1.5 },
                    ]}
                    onPress={() => handleSwitchBusiness(biz.id)}
                  >
                    <ThemedText style={styles.bizName}>{biz.name}</ThemedText>
                    <View style={styles.bizMeta}>
                      <ThemedText style={styles.bizMetaText}>{biz.type}</ThemedText>
                      {isActive && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section 2: Branch Management */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Operating Branches</ThemedText>
            {branches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No branches registered for this business.</ThemedText>
                <Pressable
                  style={[styles.addBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
                  onPress={() => router.push("/(business)/create-branch")}
                >
                  <ThemedText style={styles.addBtnText}>Add First Branch</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.branchList}>
                {branches.map((item) => {
                  const isSelected = activeBranch?.id === item.id;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.card,
                        { backgroundColor: colors.backgroundElement },
                        isSelected && styles.cardSelected,
                      ]}
                    >
                      <Pressable style={styles.cardSelectableArea} onPress={() => handleSelectBranch(item.id)}>
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
                        {(item.telebirrMerchantId || item.cbeBirrMerchantId) && (
                          <View style={styles.merchantIdsRow}>
                            {item.telebirrMerchantId && (
                              <ThemedText style={styles.merchantIdText}>Telebirr: {item.telebirrMerchantId}</ThemedText>
                            )}
                            {item.cbeBirrMerchantId && (
                              <ThemedText style={styles.merchantIdText}>CBE: {item.cbeBirrMerchantId}</ThemedText>
                            )}
                          </View>
                        )}
                      </Pressable>

                      {/* Edit Button */}
                      <Pressable
                        style={[styles.editBtn, { borderColor: colors.backgroundSelected }]}
                        onPress={() => router.push({ pathname: "/(business)/edit-branch", params: { id: item.id } })}
                      >
                        <ThemedText style={[styles.editBtnText, { color: colors.text }]}>Manage & Edit</ThemedText>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  businessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  businessCard: {
    flex: 1,
    minWidth: "45%",
    padding: 14,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  bizName: {
    fontSize: 15,
    fontWeight: "700",
  },
  bizMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bizMetaText: {
    fontSize: 12,
    color: "#60646C",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  branchList: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
  },
  cardSelectableArea: {
    padding: 16,
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
  merchantIdsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  merchantIdText: {
    fontSize: 12,
    color: "#60646C",
    backgroundColor: "#F0F0F3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
  editBtn: {
    borderTopWidth: 1,
    borderColor: "#E0E1E6",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    color: "#60646C",
    textAlign: "center",
  },
});
