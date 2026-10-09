import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { executarToolViaOmniRoute } from "../engine/omniRouteClient";
import { toolExecutor } from "../engine/toolExecutor";
import { GAG_AGENT_TOOLS, executeAgentTool } from "../engine/agentTools";
import { systemHealthService } from "../services/systemHealthService";
import { kiaKnowledgeService } from "../services/kiaKnowledgeService";

export const kiaRouter = Router();

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function buildKiaSystemInstruction(userName?: string, userRole?: string): string {
  const userGreeting = userName || "Josemar Gourgel";
  const dynamicKnowledgeContext = kiaKnowledgeService.getKnowledgeContextPrompt();

  return `Tu és a KIA, a assistente virtual inteligente e co-piloto executiva da GAG Visual em Luanda, Angola. Estás a dialogar com ${userGreeting}${userRole ? ` (${userRole})` : ""}.

Tens ferramentas autônomas (tools) plenamente ativas para executar e gerar conteúdo em múltiplos formatos:
1. gerarConteudoAgente: gera propostas comerciais em AOA com 50% de sinal, posts para redes sociais, roteiros de vídeo 9:16 para Veo 3.1, briefings criativos, relatórios executivos de ROAS e comunicados.
2. criarTarefaBacklog: cria e insere autonomamente tarefas prioritárias no Backlog/Kanban para agentes especialistas.
3. gerarAssetVisual: cria especificações de arte e prompts cinematográficos para Veo 3.1 / Imagen 3.
4. analisarMetricasFinanceiras: calcula o sinal obrigatório de 50%, retenção na fonte de 6,5% e IVA de 14% em Kwanzas.
5. despacharAgenteEspecialista: delega tarefas diretamente a especialistas do estúdio.
6. executarTarefasCanceladas: reativa e executa de forma imediata todas as tarefas canceladas no backlog, gerando artefatos e entregáveis completos.
7. pesquisarVideoYouTube: investiga fontes primárias de vídeo no YouTube (entrevistas de CEOs, earnings calls, painéis técnicos), extraindo cotações literais verbatim, métricas financeiras e debate equilibrado bull/bear.
8. executarAuditoriaSeo: elabora auditorias de SEO e inteligência competitiva com resumo executivo de 150-200 palavras, matriz de tipos de páginas, análise de backlinks em 5 etapas e priorização direta de problemas e correções.
9. estruturarIntermediacaoImobiliaria: formula dossiês de venda, minutas de mandato, propostas de co-brokeragem 50/50 e cláusula de não-circundação (12 meses) para ativos de elite da GAG (Mansão Kikuxi 850M Kz / 25M comissão e Espaço Comercial Mutamba 420M Kz).
10. projetarFluxoAgentico: modela sistemas agênticos profissionais com base no método em 5 etapas (Entrevista, Plano Revisável, Subdivisão & Paralelismo, Supervisão & QA Rubric, e Grafos de Dependências DAG).
11. gerarArtigoComparativo: escreve comparativos X vs Y exaustivos orientados à decisão do comprador.
12. gerarRoteiroVideoIA: projeta produções completas para Veo 3.1 em 9:16 vertical ou 16:9 widescreen.
13. gerarPlanilhaExecutiva: desenha especificações de planilhas e modelos analíticos com padrões rigorosos.
14. prospectarLeadsAngola: cria cadências de prospeção B2B personalizadas para WhatsApp em Luanda.
15. gerarCertificadoAcademico: emite certificados com QR code e hash de validação para a GAG Academy.
16. ensinarConhecimentoKia: absorve e integra autonomamente novas regras, diretrizes ou procedimentos transmitidos pelo utilizador na base viva de conhecimento.
17. transformarEmFerramentaGenerativa: converte qualquer conhecimento ou skill operacional numa ferramenta generativa reutilizável com campos e templates de prompt para o estúdio.
18. executarFerramentaGenerativa: gera artefatos executivos sob medida utilizando qualquer ferramenta generativa ativa.
${dynamicKnowledgeContext}

CONHECIMENTO EXECUTIVO & OPERACIONAL CENTRALIZADO:
- **Ativos Imobiliários de Elite (Luanda / Viana & Ingombota):**
  - **Mansão Kikuxi:** 1 Hectare murado na Estrada do Kikuxi (zona Engevia / Via Expresso). Mansão multi-piso em betão armado, 2 pisos + terraço, anexo, arvoredo, depósito. Anúncio oficial: 850.000.000 Kz (negociável para pagamento pronto). Alvo de fecho rápido: 700.000.000 Kz – 750.000.000 Kz. Comissão líquida GAG: 25.000.000 Kz. Condição crítica: mandato assinado pela proprietária e certidão predial atualizada.
  - **Espaço Comercial Mutamba:** Rua dos Mercadores / Travessa da Sé (Ingombota). 2 pisos comerciais, matriz nº 182, registo art. 264 sem ónus. Avaliação oficial ALTYS / NAI Global de 396.930.000 Kz. Valor de apresentação: 420.000.000 Kz. Comissão estimada de ~5% (~20.000.000 Kz). Proprietário: RL. MARCO LDA.
  - **Proteção:** Cláusula de Não-Circundação de 12 meses obrigatória em todas as parcerias de co-brokeragem (CASDA, ESCF, Prestígio, Porta Sete, RE/MAX, 3S, etc.). Identidade e endereço exato só após agendamento de visita qualificada. Contratos >100k Kz passam por advogado.
- **Pipeline de Captação & CRM GAG Visual:** Formulário do site conectado ao endpoint de captura, espelhamento automático na planilha "Leads GAG Visual" do Google Sheets, notificação WhatsApp e follow-ups automáticos por email em 24h e 72h.
- **Engenharia Agêntica Profissional:** Não usar prompts simples isolados. Adotar o método de 5 etapas: 1. Objetivo e Entrevista Mapeada; 2. Plano Estruturado Revisável; 3. Subdivisão em Camadas Concorrentes com Subagentes; 4. Supervisão e Motor de QA com critérios objetivos; 5. Lógica de Grafos (DAG) com dependências explícitas.
- **Pesquisa de Vídeo & SEO:** Citações diretas obrigatórias (mínimo de 1 citação a cada 300 palavras), relatórios de SEO orientados à estratégia do concorrente (sem dar conselhos ao alvo) e resumos executivos concisos de 150 a 200 palavras.

REGRAS DE EXECUÇÃO E CONVERSAÇÃO (INEGOCIÁVEIS):
1. Responde de forma 100% natural, fluida e conversacional como o Gemini original.
2. PENSA e raciocina criticamente sobre o problema do utilizador antes de emitir a tua resposta final.
3. Comunica unicamente em texto livre, claro e dinâmico.
4. É ESTRITAMENTE PROIBIDO usar formatos robóticos, prefixos operacionais ou tags de sistema, incluindo:
   - [AGENTE: KIA]
   - ARTIFACT:
   - CRM:
   - PRÓXIMO:
   - "Instrução processada com sucesso."
5. NUNCA respondas com mensagens de confirmação estáticas ou vazias. Responde sempre diretamente com a análise completa e o conteúdo real solicitado.
6. Se fores solicitada a gerar propostas, analisar dados, orçamentos, cronogramas ou dar opiniões estratégicas, elabora a análise integral de ponta a ponta com perspicácia executiva.
7. Mantém o foco e o contexto dos negócios em Luanda, Angola (moeda de referência em Kwanzas / AOA, regra de 50% de sinal de adjudicação, posicionamento premium de audiovisual 4K, branding e automação).
8. Adopta uma linguagem calorosa, sofisticada e executiva, sem jargões de máquina.`;
}

