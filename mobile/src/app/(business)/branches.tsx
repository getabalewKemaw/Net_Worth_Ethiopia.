import { useBranches } from "@/hooks/use-branches";
import { BranchesUI } from "@/features/business/branches-ui";

export default function BranchesScreen() {
  const hookProps = useBranches();
  return <BranchesUI hookProps={hookProps} />;
}
