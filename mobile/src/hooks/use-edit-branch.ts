import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBusinessStore } from "@/store/business-store";
import { branchSchema } from "@/validations/branch";

type BranchFormInput = z.input<typeof branchSchema>;
type BranchFormOutput = z.output<typeof branchSchema>;

export function useEditBranch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const branches = useBusinessStore((state) => state.branches);
  const editBranch = useBusinessStore((state) => state.editBranch);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    watch,
    setValue,
    reset,
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

  useEffect(() => {
    const branch = branches.find((b) => b.id === id);
    if (branch) {
      reset({
        name: branch.name || "",
        phoneNumber: branch.phoneNumber || "",
        address: branch.address || "",
        city: branch.city || "",
        subCityWoreda: branch.subCityWoreda || "",
        telebirrMerchantId: branch.telebirrMerchantId || "",
        cbeBirrMerchantId: branch.cbeBirrMerchantId || "",
      });
    }
  }, [id, branches, reset]);

  const onSubmit = async (data: BranchFormOutput) => {
    setApiError(null);

    if (!id) {
      setApiError("No branch selected");
      return;
    }

    try {
      await editBranch(id, data);
      router.back();
    } catch (err: any) {
      setApiError(err.message || "Failed to update branch");
    }
  };

  const formattedErrors: Record<string, string> = {};
  (Object.keys(rhfErrors) as Array<keyof BranchFormInput>).forEach((key) => {
    const err = rhfErrors[key];
    if (err?.message) {
      formattedErrors[key] = err.message as string;
    }
  });

  return {
    id,
    name: watch("name") || "",
    setName: (val: string) => setValue("name", val, { shouldValidate: true }),
    phoneNumber: watch("phoneNumber") || "",
    setPhoneNumber: (val: string) => setValue("phoneNumber", val, { shouldValidate: true }),
    address: watch("address") || "",
    setAddress: (val: string) => setValue("address", val, { shouldValidate: true }),
    city: watch("city") || "",
    setCity: (val: string) => setValue("city", val, { shouldValidate: true }),
    subCityWoreda: watch("subCityWoreda") || "",
    setSubCityWoreda: (val: string) => setValue("subCityWoreda", val, { shouldValidate: true }),
    telebirrMerchantId: watch("telebirrMerchantId") || "",
    setTelebirrMerchantId: (val: string) => setValue("telebirrMerchantId", val, { shouldValidate: true }),
    cbeBirrMerchantId: watch("cbeBirrMerchantId") || "",
    setCbeBirrMerchantId: (val: string) => setValue("cbeBirrMerchantId", val, { shouldValidate: true }),
    errors: formattedErrors,
    isSubmitting,
    apiError,
    handleSubmit: rhfHandleSubmit(onSubmit),
  };
}
export type UseEditBranchReturn = ReturnType<typeof useEditBranch>;
