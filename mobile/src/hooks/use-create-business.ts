import { useState } from "react";
import { router } from "expo-router";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useBusinessStore } from "@/store/business-store";
import { businessSchema } from "@/validations/business";
import { BUSINESS_TYPES } from "@/constants/business";

const step1Schema = businessSchema.pick({
  name: true,
  type: true,
  phoneNumber: true,
  address: true,
  city: true,
});

export function useCreateBusiness() {
  const registerBusiness = useBusinessStore((state) => state.registerBusiness);

  // Wizard Step
  const [step, setStep] = useState<1 | 2>(1);

  // Form State - Step 1 (Required)
  const [name, setName] = useState("");
  const [type, setType] = useState<typeof BUSINESS_TYPES[number]["value"] | "">("");
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

  // Reanimated values for progress bar
  const stepProgress = useSharedValue(0.5);

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

    stepProgress.value = withSpring(1, { damping: 15 });
    setStep(2);
  };

  const handleBack = () => {
    stepProgress.value = withSpring(0.5, { damping: 15 });
    setStep(1);
  };

  const performRegistration = async (finalData: any) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await registerBusiness(finalData);
      router.replace("/");
    } catch (err: any) {
      setApiError(err.message || "Failed to create business");
      setIsSubmitting(false);
    }
  };

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

  return {
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
  };
}
export type UseCreateBusinessReturn = ReturnType<typeof useCreateBusiness>;
