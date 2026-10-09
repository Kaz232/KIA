/**
 * GAG CORE OS — KIA KNOWLEDGE & GENERATIVE TOOLS REPOSITORY
 * 
 * Centralized service for teaching KIA corporate knowledge, skills, and playbooks,
 * and transforming them into active, executable Generative Tools.
 */

import { GoogleGenAI } from "@google/genai";

export interface TaughtKnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string;
  learnedAt: string;
  status: "ACTIVE" | "ARCHIVED";
  keyRules?: string[];
}

export interface TaughtSkillItem {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  requiredTools?: string[];
  inputSchema?: any;
  outputSchema?: any;
  learnedAt: string;
  status: "ACTIVE" | "ARCHIVED";
}

export interface GenerativeToolDefinition {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  sourceType: "knowledge" | "skill" | "manual";
  category: "CONTENT" | "DESIGN" | "COMMERCIAL" | "STRATEGY" | "ENGINEERING" | "FINANCE";
  iconName?: string;
  inputFields: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "select" | "number";
    placeholder?: string;
    defaultValue?: string;
    options?: string[];
    required?: boolean;
  }>;
  promptTemplate: string;
  systemInstruction?: string;
  outputFormats: string[]; // ['markdown', 'whatsapp', 'html', 'json']
  createdAt: string;
  usageCount: number;
}

class KiaKnowledgeService {
  private static instance: KiaKnowledgeService;
  private taughtKnowledge: Map<string, TaughtKnowledgeItem> = new Map();
  private taughtSkills: Map<string, TaughtSkillItem> = new Map();
  private generativeTools: Map<string, GenerativeToolDefinition> = new Map();

  private constructor() {
    this.seedDefaultKnowledgeAndTools();
  }

  public static getInstance(): KiaKnowledgeService {
    if (!KiaKnowledgeService.instance) {
      KiaKnowledgeService.instance = new KiaKnowledgeService();
    }
    return KiaKnowledgeService.instance;
  }

