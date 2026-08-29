import { AgentProfile } from "../types";
import {
  GAG_GLOBAL_SYSTEM_BASE,
  GAG_OFFICIAL_CATALOG_AGENTS,
  getAgentCatalogPrompt,
} from "../../registry/agentCatalogPrompts";

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, AgentProfile> = new Map();

  private constructor() {
    this.registerCoreAgents();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerCoreAgents() {
    const defaultProfiles: AgentProfile[] = [
      // Agente 01: KIA (Assistente Central & Orquestradora)
      {
        id: "agent-kia",
        slug: "kia-master",
        name: "KIA (Assistente Central & Orquestradora)",
        roleTitle: "Assistente Central, Gestão do Sistema & Orquestradora",
        description: "Gestão do sistema, roteamento de tarefas hands-free por voz e execução de ações rápidas.",
        objective: "Interpretar intenções do utilizador, disparar automações e apresentar estados do sistema de forma sucinta.",
        avatarColor: "from-amber-400 to-yellow-600",
        allocatedSkillIds: ["skill_decompose_task", "skill_qa"],
        allocatedToolIds: ["tool_manage_memory", "tool_evaluate_qa"],
        permissions: ["admin:*", "orchestrate:*", "audit:*", "conversation:execute"],
        systemPrompt: getAgentCatalogPrompt("agent-kia"),
        maxConcurrentTasks: 10,
      },
      // Agente 02: Scanner Económico & OCR (DRE / Finanças)
      {
        id: "agent-scanner",
        slug: "scanner-economico-ocr",
        name: "Scanner Económico & OCR (DRE / Finanças)",
        roleTitle: "Auditor Financeiro Forense & OCR Documental",
        description: "Extração e auditoria de documentos financeiros (DRE, Balancetes, Faturas, NIF).",
        objective: "Extrair rubricas em tabelas comparativas de vários anos, calcular margens (EBITDA, Líquida) e sinalizar discrepâncias tributárias.",
        avatarColor: "from-emerald-500 to-green-600",
        allocatedSkillIds: ["skill_ocr_document", "skill_calculate"],
        allocatedToolIds: ["tool_ocr_invoice", "tool_calculate_finance"],
        permissions: ["read:documents", "finance:*", "document:process"],
        systemPrompt: getAgentCatalogPrompt("agent-scanner"),
        maxConcurrentTasks: 5,
      },
      // Agente 03: Gestor de Tráfego & Performance
      {
        id: "agent-campaigns",
        slug: "gestor-trafego-performance",
        name: "Gestor de Tráfego & Performance",
        roleTitle: "Estrategista de Tráfego Pago & Otimização de ROAS",
        description: "Criação e otimização de campanhas (Meta Ads, Google Ads).",
        objective: "Apresentar estruturas de campanhas com orçamento em AOA/USD, público-alvo, criativos e métricas de ROI/CPA em tabelas.",
        avatarColor: "from-blue-600 to-indigo-700",
        allocatedSkillIds: ["skill_brand_strategy", "skill_calculate"],
        allocatedToolIds: ["tool_calculate_finance", "tool_manage_memory"],
        permissions: ["business:*", "marketing:*", "task:write"],
        systemPrompt: getAgentCatalogPrompt("agent-campaigns"),
        maxConcurrentTasks: 4,
      },
      // Agente 04: Copywriter & Redator de Conteúdo
      {
        id: "agent-copywriter",
        slug: "copywriter-redator",
        name: "Copywriter & Redator de Conteúdo",
        roleTitle: "Redator Publicitário Persuasivo & Copywriter High-Ticket",
        description: "Produção de textos persuasivos, e-mails de vendas e posts institucionais.",
        objective: "Foco em ganchos fortes, propostas de valor claras e chamadas para ação (CTA) objetivas.",
        avatarColor: "from-purple-600 to-pink-600",
        allocatedSkillIds: ["skill_copywriting"],
        allocatedToolIds: ["tool_write_copy_sequence", "tool_manage_memory"],
        permissions: ["write:copy", "content:*", "task:write"],
        systemPrompt: getAgentCatalogPrompt("agent-copywriter"),
        maxConcurrentTasks: 4,
      },
      // Agente 05: Designer Visual & Diretor de Arte
      {
        id: "agent-art-director",
        slug: "designer-visual-arte",
        name: "Designer Visual & Diretor de Arte",
        roleTitle: "Diretor de Arte, Conceitos Visuais & Motion Veo",
        description: "Geração de conceitos visuais, direções de arte e prompts detalhados para ferramentas de imagem.",
        objective: "Entregar composições visuais com especificações de cores (Hex), tipografia e layouts para campanhas.",
        avatarColor: "from-fuchsia-500 to-rose-600",
        allocatedSkillIds: ["skill_scriptwriting", "skill_brand_strategy"],
        allocatedToolIds: ["tool_manage_memory"],
        permissions: ["write:prompts", "design:*", "task:write"],
        systemPrompt: getAgentCatalogPrompt("agent-art-director"),
        maxConcurrentTasks: 3,
      },
      // Agente 06: Engenheiro de Infraestrutura & Automação (n8n)
      {
        id: "agent-automation-kaza",
        slug: "engenheiro-infra-n8n",
        name: "Engenheiro de Infraestrutura & Automação (n8n)",
        roleTitle: "Arquiteto de Integração, n8n, APIs & Redes",
        description: "Monitorização de rotas de API, fluxos n8n e integrações de sistema.",
        objective: "Diagnosticar erros de endpoints e sugerir correções de código/JSON diretamente sem rodeios.",
        avatarColor: "from-cyan-500 to-teal-600",
        allocatedSkillIds: ["skill_write_code", "skill_decompose_task"],
        allocatedToolIds: ["tool_manage_memory"],
        permissions: ["system:*", "write:code", "infrastructure:*"],
        systemPrompt: getAgentCatalogPrompt("agent-automation-kaza"),
        maxConcurrentTasks: 5,
      },
      // Agente 07: Especialista Comercial & Fecho de Vendas (WhatsApp)
      {
        id: "agent-sales-whatsapp",
        slug: "especialista-comercial-whatsapp",
        name: "Especialista Comercial & Fecho de Vendas (WhatsApp)",
        roleTitle: "Fechador Comercial High-Ticket & Conversão WhatsApp",
        description: "Qualificação de leads e respostas rápidas para conversão.",
        objective: "Criar scripts de abordagem direta, tratamento de objeções e acompanhamento de propostas.",
        avatarColor: "from-emerald-500 to-teal-700",
        allocatedSkillIds: ["skill_copywriting"],
        allocatedToolIds: ["tool_write_copy_sequence", "tool_manage_memory"],
        permissions: ["sales:*", "communications:*", "conversation:execute"],
        systemPrompt: getAgentCatalogPrompt("agent-sales-whatsapp"),
        maxConcurrentTasks: 6,
      },
      // Especialistas Complementares do Ecossistema GAG Core
      {
        id: "agent-soba",
        slug: "o-soba",
        name: "O Soba",
        roleTitle: "Arquiteto-Chefe de IA & Engenharia de Prompts",
        description: "Automação de criação de novos agentes, arquitetura de sistemas de IA e alinhamento cultural angolano.",
        objective: "Gerar configurações de novos agentes com rigor técnico e prompts sem alucinações.",
        avatarColor: "from-red-600 to-amber-700",
        allocatedSkillIds: ["skill_decompose_task", "skill_brand_strategy"],
        allocatedToolIds: ["tool_manage_memory"],
        permissions: ["governance:*", "agent_factory:*"],
        systemPrompt: `${GAG_GLOBAL_SYSTEM_BASE}\n\n[PAPEL: O SOBA - ARQUITETO DE IA]\nAtua como o arquiteto supremo de inteligência artificial. Gera especificações JSON e configurações de novos agentes com parâmetros exatos sem introduções.`,
        maxConcurrentTasks: 3,
      },
      {
        id: "agent-consultant",
        slug: "consultor-gag",
        name: "Consultor GAG",
        roleTitle: "Estrategista de Negócios & Diagnóstico TOB",
        description: "Diagnóstico empresarial baseado em Tecnologia, Organização e Branding.",
        objective: "Maximizar o ROI e acelerar o crescimento de clientes corporativos com análises estruturadas.",
        avatarColor: "from-blue-600 to-indigo-800",
        allocatedSkillIds: ["skill_brand_strategy", "skill_calculate"],
        allocatedToolIds: ["tool_calculate_finance", "tool_manage_memory"],
        permissions: ["business:*", "finance:read"],
        systemPrompt: `${GAG_GLOBAL_SYSTEM_BASE}\n\n[PAPEL: CONSULTOR GAG - ESTRATÉGIA EMPRESARIAL]\nEntrega diagnósticos empresariais TOB (Tecnologia, Organização e Branding) com tabelas comparativas, métricas de crescimento e planos de ação diretos sem saudações.`,
        maxConcurrentTasks: 4,
      },
      {
        id: "agent-educator",
        slug: "professor-mestre",
        name: "Professor & Mestre Pedagógico",
        roleTitle: "Educador & Formador Corporativo",
        description: "Formação da equipa, tutoria contínua e síntese pedagógica da Base de Conhecimento.",
        objective: "Explicar regras, metodologias e processos técnicos com clareza e exemplos objetivos.",
        avatarColor: "from-blue-500 to-cyan-700",
        allocatedSkillIds: ["skill_decompose_task"],
        allocatedToolIds: ["tool_manage_memory"],
        permissions: ["education:*", "knowledge:read"],
        systemPrompt: `${GAG_GLOBAL_SYSTEM_BASE}\n\n[PAPEL: PROFESSOR & MESTRE PEDAGÓGICO]\nExplica metodologias, conceitos e diretrizes com listas didáticas, passos estruturados e exemplos práticos sem rodeios introdutórios.`,
        maxConcurrentTasks: 3,
      },
    ];

    defaultProfiles.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  public getAgent(id: string): AgentProfile | undefined {
    return this.agents.get(id);
  }

  public getAllAgents(): AgentProfile[] {
    return Array.from(this.agents.values());
  }

  public registerAgent(profile: AgentProfile): void {
    this.agents.set(profile.id, profile);
  }
}
