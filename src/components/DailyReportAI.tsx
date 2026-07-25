import React, { useState, useEffect } from 'react';
import { Sparkles, Printer, Download, RefreshCw, Sun, CloudRain, ShieldCheck, Sprout, Compass, CheckCircle } from 'lucide-react';
import { WeatherData, DailyReportAIResponse } from '../types';

interface DailyReportAIProps {
  weatherData: WeatherData;
}

export const DailyReportAI: React.FC<DailyReportAIProps> = ({ weatherData }) => {
  const [report, setReport] = useState<DailyReportAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateReport = async (prompt?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: weatherData.location.name,
          currentData: weatherData.current,
          dailyForecast: weatherData.daily,
          hourlyForecast: weatherData.hourly,
          promptQuestion: prompt || customQuestion,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao gerar relatório de IA');
      }

      setReport(json.report);
    } catch (err: any) {
      console.error('Erro ao gerar relatório com Gemini:', err);
      setErrorMessage(err.message || 'Ocorreu um erro ao conectar ao modelo de inteligência artificial Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [weatherData.location.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>RELATÓRIO INTELIGENTE GEMINI 2.5</span>
              </span>
              <span className="text-xs text-slate-400">Região: {weatherData.location.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Boletim Diário Meteorológico & Agrometeorológico
            </h1>
            <p className="text-xs text-slate-400">
              Análise em linguagem natural gerada por IA com base nas medições em tempo real e sensores da estação.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateReport()}
              disabled={isLoading}
              className="bg-[#0A0C10] hover:bg-[#1A1F2C] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-[#1F2937] flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Regerar Boletim</span>
            </button>

            {report && (
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Prompt Input Box for Custom Weather Queries */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            placeholder="Deseja perguntar algo específico? Ex: 'Qual o melhor horário para aplicar defensivos na lavoura?'"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateReport()}
            className="flex-1 bg-[#0A0C10] border border-[#1F2937] px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => generateReport()}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 cursor-pointer shadow-md shadow-blue-500/20"
          >
            Perguntar à IA
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Analisando Dados Meteorológicos com Gemini...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Processando temperatura, volume de chuva em mm, umidade relativa, rajadas de vento e modelo numérico de previsão.
          </p>
        </div>
      )}

      {/* Error State */}
      {errorMessage && !isLoading && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-3xl p-6 text-red-200 text-xs space-y-2 shadow-xl">
          <h4 className="font-bold text-sm">Falha na Conexão com o Serviço de IA</h4>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Report View Card */}
      {report && !isLoading && (
        <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none">
          {/* Executive Header */}
          <div className="border-b border-[#1F2937] pb-6 space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{report.reportTitle}</h2>
            <p className="text-xs text-slate-400 font-mono">
              Boletim emitido para {report.locationName} • Atualizado em tempo real
            </p>
          </div>

          {/* Key Metrics Highlight Banner */}
          {report.keyMetricsHighlights && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#0A0C10] p-4 rounded-2xl border border-[#1F2937]">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Temp Máx</p>
                <p className="text-lg font-extrabold text-amber-400">{report.keyMetricsHighlights.maxTemp}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Temp Mín</p>
                <p className="text-lg font-extrabold text-blue-400">{report.keyMetricsHighlights.minTemp}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Chuva Prevista</p>
                <p className="text-lg font-extrabold text-blue-500">{report.keyMetricsHighlights.totalRainMm}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Vento Máx</p>
                <p className="text-lg font-extrabold text-cyan-400">{report.keyMetricsHighlights.maxWindKmh}</p>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Pico UV</p>
                <p className="text-lg font-extrabold text-amber-300">{report.keyMetricsHighlights.peakUv}</p>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <span>Resumo Executivo do Clima</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#0A0C10] p-4 rounded-2xl border border-[#1F2937]">
              {report.executiveSummary}
            </p>
          </div>

          {/* Period Breakdown (Morning, Afternoon, Evening) */}
          {report.periodAnalysis && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <span>Evolução por Período do Dia</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0C10] border border-[#1F2937] p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase">Manhã</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.periodAnalysis.morning}</p>
                </div>
                <div className="bg-[#0A0C10] border border-[#1F2937] p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-blue-400 uppercase">Tarde</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.periodAnalysis.afternoon}</p>
                </div>
                <div className="bg-[#0A0C10] border border-[#1F2937] p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Noite</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.periodAnalysis.evening}</p>
                </div>
              </div>
            </div>
          )}

          {/* Agricultural & Farm Recommendations */}
          {report.agriRecommendations && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span>Recomendações Agrometeorológicas (Campo & Irrigação)</span>
              </h3>
              <div className="bg-[#0A0C10] border border-[#1F2937] p-4 rounded-2xl space-y-2">
                {report.agriRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outdoor Activities & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Atividades ao Ar Livre & Segurança</span>
              </h4>
              <p className="text-xs text-slate-300 bg-[#0A0C10] p-4 rounded-2xl border border-[#1F2937]">
                {report.outdoorActivitiesAdvice}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-amber-400" />
                <span>Avaliação de Risco de Tempestade</span>
              </h4>
              <p className="text-xs text-slate-300 bg-[#0A0C10] p-4 rounded-2xl border border-[#1F2937]">
                {report.severeRiskAssessment}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
