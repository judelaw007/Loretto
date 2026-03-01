import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

function ensureInitialized() {
  if (_app) return;

  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

  // Skip initialization when no API key is available (SSR/build time)
  if (!apiKey) return;

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  if (getApps().length === 0) {
    _app = initializeApp(firebaseConfig);
  } else {
    _app = getApps()[0];
  }

  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);

  const useEmulators =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" ||
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === "true";

  if (useEmulators) {
    connectAuthEmulator(_auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(_db, "127.0.0.1", 8080);
    connectStorageEmulator(_storage, "127.0.0.1", 9199);
  }
}

export function getApp(): FirebaseApp {
  ensureInitialized();
  return _app!;
}

export function getFirebaseAuth(): Auth {
  ensureInitialized();
  return _auth!;
}

export function getFirebaseDb(): Firestore {
  ensureInitialized();
  return _db!;
}

export function getFirebaseStorage(): FirebaseStorage {
  ensureInitialized();
  return _storage!;
}
