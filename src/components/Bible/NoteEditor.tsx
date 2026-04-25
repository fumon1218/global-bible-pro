import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Loader2, BookOpen } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
}

export default function NoteEditor({
  isOpen,
  onClose,
  bookId,
  bookName,
  chapter,
  verse,
  verseText
}: NoteEditorProps) {
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const docId = `n_${bookId}_${chapter}_${verse}`;
        const docRef = doc(db, "notes", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNote(docSnap.data().content);
        } else {
          setNote('');
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [isOpen, bookId, chapter, verse]);

  const handleSave = async () => {
    if (!note.trim()) {
      handleDelete();
      return;
    }

    setIsSaving(true);
    try {
      const docId = `n_${bookId}_${chapter}_${verse}`;
      await setDoc(doc(db, "notes", docId), {
        bookId,
        bookName,
        chapter,
        verse,
        content: note,
        updatedAt: serverTimestamp()
      });
      onClose();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("메모 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("메모를 삭제하시겠습니까?")) return;
    
    setIsSaving(true);
    try {
      const docId = `n_${bookId}_${chapter}_${verse}`;
      await deleteDoc(doc(db, "notes", docId));
      setNote('');
      onClose();
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)]">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">말씀 메모</h3>
              <p className="text-xs text-gray-400 font-medium">{bookName} {chapter}:{verse}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">말씀 본문</p>
            <p className="text-sm text-gray-600 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: verseText }} />
          </div>

          <div className="flex-1 min-h-[200px] flex flex-col">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">메모 내용</label>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-200" size={32} />
              </div>
            ) : (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="묵상하신 내용을 기록해 보세요..."
                className="flex-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 ring-[var(--color-secondary)]/20 transition-all resize-none"
              />
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50/50 flex items-center justify-between">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-500 font-bold text-sm transition-colors"
          >
            <Trash2 size={16} />
            삭제
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              메모 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
