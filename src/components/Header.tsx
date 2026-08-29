import React, { useState } from "react";
import {
  Sparkles,
  Shield,
  ShieldAlert,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Search,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  LogOut,
  Key,
  Database,
  User,
  Download,
  Smartphone,
  Zap,
  TrendingUp,
  Radio,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { PwaInstallModal } from "./PwaInstallModal";
import { BackendStatusIndicator } from "./BackendStatusIndicator";

export const Header: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    currentUser,
    authSession,
    logout,
    systemSettings,
    updateSettings,
    setActiveTab,
    isKiaThinking,
    scannedDocs,
    tasks,
    setShowSynergyTour,
    setIsSynergyModalOpen,
    setIsScenarioModalOpen,
    setIsKazaModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  const pendingReviewsCount =
    scannedDocs.filter((d) => d.status === "REVIEW_REQUIRED").length +
    tasks.filter((t) => t.status === "REVIEW").length;

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: "OWNER", label: "Owner (Josemar)", desc: "Acesso total irrestrito" },
    { role: "ADMIN", label: "Admin", desc: "Gestão operacional & revisão" },
    { role: "AGENT", label: "Agent Executor", desc: "Execução restrita por skill" },
    { role: "VIEWER", label: "Viewer", desc: "Apenas leitura" },
  ];

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "JG";

  return (
    <header className="sticky top-0 z-30 bg-[#07090e]/95 backdrop-blur-md border-b border-amber-500/20 px-4 lg:px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center space-x-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-black text-lg tracking-tighter">G</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white tracking-wider text-base">GAG CORE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                v2.4 OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Sistema Operacional Inteligente da GAG Visual
            </p>
          </div>
        </button>

        {/* Operational Pulse */}
        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
          <div className="relative flex items-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isKiaThinking ? "bg-amber-400 animate-ping" : "bg-emerald-400"
              }`}
            />
            <span
              className={`absolute w-2.5 h-2.5 rounded-full ${
                isKiaThinking ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
          </div>
          <span className="text-xs text-slate-300 font-medium">
            {isKiaThinking ? "KIA a Processar..." : "KIA Ativa & Pronta"}
          </span>
        </div>

        {/* Backend & Supabase Connectivity Status Indicator */}
        <div className="flex items-center pl-2">
          <BackendStatusIndicator />
        </div>
      </div>

      {/* Center Quick Search Trigger */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6 space-x-2">
        <button
          onClick={() => setActiveTab("studio")}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0"
          title="Abrir Estúdio Multimodal: Vídeo Veo & Imagens"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Estúdio & Vídeo Veo</span>
        </button>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Pesquisa Google em tempo real ou comandos KIA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                setActiveTab("studio");
              }
            }}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Controls & Active Role Switcher */}
      <div className="flex items-center space-x-2.5">
        {/* Pending Reviews Pill */}
        {pendingReviewsCount > 0 && (
          <button
            onClick={() => setActiveTab("scanner")}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
            title="Revisões pendentes no Scanner e Tarefas"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Revisões:</span>
            <span>{pendingReviewsCount}</span>
          </button>
        )}

        {/* High-Impact Global Synergy Trigger Button */}
        <button
          onClick={() => setIsSynergyModalOpen(true)}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/30 hover:scale-105 active:scale-95 group"
          title="Disparar Sinergia Operacional Imediata em todos os 13 Agentes"
        >
          <Zap className="w-3.5 h-3.5 fill-black text-black group-hover:animate-bounce" />
          <span className="font-black tracking-wide hidden sm:inline">⚡ Disparar Sinergia</span>
          <span className="font-black tracking-wide sm:hidden">⚡ Sinergia</span>
        </button>

        {/* Quick Enterprise Tools: Autocura, Simulator & Kaza Webhooks */}
        <button
          onClick={() => setActiveTab("incidents")}
          className="hidden 2xl:flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition-colors"
          title="Central de Autocura e Resolução Automática de Erros"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autocura</span>
        </button>

        <button
          onClick={() => setIsScenarioModalOpen(true)}
          className="hidden 2xl:flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 text-xs font-semibold transition-colors"
          title="Simulador de Cenários Preditivos & Risco"
        >
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Simulador</span>
        </button>

        <button
          onClick={() => setIsKazaModalOpen(true)}
          className="hidden 2xl:flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-semibold transition-colors"
          title="Kaza Core Webhook Dispatcher 24/7"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kaza</span>
        </button>

        {/* Synergy Tour Button */}
        <button
          onClick={() => setShowSynergyTour(true)}
          className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm"
          title="Abrir Onboarding & Tour de Sinergia dos Agentes"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Tour Sinergia</span>
        </button>

        {/* PWA Install Button */}
        <button
          onClick={() => setShowPwaModal(true)}
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold transition-colors"
          title="Instalar GAG Core OS como Aplicativo Nativo (PWA)"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Instalar App</span>
        </button>

        {/* Wake Word "KIA" Hands-Free Detector Toggle */}
        <button
          onClick={() => {
            const next = !(systemSettings.wakeWordEnabled ?? true);
            updateSettings({ wakeWordEnabled: next });
          }}
          className={`p-2 rounded-lg border transition-all flex items-center space-x-1.5 ${
            systemSettings.wakeWordEnabled ?? true
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20"
              : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
          }`}
          title={
            systemSettings.wakeWordEnabled ?? true
              ? 'Detetor de Voz Ativo: Diga "KIA" ou "Ei KIA" a qualquer momento para comandar'
              : 'Detetor de Voz "KIA" Desativado (Clique para Ativar Modo Mãos-Livres)'
          }
        >
          {systemSettings.wakeWordEnabled ?? true ? (
            <>
              <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-amber-300 hidden xl:inline">
                "KIA" ON
              </span>
            </>
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </button>

        {/* Audio TTS toggle */}
        <button
          onClick={() =>
            updateSettings({ autoAudioTts: !systemSettings.autoAudioTts })
          }
          className={`p-2 rounded-lg border transition-colors ${
            systemSettings.autoAudioTts
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          title={
            systemSettings.autoAudioTts
              ? "Voz da KIA Ativada (TTS)"
              : "Voz da KIA Silenciada"
          }
        >
          {systemSettings.autoAudioTts ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Role Switcher (RBAC) */}
        <div className="relative group">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/30 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-amber-500/60 transition-colors">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90">
                Papel: {activeRole}
              </span>
            </div>
          </div>

          {/* Role Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-2 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
              Simular Permissões RBAC
            </div>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => setActiveRole(r.role)}
                className={`w-full text-left px-2.5 py-2 rounded-md flex items-start space-x-2 transition-colors ${
                  activeRole === r.role
                    ? "bg-amber-500/20 text-amber-300 font-semibold"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <UserCheck
                  className={`w-4 h-4 mt-0.5 ${
                    activeRole === r.role ? "text-amber-400" : "text-slate-500"
                  }`}
                />
                <div>
                  <div className="text-xs">{r.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {r.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User Badge & Supabase Auth Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center space-x-2 pl-2 focus:outline-none"
            title={`${currentUser.name} (${currentUser.email})`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-amber-300 text-xs">
                {initials}
              </div>
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="pb-2.5 border-b border-slate-800">
                <div className="font-bold text-white text-xs truncate">
                  {currentUser.name || "Operador GAG"}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUser.email}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {activeRole}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>
                      {authSession?.provider === "supabase"
                        ? "Supabase Auth"
                        : "Sessão Local"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="py-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-white flex items-center space-x-2 transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configurar Supabase</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Terminar Sessão (Bloquear OS)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PwaInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />
    </header>
  );
};
