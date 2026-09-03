import React from "react";
import { HeartbeatStatus, AgentHeartbeatState } from "../hooks/useAgentHeartbeats";
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle2, RotateCw } from "lucide-react";

interface HeartbeatIndicatorProps {
  heartbeat?: AgentHeartbeatState;
  variant?: "compact" | "badge" | "detailed";
  className?: string;
  showLatency?: boolean;
}

export const AgentHeartbeatIndicator: React.FC<HeartbeatIndicatorProps> = ({
  heartbeat,
  variant = "compact",
  className = "",
  showLatency = true,
}) => {
  const status: HeartbeatStatus = heartbeat?.status || "checking";
  const latencyMs = heartbeat?.latencyMs ?? 0;

  // Visual style mappings for pulsing states
  // Green when active, amber during high latency, red when failing
  const styleConfig = {
    active: {
      dotBg: "bg-emerald-500",
      pingBg: "bg-emerald-400",
      ringBorder: "ring-emerald-500/30",
      glowShadow: "shadow-[0_0_10px_rgba(16,185,129,0.7)]",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      textColor: "text-emerald-400",
      label: "Ativo",
      icon: CheckCircle2,
      description: `Ativo (${latencyMs}ms)`,
    },
    high_latency: {
      dotBg: "bg-amber-500",
      pingBg: "bg-amber-400",
      ringBorder: "ring-amber-500/30",
      glowShadow: "shadow-[0_0_10px_rgba(245,158,11,0.7)]",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      textColor: "text-amber-400",
      label: "Alta Latência",
      icon: AlertTriangle,
      description: `Alta Latência (${latencyMs}ms)`,
    },
    failing: {
      dotBg: "bg-rose-500",
      pingBg: "bg-rose-400",
      ringBorder: "ring-rose-500/40",
      glowShadow: "shadow-[0_0_12px_rgba(244,63,94,0.8)]",
      badgeBg: "bg-rose-500/15 border-rose-500/40 text-rose-300",
      textColor: "text-rose-400",
      label: "Falha",
      icon: WifiOff,
      description: "Falha de Conexão",
    },
    recovering: {
      dotBg: "bg-cyan-500",
      pingBg: "bg-cyan-400",
      ringBorder: "ring-cyan-500/40",
      glowShadow: "shadow-[0_0_10px_rgba(6,182,212,0.8)]",
      badgeBg: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
      textColor: "text-cyan-400",
      label: "Auto-Restart",
      icon: RotateCw,
      description: "Auto-Recuperação em curso...",
    },
    checking: {
      dotBg: "bg-sky-500",
      pingBg: "bg-sky-400",
      ringBorder: "ring-sky-500/30",
      glowShadow: "shadow-[0_0_8px_rgba(14,165,233,0.5)]",
      badgeBg: "bg-sky-500/10 border-sky-500/30 text-sky-300",
      textColor: "text-sky-400",
      label: "A verificar...",
      icon: RotateCw,
      description: "A verificar...",
    },
  }[status];

  // Compact variant: Pulse dot + Ping wave + optional latency tag
  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center space-x-1.5 ${className}`}
        title={`Heartbeat: ${styleConfig.description}`}
      >
        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
          {/* Radar ripple / ping wave */}
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${styleConfig.pingBg}`}
          />
          {/* Center core pulse dot with glow */}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${styleConfig.dotBg} ${styleConfig.glowShadow}`}
          />
        </span>
        {showLatency && (
          <span className={`text-[10px] font-mono font-bold ${styleConfig.textColor}`}>
            {status === "failing"
              ? "FAIL"
              : status === "checking"
              ? "..."
              : `${latencyMs}ms`}
          </span>
        )}
      </div>
    );
  }

  // Badge variant: Pill with pulsing dot, label and latency
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-colors ${styleConfig.badgeBg} ${className}`}
        title={`Status: ${styleConfig.label} • Latência: ${latencyMs}ms`}
      >
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${styleConfig.pingBg}`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${styleConfig.dotBg}`}
          />
        </span>
        <span className="font-medium">{styleConfig.label}</span>
        {status !== "failing" && status !== "checking" && (
          <span className="font-mono text-[9px] opacity-80">({latencyMs}ms)</span>
        )}
      </div>
    );
  }

  // Detailed variant: Rich card / indicator
  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl border ${styleConfig.badgeBg} ${className}`}
    >
      <div className="flex items-center space-x-2.5">
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${styleConfig.pingBg}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${styleConfig.dotBg} ${styleConfig.glowShadow}`}
          />
        </span>
        <div>
          <div className="text-xs font-bold leading-none">{styleConfig.label}</div>
          <div className="text-[10px] opacity-75 mt-0.5">
            {status === "failing"
              ? heartbeat?.error || "Serviço indisponível"
              : `Latência de resposta: ${latencyMs}ms`}
          </div>
        </div>
      </div>
      <div className="text-right font-mono text-xs font-bold">
        {status === "failing" ? "OFFLINE" : `${latencyMs} ms`}
      </div>
    </div>
  );
};

