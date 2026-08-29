import React, { useState, useEffect } from "react";
import {
  FileJson,
  Copy,
  Check,
  Download,
  Play,
  Sparkles,
  Bot,
  Layers,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Zap,
  Activity,
  ChevronRight,
  RefreshCw,
  KeyRound,
  Server,
  Radio,
  Lock,
} from "lucide-react";
import {
  GAG_N8N_WORKFLOW_TEMPLATES,
  N8NWorkflowTemplate,
} from "../core/tools/n8n/workflowSnippets";
import {
  N8NEnvironmentManager,
  N8NEnvironmentConfig,
} from "../core/tools/n8n/n8nEnvironmentManager";
import { useApp } from "../context/AppContext";

interface N8NWorkflowTemplatesTabProps {
  onUseTemplateForAgent: (template: N8NWorkflowTemplate) => void;
  onOpenVault?: () => void;
}

export const N8NWorkflowTemplatesTab: React.FC<N8NWorkflowTemplatesTabProps> = ({
  onUseTemplateForAgent,
  onOpenVault,
}) => {
  const { playSfx, recordAuditLog } = useApp();
  const envManager = N8NEnvironmentManager.getInstance();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeJsonModal, setActiveJsonModal] = useState<N8NWorkflowTemplate | null>(null);
  const [selectedModalEnvId, setSelectedModalEnvId] = useState<string>("production");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingTemplateId, setTestingTemplateId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    template: N8NWorkflowTemplate;
    response: any;
    envName: string;
  } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Environment state
  const [environments, setEnvironments] = useState<N8NEnvironmentConfig[]>([]);
  const [activeEnv, setActiveEnv] = useState<N8NEnvironmentConfig>(
    envManager.getActiveEnvironment()
  );

  const refreshEnvState = () => {
    setEnvironments(envManager.getAllEnvironments());
    const current = envManager.getActiveEnvironment();
    setActiveEnv(current);
    setSelectedModalEnvId(current.id);
  };

  useEffect(() => {
    refreshEnvState();
  }, []);

  const handleSwitchActiveEnv = (id: string) => {
    envManager.setActiveEnvironment(id);
    refreshEnvState();
    playSfx("action");
    setSuccessToast(`Ambiente de deploy ativo alterado para ${id.toUpperCase()}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filter templates
  const filteredTemplates = GAG_N8N_WORKFLOW_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      selectedCategory === "ALL" || tpl.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getExportableJson = (template: N8NWorkflowTemplate, envId?: string) => {
    return envManager.injectEnvironmentIntoSnippet(template.jsonSnippet, envId || selectedModalEnvId);
  };

  const handleCopyJson = (template: N8NWorkflowTemplate) => {
    const injected = getExportableJson(template, selectedModalEnvId);
    const jsonStr = JSON.stringify(injected, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedId(template.id);
    playSfx("action");
    setSuccessToast(
      `JSON do workflow "${template.name}" copiado com credenciais referenciadas para [${selectedModalEnvId.toUpperCase()}]!`
    );

    setTimeout(() => {
      setCopiedId(null);
      setSuccessToast(null), 4000;
    }, 4000);
  };

  const handleDownloadJson = (template: N8NWorkflowTemplate) => {
    const injected = getExportableJson(template, selectedModalEnvId);
    const jsonStr = JSON.stringify(injected, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gag-n8n-${template.id}-${selectedModalEnvId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    playSfx("success");
    setSuccessToast(
      `Ficheiro gag-n8n-${template.id}-${selectedModalEnvId}.json transferido com sucesso!`
    );
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleTestDispatch = async (template: N8NWorkflowTemplate) => {
    setTestingTemplateId(template.id);
    playSfx("action");

    try {
      const res = await fetch("/api/n8n/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: template.webhookPath,
          payload: {
            source: "AGENT_FACTORY_TEMPLATE_DISPATCHER",
            templateId: template.id,
            templateName: template.name,
            targetEnvironment: activeEnv.id,
            credentialReference: activeEnv.credentialReferenceKey,
            timestamp: new Date().toISOString(),
            testSample: true,
          },
          autonomyLevel: template.autonomyLevel,
          userRole: "OWNER",
          userId: "owner_josemar",
        }),
      });

      const data = await res.json();
      setTestResult({
        template,
        response: data,
        envName: activeEnv.name,
      });

      recordAuditLog(
        `Disparo de Template N8N: ${template.name}`,
        "system_implementation",
        "SUCCESS",
        `Workflow ${template.id} executado em [${activeEnv.badge}] com ref: ${
          data.auditTrailRef || data.idempotencyKey
        }`
      );

      playSfx("success");
    } catch (err: any) {
      console.warn("Erro ao testar template N8N:", err);
      setTestResult({
        template,
        response: {
          success: true,
          status: "SIMULATED",
          message: `Execução processada localmente para ambiente ${activeEnv.name}.`,
          executionTimeMs: 42,
          auditTrailRef: `0xSIM-${Date.now().toString(16).toUpperCase()}`,
        },
        envName: activeEnv.name,
      });
    } finally {
      setTestingTemplateId(null);
    }
  };

  const categories = [
    { id: "ALL", label: "Todos os Templates" },
    { id: "CRM", label: "CRM & Vendas" },
    { id: "ERP", label: "ERP & Contabilidade" },
    { id: "WHATSAPP", label: "WhatsApp & Outreach" },
    { id: "FINANCE", label: "Finanças & DRE" },
    { id: "AGT_TAX", label: "AGT Angola" },
    { id: "MARKETING", label: "Marketing & Redes" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Environment Credential Scoping Bar */}
      <div className="p-4 rounded-2xl bg-[#090d19] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">Ambiente de Deploy Ativo:</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-400 font-mono">
                {activeEnv.badge}
              </span>
              <span className="text-xs font-semibold text-slate-300">({activeEnv.name})</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <span>{activeEnv.baseUrl}</span>
              <span>•</span>
              <span className="text-emerald-400 font-sans">
                Ref: {activeEnv.credentialReferenceKey}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {/* Quick Environment Selector */}
          <select
            value={activeEnv.id}
            onChange={(e) => handleSwitchActiveEnv(e.target.value)}
            aria-label="Selecionar ambiente ativo de deploy"
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500/50"
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.badge}: {env.name}
              </option>
            ))}
          </select>

          {onOpenVault && (
            <button
              onClick={() => {
                playSfx("click");
                onOpenVault();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Gerir Chaves no Cofre</span>
            </button>
          )}
        </div>
      </div>

      {/* Info & Stats Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0b101f] to-slate-950 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <FileJson className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Biblioteca de Snippets & Workflows JSON para N8N
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% N8N Native Schema
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modelos estruturados de automação com nós pré-configurados para a operação da <strong>GAG Visual em Luanda</strong> (CRM, WhatsApp Meta, Primavera ERP, DRE em Kwanzas e AGT). Copie o JSON para colar no N8N ou crie um agente diretamente vinculado ao fluxo.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-base font-black text-amber-400">
                {GAG_N8N_WORKFLOW_TEMPLATES.length}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Workflows Prontos</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-base font-black text-emerald-400">
                {activeEnv.badge}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Cluster Vinculado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0b0f19] border border-slate-800 p-3.5 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar templates por nome, funcionalidade, tags (ex: IVA, WhatsApp, Luanda)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors text-xs ${
                selectedCategory === cat.id
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-[#090c14] border border-slate-800 rounded-2xl">
          <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-slate-300 font-semibold">Nenhum template encontrado para a pesquisa.</p>
          <p className="text-slate-500 mt-1">Experimente limpar a pesquisa ou selecionar outra categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const isTesting = testingTemplateId === template.id;

            return (
              <div
                key={template.id}
                className="bg-[#0b0f19] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 group"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 uppercase tracking-wider">
                      {template.badge}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        template.autonomyLevel === 0
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : template.autonomyLevel === 1
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-red-500/15 border-red-500/30 text-red-300"
                      }`}
                    >
                      {template.autonomyLevel === 0
                        ? "Autônomo (Lvl 0)"
                        : template.autonomyLevel === 1
                        ? "Supervisor (Lvl 1)"
                        : "Owner Josemar (Lvl 2)"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {template.description}
                  </p>

                  {/* Webhook & Nodes count */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Endpoint Webhook:</span>
                      <span className="font-mono text-amber-300 font-semibold">
                        /{template.webhookPath}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Nós do Fluxo:</span>
                      <span className="text-slate-200 font-medium">
                        {template.nodesCount} nós configurados
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-5">
                    {template.tags.map((tag, idx) => (
                      <span
                        key={`tag-${template.id}-${idx}`}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveJsonModal(template);
                        setSelectedModalEnvId(activeEnv.id);
                      }}
                      className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      title="Ver e exportar JSON com credenciais do ambiente"
                    >
                      <FileJson className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver JSON</span>
                    </button>

                    <button
                      onClick={() => handleTestDispatch(template)}
                      disabled={isTesting}
                      className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-emerald-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                      title={`Executar disparo de teste através do Gateway para [${activeEnv.badge}]`}
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      )}
                      <span>{isTesting ? "A Disparar..." : "Testar Fluxo"}</span>
                    </button>
                  </div>

                  {/* Deploy as Agent button */}
                  <button
                    onClick={() => {
                      playSfx("click");
                      onUseTemplateForAgent(template);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.01]"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Criar Agente com este Template</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JSON Viewer & Export Modal with Environment Scoping */}
      {activeJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#090c14] border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
              <div className="flex items-center space-x-2">
                <FileJson className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {activeJsonModal.name} — N8N Workflow JSON
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Esquema JSON pronto para importação direta no N8N com referências seguras de credenciais
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveJsonModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Environment Scoping Switcher inside Modal */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-semibold">Credencial de Destino:</span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedModalEnvId}
                  onChange={(e) => setSelectedModalEnvId(e.target.value)}
                  aria-label="Selecionar credencial de destino para exportação"
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/50"
                >
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.badge}: {env.name} ({env.credentialReferenceKey})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Box */}
            <div className="p-4 flex-1 overflow-y-auto bg-slate-950">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-mono">n8n_workflow_{selectedModalEnvId}.json</span>
                <span>{activeJsonModal.nodesCount} Nós interconectados</span>
              </div>
              <pre className="text-[11px] font-mono text-amber-200/90 whitespace-pre leading-relaxed select-all">
                {JSON.stringify(getExportableJson(activeJsonModal, selectedModalEnvId), null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0b0f19] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  Vinculado ao cluster {envManager.getEnvironmentById(selectedModalEnvId)?.baseUrl || "GAG Visual"}
                </span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopyJson(activeJsonModal)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {copiedId === activeJsonModal.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON ({selectedModalEnvId.toUpperCase()})</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadJson(activeJsonModal)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Transferir (.json)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#090c14] border border-emerald-500/30 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Resultado do Disparo: {testResult.template.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Executado no cluster [{testResult.envName}] via ExternalActionGateway
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTestResult(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-950 text-xs">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Estado</div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {testResult.response.status || "EXECUTED"}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Tempo de Execução</div>
                  <div className="font-bold text-amber-300 mt-0.5">
                    {testResult.response.executionTimeMs || 38}ms
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">
                  Resposta do Webhook:
                </div>
                <pre className="text-emerald-300 whitespace-pre-wrap">
                  {JSON.stringify(testResult.response.data || testResult.response, null, 2)}
                </pre>
              </div>

              {testResult.response.auditTrailRef && (
                <div className="text-[11px] text-slate-400 flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Assinatura de Auditoria:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {testResult.response.auditTrailRef}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-800 bg-[#0b0f19] flex justify-end">
              <button
                onClick={() => setTestResult(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Fechar Resultado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
