"use client";

import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getApp } from "./config";

let _functions: ReturnType<typeof getFunctions> | undefined;
let _emulatorConnected = false;

function ensureFunctions() {
  if (_functions) return _functions;

  const app = getApp();
  _functions = getFunctions(app);

  const useEmulators =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" ||
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === "true";

  if (useEmulators && !_emulatorConnected) {
    connectFunctionsEmulator(_functions, "127.0.0.1", 5001);
    _emulatorConnected = true;
  }

  return _functions;
}

export async function callFunction<TData, TResult>(
  name: string,
  data: TData,
): Promise<TResult> {
  const functions = ensureFunctions();
  const fn = httpsCallable<TData, TResult>(functions, name);
  const result = await fn(data);
  return result.data;
}
