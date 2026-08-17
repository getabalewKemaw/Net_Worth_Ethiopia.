import { useState } from "react";
import { router } from "expo-router";
import { useBusinessStore } from "@/store/business-store";
import { branchSchema } from "@/validations/branch";

export function useCreateBranch() {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const registerBranch = useBusinessStore((state) => state.registerBranch);

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
      await registerBranch(activeBusiness.id, parsed.data);
      router.replace("/");
    } catch (err: any) {
      setApiError(err.message || "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeBusiness,
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
export type UseCreateBranchReturn = ReturnType<typeof useCreateBranch>;
