import React, { useState, useEffect } from 'react';
import { Code2, Key, Play, Copy, Check, Terminal, Database, Server, Clock, ShieldCheck, Plus } from 'lucide-react';
import { DeveloperApiKey } from '../types';

export const DeveloperApiPortal: React.FC = () => {
  const [keys, setKeys] = useState<DeveloperApiKey[]>([]);
  const [activeTabLanguage, setActiveTabLanguage] = useState<'curl' | 'js' | 'python'>('js');

  // Sandbox Query State
  const [lat, setLat] = useState<string>('-23.5505');
  const [lon, setLon] = useState<string>('-46.6333');
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-07-24');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');

  const loadKeys = async () => {
    try {
      const res = await fetch('/api/v1/developer/keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (e) {
      console.warn('Erro ao carregar chaves:', e);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'Chave de Produção API' }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyName('');
        loadKeys();
      }
    } catch (err) {
      console.error('Erro ao criar chave:', err);
    }
  };

  const handleExecuteHistoricalQuery = async () => {
    setIsExecuting(true);
    setResponseJson(null);

    try {
      const activeKey = keys[0]?.key || 'clima_live_pk_demo';
      const url = `/api/v1/weather/historical?lat=${lat}&lon=${lon}&start_date=${startDate}&end_date=${endDate}&api_key=${activeKey}`;
      const res = await fetch(url);
      const data = await res.json();
      setResponseJson(data);
    } catch (err) {
      setResponseJson({ error: 'Erro ao conectar à API histórica.' });
    } finally {
      setIsExecuting(false);
    }
  };

  // Code snippets generator
  const currentKey = keys[0]?.key || 'SUA_CHAVE_API_AQUI';
  const apiEndpointUrl = `${window.location.origin}/api/v1/weather/historical?lat=${lat}&lon=${lon}&start_date=${startDate}&end_date=${endDate}`;

  const codeSnippets = {
    curl: `curl -X GET "${apiEndpointUrl}" \\
  -H "x-api-key: ${currentKey}"`,
    js: `const response = await fetch("${apiEndpointUrl}", {
  headers: {
    "x-api-key": "${currentKey}"
  }
});
const weatherHistory = await response.json();
console.log(weatherHistory);`,
    python: `import requests

url = "${apiEndpointUrl}"
headers = {"x-api-key": "${currentKey}"}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTabLanguage]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-2">
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
          PORTAL DO DESENVOLVEDOR & API REST
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          API de Dados Meteorológicos Históricos & Tempo Real
        </h1>
        <p className="text-xs text-slate-400">
          Acesse séries temporais históricas de temperatura, chuva em mm, umidade e vento para análises agrícolas, acadêmicas e de inteligência de negócios.
        </p>
      </div>

      {/* Developer API Key Manager */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-400" />
            <span>Gerenciador de Chaves de API (API Keys)</span>
          </h2>

          <form onSubmit={handleCreateKey} className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Nome da nova chave..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="bg-[#0A0C10] border border-[#1F2937] px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer shrink-0 transition-colors shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Chave</span>
            </button>
          </form>
        </div>

        <div className="divide-y divide-[#1F2937]">
          {keys.map((k) => (
            <div key={k.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-white">{k.name}</p>
                <p className="font-mono text-blue-300 bg-[#0A0C10] px-2.5 py-1 rounded-lg border border-[#1F2937] inline-block mt-1">
                  {k.key}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                <span>Requisições: <strong className="text-white">{k.requestsCount}</strong></span>
                <span>Limite: <strong className="text-white">{k.rateLimitPerMin} req/min</strong></span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded uppercase">
                  {k.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive REST Sandbox & Endpoint Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <span>Sandbox de Testes da API Histórica</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-semibold">Latitude:</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold">Longitude:</label>
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white font-mono mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-semibold">Data Inicial:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold">Data Final:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white mt-1"
                />
              </div>
            </div>

            <button
              onClick={handleExecuteHistoricalQuery}
              disabled={isExecuting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-white ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Executando Requisição...' : 'Executar Consulta na API Histórica'}</span>
            </button>
          </div>

          {/* Code Snippets Section */}
          <div className="space-y-2 pt-4 border-t border-[#1F2937]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Exemplo de Código:</span>
              <button
                onClick={handleCopyCode}
                className="text-xs text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar Snippet'}</span>
              </button>
            </div>

            <div className="flex space-x-2 bg-[#0A0C10] p-1 rounded-xl border border-[#1F2937]">
              {(['js', 'curl', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTabLanguage(lang)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    activeTabLanguage === lang
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <pre className="bg-[#0A0C10] p-3 rounded-xl border border-[#1F2937] text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-48">
              {codeSnippets[activeTabLanguage]}
            </pre>
          </div>
        </div>

        {/* JSON Response Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>Resposta JSON da API (HTTP 200 OK)</span>
            </h2>
            {responseJson && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                200 OK • 48ms
              </span>
            )}
          </div>

          <div className="flex-1 bg-[#0A0C10] rounded-2xl border border-[#1F2937] p-4 font-mono text-[11px] text-blue-300 overflow-y-auto max-h-[500px]">
            {responseJson ? (
              <pre>{JSON.stringify(responseJson, null, 2)}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Clique em "Executar Consulta na API Histórica" para testar a resposta JSON em tempo real.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
