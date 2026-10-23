import type { SimulatedUser } from "@/types/auth";

export const SIMULATED_PERSONAS: Record<string, SimulatedUser> = {
  admin: {
    id: "usr_admin_01",
    name: "Yishaq Admin",
    email: "admin@networth.et",
    role: "admin",
    organization: "NetWorth Central Operations",
    jobTitle: "System Superadmin",
    avatarText: "AD",
  },
  wasasa: {
    id: "usr_mfo_01",
    name: "Abebech Tadesse",
    email: "loans@wasasa.et",
    role: "bank",
    organization: "Wasasa Microfinance S.C.",
    jobTitle: "Senior MSME Credit Analyst",
    avatarText: "WM",
  },
  cbe: {
    id: "usr_mfo_02",
    name: "Dawit Kebede",
    email: "credit.eval@cbe.com.et",
    role: "bank",
    organization: "Commercial Bank of Ethiopia",
    jobTitle: "MSME Underwriting Lead",
    avatarText: "CB",
  },
  merchant: {
    id: "usr_merch_01",
    name: "Solomon Haile",
    email: "solomon@mercato-retail.et",
    role: "merchant",
    organization: "Solomon Supermarket & Wholesalers",
    jobTitle: "Store Owner",
    avatarText: "SH",
  },
};

export const DEMO_PASSCODES: Record<string, string> = {
  admin: "admin123",
  mfo: "mfo123",
};
