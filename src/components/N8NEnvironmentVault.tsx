import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Server,
  Eye,
  EyeOff,
  Check,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
  FileCode2,
  Cpu,
  Zap,
  RotateCcw,
} from "lucide-react";
import {
  N8NEnvironmentManager,
  N8NEnvironmentConfig,
} from "../core/tools/n8n/n8nEnvironmentManager";
import { useApp } from "../context/AppContext";

export const N8NEnvironmentVault: React.FC = () => {
  const { playSfx, recordAuditLog } = useApp();
  const envManager = N8NEnvironmentManager.getInstance();

  const [environments, setEnvironments] = useState<N8NEnvironmentConfig[]>([]);
  const [activeEnvId, setActiveEnvId] = useState<string>("production");
  const [selectedEnvId, setSelectedEnvId] = useState<string>("production");

  // Form edit state for currently selected environment
  const [editForm, setEditForm] = useState<N8NEnvironmentConfig | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{
    status: "success" | "error";
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New environment form
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvBadge, setNewEnvBadge] = useState("TEST");
  const [newEnvUrl, setNewEnvUrl] = useState("https://");
  const [newEnvApiKey, setNewEnvApiKey] = useState("");

  const refreshState = () => {
    const all = envManager.getAllEnvironments();
    const active = envManager.getActiveEnvironment();
    setEnvironments(all);
    setActiveEnvId(active.id);

    const currentSelected = all.find((e) => e.id === selectedEnvId) || active;
    setSelectedEnvId(currentSelected.id);
    setEditForm({ ...currentSelected });
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleSelectEnvironment = (id: string) => {
    setSelectedEnvId(id);
    const env = environments.find((e) => e.id === id);
    if (env) {
      setEditForm({ ...env });
      setShowApiKey(false);
      setShowSecret(false);
      setTestFeedback(null);
    }
  };

  const handleSetActive = (id: string) => {
    envManager.setActiveEnvironment(id);
    setActiveEnvId(id);
    playSfx("action");
    setToastMessage(`Ambiente ativo alterado para "${editForm?.name || id}". Templates usarão estas credenciais.`);
    recordAuditLog(
      `Alteração de Ambiente N8N Ativo: ${id}`,
      "system_implementation",
      "SUCCESS",
      `Credenciais vinculadas ao cluster ${editForm?.baseUrl}`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveEnvironment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    envManager.updateEnvironment(editForm.id, {
      name: editForm.name,
      badge: editForm.badge,
      baseUrl: editForm.baseUrl,
      apiKey: editForm.apiKey,
      webhookSecret: editForm.webhookSecret,
      webhookUrlPrefix: editForm.webhookUrlPrefix,
      credentialReferenceKey: editForm.credentialReferenceKey,
      description: editForm.description,
    });

    playSfx("success");
    setToastMessage(`Credenciais do ambiente "${editForm.name}" guardadas no cofre seguro!`);
    refreshState();
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestConnection = async () => {
    if (!editForm) return;
    setIsTesting(true);
    setTestFeedback(null);
    playSfx("action");

    try {
      const result = await envManager.testEnvironmentConnection(editForm.id);
      setTestFeedback({
        status: "success",
        message: result.message,
        latencyMs: result.latencyMs,
      });
      playSfx("success");
      refreshState();
    } catch (err: any) {
      setTestFeedback({
        status: "error",
        message: err?.message || "Falha ao conectar ao endpoint N8N.",
      });
      playSfx("error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    playSfx("action");
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleCreateNewEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim() || !newEnvUrl.trim()) return;

    const id = newEnvName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString(36);
    envManager.addEnvironment({
      id,
      name: newEnvName.trim(),
      badge: newEnvBadge.toUpperCase().slice(0, 5),
      baseUrl: newEnvUrl.trim(),
      apiKey: newEnvApiKey.trim() || `n8n_api_${id}`,
      webhookSecret: `gag_secret_${id}`,
      webhookUrlPrefix: "/webhook",
      isDefault: false,
      credentialReferenceKey: `N8N_${newEnvBadge.toUpperCase()}_CREDENTIALS`,
      description: `Ambiente customizado criado por Josemar Gourgel para operações específicas.`,
    });

    setIsAddingNew(false);
    setNewEnvName("");
    setNewEnvUrl("https://");
    setNewEnvApiKey("");
    playSfx("success");
    setToastMessage(`Novo ambiente de automação "${newEnvName}" registado!`);
    refreshState();
    setSelectedEnvId(id);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Pretende restaurar as configurações padrão de ambientes N8N da GAG Visual?")) {
      envManager.resetToDefaults();
      refreshState();
      playSfx("success");
      setToastMessage("Ambientes restaurados para as configurações recomendadas de Luanda.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Cofre Seguro de Ambientes & Chaves API N8N
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Armazenamento Criptografado Local</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Defina e referencie credenciais de API por ambiente (<strong>Desenvolvimento Local</strong>, <strong>Staging</strong> e <strong>Produção Luanda</strong>). Os templates e agentes implantados herdam automaticamente o endpoint e referências do ambiente ativo.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Ambiente</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
              title="Restaurar padrões de ambientes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Environments List (Left) + Detail & Credentials Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Environments Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Ambientes Registados ({environments.length})</span>
            <span className="text-[10px] text-amber-400 font-mono">
              Ativo: {environments.find((e) => e.id === activeEnvId)?.badge || "PROD"}
            </span>
          </div>

          <div className="space-y-2">
            {environments.map((env) => {
              const isSelected = selectedEnvId === env.id;
              const isActive = activeEnvId === env.id;

              return (
                <div
                  key={env.id}
                  onClick={() => handleSelectEnvironment(env.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                    isSelected
                      ? "bg-[#0f1424] border-amber-500/50 shadow-md shadow-amber-500/5"
                      : "bg-[#0b0f19] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-400 font-mono">
                        {env.badge}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">
                        {env.name}
                      </span>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 shrink-0">
                        <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                        <span>ATIVO</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Inativo</span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {env.baseUrl}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          env.status === "connected"
                            ? "bg-emerald-400 shadow-sm shadow-emerald-500/50"
                            : "bg-slate-500"
                        }`}
                      />
                      <span>
                        {env.status === "connected"
                          ? `Online (${env.latencyMs || 25}ms)`
                          : "Não Testado"}
                      </span>
                    </div>

                    <span className="font-mono text-slate-500">
                      {N8NEnvironmentManager.maskApiKey(env.apiKey)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Como funcionam as referências?</span>
            </div>
            <p className="leading-relaxed">
              Ao implantar um workflow ou acionar um agente, o GAG Core OS injeta a referência segura de credenciais do ambiente ativo, prevenindo chaves em texto limpo no código.
            </p>
          </div>
        </div>

        {/* Right Column: Environment Credential Editor */}
        <div className="lg:col-span-8">
          {editForm ? (
            <form
              onSubmit={handleSaveEnvironment}
              className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-5"
            >
              {/* Form Top Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">{editForm.name}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                      ID: {editForm.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{editForm.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {activeEnvId !== editForm.id && (
                    <button
                      type="button"
                      onClick={() => handleSetActive(editForm.id)}
                      className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tornar Ambiente Ativo</span>
                    </button>
                  )}

                  {environments.length > 1 && !editForm.isDefault && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remover ambiente "${editForm.name}"?`)) {
                          envManager.removeEnvironment(editForm.id);
                          refreshState();
                          playSfx("trash");
                        }
                      }}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition-colors"
                      title="Remover este ambiente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Nome do Ambiente</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Badge */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Tag / Badge (ex: PROD, DEV)</label>
                  <input
                    type="text"
                    value={editForm.badge}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        badge: e.target.value.toUpperCase().slice(0, 6),
                      })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Base URL */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>URL do Cluster N8N (Base URL)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ex: https://n8n.gagvisual.com
                    </span>
                  </label>
                  <input
                    type="url"
                    value={editForm.baseUrl}
                    onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* API Key */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chave de API do N8N (API Key)</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        {showApiKey ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Revelar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={editForm.apiKey}
                      onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
                      placeholder="n8n_api_v1_..."
                      className="w-full pl-3 pr-20 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-200 font-mono focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText(editForm.apiKey, "apikey")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors"
                    >
                      {copiedKey === "apikey" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === "apikey" ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    A chave fica armazenada no cofre seguro do seu navegador e nunca é exposta em repositórios públicos.
                  </p>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Segredo Webhook (HMAC)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      {showSecret ? "Ocultar" : "Revelar"}
                    </button>
                  </div>
                  <input
                    type={showSecret ? "text" : "password"}
                    value={editForm.webhookSecret}
                    onChange={(e) =>
                      setEditForm({ ...editForm, webhookSecret: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Credential Reference Key */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nome da Referência no N8N</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editForm.credentialReferenceKey}
                    onChange={(e) =>
                      setEditForm({ ...editForm, credentialReferenceKey: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-300 font-semibold">Notas & Descrição do Cluster</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Test Diagnostics Box */}
              {testFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 animate-fadeIn ${
                    testFeedback.status === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  {testFeedback.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="font-bold">{testFeedback.message}</div>
                    {testFeedback.latencyMs !== undefined && (
                      <div className="text-[11px] opacity-80 font-mono">
                        Latência calculada: {testFeedback.latencyMs}ms | Estado: ONLINE
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reference Snippet Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Sintaxe de Referência para Nós N8N:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `{{ $env.${editForm.credentialReferenceKey} }}`,
                        "syntax"
                      )
                    }
                    className="text-amber-300 hover:text-amber-200 font-mono text-[10px] flex items-center space-x-1"
                  >
                    {copiedKey === "syntax" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copiar Variável</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-900/90 rounded-lg font-mono text-xs text-amber-300/90 border border-slate-800">
                  {`{{ $env.${editForm.credentialReferenceKey} }}`}
                </div>
              </div>

              {/* Submit & Test Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isTesting ? "A Testar Conexão..." : "Testar Conexão do Ambiente"}</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Credenciais do Ambiente</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#0b0f19] border border-slate-800 rounded-2xl">
              <Server className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-slate-300 font-semibold">Nenhum ambiente selecionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Environment */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#090c14] border border-amber-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Adicionar Novo Ambiente N8N</h3>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNewEnv} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome do Ambiente</label>
                <input
                  type="text"
                  placeholder="ex: Cluster Disaster Recovery Luanda"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tag Badge</label>
                  <input
                    type="text"
                    placeholder="ex: DR, QA, CLOUD"
                    value={newEnvBadge}
                    onChange={(e) => setNewEnvBadge(e.target.value.toUpperCase().slice(0, 5))}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">URL do Cluster</label>
                  <input
                    type="url"
                    placeholder="https://n8n-dr.gagvisual.com"
                    value={newEnvUrl}
                    onChange={(e) => setNewEnvUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Chave de API (Opcional)</label>
                <input
                  type="password"
                  placeholder="n8n_api_..."
                  value={newEnvApiKey}
                  onChange={(e) => setNewEnvApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl"
                >
                  Registar Ambiente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
