import type { UserRole } from "./roles";
import type { Timestamp } from "./common";

export interface Module {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  targetRoles: UserRole[];
  isActive: boolean;
  createdAt: Timestamp;
}

export type AssignmentScope = "user" | "role" | "school";

export interface FeatureAssignment {
  id: string;
  moduleId: string;
  scope: AssignmentScope;
  targetId: string; // userId, role string, or schoolId depending on scope
  isActive: boolean;
  assignedBy: string;
  createdAt: Timestamp;
}
