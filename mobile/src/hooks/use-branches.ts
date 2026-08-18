import { useBusinessStore } from "@/store/business-store";
import { router } from "expo-router";

export function useBranches() {
  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const businesses = useBusinessStore((state) => state.businesses);
  const branches = useBusinessStore((state) => state.branches);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const switchBusiness = useBusinessStore((state) => state.switchBusiness);
  const switchBranch = useBusinessStore((state) => state.switchBranch);
  const isPending = useBusinessStore((state) => state.isPending);

  const handleSelectBranch = (branchId: string) => {
    switchBranch(branchId);
    router.replace("/");
  };

  const handleSwitchBusiness = async (bizId: string) => {
    await switchBusiness(bizId);
  };

  return {
    activeBusiness,
    businesses,
    branches,
    activeBranch,
    isPending,
    handleSelectBranch,
    handleSwitchBusiness,
  };
}
export type UseBranchesReturn = ReturnType<typeof useBranches>;
