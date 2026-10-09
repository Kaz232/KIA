import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Wand2,
  Trash2,
  X,
  FileCode,
  Shield,
  Layers,
  Cpu,
  RefreshCw,
  FolderPlus,
  Play,
  CheckSquare,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { KnowledgeCategory, KnowledgeItem } from "../types";
import { skillRegistry } from "../registry/skillRegistry";

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  status: "PENDING" | "PARSED" | "INTEGRATED";
  suggestedCategory: KnowledgeCategory;
  assignedAgentId: string;
  assignedAgentName: string;
  extractedTitle: string;
  extractedSummary: string;
  executableToolName?: string;
  previewUrl?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNotice: (msg: string) => void;
}

export const KnowledgeBatchIngestionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccessNotice,
}) => {
  const {
    addKnowledgeItem,
    createTask,
    executeTaskWithAgent,
    currentUser,
    agents,
    recordAuditLog,
  } = useApp();

  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [activeTab, setActiveTab] = useState<"UPLOAD" | "PASTE">("UPLOAD");
  const [pastedText, setPastedText] = useState("");
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedCategory, setPastedCategory] = useState<KnowledgeCategory>("INTERNAL_PROCESS");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process raw files into QueuedFiles
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newQueued: QueuedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file-${Date.now()}-${i}`;
      let textContent = "";
      let previewUrl: string | undefined = undefined;

      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
        textContent = `[Ativo Visual / Imagem de Marca Oficial: ${file.name}]\nFormato: ${file.type}, Tamanho: ${(file.size / 1024).toFixed(1)} KB.\nContém elementos visuais, paleta de cores ou logotipo oficial GAG Visual.`;
      } else {
        try {
          textContent = await file.text();
        } catch (e) {
          textContent = `Conteúdo do documento ${file.name} (Tamanho: ${file.size} bytes). Processado para extração semântica e operacional.`;
        }
      }

      // Smart Agent & Category Detection based on filename and content
      const lower = (file.name + " " + textContent).toLowerCase();
      let cat: KnowledgeCategory = "INTERNAL_PROCESS";
      let agentId = "agent-kia";
      let agentName = "KIA (Assistente Mestre)";
      let toolName = "skill-operacoes-gag";

      if (lower.includes("logo") || lower.includes("marca") || lower.includes("identidade") || lower.includes("ecossistema k") || lower.includes("branding") || lower.includes("foto")) {
        cat = "BRANDING";
        agentId = "agent-art-director";
        agentName = "Diretor de Arte (Design)";
        toolName = "skill-brand-guidelines-k";
      } else if (lower.includes("venda") || lower.includes("prospeccao") || lower.includes("pop-mkt") || lower.includes("comercial") || lower.includes("tob") || lower.includes("socrática")) {
        cat = "CLIENT_PLAYBOOK";
        agentId = "agent-kia";
        agentName = "KIA (Comercial Mestre)";
        toolName = "skill-vendas-tob-whatsapp";
      } else if (lower.includes("fiscal") || lower.includes("dre") || lower.includes("balancete") || lower.includes("fatura") || lower.includes("imposto") || lower.includes("nif") || lower.includes("auditoria")) {
        cat = "TECHNICAL";
        agentId = "agent-scanner";
        agentName = "Scanner Financeiro & OCR";
        toolName = "skill-auditoria-fiscal-angola";
      } else if (lower.includes("gileade") || lower.includes("estatistica") || lower.includes("operacional") || lower.includes("manual")) {
        cat = "INTERNAL_PROCESS";
        agentId = "agent-software-engineer";
        agentName = "Engenheiro de Software";
        toolName = "skill-gestao-gileade-estatistica";
      } else if (lower.includes("automacao") || lower.includes("n8n") || lower.includes("webhook") || lower.includes("api")) {
        cat = "AUTOMATION";
        agentId = "agent-automation-n8n";
        agentName = "Engenheiro de Automação n8n";
        toolName = "skill-webhook-automation";
      }

      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

      newQueued.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || "text/plain",
        content: textContent,
        status: "PARSED",
        suggestedCategory: cat,
        assignedAgentId: agentId,
        assignedAgentName: agentName,
        extractedTitle: cleanTitle.toUpperCase(),
        extractedSummary: textContent.slice(0, 240) + (textContent.length > 240 ? "..." : ""),
        executableToolName: toolName,
        previewUrl,
      });
    }

    setQueuedFiles((prev) => [...prev, ...newQueued]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // 1. Transform into Knowledge Item
  const handleTransformToKnowledge = (file: QueuedFile) => {
    addKnowledgeItem({
      title: file.extractedTitle,
      category: file.suggestedCategory,
      content: file.content,
      tags: ["anexo-lote", file.suggestedCategory.toLowerCase(), "gag-visual"],
      status: "APPROVED",
      source: `Ficheiro: ${file.name}`,
      version: "1.0.0",
      owner: currentUser.name,
    });

    recordAuditLog(
      `Conhecimento Ingerido: ${file.extractedTitle}`,
      "system",
      "SUCCESS",
      `Ficheiro ${file.name} integrado na Base de Conhecimento pela equipa.`
    );

    setQueuedFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: "INTEGRATED" } : f))
    );

    onSuccessNotice(`"${file.extractedTitle}" adicionado à Base de Conhecimento!`);
  };

  // 2. Transform into Executable Tool / Skill
  const handleTransformToSkill = (file: QueuedFile) => {
    const skillId = (file.executableToolName || `skill-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    
    // Register dynamic skill into skillRegistry
    skillRegistry.register({
      id: skillId,
      name: file.extractedTitle,
      description: `Ferramenta operacional autônoma derivada do conhecimento: "${file.extractedTitle}". Especialista designado: ${file.assignedAgentName}.`,
      category: "domain",
      version: "1.0.0",
      status: "AVAILABLE",
      requiredCapabilities: ["orchestration"],
      requiredTools: ["knowledge-base"],
      inputSchema: {
        type: "object",
        properties: { query: { type: "string" }, context: { type: "string" } },
        required: ["query"],
      },
      outputSchema: {
        type: "object",
        properties: { deliverable: { type: "string" }, status: { type: "string" } },
      },
      riskLevel: "LOW",
      enabled: true,
      handler: (input) => {
        return {
          success: true,
          skillId,
          output: `### 🛠️ Execução da Ferramenta ${file.extractedTitle}\n\n**Consulta:** ${input.query || "Execução solicitada"}\n**Diretriz de Base:** ${file.content.slice(0, 300)}...\n\n✅ Execução autônoma de acordo com as regras operacionais GAG Visual.`,
          data: { query: input.query, status: "SUCCESS" },
          metadata: {
            durationMs: 35,
            executedByAgent: file.assignedAgentName,
            timestamp: new Date().toISOString(),
            riskLevel: "LOW",
          },
        };
      },
    });

    recordAuditLog(
      `Nova Ferramenta/Skill Criada: ${skillId}`,
      "agent",
      "SUCCESS",
      `Skill gerada automaticamente a partir de "${file.name}" para o agente ${file.assignedAgentName}.`
    );

    onSuccessNotice(`Nova Ferramenta "${skillId}" registada no motor dos agentes!`);
  };

  // 3. Transform into Actionable Task for Assigned Agent
  const handleTransformToTask = (file: QueuedFile) => {
    createTask({
      title: `Operacionalizar: ${file.extractedTitle}`,
      description: `Tarefa autônoma para aplicar o conhecimento do arquivo "${file.name}".\n\nDiretrizes:\n${file.content.slice(0, 400)}`,
      status: "TODO",
      priority: "HIGH",
      category: "OPERATIONAL",
      assignedAgentId: file.assignedAgentId,
      tags: ["anexo-lote", file.suggestedCategory.toLowerCase()],
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    onSuccessNotice(`Tarefa criada e delegada para ${file.assignedAgentName}!`);
  };

  // 4. Batch Process All Files with Full Agent Autonomy
  const handleProcessAllBatch = async (autoExecute: boolean = false) => {
    if (queuedFiles.length === 0) return;
    setIsProcessingBatch(true);

    let processedCount = 0;
    const generatedTaskIds: string[] = [];

    for (const file of queuedFiles) {
      if (file.status === "INTEGRATED") continue;

      // Add to Knowledge
      addKnowledgeItem({
        title: file.extractedTitle,
        category: file.suggestedCategory,
        content: file.content,
        tags: ["anexo-lote", file.suggestedCategory.toLowerCase(), "equipa-autonoma"],
        status: "APPROVED",
        source: `Lote: ${file.name}`,
        version: "1.0.0",
        owner: currentUser.name,
      });

      // Register Tool / Skill
      const skillId = (file.executableToolName || `skill-${Date.now()}-${processedCount}`).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      skillRegistry.register({
        id: skillId,
        name: file.extractedTitle,
        description: `Skill derivada do documento "${file.name}".`,
        category: "domain",
        version: "1.0.0",
        status: "AVAILABLE",
        requiredCapabilities: ["orchestration"],
        requiredTools: ["knowledge-base"],
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
        outputSchema: {
          type: "object",
          properties: { output: { type: "string" } },
        },
        riskLevel: "LOW",
        enabled: true,
        handler: (input) => ({
          success: true,
          skillId,
          output: `Entregável autônomo baseado em ${file.extractedTitle}: ${input.query || "Processamento concluído."}`,
          data: { status: "SUCCESS" },
          metadata: {
            durationMs: 40,
            executedByAgent: file.assignedAgentName,
            timestamp: new Date().toISOString(),
            riskLevel: "LOW",
          },
        }),
      });

      // Create Task
      createTask({
        title: `Implementar: ${file.extractedTitle}`,
        description: `Execução autônoma do conhecimento "${file.name}". Agente encarregado: ${file.assignedAgentName}.\n\nResumo:\n${file.extractedSummary}`,
        status: "TODO",
        priority: "HIGH",
        category: "OPERATIONAL",
        assignedAgentId: file.assignedAgentId,
        tags: ["autonomia", file.suggestedCategory.toLowerCase()],
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });

      processedCount++;
    }

    recordAuditLog(
      `Ingestão em Lote Concluída: ${processedCount} Ficheiros`,
      "system",
      "SUCCESS",
      `A equipa absorveu ${processedCount} documentos, registou as respectivas ferramentas e abriu as tarefas operacionais correspondentes.`
    );

    setIsProcessingBatch(false);
    onSuccessNotice(`Equipa processou com sucesso ${processedCount} ficheiro(s) em lote!`);
    setQueuedFiles([]);
    onClose();
  };

  // Handle Quick Paste
  const handleAddPastedContent = () => {
    if (!pastedTitle.trim() || !pastedText.trim()) return;

    const fileId = `paste-${Date.now()}`;
    setQueuedFiles((prev) => [
      ...prev,
      {
        id: fileId,
        name: `${pastedTitle.trim()}.txt`,
        size: pastedText.length,
        type: "text/plain",
        content: pastedText.trim(),
        status: "PARSED",
        suggestedCategory: pastedCategory,
        assignedAgentId: "agent-kia",
        assignedAgentName: "KIA (Assistente Mestre)",
        extractedTitle: pastedTitle.trim().toUpperCase(),
        extractedSummary: pastedText.trim().slice(0, 200) + "...",
        executableToolName: `skill-${pastedTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      },
    ]);

    setPastedTitle("");
    setPastedText("");
    setActiveTab("UPLOAD");
    onSuccessNotice("Documento de texto adicionado à fila para a equipa!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#080b12] border border-blue-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#090e1a] via-[#0b1324] to-[#090e1a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Anexar Conhecimento em Lote
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Equipa Autónoma
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Carregue múltiplos arquivos de uma vez. Os agentes leem, categorizam, transformam em ferramentas e executam tarefas.
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-6 bg-[#07090f]">
          <button
            onClick={() => setActiveTab("UPLOAD")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "UPLOAD"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Múltiplos Ficheiros ({queuedFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PASTE")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "PASTE"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Colar Texto ou Diretriz</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === "UPLOAD" ? (
            <>
              {/* Drag and Drop Zone with Multiple File Support */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
                    : "border-slate-700/80 hover:border-blue-500/50 bg-[#0a0f1d]/50 hover:bg-[#0a0f1d]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.json,.csv,.xlsx,.png,.jpg,.jpeg,.webp,.svg"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  Arraste vários ficheiros para aqui ou clique para selecionar
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Pode anexar <span className="text-blue-400 font-bold">múltiplos documentos de uma só vez</span>: Manuais (PDF/Word), Playbooks de Vendas, Notas Fiscais, Imagens e Ativos de Marca (PNG/JPG).
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Seleção múltipla ativa
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Suporta PDF, TXT, DOCX, CSV, PNG, JPG
                  </span>
                </div>
              </div>

              {/* Queued Documents List */}
              {queuedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Documentos Carregados ({queuedFiles.length})
                      </h4>
                    </div>

                    <button
                      onClick={() => setQueuedFiles([])}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Limpar Fila
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {queuedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 rounded-xl bg-[#0a0e19] border border-slate-800/90 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          {file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="w-12 h-12 rounded-lg object-contain bg-slate-900 border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="text-xs font-bold text-white truncate max-w-sm">
                                {file.extractedTitle}
                              </h5>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                {file.suggestedCategory}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                              {file.extractedSummary}
                            </p>

                            <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-blue-400">
                              <Cpu className="w-3 h-3" />
                              <span>Especialista sugerido: <strong>{file.assignedAgentName}</strong></span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                        </div>

                        {/* Transformation Action Buttons */}
                        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleTransformToKnowledge(file)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                            title="Guardar como Artigo na Base"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Base</span>
                          </button>

                          <button
                            onClick={() => handleTransformToSkill(file)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                            title="Transformar em Ferramenta/Skill para Agentes"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>Ferramenta</span>
                          </button>

                          <button
                            onClick={() => handleTransformToTask(file)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                            title="Criar Tarefa no Backlog"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>Tarefa</span>
                          </button>

                          <button
                            onClick={() => removeQueuedFile(file.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Quick Paste Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Título do Documento / Diretriz
                </label>
                <input
                  type="text"
                  placeholder="Ex: MANUAL DE ATENDIMENTO TOB 2026..."
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Categoria Inicial
                </label>
                <select
                  value={pastedCategory}
                  onChange={(e) => setPastedCategory(e.target.value as KnowledgeCategory)}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="BRANDING">Branding & Identidade</option>
                  <option value="CLIENT_PLAYBOOK">Playbooks Comerciais & Vendas</option>
                  <option value="INTERNAL_PROCESS">Processos Internos & Operações</option>
                  <option value="TECHNICAL">Técnico & Engenharia</option>
                  <option value="AUTOMATION">Automação de Processos</option>
                  <option value="DESIGN_AI">Design & IA Visual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Conteúdo do Conhecimento
                </label>
                <textarea
                  rows={8}
                  placeholder="Cole aqui o texto, regras ou manual para os agentes absorverem..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                onClick={handleAddPastedContent}
                disabled={!pastedTitle.trim() || !pastedText.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Adicionar à Fila de Ingestão da Equipa</span>
              </button>
            </div>
          )}

          {/* Autonomy Badge Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-950/40 border border-blue-500/30 flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block">
                Autoridade Operacional da Equipa Ativa:
              </span>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Ao clicar em "Processar Todos em Lote", a equipa autónoma não necessita da sua supervisão para micro-decisões: ela classifica o conteúdo, cria os registos na base, programa as ferramentas e atribui as tarefas aos agentes especialistas automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-[#07090f] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {queuedFiles.length > 0 ? (
              <span>
                <strong>{queuedFiles.length}</strong> ficheiro(s) prontos para a equipa
              </span>
            ) : (
              <span>Nenhum ficheiro na fila no momento</span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={() => handleProcessAllBatch(false)}
              disabled={queuedFiles.length === 0 || isProcessingBatch}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            >
              {isProcessingBatch ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Equipa a Processar...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>⚡ Processar Todos em Lote (Equipa Real)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
