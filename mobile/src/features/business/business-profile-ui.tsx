import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title">Business Profile</ThemedText>
          <ThemedText style={{ color: theme.textSecondary }}>
            View and manage your core business registration details.
          </ThemedText>
        </View>

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <ThemedText style={styles.errorText}>{apiError}</ThemedText>
          </View>
        ) : null}

        {apiSuccess ? (
          <View style={styles.apiSuccessBox}>
            <ThemedText style={styles.successText}>{apiSuccess}</ThemedText>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <Input
            label="Business Name *"
            placeholder="e.g. Chala Retail Shop"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <View style={styles.typeContainer}>
            <ThemedText style={styles.label}>Business Type *</ThemedText>
            <View style={styles.typeSelectorGrid}>
              {BUSINESS_TYPES.map((t) => {
                const selected = type === t.value;
                return (
                  <Pressable
                    key={t.value}
                    style={[
                      styles.typeBtn,
                      { backgroundColor: theme.backgroundElement },
                      selected ? { backgroundColor: theme.primary } : null,
                    ]}
                    onPress={() => setType(t.value)}
                  >
                    <ThemedText style={[styles.typeBtnText, selected ? { color: "#FFFFFF" } : null]}>
                      {t.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            {errors.type ? <ThemedText style={styles.errorText}>{errors.type}</ThemedText> : null}
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
            style={styles.textArea}
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
            style={styles.saveBtn}
          />
        </View>
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
  formSection: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeContainer: {
    gap: 6,
  },
  typeSelectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    marginTop: 16,
  },
  apiErrorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  apiSuccessBox: {
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "600",
  },
});
