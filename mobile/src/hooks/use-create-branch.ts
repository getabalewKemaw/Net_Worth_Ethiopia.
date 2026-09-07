import { useState } from "react";
import { router } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBusinessStore } from "@/store/business-store";
import { branchSchema } from "@/validations/branch";

type BranchFormInput = z.input<typeof branchSchema>;
type BranchFormOutput = z.output<typeof branchSchema>;

export function useCreateBranch() {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const registerBranch = useBusinessStore((state) => state.registerBranch);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    setValue,
    handleSubmit: rhfHandleSubmit,
    formState: { errors: rhfErrors, isSubmitting },
  } = useForm<BranchFormInput, any, BranchFormOutput>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
      city: "",
      subCityWoreda: "",
      telebirrMerchantId: "",
      cbeBirrMerchantId: "",
    },
  });

  const onSubmit = async (data: BranchFormOutput) => {
    setApiError(null);

    if (!activeBusiness) {
      setApiError("No active business selected");
      return;
    }

    try {
      await registerBranch(activeBusiness.id, data);
      router.replace("/");
    } catch (err: any) {
      setApiError(err.message || "Failed to create branch");
    }
  };

  const formattedErrors: Record<string, string> = {};
  (Object.keys(rhfErrors) as (keyof BranchFormInput)[]).forEach((key) => {
    const err = rhfErrors[key];
    if (err?.message) {
      formattedErrors[key] = err.message as string;
    }
  });

  const values = useWatch({ control }) as Partial<BranchFormInput>;

  return {
    activeBusiness,
    name: values.name || "",
    setName: (val: string) => setValue("name", val, { shouldValidate: true }),
    phoneNumber: values.phoneNumber || "",
    setPhoneNumber: (val: string) => setValue("phoneNumber", val, { shouldValidate: true }),
    address: values.address || "",
    setAddress: (val: string) => setValue("address", val, { shouldValidate: true }),
    city: values.city || "",
    setCity: (val: string) => setValue("city", val, { shouldValidate: true }),
    subCityWoreda: values.subCityWoreda || "",
    setSubCityWoreda: (val: string) => setValue("subCityWoreda", val, { shouldValidate: true }),
    telebirrMerchantId: values.telebirrMerchantId || "",
    setTelebirrMerchantId: (val: string) => setValue("telebirrMerchantId", val, { shouldValidate: true }),
    cbeBirrMerchantId: values.cbeBirrMerchantId || "",
    setCbeBirrMerchantId: (val: string) => setValue("cbeBirrMerchantId", val, { shouldValidate: true }),
    errors: formattedErrors,
    isSubmitting,
    apiError,
    handleSubmit: rhfHandleSubmit(onSubmit),
  };
}
export type UseCreateBranchReturn = ReturnType<typeof useCreateBranch>;
