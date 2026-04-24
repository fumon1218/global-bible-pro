import React, { useState, useEffect } from 'react';
import { Flame, Heart, Play, Brain, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MemoryMode() {
  const [activeTab, setActiveTab] = useState<'LIST' | 'STUDY' | 'QUIZ'>('LIST');

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold premium-heading mb-2">성경 암송 수첩</h2>
          <p className="text-gray-400">말씀을 마음속에 깊이 새기는 시간입니다.</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl shadow-xl">
          <Flame size={20} className="text-[var(--color-secondary)]" fill="currentColor" />
          <span className="font-bold">7일 연속 암송 중!</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('LIST')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'LIST' ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-400")}
        >
          목록
        </button>
        <button 
          onClick={() => setActiveTab('STUDY')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'STUDY' ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-400")}
        >
          학습
        </button>
        <button 
          onClick={() => setActiveTab('QUIZ')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'QUIZ' ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-400")}
        >
          퀴즈
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for actual categories/verses */}
        {[1, 2, 3].map(i => (
          <div key={i} className="card-premium p-8 space-y-6">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black text-[var(--color-secondary)] tracking-widest uppercase">Category {i}</span>
              <Heart size={18} className="text-gray-200" />
            </div>
            <p className="bible-text text-xl leading-relaxed text-gray-800">
              "태초에 하나님이 천지를 창조하시니라."
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-xs font-bold text-gray-400">창세기 1:1</span>
              <button className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                <Play size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
