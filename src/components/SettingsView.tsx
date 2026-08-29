import React, { useState } from "react";
import {
  Settings,
  Database,
  Download,
  Upload,
  Shield,
  Layers,
  Cpu,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Globe,
  Lock,
  Sparkles,
  Terminal,
  User,
  Key,
  LogOut,
  Smartphone,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AuthGateway } from "./AuthGateway";
import { speakNaturalText } from "../utils/audio";
import { PwaInstallModal } from "./PwaInstallModal";
import { SupabaseStatusIndicator } from "./SupabaseStatusIndicator";

export const SettingsView: React.FC = () => {
  const [showPwaModal, setShowPwaModal] = useState(false);
  const {
    systemSettings,
    updateSettings,
    updateSupabaseCredentials,
    currentUser,
    authSession,
    activeRole,
    logout,
    exportSystemBackup,
    importSystemBackup,
    recordAuditLog,
    tasks,
    updateTaskStatus,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState(
    systemSettings.supabaseUrl || ""
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    systemSettings.supabaseAnonKey || ""
  );
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbStatusNotice, setDbStatusNotice] = useState<string | null>(null);

  // Model and AI Settings
  const [aiModel, setAiModel] = useState(systemSettings.aiModel || "gemini-3.7-flash");
  const [autoAudioTts, setAutoAudioTts] = useState(systemSettings.autoAudioTts);
  const [voiceName, setVoiceName] = useState(systemSettings.voiceName || "Kore");
  const [wakeWordEnabled, setWakeWordEnabled] = useState(systemSettings.wakeWordEnabled ?? true);
  const [wakeWordSoundFeedback, setWakeWordSoundFeedback] = useState(systemSettings.wakeWordSoundFeedback ?? true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [testingVoice, setTestingVoice] = useState(false);

  const handleTestVoice = async () => {
    setTestingVoice(true);
    await speakNaturalText(`Olá, Josemar. Esta é a voz neural ${voiceName} da KIA para o GAG Core.`, {
      voiceName,
      onEnd: () => setTestingVoice(false),
      onError: () => setTestingVoice(false),
    });
  };

  const handleSaveAiSettings = () => {
    updateSettings({
      aiModel,
      autoAudioTts,
      voiceName,
      wakeWordEnabled,
      wakeWordSoundFeedback,
    });
    setSavedNotice("Configurações de IA, Voz e Detetor 'KIA' salvas com sucesso!");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleTestAndSaveSupabase = async () => {
    setIsTestingDb(true);
    setDbStatusNotice(null);

    try {
      if (!supabaseUrl.trim()) {
        updateSupabaseCredentials("", "");
        setDbStatusNotice("Persistência configurada para Armazenamento Local Seguro.");
        setIsTestingDb(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      const res = updateSupabaseCredentials(supabaseUrl, supabaseAnonKey);
      if (res.success) {
        setDbStatusNotice("Camada de Supabase Auth e Banco PostgreSQL conectada e validada com sucesso!");

        // Task 101 auto-resolution
        const task101 = tasks.find((t) => t.id === "task-101");
        if (task101 && task101.status !== "DONE") {
          updateTaskStatus("task-101", "DONE");
        }
      } else {
        setDbStatusNotice(res.error || "Aviso: Verifique o URL e a Anon Key fornecidos.");
      }
    } catch (e: any) {
      setDbStatusNotice("Erro ao validar conexão com Supabase: " + e.message);
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importSystemBackup(content);
        if (success) {
          alert("Backup restaurado com sucesso no GAG Core!");
        } else {
          alert("Ficheiro de backup inválido.");
        }
      } catch (err: any) {
        alert("Erro ao ler ficheiro de backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {authModalOpen && (
        <AuthGateway isModal={true} onClose={() => setAuthModalOpen(false)} />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Configurações do Sistema GAG Core</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Kernel v2.4 OS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de autenticação Supabase Auth, modelos de IA, síntese de voz (TTS), backups de dados e soberania da GAG Visual.
          </p>
        </div>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all transform active:scale-95"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Gestão de Acesso & Contas</span>
        </button>
      </div>

      {/* User Session Banner */}
      <div className="bg-[#0b0f19] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-bold text-black text-base shadow-lg shadow-amber-500/20">
            {currentUser.name ? currentUser.name[0] : "J"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">{currentUser.name || "Operador GAG"}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {activeRole}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {authSession?.provider === "supabase" ? "Supabase Auth Conectado" : "Sessão Local Segura"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Trocar / Criar Conta</span>
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </div>

      {/* Grid: Independence Manifesto & Supabase Persistence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Connection Setup */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Persistência na Nuvem (Supabase / Postgres)</h2>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                systemSettings.supabaseConfigured
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {systemSettings.supabaseConfigured ? "CONNECTED" : "LOCAL_STORAGE"}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            O GAG Core opera com persistência resiliente local e permite sincronização nativa com Supabase PostgreSQL para equipas distribuídas.
          </p>

          <SupabaseStatusIndicator mode="card" />

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Supabase Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Supabase Anon Key</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              onClick={handleTestAndSaveSupabase}
              disabled={isTestingDb}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              {isTestingDb ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>A testar conexão...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Salvar & Validar Conexão</span>
                </>
              )}
            </button>

            {dbStatusNotice && (
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                {dbStatusNotice}
              </div>
            )}
          </div>
        </div>

        {/* Platform Independence & Architecture Sovereignty (Section 1) */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Server className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Soberania & Independência Tecnológica</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Conforme a diretriz fundacional da <strong>GAG Visual</strong>, o GAG Core é construído sobre uma arquitetura aberta e portátil.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Código Limpo Express + React + Tailwind</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sem dependência de runtimes fechados (Manus, Base44, Lovable ou Replit).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Exportação & Docker Ready</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pode ser implantado diretamente em VPS Linux, AWS ECS, GCP Cloud Run ou Docker.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Propriedade Total da GAG Visual</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Modelos, bases de conhecimento e schemas pertencem exclusivamente à organização.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: AI Model Parameters & State Backup Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model and Voice Settings */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Modelos de IA & Voz (TTS)</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Modelo Fundacional da KIA</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (Ultra-Rápido, Multimodal & Inteligente)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Latência Mínima & Alta Eficiência)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Voz Neural da KIA (Síntese Natural)</label>
              <div className="flex items-center space-x-2">
                <select
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Kore">Kore (Voz Equilibrada, Clara e Natural)</option>
                  <option value="Aoede">Aoede (Voz Melódica, Expressiva e Amigável)</option>
                  <option value="Fenrir">Fenrir (Voz Profunda, Executiva e Firme)</option>
                  <option value="Puck">Puck (Voz Ágil, Jovem e Dinâmica)</option>
                  <option value="Zephyr">Zephyr (Voz Suave, Calma e Serena)</option>
                </select>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={testingVoice}
                  className="px-3 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl hover:bg-amber-500/30 transition-colors disabled:opacity-50 flex items-center space-x-1 shrink-0"
                  title="Ouvir demonstração de voz"
                >
                  {testingVoice ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>Testar</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold text-white">Leitura de Voz Automática (Auto-TTS)</span>
                  <p className="text-[10px] text-slate-400">Ler em voz natural todas as respostas da KIA automaticamente</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoAudioTts}
                onChange={(e) => setAutoAudioTts(e.target.checked)}
                className="w-4 h-4 text-amber-500 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Wake Word Detection Setting */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                    Detetor de Voz Contínuo (Wake Word "KIA")
                  </span>
                  <p className="text-[10px] text-slate-300">
                    Ativação hands-free ao pronunciar "KIA", "Ei KIA" ou "Olá KIA" sem necessidade de clicar no botão.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={wakeWordEnabled}
                onChange={(e) => setWakeWordEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-500 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {wakeWordEnabled && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                <span className="text-slate-300">Sinal Sonoro de Ativação (Chime):</span>
                <input
                  type="checkbox"
                  checked={wakeWordSoundFeedback}
                  onChange={(e) => setWakeWordSoundFeedback(e.target.checked)}
                  className="w-4 h-4 text-amber-500 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            )}

            <button
              onClick={handleSaveAiSettings}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-500/40 transition-colors"
            >
              Salvar Parâmetros de IA & Voz
            </button>

            {savedNotice && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{savedNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Full System Backup Export & Import */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Download className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Snapshot & Backup Completo</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Descarrega um ficheiro JSON contendo todos os agentes, skills, base de conhecimento, tarefas e trilha de auditoria para arquivamento ou transferência.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={exportSystemBackup}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Snapshot Completo (.JSON)</span>
            </button>

            <div className="relative">
              <label
                htmlFor="import-backup-input"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurar Backup a partir de Ficheiro</span>
              </label>
              <input
                id="import-backup-input"
                type="file"
                accept=".json"
                onChange={handleImportBackupFile}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PWA & Deployment Readiness Card */}
      <div className="bg-gradient-to-r from-[#0d1222] via-[#090c14] to-[#121008] border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">GAG Core — Aplicação Instalável (PWA & Desktop)</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              100% Pronta
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            O GAG Core funciona como aplicação web progressiva com Service Worker, cache local, suporte a ecrã inteiro e atalhos no ambiente de trabalho ou smartphone.
          </p>
        </div>

        <button
          onClick={() => setShowPwaModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center space-x-2 shrink-0 shadow-lg transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span>Ver Instruções de Instalação</span>
        </button>
      </div>

      <PwaInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />
    </div>
  );
};
