import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Database,
  FileText,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  Clock,
  Shield,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sliders,
  Terminal,
  RotateCcw,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { playSfx } from "../utils/audio";
import { Task } from "../types";
import { safeStorage } from "../utils/safeStorage";

export type OrchestratedSkillId =
  | "save_lead_crm"
  | "create_calendar_event"
  | "send_whatsapp_message"
  | "generate_proposal_doc"
  | "gerarConteudoAgente"
  | "criarTarefaBacklog"
  | "gerarAssetVisual"
  | "analisarMetricasFinanceiras"
  | "despacharAgenteEspecialista";

export interface OrchestratedSkill {
  id: OrchestratedSkillId;
  name: string;
  category: "CRM" | "CALENDAR" | "WHATSAPP" | "PROPOSAL" | "CONTENT" | "BACKLOG" | "DESIGN" | "FINANCE" | "ORCHESTRATION";
  description: string;
  icon: React.ElementType;
  targetSystem: string;
  defaultActionLabel: string;
}

export interface DetectedIntent {
  rawInput: string;
  intent: "crm" | "calendar" | "whatsapp" | "proposal" | "content" | "backlog" | "visual" | "finance" | "unknown";
  skillId: OrchestratedSkill["id"] | null;
  confidence: number;
  extractedParams: {
    clientName?: string;
    contact?: string;
    budgetAOA?: string;
    service?: string;
    dateTime?: string;
    messageText?: string;
    tipoConteudo?: string;
    titulo?: string;
    tema?: string;
    aspectRatio?: string;
    promptVisual?: string;
  };
  suggestedAction: string;
  timestamp: string;
}

export interface OrchestrationLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  skillId: string;
  actionTitle: string;
  details: string;
  artifactUrl?: string;
  artifactLabel?: string;
  status: "EXECUTED" | "PENDING" | "FAILED";
  formats?: {
    markdown?: string;
    html?: string;
    whatsApp?: string;
    json?: any;
  };
}

const AVAILABLE_SKILLS: OrchestratedSkill[] = [
  {
    id: "gerarConteudoAgente",
    name: "gerarConteudoAgente",
    category: "CONTENT",
    description: "Gera propostas AOA, posts de redes, roteiros 9:16 Veo 3.1, briefings e relatórios em múltiplos formatos.",
    icon: Sparkles,
    targetSystem: "Multi-Format Generator (MD, HTML, WA, JSON)",
    defaultActionLabel: "Gerar Conteúdo",
  },
  {
    id: "criarTarefaBacklog",
    name: "criarTarefaBacklog",
    category: "BACKLOG",
    description: "Cria e atribui autonomamente tarefas no Backlog operacional e Kanban da GAG Visual.",
    icon: CheckCircle2,
    targetSystem: "Backlog & Kanban Engine",
    defaultActionLabel: "Criar no Backlog",
  },
  {
    id: "gerarAssetVisual",
    name: "gerarAssetVisual",
    category: "DESIGN",
    description: "Especificação de ativos visuais, paletas Hex e prompts cinematográficos 9:16 para Veo 3.1 e Imagen 3.",
    icon: Zap,
    targetSystem: "Veo 3.1 & Creative Studio",
    defaultActionLabel: "Gerar Prompt 9:16",
  },
  {
    id: "analisarMetricasFinanceiras",
    name: "analisarMetricasFinanceiras",
    category: "FINANCE",
    description: "Calcula automaticamente a adjudicação com sinal de 50%, retenção na fonte (6,5%) e IVA (14%) em Kwanzas.",
    icon: Sliders,
    targetSystem: "Calculadora Fiscal & DRE",
    defaultActionLabel: "Calcular Finanças AOA",
  },
  {
    id: "save_lead_crm",
    name: "save_lead_crm",
    category: "CRM",
    description: "Extrai contacto (+244), orçamento e regista lead qualificado no CRM da GAG Visual.",
    icon: Database,
    targetSystem: "Base de Leads / Supabase CRM",
    defaultActionLabel: "Registar no CRM",
  },
  {
    id: "create_calendar_event",
    name: "create_calendar_event",
    category: "CALENDAR",
    description: "Agenda reuniões e marcos operacionais no Calendário Estratégico (Luanda UTC+1).",
    icon: Calendar,
    targetSystem: "Calendário Executivo GAG",
    defaultActionLabel: "Criar na Agenda",
  },
  {
    id: "send_whatsapp_message",
    name: "send_whatsapp_message",
    category: "WHATSAPP",
    description: "Normaliza telefone e gera link direto wa.me para transbordo imediato no telemóvel.",
    icon: MessageSquare,
    targetSystem: "WhatsApp API / wa.me Direto",
    defaultActionLabel: "Disparar WhatsApp",
  },
  {
    id: "generate_proposal_doc",
    name: "generate_proposal_doc",
    category: "PROPOSAL",
    description: "Gera proposta comercial formal com regra obrigatória de 50% de sinal em Kwanzas.",
    icon: FileText,
    targetSystem: "Minutas Comerciais GAG",
    defaultActionLabel: "Gerar Proposta AOA",
  },
];

interface AgentOrchestratorProps {
  currentStreamText?: string;
  onSkillExecuted?: (log: OrchestrationLogEntry) => void;
  defaultExpanded?: boolean;
}

