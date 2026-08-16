import { create } from "zustand";
import * as businessService from "../service/business";
import * as branchService from "../service/branch";

interface BusinessState {
  businesses: any[];
  branches: any[];
  activeBusiness: any | null;
  activeBranch: any | null;
  isPending: boolean;
  error: string | null;
  
  refreshState: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  switchBranch: (branchId: string) => void;
  loadInitialState: () => Promise<void>;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  branches: [],
  activeBusiness: null,
  activeBranch: null,
  isPending: false,
  error: null,

  refreshState: async () => {
    set({ isPending: true, error: null });
    try {
      const businesses = await businessService.fetchBusinesses();
      set({ businesses });
      
      let activeBiz = get().activeBusiness;
      if (businesses.length > 0) {
        if (!activeBiz || !businesses.some((b: any) => b.id === activeBiz.id)) {
          activeBiz = businesses[0];
          set({ activeBusiness: activeBiz });
        }
        
        const branches = await branchService.fetchBranchesByBusinessId(activeBiz.id);
        set({ branches });
        
        let activeBr = get().activeBranch;
        if (branches.length > 0) {
          if (!activeBr || !branches.some((b: any) => b.id === activeBr.id)) {
            activeBr = branches[0];
            set({ activeBranch: activeBr });
          }
        } else {
          set({ activeBranch: null });
        }
      } else {
        set({ activeBusiness: null, branches: [], activeBranch: null });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to sync state" });
    } finally {
      set({ isPending: false });
    }
  },

  switchBusiness: async (businessId: string) => {
    const biz = get().businesses.find((b: any) => b.id === businessId);
    if (!biz) return;
    
    set({ activeBusiness: biz, isPending: true, error: null });
    try {
      const branches = await branchService.fetchBranchesByBusinessId(businessId);
      set({ branches });
      const activeBr = branches.length > 0 ? branches[0] : null;
      set({ activeBranch: activeBr });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch branches" });
    } finally {
      set({ isPending: false });
    }
  },

  switchBranch: (branchId: string) => {
    const br = get().branches.find((b: any) => b.id === branchId);
    if (br) {
      set({ activeBranch: br });
    }
  },

  loadInitialState: async () => {
    await get().refreshState();
  }
}));
