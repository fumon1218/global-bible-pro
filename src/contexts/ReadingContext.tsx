import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

interface ReadingContextType {
  user: User | null;
  loading: boolean;
  completedChapters: Record<string, boolean>;
  readingLogs: Record<string, number>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  toggleChapter: (bookId: string, chapter: number) => Promise<void>;
  saveLog: (date: string, count: number) => Promise<void>;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const ReadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});
  const [readingLogs, setReadingLogs] = useState<Record<string, number>>({});

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const localChapters = JSON.parse(localStorage.getItem('gbp_completed_chapters') || '{}');
    const localLogs = JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}');
    setCompletedChapters(localChapters);
    setReadingLogs(localLogs);
  }, []);

  // 2. Auth & Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // Real-time Cloud -> Local & UI
        const unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const cloudChapters = cloudData.completedChapters || {};
            const cloudLogs = cloudData.readingLogs || {};

            // Update state
            setCompletedChapters(cloudChapters);
            setReadingLogs(cloudLogs);

            // Update LocalStorage for offline
            localStorage.setItem('gbp_completed_chapters', JSON.stringify(cloudChapters));
            localStorage.setItem('gbp_reading_logs', JSON.stringify(cloudLogs));
            window.dispatchEvent(new Event('storage'));
          }
        });

        // Merge local data to cloud once on first login if needed
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const localChapters = JSON.parse(localStorage.getItem('gbp_completed_chapters') || '{}');
          const localLogs = JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}');
          await setDoc(userRef, {
            completedChapters: localChapters,
            readingLogs: localLogs,
            email: currentUser.email,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }

        return () => unsubSnapshot();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(`로그인 실패: ${error.message}\n(Firebase 콘솔 설정 문제이거나 팝업 차단일 수 있습니다.)`);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    // Optional: decided whether to clear local storage or keep it
  };

  const toggleChapter = async (bookId: string, chapter: number) => {
    const key = `${bookId}_${chapter}`;
    const newChapters = { ...completedChapters };
    const isNowCompleted = !newChapters[key];

    if (isNowCompleted) {
      newChapters[key] = true;
      // Also update daily log
      const today = new Date().toISOString().split('T')[0];
      const newLogs = { ...readingLogs };
      newLogs[today] = (newLogs[today] || 0) + 1;
      setReadingLogs(newLogs);
      localStorage.setItem('gbp_reading_logs', JSON.stringify(newLogs));
    } else {
      delete newChapters[key];
    }

    setCompletedChapters(newChapters);
    localStorage.setItem('gbp_completed_chapters', JSON.stringify(newChapters));
    window.dispatchEvent(new Event('storage'));

    // Cloud Sync
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        completedChapters: newChapters,
        readingLogs: JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}'),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  const saveLog = async (date: string, count: number) => {
    const newLogs = { ...readingLogs, [date]: count };
    setReadingLogs(newLogs);
    localStorage.setItem('gbp_reading_logs', JSON.stringify(newLogs));

    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        readingLogs: newLogs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  return (
    <ReadingContext.Provider value={{ 
      user, loading, completedChapters, readingLogs, 
      login, logout, toggleChapter, saveLog 
    }}>
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = () => {
  const context = useContext(ReadingContext);
  if (!context) throw new Error('useReading must be used within a ReadingProvider');
  return context;
};
