import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Database, RefreshCw, Trash2, CheckCircle2, DownloadCloud, HardDrive, MapPin } from 'lucide-react';
import { Location, WeatherData, OfflineCacheRecord } from '../types';
import { getOfflineCacheRecords, fetchWeatherData, saveToOfflineCache } from '../services/weatherService';

interface OfflineManagerProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  favorites: Location[];
  onSelectCachedLocation: (data: WeatherData) => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  isOffline,
  onToggleOffline,
  favorites,
  onSelectCachedLocation,
}) => {
  const [cacheRecords, setCacheRecords] = useState<OfflineCacheRecord[]>([]);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [preloadStatusMessage, setPreloadStatusMessage] = useState<string | null>(null);

  const loadCache = () => {
    setCacheRecords(getOfflineCacheRecords());
  };

  useEffect(() => {
    loadCache();
  }, []);

  // Preload weather for all favorite locations to enable offline access
  const handlePreloadFavorites = async () => {
    setIsPreloading(true);
    setPreloadStatusMessage('Baixando dados meteorológicos de todos os locais favoritos...');

    let count = 0;
    for (const fav of favorites) {
      try {
        const data = await fetchWeatherData(fav);
        saveToOfflineCache(fav.id, fav.name, data);
        count++;
      } catch (err) {
        console.warn(`Erro ao pré-carregar ${fav.name}:`, err);
      }
    }

    loadCache();
    setIsPreloading(false);
    setPreloadStatusMessage(`${count} localidade(s) pré-carregada(s) com sucesso para consulta offline!`);
    setTimeout(() => setPreloadStatusMessage(null), 4000);
  };

  const handleClearCache = () => {
    localStorage.removeItem('climaradar_offline_cache_v1');
    loadCache();
  };

  const totalBytes = cacheRecords.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
  const totalKb = (totalBytes / 1024).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                  isOffline
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>{isOffline ? 'MODO OFFLINE ATIVO' : 'MODO ONLINE ATIVO'}</span>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Gerenciador de Dados Offline & Cache Local
            </h1>
            <p className="text-xs text-slate-400">
              Consulte dados meteorológicos salvos mesmo sem conexão com a internet ou em áreas rurais sem sinal.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleOffline}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer ${
                isOffline
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-[#0A0C10] hover:bg-[#1A1F2C] text-white border border-[#1F2937]'
              }`}
            >
              {isOffline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isOffline ? 'Alternar para Online' : 'Simular Modo Offline'}</span>
            </button>
          </div>
        </div>

        {/* Preload Action Bar */}
        <div className="pt-4 border-t border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>
              Armazenamento em Cache: <strong className="text-white">{cacheRecords.length} localidades</strong> ({totalKb} KB)
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handlePreloadFavorites}
              disabled={isPreloading || isOffline}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud className={`w-4 h-4 ${isPreloading ? 'animate-bounce' : ''}`} />
              <span>{isPreloading ? 'Pré-carregando...' : 'Pré-carregar Locais Favoritos'}</span>
            </button>

            {cacheRecords.length > 0 && (
              <button
                onClick={handleClearCache}
                title="Limpar cache offline"
                className="p-2 bg-[#0A0C10] hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl border border-[#1F2937] transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preload Message Banner */}
      {preloadStatusMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3 text-emerald-200 text-xs font-semibold shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{preloadStatusMessage}</span>
        </div>
      )}

      {/* Cached Locations List */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-400" />
          <span>Dados Meteorológicos Pré-carregados no Dispositivo</span>
        </h2>

        {cacheRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cacheRecords.map((record) => (
              <div
                key={record.locationId}
                className="bg-[#0A0C10] border border-[#1F2937] hover:border-slate-700 p-4 rounded-2xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white">{record.locationName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Salvo em: {record.cachedAt}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-[#11141D] px-2 py-0.5 rounded border border-[#1F2937]">
                    {((record.sizeBytes || 0) / 1024).toFixed(1)} KB
                  </span>
                </div>

                {/* Quick Snapshot Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#11141D] p-2.5 rounded-xl border border-[#1F2937]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Temp</span>
                    <p className="font-extrabold text-white">{record.data.current.temperature}°C</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Chuva</span>
                    <p className="font-extrabold text-blue-400">{record.data.current.precipitation} mm</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Vento</span>
                    <p className="font-extrabold text-cyan-300">{record.data.current.windSpeed} km/h</p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCachedLocation(record.data)}
                  className="w-full bg-[#11141D] hover:bg-[#1A1F2C] text-blue-300 font-bold text-xs py-2 rounded-xl border border-[#1F2937] transition-all cursor-pointer"
                >
                  Consultar Dados Desse Local Offline
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs space-y-2 bg-[#0A0C10] rounded-2xl border border-[#1F2937]">
            <Database className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="font-semibold text-slate-200">Nenhum dado salvo em cache até o momento</p>
            <p>Clique em "Pré-carregar Locais Favoritos" acima para disponibilizar consultas sem internet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
