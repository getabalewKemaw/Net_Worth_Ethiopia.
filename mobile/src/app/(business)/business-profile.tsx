import React from "react";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { BusinessProfileUI } from "@/features/business/business-profile-ui";

export default function BusinessProfileScreen() {
  const hookProps = useBusinessProfile();
  return <BusinessProfileUI hookProps={hookProps} />;
}
