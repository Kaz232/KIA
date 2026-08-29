import React, { useState, useEffect } from "react";
import {
  Database,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Server,
  ShieldCheck,
  Activity,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { dbClient, SupabaseHealthState } from "../persistence/supabaseClient";

interface BackendStatusIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({
  className = "",
  showWhenOnline = true,
}) => {
  const { supabaseHealth, refreshSupabaseHealth, setActiveTab, playSfx } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isConnected = supabaseHealth?.status === "CONNECTED";
  const isDisconnected = supabaseHealth?.status === "DISCONNECTED";
  const isNotConfigured = supabaseHealth?.status === "NOT_CONFIGURED";
  const isCheckingState = supabaseHealth?.status === "CHECKING" || isChecking;

  const handleManualCheck = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsChecking(true);
    playSfx?.("action");
    try {
      await refreshSupabaseHealth();
      playSfx?.("click");
    } finally {
      setIsChecking(false);
    }
  };

  // If set to only show when disconnected/offline
  if (!showWhenOnline && isConnected) {
    return null;
  }

  return (
    <>
      <button
        id="backend-status-indicator"
        type="button"
        onClick={() => {
          setShowModal(true);
          playSfx?.("click");
        }}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
          isDisconnected
            ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse shadow-amber-500/20"
            : isConnected
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
            : isNotConfigured
            ? "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
            : "bg-blue-500/10 border-blue-500/30 text-blue-300"
        } ${className}`}
        title={
          isDisconnected
            ? "Alerta: Conexão ao Supabase Backend perdida! Clique para diagnóstico e reconexão."
            : isConnected
            ? "Supabase Backend Conectado e Operacional"
            : "Armazenamento em Modo Local Resiliente"
        }
      >
        {/* Pulsing indicator dot */}
        <div className="relative flex items-center justify-center">
          {isDisconnected ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            </>
          ) : isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute opacity-70" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-500" />
          )}
        </div>

        {/* Database or Warning icon */}
        {isDisconnected ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <Database className="w-3.5 h-3.5 shrink-0" />
        )}

        {/* Status text */}
        <span className="hidden sm:inline font-medium tracking-tight">
          {isDisconnected
            ? "Backend Offline"
            : isConnected
            ? `Supabase Online${supabaseHealth.latencyMs ? ` (${supabaseHealth.latencyMs}ms)` : ""}`
            : isNotConfigured
            ? "Modo Local"
            : "A Verificar..."}
        </span>

        <span className="sm:hidden font-medium">
          {isDisconnected ? "Offline" : isConnected ? "Online" : "Local"}
        </span>

        {/* Quick ping spin if checking */}
        {isCheckingState && (
          <RefreshCw className="w-3 h-3 animate-spin text-amber-400 ml-0.5" />
        )}
      </button>

      {/* Connectivity Diagnostic & Transparency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    isDisconnected
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : isConnected
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isDisconnected ? (
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Monitor de Conectividade do Backend
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transparência de integridade do Supabase e motor de fallback
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Main Status Block */}
              <div
                className={`p-4 rounded-xl border ${
                  isDisconnected
                    ? "bg-amber-950/25 border-amber-500/40 text-amber-200"
                    : isConnected
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-900 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {isDisconnected ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                  ) : isConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Database className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Estado do Serviço
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {isDisconnected
                        ? "Conexão ao Supabase Backend Indisponível"
                        : isConnected
                        ? "Supabase Backend Conectado & Operacional"
                        : "Modo Local Resiliente em Execução"}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {isDisconnected
                    ? "A conexão com o servidor Supabase foi interrompida ou está inacessível. O Motor Local em Memória foi ativado automaticamente para garantir a continuidade imediata das operações sem perda de trabalho."
                    : isConnected
                    ? "Todas as operações da KIA, agentes, tarefas e logs estão a ser sincronizados em tempo real com o banco de dados Supabase."
                    : "O sistema está operando localmente com motor relacional resiliente em memória."}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Latência</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {supabaseHealth?.latencyMs ? `${supabaseHealth.latencyMs} ms` : "N/A"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Último Teste</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {supabaseHealth?.lastChecked
                      ? new Date(supabaseHealth.lastChecked).toLocaleTimeString()
                      : "Agora"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Endpoint Configurado</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-1 truncate">
                    {supabaseHealth?.endpointUrl || "Nenhum URL configurado (Local Storage Fallback)"}
                  </div>
                </div>
              </div>

              {/* Error diagnostic if present */}
              {supabaseHealth?.errorMessage && (
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    Detalhe do Erro:
                  </div>
                  <div className="text-xs font-mono text-amber-300/90 break-words">
                    {supabaseHealth.errorMessage}
                  </div>
                </div>
              )}

              {/* Safety guarantee */}
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Proteção Ativa:</strong> As requisições continuam sendo atendidas pelo armazenamento resiliente local.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setActiveTab("settings");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Configurar Backend</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                  <span>{isChecking ? "A Testar..." : "Testar Conexão"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
