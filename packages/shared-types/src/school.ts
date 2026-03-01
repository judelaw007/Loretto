import type { Timestamp } from "./common";

export interface School {
  id: string;
  name: string;
  branch: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  termDates?: TermDate[];
  settings: SchoolSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TermDate {
  term: string;
  startDate: string;
  endDate: string;
}

export interface SchoolSettings {
  currency: string;
  timezone: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  authorId: string;
  targetRoles: string[];
  createdAt: Timestamp;
}
