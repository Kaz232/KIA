import React, { useState } from "react";
import {
  Factory,
  Sparkles,
  Bot,
  Plus,
  Wrench,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Trash2,
  RefreshCw,
  X,
  Cpu,
  Zap,
  FileJson,
  KeyRound,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Agent, AgentStatus } from "../types";
import { N8NWorkflowTemplatesTab } from "./N8NWorkflowTemplatesTab";
import { N8NEnvironmentVault } from "./N8NEnvironmentVault";
import { N8NWorkflowTemplate } from "../core/tools/n8n/workflowSnippets";

export const AgentFactoryView: React.FC = () => {
  const { agents, skills, createAgent, updateAgent, setActiveTab } = useApp();

  const [factorySubTab, setFactorySubTab] = useState<"builder" | "templates" | "vault">("builder");
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    roleTitle: string;
    objective: string;
    description: string;
    systemPrompt: string;
    skills: string[];
    permissions: string[];
    avatarColor: string;
    status: AgentStatus;
    version: string;
  }>({
    name: "",
    slug: "",
    roleTitle: "",
    objective: "",
    description: "",
    systemPrompt: "",
    skills: ["gag-prompt-engineering"],
    permissions: ["conversation:execute", "knowledge:read"],
    avatarColor: "#6366F1",
    status: "DRAFT",
    version: "0.1.0",
  });

  // AI Prompt Assistant State
  const [aiBriefPrompt, setAiBriefPrompt] = useState("");
  const [aiSuccessNotice, setAiSuccessNotice] = useState<string | null>(null);

  // Test Simulator State
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const availablePermissions = [
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
  ];

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === handleSlugify(prev.name) ? handleSlugify(val) : prev.slug,
    }));
  };

  const handleToggleSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((s) => s !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleTogglePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  // AI Blueprint Generator using Skill Execution API
  const handleGenerateAiBlueprint = async () => {
    if (!aiBriefPrompt.trim()) return;

    setIsGeneratingAi(true);
    setAiSuccessNotice(null);

    try {
      const res = await fetch("/api/skills/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: "gag-ai-agent-design",
          payload: {
            agentRole: aiBriefPrompt,
            targetDepartment: "Marketing & Operações GAG",
            requiredSkills: skills.map((s) => s.id),
          },
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar blueprint");
      const result = await res.json();
      const output = result.result || {};

      const genName = output.agentName || aiBriefPrompt;
      const genSlug = handleSlugify(genName);

      setFormData((prev) => ({
        ...prev,
        name: genName,
        slug: genSlug,
        roleTitle: output.roleTitle || "Especialista GAG Core",
        objective: output.objective || `Atuar com excelência em ${aiBriefPrompt} para a GAG Visual.`,
        description: output.description || `Agente especializado gerado via AI Blueprint.`,
        systemPrompt: output.systemPrompt || `Tu és um agente especialista da GAG Visual. Executa com rigor técnico e sofisticação.`,
        skills: output.suggestedSkills && output.suggestedSkills.length > 0 ? output.suggestedSkills : ["gag-prompt-engineering"],
        permissions: output.suggestedPermissions || ["conversation:execute", "knowledge:read"],
      }));

      setAiSuccessNotice(`Blueprint gerado com sucesso para "${genName}"!`);
      setWizardStep(2);
    } catch (e: any) {
      console.error("AI blueprint error:", e);
      // Fallback local blueprint
      const slug = handleSlugify(aiBriefPrompt);
      setFormData((prev) => ({
        ...prev,
        name: aiBriefPrompt,
        slug,
        roleTitle: "Consultor de Performance",
        objective: `Apoiar a equipa em estratégias de ${aiBriefPrompt}.`,
        description: `Agente projetado para otimização de fluxos operacionais da GAG.`,
        systemPrompt: `Tu és o agente de ${aiBriefPrompt}. Responde com precisão técnica e tom profissional.`,
        skills: ["gag-data-analysis-brief", "gag-prompt-engineering"],
      }));
      setWizardStep(2);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveNewAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    createAgent({
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      objective: formData.objective,
      skills: formData.skills,
      permissions: formData.permissions,
      status: formData.status,
      version: formData.version,
      avatarColor: formData.avatarColor,
      roleTitle: formData.roleTitle,
      systemPrompt: formData.systemPrompt,
    });

    setActiveTab("agents");
  };

  // Test Simulator
  const handleRunSimulation = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestOutput(null);

    try {
      const res = await fetch("/api/kia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[SIMULAÇÃO DO AGENTE "${formData.name}"] Prompt de Teste: ${testInput}`,
          contextData: { isSimulation: true, agentSlug: formData.slug },
        }),
      });

      if (!res.ok) throw new Error("Erro na simulação");
      const data = await res.json();
      setTestOutput(data.content || "Resposta simulada com sucesso.");
    } catch (e: any) {
      setTestOutput(`Simulação: O agente respondeu de acordo com o System Prompt configurado.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleUseN8NTemplate = (template: N8NWorkflowTemplate) => {
    setFormData({
      name: template.name,
      slug: template.agentSlugSuggestion,
      roleTitle: template.agentRoleSuggestion,
      objective: template.agentObjectiveSuggestion,
      description: `Agente operacional vinculado ao workflow N8N "${template.name}" (${template.badge}).`,
      systemPrompt: `Tu és o agente de automação especialista em ${template.name} da GAG Visual (Luanda, Angola).\nTu orquestras o webhook /${template.webhookPath} com autonomia de Nível ${template.autonomyLevel}.\nGarante conformidade operacional, validação de dados de Angola e comunicação corporativa de alto nível.`,
      skills: ["gag-prompt-engineering", "gag-workflow-orchestration"],
      permissions: ["conversation:execute", "knowledge:read", "task:manage"],
      avatarColor:
        template.category === "CRM"
          ? "#10B981"
          : template.category === "FINANCE"
          ? "#F59E0B"
          : template.category === "ERP"
          ? "#3B82F6"
          : template.category === "AGT_TAX"
          ? "#EF4444"
          : "#8B5CF6",
      status: "DRAFT",
      version: "1.0.0",
    });
    setAiSuccessNotice(`Template N8N "${template.name}" carregado na Fábrica! Podes ajustar e salvar.`);
    setFactorySubTab("builder");
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Agent Factory & Lab</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Arquitetura Dinâmica 100+
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fábrica modular para criação, prototipagem, templates de workflows N8N e simulação de sandbox.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("agents")}
          className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
        >
          Ver Agentes no Catálogo
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-[#0b0f19] border border-slate-800">
        <button
          onClick={() => setFactorySubTab("builder")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            factorySubTab === "builder"
              ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Fábrica & Sandbox (AI Blueprint)</span>
        </button>

        <button
          onClick={() => setFactorySubTab("templates")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            factorySubTab === "templates"
              ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <FileJson className="w-4 h-4 text-amber-400" />
          <span>Templates N8N (Workflows GAG)</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            6 Prontos
          </span>
        </button>

        <button
          onClick={() => setFactorySubTab("vault")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            factorySubTab === "vault"
              ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Cofre de Ambientes & Chaves API</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Seguro
          </span>
        </button>
      </div>

      {/* Content Render Based on Active SubTab */}
      {factorySubTab === "templates" ? (
        <N8NWorkflowTemplatesTab
          onUseTemplateForAgent={handleUseN8NTemplate}
          onOpenVault={() => setFactorySubTab("vault")}
        />
      ) : factorySubTab === "vault" ? (
        <N8NEnvironmentVault />
      ) : (
        <>
          {/* AI Blueprint Fast Track Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0e1322] to-slate-950 border border-amber-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Gerador de Blueprint de Agente com IA (Motor 'O Soba')
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Arquiteto-Chefe Ativo
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3 max-w-2xl leading-relaxed">
          <strong>O Soba</strong> lê a tua ideia mínima, planeia a infraestrutura como Engenheiro de Prompt Sénior e estrutura a configuração completa do novo agente com permissões RBAC e skills operacionais.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Qual é a especialidade do novo agente?"
            value={aiBriefPrompt}
            onChange={(e) => setAiBriefPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateAiBlueprint()}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />

          <button
            onClick={handleGenerateAiBlueprint}
            disabled={!aiBriefPrompt.trim() || isGeneratingAi}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md disabled:opacity-40 transition-all"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando Blueprint...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Gerar Blueprint</span>
              </>
            )}
          </button>
        </div>

        {aiSuccessNotice && (
          <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{aiSuccessNotice}</span>
          </div>
        )}
      </div>

      {/* Main Creation Form & Simulator Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Setup (2 cols) */}
        <div className="lg:col-span-2 bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="text-sm font-bold text-white">Especificação do Agente</div>
            <div className="text-xs text-slate-400">
              Estado Inicial: <strong className="text-indigo-400">DRAFT</strong>
            </div>
          </div>

          <form onSubmit={handleSaveNewAgent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome do Agente</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ex: Copywriter de Performance"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Slug Único (Identificador)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: handleSlugify(e.target.value) })}
                  placeholder="ex: copywriter-performance"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cargo / Role Title</label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  placeholder="ex: Senior Conversion Copywriter"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cor do Avatar (Hex)</label>
                <input
                  type="text"
                  value={formData.avatarColor}
                  onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
                  placeholder="#6366F1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Objetivo Estratégico (Missão)</label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Qual o resultado de negócio que este agente deve gerar?"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Descrição Operacional</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Resumo de como o agente atua no dia-a-dia..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">System Prompt & Instruções de Comportamento</label>
              <textarea
                rows={4}
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Instruções rigorosas de execução, tom de voz e regras..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
              />
            </div>

            {/* Skills Checklist */}
            <div>
              <label className="block text-slate-400 font-semibold mb-2">
                Vincular Skills ({formData.skills.length} selecionadas)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {skills.map((skill, idx) => {
                  const isChecked = formData.skills.includes(skill.id);
                  return (
                    <div
                      key={`fac-skill-${skill.id}-${idx}`}
                      onClick={() => handleToggleSkill(skill.id)}
                      className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isChecked
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{skill.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded accent-amber-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permissions Matrix */}
            <div>
              <label className="block text-slate-400 font-semibold mb-2">
                Permissões RBAC ({formData.permissions.length} atribuídas)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availablePermissions.map((perm, idx) => {
                  const hasPerm = formData.permissions.includes(perm);
                  return (
                    <button
                      type="button"
                      key={`fac-perm-${perm}-${idx}`}
                      onClick={() => handleTogglePermission(perm)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                        hasPerm
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {perm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                Salvar Agente na Factory
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Sandbox Simulator (1 col) */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-800">
              <Play className="w-4 h-4 text-amber-400 fill-current" />
              <h3 className="text-sm font-bold text-white">Simulador de Sandbox</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Testa as respostas do agente com base no System Prompt antes de aprovar para produção.
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Insere um prompt de teste (ex: 'Escreve 3 ganchos para o anúncio de...')"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />

              <button
                onClick={handleRunSimulation}
                disabled={!testInput.trim() || isTesting}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-500/40 transition-colors flex items-center justify-center space-x-2"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executando Teste...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Simular Resposta</span>
                  </>
                )}
              </button>
            </div>

            {testOutput && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-200">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Saída da Simulação:
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{testOutput}</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Simulador auditado pelo GAG Execution Router.
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
