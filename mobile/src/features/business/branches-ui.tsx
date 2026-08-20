import React from "react";
import { View, Pressable, ActivityIndicator, ScrollView } from "react-native";
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-6 pt-4 pb-2 gap-2">
        <Pressable className="self-start mb-2 active:opacity-70" onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>← Back</ThemedText>
        </Pressable>
        <View className="flex-row items-center justify-between">
          <View>
            <ThemedText type="title" className="text-2xl font-extrabold">Business & Branches</ThemedText>
            <ThemedText className="text-sm text-[#60646C]">
              Active: {activeBusiness?.name || "No Business"}
            </ThemedText>
          </View>
          <Pressable
            className="px-4 py-2 rounded-lg items-center justify-center active:opacity-80"
            style={{ backgroundColor: colors.primary }}
            onPress={() => router.push("/(business)/create-branch")}
          >
            <ThemedText className="text-white font-semibold text-sm">+ Add Branch</ThemedText>
          </Pressable>
        </View>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Section 1: Business List (Switching Console) */}
          <View className="px-6 mt-5 gap-3">
            <View className="flex-row justify-between items-center">
              <ThemedText className="text-[18px] font-bold">Your Businesses</ThemedText>
              <Pressable onPress={() => router.push("/(business)/create-business")}>
                <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>+ New Business</ThemedText>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {businesses.map((biz) => {
                const isActive = activeBusiness?.id === biz.id;
                return (
                  <Pressable
                    key={biz.id}
                    className="flex-1 min-w-[45%] p-3.5 rounded-xl gap-1 border-[1.5px] active:opacity-80"
                    style={[
                      { backgroundColor: colors.backgroundElement, borderColor: "transparent" },
                      isActive && { borderColor: colors.primary },
                    ]}
                    onPress={() => handleSwitchBusiness(biz.id)}
                  >
                    <ThemedText className="text-[15px] font-bold">{biz.name}</ThemedText>
                    <View className="flex-row justify-between items-center">
                      <ThemedText className="text-xs text-[#60646C]">{biz.type}</ThemedText>
                      {isActive && <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section 2: Branch Management */}
          <View className="px-6 mt-5 gap-3">
            <ThemedText className="text-[18px] font-bold">Operating Branches</ThemedText>
            {branches.length === 0 ? (
              <View className="items-center py-8">
                <ThemedText className="text-[#60646C] text-center">No branches registered for this business.</ThemedText>
                <Pressable
                  className="px-4 py-2 rounded-lg items-center justify-center mt-3 active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => router.push("/(business)/create-branch")}
                >
                  <ThemedText className="text-white font-semibold text-sm">Add First Branch</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View className="gap-3">
                {branches.map((item) => {
                  const isSelected = activeBranch?.id === item.id;
                  return (
                    <View
                      key={item.id}
                      className="rounded-xl border-[1.5px] overflow-hidden"
                      style={[
                        { backgroundColor: colors.backgroundElement, borderColor: "transparent" },
                        isSelected && { borderColor: colors.primary },
                      ]}
                    >
                      <Pressable className="p-4 gap-1 active:opacity-80" onPress={() => handleSelectBranch(item.id)}>
                        <View className="flex-row items-center justify-between">
                          <ThemedText className="text-base font-semibold">{item.name}</ThemedText>
                          {isSelected && (
                            <View className="px-2 py-0.5 rounded" style={{ backgroundColor: colors.primary }}>
                              <ThemedText className="text-white text-[10px] font-semibold">Active</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText className="text-xs text-[#60646C] font-mono">Code: {item.branchCode || "N/A"}</ThemedText>
                        <ThemedText className="text-sm text-[#60646C]">
                          {item.address}, {item.city}
                        </ThemedText>
                        {item.phoneNumber && (
                          <ThemedText className="text-sm text-[#60646C]">Phone: {item.phoneNumber}</ThemedText>
                        )}
                        {(item.telebirrMerchantId || item.cbeBirrMerchantId) && (
                          <View className="flex-row gap-3 mt-1.5">
                            {item.telebirrMerchantId && (
                              <ThemedText className="text-xs text-[#60646C] bg-[#F0F0F3] px-2 py-1 rounded-md">Telebirr: {item.telebirrMerchantId}</ThemedText>
                            )}
                            {item.cbeBirrMerchantId && (
                              <ThemedText className="text-xs text-[#60646C] bg-[#F0F0F3] px-2 py-1 rounded-md">CBE: {item.cbeBirrMerchantId}</ThemedText>
                            )}
                          </View>
                        )}
                      </Pressable>

                      {/* Edit Button */}
                      <Pressable
                        className="border-t border-[#E0E1E6] py-2.5 items-center justify-center active:opacity-70"
                        style={{ borderColor: colors.backgroundSelected }}
                        onPress={() => router.push({ pathname: "/(business)/edit-branch", params: { id: item.id } })}
                      >
                        <ThemedText className="text-[13px] font-semibold" style={{ color: colors.text }}>Manage & Edit</ThemedText>
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
