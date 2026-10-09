import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Tag,
  Clock,
  User,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  Filter,
  Sparkles,
  Share2,
  FolderOpen,
  ArrowRight,
  Zap,
  CheckSquare,
  Wand2,
  FileText,
  UploadCloud,
  ShieldCheck,
  Cpu,
  Users,
  Brain,
  Bot,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { KnowledgeCategory, KnowledgeItem, KnowledgeStatus, GenerativeTool } from "../types";
import { KnowledgeBatchIngestionModal } from "./KnowledgeBatchIngestionModal";
import { AgentAutonomyControlModal } from "./AgentAutonomyControlModal";

export const KnowledgeBaseView: React.FC = () => {
  const {
    knowledge,
    addKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    createTask,
    setActiveTab,
    currentUser,
    activeRole,
    tasks,
    taughtKnowledgeIds,
    teachKnowledgeToKia,
    teachAllKnowledgeToKia,
    transformToGenerativeTool,
    isTeachingToKia,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchIngestionOpen, setIsBatchIngestionOpen] = useState(false);
  const [isAutonomyModalOpen, setIsAutonomyModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [createdToolModal, setCreatedToolModal] = useState<GenerativeTool | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<KnowledgeCategory>("BRANDING");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStatus, setFormStatus] = useState<KnowledgeStatus>("APPROVED");

  const pendingTasksCount = tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length;

  const categories: { key: string; label: string }[] = [
    { key: "ALL", label: "Todas as Categorias" },
    { key: "BRANDING", label: "Branding & Identidade" },
    { key: "DESIGN_AI", label: "Design & IA Visual" },
    { key: "CONTENT_STRATEGY", label: "Estratégia de Conteúdo" },
    { key: "AUTOMATION", label: "Automação de Processos" },
    { key: "INTERNAL_PROCESS", label: "Processos Internos" },
    { key: "CLIENT_PLAYBOOK", label: "Playbooks de Clientes" },
    { key: "TECHNICAL", label: "Técnico & Engenharia" },
  ];

  const filteredKnowledge = knowledge.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleTransformToTask = (item: KnowledgeItem) => {
    createTask({
      title: `Aplicar: ${item.title}`,
      description: `Execução baseada no artigo de conhecimento: "${item.title}".\n\nResumo:\n${item.content.slice(0, 200)}...`,
      status: "TODO",
      priority: "HIGH",
      category: "DESIGN",
      tags: ["knowledge", ...item.tags],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setActionNotice(`Criada nova tarefa baseada em "${item.title}"!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSendToStudio = (item: KnowledgeItem) => {
    sessionStorage.setItem("gag_studio_prompt", `Criar arte conceitual com base na regra: ${item.title}. Detalhes: ${item.content.slice(0, 150)}`);
    setActiveTab("studio");
  };

  const handleTeachItemToKia = async (item: KnowledgeItem) => {
    const res = await teachKnowledgeToKia(item);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTeachAllToKia = async () => {
    const res = await teachAllKnowledgeToKia();
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleTransformToGenerativeTool = async (item: KnowledgeItem) => {
    const res = await transformToGenerativeTool({
      id: item.id,
      title: item.title,
      type: "knowledge",
      content: item.content,
      category: item.category,
    });
    if (res.success && res.tool) {
      setCreatedToolModal(res.tool);
      setActionNotice(`Nova Ferramenta Generativa criada: "${res.tool.name}"!`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormCategory("BRANDING");
    setFormContent("");
    setFormTags("gag-core, operacional");
    setFormStatus("APPROVED");
    setIsModalOpen(true);
  };

  const openEditModal = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setFormTags(item.tags.join(", "));
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      updateKnowledgeItem(editingItem.id, {
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        tags: tagsArray,
        status: formStatus,
      });
      if (selectedItem?.id === editingItem.id) {
        setSelectedItem({
          ...selectedItem,
          title: formTitle.trim(),
          category: formCategory,
          content: formContent.trim(),
          tags: tagsArray,
          status: formStatus,
        });
      }
    } else {
      addKnowledgeItem({
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        tags: tagsArray,
        status: formStatus,
        source: "Manual (GAG Core OS)",
        version: "1.0.0",
        owner: currentUser.name,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActiveTab("tasks")}
            className="text-[11px] underline hover:text-emerald-200"
          >
            Ver Tarefas &rarr;
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Base de Conhecimento</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {knowledge.length} Artigos
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>{taughtKnowledgeIds.length} Ativos na KIA</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Repositório central de diretrizes, metodologias, manuais e conhecimento operacional da GAG Visual integrados na KIA.
          </p>
        </div>

        {/* Action Buttons: Batch Upload & Team Autonomy */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={handleTeachAllToKia}
            disabled={isTeachingToKia}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            title="Injetar todos os artigos da base de conhecimento diretamente no cérebro executivo e memória de trabalho da KIA"
          >
            <Brain className="w-4 h-4 fill-black/20" />
            <span>{isTeachingToKia ? "A Ensinar à KIA..." : `🧠 Ensinar Toda a Base à KIA (${knowledge.length})`}</span>
          </button>

          <button
            onClick={() => setIsBatchIngestionOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            title="Anexar múltiplos documentos (PDF, Word, TXT, Imagens) de uma só vez para os agentes lerem e transformarem em ferramentas"
          >
            <UploadCloud className="w-4 h-4 text-blue-200" />
            <span>⚡ Anexar Documentos</span>
          </button>

          <button
            onClick={() => setIsAutonomyModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
            title="Abrir o painel de autoridade e autonomia da equipa de agentes"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Autonomia</span>
          </button>

          <button
            onClick={openNewModal}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Manual</span>
          </button>
        </div>
      </div>

      {/* Autonomous Team Working Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-[#0a0f1d] to-amber-950/20 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white">Equipa de Agentes com Autonomia Total Ativa</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Operação sem Fricção
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Pode anexar mais de um ficheiro ao mesmo tempo. Os agentes leem, direcionam para a sua especialidade, criam ferramentas operacionais e executam as tarefas sem necessitarem de supervisão para decisões rotineiras.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAutonomyModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-all self-end sm:self-center"
        >
          <span>Gerir Autonomia</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar por título, conteúdo ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090c14] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#090c14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKnowledge.map((item, idx) => {
          const isTaught = taughtKnowledgeIds.includes(item.id);
          return (
            <div
              key={`kb-${item.id}-${idx}`}
              onClick={() => setSelectedItem(item)}
              className="bg-[#090c14] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between cursor-pointer group transition-all shadow-lg hover:shadow-amber-500/5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold uppercase">
                    {item.category.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isTaught && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                        title="Diretriz absorvida e ativa no cérebro da KIA"
                      >
                        <Brain className="w-3 h-3 text-emerald-400" />
                        <span>KIA Ativa</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">v{item.version}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
              </div>

              {/* Card Actions & Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeachItemToKia(item);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border transition-all ${
                      isTaught
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border-amber-500/40"
                    }`}
                    title="Ensinar esta regra para a KIA aplicar nas conversas e entregáveis"
                  >
                    <Brain className="w-3 h-3" />
                    <span>{isTaught ? "Atualizar na KIA" : "🧠 Ensinar à KIA"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTransformToGenerativeTool(item);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center space-x-1 transition-all"
                    title="Transformar este manual numa ferramenta generativa acionável no Estúdio Multimodal"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>⚡ Gerador IA</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5 truncate">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.owner}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.updatedAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Item Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090c14] border border-amber-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    {selectedItem.category}
                  </span>
                  {taughtKnowledgeIds.includes(selectedItem.id) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <Brain className="w-3 h-3 text-emerald-400" />
                      <span>Ativo no Cérebro da KIA</span>
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white mt-1.5">{selectedItem.title}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedItem.content}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedItem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    handleTeachItemToKia(selectedItem);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-md"
                  title="Injetar e calibrar este conhecimento na memória de raciocínio da KIA"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>🧠 Ensinar à KIA</span>
                </button>

                <button
                  onClick={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    handleTransformToGenerativeTool(item);
                  }}
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  title="Converter este conhecimento numa ferramenta generativa pronta no Estúdio Multimodal"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>⚡ Transformar em Gerador IA</span>
                </button>

                <button
                  onClick={() => {
                    handleTransformToTask(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  title="Converter este artigo de conhecimento diretamente numa tarefa operacional"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Gerar Tarefa</span>
                </button>

                <button
                  onClick={() => {
                    handleSendToStudio(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  title="Enviar este briefing para o Estúdio Multimodal"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Estúdio</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    deleteKnowledgeItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Apagar</span>
                </button>

                <button
                  onClick={() => {
                    const it = selectedItem;
                    setSelectedItem(null);
                    openEditModal(it);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal: Created Generative Tool */}
      {createdToolModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090c14] border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Ferramenta Generativa Criada!</h3>
              </div>
              <button
                onClick={() => setCreatedToolModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                {createdToolModal.category}
              </span>
              <h4 className="text-sm font-bold text-white">{createdToolModal.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{createdToolModal.description}</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Campos de Entrada Configurados:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {createdToolModal.inputFields.map((f, i) => (
                  <li key={i}>{f.label} ({f.type})</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setCreatedToolModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
              >
                Concluir
              </button>
              <button
                onClick={() => {
                  setCreatedToolModal(null);
                  setActiveTab("studio");
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Abrir no Estúdio Multimodal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-[#090c14] border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? "Editar Artigo de Conhecimento" : "Novo Artigo de Conhecimento"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Título</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Diretrizes de Branding e Tom de Voz"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as KnowledgeCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="BRANDING">Branding & Identidade</option>
                  <option value="DESIGN_AI">Design & IA Visual</option>
                  <option value="CONTENT_STRATEGY">Estratégia de Conteúdo</option>
                  <option value="AUTOMATION">Automação de Processos</option>
                  <option value="INTERNAL_PROCESS">Processos Internos</option>
                  <option value="CLIENT_PLAYBOOK">Playbooks de Clientes</option>
                  <option value="TECHNICAL">Técnico & Engenharia</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="gag, design, briefing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Conteúdo</label>
              <textarea
                required
                rows={8}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Descreve o procedimento, regra ou conhecimento estruturado..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-lg"
              >
                Salvar Artigo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Multi-File Ingestion Modal */}
      <KnowledgeBatchIngestionModal
        isOpen={isBatchIngestionOpen}
        onClose={() => setIsBatchIngestionOpen(false)}
        onSuccessNotice={(msg) => setActionNotice(msg)}
      />

      {/* Agent Autonomy and Authority Control Modal */}
      <AgentAutonomyControlModal
        isOpen={isAutonomyModalOpen}
        onClose={() => setIsAutonomyModalOpen(false)}
        onSuccessNotice={(msg) => setActionNotice(msg)}
      />
    </div>
  );
};
