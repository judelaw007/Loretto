"use client";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";

export { where, orderBy, serverTimestamp } from "firebase/firestore";

export async function addDocument<T extends DocumentData>(
  collectionPath: string,
  data: T,
): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, collectionPath), data);
  return ref.id;
}

export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>,
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, collectionPath, docId), data);
}

export async function getDocument<T>(
  collectionPath: string,
  docId: string,
): Promise<(T & { id: string }) | null> {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, collectionPath, docId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

export async function queryDocuments<T>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, collectionPath), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
}
