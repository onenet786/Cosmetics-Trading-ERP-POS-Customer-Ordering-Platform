import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper to save data to localStorage as a fallback/draft cache
const saveToLocalCache = (key: string, data: any) => {
  try {
    localStorage.setItem(`silkglow_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed', err);
  }
};

// Generic Firestore CRUD helper methods
export const firebaseService = {
  /**
   * Fetch all documents from a Firestore collection
   */
  async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as T);
      saveToLocalCache(collectionName, data);
      return data;
    } catch (error) {
      console.error(`Error fetching collection ${collectionName}:`, error);
      // Fallback to local storage cache
      try {
        const cached = localStorage.getItem(`silkglow_${collectionName}`);
        if (cached) return JSON.parse(cached);
      } catch (_) {}
      return [];
    }
  },

  /**
   * Set (insert/overwrite) a document in a collection with custom id
   */
  async saveDoc<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, data);
    } catch (error) {
      console.error(`Error saving document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Update selective fields of a document in a collection
   */
  async updateDoc(collectionName: string, id: string, fields: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, fields);
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document from a collection
   */
  async deleteDoc(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Realtime collection sync
   */
  subscribeCollection<T>(collectionName: string, callback: (data: T[]) => void) {
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, 
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as T);
        saveToLocalCache(collectionName, data);
        callback(data);
      },
      (error) => {
        console.error(`Realtime sync error on ${collectionName}:`, error);
        // On error, try to fetch once from local cache
        try {
          const cached = localStorage.getItem(`silkglow_${collectionName}`);
          if (cached) callback(JSON.parse(cached));
        } catch (_) {}
      }
    );
  }
};