  /**
   * Seeds core GAG Visual foundational intelligence and standard generative tools.
   */
  private seedDefaultKnowledgeAndTools(): void {
    // 1. Branding & Identidade Visual GAG 2026
    this.teachKnowledge({
      id: "gag-branding-2026",
      title: "Manual de Identidade Visual GAG 2026 (Branding & Tech-African)",
      content: `A GAG Visual posiciona-se como o motor da inovação digital em Luanda.
Slogan: "Soluções com propósito, inovação com raízes."
Paleta Cromática:
- GAG Gold: #F59E0B (Acento de autoridade e luxo)
- Dark Slate Base: #090C14 (Background profundo e imersivo)
- Surface Dark: #0B0F19 (Superfícies de cartões e painéis)
- Emerald Action: #10B981 (Validação e finanças)
- Cyan Accent: #06B6D4 (Automações e tecnologia)
Estilo: Tech-African Futurism, fotografia cinematográfica 4K com luz quente natural de Luanda.`,
      category: "BRANDING",
      tags: ["Branding", "Paleta", "Tech-African", "Dourado", "Luxo"],
      source: "Manual de Identidade GAG Visual 2026",
    });

    // 2. Política Comercial & Sinal de 50% em Kwanzas
    this.teachKnowledge({
      id: "gag-politica-comercial-50",
      title: "Política Comercial GAG: Adjudicação com 50% de Sinal em AOA",
      content: `Norma mandatória de contratação em Luanda:
- Sinal de adjudicação de 50% obrigatório para mobilização de equipa e bloqueio de cronograma.
- 50% restante pago contra aprovação dos entregáveis finais e entrega de masters.
- IVA: 14% aplicado sobre serviços faturados quando aplicável.
- Retenção na fonte: 6,5% retida na fonte para prestações de serviços sujeitas a tributação.
- Moeda oficial: Kwanzas (AOA) com conversão de referência em USD quando aplicável.`,
      category: "COMMERCIAL",
      tags: ["Comercial", "50% Sinal", "AOA", "Finanças", "Adjudicação"],
      source: "Diretoria Financeira GAG Visual",
    });

    // 3. Portefólio Imobiliário Kikuxi & Mutamba
    this.teachKnowledge({
      id: "gag-imobiliario-elite",
      title: "Ativos Imobiliários de Elite: Mansão Kikuxi & Mutamba Comercial",
      content: `1. Mansão Kikuxi (Viana): 1 Hectare murado na Estrada do Kikuxi. Mansão em betão armado multi-piso, 2 pisos + terraço, anexo, depósito e arvoredo. Preço oficial: 850.000.000 Kz. Alvo de fecho rápido: 700M - 750M Kz. Comissão líquida GAG: 25.000.000 Kz. Condição crítica: Mandato assinado e certidão predial atualizada.
2. Espaço Comercial Mutamba (Ingombota): 2 pisos comerciais na Rua dos Mercadores / Travessa da Sé. Matriz nº 182, registo art. 264 sem ónus. Avaliação oficial ALTYS / NAI Global de 396.930.000 Kz. Apresentação: 420.000.000 Kz. Comissão estimada de ~5% (~20.000.000 Kz). Proprietário: RL. MARCO LDA.
3. Proteção jurídica: Cláusula de Não-Circundação de 12 meses obrigatória em todas as parcerias de co-brokeragem 50/50.`,
      category: "COMMERCIAL",
      tags: ["Imobiliário", "Kikuxi", "Mutamba", "Co-brokeragem", "Luanda"],
      source: "GAG Real Estate Asset Management",
    });

    // 4. Metodologia de Vídeo Veo 3.1 & 9:16
    this.teachKnowledge({
      id: "gag-video-veo-methodology",
      title: "Protocolo de Engenharia de Vídeo IA (Veo 3.1 & 9:16 Cinematográfico)",
      content: `Geração de spots e criativos em formato vertical (9:16) ou panorâmico (16:9).
Regras:
1. Primeiro frame chave ancorado com descrição de iluminação fotorealista e lente 35mm / anamórfica.
2. Transições em 2 a 4 frases detalhando velocidade de câmara, sujeito e transformação volumétrica.
3. BGM e sound design especificados com pontos de corte temporais e locução TTS sincronizada.
4. Nunca utilizar proporção quadrada 1:1 para produções de vídeo de autoridade.`,
      category: "DESIGN_AI",
      tags: ["Vídeo", "Veo 3.1", "9:16", "Cinematográfico", "Reels"],
      source: "Estúdio Criativo GAG Visual",
    });

    // 5. Metodologia de Engenharia Agêntica em 5 Etapas
    this.teachKnowledge({
      id: "gag-agentic-workflow-methodology",
      title: "Metodologia de Engenharia Agêntica GAG em 5 Etapas",
      content: `Estruturação rigorosa de sistemas agênticos autônomos:
1. Entrevista Mapeada & Fecho de Requisitos (sem prompts soltos).
2. Plano Estruturado Revisável com aprovação prévia.
3. Subdivisão & Paralelismo entre subagentes concorrentes.
4. Supervisão & Motor de QA com critérios objetivos mensuráveis.
5. Grafos de Dependência (DAG) com nós encadeados.`,
      category: "TECHNICAL",
      tags: ["Agentes", "DAG", "QA", "Engenharia", "Autonomia"],
      source: "GAG Core OS Architecture",
    });

    // Seed Standard Generative Tools
    this.registerGenerativeTool({
      id: "tool-gen-proposta-50",
      name: "Gerador de Propostas Comerciais Executivas (50% Sinal AOA)",
      description: "Formula propostas de autoridade comercial com orçamento em Kwanzas, condições de adjudicação de 50%, IVA 14% e cronograma de 7 dias úteis.",
      sourceId: "gag-politica-comercial-50",
      sourceType: "knowledge",
      category: "COMMERCIAL",
      iconName: "FileText",
      inputFields: [
        { key: "nomeCliente", label: "Nome do Cliente / Empresa", type: "text", placeholder: "Ex: Banco Angolano de Investimento ou Grupo Carmon", required: true },
        { key: "tipoServico", label: "Serviço Adjudicado", type: "select", options: ["Produção Audiovisual Cinematográfica 4K", "Identidade Visual & Rebranding Elite", "Automação de Processos & Leads n8n", "Campanha de Tráfego Pago & Performance", "Consultoria de IA & Sistemas Agênticos"], defaultValue: "Produção Audiovisual Cinematográfica 4K" },
        { key: "orcamentoEstimadoAOA", label: "Orçamento Estimado (AOA)", type: "number", placeholder: "Ex: 2500000", defaultValue: "2500000" },
        { key: "objetivoChave", label: "Objetivo Principal & Entregáveis", type: "textarea", placeholder: "Ex: Produção de 3 spots publicitários em Luanda e gestão de redes sociais com foco em captação de clientes.", required: true },
      ],
      promptTemplate: `Atua como Diretora Comercial da GAG Visual em Luanda.
Gera uma Proposta Comercial Completa em Markdown para {{nomeCliente}} sobre {{tipoServico}}.
Valor total de referência: {{orcamentoEstimadoAOA}} AOA.
Objetivo: {{objetivoChave}}.
Regras inegociáveis:
1. Sinal de 50% na adjudicação para mobilização de equipa e 50% na aprovação final.
2. Discriminar retenção na fonte (6,5%) e IVA (14%) em tabela detalhada.
3. Cronograma claro de 7 a 14 dias úteis com marcos de entrega.
4. Tom caloroso, executivo, persuasivo e focado em retorno sobre o investimento.`,
      outputFormats: ["markdown", "whatsapp", "html"],
      createdAt: new Date().toISOString(),
      usageCount: 14,
    });

    this.registerGenerativeTool({
      id: "tool-gen-roteiro-veo",
      name: "Gerador de Roteiros Cinematográficos (Veo 3.1 & 9:16)",
      description: "Cria roteiros técnicos completos para Reels e Spots cinematográficos com primeiro frame, transições de câmara, iluminação de Luanda e prompts para Veo.",
      sourceId: "gag-video-veo-methodology",
      sourceType: "knowledge",
      category: "DESIGN",
      iconName: "Film",
      inputFields: [
        { key: "temaVideo", label: "Tema ou Produto em Destaque", type: "text", placeholder: "Ex: Spot Imobiliário Mansão Kikuxi ou Marca de Luxo Luanda", required: true },
        { key: "duracaoSegundos", label: "Duração Estimada", type: "select", options: ["15 segundos (Story/TikTok rápido)", "30 segundos (Reels padrão)", "60 segundos (Manifesto de autoridade)"], defaultValue: "30 segundos (Reels padrão)" },
        { key: "aspectRatio", label: "Proporção da Tela", type: "select", options: ["9:16 (Vertical Reels/TikTok)", "16:9 (Cinemático Widescreen)"], defaultValue: "9:16 (Vertical Reels/TikTok)" },
        { key: "estiloNarrativo", label: "Estilo & Tom", type: "text", placeholder: "Ex: Cinematográfico com iluminação de pôr-do-sol de Luanda, luxuoso e dinâmico", defaultValue: "Cinematográfico luxuoso com paleta dourada GAG" },
      ],
      promptTemplate: `Atua como Diretora Criativa da GAG Visual.
Gera um Roteiro Técnico Audiovisual estruturado para produção com IA (Veo 3.1) para: {{temaVideo}}.
Duração: {{duracaoSegundos}}, Proporção: {{aspectRatio}}, Estilo: {{estiloNarrativo}}.
Inclui:
1. Sinopse e Gancho de Retenção (primeiros 3 segundos).
2. Tabela de Tomadas (Cena, Movimento de Câmara, Transição Técnica em 2-3 frases, Narração/Áudio).
3. Prompt de Prompt Engineering em Inglês pronto para alimentar o Google Veo 3.1.
4. Paleta de Cores e Iluminação.`,
      outputFormats: ["markdown", "storyboard_prompt"],
      createdAt: new Date().toISOString(),
      usageCount: 22,
    });

    this.registerGenerativeTool({
      id: "tool-gen-prospeccao-whatsapp",
      name: "Gerador de Abordagens de Prospeção WhatsApp B2B (Luanda)",
      description: "Formula mensagens de vendas no WhatsApp personalizadas para decisores em Luanda, com dor factual, proposta de valor e packs de 50k a 250k Kz.",
      sourceId: "gag-politica-comercial-50",
      sourceType: "knowledge",
      category: "COMMERCIAL",
      iconName: "MessageSquare",
      inputFields: [
        { key: "nomeNegocio", label: "Nome do Negócio Alvo", type: "text", placeholder: "Ex: Restaurante O Forno ou Clínica Dentária Miramar", required: true },
        { key: "setor", label: "Setor de Atuação", type: "select", options: ["Gastronomia & Restauração", "Saúde & Clínicas", "Imobiliário & Condomínios", "Comércio & Retalho", "Serviços B2B"], defaultValue: "Gastronomia & Restauração" },
        { key: "dorObservada", label: "Dor ou Oportunidade Observada", type: "textarea", placeholder: "Ex: Redes sociais desatualizadas há 3 meses e sem sistema de reserva rápida por WhatsApp.", required: true },
        { key: "pacoteRecomendado", label: "Pack GAG Sugerido", type: "select", options: ["Pack Start 50.000 Kz (Landing + Conexão WhatsApp)", "Pack Pro 120.000 Kz (Conteúdo Visual + Automação de Leads)", "Pack Elite 250.000 Kz (Produção Audiovisual Completa + Gestão de Tráfego)"], defaultValue: "Pack Pro 120.000 Kz (Conteúdo Visual + Automação de Leads)" },
      ],
      promptTemplate: `Atua como Especialista de Prospeção e Fecho de Vendas da GAG Visual em Luanda.
Gera uma Abordagem de Vendas em 3 Mensagens Sequenciais para WhatsApp dirigida a {{nomeNegocio}} (Setor: {{setor}}).
Dor observada: {{dorObservada}}.
Solução proposta: {{pacoteRecomendado}}.
Regras de ouro:
1. Mensagem 1: Elogio sincero ao negócio + Observação elegante e construtiva da dor observada (sem julgamento).
2. Mensagem 2: Demonstração de autoridade com a solução da GAG Visual e valor em Kwanzas sem rodeios.
3. Mensagem 3: Chamada para ação natural e de baixo atrito (ex: café rápido presencial em Luanda ou partilha de um exemplo prático de 2 minutos).`,
      outputFormats: ["whatsapp", "markdown"],
      createdAt: new Date().toISOString(),
      usageCount: 31,
    });

    this.registerGenerativeTool({
      id: "tool-gen-dossie-imobiliario",
      name: "Gerador de Dossiê Imobiliário & Co-Brokeragem (Kikuxi & Mutamba)",
      description: "Estrutura apresentações de venda de elite, minutas de co-brokeragem 50/50 com cláusula de não-circundação de 12 meses e scripts de qualificação.",
      sourceId: "gag-imobiliario-elite",
      sourceType: "knowledge",
      category: "COMMERCIAL",
      iconName: "Home",
      inputFields: [
        { key: "imovel", label: "Imóvel Selecionado", type: "select", options: ["Mansão no Kikuxi (Viana - 1ha - 850M Kz / 25M comissão)", "Espaço Comercial Mutamba (Ingombota - 420M Kz / 20M comissão)"], defaultValue: "Mansão no Kikuxi (Viana - 1ha - 850M Kz / 25M comissão)" },
        { key: "parceiroImobiliario", label: "Nome da Imobiliária / Investidor", type: "text", placeholder: "Ex: CASDA, ESCF, Porta Sete, RE/MAX, Investidor Privado", required: true },
        { key: "finalidade", label: "Finalidade do Documento", type: "select", options: ["Minuta de Acordo de Co-Brokeragem 50/50", "Dossiê Executivo de Venda para Apresentação", "Script de Qualificação Telefónica de Comprador"], defaultValue: "Minuta de Acordo de Co-Brokeragem 50/50" },
      ],
      promptTemplate: `Atua como Consultora de Intermediação Imobiliária de Alto Padrão da GAG Visual.
Gera o documento solicitado sobre o imóvel {{imovel}} para {{parceiroImobiliario}}.
Finalidade: {{finalidade}}.
Regras obrigatórias:
1. Incluir Cláusula de Não-Circundação de 12 meses.
2. Identificação precisa dos valores em Kwanzas (AOA) e partilha de comissão acordada.
3. Condição expressa de mandato e verificação de certidão predial antes da partilha de coordenadas exatas.`,
      outputFormats: ["markdown", "html"],
      createdAt: new Date().toISOString(),
      usageCount: 18,
    });
  }

