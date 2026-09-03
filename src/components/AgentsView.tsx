import React, { useState } from "react";
import {
  Users,
  Bot,
  Sparkles,
  Shield,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Play,
  Copy,
  Trash2,
  Edit,
  Activity,
  Layers,
  ChevronRight,
  Zap,
  Download,
  RotateCw,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Agent, AgentStatus } from "../types";
import { AgentAvatar, getAgentVisualMetadata } from "./AgentAvatar";
import { AgentEditModal } from "./AgentEditModal";
import { downloadAgentsCsv } from "../utils/agentsCsvExport";
import { useAgentHeartbeats } from "../hooks/useAgentHeartbeats";
import {
  AgentHeartbeatIndicator,
  AgentHeartbeatMonitorCard,
} from "./AgentHeartbeatIndicator";

export const AgentsView: React.FC = () => {
  const {
    agents,
    skills,
    updateAgent,
    updateAgentStatus,
    duplicateAgent,
    deleteAgent,
    setActiveTab,
    sendKiaMessage,
    setShowSynergyTour,
    triggerAgentSynergyExecution,
    playSfx,
  } = useApp();

  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0] || null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Live polling of endpoints for each agent
  const {
    heartbeats,
    isRefreshing,
    pollAllAgents,
    pollAgent,
    simulateAgentHeartbeat,
    autoRestartEnabled,
    setAutoRestartEnabled,
    restartAgent,
    recoveryLogs,
    summary,
  } = useAgentHeartbeats(agents);

  const handleExportAgentsCSV = () => {
    if (!agents || agents.length === 0) return;
    downloadAgentsCsv(agents, skills);
    playSfx?.("success");
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  const handleTestAgentInKia = (agent: Agent) => {
    setActiveTab("kia");
    sendKiaMessage(`Quero interagir com o agente "${agent.name}" (${agent.slug}). Qual é o teu plano operacional para o seu objetivo: "${agent.objective}"?`);
  };

  const handleSaveAgentEdit = (updatedAgent: Agent) => {
    updateAgent(updatedAgent.id, updatedAgent);
    setSelectedAgent(updatedAgent);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Agentes Operacionais</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {agents.length} Agentes Registados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ecossistema de inteligências especializadas da GAG Visual com objetivos, skills e permissões RBAC controladas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Heartbeat Polling Status Pill */}
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs shadow-inner">
            <div className="flex items-center space-x-1.5" title="Agentes com endpoint ativo e saudável (pulso verde)">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-emerald-400" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              </span>
              <span className="text-emerald-300 font-mono font-bold text-[11px]">
                {summary.active} Ativos
              </span>
            </div>

            {summary.high_latency > 0 && (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800" title="Agentes com alta latência > 250ms (pulso âmbar)">
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-amber-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                </span>
                <span className="text-amber-300 font-mono font-bold text-[11px]">
                  {summary.high_latency} Lentos
                </span>
              </div>
            )}

            {summary.failing > 0 && (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800" title="Agentes com falha no endpoint (pulso vermelho)">
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-rose-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </span>
                <span className="text-rose-300 font-mono font-bold text-[11px]">
                  {summary.failing} Falhas
                </span>
              </div>
            )}

            <button
              onClick={pollAllAgents}
              disabled={isRefreshing}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors disabled:opacity-50 ml-0.5"
              title="Sondar endpoints de todos os agentes agora"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>

          {/* Tour Button */}
          <button
            onClick={() => setShowSynergyTour(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            title="Explicação interativa da Sinergia e impacto operacional"
          >
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Tour de Sinergia</span>
          </button>

          {/* Trigger Synergy Button */}
          <button
            onClick={triggerAgentSynergyExecution}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            title="Ativar e delegar tarefas sinérgicas em tempo real a todos os 13 agentes da GAG Core"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Disparar Sinergia</span>
          </button>

          <button
            onClick={() => {
              agents.forEach((ag) => {
                if (ag.status !== "ACTIVE") {
                  updateAgentStatus(ag.id, "ACTIVE");
                }
              });
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            title="Ativar todos os agentes em simultâneo"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ativar Todos</span>
          </button>

          {/* Export CSV Button */}
          <button
            id="btn-export-agents-csv"
            onClick={handleExportAgentsCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 hover:border-blue-400"
            title="Descarregar ficheiro CSV com a lista completa de agentes e respetivos status"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">CSV Descarregado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-blue-400" />
                <span>Exportar CSV</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab("agent_factory")}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Agent Factory</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Agents Catalog vs Selected Agent Deep Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agents Cards (1 col) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Catálogo de Agentes
          </div>

          {agents.map((agent, idx) => {
            const isSelected = selectedAgent?.id === agent.id;
            const isKia = agent.id === "agent-kia";

            return (
              <div
                key={`agent-${agent.id}-${idx}`}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-md ${
                  isSelected
                    ? "bg-[#111726] border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-[#0b0f19] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <AgentAvatar
                      agentId={agent.id}
                      avatarColor={agent.avatarColor}
                      size="md"
                      showBadge={false}
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-xs font-bold text-white line-clamp-1">{agent.name}</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{agent.roleTitle}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        agent.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : agent.status === "DRAFT"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : agent.status === "REVIEW_REQUIRED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {agent.status}
                    </span>

                    {/* Heartbeat pulse indicator (Green: active, Amber: high latency, Red: failing) */}
                    <AgentHeartbeatIndicator
                      heartbeat={heartbeats[agent.id]}
                      variant="compact"
                      showLatency={true}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{agent.skills.length} Skills vinculadas</span>
                  <span className="font-mono text-amber-400/90">v{agent.version}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Agent Deep Inspection Profile (2 cols) */}
        <div className="lg:col-span-2 bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl">
          {selectedAgent ? (
            <div className="space-y-6">
              {/* Agent Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center space-x-4">
                  <AgentAvatar
                    agentId={selectedAgent.id}
                    avatarColor={selectedAgent.avatarColor}
                    size="xl"
                    showBadge={true}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-white">{selectedAgent.name}</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                        {selectedAgent.slug}
                      </span>
                      {/* Heartbeat status badge in profile header */}
                      <AgentHeartbeatIndicator
                        heartbeat={heartbeats[selectedAgent.id]}
                        variant="badge"
                      />
                    </div>
                    <p className="text-xs text-amber-300/90 font-semibold">{selectedAgent.roleTitle}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Versão: v{selectedAgent.version} • Criado em {new Date(selectedAgent.createdAt).toLocaleDateString("pt-PT")}</p>
                  </div>
                </div>

                {/* Status Switcher & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedAgent.status}
                    onChange={(e) => updateAgentStatus(selectedAgent.id, e.target.value as AgentStatus)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACTIVE">ACTIVE (Ativo)</option>
                    <option value="DRAFT">DRAFT (Rascunho)</option>
                    <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Revisão)</option>
                    <option value="ARCHIVED">ARCHIVED (Arquivado)</option>
                  </select>

                  <button
                    onClick={() => setEditingAgent(selectedAgent)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                    title="Editar características, skills, permissões e system prompt deste agente"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar Características</span>
                  </button>

                  <button
                    onClick={() => handleTestAgentInKia(selectedAgent)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-md hover:scale-105 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Testar na KIA</span>
                  </button>

                  <button
                    onClick={() => duplicateAgent(selectedAgent.id)}
                    className="p-2 bg-slate-900 border border-slate-800 hover:text-white text-slate-400 rounded-xl transition-colors"
                    title="Duplicar agente para novo laboratório"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {selectedAgent.id !== "agent-kia" && (
                    <button
                      onClick={() => deleteAgent(selectedAgent.id)}
                      className="p-2 bg-slate-900 border border-slate-800 hover:text-red-400 text-slate-400 rounded-xl transition-colors"
                      title="Eliminar agente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Endpoint Heartbeat Live Telemetry & Simulation Controls */}
              <AgentHeartbeatMonitorCard
                agentId={selectedAgent.id}
                agentName={selectedAgent.name}
                heartbeat={heartbeats[selectedAgent.id]}
                onRefresh={() => pollAgent(selectedAgent.id)}
                onSimulate={(mode) => simulateAgentHeartbeat(selectedAgent.id, mode)}
                onRestart={() => restartAgent(selectedAgent.id)}
                autoRestartEnabled={autoRestartEnabled}
                onToggleAutoRestart={setAutoRestartEnabled}
              />

              {/* Objective & Description */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Objetivo Estratégico & Missão
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedAgent.objective}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Descrição Operacional
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedAgent.description}
                  </p>
                </div>
              </div>

              {/* Skills Linked */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Skills Atribuídas ({selectedAgent.skills.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("skills")}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Ver Skills Registry
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedAgent.skills.map((skillId, idx) => {
                    const skill = skills.find((s) => s.id === skillId);
                    return (
                      <div
                        key={`agent-detail-skill-${skillId}-${idx}`}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate">{skill?.name || skillId}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {skill?.category || "Skill"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {skill?.description || "Skill operacional integrada."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Permissions & Capabilities Matrix */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Permissões RBAC & Capabilities
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.permissions.map((perm, idx) => (
                    <span
                      key={`agent-detail-perm-${perm}-${idx}`}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{perm}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* System Prompt Peek */}
              {selectedAgent.systemPrompt && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    System Prompt do Agente
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedAgent.systemPrompt}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Seleciona um agente à esquerda para inspecionar.
            </div>
          )}
        </div>
      </div>

      {/* Edit Agent Modal */}
      {editingAgent && (
        <AgentEditModal
          agent={editingAgent}
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={handleSaveAgentEdit}
          skills={skills}
        />
      )}
    </div>
  );
};
