import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseEditBranchReturn } from "@/hooks/use-edit-branch";
import { useStaffStore } from "@/store/staff-store";
import { AssignStaffModal } from "@/components/business/assign-staff-modal";
import type { StaffAssignment } from "@/types/staff";

interface EditBranchUIProps {
  hookProps: UseEditBranchReturn;
}

export const EditBranchUI: React.FC<EditBranchUIProps> = ({ hookProps }) => {
  const theme = useTheme();

  const {
    id,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    city,
    setCity,
    subCityWoreda,
    setSubCityWoreda,
    telebirrMerchantId,
    setTelebirrMerchantId,
    cbeBirrMerchantId,
    setCbeBirrMerchantId,
    errors,
    isSubmitting,
    apiError,
    handleSubmit,
  } = hookProps;

  const branchStaffList = useStaffStore((s) => s.branchStaffList);
  const loadBranchStaff = useStaffStore((s) => s.loadBranchStaff);
  const revokeStaff = useStaffStore((s) => s.revokeStaff);

  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoadingStaff(true);
      loadBranchStaff(id).finally(() => setIsLoadingStaff(false));
    }
  }, [id, loadBranchStaff]);

  const handleRevokeStaff = (staff: StaffAssignment) => {
    Alert.alert(
      "Revoke Staff Access",
      `Are you sure you want to remove ${staff.name || staff.email} from ${name || "this branch"}? They will no longer be authorized to record sales, expenses, or debt settlements for this location.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (id) {
              try {
                await revokeStaff(id, staff.id);
                Alert.alert("Access Revoked", `${staff.email} has been removed from this branch.`);
              } catch (err: any) {
                Alert.alert("Revocation Failed", err.message || "Could not revoke staff access.");
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View className="mb-2 gap-2">
          <Pressable className="self-start mb-2 active:opacity-70" onPress={() => router.back()}>
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title" className="text-[28px] font-extrabold">Edit Branch</ThemedText>
          <ThemedText style={{ color: theme.textSecondary }}>
            Update operating location, authorized staff, and payment configurations.
          </ThemedText>
        </View>

        {apiError ? (
          <View className="bg-red-100 p-3 rounded-lg">
            <ThemedText className="text-red-600 text-xs">{apiError}</ThemedText>
          </View>
        ) : null}

        <Input
          label="Branch Name *"
          placeholder="e.g. Bole Medhanialem Branch"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <Input
          label="Phone Number (Optional)"
          placeholder="e.g. 0912345678"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          error={errors.phoneNumber}
        />

        <Input
          label="Address *"
          placeholder="e.g. Near Edna Mall, 2nd Floor"
          value={address}
          onChangeText={setAddress}
          error={errors.address}
        />

        <Input
          label="City *"
          placeholder="e.g. Addis Ababa"
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />

        <Input
          label="Sub-City / Woreda (Optional)"
          placeholder="e.g. Bole Sub-City"
          value={subCityWoreda}
          onChangeText={setSubCityWoreda}
          error={errors.subCityWoreda}
        />

        {/* Assigned Counter Staff Section */}
        <View className="mt-2 gap-2">
          <View className="flex-row items-center justify-between">
            <ThemedText className="text-base font-semibold">Assigned Counter Staff</ThemedText>
            {id ? (
              <Pressable
                onPress={() => setShowAssignModal(true)}
                className="bg-emerald-600/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg active:opacity-75"
              >
                <ThemedText className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  + Assign Staff
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
          <ThemedText className="text-xs text-[#60646C]">
            Sales cashiers authorized to operate this branch counter and receive Dube payments.
          </ThemedText>

          {isLoadingStaff ? (
            <View className="p-4 items-center justify-center">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : branchStaffList.length === 0 ? (
            <View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl items-center justify-center">
              <ThemedText className="text-xs text-[#60646C] text-center">
                No staff assigned yet. Tap &quot;+ Assign Staff&quot; to authorize a sales cashier by email.
              </ThemedText>
            </View>
          ) : (
            <View className="gap-2">
              {branchStaffList.map((staff) => (
                <View
                  key={staff.id}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-1.5">
                      <ThemedText className="text-sm font-bold">
                        {staff.name || "Sales Cashier"}
                      </ThemedText>
                      <View
                        className={`px-1.5 py-0.5 rounded ${
                          staff.status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-950/60"
                            : "bg-amber-100 dark:bg-amber-950/60"
                        }`}
                      >
                        <ThemedText
                          className={`text-[10px] font-bold ${
                            staff.status === "active"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {staff.status === "active" ? "✓ Active" : "⏳ Pending"}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText className="text-xs text-[#60646C] mt-0.5">
                      {staff.email}
                    </ThemedText>
                    <ThemedText className="text-[10px] text-[#60646C] mt-0.5">
                      Role: {staff.role === "sales" ? "Counter Sales & POS" : staff.role}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => handleRevokeStaff(staff)}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 active:opacity-75"
                  >
                    <ThemedText className="text-xs font-bold text-red-600 dark:text-red-400">
                      Remove
                    </ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-2 gap-1">
          <ThemedText className="text-base font-semibold">Payment Configuration (Optional)</ThemedText>
          <ThemedText className="text-xs text-[#60646C]">
            Setup Telebirr or CBE Birr merchant IDs to configure payouts.
          </ThemedText>
        </View>

        <Input
          label="Telebirr Merchant ID"
          placeholder="e.g. 102934"
          value={telebirrMerchantId}
          onChangeText={setTelebirrMerchantId}
          error={errors.telebirrMerchantId}
        />

        <Input
          label="CBE Birr Merchant ID"
          placeholder="e.g. CBEB9283"
          value={cbeBirrMerchantId}
          onChangeText={setCbeBirrMerchantId}
          error={errors.cbeBirrMerchantId}
        />

        <Button
          title="Save Changes"
          loading={isSubmitting}
          onPress={handleSubmit}
          className="mt-4"
        />
      </ScrollView>

      {/* Assign Staff Modal */}
      {id ? (
        <AssignStaffModal
          visible={showAssignModal}
          branchId={id}
          branchName={name}
          existingStaff={branchStaffList}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            if (id) {
              loadBranchStaff(id);
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  );
};