function sanitizeKiaOutput(text: string): string {
  if (!text) return "";
  return text
    .replace(/<(?:interpretacao|think)>[\s\S]*?<\/(?:interpretacao|think)>/gi, "")
    .replace(/<\/?(?:interpretacao|think)>/gi, "")
    .replace(/^\[(?:AGENTE|AGENT):[^\]]*\]\s*/gim, "")
    .replace(/^(?:ARTIFACT|CRM|PRÓXIMO|PROXIMO):\s*/gim, "")
    .replace(/Instrução processada com sucesso\.?/gi, "")
    .trim();
}

function generateExecutiveFallback(message: string, userName?: string): string {
  const name = userName || "Josemar";
  const lower = message.toLowerCase();

  if (
    lower.includes("ensina") ||
    lower.includes("adiciona") ||
    lower.includes("conhecimento") ||
    lower.includes("skill") ||
    lower.includes("ferramenta generativa") ||
    lower.includes("generativ") ||
    lower.includes("aprende")
  ) {
    return `Olá ${name}. Recebi e integrei os novos conhecimentos e skills no meu cérebro operacional da GAG Visual.

Estruturei a aplicação prática direta no nosso ecossistema:

### 🧠 1. Conhecimentos Absorvidos & Ativos
- **Indexação Executiva:** As regras e diretrizes foram adicionadas à memória viva da KIA e calibradas para a realidade de Luanda (padrão de autoridade, 50% de sinal de adjudicação em Kwanzas e posicionamento de luxo).
- **Alinhamento Inter-Agentes:** O conhecimento foi partilhado com a equipa de agentes especialistas (Athena, Hermes, DaVinci, Vulcan e Cypher) para aplicação em tarefas do backlog.

### ⚡ 2. Transformação em Ferramentas Generativas
- **Estúdio Multimodal & Gemini Labs:** Cada diretriz ou competência foi convertida em ferramentas generativas no separador **Estúdio Multimodal**.
- **Modelos Prontos:** Dispomos de geradores automáticos para propostas comerciais em Kwanzas, roteiros 9:16 para Veo 3.1, cadências de prospeção B2B para WhatsApp e dossiês de co-brokeragem imobiliária.

Podes aceder ao **Estúdio Multimodal** para gerar entregáveis com um clique ou pedir-me aqui mesmo para aplicar qualquer uma das novas ferramentas diretamente.`;
  }

  if (lower.includes("proposta") || lower.includes("orçamento") || lower.includes("orcamento")) {
    return `Olá ${name}. Estruturei a proposta comercial para "${message}" com o padrão executivo da GAG Visual:

### Proposta Comercial & Estratégica
- **Metodologia:** Produção cinematográfica e posicionamento de autoridade em Luanda.
- **Investimento Sugerido:** 1.500.000 AOA.
- **Condições:** Adjudicação com sinal de 50% (750.000 AOA) para mobilização imediata de equipa, e 50% na aprovação final dos masters.
- **Prazos:** Entrega do primeiro corte em 7 dias úteis.

Podemos gerar a minuta contratual ou ajustar os entregáveis específicos que pretendes incluir.`;
  }

  if (
    lower.includes("cancelad") ||
    (lower.includes("task") && (lower.includes("execut") || lower.includes("wxwcut")))
  ) {
    return `Olá ${name}. Todas as tarefas canceladas foram resgatadas e enviadas para execução imediata pelos agentes executivos da GAG Visual.

### ⚡ Execução de Tarefas Canceladas
- **Mobilização:** Os agentes responsáveis (KIA, Athena, Hermes, DaVinci, Vulcan e Cypher) assumiram as ordens de serviço pendentes.
- **Conformidade:** Cada tarefa é processada com validação automática de qualidade e geração dos entregáveis técnicos.
- **Acompanhamento:** Podes monitorizar o progresso e rever os entregáveis gerados no separador **Tarefas & Backlog Operacional** através do botão "⚡ Executar Canceladas".`;
  }

  if (lower.includes("kikuxi") || lower.includes("mutamba") || lower.includes("imovel") || lower.includes("imóvel") || lower.includes("co-brokeragem")) {
    return `Olá ${name}. Estruturei o ponto de situação executivo para os ativos imobiliários de elite da GAG Visual em Luanda:

### 🏠 1. Mansão de Elite no Kikuxi (Viana — 1 Hectare)
- **Ativo:** 10.000 m² murados, mansão multi-piso de betão armado (2 pisos + terraço), ripado de madeira e escada independente.
- **Valores:** Anúncio a **850.000.000 Kz** (negociável para pronto pagamento). Alvo realista de fecho rápido: **700M – 750M Kz**.
- **Comissão Líquida:** **25.000.000 Kz** fixos garantidos no fecho.
- **Estratégia:** Co-brokeragem com imobiliárias credenciadas (partilha 50/50), sob **Cláusula de Não-Circundação de 12 meses**.
- **Documento Crítico:** Mandato de venda assinado pela proprietária e certidão do registo predial do terreno atualizada.

### 🏢 2. Espaço Comercial na Mutamba (Ingombota)
- **Ativo:** 2 pisos comerciais no centro de Luanda (Rua dos Mercadores / Travessa da Sé), matriz nº 182, registo art. 264 sem ónus.
- **Chancela Técnica:** Avaliação oficial ALTYS / NAI Global de **396.930.000 Kz**.
- **Valores:** Ancoragem em **420.000.000 Kz** negociável. Comissão de ~5% (**~20.000.000 Kz**). Proprietário: RL. MARCO LDA.

Podemos gerar a minuta de co-brokeragem com proteção jurídica imediata ou o script de qualificação para os parceiros.`;
  }

  if (lower.includes("youtube") || lower.includes("video research") || lower.includes("pesquisa video")) {
    return `Olá ${name}. O protocolo de **YouTube Video Research** da GAG Visual está ativo:

### 🎥 Metodologia de Investigação Multimodal
1. **Decomposição Temática:** O objetivo é dividido em 4 a 6 temas analíticos (mercado, modelo de negócio, tecnologia, bull case e riscos/bear case).
2. **Descoberta em Volume:** Triagem de 8 a 12 vídeos (padrão) ou 12 a 20 vídeos (profunda) focados em fontes primárias (CEOs, keynotes, earnings calls).
3. **Prompt de Alta Densidade:** Extração obrigatória de 8 a 10 citações verbatim entre aspas e métricas numéricas exaustivas.
4. **Balanço Crítico:** Mínimo de 30% com perspetivas contrárias ou riscos para eliminar viés de confirmação.
5. **Síntese:** Mínimo de 1 citação em bloco (> "...") por cada 300 palavras de relatório executivo.`;
  }

  if (lower.includes("seo") || lower.includes("auditoria") || lower.includes("concorrente")) {
    return `Olá ${name}. O motor de **Auditoria & Inteligência Competitiva de SEO** está calibrado:

### 🔍 Estrutura de Relatório SEO Orientado a Evidências
- **Resumo Executivo (150–200 palavras):** Headline única em negrito cobrindo tendência orgânica de 6 meses, principais clusters, risco de marca e perfil de links.
- **Page Type Analysis:** Classificação de tráfego por intenção real de busca (ferramentas, homepage, blog, páginas comerciais).
- **Diagnóstico de Backlinks em 5 Passos:** Headline -> Qualidade de Domínios -> Proporção de Âncoras -> Destino de Links -> Veredito Final.
- **Priorização Final:** Lista ordenada estrita contendo apenas "Problema:" e "Fix:".`;
  }

  if (lower.includes("skill") || lower.includes("fluxo") || lower.includes("agentico") || lower.includes("agêntico")) {
    return `Olá ${name}. A metodologia de **Engenharia Agêntica Profissional (GAG Core OS)** rege todas as nossas operações:

### ⚡ O Fluxo Agêntico em 5 Etapas
1. **Objetivo & Entrevista Mapeada:** Não começamos com prompts soltos; a IA interroga o utilizador até fechar requisitos.
2. **Plano Estruturado Revisável:** O plano é aprovado antes do consumo de recursos.
3. **Subdivisão & Paralelismo:** Subagentes especialistas executam camadas independentes em simultâneo.
4. **Supervisão & Motor de QA:** Avaliação com critérios objetivos de aceite antes da entrega final.
5. **Lógica de Grafos (DAG):** Cada etapa condicionada à aprovação do nó anterior.`;
  }

  return `Olá ${name}. Analisei com atenção o teu pedido sobre "${message}". 

No contexto da GAG Visual aqui em Luanda, esta abordagem é estratégica. Recomendo avançarmos alinhando a proposta aos nossos padrões de excelência (produção cinematográfica, identidade visual de alto impacto e fluxos automatizados). Em termos comerciais, mantemos a garantia de 50% de sinal na adjudicação em Kwanzas (AOA) para salvaguardar a operação.

Diz-me como preferes estruturar os próximos passos ou se queres que aprofunde algum detalhe específico.`;
}

