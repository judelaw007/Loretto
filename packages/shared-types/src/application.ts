import type { Timestamp } from "./common";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

/** Form input type for the public application form (no id/timestamps) */
export interface ApplicationFormChild {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  previousSchool?: string;
  classAppliedFor: string;
}

/** Form input type submitted by the parent (converted to Application on write) */
export interface ApplicationFormData {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  schoolId: string;
  children: ApplicationFormChild[];
}

export interface Application {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  schoolId: string;
  children: ApplicationChild[];
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ApplicationChild {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  previousSchool?: string;
  classAppliedFor: string;
}
