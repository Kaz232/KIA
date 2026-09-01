import React, { useState, useEffect } from "react";
import {
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Send,
  Sliders,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Users,
  DollarSign,
  Share2,
  Layers,
  Code2,
  Sparkles,
  Info,
} from "lucide-react";
import { makeApi, MakeScenario, MakeLogEntry, MakeHealthResponse } from "../services/makeApi";
import { useApp } from "../context/AppContext";

export const MakeIntegrationView: React.FC = () => {
  const { playSfx } = useApp();
  const [activeTab, setActiveTab] = useState<"scenarios" | "dispatcher" | "inbound" | "logs" | "guide">("scenarios");
  const [health, setHealth] = useState<MakeHealthResponse | null>(null);
  const [scenarios, setScenarios] = useState<MakeScenario[]>([]);
  const [logs, setLogs] = useState<MakeLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scenario editing
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [webhookUrlInput, setWebhookUrlInput] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Dispatcher studio
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("make-whatsapp-24-7");
  const [customPayloadText, setCustomPayloadText] = useState<string>("");
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  // Inbound simulation
  const [inboundScenarioId, setInboundScenarioId] = useState<string>("make-whatsapp-24-7");
  const [inboundSenderPhone, setInboundSenderPhone] = useState("+244 923 884 190");
  const [inboundSenderName, setInboundSenderName] = useState("Dra. Paula Fernandes");
  const [inboundMessage, setInboundMessage] = useState("Olá! Gostaria de saber os preços da GAG Visual para gerir as redes sociais e anúncios da nossa clínica.");
  const [inboundResult, setInboundResult] = useState<any>(null);
  const [isInbounding, setIsInbounding] = useState(false);

  const inboundBaseUrl = typeof window !== "undefined" ? `${window.location.origin}/api/make/inbound` : "https://app.gagvisual.com/api/make/inbound";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [h, sList, lData] = await Promise.all([
        makeApi.getHealth().catch(() => null),
        makeApi.getScenarios().catch(() => []),
        makeApi.getLogs(40).catch(() => ({ success: true, totalLogs: 0, logs: [] })),
      ]);
      setHealth(h);
      setScenarios(sList);
      setLogs(lData.logs || []);

      if (sList.length > 0 && !customPayloadText) {
        const found = sList.find((s) => s.id === selectedScenarioId) || sList[0];
        setCustomPayloadText(JSON.stringify(found.samplePayload, null, 2));
      }
    } catch (e) {
      console.warn("Failed to load Make.com data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSfx("click");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveScenarioUrl = async (scenarioId: string) => {
    try {
      const res = await makeApi.updateScenario(scenarioId, webhookUrlInput);
      if (res.success) {
        setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? res.scenario : s)));
        setEditingScenarioId(null);
        setSaveSuccessMsg(`URL do webhook atualizada com sucesso!`);
        playSfx("success");
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(`Erro ao guardar: ${err.message}`);
    }
  };

  const handleSelectScenarioForDispatch = (id: string) => {
    setSelectedScenarioId(id);
    const scen = scenarios.find((s) => s.id === id);
    if (scen) {
      setCustomPayloadText(JSON.stringify(scen.samplePayload, null, 2));
    }
  };

  const handleExecuteDispatch = async () => {
    setIsDispatching(true);
    setDispatchResult(null);
    playSfx("action");

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(customPayloadText);
      } catch (e) {
        alert("O payload JSON é inválido. Corrija a formatação.");
        setIsDispatching(false);
        return;
      }

      const res = await makeApi.dispatchWebhook({
        scenarioId: selectedScenarioId,
        payload: parsedPayload,
        senderAgent: "agent-kia",
      });

      setDispatchResult(res);
      playSfx(res.success ? "success" : "warning");
      const lData = await makeApi.getLogs(40).catch(() => null);
      if (lData) setLogs(lData.logs || []);
    } catch (err: any) {
      setDispatchResult({ success: false, error: err.message });
      playSfx("warning");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSimulateInboundFromMake = async () => {
    setIsInbounding(true);
    setInboundResult(null);
    playSfx("action");

    try {
      const res = await fetch(`/api/make/inbound/${inboundScenarioId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "whatsapp_message_received",
          scenarioId: inboundScenarioId,
          senderNumber: inboundSenderPhone,
          senderName: inboundSenderName,
          message: inboundMessage,
          source: "Make.com Scenario Trigger",
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      setInboundResult(data);
      playSfx("success");
      const lData = await makeApi.getLogs(40).catch(() => null);
      if (lData) setLogs(lData.logs || []);
    } catch (err: any) {
      setInboundResult({ error: err.message });
      playSfx("warning");
    } finally {
      setIsInbounding(false);
    }
  };

  const handleClearLogs = async () => {
    if (confirm("Tem certeza que deseja limpar todos os registos do Make.com?")) {
      await makeApi.clearLogs();
      setLogs([]);
      playSfx("action");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-purple-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Make.com Automation Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero-API-Key Architecture
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Conexão universal via Webhooks com WhatsApp, CRMs, ERPs e redes sociais sem depender de chaves no código.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            <a
              href="https://www.make.com"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-purple-900/30 transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir Make.com
            </a>
          </div>
        </div>

        {/* Global Inbound Webhook URL Card */}
        <div className="max-w-7xl mx-auto mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                URL Inbound Webhook (Para configurar no Make.com):
              </div>
              <code className="text-xs text-amber-300 font-mono select-all">
                {inboundBaseUrl}
              </code>
            </div>
          </div>
          <button
            onClick={() => handleCopy(inboundBaseUrl, "inbound-url")}
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedId === "inbound-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === "inbound-url" ? "Copiado!" : "Copiar URL"}
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-5 border-b border-slate-800 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "scenarios"
                ? "border-amber-400 text-white bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            Cenários & Blueprints ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab("dispatcher")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "dispatcher"
                ? "border-amber-400 text-white bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Send className="w-4 h-4 text-purple-400" />
            Disparador de Webhooks (Outbound)
          </button>
          <button
            onClick={() => setActiveTab("inbound")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "inbound"
                ? "border-amber-400 text-white bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Simulador Inbound (WhatsApp & Leads)
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "logs"
                ? "border-amber-400 text-white bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            Logs de Execução ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "guide"
                ? "border-amber-400 text-white bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Info className="w-4 h-4 text-blue-400" />
            Como Funciona (Zero-Key)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-5 md:p-6 flex-1 w-full">
        {saveSuccessMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {saveSuccessMsg}
          </div>
        )}

        {/* TAB 1: SCENARIOS & BLUEPRINTS */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Cenários Integrados do Make.com
                </h2>
                <p className="text-xs text-slate-400">
                  Configure o Webhook URL de cada cenário criado no Make.com para conectar o GAG Core OS sem chaves de API.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scenarios.map((scenario) => {
                const isEditing = editingScenarioId === scenario.id;
                const hasUrl = !!scenario.defaultWebhookUrl;

                return (
                  <div
                    key={scenario.id}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl ${
                            scenario.category === "WHATSAPP"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : scenario.category === "CRM"
                              ? "bg-blue-500/10 text-blue-400"
                              : scenario.category === "FINANCE"
                              ? "bg-amber-500/10 text-amber-400"
                              : scenario.category === "MARKETING"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-slate-700 text-slate-300"
                          }`}>
                            {scenario.category === "WHATSAPP" && <Smartphone className="w-5 h-5" />}
                            {scenario.category === "CRM" && <Users className="w-5 h-5" />}
                            {scenario.category === "FINANCE" && <DollarSign className="w-5 h-5" />}
                            {scenario.category === "MARKETING" && <Share2 className="w-5 h-5" />}
                            {scenario.category === "CUSTOM" && <Code2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">{scenario.name}</h3>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                              Categoria: {scenario.category} • Tipo: {scenario.triggerType}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                          hasUrl
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${hasUrl ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                          {hasUrl ? "Conectado" : "Aguardando URL"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        {scenario.description}
                      </p>

                      {/* Blueprint Doc */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 mb-4 font-mono">
                        <span className="text-purple-400 font-semibold">Fluxo Make: </span>
                        {scenario.blueprintDoc}
                      </div>

                      {/* Webhook URL Configuration */}
                      <div className="space-y-2 mb-4">
                        <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                          <span>URL do Webhook (Make.com):</span>
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingScenarioId(scenario.id);
                                setWebhookUrlInput(scenario.defaultWebhookUrl || "");
                              }}
                              className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Sliders className="w-3 h-3" />
                              {hasUrl ? "Editar URL" : "Configurar URL"}
                            </button>
                          )}
                        </label>

                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="url"
                              value={webhookUrlInput}
                              onChange={(e) => setWebhookUrlInput(e.target.value)}
                              placeholder="https://hook.eu1.make.com/xxxxxxxxxxxxxxxx"
                              className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingScenarioId(null)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveScenarioUrl(scenario.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-950 font-semibold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Guardar URL
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                            <span className="text-xs font-mono truncate text-slate-300">
                              {scenario.defaultWebhookUrl || "Nenhuma URL configurada (utiliza simulação)"}
                            </span>
                            {scenario.defaultWebhookUrl && (
                              <button
                                onClick={() => handleCopy(scenario.defaultWebhookUrl!, `url-${scenario.id}`)}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Copiar URL"
                              >
                                {copiedId === `url-${scenario.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                      <button
                        onClick={() => {
                          handleSelectScenarioForDispatch(scenario.id);
                          setActiveTab("dispatcher");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Testar Disparo
                      </button>

                      <button
                        onClick={() => handleCopy(JSON.stringify(scenario.samplePayload, null, 2), `sample-${scenario.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === `sample-${scenario.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copiar Payload Exemplo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DISPATCHER STUDIO */}
        {activeTab === "dispatcher" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">Disparador de Webhooks Make.com</h2>
                <p className="text-xs text-slate-400">
                  Envie dados em tempo real para um cenário Make.com para testar a integração.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Selecione o Cenário Alvo:
                </label>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => handleSelectScenarioForDispatch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Payload JSON:
                  </label>
                  <button
                    onClick={() => {
                      const scen = scenarios.find((s) => s.id === selectedScenarioId);
                      if (scen) setCustomPayloadText(JSON.stringify(scen.samplePayload, null, 2));
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Restaurar Exemplo
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={customPayloadText}
                  onChange={(e) => setCustomPayloadText(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder="{ ... }"
                />
              </div>

              <button
                onClick={handleExecuteDispatch}
                disabled={isDispatching}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    A Disparar para Make.com...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Disparar Webhook para Make.com
                  </>
                )}
              </button>
            </div>

            {/* Result Panel */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Resposta do Disparo</h3>
              {dispatchResult ? (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      dispatchResult.success
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {dispatchResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {dispatchResult.success ? "200 OK — Disparado com Sucesso" : "Falha no Disparo"}
                    </span>
                    {dispatchResult.latencyMs && (
                      <span className="text-xs text-slate-400 font-mono">
                        Latência: {dispatchResult.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {dispatchResult.simulated && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      ℹ️ Modo Simulado Ativo: Nenhuma URL de Webhook real foi configurada. O payload foi validado e registado no histórico local.
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">
                      Resposta Bruta:
                    </span>
                    <pre className="p-3 bg-slate-950 rounded-xl text-xs text-slate-200 font-mono overflow-x-auto max-h-80">
                      {JSON.stringify(dispatchResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-72 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Zap className="w-10 h-10 mb-2 opacity-40 text-amber-400" />
                  <p className="text-xs">Nenhum disparo efetuado nesta sessão.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Selecione um cenário e clique em &quot;Disparar Webhook para Make.com&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INBOUND SIMULATOR */}
        {activeTab === "inbound" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">Simulador Inbound (Make.com &rarr; GAG OS)</h2>
                <p className="text-xs text-slate-400">
                  Simule o Make.com a enviar uma mensagem de WhatsApp ou novo lead para o GAG Core OS e veja a KIA responder autonomamente 24/7.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Número de WhatsApp do Remetente:
                </label>
                <input
                  type="text"
                  value={inboundSenderPhone}
                  onChange={(e) => setInboundSenderPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Nome do Cliente / Lead:
                </label>
                <input
                  type="text"
                  value={inboundSenderName}
                  onChange={(e) => setInboundSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Mensagem / Pergunta:
                </label>
                <textarea
                  rows={4}
                  value={inboundMessage}
                  onChange={(e) => setInboundMessage(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <button
                onClick={handleSimulateInboundFromMake}
                disabled={isInbounding}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                {isInbounding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    A Processar com KIA 24/7...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enviar Evento Inbound Make.com
                  </>
                )}
              </button>
            </div>

            {/* Inbound Reply Panel */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Resposta Autónoma da KIA 24/7</h3>
              {inboundResult ? (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Recebido e Processado pela KIA
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {inboundResult.latencyMs}ms
                    </span>
                  </div>

                  {inboundResult.aiReply && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-[11px] font-semibold uppercase text-emerald-400 block mb-1">
                        💬 Resposta Retornada ao Make.com para Envio WhatsApp:
                      </span>
                      <p className="text-xs text-emerald-100 leading-relaxed font-sans">
                        &quot;{inboundResult.aiReply}&quot;
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">
                      Payload de Retorno HTTP:
                    </span>
                    <pre className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(inboundResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-72 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Smartphone className="w-10 h-10 mb-2 opacity-40 text-emerald-400" />
                  <p className="text-xs">Nenhum evento inbound testado ainda.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Insira uma mensagem de teste e clique no botão para simular a resposta imediata da KIA.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EXECUTION LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Histórico de Webhooks Make.com</h2>
                <p className="text-xs text-slate-400">
                  Monitorização em tempo real de todas as chamadas inbound e outbound.
                </p>
              </div>

              {logs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar Logs
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="h-64 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Clock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Nenhum registo de webhook recente.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-1.5 rounded-lg ${
                        log.direction === "OUTBOUND"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {log.direction === "OUTBOUND" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{log.scenarioName}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            log.status === "SUCCESS" || log.status === "PROCESSED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()} • Latência: {log.latencyMs}ms
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleCopy(JSON.stringify(log.payload, null, 2), `log-${log.id}`)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                      >
                        {copiedId === `log-${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Payload
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ARCHITECTURE GUIDE */}
        {activeTab === "guide" && (
          <div className="max-w-4xl space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Por que o Make.com elimina a necessidade de chaves de API?
              </h2>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                No modelo tradicional, cada serviço (WhatsApp Meta, Google Sheets, HubSpot, PHC/Primavera, Instagram) exige criar contas de programador, obter Tokens Bearer de longa duração, gerir expirações e configurar credenciais sensíveis dentro do código.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    ❌ Modelo com Chaves de API
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>Risco de vazamento de credenciais</li>
                    <li>Tokens de acesso expiram constantemente</li>
                    <li>Configurações complexas de OAuth no código</li>
                    <li>Bloqueios de conta por requisições diretas</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    ✅ Modelo Zero-API-Key com Make.com
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>O Make.com guarda as autenticações de forma segura</li>
                    <li>O GAG Core OS apenas dispara ou recebe Webhooks simples</li>
                    <li>Qualquer alteração de ferramenta é feita no Make visualmente</li>
                    <li>Compatível com Z-API, Evolution API, Typeform, Stripe e ERPs</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 mt-4">
                <h4 className="text-xs font-semibold text-purple-300">
                  Como ligar o WhatsApp em 3 passos no Make.com:
                </h4>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>No Make.com, crie um cenário novo e adicione o módulo <strong>Custom Webhook</strong>.</li>
                  <li>Copie a URL gerada pelo Make e cole no cenário <strong>WhatsApp 24/7</strong> aqui no GAG Core OS.</li>
                  <li>No Make, conecte a saída do Webhook ao seu provedor WhatsApp (Z-API, Evolution, Meta ou Twilio) e adicione o módulo <strong>HTTP Request</strong> apontando para o nosso Inbound Webhook para receber as respostas da KIA.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
