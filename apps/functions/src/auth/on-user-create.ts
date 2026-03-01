import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { adminAuth } from "../admin";
import type { UserClaims } from "@loretto/shared-types";

export const onUserDocumentCreate = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const userId = event.params.userId;

    const claims: UserClaims = {
      role: data.role,
      schoolIds: data.schoolIds ?? [],
    };

    if (data.role === "admin" && data.adminSubRole) {
      claims.adminSubRole = data.adminSubRole;
    }

    await adminAuth.setCustomUserClaims(userId, claims);
  },
);
