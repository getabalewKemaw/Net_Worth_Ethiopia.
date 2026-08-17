import React from "react";
import { useCreateBusiness } from "@/hooks/use-create-business";
import { CreateBusinessUI } from "@/features/business/create-business-ui";

export default function CreateBusinessScreen() {
  const hookProps = useCreateBusiness();
  return <CreateBusinessUI hookProps={hookProps} />;
}