interface AgentHeartbeatMonitorCardProps {
  agentId: string;
  agentName: string;
  heartbeat?: AgentHeartbeatState;
  onRefresh?: () => void;
  onSimulate?: (mode: "active" | "latency" | "fail" | "reset") => void;
  onRestart?: () => void;
  autoRestartEnabled?: boolean;
  onToggleAutoRestart?: (enabled: boolean) => void;
}

export const AgentHeartbeatMonitorCard: React.FC<AgentHeartbeatMonitorCardProps> = ({
  agentId,
  agentName,
  heartbeat,
  onRefresh,
  onSimulate,
  onRestart,
  autoRestartEnabled = true,
  onToggleAutoRestart,
}) => {
  const status = heartbeat?.status || "checking";
  const latencyMs = heartbeat?.latencyMs ?? 0;

  const statusConfig = {
    active: {
      color: "emerald",
      dotBg: "bg-emerald-500",
      pingBg: "bg-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: "Endpoint Ativo & Saudável",
      description: "Respostas HTTP 200 imediatas dentro do tempo nominal de execução.",
    },
    high_latency: {
      color: "amber",
      dotBg: "bg-amber-500",
      pingBg: "bg-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      title: "Alerta: Alta Latência",
      description: "Latência superior ao limiar ideal (> 250ms). Possível carga elevada ou retenção de rede.",
    },
    failing: {
      color: "rose",
      dotBg: "bg-rose-500",
      pingBg: "bg-rose-400",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      title: "Falha de Conexão no Endpoint",
      description: "O agente não está a responder às chamadas de verificação de disponibilidade (503/Error).",
    },
    recovering: {
      color: "cyan",
      dotBg: "bg-cyan-500",
      pingBg: "bg-cyan-400",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      title: "Auto-Recuperação em Curso...",
      description: "O monitor detetou falha e disparou o reinício autónomo do agente.",
    },
    checking: {
      color: "sky",
      dotBg: "bg-sky-500",
      pingBg: "bg-sky-400",
      badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      title: "A verificar disponibilidade...",
      description: "A iniciar sondagem ao endpoint do agente...",
    },
  }[status];

  return (
    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Monitor de Heartbeat do Endpoint
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
            {status.toUpperCase()}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Recalcular heartbeat agora"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main visual heartbeat meter */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-3.5">
          {/* Animated radar rings for visual heartbeat */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950 border border-slate-800">
            <span
              className={`absolute inline-flex h-6 w-6 rounded-full opacity-70 animate-ping ${statusConfig.pingBg}`}
            />
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${statusConfig.dotBg} shadow-lg`}
            />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-100">{statusConfig.title}</div>
            <div className="text-[11px] text-slate-400 leading-tight">
              Endpoint: <code className="text-amber-400 font-mono">/api/agents/{agentId}/heartbeat</code>
            </div>
          </div>
        </div>

        {/* Latency meter */}
        <div className="text-right">
          <div className="text-lg font-black font-mono tracking-tight text-white">
            {status === "failing" ? (
              <span className="text-rose-400">OFFLINE</span>
            ) : (
              <span>{latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span></span>
            )}
          </div>
          <div className="text-[9px] font-mono text-slate-500">
            Uptime: {heartbeat?.uptimePercentage ?? 99.9}%
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        {statusConfig.description}
      </p>

      {/* Test / Simulation bar so the user can verify all 3 states */}
      {onSimulate && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 font-semibold">
            Testar Indicador Visual:
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onSimulate("active")}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                status === "active"
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                  : "bg-slate-900 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800"
              }`}
              title="Forçar estado Ativo (pulso verde)"
            >
              Verde (Ativo)
            </button>
            <button
              onClick={() => onSimulate("latency")}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                status === "high_latency"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                  : "bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800"
              }`}
              title="Simular latência alta de 380ms (pulso âmbar)"
            >
              Âmbar (Alta Latência)
            </button>
            <button
              onClick={() => onSimulate("fail")}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                status === "failing"
                  ? "bg-rose-500/30 text-rose-300 border border-rose-500/50"
                  : "bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-800"
              }`}
              title="Simular falha HTTP 503 (pulso vermelho)"
            >
              Vermelho (Falha)
            </button>
            <button
              onClick={() => onSimulate("reset")}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-medium transition-colors"
              title="Restaurar estado normal"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Auto-Recovery & Manual Restart Controls */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 font-semibold">Auto-Recuperação (Auto-Restart):</span>
          <button
            onClick={() => onToggleAutoRestart?.(!autoRestartEnabled)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              autoRestartEnabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            {autoRestartEnabled ? "ATIVADA (AUTOMÁTICA)" : "DESATIVADA"}
          </button>
        </div>

        {onRestart && (
          <button
            onClick={onRestart}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all active:scale-95"
            title="Reiniciar este agente imediatamente"
          >
            <RotateCw className="w-3 h-3" />
            <span>Reiniciar Agente</span>
          </button>
        )}
      </div>
    </div>
  );
};
