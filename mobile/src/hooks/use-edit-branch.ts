import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
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
    control,
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
  (Object.keys(rhfErrors) as (keyof BranchFormInput)[]).forEach((key) => {
    const err = rhfErrors[key];
    if (err?.message) {
      formattedErrors[key] = err.message as string;
    }
  });

  const values = useWatch({ control }) as Partial<BranchFormInput>;

  return {
    id,
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
export type UseEditBranchReturn = ReturnType<typeof useEditBranch>;
