export interface Location {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  isFavorite?: boolean;
}

export interface CurrentWeather {
  temperature: number; // °C
  apparentTemperature: number; // °C
  precipitation: number; // mm
  rainAccumulated24h: number; // mm
  windSpeed: number; // km/h
  windDirection: number; // degrees
  humidity: number; // %
  pressure: number; // hPa
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  isDay: boolean;
  cloudCover: number; // %
  visibility: number; // km
  updatedAt: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitation: number; // mm
  precipitationProbability: number; // %
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export interface DailyForecast {
  date: string;
  weekday: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number; // mm
  precipitationProbabilityMax: number; // %
  weatherCode: number;
  weatherDescription: string;
  windSpeedMax: number;
  uvIndexMax: number;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: StormAlert[];
  airQuality?: AirQuality;
}

export interface AirQuality {
  aqi: number;
  label: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
}

export interface StormAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  category: 'rain' | 'wind' | 'storm' | 'flood' | 'heat' | 'hail';
  locationName: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  recommendations: string[];
  active: boolean;
}

export interface PushNotificationRule {
  id: string;
  regionId: string;
  regionName: string;
  latitude: number;
  longitude: number;
  enabled: boolean;
  rainThresholdMm: number; // alert if precipitation > this
  windThresholdKmh: number; // alert if wind > this
  tempMinThreshold: number;
  tempMaxThreshold: number;
  notifyStorms: boolean;
  dailySummaryTime: string; // e.g. "07:00"
  channelEmail?: string;
  channelWebPush: boolean;
}

export interface PushNotificationLog {
  id: string;
  title: string;
  body: string;
  regionName: string;
  timestamp: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  read: boolean;
}

export interface WidgetConfig {
  id: string;
  title: string;
  size: '2x2' | '4x2' | '4x4' | 'lockscreen';
  theme: 'glass' | 'dark' | 'light' | 'neon';
  targetRegionId: string; // "gps" or location id
  showRadarThumbnail: boolean;
  showHourlyTrend: boolean;
  showMetrics: ('temp' | 'rain' | 'wind' | 'humidity' | 'uv')[];
}

export interface OfflineCacheRecord {
  locationId: string;
  locationName: string;
  data: WeatherData;
  cachedAt: string;
  sizeBytes: number;
}

export interface DeveloperApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  requestsCount: number;
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
}

export interface HistoricalWeatherQuery {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  metrics: ('temperature_2m' | 'precipitation' | 'wind_speed_10m' | 'relative_humidity_2m')[];
}

export interface DailyReportAIResponse {
  reportTitle: string;
  locationName: string;
  dateStr: string;
  executiveSummary: string;
  periodAnalysis: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  agriRecommendations: string[];
  outdoorActivitiesAdvice: string;
  severeRiskAssessment: string;
  keyMetricsHighlights: {
    maxTemp: string;
    minTemp: string;
    totalRainMm: string;
    maxWindKmh: string;
    peakUv: string;
  };
}
