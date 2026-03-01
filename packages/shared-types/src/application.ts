import type { Timestamp } from "./common";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

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
