import React from "react";
import { useCreateBranch } from "@/hooks/use-create-branch";
import { CreateBranchUI } from "@/features/business/create-branch-ui";

export default function CreateBranchScreen() {
  const hookProps = useCreateBranch();
  return <CreateBranchUI hookProps={hookProps} />;
}
