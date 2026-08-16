import { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { businessSchema } from "@/validations/business";
import { createBusiness } from "@/service/business";
import { createBranch } from "@/service/branch";
import { useBusinessStore } from "@/store/business-store";

const businessTypes = ["Retail", "Wholesale", "Restaurant", "Service", "Manufacturing", "Other"] as const;

// Validator schema specifically for Step 1
const step1Schema = z.object({
  name: z.string().trim().min(1, "Business name is required"),
  type: z.enum(businessTypes),
  phoneNumber: z.string().trim().regex(/^(\+251|251|0)?[1-9]\d{8}$/, "Invalid Ethiopian phone number"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
});

export default function CreateBusinessScreen() {
  const theme = useTheme();
  const refreshState = useBusinessStore((state) => state.refreshState);

  // Wizard Step
  const [step, setStep] = useState<1 | 2>(1);

  // Form State - Step 1 (Required)
  const [name, setName] = useState("");
  const [type, setType] = useState<typeof businessTypes[number] | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Form State - Step 2 (Optional)
  const [email, setEmail] = useState("");
  const [subCityWoreda, setSubCityWoreda] = useState("");
  const [description, setDescription] = useState("");
  const [tin, setTin] = useState("");
  const [commercialRegistrationNo, setCommercialRegistrationNo] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Handle step transitions
  const handleNext = () => {
    setErrors({});
    setApiError(null);

    const payload = {
      name,
      type: type as any,
      phoneNumber,
      address,
      city,
    };

    const parsed = step1Schema.safeParse(payload);
    if (!parsed.success) {
      const formattedErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setStep(2);
  };

  // Perform backend submit
  const performRegistration = async (finalData: any) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // 1. Create Business Profile
      const biz = await createBusiness(finalData);

      // 2. Automatically create default "Main Branch" using business address and phone
      await createBranch(biz.id, {
        name: "Main Branch",
        address: finalData.address,
        city: finalData.city,
        phoneNumber: finalData.phoneNumber,
        subCityWoreda: finalData.subCityWoreda || null,
        telebirrMerchantId: null,
        cbeBirrMerchantId: null,
      });

      // 3. Refresh Zustand store to pull active state
      await refreshState();

      // 4. Navigate back to Dashboard home
      router.replace("/");
    } catch (err: any) {
      setApiError(err.message || "Failed to create business");
      setIsSubmitting(false);
    }
  };

  // Validate Step 2 and Submit
  const handleSubmitAll = async () => {
    setErrors({});
    setApiError(null);

    const payload = {
      name,
      type: type as any,
      phoneNumber,
      email: email || null,
      address,
      city,
      subCityWoreda: subCityWoreda || null,
      description: description || null,
      tin: tin || null,
      commercialRegistrationNo: commercialRegistrationNo || null,
      tradeLicenseNo: tradeLicenseNo || null,
    };

    const parsed = businessSchema.safeParse(payload);
    if (!parsed.success) {
      const formattedErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    await performRegistration(parsed.data);
  };

  // Skip Step 2 entirely and submit
  const handleSkipAndRegister = async () => {
    const payload = {
      name,
      type: type as any,
      phoneNumber,
      email: null,
      address,
      city,
      subCityWoreda: null,
      description: null,
      tin: null,
      commercialRegistrationNo: null,
      tradeLicenseNo: null,
    };

    await performRegistration(payload);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Register Your Business</ThemedText>
          <ThemedText style={styles.subtitle}>Let's set up your profile to start tracking your finances.</ThemedText>
        </View>

        {/* Step Indicator Progress Bar */}
        <View style={styles.indicatorContainer}>
          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.stepCircleText}>1</ThemedText>
            </View>
            <ThemedText style={[styles.stepLabel, { color: theme.text }]}>Core Profile</ThemedText>
          </View>

          <View style={[styles.stepLine, { backgroundColor: step === 2 ? theme.primary : theme.backgroundSelected }]} />

          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, { backgroundColor: step === 2 ? theme.primary : theme.backgroundSelected }]}>
              <ThemedText style={[styles.stepCircleText, step === 1 && { color: theme.textSecondary }]}>2</ThemedText>
            </View>
            <ThemedText style={[styles.stepLabel, { color: step === 2 ? theme.text : theme.textSecondary }]}>
              Legal Info
            </ThemedText>
          </View>
        </View>

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <ThemedText style={styles.errorText}>{apiError}</ThemedText>
          </View>
        ) : null}

        {/* STEP 1: Core Details */}
        {step === 1 ? (
          <View style={styles.formSection}>
            <Input
              label="Business Name *"
              placeholder="e.g. Chala Retail Shop"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            {/* Business Type Grid */}
            <View style={styles.typeContainer}>
              <ThemedText style={styles.label}>Business Type *</ThemedText>
              <View style={styles.typeSelectorGrid}>
                {businessTypes.map((t) => {
                  const selected = type === t;
                  return (
                    <Pressable
                      key={t}
                      style={[
                        styles.typeBtn,
                        { backgroundColor: theme.backgroundElement },
                        selected ? { backgroundColor: theme.primary } : null,
                      ]}
                      onPress={() => setType(t)}
                    >
                      <ThemedText style={[styles.typeBtnText, selected ? { color: "#FFFFFF" } : null]}>
                        {t}
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
          </View>
        ) : (
          /* STEP 2: Optional Registration Details */
          <View style={styles.formSection}>
            <View style={styles.noticeBox}>
              <ThemedText style={styles.noticeText}>
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
                onPress={() => setStep(1)}
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  stepWrapper: {
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 12,
    marginBottom: 18,
  },
  apiErrorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
  noticeBox: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#1E40AF",
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
    borderWidth: 1,
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
