import React, { useState } from 'react';
import { Map as MapIcon, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Info, Compass, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import InteractiveMap from './InteractiveMap';

interface BibleMapData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const MAP_DATA: BibleMapData[] = [
  {
    id: 'paul-journeys',
    title: '바울의 전도 여행 (AD 46-61)',
    description: '사도 바울의 1, 2, 3차 전도 여행과 로마 압송 경로를 보여주는 지도입니다. 안디옥에서 시작하여 에베소, 고린도, 아테네를 거쳐 로마까지 이어진 복음 전파의 여정을 확인하세요.',
    imageUrl: '/global-bible-pro/images/maps/paul_journey.png',
    tags: ['신약', '바울', '선교']
  },
  {
    id: 'exodus',
    title: '출애굽 경로 (준비 중)',
    description: '이스라엘 백성이 이집트를 떠나 가나안 땅으로 향하는 여정입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1548120231-1d6f8913995d?auto=format&fit=crop&q=80&w=2000',
    tags: ['구약', '모세', '출애굽']
  }
];

export default function BibleMap() {
  const [viewMode, setViewMode] = useState<'STATIC' | 'INTERACTIVE'>('INTERACTIVE');
  const [selectedMap, setSelectedMap] = useState(MAP_DATA[0]);
  const [zoom, setZoom] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
            <MapIcon size={18} />
          </div>
          <h2 className="text-3xl font-bold premium-heading">성경 지도</h2>
        </div>
        <p className="text-gray-400 text-sm">성경의 주요 역사적 장소와 여정을 고화질 지도로 확인하세요.</p>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit mt-6">
          <button 
            onClick={() => setViewMode('INTERACTIVE')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              viewMode === 'INTERACTIVE' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Compass size={16} />
            지도 탐사 (Interactive)
          </button>
          <button 
            onClick={() => setViewMode('STATIC')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              viewMode === 'STATIC' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <ImageIcon size={16} />
            고전 지도 (Gallery)
          </button>
        </div>
      </header>

      {viewMode === 'INTERACTIVE' ? (
        <div className="flex-1 overflow-hidden border-t border-gray-100">
          <InteractiveMap />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-8 pt-4 overflow-hidden">
        {/* Left: Map Viewer */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative group">
          <div 
            className="w-full h-full flex items-center justify-center overflow-auto no-scrollbar"
            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
          >
            <div 
              className="transition-transform duration-300 ease-out p-4"
              style={{ transform: `scale(${zoom})` }}
            >
              <img 
                src={selectedMap.imageUrl} 
                alt={selectedMap.title}
                className="max-w-full max-h-full rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button 
              onClick={() => handleZoom(-0.2)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              title="축소"
            >
              <ZoomOut size={20} />
            </button>
            <div className="w-12 text-center text-xs font-bold text-gray-400">
              {Math.round(zoom * 100)}%
            </div>
            <button 
              onClick={() => handleZoom(0.2)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              title="확대"
            >
              <ZoomIn size={20} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              title="전체 화면"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Right: Info & Map List */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedMap.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">#{tag}</span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{selectedMap.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {selectedMap.description}
            </p>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs border border-amber-100">
              <Info size={14} />
              <span>지도를 확대하여 상세 지명을 확인하세요.</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-y-auto">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">지도 목록</h4>
            <div className="space-y-3">
              {MAP_DATA.map(map => (
                <button
                  key={map.id}
                  onClick={() => { setSelectedMap(map); setZoom(1); }}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border group",
                    selectedMap.id === map.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                      : "bg-white border-gray-100 hover:border-gray-300"
                  )}
                >
                  <p className={cn("font-bold text-sm", selectedMap.id === map.id ? "text-white" : "text-gray-900")}>
                    {map.title}
                  </p>
                  <p className={cn("text-[10px] mt-1", selectedMap.id === map.id ? "text-gray-400" : "text-gray-400 group-hover:text-gray-500")}>
                    주요 인물: {map.tags[1]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
