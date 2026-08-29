import React, { useState } from "react";
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Bot,
  Play,
  RefreshCw,
  X,
  TrendingUp,
  Cpu,
  FileCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AgentAvatar } from "./AgentAvatar";
import { SynergyRun } from "../types";

interface GlobalSynergyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSynergyModal: React.FC<GlobalSynergyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    agents,
    tasks,
    executeGlobalSynergy,
    setActiveTab,
    playSfx,
  } = useApp();

  const [goal, setGoal] = useState(
    "Lançamento da Campanha de IA e Branding de Alto Impacto para Luanda e Lisboa (Q4 2026)"
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentRun, setCurrentRun] = useState<SynergyRun | null>(null);
  const [activePreset, setActivePreset] = useState<string>("campaign");

  if (!isOpen) return null;

  const presets = [
    {
      id: "campaign",
      title: "🚀 Campanha de Lançamento de IA",
      desc: "Orquestra Copywriter, Diretor de Arte Veo, Gestor de Tráfego e Brand Kits para lançamento em Luanda.",
      prompt: "Lançamento da Campanha de IA e Branding de Alto Impacto para Luanda e Lisboa (Q4 2026)",
    },
    {
      id: "automation",
      title: "⚡ Pipeline Kaza Core & CRM 24/7",
      desc: "Conecta Typeform, Supabase, Make e WhatsApp com triagem automática de leads qualificados.",
      prompt: "Estruturar e ativar pipeline automático Kaza Core conectando Typeform, Supabase e automação de triagem imediata",
    },
    {
      id: "b2b_finance",
      title: "💼 Diagnóstico B2B & Auditoria Fiscal",
      desc: "Aciona Consultor GAG, Scanner Financeiro e Auditoria AGT para grandes contas corporativas.",
      prompt: "Executar diagnóstico estratégico de mercado e auditoria financeira com enquadramento AGT e proposta comercial de alto valor",
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setActivePreset(p.id);
    setGoal(p.prompt);
    playSfx("click");
  };

  const handleStartSynergy = async () => {
    if (!goal.trim() || isExecuting) return;
    setIsExecuting(true);
    playSfx("execute");

    try {
      const run = await executeGlobalSynergy(goal);
      setCurrentRun(run);
    } catch (e) {
      console.error("Synergy run failed:", e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#090c15] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0d121f] via-[#141a29] to-[#1a1208] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/30">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Orquestrador de Sinergia Global (KIA Master & O Soba)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 animate-pulse">
                  13 AGENTES EM PARALELO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Decompõe objetivos estratégicos em ordens de trabalho executáveis diretamente no estado <span className="text-amber-400 font-semibold">Em Progresso</span>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              1. Escolhe um Cenário Estratégico ou Escreve o Teu Objetivo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presets.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10 text-white"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-300 mb-1">
                      {p.title}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Input Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Comando em Linguagem Natural para o KIA Master Router:
            </label>
            <div className="relative">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                placeholder="Descreve o objetivo que queres que a equipa de 13 agentes execute em paralelo..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500/60 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 leading-relaxed resize-none"
              />
              <div className="absolute right-3 bottom-3 flex items-center space-x-2 text-[10px] text-slate-500">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Auditoria Criptográfica SHA-256</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">
                  Zero Filas de Espera · Execução Paralela Instantânea
                </div>
                <div className="text-slate-400 text-[11px]">
                  As ordens entram automaticamente no quadro Kanban de cada agente especialista.
                </div>
              </div>
            </div>

            <button
              onClick={handleStartSynergy}
              disabled={isExecuting || !goal.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-black font-black text-xs flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50 shrink-0"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>A Orquestrar 13 Agentes...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>⚡ DISPARAR SINERGIA AGORA</span>
                </>
              )}
            </button>
          </div>

          {/* Results / Live Executions Display */}
          {currentRun && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Ordens Injetadas com Sucesso ({currentRun.agentExecutions?.length || 8} Agentes Ativos)
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab("tasks");
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <span>Ver no Kanban de Tarefas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentRun.agentExecutions?.map((exec, idx) => {
                  const agentInfo = agents.find((a) => a.id === exec.agentId);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start space-x-3">
                        {agentInfo ? (
                          <AgentAvatar
                            name={agentInfo.name}
                            avatarColor={agentInfo.avatarColor}
                            size="sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                            IA
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">
                            {exec.taskTitle}
                          </div>
                          <div className="text-[10px] text-amber-400 font-medium truncate">
                            {exec.agentName}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                          EM PROGRESSO
                        </span>
                      </div>

                      {exec.outputSnippet && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800/80 text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-2">
                          {exec.outputSnippet}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
