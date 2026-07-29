import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

// Firebase configuration structure
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase configs are provided
const isFirebaseConfigured =
  typeof window !== "undefined"
    ? !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    : false;

let app: any;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed, falling back to mock storage:", error);
  }
}

// -------------------------------------------------------------
// SAFE STORAGE SYSTEM (LocalStorage Try/Catch + In-Memory Fallback)
// -------------------------------------------------------------

const inMemoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn("localStorage.getItem blocked/failed:", e);
  }
  return inMemoryCache[key] || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      return;
    }
  } catch (e) {
    console.warn("localStorage.setItem blocked/failed:", e);
  }
  inMemoryCache[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
      return;
    }
  } catch (e) {
    console.warn("localStorage.removeItem blocked/failed:", e);
  }
  delete inMemoryCache[key];
}

// -------------------------------------------------------------
// LOCAL STORAGE MOCK SYSTEM
// -------------------------------------------------------------

interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
}

class MockAuth {
  private listeners: ((user: MockUser | null) => void)[] = [];
  private currentUserObj: MockUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = safeGetItem("saarathi_mock_user");
      if (savedUser) {
        try {
          this.currentUserObj = JSON.parse(savedUser);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  get currentUser() {
    return this.currentUserObj;
  }

  onAuthStateChanged(callback: (user: any | null) => void) {
    this.listeners.push(callback);
    // Trigger immediately with current value
    setTimeout(() => callback(this.currentUserObj), 0);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUserObj));
  }

  async signInWithEmailAndPassword(email: string, _: string) {
    const user: MockUser = {
      uid: "mock-user-id",
      email: email,
      displayName: email.split("@")[0],
    };
    this.currentUserObj = user;
    safeSetItem("saarathi_mock_user", JSON.stringify(user));
    this.notify();
    return { user };
  }

  async createUserWithEmailAndPassword(email: string, _: string) {
    const user: MockUser = {
      uid: "mock-user-id",
      email: email,
      displayName: email.split("@")[0],
    };
    this.currentUserObj = user;
    safeSetItem("saarathi_mock_user", JSON.stringify(user));
    this.notify();
    return { user };
  }

  async signOut() {
    this.currentUserObj = null;
    safeRemoveItem("saarathi_mock_user");
    this.notify();
  }
}

// Instantiate mock services
const mockAuth = new MockAuth();

// -------------------------------------------------------------
// UNIFIED SERVICES API (Firebase + Mock Fallback)
// -------------------------------------------------------------

export const authService = {
  getCurrentUser: () => (isFirebaseConfigured && auth ? auth.currentUser : mockAuth.currentUser),
  onAuthStateChange: (callback: (user: any | null) => void) => {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    } else {
      return mockAuth.onAuthStateChanged(callback);
    }
  },
  login: async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, pass);
    } else {
      return mockAuth.signInWithEmailAndPassword(email, pass);
    }
  },
  signUp: async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      return createUserWithEmailAndPassword(auth, email, pass);
    } else {
      return mockAuth.createUserWithEmailAndPassword(email, pass);
    }
  },
  logout: async () => {
    if (isFirebaseConfigured && auth) {
      return signOut(auth);
    } else {
      return mockAuth.signOut();
    }
  },
};

// Firestore helper abstractions
export const dbService = {
  // Save or Update a complete chat session
  saveChat: async (userId: string, chatId: string, title: string, messages: any[], category: string = "general") => {
    const chatData = {
      id: chatId,
      userId,
      title,
      messages,
      category,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, "chats", chatId), chatData);
    } else {
      const chats = dbService.getMockChats(userId);
      const index = chats.findIndex((c: any) => c.id === chatId);
      if (index > -1) {
        chats[index] = chatData;
      } else {
        chats.unshift(chatData);
      }
      safeSetItem(`saarathi_chats_${userId}`, JSON.stringify(chats));
    }
    return chatData;
  },

  // Get all chat sessions for a user
  getChats: async (userId: string) => {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "chats"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data());
    } else {
      return dbService.getMockChats(userId);
    }
  },

  // Delete a chat session
  deleteChat: async (userId: string, chatId: string) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "chats", chatId));
    } else {
      const chats = dbService.getMockChats(userId);
      const filtered = chats.filter((c: any) => c.id !== chatId);
      safeSetItem(`saarathi_chats_${userId}`, JSON.stringify(filtered));
    }
  },

  // Bookmarks management
  saveBookmark: async (userId: string, bookmark: { id: string; title: string; content: string; type: string }) => {
    const bookmarkData = {
      ...bookmark,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, "bookmarks", bookmark.id), bookmarkData);
    } else {
      const bookmarks = dbService.getMockBookmarks(userId);
      const index = bookmarks.findIndex((b: any) => b.id === bookmark.id);
      if (index > -1) {
        bookmarks[index] = bookmarkData;
      } else {
        bookmarks.unshift(bookmarkData);
      }
      safeSetItem(`saarathi_bookmarks_${userId}`, JSON.stringify(bookmarks));
    }
    return bookmarkData;
  },

  getBookmarks: async (userId: string) => {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "bookmarks"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data());
    } else {
      return dbService.getMockBookmarks(userId);
    }
  },

  deleteBookmark: async (userId: string, bookmarkId: string) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "bookmarks", bookmarkId));
    } else {
      const bookmarks = dbService.getMockBookmarks(userId);
      const filtered = bookmarks.filter((b: any) => b.id !== bookmarkId);
      safeSetItem(`saarathi_bookmarks_${userId}`, JSON.stringify(filtered));
    }
  },

  // Settings management
  saveSettings: async (userId: string, settings: any) => {
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, "settings", userId), settings, { merge: true });
    } else {
      safeSetItem(`saarathi_settings_${userId}`, JSON.stringify(settings));
    }
    return settings;
  },

  getSettings: async (userId: string) => {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, "settings", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } else {
      if (typeof window !== "undefined") {
        const saved = safeGetItem(`saarathi_settings_${userId}`);
        return saved ? JSON.parse(saved) : null;
      }
      return null;
    }
  },

  // Helper getters for Mock lists
  getMockChats: (userId: string): any[] => {
    if (typeof window === "undefined") return [];
    const saved = safeGetItem(`saarathi_chats_${userId}`);
    return saved ? JSON.parse(saved) : [];
  },

  getMockBookmarks: (userId: string): any[] => {
    if (typeof window === "undefined") return [];
    const saved = safeGetItem(`saarathi_bookmarks_${userId}`);
    return saved ? JSON.parse(saved) : [];
  },
};
