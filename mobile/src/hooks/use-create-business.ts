import { useState } from "react";
import { router } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useBusinessStore } from "@/store/business-store";
import { businessSchema } from "@/validations/business";
import { BUSINESS_TYPES } from "@/constants/business";

type BusinessFormInput = z.input<typeof businessSchema>;
type BusinessFormOutput = z.output<typeof businessSchema>;

const step1Fields: (keyof BusinessFormInput)[] = [
  "name",
  "type",
  "phoneNumber",
  "address",
  "city",
];

export function useCreateBusiness() {
  const registerBusiness = useBusinessStore((state) => state.registerBusiness);

  // Wizard Step
  const [step, setStep] = useState<1 | 2>(1);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reanimated values for progress bar
  const stepProgress = useSharedValue(0.5);

  const {
    control,
    setValue,
    trigger,
    getValues,
    handleSubmit: rhfHandleSubmit,
    formState: { errors: rhfErrors, isSubmitting },
  } = useForm<BusinessFormInput, any, BusinessFormOutput>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      type: "" as any,
      phoneNumber: "",
      address: "",
      city: "",
      email: "",
      subCityWoreda: "",
      description: "",
      tin: "",
      commercialRegistrationNo: "",
      tradeLicenseNo: "",
    },
  });

  const handleNext = async () => {
    setApiError(null);
    const isStep1Valid = await trigger(step1Fields);
    if (isStep1Valid) {
      stepProgress.value = withSpring(1, { damping: 15 });
      setStep(2);
    }
  };

  const handleBack = () => {
    stepProgress.value = withSpring(0.5, { damping: 15 });
    setStep(1);
  };

  const performRegistration = async (finalData: BusinessFormOutput) => {
    setApiError(null);
    try {
      await registerBusiness(finalData);
      router.replace("/");
    } catch (err: any) {
      setApiError(err.message || "Failed to create business");
    }
  };

  const handleSubmitAll = rhfHandleSubmit(performRegistration);

  const handleSkipAndRegister = async () => {
    const isStep1Valid = await trigger(step1Fields);
    if (!isStep1Valid) return;

    const values = getValues();
    const payload: BusinessFormOutput = {
      name: values.name,
      type: values.type as any,
      phoneNumber: values.phoneNumber,
      address: values.address,
      city: values.city,
      email: null,
      subCityWoreda: null,
      description: null,
      tin: null,
      commercialRegistrationNo: null,
      tradeLicenseNo: null,
    };

    await performRegistration(payload);
  };

  const formattedErrors: Record<string, string> = {};
  (Object.keys(rhfErrors) as (keyof BusinessFormInput)[]).forEach((key) => {
    const err = rhfErrors[key];
    if (err?.message) {
      formattedErrors[key] = err.message as string;
    }
  });

  const values = useWatch({ control }) as Partial<BusinessFormInput>;

  return {
    step,
    name: values.name || "",
    setName: (val: string) => setValue("name", val, { shouldValidate: true }),
    type: values.type || "",
    setType: (val: typeof BUSINESS_TYPES[number]["value"] | "") => setValue("type", val as any, { shouldValidate: true }),
    phoneNumber: values.phoneNumber || "",
    setPhoneNumber: (val: string) => setValue("phoneNumber", val, { shouldValidate: true }),
    address: values.address || "",
    setAddress: (val: string) => setValue("address", val, { shouldValidate: true }),
    city: values.city || "",
    setCity: (val: string) => setValue("city", val, { shouldValidate: true }),
    email: values.email || "",
    setEmail: (val: string) => setValue("email", val, { shouldValidate: true }),
    subCityWoreda: values.subCityWoreda || "",
    setSubCityWoreda: (val: string) => setValue("subCityWoreda", val, { shouldValidate: true }),
    description: values.description || "",
    setDescription: (val: string) => setValue("description", val, { shouldValidate: true }),
    tin: values.tin || "",
    setTin: (val: string) => setValue("tin", val, { shouldValidate: true }),
    commercialRegistrationNo: values.commercialRegistrationNo || "",
    setCommercialRegistrationNo: (val: string) => setValue("commercialRegistrationNo", val, { shouldValidate: true }),
    tradeLicenseNo: values.tradeLicenseNo || "",
    setTradeLicenseNo: (val: string) => setValue("tradeLicenseNo", val, { shouldValidate: true }),
    errors: formattedErrors,
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
