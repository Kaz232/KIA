import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });

// Error handling as required by Firebase skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client offline / check configuration.");
      return false;
    }
    // Expected permission error or missing doc on test path is fine as connection verification
    return true;
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Google Auth error:", error);
    return {
      success: false,
      error: error?.message || "Falha na autenticação com Google.",
    };
  }
}

export async function logOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase SignOut error:", error);
  }
}

// User Profile Firestore Sync
export async function syncUserProfile(user: FirebaseUser, role: string = "SUPER_ADMIN") {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || user.email?.split("@")[0] || "Operador GAG",
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Could not sync user profile to Firestore:", err);
  }
}
