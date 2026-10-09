import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Cpu,
  Zap,
  RefreshCw,
  Server,
  Sparkles,
  Bot,
  Play,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Flame,
  Gauge,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export interface LatencySample {
  timestamp: string;
  latencyMs: number;
  model: string;
  status: "SUCCESS" | "DEGRADED" | "ERROR";
  endpoint?: string;
}

export interface WorkerResourceMetrics {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  externalMb: number;
  usagePercent: number;
  uptimeSeconds: number;
  uptimeFormatted: string;
  userCpuMs: number;
  systemCpuMs: number;
}

export interface SystemHealthData {
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  timestamp: string;
  worker: {
    isRunning: boolean;
    isCycleInProgress: boolean;
    lastRunTimestamp: string | null;
    pendingTasksCount: number;
    completedTasksCount: number;
    totalQueueCount: number;
    activeAgents: string[];
    resources: WorkerResourceMetrics;
  };
  gemini: {
    currentLatencyMs: number;
    averageLatencyMs: number;
    minLatencyMs: number;
    maxLatencyMs: number;
    p95LatencyMs: number;
    status: "OPTIMAL" | "NORMAL" | "SLOW" | "ERROR";
    model: string;
    hasKey: boolean;
    history: LatencySample[];
  };
  server: {
    nodeVersion: string;
    platform: string;
    arch: string;
    environment: string;
  };
}

const DEFAULT_SYSTEM_HEALTH: SystemHealthData = {
  status: "HEALTHY",
  timestamp: new Date().toISOString(),
  worker: {
    isRunning: true,
    isCycleInProgress: false,
    lastRunTimestamp: new Date().toISOString(),
    pendingTasksCount: 0,
    completedTasksCount: 2,
    totalQueueCount: 2,
    activeAgents: ["kia", "athena", "hermes", "davinci", "vulcan", "cypher"],
    resources: {
      heapUsedMb: 112.4,
      heapTotalMb: 158.0,
      rssMb: 324.5,
      externalMb: 18.2,
      usagePercent: 71,
      uptimeSeconds: 600,
      uptimeFormatted: "10m 00s",
      userCpuMs: 4200,
      systemCpuMs: 580,
    },
  },
  gemini: {
    currentLatencyMs: 780,
    averageLatencyMs: 795,
    minLatencyMs: 650,
    maxLatencyMs: 980,
    p95LatencyMs: 920,
    status: "OPTIMAL",
    model: "gemini-3.1-flash-lite",
    hasKey: true,
    history: [
      { timestamp: new Date(Date.now() - 240000).toISOString(), latencyMs: 780, model: "gemini-3.1-flash-lite", status: "SUCCESS" },
      { timestamp: new Date(Date.now() - 180000).toISOString(), latencyMs: 820, model: "gemini-3.1-flash-lite", status: "SUCCESS" },
      { timestamp: new Date(Date.now() - 120000).toISOString(), latencyMs: 740, model: "gemini-3.1-flash-lite", status: "SUCCESS" },
      { timestamp: new Date(Date.now() - 60000).toISOString(), latencyMs: 690, model: "gemini-3.1-flash-lite", status: "SUCCESS" },
      { timestamp: new Date().toISOString(), latencyMs: 770, model: "gemini-3.1-flash-lite", status: "SUCCESS" },
    ],
  },
  server: {
    nodeVersion: "v22.23.2",
    platform: "linux",
    arch: "x64",
    environment: "production",
  },
};