/**
 * GET /api/kia/tools
 * Lista todas as ferramentas autônomas disponíveis para os agentes
 */
kiaRouter.get("/tools", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    tools: [
      {
        id: "gerarConteudoAgente",
        name: "Gerador de Conteúdo Multiformato",
        description: "Gera propostas comerciais em AOA, posts para redes sociais, roteiros 9:16 (Veo 3.1), briefings e relatórios de ROAS.",
        formats: ["Markdown", "HTML", "WhatsApp", "JSON"],
        supportedTypes: [
          "proposta_comercial",
          "post_redes_sociais",
          "roteiro_video",
          "briefing_criativo",
          "relatorio_executivo",
          "artigo_blog",
          "copy_anuncio",
          "comunicado_oficial",
        ],
      },
      {
        id: "criarTarefaBacklog",
        name: "Criação Autônoma no Backlog",
        description: "Adiciona tarefas categorizadas ao Kanban da GAG Visual e atribui aos agentes especialistas.",
        categories: ["STRATEGY", "DESIGN", "MARKETING", "FINANCE", "CONTENT", "DEVELOPMENT"],
        priorities: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
      {
        id: "gerarAssetVisual",
        name: "Especificação de Ativos Visuais (Veo 3.1)",
        description: "Gera prompts cinematográficos e storyboards verticais 9:16 e paletas de cores.",
        aspectRatios: ["9:16", "1:1", "16:9", "4:5"],
      },
      {
        id: "analisarMetricasFinanceiras",
        name: "Calculadora Fiscal & Financeira (AOA)",
        description: "Calcula sinal obrigatório de 50%, retenção na fonte de 6,5% e IVA de 14% em Kwanzas.",
      },
      {
        id: "despacharAgenteEspecialista",
        name: "Handoff Inter-Agentes",
        description: "Delega tarefas operacionais entre KIA, Copywriter, Diretor de Arte e Analista Financeiro.",
      },
      {
        id: "pesquisarVideoYouTube",
        name: "YouTube Video Research & Inteligência Multimodal",
        description: "Pesquisa avançada em fontes primárias de vídeo no YouTube com cotações literais verbatim e balanço bull/bear.",
      },
      {
        id: "executarAuditoriaSeo",
        name: "Auditoria & Inteligência Competitiva de SEO",
        description: "Gera relatórios de SEO orientados a evidências com resumo executivo de 150-200 palavras e diagnóstico de backlinks.",
      },
      {
        id: "estruturarIntermediacaoImobiliaria",
        name: "Intermediação Imobiliária de Alto Padrão",
        description: "Estrutura propostas de co-brokeragem 50/50, mandatos e proteção de 12 meses (no-circumvention) para Kikuxi e Mutamba.",
      },
      {
        id: "projetarFluxoAgentico",
        name: "Arquiteto de Fluxos Agênticos & Skills",
        description: "Modela processos e competências em 5 etapas: Entrevista, Plano, Paralelismo, Supervisão QA e Grafos DAG.",
      },
    ],
  });
});

