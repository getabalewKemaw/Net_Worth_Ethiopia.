import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseEditBranchReturn } from "@/hooks/use-edit-branch";

interface EditBranchUIProps {
  hookProps: UseEditBranchReturn;
}

export const EditBranchUI: React.FC<EditBranchUIProps> = ({ hookProps }) => {
  const theme = useTheme();

  const {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title">Edit Branch</ThemedText>
          <ThemedText style={{ color: theme.textSecondary }}>
            Update operating location and payment configurations.
          </ThemedText>
        </View>

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <ThemedText style={styles.errorText}>{apiError}</ThemedText>
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

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Payment Configuration (Optional)</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
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
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  apiErrorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
  sectionHeader: {
    marginTop: 8,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#60646C",
  },
  submitBtn: {
    marginTop: 16,
  },
});
