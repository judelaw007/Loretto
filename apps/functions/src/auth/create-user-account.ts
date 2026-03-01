import { onCall, HttpsError } from "firebase-functions/v2/https";
import { adminAuth, adminDb } from "../admin";
import type { UserRole, AdminSubRole } from "@loretto/shared-types";
import { FieldValue } from "firebase-admin/firestore";

interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  adminSubRole?: AdminSubRole;
  schoolIds: string[];
  parentId?: string;
}

export const createUserAccount = onCall<CreateUserData>(async (request) => {
  // Only super_admin or admin can create accounts
  const callerClaims = request.auth?.token;
  if (!callerClaims || !["super_admin", "admin"].includes(callerClaims.role as string)) {
    throw new HttpsError("permission-denied", "Only admins can create user accounts");
  }

  const { email, password, displayName, role, adminSubRole, schoolIds, parentId } = request.data;

  if (!email || !password || !displayName || !role) {
    throw new HttpsError("invalid-argument", "email, password, displayName, and role are required");
  }

  // Create Firebase Auth account
  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName,
  });

  // Build Firestore user document
  const now = FieldValue.serverTimestamp();
  const userDoc: Record<string, unknown> = {
    email,
    displayName,
    role,
    schoolIds: schoolIds ?? [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  if (role === "admin" && adminSubRole) {
    userDoc.adminSubRole = adminSubRole;
  }

  if (role === "parent") {
    userDoc.phone = "";
    userDoc.childrenIds = [];
  }

  if (role === "student" && parentId) {
    userDoc.parentId = parentId;
  }

  // Write to Firestore (triggers onUserDocumentCreate → sets claims)
  await adminDb.collection("users").doc(userRecord.uid).set(userDoc);

  return { uid: userRecord.uid, success: true };
});
