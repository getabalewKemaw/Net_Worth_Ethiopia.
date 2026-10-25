import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
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
        <View style={staffStyles.section}>
          <View style={staffStyles.headerRow}>
            <ThemedText style={staffStyles.sectionTitle}>Assigned Counter Staff</ThemedText>
            {id ? (
              <Pressable
                onPress={() => setShowAssignModal(true)}
                style={staffStyles.assignBtn}
              >
                <ThemedText style={staffStyles.assignBtnText}>
                  + Assign Staff
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
          <ThemedText style={staffStyles.sectionSubtitle}>
            Sales cashiers authorized to operate this branch counter and receive Dube payments.
          </ThemedText>

          {isLoadingStaff ? (
            <View style={staffStyles.loadingContainer}>
              <ActivityIndicator size="small" color="#065F46" />
            </View>
          ) : branchStaffList.length === 0 ? (
            <View style={staffStyles.emptyContainer}>
              <ThemedText style={staffStyles.emptyText}>
                No staff assigned yet. Tap &quot;+ Assign Staff&quot; to authorize a sales cashier by email.
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {branchStaffList.map((staff) => (
                <View
                  key={staff.id}
                  style={staffStyles.staffCard}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={staffStyles.staffTitleRow}>
                      <ThemedText style={staffStyles.staffName}>
                        {staff.name || "Sales Cashier"}
                      </ThemedText>
                      <View
                        style={[
                          staffStyles.statusBadge,
                          staff.status === "active"
                            ? staffStyles.statusBadgeActive
                            : staffStyles.statusBadgePending,
                        ]}
                      >
                        <ThemedText
                          style={[
                            staffStyles.statusBadgeText,
                            {
                              color: staff.status === "active" ? "#065F46" : "#92400E",
                            },
                          ]}
                        >
                          {staff.status === "active" ? "✓ Active" : "⏳ Pending"}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={staffStyles.staffEmail}>
                      {staff.email}
                    </ThemedText>
                    <ThemedText style={staffStyles.staffRole}>
                      Role: {staff.role === "sales" ? "Counter Sales & POS" : staff.role}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => handleRevokeStaff(staff)}
                    style={staffStyles.removeBtn}
                  >
                    <ThemedText style={staffStyles.removeBtnText}>
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

const staffStyles = StyleSheet.create({
  section: {
    marginTop: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#60646C',
  },
  assignBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  assignBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#60646C',
    textAlign: 'center',
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  staffTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  staffEmail: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 2,
  },
  staffRole: {
    fontSize: 10,
    color: '#60646C',
    marginTop: 2,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});

