import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useBusinessStore } from "@/store/business-store";
import { branchSchema } from "@/validations/branch";

export function useEditBranch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const branches = useBusinessStore((state) => state.branches);
  const editBranch = useBusinessStore((state) => state.editBranch);

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

  useEffect(() => {
    const branch = branches.find((b) => b.id === id);
    if (branch) {
      setName(branch.name || "");
      setPhoneNumber(branch.phoneNumber || "");
      setAddress(branch.address || "");
      setCity(branch.city || "");
      setSubCityWoreda(branch.subCityWoreda || "");
      setTelebirrMerchantId(branch.telebirrMerchantId || "");
      setCbeBirrMerchantId(branch.cbeBirrMerchantId || "");
    }
  }, [id, branches]);

  const handleSubmit = async () => {
    setErrors({});
    setApiError(null);

    if (!id) {
      setApiError("No branch selected");
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
      await editBranch(id, parsed.data);
      router.back();
    } catch (err: any) {
      setApiError(err.message || "Failed to update branch");
      setIsSubmitting(false);
    }
  };

  return {
    id,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    city,
    setCity,
    subCityWoreda,
    setSubCityWoreda,
    telebirrMerchantId,
    setTelebirrMerchantId,
    cbeBirrMerchantId,
    setCbeBirrMerchantId,
    errors,
    isSubmitting,
    apiError,
    handleSubmit,
  };
}
export type UseEditBranchReturn = ReturnType<typeof useEditBranch>;
