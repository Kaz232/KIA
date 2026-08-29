import React, { useState } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  ExternalLink,
  Info,
  X,
  Radio,
  Clock,
  Activity,
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface SupabaseStatusIndicatorProps {
  mode?: "pill" | "banner" | "card";
  className?: string;
  showDetailsOnClick?: boolean;
}

export const SupabaseStatusIndicator: React.FC<SupabaseStatusIndicatorProps> = ({
  mode = "pill",
  className = "",
  showDetailsOnClick = true,
}) => {
  const { supabaseHealth, refreshSupabaseHealth, setActiveTab, playSfx } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const handleManualCheck = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsChecking(true);
    playSfx("action");
    try {
      await refreshSupabaseHealth();
      playSfx("click");
    } finally {
      setIsChecking(false);
    }
  };

  const isConnected = supabaseHealth.status === "CONNECTED";
  const isDisconnected = supabaseHealth.status === "DISCONNECTED";
  const isNotConfigured = supabaseHealth.status === "NOT_CONFIGURED";
  const isCheckingState = supabaseHealth.status === "CHECKING" || isChecking;

  // ==========================================
  // MODE 1: HEADER PILL (High transparency & accessible)
  // ==========================================
  if (mode === "pill") {
    return (
      <>
        <button
          onClick={() => {
            if (showDetailsOnClick) {
              setShowModal(true);
              playSfx("click");
            }
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              : isDisconnected
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse shadow-amber-500/10"
              : isNotConfigured
              ? "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
              : "bg-blue-500/10 border-blue-500/30 text-blue-300"
          } ${className}`}
          title="Status de Conectividade do Supabase Backend da KIA (Clique para detalhes e diagnóstico)"
        >
          {/* Status Indicator Icon & Pulse */}
          <div className="relative flex items-center justify-center">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </>
            ) : isDisconnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute opacity-75" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            )}
          </div>

          <Database className="w-3.5 h-3.5" />

          {/* Label */}
          <span className="hidden sm:inline font-medium">
            {isConnected
              ? `Supabase: Online${supabaseHealth.latencyMs ? ` (${supabaseHealth.latencyMs}ms)` : ""}`
              : isDisconnected
              ? "Supabase: Desconectado"
              : isNotConfigured
              ? "Supabase: Modo Local"
              : "Supabase: A Verificar"}
          </span>

          <span className="sm:hidden font-medium">
            {isConnected ? "Online" : isDisconnected ? "Offline" : "Local"}
          </span>

          {/* Warning Icon Badge if Disconnected */}
          {isDisconnected && (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
        </button>

        {/* Diagnostic Modal */}
        {showModal && (
          <DiagnosticModal
            supabaseHealth={supabaseHealth}
            isChecking={isChecking}
            onClose={() => setShowModal(false)}
            onRefresh={handleManualCheck}
            onOpenSettings={() => {
              setShowModal(false);
              setActiveTab("settings");
            }}
          />
        )}
      </>
    );
  }

  // ==========================================
  // MODE 2: TOP BANNER (For KIA Chat / Main Views during Downtime)
  // ==========================================
  if (mode === "banner") {
    // Only show banner when disconnected or during downtime
    if (isConnected || (dismissedBanner && isDisconnected)) {
      return null;
    }

    return (
      <>
        <div
          className={`w-full mb-3 p-3 rounded-xl border transition-all animate-fadeIn ${
            isDisconnected
              ? "bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/90 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-950/20"
              : "bg-slate-900/90 border-slate-800 text-slate-300"
          } ${className}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isDisconnected
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isDisconnected ? (
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    {isDisconnected
                      ? "⚠️ Conexão ao Supabase Backend Indisponível (Downtime Detectado)"
                      : "Modo de Armazenamento Local Resiliente Ativo"}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isDisconnected
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    Fallback Ativo
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isDisconnected
                    ? "A KIA está a operar em Modo de Contingência Local com o motor relacional em memória. Todas as conversas, tarefas dos agentes e diretrizes continuam ativas sem perda de dados."
                    : "As credenciais do Supabase não estão configuradas. O sistema está a persistir dados através do armazenamento local seguro."}
                </p>

                {supabaseHealth.errorMessage && (
                  <p className="text-[11px] text-amber-400/90 font-mono mt-1.5 bg-black/40 px-2 py-1 rounded border border-amber-500/20 inline-block">
                    {supabaseHealth.errorMessage}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <button
                    onClick={handleManualCheck}
                    disabled={isChecking}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                    <span>{isChecking ? "A Testar Conexão..." : "Reconectar / Testar Conexão"}</span>
                  </button>

                  <button
                    onClick={() => setShowModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                    <span>Ver Diagnóstico</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("settings")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Configurar Supabase</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissedBanner(true)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Ocultar aviso durante esta sessão"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diagnostic Modal */}
        {showModal && (
          <DiagnosticModal
            supabaseHealth={supabaseHealth}
            isChecking={isChecking}
            onClose={() => setShowModal(false)}
            onRefresh={handleManualCheck}
            onOpenSettings={() => {
              setShowModal(false);
              setActiveTab("settings");
            }}
          />
        )}
      </>
    );
  }

  // ==========================================
  // MODE 3: CARD VIEW (For Settings / System Overview)
  // ==========================================
  return (
    <div
      className={`p-4 rounded-xl border bg-slate-900/90 ${
        isConnected
          ? "border-emerald-500/30"
          : isDisconnected
          ? "border-amber-500/40 bg-amber-950/10"
          : "border-slate-800"
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              isConnected
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isDisconnected
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Supabase Backend Persistence
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isConnected
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isDisconnected
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {isConnected ? "ONLINE" : isDisconnected ? "DESCONECTADO" : "MODO LOCAL"}
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isConnected
                ? `Conectado com latência de ${supabaseHealth.latencyMs || "~50"}ms`
                : isDisconnected
                ? "Downtime ou erro de rede detectado. Motor de Contingência Local ativo."
                : "Armazenamento em memória local ativo para alta resiliência."}
            </p>
          </div>
        </div>

        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
          <span>{isChecking ? "Testando..." : "Testar Conexão"}</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// DETAILED DIAGNOSTIC MODAL
// ==========================================
interface DiagnosticModalProps {
  supabaseHealth: any;
  isChecking: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  supabaseHealth,
  isChecking,
  onClose,
  onRefresh,
  onOpenSettings,
}) => {
  const isConnected = supabaseHealth.status === "CONNECTED";
  const isDisconnected = supabaseHealth.status === "DISCONNECTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-lg ${
                isConnected
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : isDisconnected
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Diagnóstico de Conectividade Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Transparência de backend e motor de contingência da KIA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Main Status Block */}
          <div
            className={`p-4 rounded-xl border ${
              isConnected
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : isDisconnected
                ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isDisconnected ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                ) : (
                  <Radio className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Estado Atual
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {isConnected
                      ? "Supabase Backend Conectado & Operacional"
                      : isDisconnected
                      ? "Supabase Desconectado / Downtime Detectado"
                      : "Modo de Armazenamento Local Resiliente"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              {isConnected
                ? "Todas as tabelas relacionais, skills, tarefas e checkpoints estão a sincronizar em tempo real com o seu projeto Supabase."
                : "Durante qualquer instabilidade ou downtime do Supabase, a KIA ativa automaticamente o Motor Local em Memória. Todas as operações continuam ativas sem interrupção do utilizador."}
            </p>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Latência de Ping</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {supabaseHealth.latencyMs ? `${supabaseHealth.latencyMs} ms` : "N/A"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Última Verificação</span>
              </div>
              <div className="text-xs font-bold text-white mt-1">
                {new Date(supabaseHealth.lastChecked).toLocaleTimeString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Endpoint Registado</span>
              </div>
              <div className="text-xs font-mono text-slate-300 mt-1 truncate">
                {supabaseHealth.endpointUrl || "Nenhum URL configurado (Local Storage Fallback)"}
              </div>
            </div>
          </div>

          {/* Technical Reason / Error Message */}
          {supabaseHealth.errorMessage && (
            <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 mb-1">
                Diagnóstico Técnico:
              </div>
              <div className="text-xs font-mono text-amber-300/90 break-words">
                {supabaseHealth.errorMessage}
              </div>
            </div>
          )}

          {/* Contingency Safety Guarantee */}
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/20 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Garantia de Contingência:</strong> Nenhuma mensagem ou tarefa é descartada. O fallback armazena snapshots localmente.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Configurações</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onRefresh}
              disabled={isChecking}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
              <span>{isChecking ? "Verificando..." : "Testar Conexão"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
