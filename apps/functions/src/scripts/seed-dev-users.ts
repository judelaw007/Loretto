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

  console.log("\nSeed complete! Test credentials:");
  console.log("  Super Admin:  superadmin@loretto.test / password123");
  console.log("  Teacher:      teacher@loretto.test / password123");
  console.log("  Parent:       parent@loretto.test / password123");
  console.log("  Student:      student@loretto.test / password123");
}

seed().catch(console.error);
