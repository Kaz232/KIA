import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Play,
  CheckCircle2,
  Cpu,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  X,
  FileCheck,
  Clock,
  Send,
  Award,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Task } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNotice: (msg: string) => void;
}

export const AgentAutonomyControlModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccessNotice,
}) => {
  const {
    tasks,
    agents,
    executeBatchTasks,
    executeTaskWithAgent,
    recordAuditLog,
    openDocumentExportModal,
  } = useApp();

  const [autonomyLevel, setAutonomyLevel] = useState<2 | 1 | 0>(2);
  const [isExecutingTeam, setIsExecutingTeam] = useState(false);
  const [completedTasksCount, setCompletedTasksCount] = useState<number | null>(null);
  const [selectedTaskDeliverable, setSelectedTaskDeliverable] = useState<Task | null>(null);
  const [teamLog, setTeamLog] = useState<string[]>([]);

  if (!isOpen) return null;

  const pendingTasks = tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  const handleRunAutonomousTeam = async () => {
    if (pendingTasks.length === 0) {
      onSuccessNotice("Todas as tarefas da equipa já estão concluídas!");
      return;
    }

    setIsExecutingTeam(true);
    setTeamLog([
      `[${new Date().toLocaleTimeString()}] 🚀 Equipa Autónoma ativada por Josemar Gourgel com Nível ${autonomyLevel}.`,
      `[${new Date().toLocaleTimeString()}] 📋 ${pendingTasks.length} tarefas identificadas no backlog para execução independente.`,
    ]);

    let executed = 0;
    for (const task of pendingTasks) {
      const assigned = agents.find((a) => a.id === task.assignedAgentId) || agents[0];
      setTeamLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚙️ ${assigned.name} assumiu a tarefa: "${task.title}".`,
      ]);

      await executeTaskWithAgent(task.id, task.assignedAgentId);
      executed++;

      setTeamLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ ${assigned.name} concluiu "${task.title}". Entregável arquivado.`,
      ]);
    }

    setTeamLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🏆 Execução concluída com sucesso! ${executed} entregáveis operacionais prontos.`,
    ]);

    setCompletedTasksCount(executed);
    setIsExecutingTeam(false);

    recordAuditLog(
      `Execução Autónoma da Equipa Concluída (${executed} tarefas)`,
      "system",
      "SUCCESS",
      `A equipa de agentes executou ${executed} tarefas com total autonomia e gerou os respectivos entregáveis.`
    );

    onSuccessNotice(`Equipa concluiu ${executed} tarefa(s) com autonomia total!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#080b12] border border-amber-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#120e06] via-[#1a1408] to-[#120e06] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Autoridade & Autonomia da Equipa GAG
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Operação sem Fricção
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Liberta os agentes de decisões rotineiras. Dê autoridade para executar tarefas e apresentar resultados prontos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Autonomy Level Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Nível de Autoridade Delegada aos Agentes
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Level 2 - Total Autonomy */}
              <div
                onClick={() => setAutonomyLevel(2)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  autonomyLevel === 2
                    ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : "bg-[#0a0f1d] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    NÍVEL 2 • RECOMENDADO
                  </span>
                  <Zap className={`w-4 h-4 ${autonomyLevel === 2 ? "text-amber-400" : "text-slate-500"}`} />
                </div>
                <h4 className="text-sm font-bold text-white">Autonomia Total (Equipa Real)</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Os agentes tomam decisões operacionais sem supervisão, executam tarefas do backlog, criam entregáveis e apresentam resultados acabados.
                </p>
              </div>

              {/* Level 1 - Assisted Autonomy */}
              <div
                onClick={() => setAutonomyLevel(1)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  autonomyLevel === 1
                    ? "bg-blue-500/15 border-blue-500/60 shadow-lg shadow-blue-500/10"
                    : "bg-[#0a0f1d] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                    NÍVEL 1
                  </span>
                  <Cpu className={`w-4 h-4 ${autonomyLevel === 1 ? "text-blue-400" : "text-slate-500"}`} />
                </div>
                <h4 className="text-sm font-bold text-white">Supervisão Assistida</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Agentes preparam diagnósticos e entregáveis em rascunho, mas solicitam 1 clique de aprovação antes de qualquer ação externa.
                </p>
              </div>

              {/* Level 0 - Step by Step */}
              <div
                onClick={() => setAutonomyLevel(0)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  autonomyLevel === 0
                    ? "bg-slate-800 border-slate-600"
                    : "bg-[#0a0f1d] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    NÍVEL 0
                  </span>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-white">Supervisão Manual Contínua</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Cada passo é pausado e requer autorização individual antes de ser processado pela equipa.
                </p>
              </div>
            </div>
          </div>

          {/* Autonomous Execution Trigger Box */}
          <div className="p-5 rounded-2xl bg-[#0a0e19] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Execução de Tarefas em Backlog pela Equipa
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Atualmente existem <strong className="text-amber-300">{pendingTasks.length}</strong> tarefas pendentes e <strong className="text-emerald-400">{doneTasks.length}</strong> concluídas.
              </p>
            </div>

            <button
              onClick={handleRunAutonomousTeam}
              disabled={isExecutingTeam || pendingTasks.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-black font-black text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
            >
              {isExecutingTeam ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Equipa a Trabalhar...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>⚡ Auto-Executar Backlog Agora</span>
                </>
              )}
            </button>
          </div>

          {/* Live Execution Terminal Log */}
          {teamLog.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Diário de Execução da Equipa em Tempo Real</span>
              </div>
              <div className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto space-y-1">
                {teamLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Showcase / Results of the Team */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Entregáveis Gerados pela Equipa ({doneTasks.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-500">Resultados Prontos</span>
            </div>

            {doneTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 text-center text-xs text-slate-500">
                Nenhum entregável arquivado ainda. Clique em "Auto-Executar Backlog Agora" para a equipa começar!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {doneTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskDeliverable(task)}
                    className="p-3.5 rounded-xl bg-[#0a0f1d] border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          CONCLUÍDO
                        </span>
                        <span className="text-slate-500">
                          {task.executedAt ? new Date(task.executedAt).toLocaleTimeString("pt-PT") : "Recente"}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white group-hover:text-amber-300 line-clamp-1">
                        {task.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {task.executionOutput || task.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Ver Entregável Completo &rarr;</span>
                      <Eye className="w-3 h-3 text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-[#07090f] flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Governança delegada por <strong>Josemar Gourgel (Director Geral)</strong>
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Fechar Painel
          </button>
        </div>
      </div>

      {/* Selected Deliverable Modal */}
      {selectedTaskDeliverable && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-amber-500/50 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  ENTREGÁVEL EXECUTIVO
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedTaskDeliverable.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskDeliverable(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 mt-3">
              {selectedTaskDeliverable.executionOutput || selectedTaskDeliverable.description}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTaskDeliverable(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
