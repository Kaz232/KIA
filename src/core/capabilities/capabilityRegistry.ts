import { Capability } from "../types";

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, Capability> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  private registerDefaults() {
    const defaultCaps: Capability[] = [
      // 1. INTELLIGENCE
      {
        id: "cap-int-01",
        capability: "intelligence:research",
        category: "INTELLIGENCE",
        implemented: true,
        handler: "skill_research",
        permissions: ["read:knowledge", "query:web"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Pesquisa contextual e cruzamento RAG com a base de dados GAG.",
      },
      {
        id: "cap-int-02",
        capability: "intelligence:decompose_task",
        category: "INTELLIGENCE",
        implemented: true,
        handler: "skill_decompose_task",
        permissions: ["write:tasks"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Decomposição de ordens complexas em etapas sequenciais com dependências.",
      },
      {
        id: "cap-int-03",
        capability: "intelligence:decision_analysis",
        category: "INTELLIGENCE",
        implemented: true,
        handler: "skill_decision_analysis",
        permissions: ["read:knowledge"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Análise multidimensional de decisões corporativas com prós, contras e riscos.",
      },

      // 2. DOCUMENT
      {
        id: "cap-doc-01",
        capability: "document:read_pdf",
        category: "DOCUMENT",
        implemented: true,
        handler: "skill_read_pdf",
        permissions: ["read:documents"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Extração textual e estrutural de ficheiros PDF.",
      },
      {
        id: "cap-doc-02",
        capability: "document:ocr_document",
        category: "DOCUMENT",
        implemented: true,
        handler: "skill_ocr_document",
        permissions: ["read:documents"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Processamento de faturas (ENDE, Unitel, etc.) e extração de entidades fiscais.",
      },
      {
        id: "cap-doc-03",
        capability: "document:create_pdf",
        category: "DOCUMENT",
        implemented: true,
        handler: "skill_create_pdf",
        permissions: ["write:documents"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Geração de relatórios executivos em formato PDF/Markdown estruturado.",
      },

      // 3. DATA & FINANCE
      {
        id: "cap-data-01",
        capability: "data:calculate",
        category: "DATA",
        implemented: true,
        handler: "skill_calculate",
        permissions: ["math:execute"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Cálculos orçamentários, simulações de ROAS e impostos angolanos (IVA, Retenção, IRT).",
      },
      {
        id: "cap-data-02",
        capability: "data:analyze_dataset",
        category: "DATA",
        implemented: true,
        handler: "skill_analyze_dataset",
        permissions: ["read:data"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Análise estatística de dados de conversão e faturamento.",
      },

      // 4. GAG VISUAL & BRANDING
      {
        id: "cap-gag-01",
        capability: "gag:brand_strategy",
        category: "GAG_VISUAL",
        implemented: true,
        handler: "skill_brand_strategy",
        permissions: ["read:brand_manual"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Aplicação da metodologia TOB e posicionamento visual da marca GAG.",
      },
      {
        id: "cap-gag-02",
        capability: "gag:copywriting",
        category: "GAG_VISUAL",
        implemented: true,
        handler: "skill_copywriting",
        permissions: ["write:copy"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Copywriting de alta conversão, sequências de e-mail e posts sociais.",
      },
      {
        id: "cap-gag-03",
        capability: "gag:scriptwriting",
        category: "GAG_VISUAL",
        implemented: true,
        handler: "skill_scriptwriting",
        permissions: ["write:scripts"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Roteirização de vídeos com gatilhos de retenção e prompts de cena para Veo.",
      },
      {
        id: "cap-gag-04",
        capability: "gag:visual_prompt",
        category: "GAG_VISUAL",
        implemented: true,
        handler: "skill_visual_prompt",
        permissions: ["write:prompts"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Engenharia de prompts para Midjourney, Flux e Veo 2.",
      },

      // 5. SOFTWARE
      {
        id: "cap-soft-01",
        capability: "software:analyze_code",
        category: "SOFTWARE",
        implemented: true,
        handler: "skill_analyze_code",
        permissions: ["read:code"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Análise estática de código TypeScript/React e deteção de vulnerabilidades.",
      },
      {
        id: "cap-soft-02",
        capability: "software:write_code",
        category: "SOFTWARE",
        implemented: true,
        handler: "skill_write_code",
        permissions: ["write:code"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Geração de componentes React, schemas Supabase e scripts de automação.",
      },

      // 6. OPERATIONS & QA
      {
        id: "cap-ops-01",
        capability: "operations:create_task",
        category: "OPERATIONS",
        implemented: true,
        handler: "skill_create_task",
        permissions: ["write:tasks"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Criação de ordens de trabalho estruturadas no Backlog Operacional.",
      },
      {
        id: "cap-ops-02",
        capability: "operations:qa",
        category: "OPERATIONS",
        implemented: true,
        handler: "skill_qa",
        permissions: ["audit:qa"],
        requiresApproval: false,
        autonomyLevel: 1,
        description: "Validação de qualidade do entregável e conformidade com os critérios GAG.",
      },
      {
        id: "cap-ops-03",
        capability: "operations:handoff",
        category: "OPERATIONS",
        implemented: true,
        handler: "skill_handoff",
        permissions: ["dispatch:agents"],
        requiresApproval: false,
        autonomyLevel: 0,
        description: "Encaminhamento inteligente de entregáveis para o próximo agente especialista.",
      },
    ];

    defaultCaps.forEach((cap) => {
      this.capabilities.set(cap.capability, cap);
    });
  }

  public getCapability(name: string): Capability | undefined {
    return this.capabilities.get(name);
  }

  public isImplemented(name: string): boolean {
    const cap = this.capabilities.get(name);
    return !!(cap && cap.implemented);
  }

  public getAllCapabilities(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  public registerCapability(capability: Capability): void {
    this.capabilities.set(capability.capability, capability);
  }
}