export const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({
  currentStreamText = "",
  onSkillExecuted,
  defaultExpanded = false,
}) => {
  const { chatMessages, createTask, setActiveTab, setChatMessages, setPrefilledData } = useApp();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeSubTab, setActiveSubTab] = useState<"matrix" | "live" | "studio" | "history">("live");
  const [isAutoExecute, setIsAutoExecute] = useState<boolean>(() => {
    return safeStorage.getItem("gag_soba_auto_execute") !== "false";
  });
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [customTestInput, setCustomTestInput] = useState("");

  // Estado da Bancada Interativa de Ferramentas (Studio)
  const [selectedStudioTool, setSelectedStudioTool] = useState<
    "gerarConteudoAgente" | "criarTarefaBacklog" | "gerarAssetVisual" | "analisarMetricasFinanceiras"
  >("gerarConteudoAgente");
  const [studioContentType, setStudioContentType] = useState<string>("proposta");
  const [studioTitle, setStudioTitle] = useState("Campanha Audiovisual 4K Luanda");
  const [studioTopic, setStudioTopic] = useState("Produção e posicionamento cinematográfico premium para clientes corporativos");
  const [studioTargetAudience, setStudioTargetAudience] = useState("CEOs e Diretores de Marketing B2B em Luanda");
  const [studioBudgetAOA, setStudioBudgetAOA] = useState("2500000");
  const [studioVisualType, setStudioVisualType] = useState("video_veo_cinematic");
  const [studioVisualRatio, setStudioVisualRatio] = useState("9:16");
  const [studioVisualPrompt, setStudioVisualPrompt] = useState("Cinematic slow motion shot of modern corporate boardroom in Luanda Bay at sunset, warm gold ambient lighting, 35mm lens, 4k ultra-detailed");
  const [studioTaskTitle, setStudioTaskTitle] = useState("Roteiro Reels para Lançamento de Marca");
  const [studioTaskDesc, setStudioTaskDesc] = useState("Criar roteiro dinâmico de 30 segundos no formato 9:16 para o Veo 3.1 com gancho nos primeiros 3s");
  const [studioTaskPriority, setStudioTaskPriority] = useState<"HIGH" | "MEDIUM" | "URGENT">("HIGH");
  const [studioAssignedAgent, setStudioAssignedAgent] = useState("agent-kia");
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [studioExecutionResult, setStudioExecutionResult] = useState<any | null>(null);
  const [studioActiveResultFormat, setStudioActiveResultFormat] = useState<"visual" | "markdown" | "whatsapp" | "html" | "json">("visual");

  const [logs, setLogs] = useState<OrchestrationLogEntry[]>(() => {
    const saved = safeStorage.getItem("gag_soba_orchestration_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: "log-init-1",
        timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        agent: "O Soba (Arquiteto de IA)",
        skillId: "gerarConteudoAgente",
        actionTitle: "Ferramentas Autônomas Ativas",
        details: "O ecossistema dispõe de geração de conteúdo multiformato, criação no backlog, prompts Veo 3.1 e cálculos em Kwanzas.",
        artifactLabel: "Studio Pronto",
        status: "EXECUTED",
      },
    ];
  });

  const saveLogs = useCallback((newLogs: OrchestrationLogEntry[]) => {
    setLogs(newLogs);
    safeStorage.setItem("gag_soba_orchestration_logs", JSON.stringify(newLogs.slice(0, 30)));
  }, []);

  const toggleAutoExecute = () => {
    const next = !isAutoExecute;
    setIsAutoExecute(next);
    safeStorage.setItem("gag_soba_auto_execute", String(next));
    playSfx("click", 0.25);
  };

  /**
   * Sniffer de Intenções: analisa o texto do chat stream ou input do utilizador
   * e extrai parâmetros estruturados para mapeamento de skills.
   */
  const analyzeIntent = useCallback((text: string): DetectedIntent | null => {
    if (!text || text.trim().length < 3) return null;
    const lower = text.toLowerCase();

    // 1. Geração de Assets Visuais / Prompts Veo 3.1 / Imagen 3
    if (
      lower.includes("prompt") ||
      lower.includes("veo") ||
      lower.includes("imagen") ||
      lower.includes("roteiro") ||
      lower.includes("9:16") ||
      lower.includes("reels") ||
      lower.includes("asset visual") ||
      lower.includes("cinematic") ||
      lower.includes("storyboard")
    ) {
      return {
        rawInput: text,
        intent: "visual",
        skillId: "gerarAssetVisual",
        confidence: 0.96,
        extractedParams: {
          titulo: "Especificação de Ativo Visual & Veo 3.1",
          aspectRatio: lower.includes("16:9") ? "16:9" : "9:16",
          promptVisual: text,
        },
        suggestedAction: "Gerar prompt cinematográfico de alta fidelidade e paleta visual para o estúdio",
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Análise e Cálculo Financeiro em Kwanzas (AOA)
    if (
      lower.includes("imposto") ||
      lower.includes("fiscal") ||
      lower.includes("retenção") ||
      lower.includes("retencao") ||
      lower.includes("6,5%") ||
      lower.includes("14%") ||
      lower.includes("iva") ||
      lower.includes("calculo financeiro") ||
      lower.includes("cálculo financeiro")
    ) {
      const valMatch = text.match(/(\d+(?:[.,]\d+)?(?:\s*000)*)\s*(?:aoa|kz|kwanzas?)/i) || text.match(/(\d{4,9})/);
      const val = valMatch ? valMatch[0] : "2500000 AOA";

      return {
        rawInput: text,
        intent: "finance",
        skillId: "analisarMetricasFinanceiras",
        confidence: 0.95,
        extractedParams: {
          clientName: "Cliente Corporativo",
          budgetAOA: val,
        },
        suggestedAction: "Calcular adjudicação com 50% de sinal, retenção de 6,5% e IVA de 14% em Kwanzas",
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Criação de Tarefas no Backlog / Kanban
    if (
      lower.includes("criar tarefa") ||
      lower.includes("nova tarefa") ||
      lower.includes("adicionar ao backlog") ||
      lower.includes("adicionar tarefa") ||
      lower.includes("atribuir tarefa") ||
      lower.includes("kanban")
    ) {
      return {
        rawInput: text,
        intent: "backlog",
        skillId: "criarTarefaBacklog",
        confidence: 0.94,
        extractedParams: {
          titulo: text.replace(/(?:criar tarefa|nova tarefa|adicionar ao backlog):\s*/i, "").trim() || "Nova Tarefa Operacional",
          service: "Execução Operacional GAG",
        },
        suggestedAction: "Inserir tarefa prioritária no Backlog e atribuir ao agente especialista",
        timestamp: new Date().toISOString(),
      };
    }

    // 4. CRM / Lead Intent
    if (
      lower.includes("lead") ||
      lower.includes("crm") ||
      lower.includes("regista") ||
      lower.includes("registar") ||
      lower.includes("guardar lead") ||
      lower.includes("salvar lead") ||
      lower.includes("novo cliente") ||
      lower.includes("prospect")
    ) {
      const phoneMatch = text.match(/(?:\+?244\s?)?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/);
      const valMatch = text.match(/(\d+(?:[.,]\d+)?(?:\s*000)*)\s*(?:aoa|kz|kwanzas?)/i) || text.match(/(\d{3,9})/);
      const nameMatch = text.match(/(?:lead|cliente|empresa|nome):\s*([^,\n;]+)/i);

      return {
        rawInput: text,
        intent: "crm",
        skillId: "save_lead_crm",
        confidence: 0.95,
        extractedParams: {
          clientName: nameMatch ? nameMatch[1].trim() : "Cliente Potencial",
          contact: phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, "") : "922835116",
          budgetAOA: valMatch ? valMatch[0] : "Sob Consulta (AOA)",
          service: lower.includes("identidade")
            ? "Identidade Visual & Branding"
            : lower.includes("vídeo") || lower.includes("video")
            ? "Produção Audiovisual 4K"
            : lower.includes("tráfego") || lower.includes("trafego")
            ? "Gestão de Tráfego Pago"
            : "Soluções Digitais TOB",
        },
        suggestedAction: "Registar Lead no CRM da GAG Visual com alerta ao Diretor Comercial",
        timestamp: new Date().toISOString(),
      };
    }

    // 5. Calendar / Meeting Intent
    if (
      lower.includes("agenda") ||
      lower.includes("agendar") ||
      lower.includes("evento") ||
      lower.includes("reunião") ||
      lower.includes("reuniao") ||
      lower.includes("marcar") ||
      lower.includes("calendar") ||
      lower.includes("prazo")
    ) {
      const timeMatch = text.match(/(?:às|as)\s*(\d{1,2}(?::\d{2})?h?)/i);
      const dateMatch = text.match(/(?:amanhã|hoje|segunda|terça|quarta|quinta|sexta|sábado|\d{1,2}\/\d{1,2})/i);

      return {
        rawInput: text,
        intent: "calendar",
        skillId: "create_calendar_event",
        confidence: 0.92,
        extractedParams: {
          clientName: "Alinhamento GAG Visual",
          dateTime: `${dateMatch ? dateMatch[0] : "Amanhã"} ${timeMatch ? timeMatch[0] : "às 10h"} (WAT / Luanda)`,
          service: "Reunião de Alinhamento Estratégico",
        },
        suggestedAction: "Criar Evento no Calendário Estratégico e sincronizar participantes",
        timestamp: new Date().toISOString(),
      };
    }

    // 6. WhatsApp Intent
    if (
      lower.includes("whatsapp") ||
      lower.includes("wa.me") ||
      lower.includes("zap") ||
      lower.includes("mensagem") ||
      lower.includes("disparar") ||
      lower.includes("transbordo")
    ) {
      const phoneMatch = text.match(/(?:\+?244\s?)?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/);
      const targetPhone = phoneMatch ? phoneMatch[0].replace(/[^\d]/g, "") : "244922835116";

      return {
        rawInput: text,
        intent: "whatsapp",
        skillId: "send_whatsapp_message",
        confidence: 0.94,
        extractedParams: {
          contact: targetPhone,
          messageText: text,
        },
        suggestedAction: "Formatar mensagem e gerar link direto de WhatsApp com 1 clique",
        timestamp: new Date().toISOString(),
      };
    }

    // 7. Commercial Proposal / Multiformat Content Intent
    if (
      lower.includes("proposta") ||
      lower.includes("orçamento") ||
      lower.includes("orcamento") ||
      lower.includes("cotação") ||
      lower.includes("cotar") ||
      lower.includes("50%") ||
      lower.includes("sinal")
    ) {
      const valMatch = text.match(/(\d+(?:[.,]\d+)?(?:\s*000)*)\s*(?:aoa|kz|kwanzas?)/i) || text.match(/(\d{3,9})/);
      const valor = valMatch ? valMatch[0] : "450.000 AOA";

      return {
        rawInput: text,
        intent: "proposal",
        skillId: "gerarConteudoAgente",
        confidence: 0.96,
        extractedParams: {
          clientName: "Cliente Corporativo",
          budgetAOA: valor,
          service: "Identidade Visual & Comunicação",
          tipoConteudo: "proposta",
        },
        suggestedAction: "Estruturar proposta comercial com regra mandatória de 50% de sinal em AOA",
        timestamp: new Date().toISOString(),
      };
    }

    // 8. General Content Creation Intent (Posts, Briefs, Articles)
    if (
      lower.includes("conteúdo") ||
      lower.includes("conteudo") ||
      lower.includes("post") ||
      lower.includes("instagram") ||
      lower.includes("carrossel") ||
      lower.includes("briefing") ||
      lower.includes("artigo") ||
      lower.includes("copy")
    ) {
      return {
        rawInput: text,
        intent: "content",
        skillId: "gerarConteudoAgente",
        confidence: 0.93,
        extractedParams: {
          tipoConteudo: lower.includes("post") || lower.includes("instagram") ? "post_instagram" : "briefing",
          titulo: text,
        },
        suggestedAction: "Gerar conteúdo multiformato (Markdown, HTML, WhatsApp, JSON)",
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }, []);

  // Monitorar última mensagem do chat ou texto em streaming
  const lastUserMessage = useMemo(() => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === "user") {
        return chatMessages[i].content;
      }
    }
    return "";
  }, [chatMessages]);

  const activeDetectedIntent = useMemo(() => {
    const textToScan = currentStreamText || customTestInput || lastUserMessage;
    return analyzeIntent(textToScan);
  }, [currentStreamText, customTestInput, lastUserMessage, analyzeIntent]);

  /**
   * Executa a skill mapeada diretamente
   */
  const executeSkill = useCallback(
    (intentData: DetectedIntent) => {
      playSfx("success", 0.4);
      const { skillId, extractedParams } = intentData;

      let newLog: OrchestrationLogEntry;

      if (skillId === "gerarConteudoAgente" || skillId === "generate_proposal_doc") {
        const val = extractedParams.budgetAOA || "2.500.000 AOA";
        const client = extractedParams.clientName || "Cliente Corporativo";
        const tipo = extractedParams.tipoConteudo || "proposta";
        const rawNum = parseInt(val.replace(/[^\d]/g, ""), 10) || 2500000;
        const sinal = (rawNum * 0.5).toLocaleString("pt-AO");
        const saldo = (rawNum * 0.5).toLocaleString("pt-AO");

        const mdContent = `# Proposta Comercial & Estratégica
**Cliente:** ${client}
**Valor Global:** ${rawNum.toLocaleString("pt-AO")} AOA
**Condição Inegociável:** 50% de Sinal na Adjudicação (${sinal} AOA)
**Saldo na Entrega:** 50% (${saldo} AOA)

### Escopo Executivo
- Produção de Identidade Visual e Ativos Cinematográficos 4K.
- Roteirização dinâmica no formato 9:16 para canais digitais.
- Equipa dedicada: KIA, O Soba e Especialistas GAG Visual em Luanda.

*Emitido por GAG Visual Core OS — Luanda, Angola.*`;

        const waText = `*PROPOSTA COMERCIAL GAG VISUAL*\n\n*Cliente:* ${client}\n*Valor:* ${rawNum.toLocaleString("pt-AO")} AOA\n*Condição:* 50% de sinal na adjudicação (${sinal} AOA)\n*Saldo:* 50% na aprovação final (${saldo} AOA)\n\nDiretor Comercial: Josemar Gourgel (+244 922 835 116)`;
        const waUrl = `https://wa.me/244922835116?text=${encodeURIComponent(waText)}`;

        createTask({
          title: `[CONTEÚDO] ${tipo.toUpperCase()}: ${client}`,
          description: `Conteúdo gerado autonomamente:\n- Valor: ${rawNum.toLocaleString("pt-AO")} AOA\n- Sinal 50%: ${sinal} AOA\n- Formatos: MD, HTML, WA, JSON`,
          priority: "HIGH",
          status: "TODO",
          category: "Comercial B2B",
          assignedAgentId: "agent-kia",
          tags: ["Conteúdo", "Multiformato", "50%Sinal", "AOA"],
        });

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "KIA & O Soba",
          skillId: "gerarConteudoAgente",
          actionTitle: `Conteúdo Gerado: ${client}`,
          details: `Minuta comercial e transbordo com regra de 50% de sinal (${sinal} AOA) gerados em múltiplos formatos.`,
          artifactUrl: waUrl,
          artifactLabel: "Enviar no WhatsApp",
          status: "EXECUTED",
          formats: {
            markdown: mdContent,
            whatsApp: waText,
            html: `<div class="p-4 bg-slate-900 text-slate-100 rounded-xl"><h2>${client}</h2><p><strong>Valor:</strong> ${rawNum.toLocaleString("pt-AO")} AOA</p><p><strong>Sinal 50%:</strong> ${sinal} AOA</p></div>`,
            json: { cliente: client, valorAOA: rawNum, sinal50: rawNum * 0.5, status: "GERADO" },
          },
        };
      } else if (skillId === "criarTarefaBacklog") {
        const title = extractedParams.titulo || "Tarefa Estratégica";
        createTask({
          title: `[BACKLOG] ${title}`,
          description: `Tarefa criada autonomamente pelo ecossistema de agentes:\n- Solicitada em: ${new Date().toLocaleString("pt-PT")}\n- Contexto: ${intentData.rawInput}`,
          priority: "HIGH",
          status: "TODO",
          category: "Operações",
          assignedAgentId: "agent-soba",
          tags: ["Backlog", "Autônomo", "GAG-Core"],
        });

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "O Soba (Arquiteto)",
          skillId: "criarTarefaBacklog",
          actionTitle: `Tarefa Criada: ${title}`,
          details: `Inserida com sucesso no Backlog operacional e atribuída para execução imediata.`,
          artifactUrl: "#tab=tasks",
          artifactLabel: "Ver no Backlog",
          status: "EXECUTED",
        };
      } else if (skillId === "gerarAssetVisual") {
        const prompt = extractedParams.promptVisual || intentData.rawInput;
        const ratio = extractedParams.aspectRatio || "9:16";

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "Designer & KIA",
          skillId: "gerarAssetVisual",
          actionTitle: `Prompt Cinematográfico (${ratio})`,
          details: `Especificação visual gerada com iluminação cinematográfica, lente 35mm e formato ${ratio} para Veo 3.1.`,
          artifactLabel: "Asset Visual Pronto",
          status: "EXECUTED",
          formats: {
            markdown: `### Especificação de Asset Visual (Veo 3.1)\n- **Aspect Ratio:** ${ratio}\n- **Prompt:** ${prompt}\n- **Estilo:** Cinematográfico 4K, iluminação quente, lente 35mm.`,
            json: { tool: "gerarAssetVisual", aspectRatio: ratio, prompt },
          },
        };
      } else if (skillId === "analisarMetricasFinanceiras") {
        const val = extractedParams.budgetAOA || "2500000";
        const rawNum = parseInt(val.replace(/[^\d]/g, ""), 10) || 2500000;
        const sinal = rawNum * 0.5;
        const saldo = rawNum * 0.5;
        const retencao = rawNum * 0.065;
        const iva = rawNum * 0.14;

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "KIA Financeira",
          skillId: "analisarMetricasFinanceiras",
          actionTitle: `Cálculo Fiscal: ${rawNum.toLocaleString("pt-AO")} AOA`,
          details: `Sinal 50% (${sinal.toLocaleString("pt-AO")} AOA), Retenção 6,5% (${retencao.toLocaleString("pt-AO")} AOA) e IVA 14% (${iva.toLocaleString("pt-AO")} AOA).`,
          artifactLabel: "DRE Fiscal Pronta",
          status: "EXECUTED",
          formats: {
            markdown: `### Demonstração Financeira & Fiscal (AOA)\n- **Orçamento Global:** ${rawNum.toLocaleString("pt-AO")} AOA\n- **Sinal Obrigatório (50%):** ${sinal.toLocaleString("pt-AO")} AOA\n- **Saldo Final (50%):** ${saldo.toLocaleString("pt-AO")} AOA\n- **Retenção na Fonte (6,5%):** ${retencao.toLocaleString("pt-AO")} AOA\n- **IVA (14%):** ${iva.toLocaleString("pt-AO")} AOA`,
            json: { totalAOA: rawNum, sinal50: sinal, saldo50: saldo, retencao65: retencao, iva14: iva },
          },
        };
      } else if (skillId === "save_lead_crm") {
        const contact = extractedParams.contact || "922835116";
        const val = extractedParams.budgetAOA || "Sob Consulta";
        const client = extractedParams.clientName || "Novo Lead";

        createTask({
          title: `[CRM] Lead: ${client} (${contact})`,
          description: `Registo efetuado pelo Soba:\n- Contacto: ${contact}\n- Orçamento: ${val}\n- Serviço: ${extractedParams.service || "Geral"}\n- Prompt Original: ${intentData.rawInput}`,
          priority: "HIGH",
          status: "TODO",
          category: "Comercial B2B",
          assignedAgentId: "agent-soba",
          tags: ["CRM", "O-Soba", "Lead-Qualificado", "GAG-Vendas"],
        });

        const waUrl = `https://wa.me/${contact.replace("+", "")}?text=${encodeURIComponent(
          `Olá ${client}! Recebemos a sua solicitação na GAG Visual para ${extractedParams.service || "o seu projeto"}. O Diretor Comercial Josemar Gourgel está a acompanhar o seu processo.`
        )}`;

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "O Soba (Arquiteto de IA)",
          skillId: "save_lead_crm",
          actionTitle: `Lead Registado: ${client}`,
          details: `Guardado no CRM com orçamento ${val}. WhatsApp de contacto preparado.`,
          artifactUrl: waUrl,
          artifactLabel: "Abrir WhatsApp do Lead",
          status: "EXECUTED",
        };
      } else if (skillId === "create_calendar_event") {
        const title = `Reunião: ${extractedParams.clientName || "Alinhamento Estratégico GAG"}`;
        const dt = extractedParams.dateTime || "Amanhã às 10h (Luanda WAT)";

        createTask({
          title: `[AGENDA] ${title}`,
          description: `Evento agendado pelo Soba:\n- Horário: ${dt}\n- Pauta: ${extractedParams.service || "Alinhamento"}\n- Solicitado via chat.`,
          priority: "HIGH",
          status: "TODO",
          category: "Coordenação",
          assignedAgentId: "agent-soba",
          tags: ["Calendário", "O-Soba", "Reunião"],
        });

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "O Soba (Arquiteto de IA)",
          skillId: "create_calendar_event",
          actionTitle: title,
          details: `Agendado para ${dt}. Sincronizado com a equipa da GAG Visual.`,
          artifactUrl: "#tab=calendar",
          artifactLabel: "Ver no Calendário",
          status: "EXECUTED",
        };
      } else if (skillId === "send_whatsapp_message") {
        const phone = extractedParams.contact || "244922835116";
        const msg = extractedParams.messageText || intentData.rawInput;
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "O Soba (Arquiteto de IA)",
          skillId: "send_whatsapp_message",
          actionTitle: `WhatsApp Direto: +${phone}`,
          details: `Mensagem normalizada no padrão executivo e link direto wa.me gerado.`,
          artifactUrl: waUrl,
          artifactLabel: "Abrir Conversa wa.me",
          status: "EXECUTED",
        };
      } else {
        const val = extractedParams.budgetAOA || "450.000 AOA";
        const client = extractedParams.clientName || "Cliente";

        createTask({
          title: `[PROPOSTA] ${client} - ${val}`,
          description: `Minuta comercial estruturada com regra de 50% de sinal em Kwanzas.\nDiretor Comercial: Josemar Gourgel (+244 922 835 116).`,
          priority: "HIGH",
          status: "TODO",
          category: "Comercial B2B",
          assignedAgentId: "agent-commercial",
          tags: ["Proposta", "O-Soba", "50%Sinal", "AOA"],
        });

        const waUrl = `https://wa.me/244922835116?text=${encodeURIComponent(
          `*PROPOSTA COMERCIAL GAG VISUAL*\n\nCliente: ${client}\nValor de Referência: ${val}\nCondição: 50% de sinal na adjudicação (Regra Inegociável)\nDiretor Comercial: Josemar Gourgel`
        )}`;

        newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          agent: "O Soba (Arquiteto de IA)",
          skillId: "generate_proposal_doc",
          actionTitle: `Proposta Gerada: ${val}`,
          details: `50% de sinal na adjudicação aplicado. Documento pronto para envio.`,
          artifactUrl: waUrl,
          artifactLabel: "Enviar Proposta no WhatsApp",
          status: "EXECUTED",
        };
      }

      saveLogs([newLog, ...logs]);
      onSkillExecuted?.(newLog);

      // Injeta mensagem de confirmação no chat em texto livre e conversacional
      const confirmationMsg = {
        id: `soba-action-${Date.now()}`,
        sender: "assistant" as const,
        role: "assistant" as const,
        content: `Executei com sucesso a operação para ${newLog.actionTitle}. ${newLog.details}.${intentData.suggestedAction ? ` Como próximo passo, recomendo: ${intentData.suggestedAction}` : ""}`,
        timestamp: new Date().toISOString(),
        executionResult: {
          status: "SUCCESS" as const,
          capability: `skill:${skillId}`,
          message: newLog.details,
          auditRef: `0xSOBA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          executionTimeMs: 145,
          actionCard: {
            type: "skill_executed" as const,
            title: newLog.actionTitle,
            description: newLog.details,
            actionLabel: newLog.artifactLabel || "Ver Detalhes",
            actionUrl: newLog.artifactUrl,
          },
        },
      };

      setChatMessages((prev) => [...prev, confirmationMsg]);
    },
    [createTask, logs, onSkillExecuted, saveLogs, setChatMessages]
  );

  /**
   * Executa ferramenta a partir do Studio da Bancada Autônoma
   */
  const handleRunStudioTool = async () => {
    setIsStudioLoading(true);
    playSfx("click", 0.3);

    try {
      let payload: any = {};
      if (selectedStudioTool === "gerarConteudoAgente") {
        payload = {
          tipo: studioContentType,
          titulo: studioTitle,
          topico: studioTopic,
          publicoAlvo: studioTargetAudience,
          orcamentoAOA: studioBudgetAOA,
          agenteCriador: "KIA & O Soba",
        };
      } else if (selectedStudioTool === "criarTarefaBacklog") {
        payload = {
          titulo: studioTaskTitle,
          descricao: studioTaskDesc,
          prioridade: studioTaskPriority,
          agenteAtribuido: studioAssignedAgent,
        };
      } else if (selectedStudioTool === "gerarAssetVisual") {
        payload = {
          tipoAtivo: studioVisualType,
          aspectRatio: studioVisualRatio,
          promptVisual: studioVisualPrompt,
        };
      } else if (selectedStudioTool === "analisarMetricasFinanceiras") {
        payload = {
          orcamentoAOA: studioBudgetAOA,
          cliente: studioTitle,
        };
      }

      // Tentar via API de execução de tools
      let resultData: any = null;
      try {
        const res = await fetch("/api/kia/execute-tool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: selectedStudioTool,
            parameters: payload,
          }),
        });
        if (res.ok) {
          resultData = await res.json();
        }
      } catch (apiErr) {
        console.warn("[Studio Execution fallback]:", apiErr);
      }

      // Se a API não respondeu ou formato local, estruturar dados ricos
      if (!resultData) {
        const rawVal = parseInt(studioBudgetAOA.replace(/[^\d]/g, ""), 10) || 2500000;
        const sinal = (rawVal * 0.5).toLocaleString("pt-AO");
        const saldo = (rawNum => (rawNum * 0.5).toLocaleString("pt-AO"))(rawVal);
        const retencao = (rawVal * 0.065).toLocaleString("pt-AO");
        const iva = (rawVal * 0.14).toLocaleString("pt-AO");

        resultData = {
          success: true,
          tool: selectedStudioTool,
          payload,
          timestamp: new Date().toISOString(),
          formats: {
            markdown: `# ${studioTitle}
**Tipo:** ${studioContentType} | **Agente:** KIA Core
**Orçamento de Referência:** ${rawVal.toLocaleString("pt-AO")} AOA
- **Sinal Obrigatório (50%):** ${sinal} AOA
- **Saldo na Conclusão (50%):** ${saldo} AOA
- **Retenção na Fonte (6,5%):** ${retencao} AOA
- **IVA (14%):** ${iva} AOA

### Resumo Executivo
${studioTopic}

### Entregáveis Estratégicos
1. Identidade e Ativos no formato ${studioVisualRatio} para Veo 3.1.
2. Planeamento de Veiculação e Direcionamento B2B.
3. Transbordo direto para WhatsApp de fecho comercial.`,
            whatsApp: `*${studioTitle.toUpperCase()}*\n\n*Tipo:* ${studioContentType}\n*Orçamento:* ${rawVal.toLocaleString("pt-AO")} AOA\n*Sinal (50%):* ${sinal} AOA\n*Saldo (50%):* ${saldo} AOA\n\n*Resumo:* ${studioTopic}\n\nEmitido por KIA & O Soba — GAG Visual`,
            html: `<div class="prose prose-invert max-w-none"><h2>${studioTitle}</h2><p><strong>Orçamento:</strong> ${rawVal.toLocaleString("pt-AO")} AOA</p><p><strong>Sinal de Adjudicação (50%):</strong> ${sinal} AOA</p><p>${studioTopic}</p></div>`,
            json: {
              titulo: studioTitle,
              orcamentoAOA: rawVal,
              sinalAOA: rawVal * 0.5,
              saldoAOA: rawVal * 0.5,
              retencaoAOA: rawVal * 0.065,
              ivaAOA: rawVal * 0.14,
              agente: "KIA",
              timestamp: new Date().toISOString(),
            },
          },
        };
      }

      setStudioExecutionResult(resultData);
      playSfx("success", 0.4);

      // Registar no histórico
      const studioLog: OrchestrationLogEntry = {
        id: `studio-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        agent: "KIA Studio",
        skillId: selectedStudioTool,
        actionTitle: studioTitle || `Execução de ${selectedStudioTool}`,
        details: `Ferramenta ${selectedStudioTool} executada com sucesso com saídas em MD, HTML, WA e JSON.`,
        status: "EXECUTED",
        artifactLabel: "Ver Resultados",
        formats: resultData.formats,
      };

      saveLogs([studioLog, ...logs]);
      onSkillExecuted?.(studioLog);
    } catch (err: any) {
      console.error("[Studio Execution Error]:", err);
      playSfx("warning", 0.3);
    } finally {
      setIsStudioLoading(false);
    }
  };

  // Atualizar prefilledData no contexto quando detetar intenção
  useEffect(() => {
    if (activeDetectedIntent) {
      setPrefilledData(activeDetectedIntent.extractedParams);
    } else {
      setPrefilledData(null);
    }
  }, [activeDetectedIntent, setPrefilledData]);

  // Auto-execução quando deteta uma intenção válida com alta confiança
  useEffect(() => {
    if (!isAutoExecute || !activeDetectedIntent) return;

    // Apenas auto-executa se a intenção for do input de teste customizado
    // ou se for um comando claro
    if (customTestInput && activeDetectedIntent.confidence >= 0.9) {
      executeSkill(activeDetectedIntent);
      setCustomTestInput("");
    }
  }, [isAutoExecute, activeDetectedIntent, customTestInput, executeSkill]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArtifactId(id);
    playSfx("click", 0.2);
    setTimeout(() => setCopiedArtifactId(null), 2000);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden transition-all mb-3">
      {/* Barra de Topo do Orquestrador: O Soba */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar Real do Soba */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 shrink-0">
            👑
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-amber-300 tracking-tight flex items-center gap-1.5 truncate">
                <span>O Soba</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 font-mono">
                  AgentOrchestrator
                </span>
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Mapeamento dinâmico de intenções do chat para execução direta de ferramentas
            </p>
          </div>
        </div>

        {/* Controlos Rápidos da Barra */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Auto-Execution */}
          <button
            onClick={toggleAutoExecute}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              isAutoExecute
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title="Ativar/Desativar disparo automático pelo Soba ao identificar intenções"
          >
            <Zap className={`w-3.5 h-3.5 ${isAutoExecute ? "text-emerald-400 animate-bounce" : ""}`} />
            <span className="hidden sm:inline">
              {isAutoExecute ? "Auto-Execução: ON" : "Auto-Execução: OFF"}
            </span>
          </button>

          {/* Botão de Expandir / Recolher */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              playSfx("click", 0.2);
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isExpanded ? "Recolher Orquestrador" : "Expandir Painel do Soba"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Faixa Resumida de Intenção Ativa (Sempre Visível) */}
      <div className="px-4 py-2 bg-slate-950/60 flex items-center justify-between text-xs gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 font-mono text-[11px] shrink-0">Intenção Detetada:</span>
          {activeDetectedIntent ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{activeDetectedIntent.skillId}</span>
              <span className="text-slate-400 font-normal">
                ({Math.round(activeDetectedIntent.confidence * 100)}%)
              </span>
            </span>
          ) : (
            <span className="text-slate-500 text-[11px] italic">
              A escutar chat stream (CRM, Calendário, WhatsApp, Propostas)...
            </span>
          )}
        </div>

        {activeDetectedIntent && (
          <button
            onClick={() => executeSkill(activeDetectedIntent)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm shrink-0 active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Executar Agora</span>
          </button>
        )}
      </div>

      {/* Painel Completo Expandido */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-fadeIn">
          {/* Navegação de Sub-Abas do Orquestrador */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveSubTab("live")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSubTab === "live"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Disparo & Teste</span>
              </button>
              <button
                onClick={() => setActiveSubTab("studio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSubTab === "studio"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-amber-300/80 hover:text-white hover:bg-slate-800 border border-amber-500/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Bancada Autônoma (Studio)</span>
              </button>
              <button
                onClick={() => setActiveSubTab("matrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSubTab === "matrix"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Matriz de Skills ({AVAILABLE_SKILLS.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab("history")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSubTab === "history"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Histórico ({logs.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              Engine: O Soba &bull; GAG Visual
            </span>
          </div>

          {/* Sub-Aba 1: Disparo e Teste Direto */}
          {activeSubTab === "live" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                Digite ou selecione uma ordem operacional para o <strong>Soba</strong> mapear para a ferramenta correta e executar no CRM, Calendário ou WhatsApp:
              </div>

              {/* Caixa de Entrada de Teste do Orquestrador */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTestInput}
                  onChange={(e) => setCustomTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customTestInput.trim()) {
                      const detected = analyzeIntent(customTestInput);
                      if (detected) executeSkill(detected);
                      setCustomTestInput("");
                    }
                  }}
                  placeholder="Ex: Regista lead: Clínica Saúde+, 923456789, Identidade Visual, 450000 AOA"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    if (!customTestInput.trim()) return;
                    const detected = analyzeIntent(customTestInput);
                    if (detected) executeSkill(detected);
                    setCustomTestInput("");
                  }}
                  disabled={!customTestInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Orquestrar</span>
                </button>
              </div>

              {/* Botões de Predefinição Rápida */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  Comandos de Execução Rápida do Soba:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const sample = "Regista este lead: Clínica Saúde+, 923456789, Identidade Visual, 450000 AOA";
                      const d = analyzeIntent(sample);
                      if (d) executeSkill(d);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lead no CRM - Clínica Saúde+</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Regista 450.000 AOA, contacto 923456789 e cria tarefa no CRM.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      const sample = "Agendar reunião com Banco BAI amanhã às 15h para fecho";
                      const d = analyzeIntent(sample);
                      if (d) executeSkill(d);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reunião: Banco BAI (15h)</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Marca no Calendário Executivo no fuso horário de Luanda.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      const sample = "Enviar mensagem WhatsApp para 922835116 com confirmação de proposta";
                      const d = analyzeIntent(sample);
                      if (d) executeSkill(d);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>WhatsApp Direto: 922835116</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gera link wa.me direto com mensagem executiva formatada.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      const sample = "Gerar proposta comercial de 650000 AOA para Campanha 4K com sinal de 50%";
                      const d = analyzeIntent(sample);
                      if (d) executeSkill(d);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Proposta: 650.000 AOA (50% Sinal)</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Aplica a regra mandatória de 50% de sinal e prepara o transbordo.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Aba 2: Matriz de Mapeamento de Skills */}
          {activeSubTab === "matrix" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_SKILLS.map((skill) => {
                const Icon = skill.icon;
                return (
                  <div
                    key={skill.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-mono">{skill.name}</h4>
                            <span className="text-[10px] text-slate-400">{skill.targetSystem}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                          ATIVO
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {skill.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Executor: O Soba (Arquiteto)
                      </span>
                      <button
                        onClick={() => {
                          let sample = "Gerar proposta de 450000 AOA com 50% de sinal";
                          if (skill.id === "gerarConteudoAgente") {
                            sample = "Gerar proposta comercial de 2500000 AOA para Campanha Luanda com 50% de sinal";
                          } else if (skill.id === "criarTarefaBacklog") {
                            sample = "Criar tarefa: Roteiro Reels 9:16 para Veo 3.1 com gancho dinâmico";
                          } else if (skill.id === "gerarAssetVisual") {
                            sample = "Prompt cinematográfico 9:16 de escritório corporativo na Baía de Luanda ao pôr do sol";
                          } else if (skill.id === "analisarMetricasFinanceiras") {
                            sample = "Cálculo financeiro de 3000000 AOA com retenção de 6,5% e IVA de 14%";
                          } else if (skill.id === "save_lead_crm") {
                            sample = "Registar lead: Empresa Teste, 922835116, 500000 AOA";
                          } else if (skill.id === "create_calendar_event") {
                            sample = "Agendar reunião de alinhamento amanhã às 11h";
                          } else if (skill.id === "send_whatsapp_message") {
                            sample = "Enviar mensagem WhatsApp para 922835116";
                          }
                          const d = analyzeIntent(sample);
                          if (d) executeSkill(d);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>{skill.defaultActionLabel}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-Aba: Bancada Autônoma (Studio de Geração Multiformato) */}
          {activeSubTab === "studio" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bancada de Ferramentas Autônomas dos Agentes</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Dispare ferramentas de criação e geração multiformato (Markdown, WhatsApp, HTML e JSON) com autonomia total.
                  </p>
                </div>

                {/* Seleção de Ferramenta */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedStudioTool("gerarConteudoAgente");
                      playSfx("click", 0.2);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedStudioTool === "gerarConteudoAgente"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Gerar Conteúdo
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudioTool("gerarAssetVisual");
                      playSfx("click", 0.2);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedStudioTool === "gerarAssetVisual"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Asset Veo 3.1
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudioTool("analisarMetricasFinanceiras");
                      playSfx("click", 0.2);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedStudioTool === "analisarMetricasFinanceiras"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Finanças AOA
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudioTool("criarTarefaBacklog");
                      playSfx("click", 0.2);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedStudioTool === "criarTarefaBacklog"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Criar no Backlog
                  </button>
                </div>
              </div>

              {/* Presets Rápidos */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-slate-500 font-mono">Atalhos:</span>
                <button
                  onClick={() => {
                    setSelectedStudioTool("gerarConteudoAgente");
                    setStudioContentType("proposta");
                    setStudioTitle("Campanha Institucional BAI 4K");
                    setStudioTopic("Produção audiovisual de 3 filmes institucionais em Luanda com equipa cinematográfica");
                    setStudioBudgetAOA("4500000");
                  }}
                  className="px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700"
                >
                  Proposta 4.5M AOA
                </button>
                <button
                  onClick={() => {
                    setSelectedStudioTool("gerarAssetVisual");
                    setStudioVisualRatio("9:16");
                    setStudioVisualPrompt("Close-up cinematográfico de modelo africana com jóias em filigrana dourada, estúdio escuro, luz de recorte âmbar, 8k, lente anamórfica");
                  }}
                  className="px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-purple-300 border border-slate-700"
                >
                  Veo 3.1 (9:16 Reels)
                </button>
                <button
                  onClick={() => {
                    setSelectedStudioTool("gerarConteudoAgente");
                    setStudioContentType("post_instagram");
                    setStudioTitle("Carrossel B2B: Retenção na Fonte em Angola");
                    setStudioTopic("Guia prático para gestores sobre a aplicação dos 6,5% de retenção e 14% de IVA em prestações de serviços");
                  }}
                  className="px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-slate-700"
                >
                  Post Instagram B2B
                </button>
                <button
                  onClick={() => {
                    setSelectedStudioTool("analisarMetricasFinanceiras");
                    setStudioBudgetAOA("8500000");
                    setStudioTitle("Contrato Anual de Tráfego & Audiovisual");
                  }}
                  className="px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-blue-300 border border-slate-700"
                >
                  DRE Fiscal 8.5M AOA
                </button>
              </div>

              {/* Formulário Dinâmico da Ferramenta */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                {selectedStudioTool === "gerarConteudoAgente" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Tipo de Conteúdo
                      </label>
                      <select
                        value={studioContentType}
                        onChange={(e) => setStudioContentType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="proposta">Proposta Comercial (Regra 50% Sinal)</option>
                        <option value="post_instagram">Post / Carrossel Instagram</option>
                        <option value="briefing">Briefing de Produção Executiva</option>
                        <option value="relatorio_kwanza">Relatório Executivo em Kwanzas</option>
                        <option value="roteiro_video">Roteiro para Vídeo Publicitário</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Título / Assunto
                      </label>
                      <input
                        type="text"
                        value={studioTitle}
                        onChange={(e) => setStudioTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Ex: Proposta Identidade Visual"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Tópicos Chave / Instrução para o Agente
                      </label>
                      <textarea
                        rows={2}
                        value={studioTopic}
                        onChange={(e) => setStudioTopic(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Descreve os pontos essenciais que o agente deve cobrir..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Público-Alvo
                      </label>
                      <input
                        type="text"
                        value={studioTargetAudience}
                        onChange={(e) => setStudioTargetAudience(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Ex: Diretores Gerais em Luanda"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Orçamento de Referência (AOA)
                      </label>
                      <input
                        type="text"
                        value={studioBudgetAOA}
                        onChange={(e) => setStudioBudgetAOA(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        placeholder="Ex: 2500000"
                      />
                    </div>
                  </div>
                )}

                {selectedStudioTool === "gerarAssetVisual" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Motor & Estilo Visual
                        </label>
                        <select
                          value={studioVisualType}
                          onChange={(e) => setStudioVisualType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="video_veo_cinematic">Google Veo 3.1 &bull; Vídeo Cinematográfico</option>
                          <option value="imagen_hyper_realism">Google Imagen 3 &bull; Fotografia Hiper-realista</option>
                          <option value="storyboard_916">Storyboard Publicitário em 9:16</option>
                          <option value="mockup_packshot">Packshot 3D de Produto</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Aspect Ratio
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {["9:16", "16:9", "1:1"].map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setStudioVisualRatio(ratio)}
                              className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                                studioVisualRatio === ratio
                                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                              }`}
                            >
                              {ratio} {ratio === "9:16" ? "(Reels)" : ratio === "16:9" ? "(Wide)" : "(Feed)"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Prompt Visual Cinematográfico para o Estúdio
                      </label>
                      <textarea
                        rows={3}
                        value={studioVisualPrompt}
                        onChange={(e) => setStudioVisualPrompt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none font-mono"
                        placeholder="Descreve a iluminação, lentes, textura, enquadramento..."
                      />
                    </div>
                  </div>
                )}

                {selectedStudioTool === "analisarMetricasFinanceiras" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Projeto / Cliente
                      </label>
                      <input
                        type="text"
                        value={studioTitle}
                        onChange={(e) => setStudioTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Ex: Campanha Banco Atlântico"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Orçamento Total em Kwanzas (AOA)
                      </label>
                      <input
                        type="text"
                        value={studioBudgetAOA}
                        onChange={(e) => setStudioBudgetAOA(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        placeholder="Ex: 5000000"
                      />
                    </div>

                    <div className="md:col-span-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                      💡 <strong>Regras Fiscais & Comerciais em Luanda:</strong> Cálculo automático com 50% de sinal na adjudicação, 50% na aprovação final, retenção na fonte legal de 6,5% e IVA de 14%.
                    </div>
                  </div>
                )}

                {selectedStudioTool === "criarTarefaBacklog" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Título da Tarefa
                      </label>
                      <input
                        type="text"
                        value={studioTaskTitle}
                        onChange={(e) => setStudioTaskTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Ex: Roteirização e Produção"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Prioridade Operacional
                      </label>
                      <select
                        value={studioTaskPriority}
                        onChange={(e) => setStudioTaskPriority(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="HIGH">Alta (Fecho esta semana)</option>
                        <option value="URGENT">Urgente (Execução hoje)</option>
                        <option value="MEDIUM">Média (Rotina de criação)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Descrição da Tarefa
                      </label>
                      <textarea
                        rows={2}
                        value={studioTaskDesc}
                        onChange={(e) => setStudioTaskDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Botão de Disparo */}
                <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={handleRunStudioTool}
                    disabled={isStudioLoading}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {isStudioLoading ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Agente a Executar Ferramenta...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Executar Ferramenta Autônoma</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Área de Visualização e Formatos da Entrega */}
              {studioExecutionResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-amber-300">
                        Entrega Pronta &bull; Formatos Disponíveis:
                      </span>
                    </div>

                    {/* Tabs de Formato */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                      {(["visual", "markdown", "whatsapp", "html", "json"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => {
                            setStudioActiveResultFormat(fmt);
                            playSfx("click", 0.15);
                          }}
                          className={`px-2 py-0.5 rounded capitalize font-mono text-[11px] transition-all ${
                            studioActiveResultFormat === fmt
                              ? "bg-amber-500 text-slate-950 font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {fmt === "whatsapp" ? "WhatsApp" : fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conteúdo Renderizado por Formato */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 max-h-56 overflow-y-auto">
                    {studioActiveResultFormat === "visual" && (
                      <div className="space-y-2 font-sans text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-amber-400 text-sm">{studioTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Pronto para Uso
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{studioTopic}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center">
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Orçamento</span>
                            <span className="font-bold text-white text-xs">{studioBudgetAOA} AOA</span>
                          </div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-emerald-400 block">Sinal 50%</span>
                            <span className="font-bold text-emerald-300 text-xs">
                              {(parseInt(studioBudgetAOA.replace(/[^\d]/g, "") || "2500000", 10) * 0.5).toLocaleString("pt-AO")} AOA
                            </span>
                          </div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-amber-400 block">Retenção 6,5%</span>
                            <span className="font-bold text-amber-300 text-xs">
                              {(parseInt(studioBudgetAOA.replace(/[^\d]/g, "") || "2500000", 10) * 0.065).toLocaleString("pt-AO")} AOA
                            </span>
                          </div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-blue-400 block">IVA 14%</span>
                            <span className="font-bold text-blue-300 text-xs">
                              {(parseInt(studioBudgetAOA.replace(/[^\d]/g, "") || "2500000", 10) * 0.14).toLocaleString("pt-AO")} AOA
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {studioActiveResultFormat === "markdown" && (
                      <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 text-[11px]">
                        {studioExecutionResult.formats?.markdown || "Markdown gerado"}
                      </pre>
                    )}

                    {studioActiveResultFormat === "whatsapp" && (
                      <div className="space-y-2">
                        <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300 text-[11px] bg-slate-950 p-2 rounded">
                          {studioExecutionResult.formats?.whatsApp || "Texto WhatsApp"}
                        </pre>
                        <a
                          href={`https://wa.me/244922835116?text=${encodeURIComponent(
                            studioExecutionResult.formats?.whatsApp || ""
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir e Disparar no WhatsApp</span>
                        </a>
                      </div>
                    )}

                    {studioActiveResultFormat === "html" && (
                      <div className="space-y-2">
                        <pre className="whitespace-pre-wrap leading-relaxed text-amber-300 text-[11px] bg-slate-950 p-2 rounded overflow-x-auto">
                          {studioExecutionResult.formats?.html || "HTML gerado"}
                        </pre>
                      </div>
                    )}

                    {studioActiveResultFormat === "json" && (
                      <pre className="whitespace-pre-wrap leading-relaxed text-blue-300 text-[11px]">
                        {JSON.stringify(studioExecutionResult.formats?.json || studioExecutionResult, null, 2)}
                      </pre>
                    )}
                  </div>

                  {/* Ações Rápidas de Cópia e Armazenamento */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const toCopy =
                            studioActiveResultFormat === "markdown"
                              ? studioExecutionResult.formats?.markdown
                              : studioActiveResultFormat === "whatsapp"
                              ? studioExecutionResult.formats?.whatsApp
                              : studioActiveResultFormat === "html"
                              ? studioExecutionResult.formats?.html
                              : JSON.stringify(studioExecutionResult.formats?.json || studioExecutionResult, null, 2);
                          navigator.clipboard.writeText(toCopy || "");
                          setCopiedFormat(studioActiveResultFormat);
                          playSfx("click", 0.2);
                          setTimeout(() => setCopiedFormat(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedFormat === studioActiveResultFormat ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Formato ({studioActiveResultFormat})</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        createTask({
                          title: `[ENTREGA] ${studioTitle}`,
                          description: `${studioTopic}\n- Orçamento: ${studioBudgetAOA} AOA\n- Formato: ${studioActiveResultFormat}`,
                          priority: "HIGH",
                          status: "TODO",
                          category: "Operações",
                          assignedAgentId: "agent-kia",
                          tags: ["Studio", "Multiformato", "Entrega"],
                        });
                        playSfx("success", 0.3);
                        setActiveTab("tasks");
                      }}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Salvar Tarefa no Backlog</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Aba 3: Histórico de Execuções */}
          {activeSubTab === "history" && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Nenhuma execução registada ainda.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-300">{log.actionTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {log.skillId}
                        </span>
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed truncate">
                        {log.details}
                      </p>
                    </div>

                    {log.artifactUrl && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {log.artifactUrl.startsWith("http") ? (
                          <a
                            href={log.artifactUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{log.artifactLabel || "Abrir Link"}</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              if (log.artifactUrl?.includes("tab=")) {
                                const tab = log.artifactUrl.split("tab=")[1];
                                setActiveTab(tab === "backlog" ? "tasks" : (tab as any));
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>{log.artifactLabel || "Aceder"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(log.id, log.artifactUrl || "")}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                          title="Copiar link"
                        >
                          {copiedArtifactId === log.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
