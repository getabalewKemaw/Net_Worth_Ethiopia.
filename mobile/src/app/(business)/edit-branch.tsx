import React from "react";
import { useEditBranch } from "@/hooks/use-edit-branch";
import { EditBranchUI } from "@/features/business/edit-branch-ui";

export default function EditBranchScreen() {
  const hookProps = useEditBranch();
  return <EditBranchUI hookProps={hookProps} />;
}
