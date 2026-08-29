/**
 * GAG CORE OS — FASE 2: CAPABILITY REGISTRY
 * Registers, resolves, and validates all core domain capabilities.
 */

import { CapabilityDefinition } from "./capabilityTypes";

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, CapabilityDefinition> = new Map();

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
      CapabilityRegistry.instance.initializeCoreCapabilities();
    }
    return CapabilityRegistry.instance;
  }

  private initializeCoreCapabilities(): void {
    const list: CapabilityDefinition[] = [
      {
        id: "orchestration",
        name: "General Master Orchestration",
        description: "Coordenação global de execução, triagem de intenções e supervisão.",
        domain: "orchestration",
        requiredSkills: ["goal-analysis", "task-planning", "agent-routing"],
        requiredTools: ["agent-supervisor", "task-orchestrator", "execution-engine"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "planning",
        name: "DAG Task Planning",
        description: "Planeamento e decomposição de objetivos em passos interdependentes.",
        domain: "orchestration",
        requiredSkills: ["task-planning"],
        requiredTools: ["task-orchestrator"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "delegation",
        name: "Specialist Delegation & Routing",
        description: "Roteamento e despacho de metas para o agente mais qualificado.",
        domain: "orchestration",
        requiredSkills: ["agent-routing"],
        requiredTools: ["agent-supervisor", "handoff-manager"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "quality-control",
        name: "Quality Assurance & Evaluation",
        description: "Auditoria multidimensional de qualidade de entregáveis.",
        domain: "orchestration",
        requiredSkills: ["qa-review"],
        requiredTools: ["qa-engine"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "execution-monitoring",
        name: "Execution Pipeline Telemetry",
        description: "Monitoramento contínuo de integridade e auditoria SHA-256.",
        domain: "orchestration",
        requiredSkills: ["execution-monitoring"],
        requiredTools: ["audit-manager"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "agent-architecture",
        name: "AI Agent Architecture & Design",
        description: "Engenharia de novos agentes, personas e especificações de RBAC.",
        domain: "architecture",
        requiredSkills: ["agent-design"],
        requiredTools: ["agent-manager"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "prompt-engineering",
        name: "System Prompt Engineering",
        description: "Engenharia de prompts de precisão e calibração de modelos.",
        domain: "architecture",
        requiredSkills: ["prompt-architecture"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "strategy",
        name: "Strategic Business Consulting",
        description: "Consultoria estratégica, diagnósticos corporativos e posicionamento.",
        domain: "strategy",
        requiredSkills: ["business-strategy"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "market-analysis",
        name: "Market Intelligence & Competitor Analysis",
        description: "Análise de mercado, concorrência e identificação de oportunidades.",
        domain: "strategy",
        requiredSkills: ["market-analysis"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "business-analysis",
        name: "Business Model & Value Proposition",
        description: "Formulação de modelos de negócio, precificação e proposição de valor.",
        domain: "strategy",
        requiredSkills: ["business-strategy"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "document-processing",
        name: "Document Ingestion & OCR Extraction",
        description: "Ingestão, classificação e extração de entidades estruturadas.",
        domain: "document",
        requiredSkills: ["document-classification", "data-extraction"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "ocr",
        name: "Intelligent Optical Character Recognition",
        description: "Extração textual e estruturação de dados de documentos físicos.",
        domain: "document",
        requiredSkills: ["data-extraction"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "education",
        name: "Pedagogy & Team Training",
        description: "Formação de equipas, elaboração de planos curriculares e tutoria.",
        domain: "pedagogy",
        requiredSkills: ["lesson-design"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "art-direction",
        name: "Luxury Visual Art Direction",
        description: "Direção artística, identidade visual e conceitos criativos de luxo.",
        domain: "visual",
        requiredSkills: ["creative-concept", "storyboard"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "visual-design",
        name: "Visual & Storyboard Design",
        description: "Design visual e sequenciamento cinemático de cenas.",
        domain: "visual",
        requiredSkills: ["storyboard"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "copywriting",
        name: "High-Converting Copywriting",
        description: "Redação publicitária persuasiva, storytelling e headlines de venda.",
        domain: "copywriting",
        requiredSkills: ["sales-copy"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "automation",
        name: "Workflow & Webhook Automation",
        description: "Automação de fluxos de dados, pipelines e integrações.",
        domain: "automation",
        requiredSkills: ["workflow-design"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "infrastructure",
        name: "Networks & Infrastructure Operations",
        description: "Topologia de rede, diagnósticos de conectividade e cibersegurança.",
        domain: "infrastructure",
        requiredSkills: ["infrastructure-analysis"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "avatar-production",
        name: "Digital Avatars & Generative Video",
        description: "Geração de avatares com consistência visual e prompts Veo.",
        domain: "avatar",
        requiredSkills: ["creative-concept"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "branding",
        name: "Brand Kits & Visual Manuals",
        description: "Estratégia de marca, manuais de identidade e paletas.",
        domain: "branding",
        requiredSkills: ["brand-strategy"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "marketing",
        name: "Paid Traffic & Growth Campaigns",
        description: "Gestão de campanhas digitais, funis e projeção de ROAS.",
        domain: "marketing",
        requiredSkills: ["campaign-strategy"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
      {
        id: "support",
        name: "Customer Operations & CRM Management",
        description: "Triagem de leads, gestão de CRM e atendimento ao cliente.",
        domain: "support",
        requiredSkills: ["lead-management"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      },
    ];

    for (const item of list) {
      this.capabilities.set(item.id, item);
    }
  }

  public register(cap: CapabilityDefinition): void {
    this.capabilities.set(cap.id, cap);
  }

  public get(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  public getAll(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  public find(predicate: (c: CapabilityDefinition) => boolean): CapabilityDefinition[] {
    return this.getAll().filter(predicate);
  }

  public has(id: string): boolean {
    return this.capabilities.has(id);
  }

  public validate(id: string): { isValid: boolean; error?: string } {
    const cap = this.capabilities.get(id);
    if (!cap) {
      return { isValid: false, error: `Capacidade não encontrada: '${id}'` };
    }
    if (!cap.enabled) {
      return { isValid: false, error: `Capacidade '${id}' está desativada no registro.` };
    }
    return { isValid: true };
  }

  public resolveDependencies(capabilityIds: string[]): {
    skills: string[];
    tools: string[];
  } {
    const skillsSet = new Set<string>();
    const toolsSet = new Set<string>();

    for (const cid of capabilityIds) {
      const cap = this.capabilities.get(cid);
      if (cap && cap.enabled) {
        cap.requiredSkills.forEach((s) => skillsSet.add(s));
        cap.requiredTools.forEach((t) => toolsSet.add(t));
      }
    }

    return {
      skills: Array.from(skillsSet),
      tools: Array.from(toolsSet),
    };
  }
}

export const capabilityRegistry = CapabilityRegistry.getInstance();
