import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBusinessStore } from "@/store/business-store";
import { BUSINESS_TYPES } from "@/constants/business";
import { businessSchema } from "@/validations/business";

type BusinessFormInput = z.input<typeof businessSchema>;
type BusinessFormOutput = z.output<typeof businessSchema>;

export function useBusinessProfile() {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const editBusiness = useBusinessStore((state) => state.editBusiness);

  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    control,
    setValue,
    reset,
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

  useEffect(() => {
    if (activeBusiness) {
      reset({
        name: activeBusiness.name || "",
        type: (activeBusiness.type as any) || "",
        phoneNumber: activeBusiness.phoneNumber || "",
        address: activeBusiness.address || "",
        city: activeBusiness.city || "",
        email: activeBusiness.email || "",
        subCityWoreda: activeBusiness.subCityWoreda || "",
        description: activeBusiness.description || "",
        tin: activeBusiness.tin || "",
        commercialRegistrationNo: activeBusiness.commercialRegistrationNo || "",
        tradeLicenseNo: activeBusiness.tradeLicenseNo || "",
      });
    }
  }, [activeBusiness, reset]);

  const onSubmit = async (data: BusinessFormOutput) => {
    setApiError(null);
    setApiSuccess(null);

    if (!activeBusiness) {
      setApiError("No active business selected");
      return;
    }

    try {
      await editBusiness(activeBusiness.id, data);
      setApiSuccess("Business details updated successfully!");
    } catch (err: any) {
      setApiError(err.message || "Failed to update business profile");
    }
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
    activeBusiness,
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
    apiSuccess,
    handleSubmit: rhfHandleSubmit(onSubmit),
  };
}
export type UseBusinessProfileReturn = ReturnType<typeof useBusinessProfile>;
