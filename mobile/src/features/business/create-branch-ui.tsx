import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseCreateBranchReturn } from "@/hooks/use-create-branch";

interface CreateBranchUIProps {
  hookProps: UseCreateBranchReturn;
}

export const CreateBranchUI: React.FC<CreateBranchUIProps> = ({ hookProps }) => {
  const theme = useTheme();

  const {
    activeBusiness,
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View className="mb-2 gap-2">
          <Pressable className="self-start mb-2 active:opacity-70" onPress={() => router.back()}>
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title" className="text-[28px] font-extrabold">Add Branch</ThemedText>
          <ThemedText className="text-sm leading-5" style={{ color: theme.textSecondary }}>
            Register a new operating location for {activeBusiness?.name || "your business"}.
          </ThemedText>
        </View>

        {apiError ? (
          <View className="bg-red-100 p-3 rounded-lg">
            <ThemedText className="text-red-600 text-xs">{apiError}</ThemedText>
          </View>
        ) : null}

        {/* Branch Name */}
        <Input
          label="Branch Name *"
          placeholder="e.g. Bole Medhanialem Branch"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        {/* Branch Phone */}
        <Input
          label="Phone Number (Optional)"
          placeholder="e.g. 0912345678"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          error={errors.phoneNumber}
        />

        {/* Address */}
        <Input
          label="Address *"
          placeholder="e.g. Near Edna Mall, 2nd Floor"
          value={address}
          onChangeText={setAddress}
          error={errors.address}
        />

        {/* City */}
        <Input
          label="City *"
          placeholder="e.g. Addis Ababa"
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />

        {/* Sub-city / Woreda */}
        <Input
          label="Sub-City / Woreda (Optional)"
          placeholder="e.g. Bole Sub-City"
          value={subCityWoreda}
          onChangeText={setSubCityWoreda}
          error={errors.subCityWoreda}
        />

        {/* Payment Configurations */}
        <View className="mt-2 gap-1">
          <ThemedText className="text-base font-semibold">Payment Configuration (Optional)</ThemedText>
          <ThemedText className="text-xs text-[#60646C]">
            Setup Telebirr or CBE Birr merchant IDs to configure payouts.
          </ThemedText>
        </View>

        {/* Telebirr Merchant ID */}
        <Input
          label="Telebirr Merchant ID"
          placeholder="e.g. 102934"
          value={telebirrMerchantId}
          onChangeText={setTelebirrMerchantId}
          error={errors.telebirrMerchantId}
        />

        {/* CBE Birr Merchant ID */}
        <Input
          label="CBE Birr Merchant ID"
          placeholder="e.g. CBEB9283"
          value={cbeBirrMerchantId}
          onChangeText={setCbeBirrMerchantId}
          error={errors.cbeBirrMerchantId}
        />

        {/* Submit */}
        <Button
          title="Add Branch"
          loading={isSubmitting}
          onPress={handleSubmit}
          className="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};