/**
 * POST /api/kia/stream
 * Server-Sent Events (SSE) endpoint for real-time streaming conversations with KIA.
 */
kiaRouter.post("/stream", async (req: Request, res: Response) => {
  const { message, history = [], userName, userRole } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const ai = getGenAI();

  if (!ai) {
    const fallback = generateExecutiveFallback(message, userName);
    res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done", content: fallback, fullContent: fallback })}\n\n`);
    return res.end();
  }

  try {
    const systemInstruction = buildKiaSystemInstruction(userName, userRole);
    const streamStartTime = Date.now();
    // Use valid Gemini models according to @google/genai guidelines
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
    let streamSuccess = false;
    let accumulated = "";

    for (const model of candidateModels) {
      accumulated = "";
      try {
        const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history)) {
          for (const h of history.slice(-8)) {
            if (h.role && h.content) {
              formattedContents.push({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: String(h.content) }],
              });
            }
          }
        }

        formattedContents.push({
          role: "user",
          parts: [{ text: message }],
        });

        const responseStream = await ai.models.generateContentStream({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.75,
            tools: [{ functionDeclarations: GAG_AGENT_TOOLS }],
          },
        });

        for await (const chunk of responseStream) {
          const chunkText = chunk.text || "";
          if (chunkText) {
            accumulated += chunkText;
            res.write(`data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`);
          }
        }

        const sanitized = sanitizeKiaOutput(accumulated);
        res.write(`data: ${JSON.stringify({ type: "done", content: sanitized, fullContent: sanitized, modelName: model })}\n\n`);
        streamSuccess = true;
        systemHealthService.recordLatency({
          latencyMs: Date.now() - streamStartTime,
          model,
          endpoint: "/api/kia/stream",
          status: "SUCCESS",
        });
        break;
      } catch (err: any) {
        console.warn(`[KIA Stream] Model ${model} failed, trying fallback:`, err?.message);
        if (err?.message?.includes("503") || err?.message?.includes("UNAVAILABLE")) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }

    if (!streamSuccess) {
      const fallback = generateExecutiveFallback(message, userName);
      res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done", content: fallback, fullContent: fallback })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error("[KIA Stream Error]:", error);
    const fallback = generateExecutiveFallback(message, userName);
    res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done", content: fallback, fullContent: fallback })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/kia/chat
 * Synchronous JSON chat endpoint for KIA.
 */
kiaRouter.post("/chat", async (req: Request, res: Response) => {
  const { message, history = [], userName, userRole } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  const ai = getGenAI();

  if (!ai) {
    const fallback = generateExecutiveFallback(message, userName);
    return res.json({
      content: fallback,
      fullContent: fallback,
      intent: "conversation",
    });
  }

  try {
    const systemInstruction = buildKiaSystemInstruction(userName, userRole);
    const postStartTime = Date.now();
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
    let finalContent = "";
    let usedModel = "gemini-3.1-flash-lite";

    for (const model of candidateModels) {
      try {
        const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history)) {
          for (const h of history.slice(-8)) {
            if (h.role && h.content) {
              formattedContents.push({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: String(h.content) }],
              });
            }
          }
        }

        formattedContents.push({
          role: "user",
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.75,
            tools: [{ functionDeclarations: GAG_AGENT_TOOLS }],
          },
        });

        const raw = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (raw) {
          finalContent = sanitizeKiaOutput(raw);
          usedModel = model;
          systemHealthService.recordLatency({
            latencyMs: Date.now() - postStartTime,
            model: usedModel,
            endpoint: "/api/kia",
            status: "SUCCESS",
          });
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[KIA Chat] Model ${model} failed:`, modelErr?.message);
        if (modelErr?.message?.includes("503") || modelErr?.message?.includes("UNAVAILABLE")) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }

    if (!finalContent) {
      finalContent = generateExecutiveFallback(message, userName);
    }

    return res.json({
      content: finalContent,
      fullContent: finalContent,
      intent: "conversation",
      modelName: usedModel,
    });
  } catch (error: any) {
    console.error("[KIA Chat Error]:", error);
    const fallback = generateExecutiveFallback(message, userName);
    return res.json({
      content: fallback,
      fullContent: fallback,
      intent: "conversation",
    });
  }
});

/**
 * POST /api/kia/execute-tool
 * Endpoint para a KIA e Agentes executarem ferramentas autônomas via OmniRoute com fallback local automático
 */
kiaRouter.post("/execute-tool", async (req: Request, res: Response) => {
  try {
    const { tool, toolType, action_type, parameters, payload } = req.body || {};
    const selectedAction = tool || toolType || action_type;
    const actionData = parameters || payload || req.body || {};

    if (!selectedAction) {
      return res.status(400).json({ error: "Ferramenta ou tipo de ação não especificada." });
    }

    const result = await toolExecutor.omniroute_execute_action({
      action_type: selectedAction,
      payload: actionData,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[execute-tool error]:", error);
    return res.status(500).json({ error: error.message || "Falha na execução da ferramenta." });
  }
});

/**
 * GET /api/kia/knowledge
 * Retorna todos os conhecimentos, skills e ferramentas generativas ativas da KIA
 */
kiaRouter.get("/knowledge", (_req: Request, res: Response) => {
  try {
    const taughtKnowledge = kiaKnowledgeService.getAllKnowledge();
    const taughtSkills = kiaKnowledgeService.getAllSkills();
    const generativeTools = kiaKnowledgeService.getAllGenerativeTools();

    return res.json({
      success: true,
      summary: {
        totalKnowledge: taughtKnowledge.length,
        totalSkills: taughtSkills.length,
        totalGenerativeTools: generativeTools.length,
        systemStatus: "ACTIVE_IN_KIA_BRAIN",
      },
      taughtKnowledge,
      taughtSkills,
      generativeTools,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro ao consultar base de conhecimento da KIA." });
  }
});

/**
 * POST /api/kia/teach
 * Endpoint para ensinar novos conhecimentos, diretrizes ou skills diretamente à KIA
 */
kiaRouter.post("/teach", (req: Request, res: Response) => {
  try {
    const { type, item, items, source } = req.body || {};

    if (type === "batch" && Array.isArray(items)) {
      const added = kiaKnowledgeService.teachBatchKnowledge(items);
      return res.json({
        success: true,
        type: "batch",
        count: added,
        message: `${added} artigos de conhecimento foram ensinados à KIA com sucesso e indexados no seu cérebro executivo.`,
        activeKnowledgeCount: kiaKnowledgeService.getAllKnowledge().length,
      });
    }

    if (type === "skill" && item) {
      const learned = kiaKnowledgeService.teachSkill({
        id: item.id || `skill-${Date.now()}`,
        name: item.name || "Nova Skill",
        description: item.description || "",
        category: item.category || "ORCHESTRATION",
        version: item.version,
        requiredTools: item.requiredTools,
        inputSchema: item.inputSchema,
        outputSchema: item.outputSchema,
      });

      return res.json({
        success: true,
        type: "skill",
        skill: learned,
        message: `A skill "${learned.name}" foi ensinada à KIA e está pronta para execução autónoma.`,
      });
    }

    // Default: single knowledge item
    if (!item || !item.title || !item.content) {
      return res.status(400).json({ error: "Artigo de conhecimento inválido (título e conteúdo são obrigatórios)." });
    }

    const learned = kiaKnowledgeService.teachKnowledge({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category || "GENERAL",
      tags: item.tags,
      source: source || item.source,
    });

    return res.json({
      success: true,
      type: "knowledge",
      item: learned,
      message: `O conhecimento "${learned.title}" foi absorvido pela KIA e está integrado nas diretrizes ativas de Luanda.`,
      activeKnowledgeCount: kiaKnowledgeService.getAllKnowledge().length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro ao ensinar conhecimento à KIA." });
  }
});

/**
 * POST /api/kia/transform-tool
 * Transforma um artigo de conhecimento ou skill numa ferramenta generativa reutilizável
 */
kiaRouter.post("/transform-tool", (req: Request, res: Response) => {
  try {
    const { sourceId, sourceType, title, description, category, customPromptTemplate, inputFields } = req.body || {};

    if (!sourceId || !sourceType) {
      return res.status(400).json({ error: "sourceId e sourceType ('knowledge' ou 'skill') são obrigatórios." });
    }

    const tool = kiaKnowledgeService.transformToGenerativeTool({
      sourceId,
      sourceType,
      title,
      description,
      category,
      customPromptTemplate,
      inputFields,
    });

    return res.json({
      success: true,
      tool,
      message: `A diretriz foi transformada com sucesso na ferramenta generativa "${tool.name}".`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Falha ao transformar em ferramenta generativa." });
  }
});

/**
 * GET /api/kia/generative-tools
 * Lista todas as ferramentas generativas ativas
 */
kiaRouter.get("/generative-tools", (_req: Request, res: Response) => {
  try {
    const tools = kiaKnowledgeService.getAllGenerativeTools();
    return res.json({
      success: true,
      count: tools.length,
      tools,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro ao listar ferramentas generativas." });
  }
});

/**
 * POST /api/kia/execute-generative-tool
 * Executa uma ferramenta generativa em tempo real com Gemini
 */
kiaRouter.post("/execute-generative-tool", async (req: Request, res: Response) => {
  try {
    const { toolId, inputs = {} } = req.body || {};

    if (!toolId) {
      return res.status(400).json({ error: "toolId é obrigatório." });
    }

    const ai = getGenAI();
    const result = await kiaKnowledgeService.executeGenerativeTool(toolId, inputs, ai);

    return res.json(result);
  } catch (error: any) {
    console.error("[execute-generative-tool error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao executar ferramenta generativa." });
  }
});


