import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BIBLE_PLACES, BiblePlace } from '../../data/biblePlaces';
import { Search, Navigation, Layers, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function InteractiveMap() {
  const [selectedPlace, setSelectedPlace] = useState<BiblePlace | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.7683, 35.2137]); // Default: Jerusalem
  const [zoom, setZoom] = useState(6);

  const filteredPlaces = BIBLE_PLACES.filter(p => 
    p.name.includes(searchTerm) || p.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaceSelect = (place: BiblePlace) => {
    setSelectedPlace(place);
    setMapCenter([place.lat, place.lng]);
    setZoom(10);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Left: Sidebar & Search */}
      <div className="w-full lg:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">지명 탐색</h3>
            <p className="text-xs text-gray-400 leading-relaxed">성경의 주요 장소를 검색하고 지도로 이동하세요.</p>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="지명 검색 (예루살렘, 안디옥...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 ring-indigo-100 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {filteredPlaces.map(place => (
            <button
              key={place.id}
              onClick={() => handlePlaceSelect(place)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all group border",
                selectedPlace?.id === place.id 
                  ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50" 
                  : "bg-transparent border-transparent hover:bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn("font-bold text-sm", selectedPlace?.id === place.id ? "text-indigo-600" : "text-gray-900")}>
                    {place.name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{place.nameEn}</p>
                </div>
                <Navigation size={14} className={cn("transition-colors", selectedPlace?.id === place.id ? "text-indigo-400" : "text-gray-300 group-hover:text-gray-400")} />
              </div>
            </button>
          ))}
          {filteredPlaces.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-gray-400">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Map Area */}
      <div className="flex-1 relative">
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          scrollWheelZoom={true}
          className="w-full h-full z-10"
          zoomControl={false}
        >
          <ChangeView center={mapCenter} zoom={zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {BIBLE_PLACES.map(place => (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]}
              eventHandlers={{
                click: () => {
                  setSelectedPlace(place);
                  setMapCenter([place.lat, place.lng]);
                },
              }}
            >
              <Popup className="premium-popup">
                <div className="p-1">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">#{place.category}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{place.name}</h4>
                  <p className="text-[10px] text-gray-400 mb-2">{place.nameEn}</p>
                  <p className="text-xs text-gray-600 leading-relaxed border-t pt-2">{place.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Custom Map Controls */}
        <div className="absolute top-6 right-6 z-[100] flex flex-col gap-2">
          <button className="p-3 bg-white rounded-2xl shadow-xl border border-gray-100 text-gray-600 hover:text-indigo-600 transition-colors">
            <Layers size={20} />
          </button>
          <button className="p-3 bg-white rounded-2xl shadow-xl border border-gray-100 text-gray-600 hover:text-indigo-600 transition-colors">
            <Info size={20} />
          </button>
        </div>

        {/* Place Detail Overlay (Mobile/Desktop) */}
        {selectedPlace && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-md z-[100] animate-in slide-in-from-bottom duration-300">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 flex gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Navigation size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{selectedPlace.name}</h3>
                  <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600">
                    <Search size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {selectedPlace.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
