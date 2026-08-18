import { useState, useEffect } from "react";
import { useBusinessStore } from "@/store/business-store";
import { BUSINESS_TYPES } from "@/constants/business";
import { businessSchema } from "@/validations/business";

export function useBusinessProfile() {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const editBusiness = useBusinessStore((state) => state.editBusiness);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<typeof BUSINESS_TYPES[number]["value"] | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
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
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (activeBusiness) {
      setName(activeBusiness.name || "");
      setType(activeBusiness.type || "");
      setPhoneNumber(activeBusiness.phoneNumber || "");
      setAddress(activeBusiness.address || "");
      setCity(activeBusiness.city || "");
      setEmail(activeBusiness.email || "");
      setSubCityWoreda(activeBusiness.subCityWoreda || "");
      setDescription(activeBusiness.description || "");
      setTin(activeBusiness.tin || "");
      setCommercialRegistrationNo(activeBusiness.commercialRegistrationNo || "");
      setTradeLicenseNo(activeBusiness.tradeLicenseNo || "");
    }
  }, [activeBusiness]);

  const handleSubmit = async () => {
    setErrors({});
    setApiError(null);
    setApiSuccess(null);

    if (!activeBusiness) {
      setApiError("No active business selected");
      return;
    }

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

    // Client-side Zod validation reusing main schema
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

    setIsSubmitting(true);

    try {
      await editBusiness(activeBusiness.id, parsed.data);
      setApiSuccess("Business details updated successfully!");
    } catch (err: any) {
      setApiError(err.message || "Failed to update business profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeBusiness,
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
    apiSuccess,
    handleSubmit,
  };
}
export type UseBusinessProfileReturn = ReturnType<typeof useBusinessProfile>;
