import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Sparkles,
  Zap,
  RefreshCw,
  FileCode,
  FileText,
  Copy,
  Check,
  Bot,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Task, TaskPriority, TaskStatus } from "../types";
import { AgentAvatar } from "./AgentAvatar";
import { playSfx } from "../utils/audio";

export const TasksView: React.FC = () => {
  const {
    tasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    executeTaskWithAgent,
    executeBatchTasks,
    orchestratePlanWithKIA,
    isExecutingTask,
    agents,
    currentUser,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrchestrateModalOpen, setIsOrchestrateModalOpen] = useState(false);
  const [orchestrationGoal, setOrchestrationGoal] = useState("");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingDeliverableTask, setViewingDeliverableTask] = useState<Task | null>(null);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    assignedAgentId: string;
    category: string;
    tags: string;
  }>({
    title: "",
    description: "",
    priority: "HIGH",
    status: "TODO",
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    assignedAgentId: "agent-kia",
    category: "Operações",
    tags: "GAG, Prioridade",
  });

  const statuses: { id: TaskStatus | "ALL"; label: string }[] = [
    { id: "ALL", label: "Todos os Estados" },
    { id: "TODO", label: "A Fazer (TODO)" },
    { id: "IN_PROGRESS", label: "Em Progresso (IN_PROGRESS)" },
    { id: "REVIEW", label: "Em Revisão (REVIEW)" },
    { id: "DONE", label: "Concluído (DONE)" },
    { id: "BLOCKED", label: "Bloqueado (BLOCKED)" },
  ];

  const priorities: { id: TaskPriority | "ALL"; label: string }[] = [
    { id: "ALL", label: "Todas as Prioridades" },
    { id: "CRITICAL", label: "Crítica (CRITICAL)" },
    { id: "HIGH", label: "Alta (HIGH)" },
    { id: "MEDIUM", label: "Média (MEDIUM)" },
    { id: "LOW", label: "Baixa (LOW)" },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || t.status === selectedStatus;
    const matchesPriority = selectedPriority === "ALL" || t.priority === selectedPriority;
    const matchesAgent = selectedAgent === "ALL" || t.assignedAgentId === selectedAgent;

    return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      assignedAgentId: "agent-kia",
      category: "Estratégia & Marketing",
      tags: "GAG Core",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      assignedAgentId: task.assignedAgentId || "agent-kia",
      category: task.category,
      tags: task.tags.join(", "),
    });
    setIsModalOpen(true);
  };

  const handleExecuteSingle = async (taskId: string, agentId?: string) => {
    setExecutingTaskId(taskId);
    playSfx("action");
    await executeTaskWithAgent(taskId, agentId);
    setExecutingTaskId(null);
  };

  const handleExecuteBatch = async () => {
    playSfx("action");
    await executeBatchTasks();
  };

  const handleOrchestrateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orchestrationGoal.trim()) return;

    setIsOrchestrating(true);
    try {
      await orchestratePlanWithKIA(orchestrationGoal.trim());
      setIsOrchestrateModalOpen(false);
      setOrchestrationGoal("");
    } catch (err) {
      console.error("Orchestration failed", err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    playSfx("success");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedAgentId: formData.assignedAgentId,
        category: formData.category,
        tags: tagsArray,
      });
    } else {
      createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedAgentId: formData.assignedAgentId,
        assignedUserId: currentUser.id,
        category: formData.category,
        tags: tagsArray,
      });
    }

    setIsModalOpen(false);
  };

  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const pendingCount = tasks.length - doneCount;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Tarefas & Backlog Operacional</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {tasks.length} Tarefas ({doneCount} Concluídas)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execução autônoma de tarefas pelos 13 agentes de IA, com geração de artefatos reais, roteiros, arquiteturas e relatórios executivos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playSfx("click");
              setIsOrchestrateModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            title="Abrir o Orquestrador Supremo KIA para decompor uma missão em múltiplas etapas autônomas"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>🧠 Orquestrar Missão (AOS)</span>
          </button>

          <button
            onClick={handleExecuteBatch}
            disabled={isExecutingTask || pendingCount === 0}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-amber-500 hover:from-indigo-400 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
            title="Colocar os 13 agentes a executar todas as tarefas pendentes de forma sequencial inteligente"
          >
            {isExecutingTask ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>13 Agentes em Execução...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>⚡ Executar Todas as Tarefas ({pendingCount})</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar tarefas ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          {priorities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          <option value="ALL">Todos os Agentes Atribuídos</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-[#090c14] border border-slate-800 rounded-2xl">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">Nenhuma tarefa encontrada</p>
          <p className="text-xs text-slate-500 mt-1">Ajusta os filtros ou clica em "Criar Nova Tarefa".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => {
            const assignedAgent = agents.find((a) => a.id === task.assignedAgentId);
            const isCurrentlyExecuting = executingTaskId === task.id || (isExecutingTask && task.status === "IN_PROGRESS");
            const hasDeliverable = !!task.executionOutput;

            return (
              <div
                key={`${task.id}-${idx}`}
                className="bg-[#0b0f19] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 shadow-md group"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === "CRITICAL"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : task.priority === "HIGH"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : task.priority === "MEDIUM"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                      {task.category}
                    </span>

                    {assignedAgent && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center space-x-1.5">
                        <AgentAvatar agentId={assignedAgent.id} avatarColor={assignedAgent.avatarColor} size="xs" />
                        <span>{assignedAgent.name}</span>
                      </span>
                    )}

                    {task.status === "DONE" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Entregável Concluído</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    {task.dueDate && (
                      <span className="flex items-center space-x-1 text-amber-400/90 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Prazo: {new Date(task.dueDate).toLocaleDateString("pt-PT")}</span>
                      </span>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((t, idx) => (
                        <span
                          key={`task-${task.id}-tag-${t}-${idx}`}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Controls & Action Button */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Single Agent Execute Button */}
                  {task.status !== "DONE" ? (
                    <button
                      onClick={() => handleExecuteSingle(task.id, task.assignedAgentId)}
                      disabled={isCurrentlyExecuting || isExecutingTask}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                      title="Executar esta tarefa com o agente especialista correspondente"
                    >
                      {isCurrentlyExecuting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>A Executar...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Executar c/ Agente</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewingDeliverableTask(task)}
                      className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
                      title="Ver o resultado gerado pelo agente"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Entregável</span>
                    </button>
                  )}

                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      task.status === "DONE"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : task.status === "IN_PROGRESS"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : task.status === "REVIEW"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : task.status === "BLOCKED"
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : "bg-slate-900 text-slate-300 border-slate-700"
                    }`}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                    title="Editar Tarefa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-colors"
                    title="Eliminar Tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deliverable Viewer Modal */}
      {viewingDeliverableTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-white">{viewingDeliverableTask.title}</h2>
                  <p className="text-[11px] text-slate-400">
                    Entregável gerado por {agents.find((a) => a.id === viewingDeliverableTask.executedByAgentId || a.id === viewingDeliverableTask.assignedAgentId)?.name || "Agente de IA"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDeliverableTask(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-black/60 border border-slate-800 text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {viewingDeliverableTask.executionOutput || "Nenhum output de execução detalhado registado."}
              </div>

              {viewingDeliverableTask.executionArtifacts && viewingDeliverableTask.executionArtifacts.length > 0 && (
                <div>
                  <h4 className="font-bold text-amber-400 mb-2">Artefatos & Entregáveis Anexos</h4>
                  <div className="space-y-2">
                    {viewingDeliverableTask.executionArtifacts.map((art, idx) => (
                      <div
                        key={`art-${idx}`}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-[11px]">{art.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                            {art.type}
                          </span>
                        </div>
                        <pre className="text-[11px] bg-black/50 p-2.5 rounded-lg text-amber-200 overflow-x-auto font-mono whitespace-pre-wrap">
                          {art.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleCopyText(viewingDeliverableTask.executionOutput || "")}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center space-x-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copiado!" : "Copiar Output"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingDeliverableTask(null)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal: Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/30 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">
                {editingTask ? "Editar Tarefa" : "Nova Tarefa no Backlog"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ex: Configurar persistência Supabase"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição Detalhada</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instruções, critérios de aceitação ou notas de entrega..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as TaskPriority })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="CRITICAL">CRITICAL (Crítica)</option>
                    <option value="HIGH">HIGH (Alta)</option>
                    <option value="MEDIUM">MEDIUM (Média)</option>
                    <option value="LOW">LOW (Baixa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as TaskStatus })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prazo de Entrega (Due Date)</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Atribuir a Agente</label>
                  <select
                    value={formData.assignedAgentId}
                    onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {agents.map((a, idx) => (
                      <option key={`task-opt-ag-${a.id}-${idx}`} value={a.id}>
                        {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ex: Infraestrutura / Design / Marketing"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="ex: Supabase, OCR, GAG"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold rounded-xl text-xs"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AOS — Modal de Orquestração Autónoma de Missões */}
      {isOrchestrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0f19] border border-amber-500/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">KIA Master — Orquestrador Supremo (AOS)</h3>
                  <p className="text-xs text-slate-400">Decomposição inteligente, delegação a especialistas e QA automático.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrchestrateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrchestrateMission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Qual é a meta ou missão estratégica a orquestrar?
                </label>
                <textarea
                  rows={3}
                  value={orchestrationGoal}
                  onChange={(e) => setOrchestrationGoal(e.target.value)}
                  placeholder="Ex: Auditar fatura ENDE de 850.000 Kz, identificar cobranças indevidas e gerar proposta comercial com sinal de 50% para renegociação."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-2">Exemplos rápidos de missões de alto impacto:</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Auditoria forense de fatura Unitel/ENDE e elaboração de relatório de corte de custos",
                    "Criação de campanha High-Ticket para consultoria TOB com sequência de 5 e-mails",
                    "Produção de roteiro cinematográfico Veo 2 para lançamento de marca com 9:16",
                    "Triagem de caixa de entrada com classificação Inbox Zero e respostas automáticas",
                  ].map((preset, idx) => (
                    <button
                      key={`preset-mission-${idx}`}
                      type="button"
                      onClick={() => setOrchestrationGoal(preset)}
                      className="text-left text-xs p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 text-slate-300 transition-colors"
                    >
                      ⚡ {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOrchestrateModalOpen(false)}
                  disabled={isOrchestrating}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isOrchestrating || !orchestrationGoal.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isOrchestrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>KIA a Orquestrar & Executar...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Disparar Orquestração AOS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
