import React, { useEffect, useState, useRef } from 'react';
import { Location, WeatherData } from '../types';
import { Play, Pause, SkipBack, SkipForward, Layers, Eye, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import L from 'leaflet';

interface RainRadarMapProps {
  location: Location;
  weatherData: WeatherData;
  onSelectLocationByClick?: (lat: number, lng: number) => void;
}

export const RainRadarMap: React.FC<RainRadarMapProps> = ({ location, weatherData, onSelectLocationByClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [currentTimestampIdx, setCurrentTimestampIdx] = useState<number>(0);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);
  const [activeLayerType, setActiveLayerType] = useState<'radar' | 'satellite' | 'temp'>('radar');
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);

  // Fetch RainViewer Live Radar Timestamps
  useEffect(() => {
    async function loadRadarTimestamps() {
      try {
        setIsLoadingRadar(true);
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('Falha ao carregar API RainViewer');
        const data = await res.json();

        const pastFrames = data.radar?.past || [];
        const nowcastFrames = data.radar?.nowcast || [];
        const allTimes = [...pastFrames, ...nowcastFrames].map((f: any) => f.time);

        if (allTimes.length > 0) {
          setTimestamps(allTimes);
          setCurrentTimestampIdx(allTimes.length - 1); // latest frame
        }
      } catch (err) {
        console.warn('Erro na API RainViewer, usando timestamps aproximados:', err);
        const now = Math.floor(Date.now() / 1000);
        const approxTimes = Array.from({ length: 8 }, (_, i) => now - (7 - i) * 600);
        setTimestamps(approxTimes);
        setCurrentTimestampIdx(approxTimes.length - 1);
      } finally {
        setIsLoadingRadar(false);
      }
    }

    loadRadarTimestamps();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 9,
        zoomControl: true,
      });

      // Base Map: OpenStreetMap Dark/CartoDB Dark Matter style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      // Map Click Event for picking coordinates weather
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onSelectLocationByClick) {
          onSelectLocationByClick(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([location.latitude, location.longitude], mapInstanceRef.current.getZoom());
    }
  }, [location]);

  // Update Radar Overlay Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing radar layer
    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (timestamps.length === 0) return;

    const timestamp = timestamps[currentTimestampIdx];
    if (!timestamp) return;

    let tileUrl = '';
    if (activeLayerType === 'radar') {
      // RainViewer animated rain radar tile URL
      tileUrl = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`;
    } else if (activeLayerType === 'satellite') {
      // Infrared cloud satellite coverage
      tileUrl = `https://tilecache.rainviewer.com/v2/satellite/${timestamp}/256/{z}/{x}/{y}/0/0_0.png`;
    } else {
      // OpenWeatherMap or RainViewer fallback
      tileUrl = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`;
    }

    const newLayer = L.tileLayer(tileUrl, {
      opacity: radarOpacity,
      tileSize: 256,
      maxZoom: 18,
    });

    newLayer.addTo(map);
    radarLayerRef.current = newLayer;
  }, [timestamps, currentTimestampIdx, radarOpacity, activeLayerType]);

  // Handle Location Marker & Storm Alert Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon for Selected Location
    const locationIcon = L.divIcon({
      className: 'custom-location-marker',
      html: `<div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-400 opacity-75"></span>
        <div class="relative w-7 h-7 bg-cyan-500 rounded-full border-2 border-white shadow-2xl flex items-center justify-center font-bold text-slate-950 text-xs">
          📍
        </div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([location.latitude, location.longitude], { icon: locationIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: sans-serif; color: #0f172a; padding: 4px;">
        <strong style="font-size: 14px;">${location.name}</strong><br/>
        <span style="font-size: 12px; color: #475569;">Temp: ${weatherData.current.temperature}°C • Chuva: ${weatherData.current.precipitation} mm/h</span>
      </div>
    `);

    // Storm Alerts Markers
    weatherData.alerts.forEach((alert) => {
      if (alert.latitude && alert.longitude) {
        const alertIcon = L.divIcon({
          className: 'custom-alert-marker',
          html: `<div class="w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-slate-950 font-bold text-xs shadow-lg animate-bounce">
            ⚠️
          </div>`,
          iconSize: [24, 24],
        });
        const alertMarker = L.marker([alert.latitude, alert.longitude], { icon: alertIcon }).addTo(map);
        alertMarker.bindPopup(`
          <div style="font-family: sans-serif; color: #9a3412;">
            <strong>${alert.title}</strong><br/>
            <span>${alert.description}</span>
          </div>
        `);
      }
    });
  }, [location, weatherData]);

  // Animation Loop Timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && timestamps.length > 0) {
      interval = setInterval(() => {
        setCurrentTimestampIdx((prev) => (prev + 1) % timestamps.length);
      }, 1000); // 1 second per frame
    }
    return () => clearInterval(interval);
  }, [isPlaying, timestamps]);

  const activeTimestampDate = timestamps[currentTimestampIdx]
    ? new Date(timestamps[currentTimestampIdx] * 1000).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Ao Vivo';

  return (
    <div className="space-y-4 pb-12">
      {/* Map Header Controls */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>RADAR RAINVIEWER SATELLITE</span>
              </span>
              <span className="text-xs text-slate-400">
                Horário da Camada: <strong className="text-white">{activeTimestampDate}</strong>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
              Mapa Interativo de Chuva & Radar de Satélite
            </h2>
          </div>

          {/* Layer Selector Switches */}
          <div className="flex items-center space-x-2 bg-[#0A0C10] p-1.5 rounded-2xl border border-[#1F2937]">
            {[
              { id: 'radar', label: 'Radar Chuva' },
              { id: 'satellite', label: 'Satélite Nuvens' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayerType(layer.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeLayerType === layer.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animated Playback Timeline Controller */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0A0C10] p-3 rounded-2xl border border-[#1F2937]">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setCurrentTimestampIdx((prev) => (prev > 0 ? prev - 1 : timestamps.length - 1))}
              title="Quadro anterior"
              className="p-2 bg-[#11141D] hover:bg-[#1A1F2C] border border-[#1F2937] text-white rounded-xl transition-all cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pausar Radar' : 'Reproduzir Animação'}</span>
            </button>

            <button
              onClick={() => setCurrentTimestampIdx((prev) => (prev < timestamps.length - 1 ? prev + 1 : 0))}
              title="Próximo quadro"
              className="p-2 bg-[#11141D] hover:bg-[#1A1F2C] border border-[#1F2937] text-white rounded-xl transition-all cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline slider */}
          <div className="flex-1 w-full px-2 flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">Passado</span>
            <input
              type="range"
              min={0}
              max={timestamps.length - 1 || 0}
              value={currentTimestampIdx}
              onChange={(e) => setCurrentTimestampIdx(Number(e.target.value))}
              className="w-full accent-blue-500 bg-[#11141D] rounded-lg cursor-pointer h-2"
            />
            <span className="text-xs text-blue-400 font-bold font-mono">Ao Vivo</span>
          </div>

          {/* Opacity slider */}
          <div className="flex items-center space-x-2 shrink-0">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Opacidade:</span>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={radarOpacity}
              onChange={(e) => setRadarOpacity(Number(e.target.value))}
              className="w-20 accent-blue-500 bg-[#11141D] rounded-lg cursor-pointer h-2"
            />
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1F2937] shadow-2xl h-[550px] bg-[#0A0C10]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#11141D]/90 border border-[#1F2937] p-3 rounded-2xl backdrop-blur-md shadow-2xl text-xs space-y-2 max-w-xs">
          <p className="font-bold text-white flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Escala de Intensidade de Chuva (mm/h)</span>
          </p>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-80 shadow-inner" />
          <div className="flex justify-between text-[10px] text-slate-300 font-mono font-bold">
            <span>Fraca (0.5mm)</span>
            <span>Moderada (10mm)</span>
            <span>Forte (&gt;35mm)</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-[#1F2937]">
            💡 Dica: Clique em qualquer ponto do mapa para ver o clima daquela coordenada.
          </p>
        </div>
      </div>
    </div>
  );
};
