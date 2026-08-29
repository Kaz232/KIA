// Natural Voice Command & Speech Interpretation Engine for GAG Core / KIA
import { NavigationTab, TaskPriority } from "../types";

export interface ParsedVoiceCommand {
  matched: boolean;
  intent: "NAVIGATE" | "CREATE_TASK" | "SYSTEM_STATUS" | "CLEAR_CHAT" | "AUDIO_CONTROL" | "SEARCH_KNOWLEDGE" | "GENERAL_CHAT";
  actionType?: string;
  targetTab?: NavigationTab;
  taskData?: {
    title: string;
    priority: TaskPriority;
    category: string;
  };
  searchQuery?: string;
  voiceFeedback?: string;
  audioAction?: "STOP" | "ENABLE_VOICE" | "DISABLE_VOICE";
  rawTranscript: string;
  cleanedPrompt: string;
}

// Normalize text: lowercase, remove accents for robust matching
export function normalizeVoiceText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,?!;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Interpret spoken natural language in Portuguese and determine if it is an immediate OS command
 * or a conversational query for the KIA brain.
 */
export function interpretVoiceCommand(transcript: string): ParsedVoiceCommand {
  const raw = transcript.trim();
  const normalized = normalizeVoiceText(raw);

  // Strip leading trigger words ("kia", "ei kia", "ola kia", "por favor kia")
  let stripped = normalized
    .replace(/^(ei|ola|ouca|por favor|comando)?\s*kia\s*,?\s*/i, "")
    .replace(/^(por favor|podes|quero que)\s+/i, "")
    .trim();

  // 1. Audio Control Commands
  if (
    stripped === "silencio" ||
    stripped === "para" ||
    stripped === "parar" ||
    stripped === "para de falar" ||
    stripped === "parar audio" ||
    stripped === "parar voz" ||
    stripped === "mudo"
  ) {
    return {
      matched: true,
      intent: "AUDIO_CONTROL",
      audioAction: "STOP",
      voiceFeedback: "",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  if (
    stripped.includes("ativar voz") ||
    stripped.includes("ligar voz") ||
    stripped.includes("ativar leitura") ||
    stripped.includes("fala comigo")
  ) {
    return {
      matched: true,
      intent: "AUDIO_CONTROL",
      audioAction: "ENABLE_VOICE",
      voiceFeedback: "Leitura de voz da KIA ativada.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  if (
    stripped.includes("desativar voz") ||
    stripped.includes("desligar voz") ||
    stripped.includes("desativar leitura") ||
    stripped.includes("modo silencioso")
  ) {
    return {
      matched: true,
      intent: "AUDIO_CONTROL",
      audioAction: "DISABLE_VOICE",
      voiceFeedback: "Leitura de voz desativada.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // 2. Navigation Commands
  // Scanner
  if (
    stripped.includes("ir para o scanner") ||
    stripped.includes("abrir scanner") ||
    stripped.includes("vai para o scanner") ||
    stripped.includes("digitalizar documento") ||
    stripped.includes("scanner documental") ||
    stripped.includes("analisar documento") ||
    stripped.includes("abrir o scanner") ||
    stripped === "scanner"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "scanner",
      voiceFeedback: "A abrir o Scanner Documental.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Tasks / Backlog
  if (
    stripped.includes("ir para tarefas") ||
    stripped.includes("vai para tarefas") ||
    stripped.includes("abrir tarefas") ||
    stripped.includes("ver tarefas") ||
    stripped.includes("mostrar tarefas") ||
    stripped.includes("abrir backlog") ||
    stripped.includes("ir para o backlog") ||
    stripped.includes("abrir kanban") ||
    stripped.includes("ver o kanban") ||
    stripped === "tarefas"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "tasks",
      voiceFeedback: "A abrir o painel de Tarefas e Backlog.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Dashboard / Início
  if (
    stripped.includes("ir para o dashboard") ||
    stripped.includes("vai para o dashboard") ||
    stripped.includes("abrir dashboard") ||
    stripped.includes("ir para o inicio") ||
    stripped.includes("voltar ao inicio") ||
    stripped.includes("painel principal") ||
    stripped.includes("ver painel") ||
    stripped === "dashboard" ||
    stripped === "inicio"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "dashboard",
      voiceFeedback: "A abrir o Painel Principal do GAG Core.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Knowledge Base
  if (
    stripped.includes("ir para a base de conhecimento") ||
    stripped.includes("vai para a base de conhecimento") ||
    stripped.includes("abrir base de conhecimento") ||
    stripped.includes("abrir manuais") ||
    stripped.includes("ver documentacao") ||
    stripped.includes("abrir wiki") ||
    stripped.includes("knowledge base") ||
    stripped === "conhecimento"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "knowledge",
      voiceFeedback: "A abrir a Base de Conhecimento.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Calendar / Agenda
  if (
    stripped.includes("ir para o calendario") ||
    stripped.includes("vai para o calendario") ||
    stripped.includes("abrir calendario") ||
    stripped.includes("abrir agenda") ||
    stripped.includes("ver agenda") ||
    stripped.includes("mostrar eventos") ||
    stripped.includes("ver calendario") ||
    stripped === "calendario" ||
    stripped === "agenda"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "calendar",
      voiceFeedback: "A abrir o Calendário Operacional.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Agent Factory / Agents
  if (
    stripped.includes("ir para os agentes") ||
    stripped.includes("vai para os agentes") ||
    stripped.includes("abrir agentes") ||
    stripped.includes("fabrica de agentes") ||
    stripped.includes("agent factory") ||
    stripped.includes("ver equipa de agentes") ||
    stripped === "agentes"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "agents",
      voiceFeedback: "A abrir a Fábrica de Agentes Especializados.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Skills
  if (
    stripped.includes("ir para as skills") ||
    stripped.includes("vai para as skills") ||
    stripped.includes("abrir skills") ||
    stripped.includes("ver skills") ||
    stripped.includes("habilidades") ||
    stripped === "skills"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "skills",
      voiceFeedback: "A abrir as Skills Operacionais.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Audit Logs
  if (
    stripped.includes("ir para auditoria") ||
    stripped.includes("vai para auditoria") ||
    stripped.includes("abrir auditoria") ||
    stripped.includes("ver logs") ||
    stripped.includes("registos de auditoria") ||
    stripped === "auditoria"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "audit",
      voiceFeedback: "A abrir os Registos de Auditoria Imutáveis.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // Settings / Configurações
  if (
    stripped.includes("ir para as definicoes") ||
    stripped.includes("vai para as definicoes") ||
    stripped.includes("abrir definicoes") ||
    stripped.includes("abrir configuracoes") ||
    stripped.includes("ir para configuracoes") ||
    stripped.includes("ajustes") ||
    stripped === "definicoes" ||
    stripped === "configuracoes"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "settings",
      voiceFeedback: "A abrir as Definições do Sistema.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // KIA Chat / Terminal
  if (
    stripped.includes("ir para o chat") ||
    stripped.includes("vai para o chat") ||
    stripped.includes("abrir terminal") ||
    stripped.includes("abrir chat") ||
    stripped.includes("falar com a kia") ||
    stripped === "chat" ||
    stripped === "terminal"
  ) {
    return {
      matched: true,
      intent: "NAVIGATE",
      targetTab: "kia",
      voiceFeedback: "A abrir o Terminal KIA.",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // 3. Clear Chat / Reset Session
  if (
    stripped.includes("limpar conversa") ||
    stripped.includes("limpar chat") ||
    stripped.includes("apagar historico") ||
    stripped.includes("reiniciar conversa") ||
    stripped.includes("novo chat") ||
    stripped.includes("comecar de novo")
  ) {
    return {
      matched: true,
      intent: "CLEAR_CHAT",
      voiceFeedback: "Histórico reinicializado. Como posso ajudar agora?",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // 4. System Status Briefing
  if (
    stripped.includes("como esta o sistema") ||
    stripped.includes("status do sistema") ||
    stripped.includes("relatorio do sistema") ||
    stripped.includes("resumo do dia") ||
    stripped.includes("estado operacional") ||
    stripped.includes("relatorio rapido") ||
    stripped.includes("qual e o status")
  ) {
    return {
      matched: true,
      intent: "SYSTEM_STATUS",
      rawTranscript: raw,
      cleanedPrompt: raw,
    };
  }

  // 5. Create Task Command
  const taskPatterns = [
    /^(?:cria|criar|adiciona|adicionar|nova|regista|registar|agenda|agendar)\s+(?:uma\s+)?tarefa(?:\s+(?:chamada|intitulada|para|de))?\s+(.+)$/i,
    /^(?:lembra-me de|lembrar de|lembre-me de|agendar tarefa para|apontar tarefa|colocar no backlog)\s+(.+)$/i,
    /^(?:cria|criar|adiciona|adicionar)\s+(.+)\s+no\s+(?:backlog|kanban|tarefas)$/i,
  ];

  for (const pattern of taskPatterns) {
    const match = stripped.match(pattern);
    if (match && match[1]) {
      let taskTitle = match[1].trim();
      // Capitalize first letter
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
      const isUrgent = stripped.includes("urgente") || stripped.includes("critica") || stripped.includes("prioridade alta");
      
      return {
        matched: true,
        intent: "CREATE_TASK",
        taskData: {
          title: taskTitle,
          priority: isUrgent ? "HIGH" : "MEDIUM",
          category: "Voz Operacional",
        },
        voiceFeedback: `Tarefa "${taskTitle}" registada no Backlog com prioridade ${isUrgent ? "alta" : "média"}.`,
        rawTranscript: raw,
        cleanedPrompt: raw,
      };
    }
  }

  // 6. Otherwise: Forward directly to KIA AI Conversational Engine
  return {
    matched: false,
    intent: "GENERAL_CHAT",
    rawTranscript: raw,
    cleanedPrompt: raw,
  };
}
