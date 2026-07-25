import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
  CloudRain,
  Wind,
  ShieldAlert,
  Volume2,
} from 'lucide-react';
import { Location, PushNotificationRule, PushNotificationLog, StormAlert } from '../types';

interface StormAlertsPushProps {
  alerts: StormAlert[];
  currentLocation: Location;
  pushRules: PushNotificationRule[];
  onSavePushRule: (rule: PushNotificationRule) => void;
  onDeletePushRule: (id: string) => void;
  logs: PushNotificationLog[];
  onAddLog: (log: PushNotificationLog) => void;
}

export const StormAlertsPush: React.FC<StormAlertsPushProps> = ({
  alerts,
  currentLocation,
  pushRules,
  onSavePushRule,
  onDeletePushRule,
  logs,
  onAddLog,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // New Rule Form State
  const [regionName, setRegionName] = useState(currentLocation.name);
  const [rainMm, setRainMm] = useState<number>(15);
  const [windKmh, setWindKmh] = useState<number>(45);
  const [tempMax, setTempMax] = useState<number>(35);
  const [notifyStorms, setNotifyStorms] = useState<boolean>(true);
  const [summaryTime, setSummaryTime] = useState<string>('07:00');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: PushNotificationRule = {
      id: `rule-${Date.now()}`,
      regionId: currentLocation.id,
      regionName: regionName || currentLocation.name,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      enabled: true,
      rainThresholdMm: rainMm,
      windThresholdKmh: windKmh,
      tempMinThreshold: 10,
      tempMaxThreshold: tempMax,
      notifyStorms,
      dailySummaryTime: summaryTime,
      channelWebPush: true,
    };
    onSavePushRule(newRule);
    setShowAddModal(false);
  };

  const handleTriggerTestPush = async (rule: PushNotificationRule) => {
    try {
      const res = await fetch('/api/v1/push/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionName: rule.regionName,
          ruleTitle: `Simulação de Alerta de Chuva (> ${rule.rainThresholdMm} mm/h)`,
          severity: 'high',
          message: `Atenção: Precipitação registrada acima de ${rule.rainThresholdMm} mm/h em ${rule.regionName}. Risco de alagamentos pontuais.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newLog: PushNotificationLog = {
          id: data.notificationId,
          title: `⚠️ ALERTA DE CHUVA: ${rule.regionName}`,
          body: `Precipitação crítica de ${rule.rainThresholdMm + 5} mm/h detectada!`,
          regionName: rule.regionName,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          severity: 'high',
          read: false,
        };
        onAddLog(newLog);

        setTestSuccessMessage(`Notificação push simulada enviada com sucesso para ${rule.regionName}!`);
        setTimeout(() => setTestSuccessMessage(null), 4000);

        // Native Browser Notification API if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newLog.title, { body: newLog.body });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } catch (err) {
      console.error('Error dispatching push:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Intro Header */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
              NOTIFICAÇÕES PUSH PERSONALIZADAS
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Alertas de Tempestades & Regiões Monitoradas
            </h1>
            <p className="text-xs text-slate-400">
              Configure regras individuais para cada fazenda, cidade ou imóvel. Receba alertas push antes da tempestade chegar.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Região Monitorada</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {testSuccessMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3 text-emerald-200 text-xs font-semibold shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{testSuccessMessage}</span>
        </div>
      )}

      {/* Current Regional Weather Warnings Banner */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Alertas Severos Ativos na Região Atual ({currentLocation.name})</span>
        </h2>

        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#0A0C10] border border-amber-500/20 p-4 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-200">{alert.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-slate-300">{alert.description}</p>
                <div className="pt-2 border-t border-[#1F2937] font-mono text-[11px] text-amber-400 flex items-center justify-between">
                  <span>Validade: {alert.startTime} até {alert.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Sem avisos meteorológicos críticos registrados nesta hora.</p>
        )}
      </div>

      {/* Monitored Regions Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pushRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-[#11141D] border border-[#1F2937] hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Região Ativa</span>
                <h3 className="text-lg font-extrabold text-white">{rule.regionName}</h3>
              </div>
              <button
                onClick={() => onDeletePushRule(rule.id)}
                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer p-1"
                title="Excluir regra"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Threshold Indicators */}
            <div className="space-y-2 text-xs bg-[#0A0C10] p-3.5 rounded-2xl border border-[#1F2937]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span>Chuva Crítica:</span>
                </span>
                <strong className="text-white">&gt; {rule.rainThresholdMm} mm/h</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-400" />
                  <span>Vento Limite:</span>
                </span>
                <strong className="text-white">&gt; {rule.windThresholdKmh} km/h</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Boletim Diário:</span>
                </span>
                <strong className="text-white">Às {rule.dailySummaryTime}</strong>
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={() => handleTriggerTestPush(rule)}
              className="w-full bg-[#0A0C10] hover:bg-[#1A1F2C] text-blue-300 font-bold text-xs py-2.5 rounded-xl border border-[#1F2937] flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simular Disparo de Notificação</span>
            </button>
          </div>
        ))}
      </div>

      {/* Push Notification History Log */}
      <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-400" />
          <span>Histórico de Notificações Disparadas</span>
        </h2>

        {logs.length > 0 ? (
          <div className="divide-y divide-[#1F2937]">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-sm text-white">{log.title}</p>
                  <p className="text-xs text-slate-300">{log.body}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Região: {log.regionName} • {log.timestamp}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                  {log.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhuma notificação foi disparada nas últimas horas.</p>
        )}
      </div>

      {/* Add Monitored Region Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141D] border border-[#1F2937] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Configurar Nova Região para Notificações</h3>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome da Região / Fazenda / Imóvel:</label>
                <input
                  type="text"
                  required
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Gatilho de Chuva Acima De (mm/h):</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={rainMm}
                  onChange={(e) => setRainMm(Number(e.target.value))}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Gatilho de Vento Acima De (km/h):</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={windKmh}
                  onChange={(e) => setWindKmh(Number(e.target.value))}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Horário do Boletim Diário:</label>
                <input
                  type="time"
                  value={summaryTime}
                  onChange={(e) => setSummaryTime(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-[#1F2937] p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-[#0A0C10] text-slate-300 font-bold py-2.5 rounded-xl border border-[#1F2937] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
