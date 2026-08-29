import React from "react";
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  FileSearch,
  BookOpen,
  Shield,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Users,
  Activity,
  Mic,
  Cpu,
  Layers,
  ChevronRight,
  Film,
  Globe,
  Zap,
  TrendingUp,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Task, Agent, ScannedDocument } from "../types";
import { AgentAvatar } from "./AgentAvatar";

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    activeRole,
    agents,
    tasks,
    scannedDocs,
    knowledge,
    auditLogs,
    setActiveTab,
    systemSettings,
    setIsSynergyModalOpen,
    setIsScenarioModalOpen,
    setIsKazaModalOpen,
  } = useApp();

  const activeAgents = agents.filter((a) => a.status === "ACTIVE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "TODO");
  const criticalTasks = tasks.filter((t) => t.priority === "CRITICAL" || t.priority === "HIGH");
  const reviewDocs = scannedDocs.filter((d) => d.status === "REVIEW_REQUIRED");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1222] via-[#090d18] to-[#141008] border border-amber-500/25 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GAG Core OS • Sistema Operacional Inteligente</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.4.0</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Olá, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Núcleo operacional da GAG Visual ativo com o agente mestre{" "}
              <strong className="text-amber-400">KIA</strong> coordenando tarefas, análise documental, curadoria de conhecimento e execução de agentes.
            </p>
          </div>

          {/* Quick Action to talk with KIA, Video Studio, Search Grounding and Autonomy */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("kia")}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>KIA Chat & Voz</span>
            </button>

            <button
              onClick={() => setActiveTab("studio")}
              className="px-4 py-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>Gerador de Vídeo (Veo)</span>
            </button>

            <button
              onClick={() => setActiveTab("studio")}
              className="px-4 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Pesquisa Tempo Real</span>
            </button>

            <button
              onClick={() => setActiveTab("agent_factory")}
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Autonomia & Agentes</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Enterprise Executive Cockpit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Disparar Sinergia Global Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#0d101a] to-[#080a10] border border-amber-500/40 p-5 shadow-xl group hover:border-amber-500/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Multi-Agent Dispatcher
              </span>
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <h3 className="text-base font-extrabold text-white mt-3 flex items-center space-x-2">
              <span>⚡ Disparar Sinergia</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Aciona ordens de trabalho simultâneas para todos os 13 agentes de IA com alinhamento de normas e criação de tarefas.
            </p>
          </div>
          <button
            onClick={() => setIsSynergyModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Abrir Orquestrador Global</span>
          </button>
        </div>

        {/* 2. Scenario & Risk Simulator Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0d101a] to-[#080a10] border border-indigo-500/30 p-5 shadow-xl group hover:border-indigo-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Predictive AI
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-extrabold text-white mt-3">
              Simulador de ROAS & Risco
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Modelagem preditiva de tráfego, orçamentos e conversão para Luanda e mercados internacionais.
            </p>
          </div>
          <button
            onClick={() => setIsScenarioModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executar Simulação</span>
          </button>
        </div>

        {/* 3. Kaza Core Dispatcher Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0d101a] to-[#080a10] border border-cyan-500/30 p-5 shadow-xl group hover:border-cyan-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                24/7 Automation Pipeline
              </span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-base font-extrabold text-white mt-3">
              Kaza Webhook Dispatcher
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Triagem automática de pedidos de Typeform, HubSpot e Multicaixa Express direto para os agentes especialistas.
            </p>
          </div>
          <button
            onClick={() => setIsKazaModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Painel de Webhooks</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Agents */}
        <div
          onClick={() => setActiveTab("agents")}
          className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Agentes Ativos</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{activeAgents}</span>
            <span className="text-xs text-slate-500">/ {agents.length} configurados</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>KIA Master online</span>
          </div>
        </div>

        {/* KPI 2: Tasks in Progress */}
        <div
          onClick={() => setActiveTab("tasks")}
          className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tarefas Pendentes</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{inProgressTasks.length}</span>
            {criticalTasks.length > 0 && (
              <span className="text-xs text-rose-400 font-semibold">
                ({criticalTasks.length} urgentes)
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
            <span>{tasks.filter((t) => t.status === "DONE").length} concluídas</span>
          </div>
        </div>

        {/* KPI 3: Scanned Docs */}
        <div
          onClick={() => setActiveTab("scanner")}
          className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Documentos</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{scannedDocs.length}</span>
            <span className="text-xs text-slate-500">processados</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-300 flex items-center space-x-1">
            {reviewDocs.length > 0 ? (
              <>
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>{reviewDocs.length} requerem revisão</span>
              </>
            ) : (
              <span className="text-emerald-400">Todos atualizados</span>
            )}
          </div>
        </div>

        {/* KPI 4: Knowledge Items */}
        <div
          onClick={() => setActiveTab("knowledge")}
          className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Base de Conhecimento</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{knowledge.length}</span>
            <span className="text-xs text-slate-500">artigos ativos</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>GAG Visual Memory</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks & Documents (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks Card */}
          <div className="bg-[#090c14] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Tarefas Operacionais Prioritárias</h2>
              </div>
              <button
                onClick={() => setActiveTab("tasks")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
              >
                <span>Ver Todas ({tasks.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/60">
              {tasks.slice(0, 5).map((task, idx) => (
                <div
                  key={`dash-task-${task.id}-${idx}`}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-900/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        task.priority === "CRITICAL"
                          ? "bg-rose-500 animate-ping"
                          : task.priority === "HIGH"
                          ? "bg-amber-400"
                          : "bg-slate-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate">
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{task.category}</span>
                        {task.dueDate && (
                          <span className="flex items-center space-x-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString("pt-PT")}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      task.status === "DONE"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : task.status === "IN_PROGRESS"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Ingestion Stream */}
          <div className="bg-[#090c14] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileSearch className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Scanner & Ingestão Documental</h2>
              </div>
              <button
                onClick={() => setActiveTab("scanner")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
              >
                <span>Abrir Scanner</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {scannedDocs.slice(0, 3).map((doc, idx) => (
                <div
                  key={`dash-doc-${doc.id}-${idx}`}
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      DOC
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {doc.filename}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {doc.structuredData?.summary || "Documento estruturado e analisado"}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono shrink-0">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Agents Squad & Audit Trail (1 col on lg) */}
        <div className="space-y-6">
          {/* Active Agents Squad */}
          <div className="bg-[#090c14] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Equipa de Agentes IA</h2>
              </div>
              <button
                onClick={() => setActiveTab("agents")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Gerir
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {agents.map((agent, idx) => (
                <div
                  key={`dash-agent-${agent.id}-${idx}`}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <AgentAvatar
                      agentId={agent.id}
                      avatarColor={agent.avatarColor}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{agent.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{agent.roleTitle}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      agent.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Audit Trail Card */}
          <div className="bg-[#090c14] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Auditoria SHA-256</h2>
              </div>
              <button
                onClick={() => setActiveTab("audit")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Ver Trilha
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {auditLogs.slice(0, 4).map((log, idx) => (
                <div key={`dash-audit-${log.id}-${idx}`} className="text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                      {log.action}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400/80">
                      {(log.hash || "0x00").slice(0, 10)}...
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{log.userName || "Sistema"}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString("pt-PT")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