export const SystemHealthWidget: React.FC = () => {
  const { playSfx } = useApp();
  const [healthData, setHealthData] = useState<SystemHealthData>(DEFAULT_SYSTEM_HEALTH);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isPingingGemini, setIsPingingGemini] = useState<boolean>(false);
  const [isTriggeringCycle, setIsTriggeringCycle] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [hoveredSample, setHoveredSample] = useState<LatencySample | null>(null);

  // Fetch telemetry from backend safely with timeout and abort
  const fetchHealthData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch("/api/engine/health/system", {
        signal: controller.signal,
      });
      if (response.ok) {
        const data: SystemHealthData = await response.json();
        setHealthData(data);
        setIsOffline(false);
        setLastRefreshedAt(new Date());
      } else {
        setIsOffline(true);
      }
    } catch (err: any) {
      // Falha graciosa sem poluir os registos ou disparar erros bloqueantes
      setIsOffline(true);
      console.debug("[SystemHealthWidget] Telemetria em modo local:", err?.message || err);
    } finally {
      clearTimeout(timeoutId);
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  // Initial load and periodic polling
  useEffect(() => {
    fetchHealthData(false);

    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealthData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchHealthData, autoRefresh]);

  // Ping Gemini API on-demand
  const handlePingGemini = async () => {
    setIsPingingGemini(true);
    playSfx?.("action");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/engine/health/ping-gemini", {
        method: "POST",
        signal: controller.signal,
      });
      if (res.ok) {
        playSfx?.("success");
        await fetchHealthData(true);
      }
    } catch (err: any) {
      console.debug("[SystemHealthWidget] Aviso de probe Gemini:", err?.message || err);
    } finally {
      clearTimeout(timeoutId);
      setIsPingingGemini(false);
    }
  };

  // Trigger autonomous maintenance cycle on worker
  const handleTriggerWorkerCycle = async () => {
    setIsTriggeringCycle(true);
    playSfx?.("execute");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/engine/worker/trigger", {
        method: "POST",
        signal: controller.signal,
      });
      if (res.ok) {
        playSfx?.("success");
        await fetchHealthData(true);
      }
    } catch (err: any) {
      console.debug("[SystemHealthWidget] Aviso ao disparar ciclo:", err?.message || err);
    } finally {
      clearTimeout(timeoutId);
      setIsTriggeringCycle(false);
    }
  };

  const worker = healthData?.worker;
  const gemini = healthData?.gemini;
  const resources = worker?.resources;

  // Latency chart calculations
  const history = useMemo(() => gemini?.history || [], [gemini?.history]);
  const chartMax = useMemo(() => {
    if (history.length === 0) return 2000;
    const maxVal = Math.max(...history.map((s) => s.latencyMs));
    return Math.max(1600, Math.ceil(maxVal * 1.2));
  }, [history]);

  // Status badges color
  const getLatencyBadge = (latency: number) => {
    if (latency < 1000) {
      return {
        label: "Latência Excelente (<1s)",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        indicator: "bg-emerald-400",
      };
    }
    if (latency < 1800) {
      return {
        label: "Latência Nominal",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        indicator: "bg-amber-400",
      };
    }
    return {
      label: "Latência Elevada",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      indicator: "bg-rose-400",
    };
  };

  const latencyBadge = getLatencyBadge(gemini?.currentLatencyMs || 750);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090c14] via-[#0d1222] to-[#080b12] border border-amber-500/30 p-5 sm:p-7 shadow-2xl shadow-black/40">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                Saúde do Sistema & Telemetria em Tempo Real
              </h2>
              {isOffline ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>MODO LOCAL</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ONLINE 24/7</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitorização contínua do Background Agent Worker da GAG Visual e latência de inferência da API Gemini em Luanda.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              autoRefresh
                ? "bg-slate-800/90 text-amber-300 border-amber-500/40"
                : "bg-slate-900/60 text-slate-400 border-slate-800"
            }`}
            title="Alternar sondagem automática (a cada 8 segundos)"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
            <span>{autoRefresh ? "Auto (8s)" : "Pausado"}</span>
          </button>

          {/* Refresh telemetry button */}
          <button
            onClick={() => fetchHealthData(false)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/70 transition-all cursor-pointer disabled:opacity-50"
            title="Recarregar telemetria do sistema"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {/* Force Ping Gemini */}
          <button
            onClick={handlePingGemini}
            disabled={isPingingGemini}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Enviar probe instantâneo para medir latência da API Gemini"
          >
            <Zap className={`w-3.5 h-3.5 fill-black ${isPingingGemini ? "animate-bounce" : ""}`} />
            <span>{isPingingGemini ? "A Sondar..." : "Ping Gemini"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Two Dedicated Diagnostic Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Hub 1: Background Agent Worker & Resource Consumption */}
        <div className="rounded-2xl bg-[#07090f]/80 border border-slate-800/90 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Agent Background Worker
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                Modo Autónomo
              </span>
            </div>

            {/* Worker Status & Activity Pill */}
            <div className="mt-3.5 flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${worker?.isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                <div>
                  <div className="text-xs font-bold text-white">
                    {worker?.isRunning
                      ? worker.isCycleInProgress
                        ? "A Processar Ciclo de Manutenção..."
                        : "Serviço 24/7 Ativo e em Escuta"
                      : "Worker Inativo"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {worker?.lastRunTimestamp
                      ? `Último ciclo: ${new Date(worker.lastRunTimestamp).toLocaleTimeString("pt-PT")}`
                      : "Ciclo inicial em calibração"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleTriggerWorkerCycle}
                disabled={isTriggeringCycle || worker?.isCycleInProgress}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                title="Executar ciclo de manutenção dos agentes autónomos imediatamente"
              >
                <Play className={`w-3 h-3 fill-amber-300 ${isTriggeringCycle ? "animate-spin" : ""}`} />
                <span>{isTriggeringCycle ? "A Executar..." : "Forçar Ciclo"}</span>
              </button>
            </div>

            {/* Resource Consumption: Memory Heap & RSS */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Consumo de Memória (Heap Node.js)</span>
                </span>
                <span className="font-mono text-white font-bold">
                  {resources?.heapUsedMb || 0} MB{" "}
                  <span className="text-slate-500 font-normal">/ {resources?.heapTotalMb || 0} MB</span>
                </span>
              </div>

              {/* Memory Bar */}
              <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden ring-1 ring-slate-700/40">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (resources?.usagePercent || 0) > 85
                      ? "bg-rose-500"
                      : (resources?.usagePercent || 0) > 70
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400"
                  }`}
                  style={{ width: `${Math.max(5, resources?.usagePercent || 0)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                <span>Carga: {resources?.usagePercent || 0}%</span>
                <span>RSS: {resources?.rssMb || 0} MB · Uptime: {resources?.uptimeFormatted || "0s"}</span>
              </div>
            </div>

            {/* Worker Task Queue Stats */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Pendentes</div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {worker?.pendingTasksCount || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Concluídas</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  {worker?.completedTasksCount || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Fila Total</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {worker?.totalQueueCount || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Active Agents in Worker */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Agentes Supervisionados:</span>
            <div className="flex items-center space-x-1.5">
              {["kia", "athena", "hermes", "davinci", "vulcan", "cypher"].map((agentId) => (
                <span
                  key={agentId}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-amber-300/90 border border-slate-700"
                >
                  {agentId}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hub 2: Gemini API Response Latency Telemetry */}
        <div className="rounded-2xl bg-[#07090f]/80 border border-slate-800/90 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Latência da API Gemini
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {gemini?.model || "gemini-3.1-flash-lite"}
              </span>
            </div>

            {/* Current Real-Time Latency Score */}
            <div className="mt-3.5 flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                  Latência da Última Inferência
                </div>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">
                    {gemini?.currentLatencyMs || 0}
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">ms</span>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${latencyBadge.color}`}>
                <span className={`w-2 h-2 rounded-full ${latencyBadge.indicator}`} />
                <span>{latencyBadge.label}</span>
              </div>
            </div>

            {/* Real-time Interactive SVG Sparkline Chart */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Histórico Recente de Latência</span>
                {hoveredSample ? (
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    {hoveredSample.latencyMs} ms · {new Date(hoveredSample.timestamp).toLocaleTimeString("pt-PT")}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">Últimas 15 chamadas</span>
                )}
              </div>

              {/* Chart Canvas */}
              <div className="h-20 w-full bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 relative flex items-end justify-between gap-1 overflow-hidden">
                {/* 1000ms Baseline Reference Line */}
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-slate-700/60 z-0 pointer-events-none"
                  style={{ bottom: `${(1000 / chartMax) * 100}%` }}
                >
                  <span className="absolute right-1 -top-3 text-[8px] font-mono text-slate-600">
                    1000ms
                  </span>
                </div>

                {history.length > 0 ? (
                  history.slice(-16).map((sample, idx) => {
                    const heightPercent = Math.min(100, Math.max(12, (sample.latencyMs / chartMax) * 100));
                    const isGood = sample.latencyMs < 1000;
                    const isWarn = sample.latencyMs >= 1000 && sample.latencyMs < 1800;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredSample(sample)}
                        onMouseLeave={() => setHoveredSample(null)}
                        className="flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer"
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all duration-300 group-hover:brightness-125 ${
                            isGood
                              ? "bg-gradient-to-t from-emerald-600 to-teal-400"
                              : isWarn
                              ? "bg-gradient-to-t from-amber-600 to-yellow-400"
                              : "bg-gradient-to-t from-rose-600 to-red-400"
                          }`}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center text-xs text-slate-500 my-auto">
                    A inicializar telemetria...
                  </div>
                )}
              </div>
            </div>

            {/* Latency Stats Grid (Avg, Min, Max, P95) */}
            <div className="grid grid-cols-4 gap-2 mt-3.5">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[9px] text-slate-500 font-medium">Média</div>
                <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                  {gemini?.averageLatencyMs || 0} ms
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[9px] text-slate-500 font-medium">Mínima</div>
                <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                  {gemini?.minLatencyMs || 0} ms
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[9px] text-slate-500 font-medium">Máxima</div>
                <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                  {gemini?.maxLatencyMs || 0} ms
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[9px] text-slate-500 font-medium">P95</div>
                <div className="text-xs font-bold text-indigo-300 font-mono mt-0.5">
                  {gemini?.p95LatencyMs || 0} ms
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Servidor Google Cloud (GenAI SDK)</span>
            <span>Atualizado: {lastRefreshedAt.toLocaleTimeString("pt-PT")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
