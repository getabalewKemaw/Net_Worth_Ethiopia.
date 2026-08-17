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

  // New Mutative Actions to keep store fully in sync
  registerBusiness: (input: any) => Promise<void>;
  editBusiness: (id: string, input: any) => Promise<void>;
  registerBranch: (businessId: string, input: any) => Promise<void>;
  editBranch: (id: string, input: any) => Promise<void>;
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
  },

  // Encapsulated mutations in Zustand
  registerBusiness: async (input: any) => {
    set({ isPending: true, error: null });
    try {
      // 1. Create Business Profile
      const biz = await businessService.createBusiness(input);

      // 2. Automatically create default "Main Branch" using business address and phone
      const mainBranch = await branchService.createBranch(biz.id, {
        name: "Main Branch",
        address: input.address,
        city: input.city,
        phoneNumber: input.phoneNumber,
        subCityWoreda: input.subCityWoreda || null,
        telebirrMerchantId: null,
        cbeBirrMerchantId: null,
      });

      // 3. Set active business and its branches
      const businesses = await businessService.fetchBusinesses();
      const branches = await branchService.fetchBranchesByBusinessId(biz.id);
      
      set({
        businesses,
        activeBusiness: biz,
        branches,
        activeBranch: mainBranch,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to register business" });
      throw err;
    } finally {
      set({ isPending: false });
    }
  },

  editBusiness: async (id: string, input: any) => {
    set({ isPending: true, error: null });
    try {
      const updatedBiz = await businessService.updateBusiness(id, input);
      
      // Update in local lists and actives
      const updatedBusinesses = get().businesses.map((b: any) => b.id === id ? updatedBiz : b);
      set({
        businesses: updatedBusinesses,
        activeBusiness: get().activeBusiness?.id === id ? updatedBiz : get().activeBusiness
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to update business" });
      throw err;
    } finally {
      set({ isPending: false });
    }
  },

  registerBranch: async (businessId: string, input: any) => {
    set({ isPending: true, error: null });
    try {
      const branch = await branchService.createBranch(businessId, input);
      const branches = await branchService.fetchBranchesByBusinessId(businessId);
      
      set({
        branches,
        activeBranch: branch
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to register branch" });
      throw err;
    } finally {
      set({ isPending: false });
    }
  },

  editBranch: async (id: string, input: any) => {
    set({ isPending: true, error: null });
    try {
      const updatedBranch = await branchService.updateBranch(id, input);
      
      // Refetch branches to get accurate listing
      const activeBiz = get().activeBusiness;
      if (activeBiz) {
        const branches = await branchService.fetchBranchesByBusinessId(activeBiz.id);
        set({
          branches,
          activeBranch: get().activeBranch?.id === id ? updatedBranch : get().activeBranch
        });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to update branch" });
      throw err;
    } finally {
      set({ isPending: false });
    }
  }
}));
