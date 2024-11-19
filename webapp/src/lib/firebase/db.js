import { db } from './firebase-config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  getDocs,
  getDoc,
  deleteDoc 
} from 'firebase/firestore';

// Note: If you see "POST .../Listen/channel?VER=8..." errors in console,
// this is likely due to ad blockers preventing Firebase's real-time connection
// and can be safely ignored for non-realtime operations
export const firebaseDB = {
  async create(collectionName, data) {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, data);
      console.log('Document created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async get(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async query(collectionName) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying collection:', error);
      throw error;
    }
  },

  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      console.log('Document deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};