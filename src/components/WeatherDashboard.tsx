import React from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Gauge,
  Eye,
  Cloud,
  Thermometer,
  Zap,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { WeatherData } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface WeatherDashboardProps {
  weatherData: WeatherData;
  isOffline: boolean;
  onOpenAiReport: () => void;
  onOpenRadarMap: () => void;
  onOpenAlerts: () => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  weatherData,
  isOffline,
  onOpenAiReport,
  onOpenRadarMap,
  onOpenAlerts,
}) => {
  const { location, current, hourly, daily, alerts, airQuality } = weatherData;

  // Formatting rain intensity badge
  const getRainIntensityBadge = (mm: number) => {
    if (mm === 0) return { label: 'Sem Chuva', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (mm < 2.5) return { label: 'Garoa Leve', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    if (mm < 10) return { label: 'Chuva Moderada', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    if (mm < 35) return { label: 'Chuva Forte (Atenção)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'Chuva Torrencial / Tempestade', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
  };

  const rainBadge = getRainIntensityBadge(current.precipitation);

  return (
    <div className="space-y-6 pb-12">
      {/* Offline Mode Alert Strip */}
      {isOffline && (
        <div className="bg-amber-950/80 border border-amber-700/60 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">Modo Offline Ativo - Dados Pré-carregados</h4>
              <p className="text-xs text-amber-300/80">
                Você está consultando informações meteorológicas salvas do cache local ({current.updatedAt}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero Weather Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#11141D] border border-[#1F2937] p-6 sm:p-8 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Location & Current Status */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Estação em Tempo Real</span>
              </span>
              <span className="text-xs text-slate-500">Atualizado às {current.updatedAt}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {location.name}
              <span className="text-slate-400 font-normal text-lg ml-2">
                ({location.region} {location.country ? `• ${location.country}` : ''})
              </span>
            </h1>

            <p className="text-lg text-slate-200 font-medium capitalize flex items-center space-x-2">
              <span>{current.weatherDescription}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${rainBadge.bg}`}>
                {rainBadge.label}
              </span>
            </p>
          </div>

          {/* Temperature & High/Low Display */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="flex items-start justify-end">
                <span className="text-7xl font-thin tracking-tighter text-white">
                  {current.temperature}
                </span>
                <span className="text-4xl font-light text-blue-500 italic ml-1 mt-2">°C</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Sensação térmica {current.apparentTemperature}°C</p>
              <div className="flex items-center justify-end space-x-3 mt-1 text-xs font-semibold text-slate-300">
                <span className="flex items-center text-red-400">
                  <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                  {daily[0]?.temperatureMax || 28}°C
                </span>
                <span className="flex items-center text-blue-400">
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                  {daily[0]?.temperatureMin || 18}°C
                </span>
              </div>
            </div>

            <div className="w-20 h-20 rounded-2xl bg-[#0A0C10] border border-[#1F2937] flex items-center justify-center p-3 shadow-inner">
              <CloudRain className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* AI Quick Insight Banner inside Card */}
        <div className="mt-6 pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D1017] rounded-2xl p-4 border border-[#1F2937]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                <span>Relatório de Meteorologia IA</span>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-1.5 py-0.2 rounded font-mono">
                  GEMINI 2.5
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Gere uma análise diária detalhada com projeção agrometeorológica e recomendações para esta região.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAiReport}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <span>Gerar Boletim IA</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 6 Real-time Key Meteorological Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Precipitation & Rain Millimeters */}
        <div className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-2xl p-5 space-y-2 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Milimetragem</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {current.precipitation} <span className="text-xs font-normal text-slate-400">mm/h</span>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[45%]" />
            </div>
          </div>
        </div>

        {/* 2. Wind Speed & Direction */}
        <div className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-2xl p-5 space-y-2 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Velocidade Vento</span>
            <Wind className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {current.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="flex gap-1 mt-3">
              <div className="w-1 h-2 bg-blue-500 rounded-full" />
              <div className="w-1 h-3 bg-blue-500 rounded-full" />
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
              <div className="w-1 h-2 bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>

        {/* 3. Relative Humidity */}
        <div className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-2xl p-5 space-y-2 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Umidade Relativa</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {current.humidity}<span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-green-500 mt-2 font-semibold">Estável nas últimas horas</p>
          </div>
        </div>

        {/* 4. UV Index */}
        <div className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-2xl p-5 space-y-2 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Índice UV</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{current.uvIndex < 10 ? `0${current.uvIndex}` : current.uvIndex} <span className="text-xs font-normal text-slate-400">{current.uvIndex > 7 ? 'Alto' : 'Baixo'}</span></div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Sem risco de exposição</p>
          </div>
        </div>

        {/* 5. Atmospheric Pressure */}
        <div className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-2xl p-5 space-y-2 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Pressão</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Sistemas equilibrados</p>
          </div>
        </div>

        {/* 6. Cloud Cover & Visibility */}
        <div className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-2xl p-5 space-y-2 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Nuvens</span>
            <Cloud className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {current.cloudCover}<span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Visibilidade {current.visibility} km</p>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast Chart & Timeline */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <span>Projeção Hora a Hora (Próximas 24 Horas)</span>
            </h3>
            <p className="text-xs text-slate-400">Variação de temperatura (°C) e volume de chuva por hora (mm)</p>
          </div>
          <button
            onClick={onOpenRadarMap}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver no Radar Animado</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recharts Area & Bar Visualization */}
        <div className="h-56 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1 shadow-2xl">
                        <p className="font-bold text-cyan-400">{data.time}</p>
                        <p className="text-white font-semibold">Temperatura: {data.temperature}°C</p>
                        <p className="text-blue-300">Chuva: {data.precipitation} mm ({data.precipitationProbability}% prob.)</p>
                        <p className="text-slate-400">Vento: {data.windSpeed} km/h</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="temperature" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Cards Scrollbar */}
        <div className="flex space-x-3 overflow-x-auto pb-2 pt-2 no-scrollbar border-t border-slate-800">
          {hourly.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-3 min-w-[85px] text-center space-y-1 shrink-0 transition-all"
            >
              <p className="text-xs font-semibold text-slate-400">{item.time}</p>
              <p className="text-base font-extrabold text-white">{item.temperature}°C</p>
              <div className="flex items-center justify-center space-x-1 text-[11px] text-blue-300">
                <CloudRain className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{item.precipitation} mm</span>
              </div>
              <p className="text-[10px] text-slate-500">{item.precipitationProbability}% prob.</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast & Regional Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Daily Forecast List (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Previsão Estendida para os Próximos 7 Dias</span>
          </h3>

          <div className="divide-y divide-slate-800/80">
            {daily.map((day, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="w-24 shrink-0">
                  <p className="font-bold text-sm text-white">{day.weekday}</p>
                  <p className="text-xs text-slate-400">{day.date}</p>
                </div>

                <div className="flex-1 min-w-0 flex items-center space-x-3">
                  <CloudRain className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="text-xs text-slate-300 truncate font-medium">{day.weatherDescription}</span>
                </div>

                {/* Rain Probability Pill */}
                <div className="w-24 text-center shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    day.precipitationSum > 5
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {day.precipitationSum} mm ({day.precipitationProbabilityMax}%)
                  </span>
                </div>

                {/* Min / Max Temp Bar */}
                <div className="w-32 flex items-center justify-end space-x-3 text-sm font-extrabold shrink-0">
                  <span className="text-cyan-400">{day.temperatureMin}°</span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(20, ((day.temperatureMax - day.temperatureMin) / 20) * 100))}%` }}
                    />
                  </div>
                  <span className="text-amber-400">{day.temperatureMax}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Active Alerts & Air Quality Sidebar */}
        <div className="space-y-6">
          {/* Active Storm Alerts Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Alertas em Vigor</span>
              </h3>
              <button
                onClick={onOpenAlerts}
                className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer"
              >
                Gerenciar Push
              </button>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 shadow-inner ${
                      alert.severity === 'extreme' || alert.severity === 'high'
                        ? 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{alert.title}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{alert.description}</p>
                    <div className="pt-2 border-t border-amber-800/40 text-[11px] space-y-1">
                      <p className="font-semibold text-amber-300">Recomendações:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {alert.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-slate-200">Sem Alertas Severos no Momento</p>
                <p>O monitoramento meteorológico continuará ativo enviando notificações push se houver tempestades.</p>
              </div>
            )}
          </div>

          {/* Air Quality Index Card */}
          {airQuality && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Qualidade do Ar (AQI)</h4>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  AQI {airQuality.aqi}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{airQuality.label}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                <div className="bg-slate-950/60 p-2 rounded-xl">
                  <span className="text-slate-400">PM2.5:</span> <strong className="text-white">{airQuality.pm25} µg/m³</strong>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl">
                  <span className="text-slate-400">PM10:</span> <strong className="text-white">{airQuality.pm10} µg/m³</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