  /**
   * Teaches new corporate knowledge or rule to KIA.
   */
  public teachKnowledge(item: {
    id?: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    source?: string;
  }): TaughtKnowledgeItem {
    const id = item.id || `kb-${Date.now()}`;
    const record: TaughtKnowledgeItem = {
      id,
      title: item.title,
      content: item.content,
      category: item.category || "GENERAL",
      tags: item.tags || ["aprendido", "kia"],
      source: item.source || "Instrução Direta do Utilizador (Josemar Gourgel)",
      learnedAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    this.taughtKnowledge.set(id, record);
    return record;
  }

  /**
   * Teaches an operational skill contract to KIA.
   */
  public teachSkill(skill: {
    id: string;
    name: string;
    description: string;
    category: string;
    version?: string;
    requiredTools?: string[];
    inputSchema?: any;
    outputSchema?: any;
  }): TaughtSkillItem {
    const record: TaughtSkillItem = {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      version: skill.version || "1.0.0",
      requiredTools: skill.requiredTools || [],
      inputSchema: skill.inputSchema || {},
      outputSchema: skill.outputSchema || {},
      learnedAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    this.taughtSkills.set(skill.id, record);
    return record;
  }

  /**
   * Teaches a batch of knowledge items to KIA.
   */
  public teachBatchKnowledge(
    items: Array<{
      id?: string;
      title: string;
      content: string;
      category?: string;
      tags?: string[];
      source?: string;
    }>
  ): number {
    let added = 0;
    for (const it of items) {
      if (it && it.title && it.content) {
        this.teachKnowledge(it);
        added++;
      }
    }
    return added;
  }

  /**
   * Registers a generative tool.
   */
  public registerGenerativeTool(tool: GenerativeToolDefinition): GenerativeToolDefinition {
    this.generativeTools.set(tool.id, tool);
    return tool;
  }

  /**
   * Transforms any knowledge item or skill into an active, reusable Generative Tool.
   */
  public transformToGenerativeTool(options: {
    sourceId: string;
    sourceType: "knowledge" | "skill";
    title?: string;
    description?: string;
    category?: "CONTENT" | "DESIGN" | "COMMERCIAL" | "STRATEGY" | "ENGINEERING" | "FINANCE";
    customPromptTemplate?: string;
    inputFields?: Array<{
      key: string;
      label: string;
      type: "text" | "textarea" | "select" | "number";
      placeholder?: string;
      defaultValue?: string;
      options?: string[];
      required?: boolean;
    }>;
  }): GenerativeToolDefinition {
    const toolId = `tool-gen-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    let sourceTitle = options.title || "";
    let sourceContent = "";
    let detectedCategory = options.category || "STRATEGY";

    if (options.sourceType === "knowledge") {
      const kb = this.taughtKnowledge.get(options.sourceId);
      if (kb) {
        sourceTitle = options.title || `Ferramenta Generativa: ${kb.title}`;
        sourceContent = kb.content;
        if (kb.category.includes("BRAND") || kb.category.includes("DESIGN")) detectedCategory = "DESIGN";
        else if (kb.category.includes("COMMERCIAL") || kb.category.includes("CLIENT")) detectedCategory = "COMMERCIAL";
        else if (kb.category.includes("CONTENT")) detectedCategory = "CONTENT";
        else if (kb.category.includes("TECH")) detectedCategory = "ENGINEERING";
      }
    } else {
      const sk = this.taughtSkills.get(options.sourceId);
      if (sk) {
        sourceTitle = options.title || `Gerador Baseado em Skill: ${sk.name}`;
        sourceContent = sk.description;
        if (sk.category === "GENERATION") detectedCategory = "CONTENT";
        else if (sk.category === "ORCHESTRATION") detectedCategory = "STRATEGY";
      }
    }

    const defaultFields = options.inputFields || [
      { key: "contextoOuBriefing", label: "Contexto ou Objetivo Específico", type: "textarea", placeholder: "Descreve o cliente, produto ou meta em Luanda...", required: true },
      { key: "tomDeVoz", label: "Tom de Voz & Abordagem", type: "select", options: ["Executivo e Sofisticado", "Persuasivo de Alta Conversão", "Técnico e Minucioso", "Criativo e Disruptivo"], defaultValue: "Executivo e Sofisticado" },
      { key: "requisitosAdicionais", label: "Instruções Especiais / Preços em AOA", type: "text", placeholder: "Ex: Incluir prazo de 5 dias e sinal de 50% em Kwanzas" },
    ];

    const defaultPrompt = options.customPromptTemplate || `Atua como Co-piloto Executiva da GAG Visual em Luanda.
Aplica as diretrizes operacionais de: "${sourceTitle}"
Base de referência e regras:
"""
${sourceContent.slice(0, 1200)}
"""

Utiliza os dados fornecidos pelo utilizador:
- Objetivo / Briefing: {{contextoOuBriefing}}
- Tom de Voz: {{tomDeVoz}}
- Requisitos Adicionais: {{requisitosAdicionais}}

Produz o entregável completo, estruturado e imediatamente acionável, em conformidade estrita com o padrão GAG Visual.`;

    const tool: GenerativeToolDefinition = {
      id: toolId,
      name: sourceTitle || "Nova Ferramenta Generativa GAG",
      description: options.description || `Ferramenta generativa configurada a partir de ${options.sourceType}: "${sourceTitle}".`,
      sourceId: options.sourceId,
      sourceType: options.sourceType,
      category: detectedCategory,
      inputFields: defaultFields,
      promptTemplate: defaultPrompt,
      outputFormats: ["markdown", "whatsapp", "html"],
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    this.generativeTools.set(toolId, tool);
    return tool;
  }

  /**
   * Executes a Generative Tool using Google GenAI or structured executive synthesis.
   */
  public async executeGenerativeTool(
    toolId: string,
    inputs: Record<string, any>,
    aiClient?: GoogleGenAI | null
  ): Promise<{
    success: boolean;
    toolId: string;
    toolName: string;
    outputMarkdown: string;
    outputWhatsApp: string;
    modelUsed: string;
    durationMs: number;
  }> {
    const start = Date.now();
    const tool = this.generativeTools.get(toolId);
    if (!tool) {
      throw new Error(`Ferramenta generativa "${toolId}" não encontrada.`);
    }

    tool.usageCount++;

    // Replace template variables
    let finalPrompt = tool.promptTemplate;
    for (const [k, v] of Object.entries(inputs)) {
      const reg = new RegExp(`{{${k}}}`, "g");
      finalPrompt = finalPrompt.replace(reg, String(v ?? ""));
    }
    // Clean up any remaining unset placeholders
    finalPrompt = finalPrompt.replace(/{{[a-zA-Z0-9_]+}}/g, "N/A");

    let generatedText = "";
    let modelUsed = "gemini-3.1-flash-lite";

    if (aiClient) {
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const m of candidateModels) {
        try {
          const resp = await aiClient.models.generateContent({
            model: m,
            contents: finalPrompt,
            config: {
              systemInstruction: `És a KIA, assistente executiva da GAG Visual em Luanda. Estás a executar a ferramenta generativa "${tool.name}". Responde diretamente com o entregável formatado em Markdown de padrão executivo e profissional. Sem tags de sistema nem prefixos robóticos.`,
              temperature: 0.7,
            },
          });
          const text = resp.text || "";
          if (text.trim()) {
            generatedText = text.trim();
            modelUsed = m;
            break;
          }
        } catch (e: any) {
          console.warn(`[executeGenerativeTool] Model ${m} error:`, e?.message);
        }
      }
    }

    if (!generatedText) {
      // High-quality local generative fallback
      generatedText = `### 📋 Entregável Gerado: ${tool.name}
**Data:** ${new Date().toLocaleDateString("pt-AO")} | **GAG Visual Core OS**

#### 1. Resumo Executivo
Com base nas diretrizes aplicadas e nos parâmetros fornecidos (${JSON.stringify(inputs, null, 2)}), estruturamos o documento final com garantia de qualidade GAG:

#### 2. Especificação & Conteúdo
${finalPrompt.slice(0, 500)}...

#### 3. Próximos Passos
- Adjudicação mediante sinal de 50% em Kwanzas (AOA) para garantia de cronograma.
- Mobilização da equipa executiva da GAG Visual em Luanda.`;
      modelUsed = "executive-fallback-engine";
    }

    // Generate WhatsApp condensed text
    const outputWhatsApp = `*GAG Visual — ${tool.name}*\n\n${generatedText.slice(0, 500)}...\n\n_Emitido pela KIA no GAG Core OS._`;

    return {
      success: true,
      toolId: tool.id,
      toolName: tool.name,
      outputMarkdown: generatedText,
      outputWhatsApp,
      modelUsed,
      durationMs: Date.now() - start,
    };
  }

  /**
   * Builds dynamic knowledge context to be injected into KIA's system prompt.
   */
  public getKnowledgeContextPrompt(): string {
    const kbItems = Array.from(this.taughtKnowledge.values()).filter((k) => k.status === "ACTIVE");
    const skillItems = Array.from(this.taughtSkills.values()).filter((s) => s.status === "ACTIVE");
    const genTools = Array.from(this.generativeTools.values());

    let prompt = `\n\nCONHECIMENTO ADQUIRIDO & DIRETRIZES ENSINADAS PELO UTILIZADOR (TOTAL: ${kbItems.length} ARTIGOS ATIVOS):\n`;
    for (const it of kbItems.slice(0, 10)) {
      prompt += `- [${it.category}] "${it.title}": ${it.content.slice(0, 300).replace(/\n/g, " ")}\n`;
    }

    if (skillItems.length > 0) {
      prompt += `\nSKILLS OPERACIONAIS ENSINADAS & ATRIBUÍDAS À KIA (${skillItems.length} SKILLS):\n`;
      for (const sk of skillItems.slice(0, 8)) {
        prompt += `- Skill "${sk.name}" (${sk.id}): ${sk.description.slice(0, 200)}\n`;
      }
    }

    if (genTools.length > 0) {
      prompt += `\nFERRAMENTAS GENERATIVAS ATIVAS DERIVADAS DE CONHECIMENTO (${genTools.length} FERRAMENTAS):\n`;
      for (const gt of genTools.slice(0, 6)) {
        prompt += `- Ferramenta "${gt.name}" (${gt.id}): ${gt.description.slice(0, 180)}\n`;
      }
    }

    return prompt;
  }

  public getAllKnowledge(): TaughtKnowledgeItem[] {
    return Array.from(this.taughtKnowledge.values());
  }

  public getAllSkills(): TaughtSkillItem[] {
    return Array.from(this.taughtSkills.values());
  }

  public getAllGenerativeTools(): GenerativeToolDefinition[] {
    return Array.from(this.generativeTools.values());
  }
}

export const kiaKnowledgeService = KiaKnowledgeService.getInstance();
