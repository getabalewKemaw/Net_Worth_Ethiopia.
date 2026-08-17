import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInLeft, FadeInRight, Layout } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/business/step-indicator";
import { CategorySelector } from "@/components/business/category-selector";
import { UseCreateBusinessReturn } from "@/hooks/use-create-business";

interface CreateBusinessUIProps {
  hookProps: UseCreateBusinessReturn;
}

export const CreateBusinessUI: React.FC<CreateBusinessUIProps> = ({ hookProps }) => {
  const theme = useTheme();

  const {
    step,
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
    stepProgress,
    handleNext,
    handleBack,
    handleSubmitAll,
    handleSkipAndRegister,
  } = hookProps;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.titleText}>Register Your Business</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Let's set up your profile to start tracking your finances.
          </ThemedText>
        </View>

        {/* Step Indicator */}
        <StepIndicator step={step} stepProgress={stepProgress} onBack={handleBack} />

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <ThemedText style={styles.errorText}>{apiError}</ThemedText>
          </View>
        ) : null}

        {/* STEP 1: Core Details */}
        {step === 1 ? (
          <Animated.View entering={FadeInLeft.duration(300)} layout={Layout.springify()} style={styles.formSection}>
            <Input
              label="Business Name *"
              placeholder="e.g. Chala Retail Shop"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            {/* Custom Category Selection Grid Component */}
            <CategorySelector selectedType={type} onSelect={setType} error={errors.type} />

            <Input
              label="Phone Number *"
              placeholder="e.g. 0912345678"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              error={errors.phoneNumber}
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

            <Button
              title="Continue"
              onPress={handleNext}
              style={styles.actionBtn}
            />
          </Animated.View>
        ) : (
          /* STEP 2: Optional Registration Details */
          <Animated.View entering={FadeInRight.duration(300)} layout={Layout.springify()} style={styles.formSection}>
            <View style={[styles.noticeBox, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.noticeText, { color: theme.text }]}>
                These legal details are optional and can be skipped if you want to set them up later.
              </ThemedText>
            </View>

            <Input
              label="Email Address (Optional)"
              placeholder="e.g. info@business.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Sub-City / Woreda (Optional)"
              placeholder="e.g. Bole Woreda 03"
              value={subCityWoreda}
              onChangeText={setSubCityWoreda}
              error={errors.subCityWoreda}
            />

            <Input
              label="Description (Optional)"
              placeholder="Tell us about your business operations..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              error={errors.description}
            />

            <Input
              label="TIN (10-digits - Optional)"
              placeholder="e.g. 0012345678"
              keyboardType="numeric"
              value={tin}
              onChangeText={setTin}
              error={errors.tin}
            />

            <Input
              label="Commercial Registration No. (Optional)"
              placeholder="e.g. AA/ADISM/14/706/4464972/2015"
              value={commercialRegistrationNo}
              onChangeText={setCommercialRegistrationNo}
              error={errors.commercialRegistrationNo}
            />

            <Input
              label="Trade License No. (Optional)"
              placeholder="e.g. AA/ADISM/14/706/4464972/2015"
              value={tradeLicenseNo}
              onChangeText={setTradeLicenseNo}
              error={errors.tradeLicenseNo}
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.backBtn, { borderColor: theme.textSecondary }]}
                onPress={handleBack}
              >
                <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Back</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.skipBtn, { backgroundColor: theme.backgroundSelected }]}
                onPress={handleSkipAndRegister}
                disabled={isSubmitting}
              >
                <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Skip & Register</ThemedText>
              </Pressable>
            </View>

            <Button
              title="Register Business"
              loading={isSubmitting}
              onPress={handleSubmitAll}
              style={styles.actionBtn}
            />
          </Animated.View>
        )}
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
  titleText: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  apiErrorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
  },
  formSection: {
    gap: 18,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  noticeBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E1E6",
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    marginTop: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
});
