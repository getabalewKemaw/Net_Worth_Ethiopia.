import React from "react";
import { View, ScrollView, Pressable } from "react-native";
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-2 gap-2">
          <ThemedText type="title" className="text-[28px] font-extrabold">Register Your Business</ThemedText>
          <ThemedText className="text-sm leading-5" style={{ color: theme.textSecondary }}>
            Let's set up your profile to start tracking your finances.
          </ThemedText>
        </View>

        {/* Step Indicator */}
        <StepIndicator step={step} stepProgress={stepProgress} onBack={handleBack} />

        {apiError ? (
          <View className="bg-red-100 p-3 rounded-lg">
            <ThemedText className="text-red-600 text-xs">{apiError}</ThemedText>
          </View>
        ) : null}

        {/* STEP 1: Core Details */}
        {step === 1 ? (
          <Animated.View entering={FadeInLeft.duration(300)} layout={Layout.springify()} className="gap-[18px]">
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
              className="mt-2"
            />
          </Animated.View>
        ) : (
          /* STEP 2: Optional Registration Details */
          <Animated.View entering={FadeInRight.duration(300)} layout={Layout.springify()} className="gap-[18px]">
            <View className="p-3.5 rounded-[10px] border border-[#E0E1E6]" style={{ backgroundColor: theme.backgroundSelected }}>
              <ThemedText className="text-[13px] leading-[18px]" style={{ color: theme.text }}>
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
              style={{ minHeight: 80, textAlignVertical: "top" }}
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

            <View className="flex-row gap-3 mt-2">
              <Pressable
                className="flex-1 py-3.5 rounded-xl border-[1.5px] items-center justify-center active:opacity-70"
                style={{ borderColor: theme.textSecondary }}
                onPress={handleBack}
              >
                <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Back</ThemedText>
              </Pressable>

              <Pressable
                className="flex-1 py-3.5 rounded-xl items-center justify-center active:opacity-70"
                style={{ backgroundColor: theme.backgroundSelected }}
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
              className="mt-2"
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
