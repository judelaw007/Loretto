import { onCall, HttpsError } from "firebase-functions/v2/https";
import { adminAuth, adminDb } from "../admin";
import { FieldValue } from "firebase-admin/firestore";
import * as crypto from "crypto";

interface ApproveData {
  applicationId: string;
}

interface ApproveResult {
  parentPassword: string;
  parentUid: string;
  childrenUids: string[];
}

export const approveApplication = onCall<ApproveData>(async (request) => {
  // Auth check: only admin or super_admin
  const callerClaims = request.auth?.token;
  if (
    !callerClaims ||
    !["super_admin", "admin"].includes(callerClaims.role as string)
  ) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can approve applications",
    );
  }

  const { applicationId } = request.data;
  if (!applicationId) {
    throw new HttpsError("invalid-argument", "applicationId is required");
  }

  // Fetch application
  const appRef = adminDb.collection("applications").doc(applicationId);
  const appSnap = await appRef.get();

  if (!appSnap.exists) {
    throw new HttpsError("not-found", "Application not found");
  }

  const appData = appSnap.data()!;

  if (appData.status !== "pending" && appData.status !== "under_review") {
    throw new HttpsError(
      "failed-precondition",
      `Application is already ${appData.status}`,
    );
  }

  // Generate a random 12-character password
  const parentPassword = crypto.randomBytes(9).toString("base64url").slice(0, 12);

  const now = FieldValue.serverTimestamp();
  let parentUid: string;

  // Create parent Auth account
  try {
    const parentRecord = await adminAuth.createUser({
      email: appData.parentEmail,
      password: parentPassword,
      displayName: appData.parentName,
    });
    parentUid = parentRecord.uid;
  } catch (err: unknown) {
    const fbErr = err as { code?: string };
    if (fbErr.code === "auth/email-already-exists") {
      throw new HttpsError(
        "already-exists",
        `A user account already exists for ${appData.parentEmail}`,
      );
    }
    throw new HttpsError("internal", "Failed to create parent account");
  }

  // Create parent Firestore doc
  await adminDb
    .collection("users")
    .doc(parentUid)
    .set({
      email: appData.parentEmail,
      displayName: appData.parentName,
      role: "parent",
      phone: appData.parentPhone || "",
      schoolIds: [appData.schoolId],
      childrenIds: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

  // Create student accounts
  const childrenUids: string[] = [];

  for (const child of appData.children) {
    const childDisplayName = `${child.firstName} ${child.lastName}`;
    // Generate a unique email for the student based on the parent email
    const emailParts = appData.parentEmail.split("@");
    const childEmail = `${emailParts[0]}+${child.firstName.toLowerCase()}@${emailParts[1]}`;
    const childPassword = crypto.randomBytes(9).toString("base64url").slice(0, 12);

    const studentRecord = await adminAuth.createUser({
      email: childEmail,
      password: childPassword,
      displayName: childDisplayName,
    });

    childrenUids.push(studentRecord.uid);

    await adminDb.collection("users").doc(studentRecord.uid).set({
      email: childEmail,
      displayName: childDisplayName,
      role: "student",
      parentId: parentUid,
      schoolIds: [appData.schoolId],
      dateOfBirth: child.dateOfBirth || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Update parent's childrenIds
  await adminDb.collection("users").doc(parentUid).update({
    childrenIds: childrenUids,
  });

  // Update application status
  await appRef.update({
    status: "approved",
    reviewedBy: callerClaims.name || callerClaims.email || "Admin",
    updatedAt: now,
  });

  const result: ApproveResult = {
    parentPassword,
    parentUid,
    childrenUids,
  };

  return result;
});
