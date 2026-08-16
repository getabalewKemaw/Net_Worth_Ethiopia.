import { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { branchSchema } from "@/validations/branch";
import { createBranch } from "@/service/branch";
import { useBusinessStore } from "@/store/business-store";

export default function CreateBranchScreen() {
  const theme = useTheme();
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const refreshState = useBusinessStore((state) => state.refreshState);

  // Form State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [subCityWoreda, setSubCityWoreda] = useState("");
  const [telebirrMerchantId, setTelebirrMerchantId] = useState("");
  const [cbeBirrMerchantId, setCbeBirrMerchantId] = useState("");

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrors({});
    setApiError(null);

    if (!activeBusiness) {
      setApiError("No active business selected");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      phoneNumber: phoneNumber || null,
      address,
      city,
      subCityWoreda: subCityWoreda || null,
      telebirrMerchantId: telebirrMerchantId || null,
      cbeBirrMerchantId: cbeBirrMerchantId || null,
    };

    // Client-side Zod validation
    const parsed = branchSchema.safeParse(payload);
    if (!parsed.success) {
      const formattedErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(formattedErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create Branch on API
      await createBranch(activeBusiness.id, parsed.data);

      // Refresh Zustand store to sync branch listing
      await refreshState();

      // Navigate back to Dashboard home
      router.replace("/");
    } catch (err: any) {
      setApiError(err.message || "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title">Add Branch</ThemedText>
          <ThemedText style={styles.subtitle}>
            Register a new operating location for {activeBusiness?.name || "your business"}.
          </ThemedText>
        </View>

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <ThemedText style={styles.errorText}>{apiError}</ThemedText>
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
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Payment Configuration (Optional)</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
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
          style={styles.submitBtn}
        />
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
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
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
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
});
