import React, { useState, useEffect, useRef } from 'react';
import {
  CloudRain,
  Search,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Star,
  Bell,
  Smartphone,
  BarChart3,
  Code2,
  FileText,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react';
import { Location } from '../types';
import { searchLocations, POPULAR_LOCATIONS } from '../services/weatherService';

interface HeaderProps {
  currentLocation: Location;
  onSelectLocation: (location: Location) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  favorites: Location[];
  onToggleFavorite: (location: Location) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  isOffline,
  onToggleOffline,
  activeTab,
  onChangeTab,
  favorites,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
  activeAlertCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCurrentFavorite = favorites.some((f) => f.id === currentLocation.id);

  return (
    <header className="sticky top-0 z-40 bg-[#0D1017]/95 backdrop-blur-md border-b border-[#1F2937] shadow-2xl">
      {/* Top Banner Alert Bar if active alerts exist */}
      {activeAlertCount > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              ⚠️ <strong>ALERTA METEOROLÓGICO ATIVO:</strong> {activeAlertCount} aviso(s) de tempestade/vento na região.
            </span>
          </div>
          <button
            onClick={() => onChangeTab('alerts')}
            className="bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer"
          >
            Ver Alertas
          </button>
        </div>
      )}

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App Title */}
          <div
            onClick={() => onChangeTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-xl text-white tracking-tight">
                  Clima<span className="text-blue-500 font-black italic">PRO</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Meteorologia & Radar em Tempo Real</p>
            </div>
          </div>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchRef} className="relative flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar cidade, região, país ou coordenadas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className="w-full pl-9 pr-8 py-2 bg-[#11141D] hover:bg-[#151924] text-sm text-slate-200 placeholder-slate-500 rounded-full border border-[#1F2937] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              {isSearching && (
                <RefreshCw className="absolute right-3.5 top-2.5 h-4 w-4 text-blue-400 animate-spin" />
              )}
            </div>

            {/* Dropdown Search Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#11141D] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-[#1F2937]">
                <div className="p-2.5 bg-[#0D1017] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Resultados Encontrados ({searchResults.length})
                </div>
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#1A1F2C] flex items-center justify-between text-slate-200 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-100">{loc.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {loc.region} {loc.country ? `• ${loc.country}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Status Toggles */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Toggle Favorite Location */}
            <button
              onClick={() => onToggleFavorite(currentLocation)}
              title={isCurrentFavorite ? 'Remover dos favoritos' : 'Salvar como localidade favorita'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isCurrentFavorite
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-[#11141D] border-[#1F2937] text-slate-400 hover:text-amber-400'
              }`}
            >
              <Star className={`w-4 h-4 ${isCurrentFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar dados meteorológicos"
              className="p-2 bg-[#11141D] hover:bg-[#1A1F2C] border border-[#1F2937] rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Offline Mode Switch */}
            <button
              onClick={onToggleOffline}
              title={isOffline ? 'Modo Offline Ativo (Clique para mudar para Online)' : 'Alternar Modo Offline'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isOffline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-green-500/10 border-green-500/20 text-green-500'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isOffline ? 'OFFLINE' : 'Modo Offline: Sincronizado'}</span>
            </button>
          </div>
        </div>

        {/* Quick Location Favorites Bar */}
        <div className="flex items-center space-x-2 py-2 overflow-x-auto no-scrollbar border-t border-[#1F2937] text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 font-medium">Locais Salvos:</span>
          </span>
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {favorites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => onSelectLocation(fav)}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs font-medium shrink-0 flex items-center space-x-1 cursor-pointer ${
                  currentLocation.id === fav.id
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold shadow-sm'
                    : 'bg-[#11141D] hover:bg-[#1A1F2C] border border-[#1F2937] text-slate-300'
                }`}
              >
                <span>{fav.name}</span>
                {currentLocation.id === fav.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main View Tabs Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-1 border-t border-[#1F2937] no-scrollbar">
          {[
            { id: 'dashboard', label: 'Visão Geral', icon: BarChart3 },
            { id: 'radar', label: 'Mapa & Radar', icon: MapIcon },
            { id: 'alerts', label: 'Alertas & Push', icon: Bell, badge: activeAlertCount },
            { id: 'ai-report', label: 'Relatório IA', icon: Sparkles },
            { id: 'offline', label: 'Modo Offline', icon: WifiOff },
            { id: 'widgets', label: 'Widgets', icon: Smartphone },
            { id: 'developer-api', label: 'API Dev', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#11141D]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
