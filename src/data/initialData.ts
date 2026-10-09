import {
  Agent,
  Skill,
  KnowledgeItem,
  Task,
  CalendarEvent,
  AuditLog,
  User,
} from "../types";
import { getAgentCatalogPrompt, GAG_GLOBAL_SYSTEM_BASE } from "../registry/agentCatalogPrompts";

export const INITIAL_USER: User = {
  id: "usr-owner-01",
  name: "Josemar Gourgel",
  email: "josemargourgel01@gmail.com",
  phone: "+244 922 835 116",
  role: "OWNER",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

// Catálogo Oficial dos Agentes Operacionais GAG Core:
// Agente 01: KIA (Assistente Central & Orquestradora)
// Agente 02: Scanner Económico & OCR (DRE / Finanças)
// Agente 03: Gestor de Tráfego & Performance
// Agente 04: Copywriter & Redator de Conteúdo
// Agente 05: Designer Visual & Diretor de Arte
// Agente 06: Engenheiro de Infraestrutura & Automação (n8n)
// Agente 07: Especialista Comercial & Fecho de Vendas (WhatsApp)
export const INITIAL_AGENTS: Agent[] = [
  // Agente 01: KIA
  {
    id: "agent-kia",
    slug: "kia-master",
    name: "KIA (Assistente Operacional & Comercial Mestre)",
    description: "Assistente mestre da GAG Visual em Luanda: qualificação de leads, vendas no WhatsApp, propostas em AOA e orquestração.",
    objective: "Qualificar leads, apresentar serviços da GAG Visual (Design de Elite, Redes, Automações), cotar em Kwanzas (AOA) e fechar vendas.",
    skills: [
      "gag-multiformat-content-generator",
      "gag-autonomous-backlog-task",
      "gag-cinematic-visual-assets",
      "gag-financial-aoa-calculator",
      "gag-knowledge-curation",
      "gag-prompt-engineering",
      "gag-workflow-automation",
      "gag-security-screening",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "knowledge:write",
      "document:read",
      "document:process",
      "task:manage",
      "agent_factory:read",
      "agent_factory:manage",
      "audit:write",
    ],
    status: "ACTIVE",
    version: "3.2.0",
    avatarColor: "#F59E0B", // GAG Gold
    roleTitle: "Assistente Operacional, Comercial Mestre & Orquestradora",
    systemPrompt: getAgentCatalogPrompt("agent-kia"),
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agente 02: Scanner Económico & OCR (DRE / Finanças)
  {
    id: "agent-scanner",
    slug: "scanner-economico-ocr",
    name: "Scanner Económico & OCR (DRE / Finanças)",
    description: "Extração e auditoria de documentos financeiros (DRE, Balancetes, Faturas, NIF e impostos).",
    objective: "Extrair rubricas em tabelas comparativas de vários anos, calcular margens (EBITDA, Líquida) e sinalizar discrepâncias tributárias.",
    skills: [
      "gag-data-analysis-brief",
      "gag-knowledge-curation",
      "gag-security-screening",
    ],
    permissions: [
      "document:read",
      "document:process",
      "knowledge:write",
      "task:write",
      "finance:*",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#10B981", // Emerald
    roleTitle: "Auditor Financeiro Forense & OCR Documental",
    systemPrompt: getAgentCatalogPrompt("agent-scanner"),
    createdAt: "2026-08-12T10:30:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agente 03: Gestor de Tráfego & Performance
  {
    id: "agent-campaigns",
    slug: "gestor-trafego-performance",
    name: "Gestor de Tráfego & Performance",
    description: "Criação e otimização de campanhas (Meta Ads, Google Ads).",
    objective: "Apresentar estruturas de campanhas com orçamento em AOA/USD, público-alvo, criativos e métricas de ROI/CPA em tabelas.",
    skills: [
      "gag-content-production",
      "gag-data-analysis-brief",
      "gag-crm-requirements",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "task:write",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#3B82F6", // Blue
    roleTitle: "Estrategista de Tráfego Pago & Otimização de ROAS",
    systemPrompt: getAgentCatalogPrompt("agent-campaigns"),
    createdAt: "2026-08-23T13:55:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agente 04: Copywriter & Redator de Conteúdo
  {
    id: "agent-copywriter",
    slug: "copywriter-redator",
    name: "Copywriter & Redator de Conteúdo",
    description: "Produção de textos persuasivos, e-mails de vendas e posts institucionais.",
    objective: "Foco em ganchos fortes, propostas de valor claras e chamadas para ação (CTA) objetivas.",
    skills: [
      "gag-content-production",
      "gag-prompt-engineering",
      "gag-data-analysis-brief",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "task:write",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#EC4899", // Pink
    roleTitle: "Redator Publicitário Persuasivo & Copywriter High-Ticket",
    systemPrompt: getAgentCatalogPrompt("agent-copywriter"),
    createdAt: "2026-08-23T10:00:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agente 05: Designer Visual & Diretor de Arte
  {
    id: "agent-art-director",
    slug: "designer-visual-arte",
    name: "Designer Visual & Diretor de Arte",
    description: "Geração de conceitos visuais, direções de arte e prompts detalhados para ferramentas de imagem.",
    objective: "Entregar composições visuais com especificações de cores (Hex), tipografia e layouts para campanhas.",
    skills: [
      "gag-design-with-ai",
      "gag-video-production",
      "gag-prompt-engineering",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "task:write",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#8B5CF6", // Purple
    roleTitle: "Diretor de Arte, Conceitos Visuais & Motion Veo",
    systemPrompt: getAgentCatalogPrompt("agent-art-director"),
    createdAt: "2026-08-23T09:30:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agente 06: Engenheiro de Infraestrutura & Automação (n8n)
  {
    id: "agent-automation-kaza",
    slug: "engenheiro-infra-n8n",
    name: "Engenheiro de Infraestrutura & Automação (n8n)",
    description: "Monitorização de rotas de API, fluxos n8n e integrações de sistema.",
    objective: "Diagnosticar erros de endpoints e sugerir correções de código/JSON diretamente sem rodeios.",
    skills: [
      "gag-workflow-automation",
      "gag-crm-requirements",
      "gag-security-screening",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "task:write",
      "task:manage",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#06B6D4", // Cyan
    roleTitle: "Arquiteto de Integração, n8n, APIs & Redes",
    systemPrompt: getAgentCatalogPrompt("agent-automation-kaza"),
    createdAt: "2026-08-23T13:55:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agente 07: Especialista Comercial & Fecho de Vendas (WhatsApp)
  {
    id: "agent-sales-whatsapp",
    slug: "especialista-comercial-whatsapp",
    name: "Especialista Comercial & Fecho de Vendas (WhatsApp)",
    description: "Qualificação de leads e respostas rápidas para conversão.",
    objective: "Criar scripts de abordagem direta, tratamento de objeções e acompanhamento de propostas.",
    skills: [
      "gag-crm-requirements",
      "gag-content-production",
      "gag-data-analysis-brief",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "task:write",
      "sales:*",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#14B8A6", // Teal
    roleTitle: "Fechador Comercial High-Ticket & Conversão WhatsApp",
    systemPrompt: getAgentCatalogPrompt("agent-sales-whatsapp"),
    createdAt: "2026-08-29T11:00:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  // Agentes Especialistas de Apoio
  {
    id: "agent-soba",
    slug: "o-soba",
    name: "O Soba",
    description: "Agente-chefe e arquiteto de Inteligência Artificial para criação de novos agentes no ecossistema.",
    objective: "Automatizar a criação e configuração de agentes de IA como Engenheiro de Prompt Sénior.",
    skills: [
      "gag-prompt-engineering",
      "gag-security-screening",
      "gag-workflow-automation",
      "gag-ai-agent-design",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "knowledge:write",
      "agent_factory:read",
      "agent_factory:manage",
      "task:write",
      "audit:write",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#EAB308", // Soba Royal Amber
    roleTitle: "Arquiteto-Chefe de IA & Engenharia de Prompts",
    systemPrompt: `${GAG_GLOBAL_SYSTEM_BASE}\n\n[PAPEL: O SOBA - ARQUITETO DE IA]\nAtua como o arquiteto supremo de inteligência artificial. Gera especificações JSON e configurações de novos agentes com parâmetros exatos sem introduções.`,
    createdAt: "2026-08-23T09:00:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  {
    id: "agent-consultant",
    slug: "consultor-gag",
    name: "Consultor GAG",
    description: "Consultoria estratégica e operacional baseada na metodologia TOB (Tecnologia, Organização e Branding).",
    objective: "Desenvolver briefings estratégicos, auditar propostas de valor e fornecer diagnósticos de branding e crescimento.",
    skills: [
      "gag-data-analysis-brief",
      "gag-crm-requirements",
      "gag-prompt-engineering",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "task:read",
      "document:read",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#6366F1", // Indigo
    roleTitle: "Estrategista de Negócios & Diagnóstico TOB",
    systemPrompt: `${GAG_GLOBAL_SYSTEM_BASE}\n\n[PAPEL: CONSULTOR GAG - ESTRATÉGIA EMPRESARIAL]\nEntrega diagnósticos empresariais TOB (Tecnologia, Organização e Branding) com tabelas comparativas, métricas de crescimento e planos de ação diretos sem saudações.`,
    createdAt: "2026-08-10T11:00:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
  {
    id: "agent-educator",
    slug: "professor-mestre",
    name: "Professor & Mestre Pedagógico",
    description: "Formação da equipa, tutoria contínua e síntese pedagógica da Base de Conhecimento.",
    objective: "Educar membros da equipa, explicar regras da marca e metodologias com clareza e exemplos práticos.",
    skills: [
      "gag-knowledge-curation",
      "gag-prompt-engineering",
      "gag-data-analysis-brief",
    ],
    permissions: [
      "conversation:execute",
      "knowledge:read",
      "knowledge:write",
      "task:read",
    ],
    status: "ACTIVE",
    version: "3.0.0",
    avatarColor: "#3B82F6", // Blue
    roleTitle: "Educador & Formador Corporativo",
    systemPrompt: `${GAG_GLOBAL_SYSTEM_BASE}\n\n[PAPEL: PROFESSOR & MESTRE PEDAGÓGICO]\nExplica metodologias, conceitos e diretrizes com listas didáticas, passos estruturados e exemplos práticos sem rodeios introdutórios.`,
    createdAt: "2026-08-23T09:00:00Z",
    updatedAt: "2026-08-29T11:00:00Z",
  },
];

// Initial 10 Skills as strictly specified in section 11:
export const INITIAL_SKILLS: Skill[] = [
  {
    id: "gag-multiformat-content-generator",
    name: "Gerador de Conteúdo Multiformato & Propostas AOA",
    description: "Gera propostas comerciais completas (50% de sinal), roteiros 9:16 para Veo 3.1, posts de redes sociais, briefings e relatórios de ROAS em Markdown, HTML e WhatsApp.",
    category: "Geração & Copy",
    permissions: ["conversation:execute", "document:write", "task:write"],
    handler: "handleMultiformatContentGenerator",
    version: "2.5.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        tipoConteudo: { type: "string" },
        titulo: { type: "string" },
        tema: { type: "string" },
        publicoAlvo: { type: "string" },
        tomDeVoz: { type: "string" },
      },
      required: ["tipoConteudo", "titulo", "tema"],
      sample: {
        tipoConteudo: "proposta_comercial",
        titulo: "Campanha Institucional 4K Luanda",
        tema: "Produção cinematográfica e posicionamento de autoridade",
        publicoAlvo: "Decisores B2B em Luanda",
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        markdown: { type: "string" },
        html: { type: "string" },
        whatsAppText: { type: "string" },
      },
    },
    samplePayload: {
      tipoConteudo: "proposta_comercial",
      titulo: "Campanha Institucional 4K Luanda",
      tema: "Produção cinematográfica e posicionamento de autoridade",
      publicoAlvo: "Decisores B2B em Luanda",
    },
  },
  {
    id: "gag-autonomous-backlog-task",
    name: "Criação Autônoma no Backlog & Kanban",
    description: "Insere tarefas prioritárias no Backlog operacional da GAG Visual e atribui automaticamente ao agente especialista.",
    category: "Automação & Processos",
    permissions: ["task:write", "task:read"],
    handler: "handleAutonomousBacklogTask",
    version: "2.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        descricao: { type: "string" },
        prioridade: { type: "string" },
        categoria: { type: "string" },
      },
      required: ["titulo", "descricao", "prioridade"],
      sample: {
        titulo: "Criar Roteiro Reels para Lançamento",
        descricao: "Escrever roteiro de 30s com foco em conversão no WhatsApp",
        prioridade: "HIGH",
        categoria: "CONTENT",
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        success: { type: "boolean" },
      },
    },
    samplePayload: {
      titulo: "Criar Roteiro Reels para Lançamento",
      descricao: "Escrever roteiro de 30s com foco em conversão no WhatsApp",
      prioridade: "HIGH",
      categoria: "CONTENT",
    },
  },
  {
    id: "gag-cinematic-visual-assets",
    name: "Especificação de Ativos Visuais (Veo 3.1 & Imagen 3)",
    description: "Gera prompts de altíssima fidelidade estética, iluminação cinematográfica, storyboards 9:16 e paletas de cores para produção de vídeo e design.",
    category: "Geração & Copy",
    permissions: ["conversation:execute", "knowledge:read"],
    handler: "handleCinematicVisualAssets",
    version: "2.1.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        tipoAsset: { type: "string" },
        aspectRatio: { type: "string" },
        promptGeracao: { type: "string" },
      },
      required: ["tipoAsset", "aspectRatio", "promptGeracao"],
      sample: {
        tipoAsset: "prompt_veo_video",
        aspectRatio: "9:16",
        promptGeracao: "cinematic vertical 9:16 studio in Luanda, luxury corporate atmosphere, 35mm lens, 4k",
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        storyboard: { type: "string" },
        assetSpec: { type: "object" },
      },
    },
    samplePayload: {
      tipoAsset: "prompt_veo_video",
      aspectRatio: "9:16",
      promptGeracao: "cinematic vertical 9:16 studio in Luanda, luxury corporate atmosphere, 35mm lens, 4k",
    },
  },
  {
    id: "gag-financial-aoa-calculator",
    name: "Calculadora Orçamental & Fiscal em Kwanzas (AOA)",
    description: "Calcula automaticamente a adjudicação com sinal de 50%, retenção na fonte (6,5%), IVA (14%) e margens líquidas de segurança.",
    category: "Análise & Diagnóstico",
    permissions: ["conversation:execute", "task:read"],
    handler: "handleFinancialAoaCalculator",
    version: "2.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        valorBrutoAOA: { type: "number" },
        tipoServico: { type: "string" },
      },
      required: ["valorBrutoAOA", "tipoServico"],
      sample: {
        valorBrutoAOA: 2500000,
        tipoServico: "Produção Audiovisual e Identidade Corporativa",
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        calculoFinanceiro: { type: "object" },
        relatorioTexto: { type: "string" },
      },
    },
    samplePayload: {
      valorBrutoAOA: 2500000,
      tipoServico: "Produção Audiovisual e Identidade Corporativa",
    },
  },
  {
    id: "gag-knowledge-curation",
    name: "Curadoria e Síntese de Conhecimento",
    description: "Indexa, valida e estrutura artigos e documentos para o Knowledge Base central com controle de versão e taxonomia rigorosa.",
    category: "Knowledge",
    permissions: ["knowledge:write", "knowledge:read"],
    handler: "handleKnowledgeCuration",
    version: "1.2.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        rawContent: { type: "string" },
        category: { type: "string" },
        title: { type: "string" },
      },
      required: ["rawContent", "title"],
    },
    outputSchema: {
      type: "object",
      properties: {
        curatedId: { type: "string" },
        summary: { type: "string" },
        tags: { type: "array" },
      },
    },
    samplePayload: {
      title: "Playbook de Estruturação de Conteúdo",
      category: "CONTENT_STRATEGY",
      rawContent: "Diretrizes de produção para marketing digital e copywriting persuasivo.",
    },
  },
  {
    id: "gag-prompt-engineering",
    name: "Engenharia de Prompts Avançada",
    description: "Formula e otimiza instruções de sistema de alta precisão para modelos de linguagem com controle de tom e formatação estrita.",
    category: "AI",
    permissions: ["agent_factory:read", "conversation:execute"],
    handler: "handlePromptEngineering",
    version: "2.0.1",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        agentRole: { type: "string" },
        taskObjective: { type: "string" },
        constraints: { type: "array" },
      },
      required: ["agentRole", "taskObjective"],
    },
    outputSchema: {
      type: "object",
      properties: {
        systemPrompt: { type: "string" },
        fewShotExamples: { type: "array" },
      },
    },
    samplePayload: {
      agentRole: "Copywriter de Performance GAG",
      taskObjective: "Criar copy de anúncios para redes sociais com gancho de 3 segundos",
      constraints: ["Sem jargões genéricos", "Máximo 150 caracteres para headline"],
    },
  },
  {
    id: "gag-data-analysis-brief",
    name: "Análise de Briefing & Dados",
    description: "Extrai métricas, objetivos e requisitos fundamentais a partir de briefings brutos de clientes e relatórios analíticos.",
    category: "Analytics",
    permissions: ["document:read", "task:write"],
    handler: "handleDataAnalysisBrief",
    version: "1.1.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        briefText: { type: "string" },
        clientSector: { type: "string" },
      },
      required: ["briefText"],
    },
    outputSchema: {
      type: "object",
      properties: {
        kpis: { type: "array" },
        deliverables: { type: "array" },
        riskAnalysis: { type: "string" },
      },
    },
    samplePayload: {
      clientSector: "E-Commerce de Luxo",
      briefText: "Lançamento de coleção outono/inverno com foco em conversão via Instagram Ads e e-mail marketing.",
    },
  },
  {
    id: "gag-content-production",
    name: "Produção de Conteúdo Multicanal",
    description: "Gera cronogramas editoriais, roteiros e copys alinhadas com a voz de marca da GAG Visual e seus parceiros.",
    category: "Content",
    permissions: ["knowledge:read", "task:write"],
    handler: "handleContentProduction",
    version: "1.0.4",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string" },
        topic: { type: "string" },
        audience: { type: "string" },
      },
      required: ["channel", "topic"],
    },
    outputSchema: {
      type: "object",
      properties: {
        headlines: { type: "array" },
        bodyDraft: { type: "string" },
        callToAction: { type: "string" },
      },
    },
    samplePayload: {
      channel: "LinkedIn & Blog",
      topic: "Como a IA Generativa Transforma o Design de Marcas em 2026",
      audience: "Diretores de Marketing e Fundadores",
    },
  },
  {
    id: "gag-design-with-ai",
    name: "Direção de Arte & Design com IA",
    description: "Cria prompts conceituais para geração de ativos visuais, paletas e sistemas de identidade de marca com harmonia visual.",
    category: "Design",
    permissions: ["knowledge:read"],
    handler: "handleDesignWithAi",
    version: "1.3.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        conceptName: { type: "string" },
        aesthetic: { type: "string" },
        aspectRatio: { type: "string" },
      },
      required: ["conceptName", "aesthetic"],
    },
    outputSchema: {
      type: "object",
      properties: {
        imagePrompt: { type: "string" },
        colorPalette: { type: "array" },
        typographyRecommendation: { type: "string" },
      },
    },
    samplePayload: {
      conceptName: "Campanha GAG Visual Core 2026",
      aesthetic: "Luxury Dark Futuristic com detalhes em ouro fosco e tipografia geométrica",
      aspectRatio: "16:9",
    },
  },
  {
    id: "gag-video-production",
    name: "Roteirização e Produção de Vídeo",
    description: "Estrutura roteiros dinâmicos cena-a-cena para motion design, reels e vídeos institucionais de alto engajamento.",
    category: "Video",
    permissions: ["knowledge:read"],
    handler: "handleVideoProduction",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        durationSec: { type: "number" },
        videoTheme: { type: "string" },
        format: { type: "string" },
      },
      required: ["videoTheme", "durationSec"],
    },
    outputSchema: {
      type: "object",
      properties: {
        scenes: { type: "array" },
        voiceoverScript: { type: "string" },
        soundDirection: { type: "string" },
      },
    },
    samplePayload: {
      durationSec: 45,
      videoTheme: "Apresentação do Sistema Operacional GAG Core",
      format: "9:16 Vertical",
    },
  },
  {
    id: "gag-ai-agent-design",
    name: "Arquitetura e Design de Agentes IA",
    description: "Mapeia capabilities, políticas de segurança e fluxos de execução para novos agentes na Agent Factory.",
    category: "AI",
    permissions: ["agent_factory:manage"],
    handler: "handleAgentDesign",
    version: "1.1.2",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        agentRole: { type: "string" },
        targetDepartment: { type: "string" },
        requiredSkills: { type: "array" },
      },
      required: ["agentRole"],
    },
    outputSchema: {
      type: "object",
      properties: {
        blueprint: { type: "object" },
        suggestedPermissions: { type: "array" },
      },
    },
    samplePayload: {
      agentRole: "Assistente de Tráfego Pago",
      targetDepartment: "Mídia & Performance",
      requiredSkills: ["gag-data-analysis-brief"],
    },
  },
  {
    id: "gag-crm-requirements",
    name: "Mapeamento de Requisitos de CRM",
    description: "Estrutura fluxos de relacionamento, tags de lead e automações de nutrição para clientes da agência.",
    category: "Operations",
    permissions: ["task:write"],
    handler: "handleCrmRequirements",
    version: "0.9.5",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        leadStage: { type: "string" },
        conversionGoal: { type: "string" },
      },
      required: ["leadStage"],
    },
    outputSchema: {
      type: "object",
      properties: {
        pipelineStages: { type: "array" },
        automationRules: { type: "array" },
      },
    },
    samplePayload: {
      leadStage: "Qualificação de Briefing",
      conversionGoal: "Agendamento de Sessão de Diagnóstico de Marca",
    },
  },
  {
    id: "gag-workflow-automation",
    name: "Automação de Workflows Internos",
    description: "Coordena disparos de eventos, orquestração de tarefas assíncronas e notificações de auditoria.",
    category: "Automation",
    permissions: ["task:manage", "audit:write"],
    handler: "handleWorkflowAutomation",
    version: "1.4.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        triggerEvent: { type: "string" },
        targetEntities: { type: "array" },
      },
      required: ["triggerEvent"],
    },
    outputSchema: {
      type: "object",
      properties: {
        workflowId: { type: "string" },
        actionsScheduled: { type: "array" },
      },
    },
    samplePayload: {
      triggerEvent: "DOCUMENT_EXTRACTED",
      targetEntities: ["TASK_CREATION", "AUDIT_LOG_DISPATCH"],
    },
  },
  {
    id: "gag-security-screening",
    name: "Triagem de Segurança & Conformidade",
    description: "Audita payloads e pedidos contra injeção de prompt, vazamento de chaves e acessos não autorizados por papel (RBAC).",
    category: "Security",
    permissions: ["audit:write"],
    handler: "handleSecurityScreening",
    version: "2.1.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        userRole: { type: "string" },
        requestedCapability: { type: "string" },
        payloadSnippet: { type: "string" },
      },
      required: ["userRole", "requestedCapability"],
    },
    outputSchema: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        riskLevel: { type: "string" },
        requiresReview: { type: "boolean" },
      },
    },
    samplePayload: {
      userRole: "OWNER",
      requestedCapability: "agent_factory:manage",
      payloadSnippet: "Criar novo agente de automação financeira",
    },
  },
  {
    id: "gag-financial-rag",
    name: "Scanner Económico & DRE Angolana (RAG Financeiro)",
    description: "Analisa balancetes, PDFs bancários (BAI, BFA, Standard Bank Angola), DRE e relatórios de fluxo de caixa, extraindo EBITDA, Margem Líquida e enquadramento BNA/AOA.",
    category: "Financial",
    permissions: ["document:read", "knowledge:read", "task:write"],
    handler: "handleFinancialRAG",
    version: "2.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        financialDocText: { type: "string" },
        currency: { type: "string", enum: ["AOA", "USD", "EUR"] },
        fiscalYear: { type: "string" },
      },
      required: ["financialDocText"],
    },
    outputSchema: {
      type: "object",
      properties: {
        revenueAOA: { type: "number" },
        ebitdaAOA: { type: "number" },
        netProfitAOA: { type: "number" },
        grossMarginPercent: { type: "number" },
        taxEstimates: { type: "object" },
        runwayMonths: { type: "number" },
      },
    },
    samplePayload: {
      financialDocText: "Receitas de Consultoria Q2: 45.000.000 Kz. Custos Operacionais e Folha: 22.000.000 Kz. Impostos e Licenças: 4.500.000 Kz.",
      currency: "AOA",
      fiscalYear: "2026",
    },
  },
  {
    id: "gag-scenario-risk-simulator",
    name: "Simulador Preditivo de ROAS & Risco de Mercado",
    description: "Executa testes probabilísticos e simulações de cenários (Pessimista, Realista, Otimista) para orçamentos de tráfego, CPA, ROI e conversões antes de publicar campanhas.",
    category: "Analytics",
    permissions: ["task:read", "task:write", "conversation:execute"],
    handler: "handleScenarioSimulation",
    version: "1.5.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        monthlyBudgetAOA: { type: "number" },
        channel: { type: "string" },
        targetCPA_AOA: { type: "number" },
        averageTicketAOA: { type: "number" },
      },
      required: ["monthlyBudgetAOA", "channel", "averageTicketAOA"],
    },
    outputSchema: {
      type: "object",
      properties: {
        scenarios: { type: "object" },
        breakEvenConversions: { type: "number" },
        projectedROAS: { type: "number" },
        riskScore: { type: "number" },
      },
    },
    samplePayload: {
      monthlyBudgetAOA: 2500000,
      channel: "Meta Ads",
      targetCPA_AOA: 15000,
      averageTicketAOA: 120000,
    },
  },
  {
    id: "gag-kaza-webhook-dispatcher",
    name: "Dispatcher de Webhooks & Pipelines Kaza Core 24/7",
    description: "Recebe requisições de formulários (Typeform, HubSpot, Supabase, Multicaixa Express), classifica a intenção e despacha em milissegundos para o agente especialista.",
    category: "Automation",
    permissions: ["task:manage", "task:write", "audit:write"],
    handler: "handleKazaWebhookDispatcher",
    version: "2.1.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        webhookSource: { type: "string" },
        eventPayload: { type: "object" },
        targetAgentSlug: { type: "string" },
      },
      required: ["webhookSource", "eventPayload"],
    },
    outputSchema: {
      type: "object",
      properties: {
        dispatchedAgentId: { type: "string" },
        taskId: { type: "string" },
        latencyMs: { type: "number" },
        status: { type: "string" },
      },
    },
    samplePayload: {
      webhookSource: "Typeform",
      eventPayload: {
        clientName: "Banco Atlântico",
        projectType: "Branding & IA Generativa",
        budgetRangeAOA: "15.000.000 - 30.000.000 Kz",
      },
    },
  },
  {
    id: "gag-angolan-tax-compliance",
    name: "Auditoria Fiscal AGT & Retenções em Angola",
    description: "Calcula impacto tributário de serviços e produtos em Angola: IVA (14%), Retenção na Fonte de Serviços (6.5%), Imposto do Selo (1%) e enquadramento no Regime Simplificado/Geral.",
    category: "Financial",
    permissions: ["document:read", "knowledge:read"],
    handler: "handleAngolanTaxCompliance",
    version: "1.2.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        grossAmountAOA: { type: "number" },
        serviceType: { type: "string" },
        regime: { type: "string" },
      },
      required: ["grossAmountAOA", "serviceType"],
    },
    outputSchema: {
      type: "object",
      properties: {
        ivaAOA: { type: "number" },
        retencaoFonteAOA: { type: "number" },
        impostoSeloAOA: { type: "number" },
        netLiquidoAOA: { type: "number" },
      },
    },
    samplePayload: {
      grossAmountAOA: 10000000,
      serviceType: "Prestação de Serviços de Marketing e Automação de IA",
      regime: "Regime Geral AGT",
    },
  },
  {
    id: "gag-youtube-video-research",
    name: "YouTube Video Research & Inteligência Multimodal",
    description: "Pesquisa avançada em fontes primárias de vídeo no YouTube (entrevistas de CEOs, keynotes, earnings calls, painéis técnicos), extraindo cotações verbatim, dados numéricos e síntese estruturada.",
    category: "Investigação & Dados",
    permissions: ["search:execute", "content:read", "document:write"],
    handler: "handleYoutubeVideoResearch",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        themes: { type: "array" },
        depth: { type: "string" },
      },
      required: ["topic"],
    },
    outputSchema: {
      type: "object",
      properties: {
        report: { type: "string" },
        quotes: { type: "array" },
        sources: { type: "array" },
      },
    },
    samplePayload: {
      topic: "Tendências de Automação de IA e Agentes em 2026",
      depth: "deep",
    },
  },
  {
    id: "gag-seo-competitor-analysis",
    name: "Análise Competitiva de SEO & Inteligência Orgânica",
    description: "Cria relatórios executivos de concorrentes orgânicos: tráfego global, clusters de páginas, demanda por país, branded vs non-branded e estratégia de backlinks.",
    category: "Marketing & Inteligência",
    permissions: ["search:execute", "analytics:read", "document:write"],
    handler: "handleSeoCompetitorAnalysis",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        targetDomain: { type: "string" },
        countries: { type: "array" },
      },
      required: ["targetDomain"],
    },
    outputSchema: {
      type: "object",
      properties: {
        reportMarkdown: { type: "string" },
        pageTypeBreakdown: { type: "object" },
      },
    },
    samplePayload: {
      targetDomain: "competitor-agency.com",
    },
  },
  {
    id: "gag-seo-audit",
    name: "Auditoria Estratégica & Técnica de SEO",
    description: "Auditoria de SEO baseada em evidências: resumo executivo conciso (150-200 palavras), tendência orgânica, portfólio de palavras-chave, arquitetura e lista ordenada de problemas e correções.",
    category: "Marketing & Inteligência",
    permissions: ["audit:execute", "document:write", "analytics:read"],
    handler: "handleSeoAudit",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string" },
        auditScope: { type: "string" },
      },
      required: ["domain"],
    },
    outputSchema: {
      type: "object",
      properties: {
        executiveSummary: { type: "string" },
        priorities: { type: "array" },
      },
    },
    samplePayload: {
      domain: "gagvisual.ao",
      auditScope: "full",
    },
  },
  {
    id: "gag-skill-creator",
    name: "Arquiteto de Skills Agênticas & Workflows",
    description: "Modela e compila novas habilidades modulares para agentes inteligentes com progressive disclosure, workflows determinísticos, scripts, referências e esquemas JSON.",
    category: "Automação & Processos",
    permissions: ["agent:write", "code:write", "workflow:execute"],
    handler: "handleSkillCreator",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        skillName: { type: "string" },
        description: { type: "string" },
        workflowSteps: { type: "array" },
      },
      required: ["skillName", "description"],
    },
    outputSchema: {
      type: "object",
      properties: {
        skillDefinition: { type: "object" },
        skillMd: { type: "string" },
      },
    },
    samplePayload: {
      skillName: "lead-qualifier-angola",
      description: "Qualificação de leads no WhatsApp com cálculo de sinal de 50%",
    },
  },
  {
    id: "gag-real-estate-brokerage",
    name: "Intermediação Imobiliária de Alto Padrão (Kikuxi & Mutamba)",
    description: "Dossiê, co-brokeragem (50/50) e proteção de 12 meses (no-circumvention) para venda da Mansão no Kikuxi (850M Kz / 25M comissão) e Edifício na Mutamba (420M Kz).",
    category: "Negócios & Vendas",
    permissions: ["contract:write", "crm:execute", "financial:read"],
    handler: "handleRealEstateBrokerage",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        property: { type: "string" },
        partnerAgency: { type: "string" },
        proposalType: { type: "string" },
      },
      required: ["property"],
    },
    outputSchema: {
      type: "object",
      properties: {
        pitchDeckUrl: { type: "string" },
        agreementTerms: { type: "object" },
        commissionAOA: { type: "number" },
      },
    },
    samplePayload: {
      property: "kikuxi-mansao-1ha",
      partnerAgency: "Imobiliária Porta Sete",
      proposalType: "co-brokerage-50-50",
    },
  },
  {
    id: "gag-comparison-article-writer",
    name: "Redator de Artigos Comparativos ('X vs Y')",
    description: "Escreve artigos comparativos de decisão profunda ('X vs Y') com veredito inicial (100-150 palavras), tabela comparativa de 5 a 8 atributos com preços, análise critério a critério, prós/contras, recomendações por persona e especificações de 3-4 imagens estratégicas.",
    category: "Conteúdo & SEO",
    permissions: ["content:write", "search:execute", "document:write"],
    handler: "handleComparisonArticleWriter",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        opcaoA: { type: "string" },
        opcaoB: { type: "string" },
        categoria: { type: "string" },
        publicoAlvo: { type: "string" },
        criterios: { type: "array" },
      },
      required: ["opcaoA", "opcaoB", "categoria"],
    },
    outputSchema: {
      type: "object",
      properties: {
        artigoMarkdown: { type: "string" },
        tabelaComparativa: { type: "object" },
        especificacaoImagens: { type: "array" },
      },
    },
    samplePayload: {
      opcaoA: "Notion",
      opcaoB: "Obsidian",
      categoria: "Ferramentas de Produtividade & Notas",
      publicoAlvo: "Equipas e Criadores de Conteúdo",
    },
  },
  {
    id: "gag-ai-video-director",
    name: "Diretor Cinematográfico de Vídeo IA (Veo 3.1 & Runway)",
    description: "Modela planos de produção de vídeo com IA em 5 fases, gerando especificações de primeiro keyframe (16:9/9:16), transições detalhadas de 2 a 4 frases, coerência física, mapa de arcos emocionais de BGM [mm:ss - mm:ss] e orçamentação de narração TTS.",
    category: "Audiovisual & Mídia",
    permissions: ["video:write", "media:generate", "prompt:write"],
    handler: "handleAiVideoDirector",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        tituloVideo: { type: "string" },
        estiloVisual: { type: "string" },
        aspectRatio: { type: "string" },
        cenas: { type: "array" },
        tipoMusica: { type: "string" },
      },
      required: ["tituloVideo", "estiloVisual"],
    },
    outputSchema: {
      type: "object",
      properties: {
        storyboardPlan: { type: "object" },
        bgmBlueprint: { type: "array" },
        promptsVeo: { type: "array" },
      },
    },
    samplePayload: {
      tituloVideo: "Pitch Mansão Kikuxi Elite",
      estiloVisual: "Cinematográfico 4K, iluminação natural dourada, arquitetura moderna",
      aspectRatio: "16:9",
    },
  },
  {
    id: "gag-excel-spreadsheet-architect",
    name: "Arquiteto de Planilhas & Modelagem Excel",
    description: "Projeta modelos e planilhas executivas estruturadas: tipografia contrastante (Serif/Sans), paleta temática (ex: Elegant Black, Corporate Blue), formatação rigorosa de números e percentagens, bordas por bloco de dados e seção de KEY INSIGHTS.",
    category: "Finanças & Análise",
    permissions: ["document:write", "financial:read", "analytics:write"],
    handler: "handleExcelSpreadsheetArchitect",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        tituloPlanilha: { type: "string" },
        temaCromático: { type: "string" },
        tabelasDados: { type: "array" },
        gerarGraficos: { type: "boolean" },
      },
      required: ["tituloPlanilha"],
    },
    outputSchema: {
      type: "object",
      properties: {
        especificacaoExcel: { type: "object" },
        codigoPythonOpenpyxl: { type: "string" },
        insightsChave: { type: "array" },
      },
    },
    samplePayload: {
      tituloPlanilha: "Plano Financeiro & Comissões Imobiliárias Luanda 2026",
      temaCromático: "elegant_black",
    },
  },
  {
    id: "gag-angola-lead-prospector",
    name: "Prospeção B2B & Roteiros de Vendas para Luanda",
    description: "Mapeia oportunidades comerciais no mercado angolano (gastronomia, hotelaria, bem-estar, comércio, serviços), gerando mensagens de abordagem personalizadas no WhatsApp com pacotes de serviços (Start 50k-85k Kz, Elite 150k-250k Kz, CRM 50k Kz) e follow-ups de 48h.",
    category: "Vendas & Negócios",
    permissions: ["crm:execute", "conversation:execute", "search:execute"],
    handler: "handleAngolaLeadProspector",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        setor: { type: "string" },
        nomeEmpresa: { type: "string" },
        canal: { type: "string" },
        dorIdentificada: { type: "string" },
      },
      required: ["setor", "nomeEmpresa"],
    },
    outputSchema: {
      type: "object",
      properties: {
        mensagemWhatsApp: { type: "string" },
        pacoteRecomendado: { type: "object" },
        followUp48h: { type: "string" },
      },
    },
    samplePayload: {
      setor: "Gastronomia Tradicional",
      nomeEmpresa: "Churrascaria Nandinhos",
      dorIdentificada: "Filas diárias presenciais, mas site em construção e sem captura de encomendas digitais",
    },
  },
  {
    id: "gag-academy-pedagogy",
    name: "GAG Academy: Avaliações, Quizzes & Certificados A4",
    description: "Estrutura percursos formativos com quizzes determinísticos corrigidos no servidor, registo de progresso imutável, suporte a estudo sem vídeo e emissão de certificados A4 com código QR de verificação de autenticidade.",
    category: "Educação & Processos",
    permissions: ["document:write", "security:write", "knowledge:read"],
    handler: "handleAcademyPedagogy",
    version: "1.0.0",
    status: "ACTIVE",
    inputSchema: {
      type: "object",
      properties: {
        moduloCurso: { type: "string" },
        alunoNome: { type: "string" },
        perguntasQuiz: { type: "array" },
      },
      required: ["moduloCurso"],
    },
    outputSchema: {
      type: "object",
      properties: {
        quizCorrigido: { type: "object" },
        certificadoA4Html: { type: "string" },
        qrCodeVerificacao: { type: "string" },
      },
    },
    samplePayload: {
      moduloCurso: "Módulo 1: IA na Prática para Gestores e Negócios em Luanda",
      alunoNome: "Aluno Piloto GAG Academy",
    },
  },
];

