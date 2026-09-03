import React, { useState, useEffect } from "react";
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  Sparkles,
  Shield,
  Gauge,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Terminal,
  ExternalLink,
  Code,
  FileText,
  Copy,
  Plus,
  Play,
  Send,
  Download,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Zap,
} from "lucide-react";
import {
  browserApi,
  BrowserNavigationResult,
  BrowserAuditResult,
  BrowserTestReport,
  BrowserScrapeResult,
  BrowserAgentActionResult,
  BrowserPreset,
} from "../services/browserApi";
import { useApp } from "../context/AppContext";

export const BrowserHarnessView: React.FC = () => {
  const { createTask, playSfx } = useApp();

  // Address and Navigation State
  const [urlInput, setUrlInput] = useState("https://gagvisual.com");
  const [activeUrl, setActiveUrl] = useState("https://gagvisual.com");
  const [isLoading, setIsLoading] = useState(false);
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"render" | "agent" | "scrape" | "audit" | "tests" | "network">("render");

  // Data States
  const [navResult, setNavResult] = useState<BrowserNavigationResult | null>(null);
  const [auditResult, setAuditResult] = useState<BrowserAuditResult | null>(null);
  const [testReport, setTestReport] = useState<BrowserTestReport | null>(null);
  const [scrapeResult, setScrapeResult] = useState<BrowserScrapeResult | null>(null);
  const [agentResult, setAgentResult] = useState<BrowserAgentActionResult | null>(null);
  const [presets, setPresets] = useState<BrowserPreset[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Agent Goal State
  const [agentGoal, setAgentGoal] = useState("Analisar os serviços de branding e marketing digital, contactos e verificar links de conversão.");
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Scraper Schema State
  const [scrapeSchema, setScrapeSchema] = useState<string>("GENERAL_INTELLIGENCE");
  const [customScrapePrompt, setCustomScrapePrompt] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  // Audit State
  const [isAuditing, setIsAuditing] = useState(false);

  // Testing State
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Feedback State
  const [copied, setCopied] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load Presets and initial navigation
  useEffect(() => {
    browserApi.getPresets().then(setPresets);
    handleNavigate("https://gagvisual.com");
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    browserApi.getHistory().then(setHistory);
  };

  const handleNavigate = async (targetUrl?: string) => {
    const destination = targetUrl || urlInput;
    if (!destination) return;
    setIsLoading(true);
    playSfx?.("click");
    try {
      const res = await browserApi.navigate(destination);
      setNavResult(res);
      setActiveUrl(res.url);
      setUrlInput(res.url);
      refreshHistory();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!activeUrl) return;
    setIsAuditing(true);
    playSfx?.("action");
    try {
      const res = await browserApi.audit(activeUrl);
      setAuditResult(res);
      refreshHistory();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunTests = async () => {
    if (!activeUrl) return;
    setIsRunningTests(true);
    playSfx?.("action");
    try {
      const res = await browserApi.runTestSuite(activeUrl);
      setTestReport(res);
      refreshHistory();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRunScraper = async () => {
    if (!activeUrl && !navResult?.extractedText) return;
    setIsScraping(true);
    playSfx?.("action");
    try {
      const res = await browserApi.scrape({
        url: activeUrl,
        schemaType: scrapeSchema,
        customPrompt: customScrapePrompt,
        extractedText: navResult?.extractedText,
      });
      setScrapeResult(res);
      refreshHistory();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  const handleRunAgentAction = async () => {
    if (!activeUrl || !agentGoal.trim()) return;
    setIsAgentRunning(true);
    playSfx?.("action");
    try {
      const res = await browserApi.executeAgentAction({
        url: activeUrl,
        userGoal: agentGoal,
        agentName: "Agent KIA (Browser Harness)",
      });
      setAgentResult(res);
      refreshHistory();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const createFollowUpTask = (title: string, desc: string) => {
    createTask({
      title: `[Browser Harness] ${title}`,
      description: `${desc}\n\nOrigem: ${activeUrl}\nData: ${new Date().toLocaleString("pt-PT")}`,
      assignedAgentId: "agent-programmer",
      priority: "MEDIUM",
      status: "TODO",
      category: "DEV",
      tags: ["browser", "harness"],
    });
    setActionSuccessMsg("Tarefa de acompanhamento criada com sucesso!");
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] text-slate-100 overflow-hidden select-none">
      {/* Top Header & Harness Controls */}
      <div className="border-b border-slate-800/80 bg-[#0e1422] p-3 px-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Globe className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">Browser Harness Studio</h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  AUTONOMOUS V2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Ambiente de Execução Headless, Web Scraping com IA & Auditorias E2E</p>
            </div>
          </div>

          {/* Quick Metrics / Latency */}
          {navResult && (
            <div className="hidden lg:flex items-center gap-4 text-xs bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Latência:</span>
                <span className="font-mono text-cyan-300 font-bold">{navResult.latencyMs}ms</span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tamanho:</span>
                <span className="font-mono text-indigo-300 font-bold">{Math.round(navResult.contentLength / 1024)} KB</span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    navResult.status >= 200 && navResult.status < 300 ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span className="font-mono text-emerald-400 font-bold">{navResult.status} {navResult.statusText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Address Bar & Viewport Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => handleNavigate()}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigate()}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Avançar"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigate()}
              disabled={isLoading}
              className={`p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors ${
                isLoading ? "animate-spin text-cyan-400" : ""
              }`}
              title="Recarregar"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Real Address Bar Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNavigate();
            }}
            className="flex-1 flex items-center bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-500 rounded-xl px-3 py-1.5 transition-all shadow-inner"
          >
            <Shield className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Digite a URL de destino (ex: https://governo.gov.ao ou gagvisual.com)..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="ml-2 px-3 py-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              {isLoading ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Navegar</span>
            </button>
          </form>

          {/* Viewport Width Controls */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                viewportMode === "desktop" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Desktop (100%)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode("tablet")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                viewportMode === "tablet" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Tablet (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                viewportMode === "mobile" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Mobile (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-400 text-xs font-semibold shrink-0">Alvos Rápidos:</span>
          {presets.map((p) => (
            <button
              key={p.url}
              onClick={() => {
                setUrlInput(p.url);
                handleNavigate(p.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all shrink-0 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-600/90 text-white text-xs px-4 py-2 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Main Studio Workspace with Subtabs */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0a0d14] px-4 pt-2">
          <button
            onClick={() => setActiveTab("render")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "render"
                ? "bg-[#0E131F] text-cyan-300 border-cyan-500/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Render & DOM Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab("agent")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "agent"
                ? "bg-[#0E131F] text-indigo-300 border-indigo-500/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agente Autónomo</span>
            {agentResult && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
          </button>

          <button
            onClick={() => setActiveTab("scrape")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "scrape"
                ? "bg-[#0E131F] text-emerald-300 border-emerald-500/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Extrator JSON (IA)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("audit");
              if (!auditResult) handleRunAudit();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "audit"
                ? "bg-[#0E131F] text-amber-300 border-amber-500/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Auditoria 360°</span>
            {auditResult && (
              <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 rounded-full font-mono">
                {auditResult.overallScore}/100
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("tests");
              if (!testReport) handleRunTests();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "tests"
                ? "bg-[#0E131F] text-purple-300 border-purple-500/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>Testes E2E Sintéticos</span>
            {testReport && (
              <span className="px-1.5 py-0.2 text-[9px] bg-purple-500/20 text-purple-300 rounded-full font-mono">
                {testReport.passedCount}/{testReport.totalTests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("network")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "network"
                ? "bg-[#0E131F] text-slate-200 border-slate-600"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Network & DOM</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-auto bg-[#0E131F] p-4">
          {/* TAB 1: RENDER & DOM SANDBOX */}
          {activeTab === "render" && (
            <div className="h-full flex flex-col items-center justify-start">
              <div
                className={`h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all ${
                  viewportMode === "desktop"
                    ? "w-full"
                    : viewportMode === "tablet"
                    ? "w-[768px] max-w-full"
                    : "w-[375px] max-w-full"
                }`}
              >
                {/* Browser Frame Header */}
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-[11px] text-slate-300 truncate max-w-md">
                      {navResult?.title || activeUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir Nova Aba</span>
                    </a>
                  </div>
                </div>

                {/* Sandboxed Iframe or Render Fallback */}
                <div className="flex-1 relative bg-white overflow-hidden">
                  <iframe
                    src={activeUrl}
                    title="Live Web Sandbox"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTONOMOUS AGENT STUDIO */}
          {activeTab === "agent" && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-indigo-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/40">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Agente Autónomo de Navegação</h2>
                      <p className="text-xs text-slate-400">
                        O agente inspeciona a página atual, executa raciocínio de inteligência de mercado e propõe ações no GAG OS.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Goal Input */}
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-semibold text-indigo-300">
                    Objetivo / Prompt do Agente para esta página:
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={3}
                      value={agentGoal}
                      onChange={(e) => setAgentGoal(e.target.value)}
                      placeholder="Ex: Identificar quem são os decisores, números de WhatsApp, preços praticados e listar 3 oportunidades de melhoria comercial."
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Alvo Atual:</span>
                    <span className="font-mono text-cyan-300 font-semibold">{activeUrl}</span>
                  </div>

                  <button
                    onClick={handleRunAgentAction}
                    disabled={isAgentRunning}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    {isAgentRunning ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Agente a Inspecionar Página...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Executar Missão do Agente</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Agent Analysis Report */}
              {agentResult && (
                <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Relatório de Inteligência do Agente</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Executado em {agentResult.latencyMs}ms</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                    {agentResult.agentAnalysis}
                  </div>

                  {/* Proposed Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-xs font-bold text-slate-300">Ações Rápidas Disponíveis:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          createFollowUpTask(
                            `Acompanhamento: ${agentResult.pageTitle || agentResult.url}`,
                            agentResult.agentAnalysis.slice(0, 300)
                          )
                        }
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Criar Tarefa no GAG OS</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(agentResult.agentAnalysis, "report")}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
                      >
                        {copied === "report" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar Análise</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STRUCTURED AI SCRAPER */}
          {activeTab === "scrape" && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600/20 rounded-xl border border-emerald-500/40">
                      <Code className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Extrator Estruturado com Inteligência Artificial</h2>
                      <p className="text-xs text-slate-400">
                        Transforma páginas web não estruturadas em JSON estrito com suporte a modelos de negócio angolanos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schema Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => setScrapeSchema("GENERAL_INTELLIGENCE")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scrapeSchema === "GENERAL_INTELLIGENCE"
                        ? "bg-emerald-950/40 border-emerald-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Inteligência Geral</div>
                    <div className="text-[10px] text-slate-500">Contactos, Proposta de Valor e Resumo</div>
                  </button>

                  <button
                    onClick={() => setScrapeSchema("PRODUCTS_PRICING_AOA")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scrapeSchema === "PRODUCTS_PRICING_AOA"
                        ? "bg-emerald-950/40 border-emerald-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Produtos & Preços (AOA)</div>
                    <div className="text-[10px] text-slate-500">Tabelas de preços, pacotes e valores em Kwanzas</div>
                  </button>

                  <button
                    onClick={() => setScrapeSchema("LEADS_CONTACTS")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scrapeSchema === "LEADS_CONTACTS"
                        ? "bg-emerald-950/40 border-emerald-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Leads & Contactos</div>
                    <div className="text-[10px] text-slate-500">Emails, WhatsApps, Telefones e Morada em Angola</div>
                  </button>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-semibold text-emerald-300">
                    Instruções Adicionais de Extração (Opcional):
                  </label>
                  <input
                    type="text"
                    value={customScrapePrompt}
                    onChange={(e) => setCustomScrapePrompt(e.target.value)}
                    placeholder="Ex: Focar apenas em serviços de design e identificar se há formulário de orçamento..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunScraper}
                    disabled={isScraping}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {isScraping ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>A extrair dados com Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Executar Raspagem com IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scrape Result Viewer */}
              {scrapeResult && (
                <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">JSON Estruturado Extraído</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(scrapeResult.data, null, 2), "json")}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copied === "json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar JSON</span>
                    </button>
                  </div>

                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-auto max-h-96 leading-relaxed">
                    {JSON.stringify(scrapeResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT 360° */}
          {activeTab === "audit" && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">Auditoria 360° de Página Web</h2>
                  <p className="text-xs text-slate-400">Verificação automática de SEO, Cabeçalhos de Segurança, TTFB e Acessibilidade.</p>
                </div>
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  {isAuditing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  <span>{isAuditing ? "A Auditar..." : "Reexecutar Auditoria"}</span>
                </button>
              </div>

              {auditResult && (
                <div className="flex flex-col gap-6">
                  {/* Score Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-extrabold text-cyan-400 font-mono mb-1">
                        {auditResult.scores.seo}
                      </div>
                      <div className="text-xs font-bold text-slate-300">SEO & Meta-tags</div>
                      <div className="text-[10px] text-slate-500">Indexação e Descoberta</div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-extrabold text-emerald-400 font-mono mb-1">
                        {auditResult.scores.security}
                      </div>
                      <div className="text-xs font-bold text-slate-300">Segurança Web</div>
                      <div className="text-[10px] text-slate-500">HTTPS, HSTS, CSP, X-Frame</div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-extrabold text-amber-400 font-mono mb-1">
                        {auditResult.scores.performance}
                      </div>
                      <div className="text-xs font-bold text-slate-300">Performance</div>
                      <div className="text-[10px] text-slate-500">Latência & Peso Payload</div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-extrabold text-purple-400 font-mono mb-1">
                        {auditResult.scores.accessibility}
                      </div>
                      <div className="text-xs font-bold text-slate-300">Acessibilidade</div>
                      <div className="text-[10px] text-slate-500">Viewport & Alt Tags</div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Recomendações e Melhorias Identificadas ({auditResult.recommendations.length})</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {auditResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SYNTHETIC E2E TEST RUNNER */}
          {activeTab === "tests" && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">Executor de Testes Sintéticos E2E</h2>
                  <p className="text-xs text-slate-400">Validação de integridade, status codes, latência e asserções web.</p>
                </div>
                <button
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                >
                  {isRunningTests ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{isRunningTests ? "A Executar Suite..." : "Rodar Suite de Testes"}</span>
                </button>
              </div>

              {testReport && (
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      {testReport.allPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span className="text-sm font-bold text-white">
                        Resultado: {testReport.passedCount} de {testReport.totalTests} testes passaram
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Tempo total: {testReport.latencyMs}ms</span>
                  </div>

                  {/* Test Cases Table */}
                  <div className="flex flex-col gap-2">
                    {testReport.results.map((tc) => (
                      <div
                        key={tc.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                          tc.passed
                            ? "bg-emerald-950/20 border-emerald-500/30 text-slate-200"
                            : "bg-rose-950/20 border-rose-500/30 text-rose-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {tc.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-semibold">{tc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Valor obtido:</span>
                          <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300">
                            {String(tc.actual)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NETWORK & DOM DETAILS */}
          {activeTab === "network" && navResult && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              {/* Response Headers */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Cabeçalhos HTTP da Resposta</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(navResult.headers, null, 2), "headers")}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
                  >
                    {copied === "headers" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-auto">
                  {Object.entries(navResult.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-cyan-400 font-semibold">{k}:</span>
                      <span className="text-slate-300 truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Links */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                  <span>Links e Âncoras Identificados ({navResult.links.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-auto">
                  {navResult.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="truncate text-slate-300 mr-2">{link.text || link.href}</span>
                      <button
                        onClick={() => {
                          setUrlInput(link.href);
                          handleNavigate(link.href);
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 rounded text-[10px] shrink-0"
                      >
                        Navegar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
