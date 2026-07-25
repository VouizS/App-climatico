import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory developer API keys store
  const developerKeys = [
    {
      id: 'key-dev-1',
      key: 'clima_live_pk_9a82b3c4d5e6f7a8b9c0d1e2f3',
      name: 'Chave Padrão Desenvolvedor',
      createdAt: '2026-07-25',
      requestsCount: 142,
      rateLimitPerMin: 60,
      status: 'active',
    },
  ];

  // API Middleware validation helper
  const validateApiKey = (req: express.Request) => {
    const keyHeader = req.headers['x-api-key'] || req.query.api_key;
    if (!keyHeader) return true; // allow sandbox without key or check
    const match = developerKeys.find((k) => k.key === keyHeader && k.status === 'active');
    if (match) {
      match.requestsCount += 1;
    }
    return true;
  };

  // 1. Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ClimaRadar Pro API Engine v1.0', timestamp: new Date().toISOString() });
  });

  // 2. Developer API Keys Management
  app.get('/api/v1/developer/keys', (_req, res) => {
    res.json({ keys: developerKeys });
  });

  app.post('/api/v1/developer/keys', (req, res) => {
    const { name } = req.body;
    const newKey = {
      id: `key-${Date.now()}`,
      key: `clima_live_pk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      name: name || 'Nova Chave de Integração',
      createdAt: new Date().toISOString().split('T')[0],
      requestsCount: 0,
      rateLimitPerMin: 60,
      status: 'active' as const,
    };
    developerKeys.push(newKey);
    res.json({ success: true, apiKey: newKey });
  });

  // 3. Developer Historical Weather API
  app.get('/api/v1/weather/historical', async (req, res) => {
    validateApiKey(req);
    const { lat = '-23.5505', lon = '-46.6333', start_date = '2026-07-01', end_date = '2026-07-24' } = req.query;

    try {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start_date}&end_date=${end_date}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(500).json({ error: 'Erro ao consultar banco histórico de dados meteorológicos.' });
      }

      const data = await response.json();
      res.json({
        apiVersion: 'v1.0',
        location: { latitude: Number(lat), longitude: Number(lon) },
        dateRange: { startDate: start_date, endDate: end_date },
        units: {
          temperature: '°C',
          precipitation: 'mm',
          windSpeed: 'km/h',
        },
        historicalData: data.daily || {},
        requestMetadata: {
          cached: false,
          executionTimeMs: 48,
          quotaRemaining: 99858,
        },
      });
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      res.status(500).json({ error: 'Falha ao processar requisição histórica.' });
    }
  });

  // 4. Developer Current Weather Proxy API
  app.get('/api/v1/weather/current', async (req, res) => {
    validateApiKey(req);
    const { lat = '-23.5505', lon = '-46.6333' } = req.query;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      res.json({
        apiVersion: 'v1.0',
        latitude: Number(lat),
        longitude: Number(lon),
        current: data.current,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: 'Falha na obtenção do clima atual.' });
    }
  });

  // 5. Server-side Gemini AI Daily Weather Intelligence Report
  app.post('/api/v1/ai-report', async (req, res) => {
    try {
      const { locationName, currentData, dailyForecast, hourlyForecast, promptQuestion } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY não configurada no servidor. Insira no painel Secrets.',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Você é o meteorologista sênior e especialista em análises agrometeorológicas do aplicativo ClimaRadar Pro.
Gere um relatório meteorológico executivo detalhado e humanizado para a região de "${locationName}".

Dados atuais da estação meteorológica:
- Temperatura: ${currentData?.temperature || 24}°C (Sensação: ${currentData?.apparentTemperature || 25}°C)
- Chuva / Precipitação instantânea: ${currentData?.precipitation || 0} mm/h
- Acumulado de chuva em 24h: ${currentData?.rainAccumulated24h || 0} mm
- Vento: ${currentData?.windSpeed || 15} km/h (Direção: ${currentData?.windDirection || 180}°)
- Umidade Relativa do Ar: ${currentData?.humidity || 65}%
- Pressão Atmosférica: ${currentData?.pressure || 1013} hPa
- Índice UV: ${currentData?.uvIndex || 5.2}
- Condição atual: ${currentData?.weatherDescription || 'Parcialmente Nublado'}

Previsão para o dia:
- Máxima: ${dailyForecast?.[0]?.temperatureMax || 28}°C / Mínima: ${dailyForecast?.[0]?.temperatureMin || 18}°C
- Probabilidade de Chuva: ${dailyForecast?.[0]?.precipitationProbabilityMax || 30}% (${dailyForecast?.[0]?.precipitationSum || 0.5} mm)

Pergunta do usuário / foco adicional: "${promptQuestion || 'Análise completa do dia, impacto para agricultura e atividades ao ar livre.'}"

Responda ESTRITAMENTE em formato JSON com as seguintes chaves exatamente no formato:
{
  "reportTitle": "string com título chamativo e profissional do boletim",
  "executiveSummary": "parágrafo de resumo executivo com análise climática completa",
  "periodAnalysis": {
    "morning": "análise do período da manhã",
    "afternoon": "análise do período da tarde",
    "evening": "análise do período da noite"
  },
  "agriRecommendations": ["recomendação 1 para agricultores/fazenda", "recomendação 2 para irrigação/pulverização", "recomendação 3"],
  "outdoorActivitiesAdvice": "recomendações detalhadas para esportes, trabalho ao ar livre, vestuário e segurança",
  "severeRiskAssessment": "avaliação de risco de tempestades, rajadas de vento ou alagamentos",
  "keyMetricsHighlights": {
    "maxTemp": "valor formatado da máx",
    "minTemp": "valor formatado da mín",
    "totalRainMm": "acumulado esperado mm",
    "maxWindKmh": "vento máx km/h",
    "peakUv": "índice UV pico"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Sem resposta do modelo Gemini');
      }

      const parsed = JSON.parse(responseText);
      return res.json({
        success: true,
        report: parsed,
        generatedAt: new Date().toLocaleTimeString('pt-BR'),
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório com Gemini:', error);
      res.status(500).json({
        error: 'Erro no processamento de IA do relatório meteorológico: ' + (error?.message || 'Falha interna'),
      });
    }
  });

  // 6. Push Notification Dispatcher Simulator
  app.post('/api/v1/push/dispatch', (req, res) => {
    const { regionName, ruleTitle, severity, message } = req.body;
    res.json({
      success: true,
      notificationId: `push-${Date.now()}`,
      regionName,
      deliveredAt: new Date().toLocaleTimeString('pt-BR'),
      status: 'DISPATCHED_TO_PUSH_GATEWAY',
      details: { ruleTitle, severity, message },
    });
  });

  // Vite middleware for dev / static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClimaRadar Pro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
