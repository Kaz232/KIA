/**
 * GAG CORE OS — FASE 2: AGENT CAPABILITY MAP
 * Strict matrix mapping each of the 13 GAG Agents to their exact authorized
 * capabilities, skills, and tools.
 */

export interface AgentCapabilityMapping {
  agentId: string;
  name: string;
  role: string;
  capabilities: string[];
  skills: string[];
  tools: string[];
}

export const AGENT_CAPABILITY_MAP: Record<string, AgentCapabilityMapping> = {
  "agent-kia": {
    agentId: "agent-kia",
    name: "KIA (Assistente Central & Orquestradora)",
    role: "Assistente Central, Gestão do Sistema & Orquestradora",
    capabilities: [
      "orchestration",
      "planning",
      "delegation",
      "quality-control",
      "execution-monitoring",
    ],
    skills: [
      "goal-analysis",
      "task-planning",
      "agent-routing",
      "execution-monitoring",
      "qa-review",
    ],
    tools: [
      "task-orchestrator",
      "agent-supervisor",
      "qa-engine",
      "execution-engine",
      "audit-manager",
      "knowledge-base",
    ],
  },
  "agent-soba": {
    agentId: "agent-soba",
    name: "O Soba",
    role: "Arquitetura de Agentes & Prompt Engineering",
    capabilities: [
      "agent-architecture",
      "prompt-engineering",
    ],
    skills: [
      "agent-design",
      "prompt-architecture",
    ],
    tools: [
      "agent-manager",
      "knowledge-base",
    ],
  },
  "agent-consultant": {
    agentId: "agent-consultant",
    name: "Consultor GAG",
    role: "Estratégia & Inteligência de Mercado",
    capabilities: [
      "strategy",
      "market-analysis",
      "business-analysis",
    ],
    skills: [
      "market-analysis",
      "business-strategy",
    ],
    tools: [
      "knowledge-base",
      "task-manager",
    ],
  },
  "agent-scanner": {
    agentId: "agent-scanner",
    name: "Scanner Documental",
    role: "Documentos & OCR Inteligente",
    capabilities: [
      "document-processing",
      "ocr",
    ],
    skills: [
      "document-classification",
      "data-extraction",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-educator": {
    agentId: "agent-educator",
    name: "Professor & Mestre Pedagógico",
    role: "Formação & Educação da Equipa",
    capabilities: [
      "education",
    ],
    skills: [
      "lesson-design",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-art-director": {
    agentId: "agent-art-director",
    name: "Diretor de Arte & Motion Veo",
    role: "Direção de Arte & Criação Visual",
    capabilities: [
      "art-direction",
      "visual-design",
    ],
    skills: [
      "creative-concept",
      "storyboard",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-copywriter": {
    agentId: "agent-copywriter",
    name: "Copywriter & Estrategista de Conteúdo",
    role: "Copywriting & Storytelling Persuasivo",
    capabilities: [
      "copywriting",
    ],
    skills: [
      "sales-copy",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-automation-kaza": {
    agentId: "agent-automation-kaza",
    name: "Arquiteto de Automação Kaza Core",
    role: "Automação de Fluxos & Integração Kaza",
    capabilities: [
      "automation",
    ],
    skills: [
      "workflow-design",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-infra-network": {
    agentId: "agent-infra-network",
    name: "Analista de Infraestrutura e Redes",
    role: "Infraestrutura, Redes & Cisco",
    capabilities: [
      "infrastructure",
    ],
    skills: [
      "infrastructure-analysis",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-avatar-veo": {
    agentId: "agent-avatar-veo",
    name: "Diretor de Avatares e IA Generativa",
    role: "Avatares Digitais & Veo 3",
    capabilities: [
      "avatar-production",
      "visual-design",
    ],
    skills: [
      "creative-concept",
      "storyboard",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-brandkit": {
    agentId: "agent-brandkit",
    name: "Estrategista de Brand Kits GAG",
    role: "Branding & Brand Kits",
    capabilities: [
      "branding",
    ],
    skills: [
      "brand-strategy",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-campaigns": {
    agentId: "agent-campaigns",
    name: "Gestor de Campanhas Digitais",
    role: "Campanhas, Tráfego Pago & Performance",
    capabilities: [
      "marketing",
    ],
    skills: [
      "campaign-strategy",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-support-ops": {
    agentId: "agent-support-ops",
    name: "Engenheiro de Processos de Suporte",
    role: "Suporte, CRM & Operações de Atendimento",
    capabilities: [
      "support",
    ],
    skills: [
      "lead-management",
    ],
    tools: [
      "knowledge-base",
    ],
  },
  "agent-sales-whatsapp": {
    agentId: "agent-sales-whatsapp",
    name: "Especialista Comercial & Fecho de Vendas (WhatsApp)",
    role: "Fechador Comercial High-Ticket & Conversão WhatsApp",
    capabilities: [
      "sales",
      "communication",
      "lead-qualification",
      "deal-closing",
    ],
    skills: [
      "sales-copy",
      "lead-management",
    ],
    tools: [
      "knowledge-base",
      "task-manager",
    ],
  },
};

export class AgentCapabilityMapService {
  /**
   * Retrieves mapped metadata for an agent.
   */
  public static getMapping(agentId: string): AgentCapabilityMapping | undefined {
    return AGENT_CAPABILITY_MAP[agentId];
  }

  /**
   * Checks if an agent has a specific capability.
   */
  public static hasCapability(agentId: string, capabilityId: string): boolean {
    const mapping = this.getMapping(agentId);
    return mapping ? mapping.capabilities.includes(capabilityId) : false;
  }

  /**
   * Checks if an agent possesses a specific skill.
   */
  public static hasSkill(agentId: string, skillId: string): boolean {
    const mapping = this.getMapping(agentId);
    return mapping ? mapping.skills.includes(skillId) : false;
  }

  /**
   * Checks if an agent is authorized to use a tool.
   */
  public static hasTool(agentId: string, toolId: string): boolean {
    const mapping = this.getMapping(agentId);
    return mapping ? mapping.tools.includes(toolId) : false;
  }
}
