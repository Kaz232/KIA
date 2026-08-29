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
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { KnowledgeCategory, KnowledgeItem, KnowledgeStatus } from "../types";

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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<KnowledgeCategory>("BRANDING");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStatus, setFormStatus] = useState<KnowledgeStatus>("APPROVED");

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Base de Conhecimento</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {knowledge.length} Artigos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Repositório central de diretrizes, metodologias, manuais e conhecimento operacional da GAG Visual.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Artigo</span>
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
        {filteredKnowledge.map((item, idx) => (
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
                <span className="text-[10px] text-slate-500">v{item.version}</span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {item.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
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
        ))}
      </div>

      {/* View Item Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090c14] border border-amber-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {selectedItem.category}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedItem.title}</h2>
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
              <div className="flex items-center space-x-2">
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
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  title="Enviar este briefing ou diretriz para o Estúdio Multimodal / Veo"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Enviar para Estúdio</span>
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs"
                >
                  Fechar
                </button>
              </div>
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
    </div>
  );
};
