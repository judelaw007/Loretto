import { onRequest } from "firebase-functions/v2/https";
import { adminDb } from "../admin";

export const checkApplicationStatus = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { email } = req.body;

    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const snapshot = await adminDb
      .collection("applications")
      .where("parentEmail", "==", email.toLowerCase().trim())
      .orderBy("createdAt", "desc")
      .get();

    const applications = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        status: data.status,
        childrenCount: data.children?.length ?? 0,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : null,
      };
    });

    res.json({ applications });
  },
);
