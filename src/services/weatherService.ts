import { WeatherData, Location, StormAlert, OfflineCacheRecord } from '../types';

// Default initial locations (Brazil & major world hubs)
export const POPULAR_LOCATIONS: Location[] = [
  { id: 'sp-br', name: 'São Paulo', region: 'SP', country: 'Brasil', latitude: -23.5505, longitude: -46.6333, isFavorite: true },
  { id: 'rj-br', name: 'Rio de Janeiro', region: 'RJ', country: 'Brasil', latitude: -22.9068, longitude: -43.1729, isFavorite: true },
  { id: 'bsb-br', name: 'Brasília', region: 'DF', country: 'Brasil', latitude: -15.7975, longitude: -47.8919, isFavorite: true },
  { id: 'cur-br', name: 'Curitiba', region: 'PR', country: 'Brasil', latitude: -25.4284, longitude: -49.2733, isFavorite: false },
  { id: 'salv-br', name: 'Salvador', region: 'BA', country: 'Brasil', latitude: -12.9777, longitude: -38.5016, isFavorite: false },
  { id: 'poa-br', name: 'Porto Alegre', region: 'RS', country: 'Brasil', latitude: -30.0346, longitude: -51.2177, isFavorite: false },
  { id: 'rec-br', name: 'Recife', region: 'PE', country: 'Brasil', latitude: -8.0476, longitude: -34.8770, isFavorite: false },
  { id: 'nyc-us', name: 'Nova York', region: 'NY', country: 'Estados Unidos', latitude: 40.7128, longitude: -74.0060, isFavorite: false },
];

export const WEATHER_CODES_PT: Record<number, { description: string; icon: string }> = {
  0: { description: 'Céu Limpo', icon: 'Sun' },
  1: { description: 'Predominantemente Límpido', icon: 'SunDim' },
  2: { description: 'Parcialmente Nublado', icon: 'CloudSun' },
  3: { description: 'Nublado', icon: 'Cloud' },
  45: { description: 'Nevoeiro', icon: 'CloudFog' },
  48: { description: 'Nevoeiro com Geada', icon: 'CloudFog' },
  51: { description: 'Garoa Leve', icon: 'CloudDrizzle' },
  53: { description: 'Garoa Moderada', icon: 'CloudDrizzle' },
  55: { description: 'Garoa Densa', icon: 'CloudRain' },
  61: { description: 'Chuva Fraca', icon: 'CloudRain' },
  63: { description: 'Chuva Moderada', icon: 'CloudRain' },
  65: { description: 'Chuva Forte', icon: 'CloudRainWind' },
  80: { description: 'Pancadas de Chuva Leves', icon: 'CloudRain' },
  81: { description: 'Pancadas de Chuva Moderadas', icon: 'CloudRainWind' },
  82: { description: 'Pancadas de Chuva Violentas', icon: 'CloudLightning' },
  95: { description: 'Tempestade Elétrica', icon: 'Zap' },
  96: { description: 'Tempestade com Granizo Leve', icon: 'CloudHail' },
  99: { description: 'Tempestade Severa com Granizo', icon: 'CloudHail' },
};

export function getWeatherMeta(code: number) {
  return WEATHER_CODES_PT[code] || { description: 'Variável', icon: 'Cloud' };
}

