/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Location, WeatherData, PushNotificationRule, PushNotificationLog } from './types';
import {
  POPULAR_LOCATIONS,
  fetchWeatherData,
  getCachedWeatherData,
  saveToOfflineCache,
} from './services/weatherService';
import { Header } from './components/Header';
import { WeatherDashboard } from './components/WeatherDashboard';
import { RainRadarMap } from './components/RainRadarMap';
import { StormAlertsPush } from './components/StormAlertsPush';
import { DailyReportAI } from './components/DailyReportAI';
import { OfflineManager } from './components/OfflineManager';
import { WidgetStudio } from './components/WidgetStudio';
import { DeveloperApiPortal } from './components/DeveloperApiPortal';
import { MapPin, RefreshCw, AlertCircle, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<Location>(POPULAR_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // App Modes & Tabs
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Favorites
  const [favorites, setFavorites] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem('climaradar_favorites');
      return saved ? JSON.parse(saved) : POPULAR_LOCATIONS.filter((l) => l.isFavorite);
    } catch {
      return POPULAR_LOCATIONS.filter((l) => l.isFavorite);
    }
  });

  // Push Rules
  const [pushRules, setPushRules] = useState<PushNotificationRule[]>(() => [
    {
      id: 'rule-sp-1',
      regionId: 'sp-br',
      regionName: 'São Paulo (Centro & ZS)',
      latitude: -23.5505,
      longitude: -46.6333,
      enabled: true,
      rainThresholdMm: 15,
      windThresholdKmh: 45,
      tempMinThreshold: 10,
      tempMaxThreshold: 35,
      notifyStorms: true,
      dailySummaryTime: '07:00',
      channelWebPush: true,
    },
    {
      id: 'rule-fazenda-1',
      regionId: 'fazenda-1',
      regionName: 'Fazenda Vale do Sol - Lavouras',
      latitude: -22.9068,
      longitude: -43.1729,
      enabled: true,
      rainThresholdMm: 10,
      windThresholdKmh: 35,
      tempMinThreshold: 8,
      tempMaxThreshold: 38,
      notifyStorms: true,
      dailySummaryTime: '06:30',
      channelWebPush: true,
    },
  ]);

  // Push Notification Logs
  const [pushLogs, setPushLogs] = useState<PushNotificationLog[]>(() => [
    {
      id: 'log-1',
      title: '⚠️ ALERTA DE CHUVA FORTE',
      body: 'Acumulado instantâneo de 18.5 mm/h detectado em São Paulo.',
      regionName: 'São Paulo (Centro & ZS)',
      timestamp: 'Hoje, 14:30',
      severity: 'high',
      read: true,
    },
  ]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('climaradar_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Erro ao salvar favoritos:', e);
    }
  }, [favorites]);

  // Load weather data on location or offline mode change
  const loadWeather = async (loc: Location, offlineMode = isOffline) => {
    setIsRefreshing(true);
    setErrorMessage(null);

    if (offlineMode) {
      const cached = getCachedWeatherData(loc.id);
      if (cached) {
        setWeatherData(cached);
      } else {
        setErrorMessage(`Não há dados pré-carregados em cache para ${loc.name}. Por favor, conecte-se para baixar os dados.`);
      }
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
    } catch (err: any) {
      console.warn('Erro ao carregar dados online, tentando cache:', err);
      const cached = getCachedWeatherData(loc.id);
      if (cached) {
        setWeatherData(cached);
      } else {
        setErrorMessage('Não foi possível obter os dados meteorológicos. Verifique a sua conexão.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(currentLocation, isOffline);
  }, [currentLocation.id, isOffline]);

  // User Geolocation locator
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsRefreshing(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLoc: Location = {
            id: `gps-${Date.now()}`,
            name: 'Minha Localização',
            region: 'GPS Atual',
            country: 'Brasil',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(userLoc);
        },
        (error) => {
          console.warn('Erro ao obter GPS:', error);
          setIsRefreshing(false);
          alert('Não foi possível obter a sua localização GPS atual.');
        }
      );
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (loc: Location) => {
    if (favorites.some((f) => f.id === loc.id)) {
      setFavorites(favorites.filter((f) => f.id !== loc.id));
    } else {
      setFavorites([...favorites, { ...loc, isFavorite: true }]);
    }
  };

  // Push Rule Operations
  const handleSavePushRule = (rule: PushNotificationRule) => {
    setPushRules([rule, ...pushRules]);
  };

  const handleDeletePushRule = (id: string) => {
    setPushRules(pushRules.filter((r) => r.id !== id));
  };

  const handleAddPushLog = (log: PushNotificationLog) => {
    setPushLogs([log, ...pushLogs]);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Mobile Frame Bar Toggle */}
      <div className="bg-[#0D1017] border-b border-[#1F2937] text-[11px] px-4 py-1.5 flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="font-semibold text-slate-300">ClimaRadar Pro Engine v1.0</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleUseCurrentLocation}
            className="hover:text-blue-400 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <MapPin className="w-3 h-3 text-blue-400" />
            <span>Usar Meu GPS</span>
          </button>

          <div className="h-3 w-px bg-[#1F2937]" />

          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hover:text-white flex items-center space-x-1 cursor-pointer font-semibold text-blue-400 transition-colors"
          >
            {isMobileFrame ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
            <span>{isMobileFrame ? 'Modo Expandido Desktop' : 'Modo Moldura Mobile'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className={`flex-1 flex flex-col ${isMobileFrame ? 'max-w-md mx-auto my-6 border-8 border-[#1F2937] rounded-[44px] shadow-2xl overflow-hidden bg-[#0A0C10]' : 'w-full'}`}>
        {/* Header */}
        <Header
          currentLocation={currentLocation}
          onSelectLocation={(loc) => setCurrentLocation(loc)}
          isOffline={isOffline}
          onToggleOffline={() => setIsOffline(!isOffline)}
          activeTab={activeTab}
          onChangeTab={(t) => setActiveTab(t)}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onRefresh={() => loadWeather(currentLocation)}
          isRefreshing={isRefreshing}
          activeAlertCount={weatherData?.alerts.filter((a) => a.active).length || 0}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {isLoading && !weatherData ? (
            <div className="py-24 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <p className="text-slate-400 text-sm font-medium">Carregando dados meteorológicos em tempo real...</p>
            </div>
          ) : errorMessage && !weatherData ? (
            <div className="py-16 text-center space-y-4 bg-red-950/40 border border-red-800/60 rounded-3xl p-8 max-w-lg mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Falha ao Carregar Dados</h3>
              <p className="text-xs text-slate-300">{errorMessage}</p>
              <button
                onClick={() => loadWeather(currentLocation, false)}
                className="bg-cyan-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Tentar Novamente Online
              </button>
            </div>
          ) : weatherData ? (
            <>
              {activeTab === 'dashboard' && (
                <WeatherDashboard
                  weatherData={weatherData}
                  isOffline={isOffline}
                  onOpenAiReport={() => setActiveTab('ai-report')}
                  onOpenRadarMap={() => setActiveTab('radar')}
                  onOpenAlerts={() => setActiveTab('alerts')}
                />
              )}

              {activeTab === 'radar' && (
                <RainRadarMap
                  location={currentLocation}
                  weatherData={weatherData}
                  onSelectLocationByClick={(lat, lng) => {
                    const clickLoc: Location = {
                      id: `click-${Date.now()}`,
                      name: `Ponto (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
                      region: 'Mapa Interativo',
                      country: 'Brasil',
                      latitude: lat,
                      longitude: lng,
                    };
                    setCurrentLocation(clickLoc);
                  }}
                />
              )}

              {activeTab === 'alerts' && (
                <StormAlertsPush
                  alerts={weatherData.alerts}
                  currentLocation={currentLocation}
                  pushRules={pushRules}
                  onSavePushRule={handleSavePushRule}
                  onDeletePushRule={handleDeletePushRule}
                  logs={pushLogs}
                  onAddLog={handleAddPushLog}
                />
              )}

              {activeTab === 'ai-report' && <DailyReportAI weatherData={weatherData} />}

              {activeTab === 'offline' && (
                <OfflineManager
                  isOffline={isOffline}
                  onToggleOffline={() => setIsOffline(!isOffline)}
                  favorites={favorites}
                  onSelectCachedLocation={(cachedData) => {
                    setWeatherData(cachedData);
                    setCurrentLocation(cachedData.location);
                    setIsOffline(true);
                    setActiveTab('dashboard');
                  }}
                />
              )}

              {activeTab === 'widgets' && <WidgetStudio weatherData={weatherData} />}

              {activeTab === 'developer-api' && <DeveloperApiPortal />}
            </>
          ) : null}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-center text-xs text-slate-500 space-y-1 mt-auto">
          <p className="font-semibold text-slate-400">
            ClimaRadar Pro © 2026 — Produto Meteorológico de Alta Precisão
          </p>
          <p className="text-[11px]">
            Fontes de Dados: Open-Meteo Global Station API, RainViewer Radar Layers, Gemini 2.5 Flash AI Engine
          </p>
        </footer>
      </div>
    </div>
  );
}
