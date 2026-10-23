import { create } from "zustand";
import { dossierService } from "@/services/dossier.service";
import type { VerifiedDossierData } from "@/types/mfo";

interface DossierState {
  dossier: VerifiedDossierData | null;
  isLoading: boolean;
  error: string | null;
  fetchDossier: (token: string) => Promise<void>;
  reset: () => void;
}

export const useDossierStore = create<DossierState>((set) => ({
  dossier: null,
  isLoading: false,
  error: null,

  fetchDossier: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await dossierService.getVerifiedDossier(token);
      set({ dossier: data, isLoading: false, error: null });
    } catch (err: any) {
      set({
        dossier: null,
        error: err.message || "Failed to load verified financial health dossier",
        isLoading: false,
      });
    }
  },

  reset: () => set({ dossier: null, isLoading: false, error: null }),
}));
