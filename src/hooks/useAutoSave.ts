import { useCallback } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useAutoSave() {
  const { currentUser } = useAuth();

  const autoSave = useCallback(async (toolType: string, title: string, content: string) => {
    if (!currentUser) return;

    try {
      const savedItemsRef = collection(db, 'saved_items');
      const newItemRef = doc(savedItemsRef);
      
      await setDoc(newItemRef, {
        userId: currentUser.uid,
        toolType,
        title: title || 'Không có tiêu đề',
        content,
        createdAt: new Date().toISOString(),
      });
      console.log(`Auto-saved ${toolType} to history.`);
    } catch (error) {
      console.error('Error auto-saving to Firestore:', error);
    }
  }, [currentUser]);

  return { autoSave };
}
