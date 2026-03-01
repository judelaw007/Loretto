import { onCall, HttpsError } from "firebase-functions/v2/https";
import { adminAuth } from "../admin";
import type { UserClaims } from "@loretto/shared-types";

interface SetClaimsData {
  targetUserId: string;
  claims: UserClaims;
}

export const setCustomClaims = onCall<SetClaimsData>(async (request) => {
  // Only super_admin can manually set claims
  const callerClaims = request.auth?.token;
  if (!callerClaims || callerClaims.role !== "super_admin") {
    throw new HttpsError("permission-denied", "Only super_admin can set custom claims");
  }

  const { targetUserId, claims } = request.data;

  if (!targetUserId || !claims?.role) {
    throw new HttpsError("invalid-argument", "targetUserId and claims.role are required");
  }

  await adminAuth.setCustomUserClaims(targetUserId, {
    role: claims.role,
    adminSubRole: claims.adminSubRole ?? null,
    schoolIds: claims.schoolIds ?? [],
  });

  return { success: true };
});
