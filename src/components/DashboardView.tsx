import React, { useState, useEffect } from "react";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useApp } from "../context/AppContext";
import { Task, Agent, ScannedDocument } from "../types";
import { AgentAvatar } from "./AgentAvatar";
import { subscribeToMetrics } from "../utils/audio";
import { KiaTamagotchiCompanion } from "./KiaTamagotchiCompanion";
import { KiaFace } from "./KiaFace";
import { DocumentScannerWidget } from "./DocumentScannerWidget";
import { SystemHealthWidget } from "./SystemHealthWidget";

const TASK_STATUS_COLORS = {
  TODO: "#64748b",
  IN_PROGRESS: "#f59e0b",
  DONE: "#10b981",
  BLOCKED: "#ef4444",
};

const VoiceMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState({ rms: 0, isSpeaking: false, wsStatus: 'DISCONNECTED' });
    useEffect(() => {
        return subscribeToMetrics(setMetrics);
    }, []);

    return (
        <div className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Estado de Voz</span>
                <Mic className={`w-4 h-4 ${metrics.isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
            </div>
            <div className="text-[10px] text-white font-mono mb-2">{metrics.wsStatus}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-75" style={{ width: `${Math.min(metrics.rms * 1000, 100)}%` }} />
            </div>
        </div>
    );
};

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

  const taskStatusDistribution = React.useMemo(() => {
    const dist: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0, BLOCKED: 0 };
    tasks.forEach((t) => {
      if (dist.hasOwnProperty(t.status)) {
        dist[t.status]++;
      }
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Rosto Tamagotchi do KIA no Topo do Dashboard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c101d] via-[#10172b] to-[#0a0d18] border-2 border-amber-500/35 p-4 sm:p-6 shadow-2xl shadow-amber-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <KiaFace
              state="idle"
              size="lg"
              interactive={true}
              onClick={() => setActiveTab("kia")}
              showStatusText={false}
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xl font-extrabold text-white tracking-wide">KIA</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/40">
                  ✨ Co-piloto Executiva • GAG Visual
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed pt-0.5">
                Olá, {currentUser.name}! Núcleo neural ativo em Luanda. Clica no meu rosto para conversar, orquestrar os agentes especialistas e gerar propostas comerciais.
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start space-x-2 text-[11px] text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">Estado: Operacional &bull; Rosto Tamagotchi Sintonizado</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("kia")}
            className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Falar com a KIA</span>
          </button>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1222] via-[#090d18] to-[#141008] border border-amber-500/25 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GAG Core OS • Sistema Operacional Inteligente</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.4.0</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Visão Geral Executiva
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Painel central de coordenação da GAG Visual em Luanda. Monitorização contínua de tarefas, métricas de desempenho de agentes especialistas e integridade do ecossistema corporativo.
            </p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-auto">
        <VoiceMonitor />
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
        </div>

        {/* KPI 2: Tasks in Progress */}
        <div
          onClick={() => setActiveTab("tasks")}
          className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tarefas Operacionais</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{inProgressTasks.length}</span>
            <span className="text-xs text-slate-500">em execução</span>
          </div>
        </div>

        {/* KPI 3: Knowledge Items */}
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
            <span className="text-xs text-slate-500">manuais e normas</span>
          </div>
        </div>
      </div>

      {/* System Health & Real-Time Gemini Latency Monitor */}
      <SystemHealthWidget />

      <div className="mt-6">
        <DocumentScannerWidget />
      </div>

      {/* Pipeline de Leads Growth (30 dias) */}
      <div className="bg-[#090c14] border border-slate-800 rounded-2xl p-6 shadow-xl h-[350px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Pipeline de Leads (Últimos 30 dias)</span>
          </h2>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            leads: Math.floor(Math.random() * 50) + 10 + i * 2,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#475569" fontSize={10} />
            <YAxis stroke="#475569" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
              itemStyle={{ color: "#e2e8f0", fontSize: "12px" }}
            />
            <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task Distribution Pie Chart */}
      <div className="bg-[#090c14] border border-slate-800 rounded-2xl p-6 shadow-xl h-[350px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Distribuição de Tarefas</span>
          </h2>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={taskStatusDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {taskStatusDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TASK_STATUS_COLORS[entry.name as keyof typeof TASK_STATUS_COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
              itemStyle={{ color: "#e2e8f0", fontSize: "12px" }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks (2 cols on lg) */}
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
              {tasks.slice(0, 8).map((task, idx) => (
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
