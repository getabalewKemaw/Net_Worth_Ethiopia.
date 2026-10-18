export type UserRole = "admin" | "bank" | "merchant" | "sales";
export type UserStatus = "active" | "suspended" | "pending";

export interface SimulatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  jobTitle?: string;
  avatarText: string;
}
