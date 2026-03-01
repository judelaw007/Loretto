/**
 * Dev seed script — creates test users in the Firebase Auth & Firestore emulators.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/seed-dev-users.ts
 *
 * Requires FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST env vars,
 * which are set automatically when running inside `firebase emulators:exec`.
 */

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Point at emulators
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const app = initializeApp({ projectId: "loretto-school" });
const auth = getAuth(app);
const db = getFirestore(app);

interface SeedUser {
  email: string;
  password: string;
  displayName: string;
  role: string;
  adminSubRole?: string;
  schoolIds: string[];
  extra?: Record<string, unknown>;
}

const seedUsers: SeedUser[] = [
  {
    email: "superadmin@loretto.test",
    password: "password123",
    displayName: "Super Admin",
    role: "super_admin",
    schoolIds: ["school-main", "school-branch-1"],
  },
  {
    email: "teacher@loretto.test",
    password: "password123",
    displayName: "Mrs. Johnson",
    role: "admin",
    adminSubRole: "teacher",
    schoolIds: ["school-main"],
  },
  {
    email: "parent@loretto.test",
    password: "password123",
    displayName: "Mr. Adeyemi",
    role: "parent",
    schoolIds: ["school-main"],
    extra: { phone: "+234800000000", childrenIds: [] },
  },
  {
    email: "student@loretto.test",
    password: "password123",
    displayName: "Tunde Adeyemi",
    role: "student",
    schoolIds: ["school-main"],
    extra: { parentId: "" }, // Will be backfilled after parent creation
  },
];

async function seed() {
  const uids: Record<string, string> = {};

  for (const u of seedUsers) {
    try {
      const userRecord = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
      });

      uids[u.role] = userRecord.uid;

      const now = FieldValue.serverTimestamp();
      const doc: Record<string, unknown> = {
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        schoolIds: u.schoolIds,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        ...u.extra,
      };

      if (u.adminSubRole) {
        doc.adminSubRole = u.adminSubRole;
      }

      await db.collection("users").doc(userRecord.uid).set(doc);
      console.log(`Created ${u.role}: ${u.email} (${userRecord.uid})`);
    } catch (err) {
      console.error(`Failed to create ${u.email}:`, err);
    }
  }

  // Backfill parent-student link
  if (uids["parent"] && uids["student"]) {
    await db.collection("users").doc(uids["student"]).update({ parentId: uids["parent"] });
    await db.collection("users").doc(uids["parent"]).update({ childrenIds: [uids["student"]] });
    console.log("Linked parent <-> student");
  }

  // Create a sample school document
  await db.collection("schools").doc("school-main").set({
    name: "Loretto School of Childhood",
    branch: "Main Campus",
    address: "123 Education Road, Lagos",
    phone: "+234800000001",
    email: "info@loretto.test",
    isActive: true,
    termDates: [],
    settings: { currency: "NGN", timezone: "Africa/Lagos" },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log("Created school: school-main");

  // Create sample applications
  const sampleApplications = [
    {
      parentName: "Mrs. Chidinma Okafor",
      parentEmail: "chidinma.okafor@example.com",
      parentPhone: "+2348012345678",
      schoolId: "school-main",
      status: "pending",
      children: [
        {
          firstName: "Chukwuemeka",
          lastName: "Okafor",
          dateOfBirth: "2019-03-15",
          gender: "male",
          previousSchool: "Bright Stars Nursery",
          classAppliedFor: "Primary 1",
        },
        {
          firstName: "Adaeze",
          lastName: "Okafor",
          dateOfBirth: "2021-07-22",
          gender: "female",
          classAppliedFor: "Nursery 2",
        },
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {
      parentName: "Mr. Babatunde Afolabi",
      parentEmail: "babatunde.afolabi@example.com",
      parentPhone: "+2348098765432",
      schoolId: "school-main",
      status: "under_review",
      reviewNotes: "Documents verified. Awaiting final decision.",
      reviewedBy: "Super Admin",
      children: [
        {
          firstName: "Oluwatobi",
          lastName: "Afolabi",
          dateOfBirth: "2020-11-08",
          gender: "male",
          previousSchool: "Little Angels Academy",
          classAppliedFor: "Nursery 3",
        },
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {
      parentName: "Mrs. Ngozi Eze",
      parentEmail: "ngozi.eze@example.com",
      parentPhone: "+2348055551234",
      schoolId: "school-main",
      status: "pending",
      children: [
        {
          firstName: "Somtochukwu",
          lastName: "Eze",
          dateOfBirth: "2018-01-20",
          gender: "male",
          classAppliedFor: "Primary 2",
        },
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
  ];

  for (const app of sampleApplications) {
    const ref = await db.collection("applications").add(app);
    console.log(`Created application: ${app.parentName} (${ref.id}) — ${app.status}`);
  }

  console.log("\nSeed complete! Test credentials:");
  console.log("  Super Admin:  superadmin@loretto.test / password123");
  console.log("  Teacher:      teacher@loretto.test / password123");
  console.log("  Parent:       parent@loretto.test / password123");
  console.log("  Student:      student@loretto.test / password123");
  console.log("\nSample applications created (pending + under_review)");
}

seed().catch(console.error);
