import type { UserRole, AdminSubRole } from "./roles";
import type { Timestamp } from "./common";

export interface BaseUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  schoolIds: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SuperAdminUser extends BaseUser {
  role: "super_admin";
}

export interface AdminUser extends BaseUser {
  role: "admin";
  adminSubRole: AdminSubRole;
}

export interface ParentUser extends BaseUser {
  role: "parent";
  phone: string;
  address?: string;
  childrenIds: string[];
}

export interface StudentUser extends BaseUser {
  role: "student";
  parentId: string;
  dateOfBirth?: string;
  classId?: string;
  admissionNumber?: string;
}

export type User = SuperAdminUser | AdminUser | ParentUser | StudentUser;
