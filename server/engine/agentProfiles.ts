/**
 * KIA — AGENT PROFILES
 *
 * Perfis declarativos dos agentes.
 *
 * IMPORTANTE:
 * Um agente não pode alterar o próprio perfil
 * nem as próprias permissões através deste módulo.
 */

import {
  AgentCapability,
  CapabilityPolicy,
} from "./types";

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: CapabilityPolicy;
  immutable: true;
}

const GAG_PROGRAMMER_CAPABILITIES: AgentCapability[] = [
  "READ",
  "WRITE",
  "EDIT",
  "CORRECT",
  "REVIEW",
  "READ_CODE",
  "WRITE_CODE",
  "EDIT_CODE",
  "RUN_TESTS",
];

export const GAG_PROGRAMMER_ENGINEER: AgentProfile = {
  id: "gag-programmer-engineer",
  name: "Programador/Engenheiro GAG",
  role: "ENGINEER",
  description:
    "Agente responsável por programação, engenharia de software, debugging, manutenção, testes, revisão técnica e automação do ecossistema GAG.",
  capabilities: {
    allowed: GAG_PROGRAMMER_CAPABILITIES,
    denied: ["DEPLOY"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_KIA: AgentProfile = {
  id: "agent-kia",
  name: "KIA (Assistente Central & Orquestradora)",
  role: "ORCHESTRATOR",
  description: "Assistente Central, Gestão do Sistema e Orquestradora Geral.",
  capabilities: {
    allowed: [
      "READ",
      "WRITE",
      "EDIT",
      "CORRECT",
      "REVIEW",
      "SEND",
      "RUN_TESTS",
      "READ_CODE",
    ],
    denied: ["DEPLOY"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_SOCIAL_MEDIA: AgentProfile = {
  id: "agent-social-media",
  name: "Gestor de Redes Sociais & Conteúdo",
  role: "SOCIAL_MEDIA",
  description: "Gestão estratégica de tráfego, postagens e engajamento orgânico/pago.",
  capabilities: {
    allowed: ["READ", "WRITE", "EDIT", "REVIEW", "SEND"],
    denied: ["DEPLOY", "WRITE_CODE", "EDIT_CODE"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_VIDEO_VEO: AgentProfile = {
  id: "agent-video-veo",
  name: "Especialista em Vídeo IA (Veo 3.1)",
  role: "VIDEO_PRODUCER",
  description: "Criação de prompts cinematográficos, storyboards e produção de vídeo com Veo 3.1 e Runway Gen-3.",
  capabilities: {
    allowed: ["READ", "WRITE", "EDIT", "REVIEW"],
    denied: ["DEPLOY", "WRITE_CODE"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_COPY_STRATEGIST: AgentProfile = {
  id: "agent-copy-strategist",
  name: "Copywriter & Estrategista de Conteúdo",
  role: "COPYWRITER",
  description: "Copywriting de alta conversão, cartas de vendas, e-mails e scripts.",
  capabilities: {
    allowed: ["READ", "WRITE", "EDIT", "CORRECT", "REVIEW"],
    denied: ["DEPLOY", "WRITE_CODE"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_AUTOMATION_N8N: AgentProfile = {
  id: "agent-automation-n8n",
  name: "Arquiteto de Automações (n8n & Webhooks)",
  role: "AUTOMATION_ARCHITECT",
  description: "Arquitetura de fluxos no n8n, integrações com WhatsApp e webhooks.",
  capabilities: {
    allowed: ["READ", "WRITE", "EDIT", "REVIEW", "READ_CODE", "WRITE_CODE", "EDIT_CODE", "RUN_TESTS"],
    denied: ["DEPLOY"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_FINANCIAL_ANALYST: AgentProfile = {
  id: "agent-financial-analyst",
  name: "Analista Financeiro & Auditor de Custos",
  role: "FINANCIAL_ANALYST",
  description: "Auditoria de DRE, fluxo de caixa em AOA/USD e controlo de margens e despesas.",
  capabilities: {
    allowed: ["READ", "WRITE", "EDIT", "REVIEW", "CORRECT"],
    denied: ["DEPLOY", "WRITE_CODE"],
    ownerOnly: [],
  },
  immutable: true,
};

export const AGENT_SALES_WHATSAPP: AgentProfile = {
  id: "agent-sales-whatsapp",
  name: "Especialista Comercial & Fecho de Vendas (WhatsApp)",
  role: "SALES_CLOSER",
  description: "Fechador comercial high-ticket e conversão em tempo real no WhatsApp.",
  capabilities: {
    allowed: ["READ", "WRITE", "EDIT", "REVIEW", "SEND"],
    denied: ["DEPLOY", "WRITE_CODE"],
    ownerOnly: [],
  },
  immutable: true,
};

export const SYSTEM_AGENT_PROFILES: AgentProfile[] = [
  GAG_PROGRAMMER_ENGINEER,
  AGENT_KIA,
  AGENT_SOCIAL_MEDIA,
  AGENT_VIDEO_VEO,
  AGENT_COPY_STRATEGIST,
  AGENT_AUTOMATION_N8N,
  AGENT_FINANCIAL_ANALYST,
  AGENT_SALES_WHATSAPP,
];

/**
 * Obtém um perfil de agente.
 */
export function getAgentProfile(
  agentId: string,
): AgentProfile | undefined {
  return SYSTEM_AGENT_PROFILES.find(
    (agent) => agent.id === agentId,
  );
}

/**
 * Verifica se o agente pode executar
 * uma determinada capacidade.
 */
export function agentHasCapability(
  agentId: string,
  capability: AgentCapability,
): boolean {
  const profile =
    getAgentProfile(agentId);

  if (!profile) {
    return false;
  }

  return profile.capabilities.allowed.includes(
    capability,
  );
}
