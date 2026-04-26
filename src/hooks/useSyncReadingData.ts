import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useSyncReadingData() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state between LocalStorage and Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Initial Sync when logged in
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const cloudData = userDoc.data();
          
          // Merge logic: Combine Local + Cloud (Cloud wins for latest sync)
          const localCompleted = JSON.parse(localStorage.getItem('gbp_completed_chapters') || '{}');
          const localLogs = JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}');
          const localSettings = {
            theme: localStorage.getItem('gbp_theme'),
            fontSize: localStorage.getItem('gbp_font_size'),
            primaryVersion: localStorage.getItem('gbp_primary_version'),
            parallelVersion: localStorage.getItem('gbp_parallel_version')
          };

          const mergedCompleted = { ...localCompleted, ...(cloudData.completedChapters || {}) };
          const mergedLogs = { ...localLogs, ...(cloudData.readingLogs || {}) };

          // Update Local with Merged Data
          localStorage.setItem('gbp_completed_chapters', JSON.stringify(mergedCompleted));
          localStorage.setItem('gbp_reading_logs', JSON.stringify(mergedLogs));
          
          // Trigger storage event for UI updates
          window.dispatchEvent(new Event('storage'));
        } else {
          // New User: Upload existing local data to cloud
          const localCompleted = JSON.parse(localStorage.getItem('gbp_completed_chapters') || '{}');
          const localLogs = JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}');
          
          await setDoc(userRef, {
            completedChapters: localCompleted,
            readingLogs: localLogs,
            updatedAt: new Date().toISOString(),
            email: currentUser.email,
            displayName: currentUser.displayName
          }, { merge: true });
        }

        // 2. Real-time Listening for remote changes
        const unSubSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            localStorage.setItem('gbp_completed_chapters', JSON.stringify(data.completedChapters || {}));
            localStorage.setItem('gbp_reading_logs', JSON.stringify(data.readingLogs || {}));
            window.dispatchEvent(new Event('storage'));
          }
        });

        return () => unSubSnapshot();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to save data to both local and cloud
  const saveData = async (type: 'completed' | 'logs', data: any) => {
    const storageKey = type === 'completed' ? 'gbp_completed_chapters' : 'gbp_reading_logs';
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));

    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        [type === 'completed' ? 'completedChapters' : 'readingLogs']: data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  return { user, loading, saveData };
}
