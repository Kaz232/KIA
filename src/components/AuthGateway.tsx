import React, { useState } from "react";
import {
  Shield,
  Lock,
  Mail,
  Key,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
  Sparkles,
  Layers,
  Terminal,
  Cpu,
  Info,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";

interface AuthGatewayProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onClose, isModal = false }) => {
  const {
    loginWithGoogle,
    loginWithSupabase,
    registerWithSupabase,
    resetPassword,
    continueAsLocalSession,
    updateSupabaseCredentials,
    systemSettings,
    currentUser,
    isAuthenticated,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"login" | "register" | "supabase_config" | "forgot">("login");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("ADMIN");
  const [regOrgCode, setRegOrgCode] = useState("GAG-VISUAL-2026");

  // Supabase Config fields
  const [supabaseUrl, setSupabaseUrl] = useState(systemSettings.supabaseUrl || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(systemSettings.supabaseAnonKey || "");

  // Forgot Password field
  const [forgotEmail, setForgotEmail] = useState("");

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearNotices = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotices();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage("Por favor, preencha o e-mail e a palavra-passe.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithSupabase(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMessage("Autenticação realizada com sucesso!");
        if (onClose) setTimeout(onClose, 600);
      } else {
        setErrorMessage(res.error || "Falha ao iniciar sessão. Verifique as suas credenciais.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao iniciar sessão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotices();

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("A palavra-passe deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerWithSupabase(regEmail, regPassword, regName, regRole);
      if (res.success) {
        if (res.requiresConfirmation) {
          setSuccessMessage("Registo efetuado com sucesso! Verifique o seu e-mail para confirmar a conta no Supabase.");
        } else {
          setSuccessMessage("Conta criada e autenticada com sucesso no Supabase Auth!");
          if (onClose) setTimeout(onClose, 800);
        }
      } else {
        setErrorMessage(res.error || "Erro ao criar conta no Supabase.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado no registo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    clearNotices();

    setIsLoading(true);
    try {
      const res = updateSupabaseCredentials(supabaseUrl, supabaseAnonKey);
      if (res.success) {
        setSuccessMessage("Credenciais do Supabase salvas e validadas!");
        setTimeout(() => setActiveTab("login"), 1000);
      } else {
        setErrorMessage(res.error || "Erro ao salvar credenciais do Supabase.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotices();

    if (!forgotEmail.trim()) {
      setErrorMessage("Introduza o seu e-mail.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setSuccessMessage("Instruções de recuperação enviadas para o seu e-mail.");
      } else {
        setErrorMessage(res.error || "Erro ao solicitar recuperação.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSandboxAccess = (role: UserRole = "OWNER") => {
    continueAsLocalSession(role, role === "OWNER" ? "Josemar Gourgel" : `Operador ${role}`);
    if (onClose) onClose();
  };

  return (
    <div
      className={`${
        isModal
          ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          : "min-h-screen bg-[#05070c] flex items-center justify-center p-4"
      }`}
    >
      <div className="w-full max-w-xl bg-[#090d16] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden relative">
        {/* Top Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Header Branding */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-[#060911]/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Shield className="w-5 h-5 text-black font-black" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-black text-white tracking-wide">GAG CORE OS</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    SUPABASE AUTH
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Camada de Autenticação Segura & Gestão de Identidade GAG Visual
                </p>
              </div>
            </div>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold rounded-lg bg-slate-800/50 hover:bg-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 mt-6 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveTab("login");
                clearNotices();
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Iniciar Sessão</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("register");
                clearNotices();
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Criar Conta</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("supabase_config");
                clearNotices();
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === "supabase_config"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
              title="Configurar Endpoint do Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Supabase</span>
            </button>
          </div>
        </div>

        {/* Notices */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Body Form Content */}
        <div className="p-6 space-y-4">
          {/* TAB 1: LOGIN */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>E-mail Corporativo</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="operador@gagvisual.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Palavra-passe</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("forgot");
                      clearNotices();
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>A autenticar no Supabase...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no GAG Core</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Google Sign In Button */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono">ou entrar com</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  clearNotices();
                  setIsLoading(true);
                  try {
                    const res = await loginWithGoogle();
                    if (res.success && onClose) onClose();
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com Google (Firebase Auth)</span>
              </button>

              {/* Status footer with Supabase connectivity */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      systemSettings.supabaseConfigured ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <span>
                    {systemSettings.supabaseConfigured
                      ? "Supabase Auth Conectado"
                      : "Supabase Local / Pendente"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickSandboxAccess("OWNER")}
                  className="text-amber-400/90 hover:text-amber-300 font-semibold underline"
                >
                  Entrar como Owner (Josemar)
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Josemar Gourgel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>E-mail Corporativo</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="operador@gagvisual.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Palavra-passe</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Papel RBAC Inicial</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
                  >
                    <option value="OWNER">Owner (Acesso Total)</option>
                    <option value="ADMIN">Admin (Gestão Operacional)</option>
                    <option value="AGENT">Agent Executor (Restrito)</option>
                    <option value="VIEWER">Viewer (Apenas Leitura)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Código de Organização GAG Visual</span>
                </label>
                <input
                  type="text"
                  value={regOrgCode}
                  onChange={(e) => setRegOrgCode(e.target.value)}
                  placeholder="GAG-VISUAL-2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>A registar no Supabase...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Criar Conta & Iniciar Sessão</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: SUPABASE CONFIG */}
          {activeTab === "supabase_config" && (
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3.5">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Configuração da Instância Supabase Auth</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Insira as credenciais do seu projeto Supabase (Project Settings &rarr; API) para ativar a persistência em nuvem e a gestão remota de utilizadores.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Supabase Anon Key (Public)</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Salvar & Validar Endpoint</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                Insira o seu e-mail corporativo para receber uma ligação de redefinição de palavra-passe através do Supabase Auth.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">E-mail Registado</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="operador@gagvisual.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    clearNotices();
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Enviar Ligação de Redefinição</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sandbox Shortcut Footer */}
        <div className="bg-[#060910] p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Acesso Rápido de Demonstração / Sandbox:</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuickSandboxAccess("OWNER")}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
            >
              Owner
            </button>
            <button
              onClick={() => handleQuickSandboxAccess("ADMIN")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickSandboxAccess("AGENT")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
            >
              Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
