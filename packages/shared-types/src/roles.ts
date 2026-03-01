export type UserRole = "super_admin" | "admin" | "parent" | "student";

export type AdminSubRole = "teacher" | "accountant" | "management";

export interface UserClaims {
  role: UserRole;
  adminSubRole?: AdminSubRole;
  schoolIds: string[];
}
