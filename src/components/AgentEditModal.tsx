import React, { useState, useEffect } from "react";
import {
  X,
  Bot,
  Save,
  Wrench,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
  Palette,
  FileCode,
  Tag,
} from "lucide-react";
import { Agent, AgentStatus, Skill } from "../types";
import { AgentAvatar } from "./AgentAvatar";

interface AgentEditModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAgent: Agent) => void;
  skills: Skill[];
}

const AVAILABLE_PERMISSIONS = [
  "conversation:execute",
  "knowledge:read",
  "knowledge:write",
  "document:read",
  "document:process",
  "task:read",
  "task:write",
  "task:manage",
  "agent_factory:read",
  "agent_factory:manage",
  "audit:write",
  "finance:*",
  "campaigns:*",
  "design:*",
  "commercial:*",
  "hr:*",
  "legal:*",
  "automation:*",
];

const PRESET_COLORS = [
  "#F59E0B", // Amber / GAG Gold
  "#10B981", // Emerald
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#F97316", // Orange
  "#64748B", // Slate
];

export const AgentEditModal: React.FC<AgentEditModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave,
  skills,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(agent.name);
  const [slug, setSlug] = useState(agent.slug);
  const [roleTitle, setRoleTitle] = useState(agent.roleTitle || "");
  const [description, setDescription] = useState(agent.description);
  const [objective, setObjective] = useState(agent.objective);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt || "");
  const [status, setStatus] = useState<AgentStatus>(agent.status);
  const [version, setVersion] = useState(agent.version || "1.0.0");
  const [avatarColor, setAvatarColor] = useState(agent.avatarColor || "#F59E0B");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(agent.skills || []);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(agent.permissions || []);
  
  // Custom metadata / characteristics
  const [customTrait, setCustomTrait] = useState("");
  const [customTraitsList, setCustomTraitsList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"identity" | "personality" | "skills" | "permissions" | "prompt">("identity");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(agent.name);
    setSlug(agent.slug);
    setRoleTitle(agent.roleTitle || "");
    setDescription(agent.description);
    setObjective(agent.objective);
    setSystemPrompt(agent.systemPrompt || "");
    setStatus(agent.status);
    setVersion(agent.version || "1.0.0");
    setAvatarColor(agent.avatarColor || "#F59E0B");
    setSelectedSkills(agent.skills || []);
    setSelectedPermissions(agent.permissions || []);
  }, [agent]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleAddTrait = () => {
    if (!customTrait.trim()) return;
    const newTrait = customTrait.trim();
    setCustomTraitsList((prev) => [...prev, newTrait]);
    // Also append to system prompt smoothly
    setSystemPrompt((prev) => `${prev}\n\n[DIRETRIZ CUSTOMIZADA]: ${newTrait}`);
    setCustomTrait("");
  };

  const handleRemoveTrait = (index: number) => {
    setCustomTraitsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedAgent: Agent = {
      ...agent,
      name,
      slug,
      roleTitle,
      description,
      objective,
      systemPrompt,
      status,
      version,
      avatarColor,
      skills: selectedSkills,
      permissions: selectedPermissions,
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSave(updatedAgent);
      setIsSaving(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b0f19] border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#090c14] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <AgentAvatar
              agentId={agent.id}
              avatarColor={avatarColor}
              size="lg"
              showBadge={true}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Editar Agente: {name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  {slug}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalize as instruções de comportamento, skills, permissões e diretrizes operacionais.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-4 border-b border-slate-800/80 bg-[#090c14]/50">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "identity"
                ? "bg-[#0b0f19] text-amber-300 border-t-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Identidade & Cargo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("personality")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "personality"
                ? "bg-[#0b0f19] text-amber-300 border-t-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Características & Traços</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "skills"
                ? "bg-[#0b0f19] text-amber-300 border-t-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Skills ({selectedSkills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("permissions")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "permissions"
                ? "bg-[#0b0f19] text-amber-300 border-t-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Permissões RBAC ({selectedPermissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prompt")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "prompt"
                ? "bg-[#0b0f19] text-amber-300 border-t-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>System Prompt Completo</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IDENTITY */}
          {activeTab === "identity" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Slug Identificador (Único)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Título do Cargo / Especialidade
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Ex: Auditor Financeiro Forense & Gestor DRE"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Estado Operacional
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AgentStatus)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Ativo)</option>
                    <option value="DRAFT">DRAFT (Rascunho)</option>
                    <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Em Revisão)</option>
                    <option value="ARCHIVED">ARCHIVED (Arquivado)</option>
                  </select>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cor do Avatar & Identidade Visual</span>
                </label>
                <div className="flex items-center space-x-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        avatarColor === c ? "ring-2 ring-white scale-110 shadow-lg" : "opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={avatarColor}
                    onChange={(e) => setAvatarColor(e.target.value)}
                    className="w-7 h-7 rounded-xl bg-transparent border-0 cursor-pointer"
                    title="Cor personalizada"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Objetivo Estratégico & Missão
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Descrição Pública
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PERSONALITY & TRAITS */}
          {activeTab === "personality" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Personalização Dinâmica de Características</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Adicione características, regras de tom (ex: tom mais formal, foco em Kwanzas angolanos, rigor contábil extremo, respostas curtas por áudio) que são integradas diretamente no cérebro do agente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Adicionar Nova Característica / Diretriz Operacional
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customTrait}
                    onChange={(e) => setCustomTrait(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTrait())}
                    placeholder="Ex: Focar sempre em métricas de ROI em Kwanzas (AOA) e citar impostos AGT"
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTrait}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Acrescentar</span>
                  </button>
                </div>
              </div>

              {customTraitsList.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">
                    Características Atribuídas Recentemente ({customTraitsList.length}):
                  </label>
                  <div className="space-y-2">
                    {customTraitsList.map((trait, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <Tag className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>{trait}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrait(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Selecione as Skills Vinculadas a este Agente ({selectedSkills.length} ativas)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((s) => {
                  const isChecked = selectedSkills.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSkill(s.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isChecked
                          ? "bg-amber-500/15 border-amber-500/60 text-white"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                            {s.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSIONS */}
          {activeTab === "permissions" && (
            <div className="space-y-4 animate-fadeIn">
              <label className="block text-xs font-bold text-slate-300">
                Matriz de Permissões RBAC ({selectedPermissions.length} selecionadas)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm)}
                      className={`p-2.5 rounded-xl border text-left font-mono text-[11px] flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="truncate">{perm}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM PROMPT */}
          {activeTab === "prompt" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  System Prompt Base & Comportamento Central
                </label>
                <span className="text-[10px] text-slate-400">
                  {systemPrompt.length} caracteres
                </span>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={12}
                placeholder="Insira as diretrizes detalhadas de raciocínio, contexto operacional e regras deste agente..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-5 bg-[#090c14] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Salvando Alterações...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 fill-current" />
                <span>Salvar Agente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