// Search locations via Open-Meteo Geocoding
export async function searchLocations(query: string): Promise<Location[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=pt&format=json`
    );
    if (!res.ok) throw new Error('Falha na busca de localidades');
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: `${item.id}`,
      name: item.name,
      region: item.admin1 || item.country || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      timezone: item.timezone,
    }));
  } catch (err) {
    console.warn('Erro ao pesquisar localidade, usando filtro offline:', err);
    return POPULAR_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.region.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Fetch real-time weather data for a location
export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao obter dados de clima em tempo real');
  }

  const json = await response.json();
  const current = json.current;
  const hourly = json.hourly;
  const daily = json.daily;

  const weatherMeta = getWeatherMeta(current.weather_code);

  // Compute 24h accumulated rain from hourly precipitation
  const first24Rain = hourly.precipitation ? hourly.precipitation.slice(0, 24).reduce((a: number, b: number) => a + b, 0) : current.precipitation || 0;

  // Build hourly forecast objects for next 24 hours
  const hourlyForecasts = (hourly.time || []).slice(0, 24).map((timeStr: string, idx: number) => ({
    time: new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temperature: Math.round(hourly.temperature_2m[idx]),
    precipitation: Number((hourly.precipitation[idx] || 0).toFixed(1)),
    precipitationProbability: Math.round(hourly.precipitation_probability[idx] || 0),
    weatherCode: hourly.weather_code[idx],
    windSpeed: Math.round(hourly.wind_speed_10m[idx] || 0),
    humidity: Math.round(hourly.relative_humidity_2m[idx] || 0),
  }));

  // Build daily forecasts for next 7 days
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dailyForecasts = (daily.time || []).map((dateStr: string, idx: number) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayMeta = getWeatherMeta(daily.weather_code[idx]);
    return {
      date: dateStr,
      weekday: idx === 0 ? 'Hoje' : weekdays[d.getDay()],
      temperatureMax: Math.round(daily.temperature_2m_max[idx]),
      temperatureMin: Math.round(daily.temperature_2m_min[idx]),
      precipitationSum: Number((daily.precipitation_sum[idx] || 0).toFixed(1)),
      precipitationProbabilityMax: Math.round(daily.precipitation_probability_max[idx] || 0),
      weatherCode: daily.weather_code[idx],
      weatherDescription: dayMeta.description,
      windSpeedMax: Math.round(daily.wind_speed_10m_max[idx] || 0),
      uvIndexMax: Number((daily.uv_index_max[idx] || 0).toFixed(1)),
    };
  });

  // Calculate potential storm alerts
  const alerts: StormAlert[] = [];
  const currentPrecip = current.precipitation || current.rain || 0;
  const currentWind = current.wind_speed_10m || 0;

  if (currentPrecip > 15 || current.weather_code >= 80) {
    alerts.push({
      id: `alert-rain-${Date.now()}`,
      title: 'Alerta Amarelo: Chuva Volumosa em Tempo Real',
      description: `Acumulado de precipitação atingindo ${currentPrecip.toFixed(1)} mm/h com risco de alagamentos pontuais.`,
      severity: currentPrecip > 30 ? 'extreme' : 'high',
      category: 'rain',
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      startTime: 'Agora',
      endTime: 'Próximas 6 horas',
      recommendations: [
        'Evite transitar por vias sujeitas a alagamento',
        'Mantenha aparelhos elétricos desconectados da tomada se houver descargas',
        'Monitore as calhas e ralo de escoamento',
      ],
      active: true,
    });
  }

  if (currentWind > 45 || current.weather_code === 95 || current.weather_code >= 96) {
    alerts.push({
      id: `alert-wind-${Date.now()}`,
      title: 'Aviso Meteorológico: Vendaval e Descargas Elétricas',
      description: `Ventos intensos registrados em ${Math.round(currentWind)} km/h com atividade de tempestade nas proximidades.`,
      severity: currentWind > 65 ? 'extreme' : 'high',
      category: 'storm',
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      startTime: 'Agora',
      endTime: 'Próximas 4 horas',
      recommendations: [
        'Não se abrigue debaixo de árvores ou estruturas metálicas frágeis',
        'Atenção com queda de galhos e fiação elétrica na região',
        'Estacione veículos em locais cobertos longe de torres',
      ],
      active: true,
    });
  }

  // Always supply a baseline regional meteorological advisory if clear
  if (alerts.length === 0) {
    alerts.push({
      id: `alert-normal-${Date.now()}`,
      title: 'Boletim da Região: Condições Normais Monitoradas',
      description: `Meteorologia estável em ${location.name}. Sem ocorrência de tempo severo até o momento.`,
      severity: 'low',
      category: 'rain',
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      startTime: 'Ativo',
      endTime: '24 horas',
      recommendations: [
        'Aproveite as condições favoráveis',
        'Mantenha o monitoramento automático ativado no app',
      ],
      active: true,
    });
  }

  const resultData: WeatherData = {
    location,
    current: {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      precipitation: Number(currentPrecip.toFixed(1)),
      rainAccumulated24h: Number(first24Rain.toFixed(1)),
      windSpeed: Math.round(currentWind),
      windDirection: Math.round(current.wind_direction_10m || 0),
      humidity: Math.round(current.relative_humidity_2m),
      pressure: Math.round(current.pressure_msl || current.surface_pressure || 1013),
      uvIndex: Number((hourly.uv_index?.[0] || 4.5).toFixed(1)),
      weatherCode: current.weather_code,
      weatherDescription: weatherMeta.description,
      weatherIcon: weatherMeta.icon,
      isDay: current.is_day === 1,
      cloudCover: Math.round(current.cloud_cover || 0),
      visibility: 10,
      updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
    hourly: hourlyForecasts,
    daily: dailyForecasts,
    alerts,
    airQuality: {
      aqi: 38,
      label: 'Boa (Excelente Qualidade do Ar)',
      pm25: 8.4,
      pm10: 14.2,
      o3: 28.1,
      no2: 12.0,
    },
  };

  // Cache data locally for offline mode
  saveToOfflineCache(location.id, location.name, resultData);

  return resultData;
}

// Storage key for Offline Cache
const OFFLINE_CACHE_KEY = 'climaradar_offline_cache_v1';

export function saveToOfflineCache(locationId: string, locationName: string, data: WeatherData) {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    const records: Record<string, OfflineCacheRecord> = raw ? JSON.parse(raw) : {};
    const jsonStr = JSON.stringify(data);

    records[locationId] = {
      locationId,
      locationName,
      data,
      cachedAt: new Date().toLocaleString('pt-BR'),
      sizeBytes: new Blob([jsonStr]).size,
    };

    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Erro ao salvar no cache offline:', e);
  }
}

export function getOfflineCacheRecords(): OfflineCacheRecord[] {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (!raw) return [];
    const records: Record<string, OfflineCacheRecord> = JSON.parse(raw);
    return Object.values(records);
  } catch (e) {
    return [];
  }
}

export function getCachedWeatherData(locationId: string): WeatherData | null {
  const records = getOfflineCacheRecords();
  const match = records.find((r) => r.locationId === locationId);
  return match ? match.data : records[0]?.data || null;
}