// Initial Knowledge Base
export const INITIAL_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "kb-001",
    title: "Manual de Identidade Visual GAG 2026 (Branding & Tech-African)",
    category: "BRANDING",
    source: "Manual de Identidade Visual GAG Visual & Apresentação 2026",
    version: "2.5",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Branding", "Paleta", "Dourado", "Dark Mode", "Tipografia", "Tech-African", "Canva Pro"],
    associatedSkillIds: ["gag-design-with-ai", "gag-knowledge-curation"],
    associatedAgentIds: ["agent-kia"],
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-08-22T06:00:00Z",
    content: `# Diretrizes Oficiais de Identidade Visual GAG Visual 2026

## 1. Princípios Estéticos & Posicionamento
A **GAG Visual** (Josemar Lukeni Gaspar do Amaral Gourgel — Comércio Geral e Prestação de Serviços (SU), Lda · NIF: 5001654063 · Luanda, Angola) posiciona-se como o motor da inovação digital em Luanda. Foco em Branding, Marketing Digital, Conteúdo e Automação de Processos.
*Slogan oficial:* **"Soluções com propósito, inovação com raízes."**

## 2. Paleta Cromática Oficial
- **Preto Profundo / Dark Base (#000000 / #05070C)**: Solidez, elegância, base tecnológica e autoridade.
- **Dourado GAG (#DAA520 / #F59E0B)**: Riqueza, inovação, distinção premium e excelência.
- **Azul Royal GAG (#003FD3)**: Modernidade, dinamismo e confiança digital em materiais e posts.
- **Prata / Cinza Metálico (#A0A2AB / #262626)**: Acento técnico, equilíbrio e sofisticação.
- **Azul Escuro / Texto (#041038)**: Tipografia formal de alto contraste.
- **Branco Gelo (#F8F9FA)**: Contraste máximo em conformidade WCAG AA.
*Regra de Proporção:* **60% Preto, 30% Dourado/Azul, 10% Apoio**.

## 3. Sistema Tipográfico
- **Títulos e Destaques**: Neue Montreal / Montserrat Bold (Geométrico, autoridade).
- **Subtítulos e Navegação**: Poppins SemiBold.
- **Corpo de Texto e Contratos**: Inter / Open Sans Regular (Legibilidade impecável).
- **Acentos Técnicos e Código**: Space Mono (Dados, metadados, automação).

## 4. Regras de Aplicação Documental
- **Margem de Segurança**: Espaço equivalente à altura do "G" em torno do logótipo.
- **Marca de Água**: Símbolo com exatamente 8% de opacidade no centro da página.
- **Papel Timbrado A4**: Uso obrigatório do cabeçalho e rodapé oficial em todas as propostas.`,
  },
  {
    id: "kb-002",
    title: "Catálogo Oficial de Serviços e Tabela de Preços (Kwanza - Kz)",
    category: "CLIENT_PLAYBOOK",
    source: "Catálogo Comercial WhatsApp Business & Apresentação Corporativa GAG",
    version: "2.4",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Preços", "Catálogo", "Serviços", "WhatsApp Business", "Comercial", "Kz"],
    associatedSkillIds: ["gag-data-analysis-brief", "gag-crm-requirements"],
    associatedAgentIds: ["agent-kia", "agent-consultant"],
    createdAt: "2026-02-10T11:00:00Z",
    updatedAt: "2026-08-22T06:00:00Z",
    content: `# Catálogo Oficial de Serviços — GAG Visual (Luanda/Angola)

### 1. 🚀 Pacote de Lançamento (Destaque)
- **Investimento:** **Kz 15.000,00**
- **Entregáveis:**
  1. Logótipo Profissional (Cor oficial + Monocromático)
  2. 1 Flyer Promocional (Digital / WhatsApp)
  3. 3 Posts para Instagram alinhados à identidade visual
  4. Guia de Configuração para WhatsApp Business

### 2. 🎨 Identidade Visual Completa
- **Investimento:** **Kz 25.000,00 – Kz 50.000,00** (Sob Consulta, base Kz 35.000)
- **Entregáveis:** Manual de Identidade Visual, paleta de cores, tipografia, aplicações em papelaria, cartão de visita e selo de marca d'água.

### 3. 📲 Gestão Mensal de Redes Sociais
- **Investimento:** **Kz 35.000,00 – Kz 50.000,00 / mês** (Base Kz 40.000)
- **Entregáveis:** Calendário editorial mensal (30 dias), 12 posts/carrosséis, 20 stories dinâmicos, roteiros de Reels/TikTok e legendas estratégicas.

### 4. 🌐 Criação de Landing Pages & Sites
- **Investimento:** **A partir de Kz 50.000,00**
- **Entregáveis:** Website rápido, responsivo, integrado com WhatsApp Direct e Google Forms.

### 5. 🤖 Consultoria de Presença Digital & IA
- **Investimento:** **Kz 25.000,00**

### 6. 🎬 Vídeos e Reels com IA
- **Investimento:** **Kz 20.000,00 – Kz 40.000,00**

### Regras Comerciais:
- **Forma de Pagamento:** 50% de sinal na adjudicação + 50% na entrega final aprovada.
- **Rondas de Revisão:** 2 rondas incluídas em cada projeto.
- **Taxa de Urgência:** +50% sobre o valor para entregas em 48h.`,
  },
  {
    id: "kb-003",
    title: "Relatório de Prospecção Ativa — Centralidade do Kilamba (Leads)",
    category: "CLIENT_PLAYBOOK",
    source: "Relatório de Prospecção Ativa GAG Visual — Kilamba/Luanda",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Kilamba", "Leads", "Prospecção", "Vendas", "Restaurantes", "Moda"],
    associatedSkillIds: ["gag-data-analysis-brief", "gag-crm-requirements"],
    associatedAgentIds: ["agent-kia", "agent-consultant"],
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-08-22T06:00:00Z",
    content: `# Leads Qualificados para Prospecção Ativa (Centralidade do Kilamba)

| Empresa | Nicho | Localização | Ponto Fraco Identificado | Score GAG |
|---|---|---|---|---|
| **NAY84 Restaurante** | Restauração | Kilamba (V16) | Conteúdo focado só em fotos de pratos, sem branding forte | **18/20** |
| **Esquina Brasil** | Lazer/Pizza | Kilamba (U17) | Perfil com informação misturada (Karaokê + Pizza) | **17/20** |
| **Nova Odonto** | Saúde | Viana / Luanda | Presença funcional, sem autoridade visual premium | **19/20** |
| **AB DG** | Moda Masc. | Kilamba (T1) | Marca elegante que precisa de carrosséis e tráfego pago | **18/20** |
| **Loja ZOPO** | Moda Infantil | Xyami Kilamba | Grande stock que precisa de anúncios de catálogo (Ads) | **17/20** |

### Roteiros de Abordagem Personalizados:
- **Alvo 1 (NAY84 Restaurante - V16):** *"Olá! Sou o Josemar da GAG Visual. Notei que a vossa comida no V16 tem um aspeto incrível, mas o vosso perfil de Instagram ainda não reflete a qualidade do restaurante. Criei uma amostra de como poderiam apresentar o vosso menu de forma premium. Gostariam de ver como podemos aumentar as vossas reservas?"*
- **Alvo 2 (AB DG - Moda T1):** *"Bom dia! Sou o Josemar da GAG Visual. A vossa loja no T1 tem peças muito elegantes, mas acredito que poderiam estar a chegar a muito mais clientes em Luanda com tráfego pago estratégico. Nós ajudamos marcas de moda a converterem visualizações em vendas no WhatsApp. Podemos conversar?"*`,
  },
  {
    id: "kb-004",
    title: "Calendário Editorial de 30 Dias para Redes Sociais (@gourgeljosemar)",
    category: "CONTENT_STRATEGY",
    source: "Calendário Editorial de Redes Sociais GAG Visual",
    version: "2.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Redes Sociais", "Instagram", "TikTok", "Calendário", "Carrosséis", "Reels"],
    associatedSkillIds: ["gag-content-production", "gag-video-production"],
    associatedAgentIds: ["agent-kia"],
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-22T06:00:00Z",
    content: `# Estrutura Semanal do Calendário Editorial GAG Visual

- **Semana 1 (Autoridade e Bastidores):** Realidade da agência, estudos de caso (ex: projeto PCA) e importância de identidade visual sólida.
- **Semana 2 (Educação e Dicas):** Dicas de Canva, WhatsApp Business e presença digital para empreendedores.
- **Semana 3 (Conversão e Oferta):** Promoção direta do Pacote de Lançamento (Kz 15.000) e criação de logótipos.
- **Semana 4 (Prova Social e Interação):** Depoimentos de clientes (ex: Comida Caseira Jolidanya), caixas de perguntas.

### Ganchos de Posts Chave:
- **Dia 1 (Reel/TikTok):** *"Soluções com propósito, inovação com raízes. Conhece a nova GAG Visual."* (CTA: Comenta 'EU QUERO')
- **Dia 3 (Carrossel):** *"Como transformámos a imagem da PCA com logótipo e vestuário personalizado."*
- **Dia 5 (Story/Post):** *"O teu negócio em Luanda merece mais do que amadorismo. Pacote de Lançamento por Kz 15.000."*
- **Dia 12 (Carrossel):** *"Quanto custa não ter uma marca profissional? O preço invisível da desorganização visual."*`,
  },
  {
    id: "kb-005",
    title: "Framework de Produção de Conteúdo e IA Aplicada",
    category: "CONTENT_STRATEGY",
    source: "Playbook Estratégico GAG",
    version: "1.8",
    status: "APPROVED",
    owner: "KIA Master",
    tags: ["IA", "Copywriting", "Workflows", "Escala"],
    associatedSkillIds: ["gag-content-production", "gag-prompt-engineering"],
    associatedAgentIds: ["agent-kia", "agent-consultant"],
    createdAt: "2026-02-05T12:00:00Z",
    updatedAt: "2026-08-18T09:10:00Z",
    content: `# Framework de Produção de Conteúdo e IA Aplicada

## 1. O Triângulo de Qualidade GAG
1. **Intenção Estratégica**: Todo conteúdo resolve uma dor real de negócios do cliente.
2. **Amplificação de IA**: Modelos avançados sintetizam dados, geram variações e aceleram a ideação.
3. **Curadoria Humana**: Refinamento de tom, checagem de fatos e polimento estético final.

## 2. Padrões de Roteirização
- Gancho inicial nos primeiros 3 segundos.
- Proposição de valor única e clara.
- Chamada para ação objetiva sem ambiguidades.`,
  },
  {
    id: "kb-006",
    title: "Protocolo de Scanner & Ingestão Documental",
    category: "INTERNAL_PROCESS",
    source: "Arquitetura Técnica GAG Core",
    version: "1.0",
    status: "APPROVED",
    owner: "Scanner Documental",
    tags: ["Scanner", "OCR", "Extração", "Segurança"],
    associatedSkillIds: ["gag-data-analysis-brief", "gag-security-screening"],
    associatedAgentIds: ["agent-scanner"],
    createdAt: "2026-08-14T15:00:00Z",
    updatedAt: "2026-08-21T11:45:00Z",
    content: `# Protocolo de Ingestão de Documentos

## 1. Fases do Scanner
1. **Recepção**: Upload do ficheiro (PDF, DOCX, TXT, imagem) para storage seguro.
2. **OCR & Extração**: Processamento via Gemini Document Intelligence com estruturação JSON.
3. **Validação de Papel**: Checagem de permissões e triagem de segurança.
4. **Transformação**: Conversão com 1 clique para artigo de conhecimento ou tarefas no backlog.`,
  },
  {
    id: "kb-007",
    title: "Norma Técnica: Metodologia de Prompting Interativo e Extração de Contexto",
    category: "INTERNAL_PROCESS",
    source: "Norma Técnica Metodologia de Prompting Interativo e Extração de Contexto",
    version: "2.0",
    status: "APPROVED",
    owner: "O Soba",
    tags: ["Prompting", "Engenharia de Prompt", "Contexto", "Chain-of-Thought", "Metodologia", "SOP"],
    associatedSkillIds: ["gag-prompt-engineering", "gag-knowledge-curation", "gag-ai-agent-design"],
    associatedAgentIds: ["agent-soba", "agent-kia", "agent-educator"],
    createdAt: "2026-08-23T11:00:00Z",
    updatedAt: "2026-08-23T13:45:00Z",
    content: `# Norma Técnica: Metodologia de Prompting Interativo e Extração de Contexto

## 1. Introdução à Engenharia de Prompt Interativa
A utilização de IA transitou definitivamente de um modelo passivo de "pergunta-resposta" para um paradigma de colaboração estratégica. É terminantemente proibido executar tarefas complexas sem um mapeamento contextual exaustivo.

## 2. Arquitetura da Persona e Especialidade
A Persona atua como um filtro de ruído técnico, garantindo o tom, as restrições e o rigor do domínio exigido.

## 3. Estruturação da Missão & Questionamento Sequencial (Chain-of-Thought)
Protocolo de Extração Interativa obrigatório:
- **Regra de Ouro:** *"Faça apenas UMA pergunta por vez e aguarde a resposta antes de fazer a próxima."*
- **Hierarquia de Extração:**
  1. Contexto (Domínio e histórico)
  2. Objetivo (Resultado final quantificável)
  3. Restrições (Prazos, orçamento, limites legais)
  4. Recursos (Ferramentas, APIs, bases de dados)
  5. Input Bruto final.

## 4. Padronização de Formato de Saída (Output Obrigatório)
Todo output executivo deve ser consumível em menos de 60 segundos:
- Tabelas em Markdown para dados estruturados e cronogramas.
- Matriz RACI para governança e atribuição de papéis.
- Matriz de Eisenhower (Urgente / Importante).
- Alertas de Risco destacados.
- Checklist de Ações Imediatas numeradas.`,
  },
  {
    id: "kb-008",
    title: "Compilação Mestre: 150+ Prompts Profissionais & Protocolo 360",
    category: "TECHNICAL",
    source: "Catálogo de Engenharia e Acervo de Prompts GAG Core 2026",
    version: "3.0",
    status: "APPROVED",
    owner: "O Soba",
    tags: ["Acervo", "150 Prompts", "Google Workspace", "Apps Script", "Automação", "Templates", "NotebookLM"],
    associatedSkillIds: ["gag-prompt-engineering", "gag-workflow-automation", "gag-video-production", "gag-content-production"],
    associatedAgentIds: ["agent-soba", "agent-kia", "agent-art-director", "agent-copywriter"],
    createdAt: "2026-08-23T11:30:00Z",
    updatedAt: "2026-08-23T13:45:00Z",
    content: `# Acervo de Prompts Estratégicos & Automação GAG Core

## 1. Módulos Cobertos
- **Módulo 1: Domínio Google Workspace**: Triagem inteligente de Inbox, auditoria de documentos no Google Drive e cruzamento de agenda.
- **Módulo 2: Mestre de Planilhas & Sheets**: Limpeza de dados, categorização multilingue, Procv/Index Match e geradores de Dashboards.
- **Módulo 3: Automações com Google Apps Script**: Robôs de e-mails automáticos, geradores de faturas em PDF, sincronizadores de eventos na agenda e web scrapers.
- **Módulo 4: YouTube & Video Intelligence**: Desconstrução de roteiros, caçador de cortes virais e tradução de conhecimento técnico.
- **Módulo 5: Fábrica de Conteúdo & Copywriting**: Clonador de tom de voz, roteiros de alta retenção (Reels/Shorts de 60s), carrosséis e páginas de captura (LPs).
- **Módulo 6: Negócios & Vendas de Alta Performance**: Quebra de objeções, auditoria de propostas e parcerias estratégicas.
- **Módulo 7: Aprendizado Acelerado & Tutoria**: Tutor socrático, geradores de simuladores de exame e flashcards Anki.

## 2. Padrões de Estrutura (Frameworks CIRO & RTF)
- **CIRO:** Contexto, Intenção, Papel (Role), Saída (Output).
- **RTF:** Role (Papel), Task (Tarefa), Format (Formato).`,
  },
  {
    id: "kb-009",
    title: "Guia de Roteiros Cinematográficos & Criação de Marca Angolana (GAG Labs)",
    category: "BRANDING",
    source: "Formação IA na Prática — GAG Labs & Roteiros Cinematográficos",
    version: "2.1",
    status: "APPROVED",
    owner: "Diretor de Arte & Motion Veo",
    tags: ["Roteiros", "Vídeo", "Veo 3.1", "Canva", "Identidade Visual", "Angola", "Luanda"],
    associatedSkillIds: ["gag-design-with-ai", "gag-video-production", "gag-content-production"],
    associatedAgentIds: ["agent-art-director", "agent-copywriter", "agent-educator"],
    createdAt: "2026-08-23T12:00:00Z",
    updatedAt: "2026-08-23T13:45:00Z",
    content: `# Guia de Roteirização Audiovisual & Criação de Marca — GAG Labs

## 1. Princípios Cinematográficos & Veo 3.1
- **Estrutura Fixa de Metadados:** METADATA_CORE → LANGUAGE_RULES → VISUAL_STYLE → GLOBAL_RULES → CHARACTER_LOCK → STORY_CORE → CONTINUITY → ROTEIRO → NEGATIVE_PROMPT.
- **Instruções Técnicas e Câmaras:** Em inglês (ex: *8K, Octane Render, volumetric light, drone FPV, cinematic depth of field*).
- **Falas e Diálogos:** Português de Angola (Luanda).
- **Regras:** Sem marcas de água indesejadas, sem logótipos distorcidos, proporção 16:9 para ecrãs e 9:16 para Reels/TikTok.

## 2. Metodologia de Ensino da GAG Labs
- **Aula 1:** Fundamentos, ChatGPT e modelos de linguagem aplicados a negócios angolanos.
- **Aula 2:** Produção de Conteúdo, currículos executivos e copywriting.
- **Aula 3:** Design com IA, paletas corporativas, logótipos e cartazes.
- **Aula 4:** Vídeo com IA, narração e geração com Veo.
- **Aula 5:** Projeto Final de Construção de Marca Completa com Propósito e Raízes.`,
  },
  {
    id: "kb-010",
    title: "Guia de Auditoria e System Instructions Especializadas GAG Visual (Scanner Económico, Logística, Inbox Zero, Ghostwriter e Engenharia UI/UX)",
    category: "INTERNAL_PROCESS",
    source: "Diretrizes Operacionais e Prompts Especializados GAG Visual / GAG Labs 2026",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["FIN-OPER", "MKT-SALES", "MEDIA-PROD", "Scanner Económico", "Logística Luanda", "Inbox Zero", "High-Ticket", "Tailwind UX"],
    associatedSkillIds: ["gag-financial-rag", "gag-angolan-tax-compliance", "gag-crm-requirements", "gag-workflow-automation", "gag-design-with-ai"],
    associatedAgentIds: ["agent-kia", "agent-soba", "agent-consultant", "agent-copywriter", "agent-brandkit"],
    createdAt: "2026-08-25T07:20:00Z",
    updatedAt: "2026-08-25T07:20:00Z",
    content: `# Compilação de System Instructions & Protocolos Especializados — GAG Visual / GAG Labs

## 1. 📊 Scanner de Economia Real [TAG: FIN-OPER]
- **Persona:** Auditor Financeiro Forense e Analista de Custos de Elite (Mercado Angolano: ENDE, Unitel, Movicel, ZAP, DSTV).
- **Dados Corporativos:** Josemar Lukeni Gaspar do Amaral Gourgel — Comércio Geral e Prestação de Serviços (SU), Lda · NIF: 5001654063 · Slogan: *"Soluções com propósito, inovação com raízes."*
- **Missão:** Extrair metadados críticos, auditar linhas de consumo, identificar VAS/taxas indevidas e classificar desperdício (escala 1 a 10).
- **Formato de Saída:**
  - Relatório de Auditoria Financeira - GAG Visual (Emitente, Valor em Kz, Data).
  - Tabela de Análise e Custos Extraídos (Item, Categoria, Valor Kz, Parecer).
  - Alertas de Desperdício e Cobranças Suspeitas.
  - Plano de Ação Imediato.

## 2. 📅 Arquiteto de Logística e Prazos [TAG: FIN-OPER]
- **Persona:** Assistente Executivo de Elite & Especialista em Logística Operacional (Foco C-Level / CEO).
- **Contexto:** Sede na Centralidade do Kilamba, Prédio D26, Luanda, Angola (Horário GMT+1).
- **Missão:** Cruzar e-mails (Gmail), reservas de voos/hotéis e deadlines no Drive com a agenda, mitigando riscos de trânsito em Luanda e conflitos de horários.
- **Formato de Saída:** Linha do Tempo Consolidada, Alertas de Conflito e Recomendações Logísticas de Elite.

## 3. 📥 Gestor de Triagem e Inbox Zero [TAG: FIN-OPER]
- **Persona:** Gestor de Triagem e Especialista em Produtividade de Caixa de Entrada (Inbox Zero).
- **Categorização Obrigatória:** \`[AÇÃO URGENTE]\` (<24h), \`[ACOMPANHAMENTO]\` (Projetos em curso), \`[INFORMATIVO]\` (Recibos/Updates).
- **Regras Comerciais GAG Visual:** 50% de sinal obrigatório na adjudicação + 50% na entrega; Taxa de Urgência (48h) com acréscimo de +50%.
- **Formato de Saída:** Tabela Markdown com prioridade e links + Rascunhos de Resposta de Elite em blocos de código (\`code blocks\`) para ações urgentes.

## 4. 🦅 Ghostwriter de Follow-up de Elite [TAG: MKT-SALES]
- **Persona:** Copywriter de Resposta Direta de Elite, Especialista em Prospecção Corporativa e Fechamento High-Ticket.
- **Metodologia TOB:** Tecnologia (APIs/automação), Organização (Gems/processos), Branding (Design premium e autoridade).
- **Regras:** Sinal de 50% obrigatório, urgência com taxa de +50% (48h), escassez real da agenda de Josemar Gourgel.
- **Formato de Saída:** Análise de Fricção + Sequência de Follow-up de 3 e-mails (Valor, Proposta TOB/ROI, Urgência/Fecho).

## 5. 💻 Arquiteto de Software & Engenheiro de UI/UX [TAG: MEDIA-PROD]
- **Persona:** Arquiteto de Software, Engenheiro Front-End Sênior e Designer UX/UI Premium (Padrão SaaS Dark Mode 2026).
- **Diretrizes de Design GAG Visual / GAG Labs:**
  - Preto Profundo / Cartões: #0A0A0F e #14141C.
  - Azul Royal GAG (Inovação): #003FD3.
  - Dourado GAG (Luxo e Selos): #DAA520.
  - Prata Metálico: #C0C0C0.
  - Ação/CTA: Verde-limão (#B6FF3C) ou Magenta.
  - Tipografia: Space Grotesk / Montserrat (Títulos) + Inter / Open Sans (Corpo).
- **Requisitos Técnicos:** Código limpo, autocontido em arquivo único HTML com Tailwind CSS via CDN e Lucide Icons, sem links externos frágeis e sem placeholders genéricos.`,
  },
  {
    id: "kb-011",
    title: "POP-MKT-SALES-2026: Atendimento ao Cliente & Prospecção Comercial de Elite (Metodologia TOB & Regras de Ouro GAG)",
    category: "CLIENT_PLAYBOOK",
    source: "POP-MKT-SALES-2026-v1 — Josemar Gourgel (Diretor Geral)",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["POP", "MKT-SALES", "TOB", "Qualificação Socrática", "Sinal 50%", "Veto Manuel Rosa", "Compliance", "Scripts"],
    associatedSkillIds: ["gag-crm-requirements", "gag-workflow-automation", "gag-knowledge-curation"],
    associatedAgentIds: ["agent-kia", "agent-consultant", "agent-copywriter"],
    createdAt: "2026-08-22T08:00:00Z",
    updatedAt: "2026-09-20T06:00:00Z",
    content: `# Procedimento Operacional Padrão (POP): Atendimento ao Cliente & Prospecção Comercial de Elite

- **Código:** POP-MKT-SALES-2026-v1 (Sistematizado em 22 de Agosto de 2026)
- **Responsável Técnico:** Josemar Gourgel (Diretor Geral)
- **Empresa:** GAG Visual (Josemar Lukeni Gaspar do Amaral Gourgel — SU Lda.)
- **Sede:** Centralidade do Kilamba, Luanda, Angola | gagvisualcorp@gmail.com | NIF Oficial: 5001654063

---

## 1. Diretrizes de Branding Inegociáveis
- **Tom de Voz:** Corporativo, assertivo, tecnologicamente avançado e focado no ROI. Evitar termos informais ou jargão excessivamente complexo sem analogias.
- **Tempo de Resposta:** Máximo de 2 horas para triagem inicial e rascunho de resposta a clientes VIP ou prospecções urgentes.
- **Identificação Oficial:** Sempre usar o NIF oficial (5001654063) e a sede no Kilamba em todas as propostas e minutas.

---

## 2. Metodologia TOB (Tecnologia, Organização e Branding)
- **Fase 1: Triagem & Recepção (Gmail / WhatsApp) [TAG: FIN-OPER]**
  Varrer mensagens com foco em \`[AÇÃO URGENTE]\` de clientes VIP ou parceiros estratégicos. Identificar a intenção real e preparar o rascunho de resposta imediatamente.
- **Fase 2: Qualificação Socrática do Lead [TAG: MKT-SALES]**
  **Regra Fundamental:** NUNCA enviar preços ou tabelas de investimento antes do diagnóstico. Fazer uma pergunta de cada vez, diagnosticando:
  1. O tipo de negócio e rotina atual do cliente;
  2. As metas comerciais e de produtividade;
  3. Os recursos de infraestrutura e orçamentais disponíveis.
- **Fase 3: Apresentação da Proposta (Venda Baseada em Valor)**
  Desenhar propostas modulares estruturadas em Sumário Executivo (focado em ROI), Escopo Técnico detalhado por pilares (Tecnologia, Organização e Branding), Cronograma e Tabela de Investimento.
  - **Regra de Ouro da GAG Visual:** Sinal obrigatório de **50% na adjudicação** e **50% na entrega final**.
  - **Taxa de Urgência (48h):** Em caso de urgência na entrega (prazo igual ou inferior a 48 horas), aplicar o acréscimo obrigatório da Taxa de Urgência de **+50%** sobre o valor total do escopo.
- **Fase 4: Formalização, Fecho & Onboarding [TAG: CORP-LEGAL]**
  Com a concordância do cliente, emitir o Contrato Mestre GAG Visual 2026 e a respetiva Fatura-Recibo do sinal. Estão incluídas até 2 (duas) rondas de revisão por projeto de design ou consultoria. Alterações adicionais faturadas à parte.

---

## 3. Scripts e Modelos de Resposta Rápida
- **Script A — Recepção & Qualificação de Lead de Consultoria:**
  > "Olá, [Nome do Cliente]! Agradecemos o seu contacto e o interesse no ecossistema da GAG Visual.
  > Na GAG, nós não trabalhamos com pacotes genéricos de IA, mas sim com automações de alta performance desenhadas sob medida para o ROI do seu negócio.
  > Para desenharmos a solução ideal, poderia responder a uma questão rápida: qual é o principal gargalo operacional ou desperdício de tempo que a sua equipa enfrenta hoje no dia a dia?
  > Aguardo o seu retorno para avançarmos,
  > Josemar Gourgel — Diretor Geral, GAG Visual"

- **Script B — Cobrança Elegante do Sinal de Adjudicação (50%):**
  > "Olá, [Nome do Cliente]. Espero que esteja a ter um excelente dia!
  > Informamos que o planeamento técnico e o design do seu projeto já estão prontos na nossa mesa para serem iniciados.
  > Conforme estipulado na nossa proposta comercial e na Cláusula 3 do nosso Contrato Mestre, a ativação da equipa e o início dos trabalhos ocorrem mediante a liquidação do sinal de 50%.
  > Segue em anexo a Fatura-Recibo correspondente para que possamos iniciar a execução hoje mesmo. Qualquer dúvida, estou à total disposição!
  > Forte abraço,
  > Josemar Gourgel — Diretor Geral, GAG Visual"

---

## 4. Gestão de Conflitos e Segurança [TAG: COMPLIANCE-RISK]
1. **Validar o Sentimento do Cliente:** Ouvir ativamente e responder com tom calmo e executivo, sem admitir culpa jurídica precoce.
2. **Oferecer Solução Prática:** Agendar uma videochamada técnica de alinhamento em até 24 horas para sanar arestas.
3. **Controle de Acessos & Credenciais:** É estritamente proibida a exposição ou envio de chaves de API sensíveis em chats ou e-mails abertos com clientes.
4. **Veto de Negócios (Alerta Vermelho):** Interdição total e permanente de qualquer negócio, parceria, intermediação ou consultoria com a entidade **Manuel Rosa Business Corporation**, salvaguardando a integridade legal e reputacional da GAG Visual.`,
  },
  {
    id: "kb-012",
    title: "Manual de Identidade Visual Profissional GAG — Ecossistema K & Arquitetura de Marca",
    category: "BRANDING",
    source: "Manual de Identidade Visual GAG (Ecossistema K) — 2026",
    version: "2.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Identidade Visual", "Ecossistema K", "Paleta", "Cores", "Tipografia", "Laranja", "Roxo", "Inter", "Plus Jakarta Sans"],
    associatedSkillIds: ["gag-design-with-ai", "gag-knowledge-curation"],
    associatedAgentIds: ["agent-kia", "agent-brandkit", "agent-art-director"],
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-20T06:00:00Z",
    content: `# Sumário Executivo: Identidade Visual GAG & Ecossistema K

## 1. Conceito Criativo: O Ecossistema K
A GAG não é apenas uma empresa; é o **Ecossistema K**. Este conceito central representa a interconexão entre tecnologia, impacto social e experiência humana. O "K" simboliza o núcleo de conhecimento (*Knowledge*) e a estrutura modular de nossa atuação. A identidade visual reflete fluidez, modernidade e a capacidade de integrar soluções complexas de forma simples e escalável.

## 2. Paleta de Cores Oficial e Psicologia
- **Laranja Vibrante (#FF6B35):** Energia, criatividade e o motor da inovação.
- **Roxo Profundo (#7D3C98):** Sofisticação, tecnologia de ponta e pensamento estratégico.
- **Lavanda Suave (#A29BFE):** Conexão humana, empatia e o toque inovador.
- **Cinza Carbono (#2D3436):** Autoridade, clareza técnica e base sólida.
- **Off-White (#F4F4F9):** Transparência, minimalismo e espaço para respiro.
- **Acentos Corporativos:** Azul Royal GAG (#003FD3), Dourado Real (#DAA520) e Preto Ônix (#05070C).

## 3. Tipografia Institucional
- **Inter:** Textos longos, contratos e interfaces. Fonte geométrica, altamente legível em telas e ambientes densos.
- **Plus Jakarta Sans:** Títulos, cabeçalhos executivos e destaques de marca.

## 4. Tom de Voz & Tagline Oficial
- **Tom de Voz:** Inovadora, acessível e direta. Clareza técnica e autoridade humana com transparência.
- **Tagline Oficial:** *"Conectando o futuro, simplificando sua jornada."*
- **Slogan Principal:** *"GAG: Seu mundo conectado no Ecossistema K."*`,
  },
  {
    id: "kb-013",
    title: "Projeto KIA — Auditoria Fiscal, Faturas (Angola) & Especificação de Engenharia",
    category: "TECHNICAL",
    source: "Documento Executivo de Engenharia & Negócios — Versão 1.0 (Setembro 2026)",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Projeto KIA", "Auditoria Fiscal", "NIF Angola", "BAI", "Multicaixa", "PWA", "Supabase", "Firebase"],
    associatedSkillIds: ["gag-angolan-tax-compliance", "gag-financial-rag", "gag-workflow-automation"],
    associatedAgentIds: ["agent-kia", "agent-scanner"],
    createdAt: "2026-09-15T08:00:00Z",
    updatedAt: "2026-09-20T06:00:00Z",
    content: `# Projeto KIA — Auditoria Fiscal & Faturas (Angola)

## 1. Escopo Técnico de Software
- **Validador automático de NIF de Angola:** Validação algorítmica de NIF corporativo e singular.
- **Auditoria de faturas fiscais e reconciliação bancária:** Cruzamento de extratos com documentos fiscais emitidos.
- **PWA Instalável & Cache Offline:** Service Worker ativo, precache de assets e suporte offline resiliente.
- **Registro Trancado & Hierarquia de Convites:** Primeiro usuário registrado assume papel de Principal/Admin.
- **WhatsApp Webhooks & Alertas:** Disparar mensagens de aviso, confirmações de pedido ou lembretes via API oficial ou Z-API / Evolution.
- **Sincronização Híbrida:** IndexedDB/LocalStorage com sync automático bidirecional em nuvem (Supabase Postgres RLS e Firebase Firestore).

## 2. Condições Comerciais & Pagamento Oficiais (Luanda / KIA)
- **Regra Operacional KIA:** Sinal de 50% para Adjudicação + 50% na Entrega.
- **Banco:** Banco Angolano de Investimentos (BAI) • Titular: GAG Visual Core - Soluções Tecnológicas.
- **IBAN Oficial:** AO06.0040.0000.1234.5678.1012.3.
- **Referência Multicaixa:** Entidade: **10234** | Ref: **987 654 321**.`,
  },
  {
    id: "kb-014",
    title: "Especificação Institucional: Sistema de Gestão Operacional — Centro Gileade",
    category: "TECHNICAL",
    source: "Prompt Mestre de Construção & Manual de Funcionamento do Sector de Estatística 2026",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Centro Gileade", "Gestão Operacional", "Estatística", "Logística", "Inventário", "Transporte", "Auditoria", "Supabase RLS"],
    associatedSkillIds: ["gag-knowledge-curation", "gag-workflow-automation", "gag-data-analysis-brief"],
    associatedAgentIds: ["agent-kia"],
    createdAt: "2026-09-20T06:00:00Z",
    updatedAt: "2026-09-20T06:00:00Z",
    content: `# Sistema de Gestão Operacional — Centro Gileade (Versão 1.0)

## 1. Arquitetura Funcional Institucional
Plataforma central unificada baseada no Manual de Funcionamento do Sector de Estatística do Centro Gileade (2026):
1. **Estatística:** Registos, Cadastro configurável, Indicadores de evolução/distribuição, Histórico de alterações e Relatórios consolidados. Estados: RASCUNHO, REGISTADO, VALIDADO, CONSOLIDADO, ARQUIVADO.
2. **Actividades:** Calendário institucional com estados (PLANEADA, CONFIRMADA, EM_PREPARAÇÃO, EM_CURSO, CONCLUIDA, ARQUIVADA).
3. **Logística:** Pedidos logísticos rastreados (PEDIDO, REGISTADO, EM_ANALISE, APROVADO, REJEITADO, EM_PREPARACAO, EM_EXECUCAO, CONCLUIDO, ARQUIVADO) e Operações vinculadas.
4. **Inventário:** Categorias, Itens com conservação (NOVO, BOM, REGULAR, DANIFICADO, EM_MANUTENCAO, INUTILIZADO) e Movimentações (ENTRADA, SAÍDA, TRANSFERÊNCIA, DEVOLUÇÃO, AJUSTE) sem alteração silenciosa de stock.
5. **Transporte:** Veículos, Motoristas e Pedidos de Transporte com destino, finalidade e passageiros.
6. **Auditoria & Segurança:** Trilha imutável com UUID, timestamp, utilizador, entidade, valores anteriores e novos. Row Level Security (RLS) no PostgreSQL/Supabase.
7. **Matriz de Perfis:** Administrador, Liderança, Coordenador, Operador e Consulta.
8. **Regra de Integridade:** Se não existirem dados disponíveis, apresentar estritamente "Sem dados disponíveis" sem inventar registos fictícios.`,
  },
  {
    id: "kb-015",
    title: "Manual do Roteirista GAG (v1.0)",
    category: "BRANDING",
    source: "Manual de Geração Audiovisual",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Audiovisual", "Roteiro", "Storyboard", "IA", "Continuidade", "Angola"],
    associatedSkillIds: ["gag-design-with-ai", "gag-knowledge-curation"],
    associatedAgentIds: ["agent-art-director", "agent-kia"],
    createdAt: "2026-09-23T19:40:00Z",
    updatedAt: "2026-09-23T19:40:00Z",
    content: `# MANUAL DO ROTEIRISTA GAG (v1.0)

## 1. Regra-Mãe
O Manual, as regras pré-definidas e o storyboard-mestre são a base obrigatória de toda criação audiovisual. A IA não deve reinventar regras existentes, omitir requisitos ou introduzir elementos não solicitados.

## 2. Objectivo
Ensinar a IA a operar como Roteirista GAG: pensar como roteirista, realizador, director de fotografia e especialista em geração audiovisual por IA, preservando história, personagens, geografia, figurino, acção, continuidade e identidade angolana.

## 3. Hierarquia Operacional
MANUAL -> BÍBLIA -> ROTEIRO -> CENA -> TAKE -> STORYBOARD -> PROMPT FINAL -> QA. Não saltar esta ordem.

## 4. Regras Críticas
- **Continuidade (Regra Crítica):** NENHUM TAKE COMEÇA ONDE O ANTERIOR NÃO TERMINOU. Controlado por START_STATE -> ACTION -> END_STATE.
- **Identidade Visual de Angola:** Nunca representar Angola como 'África genérica'. Respeitar local, época, arquitectura, transporte, vestuário, luz e clima angolanos. Proibida estética visual de Nigéria, Gana ou outros países. Taxis/candongueiros: azul e branco, nunca amarelo.
- **Negative Prompt:** NO CGI, NO cartoon/anime/stylization (exceto se solicitado), NO generic African city, NO inaccurate Angolan vehicles, NO invented landmarks, NO distorted hands/anatomy, NO generated text/watermarks/UI.`,
  },
  {
    id: "kb-016",
    title: "Dossiê de Intermediação Imobiliária de Elite: Mansão Kikuxi (850M Kz) & Edifício Mutamba (420M Kz)",
    category: "CLIENT_PLAYBOOK",
    source: "Dossiês de Venda GAG Visual & Relatório ALTYS NAI Global 2025",
    version: "2.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Kikuxi", "Mutamba", "Imóveis de Elite", "Co-brokeragem", "Mandato", "850M", "420M", "No-Circumvention", "Luanda"],
    associatedSkillIds: ["gag-real-estate-brokerage", "gag-financial-aoa-calculator"],
    associatedAgentIds: ["agent-kia", "agent-consultant"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:00:00Z",
    content: `# Dossiê de Intermediação Imobiliária de Elite — GAG Visual (Luanda)

## 1. Ativo 1: Mansão de Elite no Kikuxi (Viana, Estrada do Kikuxi / Engevia)
- **Terreno e Implantação:** 1 Hectare (10.000 m²) totalmente murado com arame farpado/fio de navalha e segurança reforçada. Árvores de fruto, depósito de água, pátio e anexo de apoio.
- **Estrutura:** Mansão multi-piso em betão armado, 2 pisos + terraço, volume superior com ripado de madeira e escada exterior independente (permite habitação + rendimento independente). Obra em fase avançada de acabamentos.
- **Valores & Metas:**
  - Preço de anúncio oficial: **850.000.000 Kz** (negociável para pronto pagamento).
  - Janela realista de fecho rápido: **700.000.000 Kz – 750.000.000 Kz**.
  - Comissão líquida fixa GAG: **25.000.000 Kz** (assegurada no fecho).
- **Documentação Obrigatória:** Mandato de venda assinado pela proprietária (mãe do magistrado) e certidão do registo predial do terreno atualizada.

## 2. Ativo 2: Espaço Comercial na Mutamba (Ingombota, Rua dos Mercadores / Travessa da Sé)
- **Localização:** Centro financeiro e comercial de Luanda, zona nobre.
- **Estrutura:** Espaço comercial de 2 pisos, estilo colonial preservado no rés-do-chão, grades de ferro trabalhado.
- **Documentação Legal:** Registo predial art.º 264, matriz predial nº 182 (sem ónus ou encargos).
- **Chancela Técnica:** Avaliação oficial de Outubro 2025 pela ALTYS Real Estate Advisors (rede NAI Global) de **396.930.000 Kz** (1,55M Kz/m²).
- **Valores:** Preço oficial de apresentação ancorado em **420.000.000 Kz** negociável. Comissão estimada de ~5% (**~20.000.000 Kz**).
- **Proprietário:** RL. MARCO, LDA.

## 3. Estratégia de Proteção e Co-Brokeragem
- **Cláusula de Não-Circundação (No-Circumvention):** 12 meses de proteção contratual em todas as propostas enviadas a agências parceiras. Qualquer negociação direta com proprietários obriga ao pagamento integral da comissão da GAG Visual.
- **Discrição Operacional:** Endereço exato e identidade do proprietário só são revelados após agendamento formal de visita com comprador qualificado.
- **Rede Parceira Contactada:** CASDA, Grupo ESCF, Prestígio Imóveis, Rosalina, Kiawa, TAA África, MPAC, Porta Sete, RE/MAX Multitrust, Boavida, Square Real Estate, Imobiliária 3S e Francisco Venâncio. Divisão padrão de comissão em 50/50 (ou 60/40 para quem traz comprador qualificado).
- **Regra de Compliance GAG:** Negócios ou contratos acima de 100.000 Kz exigem parecer e revisão jurídica formal.`,
  },
  {
    id: "kb-017",
    title: "Metodologia de Engenharia Agêntica Profissional GAG — Fluxo em 5 Etapas & Grafos DAG",
    category: "TECHNICAL",
    source: "Especificação de Sistemas Agênticos Profissionais & Arquitetura GAG Core OS",
    version: "2.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Sistemas Agênticos", "DAG", "Engenharia de Prompt", "Supervisão QA", "Paralelismo", "Subagentes", "Fluxo Profissional"],
    associatedSkillIds: ["gag-ai-agent-design", "gag-skill-creator", "gag-workflow-automation"],
    associatedAgentIds: ["agent-kia", "agent-automation-n8n"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:00:00Z",
    content: `# Metodologia de Engenharia Agêntica Profissional GAG (Versão 2.0)

## 1. Princípio Fundamental
O valor da IA corporativa não reside no prompt individual de 2023, mas na engenharia reversa de sistemas agênticos robustos, escaláveis e determinísticos.

## 2. As 5 Etapas do Fluxo Profissional
1. **Objetivo e Entrevista Prévia:** Não começar nunca com um prompt isolado. Mapear o objetivo estratégico e permitir que o sistema entreviste o decisor com perguntas de qualificação até que todos os requisitos de negócio estejam documentados.
2. **Planeamento Revisável:** Elaborar sempre uma especificação ou plano estruturado antes de executar. É muito mais económico e seguro corrigir texto de um plano do que refazer código ou tarefas executadas.
3. **Subdivisão e Paralelismo:** Decompor projetos complexos em camadas modulares (base de dados, backend, interface de usuário, automações) que rodam de forma concorrente através de múltiplos subagentes especialistas, multiplicando a velocidade de entrega.
4. **Supervisão e Verificação (QA Rubric):** Etapa mais crítica do sistema. O agente supervisor avalia a saída de cada subagente com base em critérios objetivos e mensuráveis de aceite. Se o output não cumprir os parâmetros, é rejeitado e reenviado para autocorreção antes de chegar ao cliente.
5. **Lógica de Grafos e Dependências (DAG):** Em fluxos complexos, as dependências são coordenadas como grafos direcionados acíclicos. Uma etapa filha só inicia se a etapa mãe foi aprovada pelo motor de QA, evitando erros de alucinação e contaminação de contexto.

## 3. Aplicação Comercial GAG Visual
Em todas as propostas comerciais de Luanda, o método de entrega segue: "Entrevista de Briefing -> Plano Estruturado Aprovado -> Execução Multi-Agente -> Validação de QA -> Entrega com Sinal de 50%".`,
  },
  {
    id: "kb-018",
    title: "Framework de Investigação e Análise Multimodal de Vídeo no YouTube (YouTube Video Research)",
    category: "CONTENT_STRATEGY",
    source: "Especificação YouTube Video Research Skill",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["YouTube", "Deep Research", "Multimodal", "Entrevistas", "Cotações", "Evidências", "Síntese"],
    associatedSkillIds: ["gag-youtube-video-research", "gag-data-analysis-brief"],
    associatedAgentIds: ["agent-kia", "agent-copywriter"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:00:00Z",
    content: `# Framework de Investigação e Análise Multimodal de Vídeo no YouTube

## 1. Porquê o YouTube como Fonte Primária
O YouTube hospeda entrevistas de CEOs, teleconferências de resultados (earnings calls), keynotes de fundadores, painéis de reguladores e demonstrações técnicas que contêm revelações em primeira pessoa não documentadas em artigos de texto.

## 2. Processo de Execução em 5 Passos
1. **Decomposição em 4 a 6 Temas:** Dividir o objetivo da pesquisa em temas analíticos específicos (ex: modelo de negócio, financials, tecnologia, bull case, bear case/riscos).
2. **Descoberta Temática:** Selecionar 2 a 3 vídeos por tema, totalizando 12 a 20 vídeos para investigação profunda (mínimo de 8 para padrão).
3. **Prompt de Alta Densidade (Prompt Engineering):** Nunca usar "resuma o vídeo". Exigir:
   - (A) Perfil do orador e credenciais.
   - (B) Pelo menos 8 a 10 citações verbatim entre aspas.
   - (C) Lista exaustiva de todos os números, valores monetários, datas e empresas.
   - (D) Argumentos centrais suportados por citações.
   - (E) Riscos e contra-argumentos.
   - (F) Avaliação de convicção e sentimento.
4. **Validação Cruzada:** Cruzar afirmações de vídeo com pesquisas web e fontes financeiras independentes.
5. **Síntese Rica em Citações:** Mínimo de 1 citação em bloco (> "...") a cada 300 palavras, contextualização em parágrafos de 3 a 5 frases e equilíbrio bull-bear (mínimo de 30% com posições críticas).`,
  },
  {
    id: "kb-019",
    title: "Manual de Auditoria Estratégica & Análise Competitiva de SEO (SEO Audit & Competitor Intelligence)",
    category: "CONTENT_STRATEGY",
    source: "Especificação SEO Competitor Analysis & Evidence-Led SEO Audit Skills",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["SEO", "Auditoria", "Concorrência", "Tráfego Orgânico", "Backlinks", "Palavras-Chave", "Arquitetura"],
    associatedSkillIds: ["gag-seo-competitor-analysis", "gag-seo-audit"],
    associatedAgentIds: ["agent-kia", "agent-social-media"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:00:00Z",
    content: `# Manual de Auditoria Estratégica & Análise Competitiva de SEO

## 1. Perspectiva Orientada ao Concorrente
Relatórios de análise competitiva explicam o que o concorrente está a fazer, onde estão as suas dependências e onde estão as suas vulnerabilidades. Nunca fornecem recomendações nem planos de ação para o concorrente; fornecem inteligência pura para quem compete contra ele.

## 2. Padrões de Resumo Executivo
- Parágrafo único e condensado de 150 a 200 palavras.
- Abertura obrigatória com headline em negrito resumindo o achado principal.
- Cobertura de: tendência do tráfego orgânico, páginas líderes, dependência de marca vs descoberta não-marcada, risco de concentração, achado técnico e perfil de backlinks.

## 3. Fluxo Obrigatório de Auditoria de Backlinks
1. **Headline:** Veredito claro sobre a força do perfil e se é orgânico, autoritário ou inflacionado.
2. **Qualidade dos Domínios:** Diferenciação entre domínios de alta autoridade vs redes manipulativas/spam.
3. **Distribuição de Âncoras:** Separação entre âncoras de marca, genéricas, palavras-chave exatas e spam.
4. **Destino dos Links:** Links apontando para a homepage (trabalho institucional/RP) vs links para páginas de ferramentas e produtos (esforço intencional de SEO).
5. **Veredito Final:** Diagnóstico sobre a durabilidade e sustentabilidade da autoridade.

## 4. Priorização Final Acionável
Lista numerada concisa contendo estritamente para cada item:
- **Problema:** Uma frase direta definindo o que está quebrado ou deficiente.
- **Correção:** Uma frase direta orientando a implementação técnica ou estrutural.`,
  },
  {
    id: "kb-020",
    title: "Framework de Criação e Arquitetura de Skills Modulares para Agentes IA (Skill Creator)",
    category: "INTERNAL_PROCESS",
    source: "Especificação Skill Creator Framework",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Skill Creator", "Progressive Disclosure", "Modularidade", "Workflows", "Templates", "Agentes"],
    associatedSkillIds: ["gag-skill-creator", "gag-ai-agent-design"],
    associatedAgentIds: ["agent-kia", "agent-automation-n8n"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:00:00Z",
    content: `# Framework de Criação e Arquitetura de Skills Modulares para Agentes IA

## 1. O Conceito de Skill
Skills são pacotes autocontidos e reutilizáveis de procedimentos, conhecimentos procedimentais e integrações que equipam agentes com capacidades especializadas sem sobrecarregar o prompt de sistema inicial.

## 2. Princípios de Engenharia
- **Concisão e Gestão de Contexto:** O contexto da janela de contexto é finito e partilhado. Desafiar cada frase: "O agente realmente precisa desta explicação?" e "Este parágrafo justifica o custo de tokens?".
- **Graus de Liberdade Calibrados:**
  - *Alta Liberdade (orientações textuais):* Processos criativos ou de julgamento flexível.
  - *Média Liberdade (pseudocódigo e parâmetros):* Padrões com espaço para adaptação de contexto.
  - *Baixa Liberdade (scripts rígidos e determinísticos):* Operações frágeis, cálculos fiscais, validação criptográfica.
- **Progressive Disclosure em 3 Níveis:**
  1. Nível 1 — Metadados no prompt de sistema (~100 palavras por skill).
  2. Nível 2 — Corpo da Skill (SKILL.md com <500 linhas) carregado apenas quando a skill é ativada.
  3. Nível 3 — Recursos auxiliares (scripts/, references/, templates/) consultados sob demanda.`,
  },
  {
    id: "kb-021",
    title: "Dossiê Comercial & Prospeção B2B Luanda: Restaurantes, Comércio, Serviços & Packs de Venda GAG",
    category: "CLIENT_PLAYBOOK",
    source: "Relatórios de Prospecção Diária GAG Visual & Business Hub 2026",
    version: "2.1",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Prospecção", "Leads Luanda", "Restaurantes", "Comércio", "Nandinhos", "Rua 11", "Packs GAG", "WhatsApp Business", "Webhook Sheets"],
    associatedSkillIds: ["gag-angola-lead-prospector", "gag-multiformat-content-generator"],
    associatedAgentIds: ["agent-kia", "agent-consultant", "agent-social-media"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:15:00Z",
    content: `# Dossiê Comercial & Prospeção B2B Luanda — GAG Visual (2026)

## 1. Arquitetura do Business Hub GAG (Soberania Digital)
- **A Frente:** Landing Page de alta conversão (ex: gagvisual-8jnk2yv5.manus.space ou gagvisual.lovable.app).
- **O Cérebro:** IA no WhatsApp que qualifica o lead 24/7 (Nome, Serviço, Orçamento, Prazo) com reforço do sinal de 50%.
- **A Segurança:** Base de dados resiliente no Google Sheets conectada via Webhook Google Apps Script dedicado.
- **Protocolo de Entrega ADM:** Criação em ambiente de teste da GAG; no fecho e liquidação integral dos 50% finais, transferência formal de propriedade (Owner) do Google Sheets e Apps Script para o e-mail do cliente, assegurando soberania de dados.

## 2. Catálogo Oficial de Soluções & Preços para Luanda
- **Pack Start (Presença Digital de Entrada):** **50.000 Kz – 85.000 Kz** (Landing Page + Link Direto WhatsApp + Logotipo/Flyer).
- **Pack Elite (Automação Total):** **150.000 Kz – 250.000 Kz** (Landing Page Premium + Webhook + Google Sheets + IA no WhatsApp).
- **Implementação de CRM Automático:** **50.000 Kz** (captura direta, boas-vindas no WhatsApp/email, sincronização com Sheets e follow-ups automáticos de 24h e 72h).
- **Manutenção & Suporte Mensal:** **15.000 Kz – 25.000 Kz / mês**.

## 3. Oportunidades Concretas Mapeadas em Luanda:
1. **Churrascaria Nandinhos (Kinaxixi/Luanda):** Filas diárias gigantescas, mas site Wix em construção e presença estática. Proposta: Pack "Frango Digital" com 12 Reels do processo de grelhados + Landing Page de encomendas com botão direto para WhatsApp.
2. **Restaurante Rua 11:** Casa histórica desde 1996 (funge, moamba, mufete), imagem datada. Proposta: Pack "Legado Vivo" com refresh de identidade visual, Reels institucionais e convites digitais para buffets de fim de semana.
3. **Ledaan Services:** Limpeza pós-obra e climatização corporativa. Proposta: Pack B2B com vídeos de 'Antes e Depois' para fechar contratos com grandes empresas.
4. **Onejo Comércio e Serviços:** Desinfestação e higiene. Proposta: Reels educativos e materiais institucionais para autoridade empresarial.
5. **Gestão de Condomínio (Kilamba):** Central do morador (reportar ocorrências, pedidos de manutenção, quotas), conectado a Google Sheets e WhatsApp.`,
  },
  {
    id: "kb-022",
    title: "Manual de Produção de Artigos Comparativos de Elite ('X vs Y') & Análise de SERP",
    category: "CONTENT_STRATEGY",
    source: "Especificação Comparison Article Writer Skill",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Artigos Comparativos", "X vs Y", "SEO", "Tabela Comparativa", "Veredito", "SERP Brief"],
    associatedSkillIds: ["gag-comparison-article-writer", "gag-seo-audit"],
    associatedAgentIds: ["agent-kia", "agent-copywriter"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:15:00Z",
    content: `# Manual de Produção de Artigos Comparativos de Elite ("X vs Y")

## 1. Princípio do Conteúdo de Decisão
Artigos comparativos não são despejos de especificações técnicas (feature dumps). São conteúdos de decisão pura: ajudam o leitor a saber quem é o vencedor para o seu caso de uso específico e o que comprar.

## 2. Estrutura Padrão Obrigatória
1. **Título Orientado a Intenção:** Formato "X vs Y: Qual é Melhor em [Ano]?" ou "X vs Y: [N] Diferenças Cruciais".
2. **Introdução com Veredito Imediato (100–150 palavras):** O leitor recebe o resumo executivo nos primeiros 2 parágrafos ("X é a escolha superior para equipas; escolha Y se necessitar de Z").
3. **Tabela Comparativa Rápida (Mandatória):** 5 a 8 dimensões de decisão, incluindo obrigatoriamente preços e planos reais.
4. **Visão Geral Resumida:** O que é cada opção e quem desenvolve.
5. **Análise Critério a Critério:** Comparação direta por dimensão com um vencedor claro por rodada e justificação objetiva.
6. **Prós e Contras Reais:** Sem falsas neutralidades.
7. **Recomendações por Caso de Uso:** "Escolha X se..." e "Escolha Y se...".
8. **Perguntas Frequentes (FAQ):** 3 a 5 perguntas frequentes para featured snippets de SEO.

## 3. Conjunto de 3 a 4 Imagens Estratégicas
- Imagem 1: Hero Image neutra no topo.
- Imagem 2: Infográfico comparativo side-by-side logo após a tabela.
- Imagem 3: Gráfico de dados quantitativos gerado com dados verificados.
- Imagem 4: Captura ou fotografia de suporte de interface ou caso de uso.`,
  },
  {
    id: "kb-023",
    title: "Diretrizes de Direção e Engenharia de Prompts para Vídeo com IA (Veo 3.1 / Runway Gen-3)",
    category: "CONTENT_STRATEGY",
    source: "Especificação Video Generator Skill",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Vídeo IA", "Veo 3.1", "Runway Gen-3", "Cinematografia", "Transition Description", "BGM Arc", "TTS Pacing"],
    associatedSkillIds: ["gag-ai-video-director", "gag-video-production"],
    associatedAgentIds: ["agent-kia", "agent-video-veo", "agent-art-director"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:15:00Z",
    content: `# Diretrizes de Direção e Engenharia de Prompts para Vídeo com IA

## 1. Regras Críticas de Execução
- **Formatos Válidos:** 16:9 widescreen ou 9:16 vertical ereto. Proibido formato 1:1.
- **Prompts Detalhados:** Prompts de uma linha são rejeitados. Exigir 2 a 4 frases completas de transição técnica.
- **Continuidade:** Reutilização do frame final do take anterior como primeiro frame do próximo (\`first_keyframe_reuse = yes\`).

## 2. Requisitos da Descrição de Transição (transition_description)
1. **Aparência do Sujeito:** Características físicas e vestuário consistentes do início ao fim.
2. **Trajetória de Movimento:** Direção e velocidade da câmara e do ator no espaço 3D.
3. **Mudanças de Estado:** Transformações lumínicas, de cor ou do ambiente.
4. **Declarações de Existência Contínua:** Menção a elementos que devem permanecer presentes sem pop-in/pop-out.

## 3. Desenho de Som & Música
- **Diálogo na Tela:** Gerado nativamente pelo modelo com sincronia labial. Nunca aplicar TTS em personagens falantes em cena.
- **Narração Off-screen:** Gerada em blocos via TTS com orçamento de tempo rígido (2.5 palavras por segundo em português).
- **Blueprint de BGM Emocional:** Tabela de arcos emocionais com segmentos de tempo [mm:ss - mm:ss], estado do arranjo (esparso, moderado, denso) e instrumentação.`,
  },
  {
    id: "kb-024",
    title: "Normas de Design e Modelagem de Planilhas Executivas Excel (Paleta, Tipografia e Blocos de Dados)",
    category: "TECHNICAL",
    source: "Especificação Excel Generator Skill",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Excel", "Modelagem Financeira", "Design de Planilhas", "Formatos Numéricos", "Bordas", "Key Insights"],
    associatedSkillIds: ["gag-excel-spreadsheet-architect", "gag-financial-rag"],
    associatedAgentIds: ["agent-kia", "agent-financial-analyst"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:15:00Z",
    content: `# Normas de Design e Modelagem de Planilhas Executivas Excel

## 1. Princípio de Clareza e Autoridade
A folha de cálculo deve permitir compreensão imediata no primeiro segundo de abertura. Elementos visuais servem para guiar os olhos e comunicar hierarquia, sem excessos de grelhas cinzentas.

## 2. Estrutura em 4 Camadas
- **Camada 1 (Estrutura):** Aba inicial "Overview" com índice e sumário. Coluna A vazia (largura 3) como margem esquerda. Tabelas iniciando na célula B2.
- **Camada 2 (Informação):** Formatação obrigatória em 100% das células numéricas (\`#,##0.00\` para valores, \`0.0%\` para percentagens). Igual precisão na mesma coluna. Inclusão de bloco "KEY INSIGHTS" com conclusões estratégicas.
- **Camada 3 (Visual):** Paleta unificada (ex: Elegant Black \`#2D2D2D\` ou Corporate Blue \`#1F4E79\`). Par tipográfico: Serif (Source Serif Pro / Georgia) para títulos e cabeçalhos; Sans-serif (Source Sans Pro / Calibri) para dados. Linhas horizontais discretas e supressão de linhas verticais poluídas.
- **Camada 4 (Interação):** Painéis congelados (freeze panes) no cabeçalho, filtros em tabelas >20 linhas e hiperlinks de navegação entre abas.`,
  },
  {
    id: "kb-025",
    title: "Protocolo GAG Academy: Formação em IA, Quizzes Determinísticos e Certificação A4",
    category: "INTERNAL_PROCESS",
    source: "Especificação GAG Academy Pedagogy Skill",
    version: "1.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["GAG Academy", "Certificados A4", "Quizzes", "Auditoria Pedagógica", "Formação IA", "QR Verificação"],
    associatedSkillIds: ["gag-academy-pedagogy", "gag-knowledge-curation"],
    associatedAgentIds: ["agent-kia", "agent-consultant"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:15:00Z",
    content: `# Protocolo GAG Academy: Formação em IA e Certificação

## 1. Avaliação Pedagógica Determinística
- Catálogo de perguntas e respostas com chave correta versionado no backend.
- A pontuação e a verificação são calculadas estritamente no servidor, impedindo manipulações do cliente.
- Histórico imutável de tentativas por aluno com timestamp e respostas.

## 2. Emissão de Certificados A4
- Layout padrão em página A4 formatado com CSS print (\`@page { size: A4 landscape; }\`).
- Código QR e código de validação único vinculado à base de dados.
- Carga horária e módulos listados correspondem estritamente aos registos reais de conclusão.

## 3. Resiliência Pedagógica (Modo Sem Vídeo)
- Disponibilização de manuais de texto completos, exercícios guiados e checklists para alunos sem acesso a internet de alta velocidade para streaming de vídeo em Luanda.`,
  },
  {
    id: "kb-026",
    title: "Especificações da API Manus v2: Ciclo de Vida de Tarefas, Webhooks e Output Estruturado",
    category: "TECHNICAL",
    source: "Guia Oficial Manus API v2",
    version: "2.0",
    status: "APPROVED",
    owner: "Josemar Gourgel",
    tags: ["Manus API", "API v2", "Tarefas", "Webhooks", "JSON Estruturado", "Projetos"],
    associatedSkillIds: ["gag-skill-creator", "gag-workflow-automation"],
    associatedAgentIds: ["agent-kia", "agent-automation-n8n"],
    createdAt: "2026-09-24T12:00:00Z",
    updatedAt: "2026-09-25T07:15:00Z",
    content: `# Especificações da API Manus v2

## 1. Autenticação e Protocolo
- **Base URL:** \`https://api.manus.ai\`.
- **Autenticação:** Cabeçalho \`x-manus-api-key: <key>\` para integrações diretas ou \`Authorization: Bearer <token>\` em Open Apps com OAuth2.
- **Envelope de Resposta:** \`ok: true\` para sucessos; \`ok: false\` com código de erro e request_id para falhas.

## 2. Principais Operações
- **Criação de Tarefas:** \`task.create\` com prompt, ferramentas e \`structured_output_schema\`.
- **Diálogo Multi-Turno:** \`task.sendMessage\` para continuação de tarefas abertas.
- **Webhooks:** \`webhook.create\` para receber notificações de ciclo de vida (\`task_stopped\`) sem polling constante.
- **Projetos:** \`project.create\` para instruções e personas permanentes partilhadas entre execuções.`,
  },
];

// Initial Tasks
export const INITIAL_TASKS: Task[] = [
  {
    id: "task-101",
    title: "Conectar Adapter Supabase PostgreSQL para Persistência Cloud",
    description: "Configurar variáveis de ambiente do Supabase e validar migração do schema para tabelas de conhecimento e tarefas.",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    assignedAgentId: "agent-kia",
    assignedUserId: "usr-owner-01",
    tags: ["Database", "Supabase", "Infra"],
    category: "Infraestrutura",
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-22T04:00:00Z",
    history: [
      { timestamp: "2026-08-20T08:00:00Z", user: "Josemar Gourgel", action: "Tarefa criada" },
      { timestamp: "2026-08-21T10:00:00Z", user: "KIA", action: "Status alterado para IN_PROGRESS" },
    ],
  },
  {
    id: "task-102",
    title: "Finalizar Pipeline de Extração OCR do Scanner Documental",
    description: "Garantir extração estruturada de PDFs e briefings com cálculo de índice de confiança e geração automática de tarefas.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    assignedAgentId: "agent-scanner",
    assignedUserId: "usr-owner-01",
    tags: ["Scanner", "OCR", "Documentos"],
    category: "Inteligência Documental",
    createdAt: "2026-08-19T14:00:00Z",
    updatedAt: "2026-08-22T05:00:00Z",
    history: [
      { timestamp: "2026-08-19T14:00:00Z", user: "Josemar Gourgel", action: "Tarefa criada com prioridade HIGH" },
    ],
  },
  {
    id: "task-103",
    title: "Revisão e Aprovação do Agente Consultor GAG",
    description: "Testar respostas do Consultor GAG no simulador da Agent Factory antes de mover do estado DRAFT para ACTIVE.",
    priority: "MEDIUM",
    status: "REVIEW",
    dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    assignedAgentId: "agent-kia",
    assignedUserId: "usr-owner-01",
    tags: ["Agent Factory", "Consultoria", "Revisão"],
    category: "Agentes",
    createdAt: "2026-08-18T16:30:00Z",
    updatedAt: "2026-08-21T18:00:00Z",
  },
  {
    id: "task-104",
    title: "Auditoria Completa de Permissões RBAC e Hash de Logs",
    description: "Verificar se nenhuma operação crítica de agente ocorre sem hash de auditoria e validação de permissão de OWNER.",
    priority: "HIGH",
    status: "TODO",
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    assignedAgentId: "agent-kia",
    assignedUserId: "usr-owner-01",
    tags: ["Segurança", "Auditoria", "RBAC"],
    category: "Segurança",
    createdAt: "2026-08-21T09:00:00Z",
    updatedAt: "2026-08-21T09:00:00Z",
  },
];

// Initial Calendar Events
export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "ev-01",
    title: "Entrega do Scanner Documental V1",
    description: "Marco de validação de processamento de documentos com OCR e extração estruturada.",
    type: "MILESTONE",
    startDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    allDay: true,
    priority: "CRITICAL",
    relatedTaskId: "task-102",
    relatedAgentId: "agent-scanner",
    status: "CONFIRMED",
  },
  {
    id: "ev-02",
    title: "Prazo: Conexão Supabase PostgreSQL",
    description: "Configuração do schema de persistência cloud e chaves de ambiente.",
    type: "TASK_DEADLINE",
    startDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    allDay: true,
    priority: "HIGH",
    relatedTaskId: "task-101",
    relatedAgentId: "agent-kia",
    status: "CONFIRMED",
  },
  {
    id: "ev-03",
    title: "Sessão Estratégica: Lançamento Agentes GAG",
    description: "Reunião executiva para ativação de novos agentes especializados na Agent Factory.",
    type: "MEETING",
    startDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    allDay: false,
    priority: "MEDIUM",
    relatedTaskId: "task-103",
    status: "CONFIRMED",
  },
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-001",
    timestamp: "2026-08-22T05:45:00Z",
    userId: "usr-owner-01",
    userName: "Josemar Gourgel",
    agentId: "agent-kia",
    agentName: "KIA",
    action: "Inicialização do Sistema Operacional GAG Core",
    capability: "system_implementation",
    status: "SUCCESS",
    details: "Núcleo operacional KIA carregado com 3 agentes, 10 skills e Execution Router ativo.",
    hash: "0x9f4a8b72e11c34a78ef45b9021a8bc43",
    confirmationGranted: true,
    ipOrEnv: "Cloud Run / AI Studio",
  },
  {
    id: "aud-002",
    timestamp: "2026-08-22T05:30:00Z",
    userId: "usr-owner-01",
    userName: "Josemar Gourgel",
    agentId: "agent-kia",
    agentName: "KIA",
    action: "Triagem de Permissões RBAC",
    capability: "internal_tool",
    status: "SUCCESS",
    details: "Papel OWNER validado com acesso irrestrito. Agentes restritos às suas capabilities declaradas.",
    hash: "0x7c3e12b489ad01ff88902a7b312ccb91",
    confirmationGranted: true,
  },
];
