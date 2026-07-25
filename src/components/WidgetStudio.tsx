import React, { useState } from 'react';
import { Smartphone, LayoutGrid, Check, Copy, Sparkles, CloudRain, Wind, Sun, Layers, ShieldAlert, Eye } from 'lucide-react';
import { WeatherData, WidgetConfig } from '../types';

interface WidgetStudioProps {
  weatherData: WeatherData;
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ weatherData }) => {
  const { location, current, daily, alerts } = weatherData;

  const [size, setSize] = useState<'2x2' | '4x2' | '4x4' | 'lockscreen'>('4x2');
  const [theme, setTheme] = useState<'glass' | 'dark' | 'light' | 'neon'>('glass');
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showMetrics, setShowMetrics] = useState<('temp' | 'rain' | 'wind')[]>(['temp', 'rain', 'wind']);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const toggleMetric = (metric: 'temp' | 'rain' | 'wind') => {
    if (showMetrics.includes(metric)) {
      setShowMetrics(showMetrics.filter((m) => m !== metric));
    } else {
      setShowMetrics([...showMetrics, metric]);
    }
  };

  const widgetConfigCode = JSON.stringify(
    {
      widgetType: 'ClimaRadarProWidget',
      version: '1.0',
      size,
      theme,
      location: location.name,
      metrics: showMetrics,
      radarThumbnail: showRadar,
      refreshIntervalMin: 15,
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetConfigCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Theme styling mapping
  const themeClasses = {
    glass: 'bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-2xl',
    dark: 'bg-slate-950 border border-slate-800 text-white shadow-2xl',
    light: 'bg-slate-100 border border-slate-300 text-slate-900 shadow-xl',
    neon: 'bg-slate-950 border-2 border-cyan-500/80 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-2">
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
          SISTEMA DE WIDGETS PERSONALIZÁVEIS
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Estúdio de Widgets para Tela Inicial Mobile
        </h1>
        <p className="text-xs text-slate-400">
          Personalize o visual e as informações do seu widget para iOS e Android. Acompanhe a chuva e a temperatura direto na tela inicial.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-blue-400" />
            <span>Configurações do Widget</span>
          </h2>

          {/* Size Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tamanho do Widget:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '2x2', label: '2x2 Compacto' },
                { id: '4x2', label: '4x2 Médio' },
                { id: '4x4', label: '4x4 Completo' },
                { id: 'lockscreen', label: 'Tela de Bloqueio' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSize(item.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    size === item.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-[#0A0C10] border-[#1F2937] text-slate-300 hover:bg-[#1A1F2C]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tema Visual:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'glass', label: 'Glassmorphism' },
                { id: 'dark', label: 'Dark OLED' },
                { id: 'light', label: 'Light Minimal' },
                { id: 'neon', label: 'Neon Cyber' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    theme === item.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-[#0A0C10] border-[#1F2937] text-slate-300 hover:bg-[#1A1F2C]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#1F2937]">
            <label className="text-xs font-semibold text-slate-300">Métricas Exibidas:</label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMetrics.includes('temp')}
                  onChange={() => toggleMetric('temp')}
                  className="rounded border-[#1F2937] text-blue-500"
                />
                <span>Temperatura Atual & Sensação</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMetrics.includes('rain')}
                  onChange={() => toggleMetric('rain')}
                  className="rounded border-[#1F2937] text-blue-500"
                />
                <span>Chuva em mm/h & Acumulado</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMetrics.includes('wind')}
                  onChange={() => toggleMetric('wind')}
                  className="rounded border-[#1F2937] text-blue-500"
                />
                <span>Velocidade e Direção do Vento</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRadar}
                  onChange={(e) => setShowRadar(e.target.checked)}
                  className="rounded border-[#1F2937] text-blue-500"
                />
                <span>Miniatura do Radar de Chuva em Tempo Real</span>
              </label>
            </div>
          </div>

          {/* Copy Config JSON Code */}
          <div className="space-y-2 pt-2 border-t border-[#1F2937]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Código de Configuração:</span>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar Config'}</span>
              </button>
            </div>
            <pre className="bg-[#0A0C10] p-3 rounded-xl border border-[#1F2937] text-[11px] text-blue-300 font-mono overflow-x-auto max-h-36">
              {widgetConfigCode}
            </pre>
          </div>
        </div>

        {/* Live Mobile Home Screen Preview Mockup (7 cols) */}
        <div className="lg:col-span-7 bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Simulador de Tela Inicial Mobile (iPhone / Android)</span>
          </div>

          {/* Phone Frame Mockup */}
          <div className="w-full max-w-sm bg-[#0A0C10] border-4 border-[#1F2937] rounded-[40px] p-4 shadow-2xl relative space-y-4 min-h-[580px] flex flex-col justify-between overflow-hidden">
            {/* Top Phone Notch */}
            <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto" />

            {/* Simulated Phone Home Screen Content */}
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* THE CUSTOM WIDGET PREVIEW */}
              <div className={`p-4 rounded-3xl transition-all ${themeClasses[theme]}`}>
                {/* 2x2 Compact Size */}
                {size === '2x2' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{location.name}</span>
                      <CloudRain className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold">{current.temperature}°C</div>
                      <p className="text-[10px] opacity-80">{current.weatherDescription}</p>
                    </div>
                    {showMetrics.includes('rain') && (
                      <div className="text-[10px] text-cyan-300 font-bold flex items-center space-x-1 pt-1 border-t border-white/10">
                        <span>Chuva: {current.precipitation} mm/h</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 4x2 Medium Size */}
                {size === '4x2' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm">{location.name}</h4>
                        <p className="text-[11px] opacity-80 capitalize">{current.weatherDescription}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold">{current.temperature}°C</span>
                        <p className="text-[10px] opacity-80">Sensação {current.apparentTemperature}°C</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-white/10">
                      <div className="bg-black/20 p-1.5 rounded-xl">
                        <span className="opacity-70">Chuva</span>
                        <p className="font-bold">{current.precipitation} mm</p>
                      </div>
                      <div className="bg-black/20 p-1.5 rounded-xl">
                        <span className="opacity-70">Vento</span>
                        <p className="font-bold">{current.windSpeed} km/h</p>
                      </div>
                      <div className="bg-black/20 p-1.5 rounded-xl">
                        <span className="opacity-70">Umidade</span>
                        <p className="font-bold">{current.humidity}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4x4 Complete Size */}
                {size === '4x4' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">CLIMARADAR PRO</span>
                        <h4 className="font-extrabold text-base">{location.name}</h4>
                      </div>
                      <CloudRain className="w-7 h-7 text-cyan-400" />
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-4xl font-extrabold">{current.temperature}°C</span>
                      <span className="text-xs font-bold">{current.weatherDescription}</span>
                    </div>

                    {showRadar && (
                      <div className="h-24 bg-slate-900 rounded-2xl border border-white/10 p-2 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 via-blue-900/40 to-slate-950" />
                        <span className="relative z-10 text-[10px] font-bold text-cyan-300 flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1" />
                          <span>Miniatura Radar de Chuva em Tempo Real</span>
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-white/10">
                      <div>
                        <span className="opacity-70">Chuva</span>
                        <p className="font-bold">{current.precipitation} mm/h</p>
                      </div>
                      <div>
                        <span className="opacity-70">Vento</span>
                        <p className="font-bold">{current.windSpeed} km/h</p>
                      </div>
                      <div>
                        <span className="opacity-70">Pressão</span>
                        <p className="font-bold">{current.pressure} hPa</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lock Screen Minimal Size */}
                {size === 'lockscreen' && (
                  <div className="flex items-center justify-between py-1 px-2">
                    <div className="flex items-center space-x-2">
                      <CloudRain className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-sm">{location.name}</span>
                    </div>
                    <div className="text-sm font-extrabold">
                      {current.temperature}°C • {current.precipitation} mm
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative App Icons Grid below widget */}
              <div className="grid grid-cols-4 gap-3 pt-4">
                {['Photos', 'Mail', 'Maps', 'Calendar', 'Music', 'Settings', 'Clock', 'Camera'].map((app, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <div className="w-12 h-12 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow" />
                    <span className="text-[9px] text-slate-500 font-medium">{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Phone Dock */}
            <div className="w-28 h-1 bg-slate-800 rounded-full mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
