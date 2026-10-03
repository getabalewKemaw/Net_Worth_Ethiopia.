import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BUSINESS_TYPES } from "@/constants/business";
import { UseBusinessProfileReturn } from "@/hooks/use-business-profile";

interface BusinessProfileUIProps {
  hookProps: UseBusinessProfileReturn;
}

export const BusinessProfileUI: React.FC<BusinessProfileUIProps> = ({ hookProps }) => {
  const theme = useTheme();

  const {
    name,
    setName,
    type,
    setType,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    city,
    setCity,
    email,
    setEmail,
    subCityWoreda,
    setSubCityWoreda,
    description,
    setDescription,
    tin,
    setTin,
    commercialRegistrationNo,
    setCommercialRegistrationNo,
    tradeLicenseNo,
    setTradeLicenseNo,
    errors,
    isSubmitting,
    apiError,
    apiSuccess,
    handleSubmit,
  } = hookProps;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-2 gap-2">
          <Pressable className="self-start mb-2 active:opacity-70" onPress={() => router.back()}>
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title" className="text-[28px] font-extrabold">Business Profile</ThemedText>
          <ThemedText style={{ color: theme.textSecondary }}>
            View and manage your core business registration details.
          </ThemedText>
        </View>

        {apiError ? (
          <View className="bg-red-100 p-3 rounded-lg">
            <ThemedText className="text-red-600 text-sm">{apiError}</ThemedText>
          </View>
        ) : null}

        {apiSuccess ? (
          <View className="bg-brand-soft p-3 rounded-lg">
            <ThemedText className="text-brand-dark text-sm font-semibold">{apiSuccess}</ThemedText>
          </View>
        ) : null}

        <View className="gap-4">
          <Input
            label="Business Name *"
            placeholder="e.g. Chala Retail Shop"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <View className="gap-1.5">
            <ThemedText className="text-sm font-semibold">Business Type *</ThemedText>
            <View className="flex-row flex-wrap gap-2">
              {BUSINESS_TYPES.map((t) => {
                const selected = type === t.value;
                return (
                  <Pressable
                    key={t.value}
                    className="px-4 py-2.5 rounded-[20px] active:opacity-80"
                    style={[
                      { backgroundColor: theme.backgroundElement },
                      selected ? { backgroundColor: theme.primary } : null,
                    ]}
                    onPress={() => setType(t.value)}
                  >
                    <ThemedText className="text-sm font-medium" style={selected ? { color: "#FFFFFF" } : {}}>
                      {t.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            {errors.type ? <ThemedText className="text-red-600 text-sm">{errors.type}</ThemedText> : null}
          </View>

          <Input
            label="Phone Number *"
            placeholder="e.g. 0912345678"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            error={errors.phoneNumber}
          />

          <Input
            label="Email Address"
            placeholder="e.g. info@business.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input
            label="Address *"
            placeholder="e.g. Bole Road, Next to Mall"
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
            label="Sub-City / Woreda"
            placeholder="e.g. Bole Woreda 03"
            value={subCityWoreda}
            onChangeText={setSubCityWoreda}
            error={errors.subCityWoreda}
          />

          <Input
            label="Description"
            placeholder="Tell us about your business operations..."
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
            value={description}
            onChangeText={setDescription}
            error={errors.description}
          />

          <Input
            label="TIN (10-digits)"
            placeholder="e.g. 0012345678"
            keyboardType="numeric"
            value={tin}
            onChangeText={setTin}
            error={errors.tin}
          />

          <Input
            label="Commercial Registration No."
            placeholder="e.g. AA/ADISM/14/706/4464972/2015"
            value={commercialRegistrationNo}
            onChangeText={setCommercialRegistrationNo}
            error={errors.commercialRegistrationNo}
          />

          <Input
            label="Trade License No."
            placeholder="e.g. AA/ADISM/14/706/4464972/2015"
            value={tradeLicenseNo}
            onChangeText={setTradeLicenseNo}
            error={errors.tradeLicenseNo}
          />

          <Button
            title="Save Changes"
            loading={isSubmitting}
            onPress={handleSubmit}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
