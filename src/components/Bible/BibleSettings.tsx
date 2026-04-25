import React from 'react';
import { X, Type, Sun, Moon, Coffee, AlignLeft, AlignCenter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BibleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  setTheme: (theme: 'light' | 'sepia' | 'dark') => void;
  lineHeight: number;
  setLineHeight: (h: number) => void;
  fontFamily: 'sans' | 'serif';
  setFontFamily: (f: 'sans' | 'serif') => void;
}

export default function BibleSettings({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  theme,
  setTheme,
  lineHeight,
  setLineHeight,
  fontFamily,
  setFontFamily,
}: BibleSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Type size={20} className="text-[var(--color-secondary)]" />
            보기 설정
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">배경 테마</label>
            <div className="flex gap-2">
              {[
                { id: 'light', icon: Sun, label: '라이트', bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
                { id: 'sepia', icon: Coffee, label: '세피아', bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', border: 'border-[#d3c1a3]' },
                { id: 'dark', icon: Moon, label: '다크', bg: 'bg-[#1a1a1a]', text: 'text-gray-400', border: 'border-gray-800' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    theme === t.id ? "border-[var(--color-secondary)] shadow-md scale-105" : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0",
                    t.bg
                  )}
                >
                  <t.icon size={20} className={t.text} />
                  <span className={cn("text-[10px] font-bold", t.text)}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">글자 크기</label>
              <span className="text-xs font-bold text-[var(--color-secondary)]">{fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="14" 
              max="32" 
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-[var(--color-secondary)]"
            />
          </div>

          {/* Line Height & Family */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">줄 간격</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {[1.5, 2.0, 2.5].map((h) => (
                  <button
                    key={h}
                    onClick={() => setLineHeight(h)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      lineHeight === h ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                    )}
                  >
                    {h}x
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">글꼴 선택</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {[
                  { id: 'sans', label: '고딕' },
                  { id: 'serif', label: '명조' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      fontFamily === f.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
