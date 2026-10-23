import { apiClient } from "./api";
import type { VerifiedDossierData } from "@/types/mfo";

export const dossierService = {
  /**
   * Fetches the verified public financial health dossier using the token.
   * No authentication required.
   */
  async getVerifiedDossier(token: string): Promise<VerifiedDossierData> {
    return apiClient<VerifiedDossierData>(`/api/health/verify/${encodeURIComponent(token)}`);
  },
};
