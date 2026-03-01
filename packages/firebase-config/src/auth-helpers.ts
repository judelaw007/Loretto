import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "./config";
import type { LoginCredentials } from "@loretto/shared-types";

export async function signIn({ email, password }: LoginCredentials) {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}
