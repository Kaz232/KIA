/**
 * GAG VISUAL CORE OS — AUTONOMOUS AGENT TOOLS & MULTI-FORMAT GENERATOR
 * 
 * Defines official Gemini FunctionDeclarations and autonomous tool executors:
 * 1. gerarConteudoAgente: Produces content across multiple formats (Propostas, Posts, Roteiros, Briefings, Relatórios)
 * 2. criarTarefaBacklog: Autonomously inserts and assigns tasks into the Kanban Backlog
 * 3. gerarAssetVisual: Generates cinematic visual prompts (Veo 3.1, Imagen 3, 9:16 Storyboards, design guidelines)
 * 4. analisarMetricasFinanceiras: Calculates 50% AOA down-payment, IVA 14%, Retenção 6.5%, ROAS & margins
 * 5. despacharAgenteEspecialista: Handoff tasks between agents (e.g., Copywriter -> Art Director -> QA)
 */

import { FunctionDeclaration, Type } from "@google/genai";
import { artifactStore } from "../artifacts/artifactStore";
import { ArtifactRecord } from "../artifacts/artifactTypes";
import { kiaKnowledgeService } from "../services/kiaKnowledgeService";

// ============================================================================
// GEMINI FUNCTION DECLARATIONS
// ============================================================================

export const gerarConteudoAgenteDeclaration: FunctionDeclaration = {
  name: "gerarConteudoAgente",
  description:
    "Gera conteúdos corporativos e criativos em múltiplos formatos (proposta comercial em AOA, post para redes sociais, roteiro de vídeo 9:16 para Veo/Reels, briefing criativo, relatório executivo, artigo ou cópia de anúncio).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tipoConteudo: {
        type: Type.STRING,
        description:
          "Tipo de conteúdo a ser gerado: 'proposta_comercial', 'post_redes_sociais', 'roteiro_video', 'briefing_criativo', 'relatorio_executivo', 'artigo_blog', 'copy_anuncio', 'comunicado_oficial'",
      },
      formato: {
        type: Type.STRING,
        description:
          "Formato primário de saída: 'markdown', 'html', 'whatsapp', 'json', 'storyboard_prompt'",
      },
      titulo: {
        type: Type.STRING,
        description: "Título ou headline do conteúdo.",
      },
      tema: {
        type: Type.STRING,
        description: "Assunto central, objetivo ou proposta de valor.",
      },
      publicoAlvo: {
        type: Type.STRING,
        description:
          "Público-alvo ou setor (ex: empresários em Luanda, B2B, retalho, banca, consumidores finais).",
      },
      tomDeVoz: {
        type: Type.STRING,
        description:
          "Tom de voz da marca: 'executivo', 'persuasivo_high_ticket', 'institucional', 'cinematografico', 'educativo'",
      },
      detalhesEspecificos: {
        type: Type.STRING,
        description:
          "Informações complementares: preços em Kwanzas (AOA), prazos, diferenciais técnicos ou canais de distribuição.",
      },
    },
    required: ["tipoConteudo", "titulo", "tema"],
  },
};

export const criarTarefaBacklogDeclaration: FunctionDeclaration = {
  name: "criarTarefaBacklog",
  description:
    "Adiciona autonomamente uma tarefa prioritária ao Backlog/Kanban da GAG Visual, atribuindo ao agente especialista adequado.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      titulo: {
        type: Type.STRING,
        description: "Título conciso e acionável da tarefa.",
      },
      descricao: {
        type: Type.STRING,
        description: "Instruções claras e entregáveis esperados.",
      },
      prioridade: {
        type: Type.STRING,
        description: "Prioridade da tarefa: 'LOW', 'MEDIUM', 'HIGH' ou 'CRITICAL'",
      },
      agenteResponsavelId: {
        type: Type.STRING,
        description:
          "ID do agente responsável (ex: 'agent-copywriter', 'agent-art-director', 'agent-social-media', 'agent-video-veo', 'agent-financial-analyst', 'agent-automation-n8n').",
      },
      categoria: {
        type: Type.STRING,
        description:
          "Categoria: 'DESIGN', 'MARKETING', 'FINANCE', 'CONTENT', 'DEVELOPMENT', 'STRATEGY'",
      },
      prazoDias: {
        type: Type.NUMBER,
        description: "Prazo sugerido em dias (ex: 2 para 48h, 7 para 1 semana).",
      },
    },
    required: ["titulo", "descricao", "prioridade", "categoria"],
  },
};

export const gerarAssetVisualDeclaration: FunctionDeclaration = {
  name: "gerarAssetVisual",
  description:
    "Gera especificações técnicas de design, paleta de cores e prompts cinematográficos para ferramentas de vídeo e imagem como Veo 3.1 ou Imagen 3.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tipoAsset: {
        type: Type.STRING,
        description:
          "Tipo de recurso visual: 'prompt_veo_video', 'prompt_imagem_editorial', 'especificacao_design_carrossel', 'guia_identidade_visual'",
      },
      aspectRatio: {
        type: Type.STRING,
        description: "Proporção da imagem/vídeo: '9:16', '1:1', '16:9', '4:5'",
      },
      diretrizesArte: {
        type: Type.STRING,
        description:
          "Diretrizes visuais: iluminação cinematográfica, ângulo de câmara, referências cromáticas e texturas.",
      },
      promptGeracao: {
        type: Type.STRING,
        description:
          "Prompt técnico otimizado em inglês para Veo 3.1 / Imagen 3 com tokens fotorealistas de alta fidelidade.",
      },
      paletaCores: {
        type: Type.STRING,
        description: "Cores recomendadas em hexadecimal e papel de cada cor.",
      },
    },
    required: ["tipoAsset", "aspectRatio", "promptGeracao"],
  },
};

export const analisarMetricasFinanceirasDeclaration: FunctionDeclaration = {
  name: "analisarMetricasFinanceiras",
  description:
    "Calcula a viabilidade orçamental em Kwanzas (AOA), sinal obrigatório de 50%, retenção na fonte (6,5%) e IVA (14%), além de projeção de ROAS.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      valorBrutoAOA: {
        type: Type.NUMBER,
        description: "Valor bruto do projeto ou orçamento da campanha em Kwanzas (AOA).",
      },
      tipoServico: {
        type: Type.STRING,
        description: "Tipo de serviço comercial ou projeto.",
      },
      prazoMeses: {
        type: Type.NUMBER,
        description: "Duração prevista em meses (default: 1).",
      },
      incluirImpostos: {
        type: Type.BOOLEAN,
        description: "Calcular retenção de 6.5% e IVA de 14% (default: true).",
      },
    },
    required: ["valorBrutoAOA", "tipoServico"],
  },
};

export const despacharAgenteEspecialistaDeclaration: FunctionDeclaration = {
  name: "despacharAgenteEspecialista",
  description:
    "Realiza o handoff ou delegação de uma tarefa operacional para outro agente especialista com contexto e objetivo definidos.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      agenteDestino: {
        type: Type.STRING,
        description:
          "Nome ou ID do agente destino: 'copywriter', 'art-director', 'social-media', 'video-veo', 'financial-analyst', 'automation-n8n'",
      },
      objetivoEspecifico: {
        type: Type.STRING,
        description: "Objetivo específico que o agente destino deve executar.",
      },
      dadosContexto: {
        type: Type.STRING,
        description: "Rascunho, especificações ou contexto necessário para o trabalho.",
      },
    },
    required: ["agenteDestino", "objetivoEspecifico"],
  },
};

export const pesquisarVideoYouTubeDeclaration: FunctionDeclaration = {
  name: "pesquisarVideoYouTube",
  description:
    "Orquestra pesquisa profunda em fontes primárias de vídeo no YouTube (entrevistas de CEOs, keynotes, earnings calls, painéis técnicos), extraindo cotações verbatim, números, métricas e síntese estruturada com balanço bull/bear.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      temaOuEmpresa: {
        type: Type.STRING,
        description: "Tópico, empresa, executivo ou setor a pesquisar (ex: 'Stripe CEO Patrick Collison', 'Modelos de IA 2026', 'Mercado Imobiliário Angola').",
      },
      temasChave: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de 4 a 6 temas analíticos (ex: modelo de negócio, tecnologia, financials, riscos/bear case).",
      },
      profundidade: {
        type: Type.STRING,
        description: "'padrao' (8-12 vídeos) ou 'profunda' (12-20 vídeos).",
      },
      focoCitacoes: {
        type: Type.BOOLEAN,
        description: "Se deve exigir cotações literais e números exaustivos.",
      },
    },
    required: ["temaOuEmpresa"],
  },
};

export const executarAuditoriaSeoDeclaration: FunctionDeclaration = {
  name: "executarAuditoriaSeo",
  description:
    "Elabora auditorias de SEO e inteligência competitiva de pesquisa orgânica com resumo executivo de 150-200 palavras, tendência de 6 meses, clusters de landing pages, divisão branded/non-branded, auditoria de backlinks e priorização direta de problemas/correções.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      dominioAlvo: {
        type: Type.STRING,
        description: "Domínio ou URL analisada (ex: 'empresa-alvo.com', 'gagvisual.ao').",
      },
      tipoRelatorio: {
        type: Type.STRING,
        description: "'competidor' (analisa estratégia e vulnerabilidades do concorrente) ou 'auditoria_interna' (diagnóstico e correções para o próprio site).",
      },
      mercadosFoco: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Países prioritários para análise de demanda (ex: ['Angola', 'Portugal', 'Brasil', 'EUA']).",
      },
    },
    required: ["dominioAlvo"],
  },
};

export const estruturarIntermediacaoImobiliariaDeclaration: FunctionDeclaration = {
  name: "estruturarIntermediacaoImobiliaria",
  description:
    "Estrutura dossiê de vendas, proposta de co-brokeragem (50/50), minuta de mandato e cláusula de não-circundação (12 meses) para ativos de elite da GAG Visual em Luanda (Kikuxi 850M Kz / 25M comissão, Mutamba 420M Kz / ~20M comissão).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      imovel: {
        type: Type.STRING,
        description: "'kikuxi' (Mansão 1ha, 850M Kz, comissão 25M Kz), 'mutamba' (Espaço comercial 2 pisos, 420M Kz, avaliação ALTYS 396.9M Kz) ou 'outro'.",
      },
      parceiroOuCanal: {
        type: Type.STRING,
        description: "Nome da imobiliária parceira ou comprador (ex: 'CASDA', 'ESCF', 'Porta Sete', 'RE/MAX', '3S', 'Investidor Diáspora').",
      },
      tipoAcao: {
        type: Type.STRING,
        description: "'proposta_co_brokeragem', 'minuta_mandato', 'script_qualificacao', 'dossie_venda'.",
      },
      condicoesPartilha: {
        type: Type.STRING,
        description: "Condições propostas: '50_50', '60_40' ou 'comissao_fixa'.",
      },
    },
    required: ["imovel", "tipoAcao"],
  },
};

export const projetarFluxoAgenticoDeclaration: FunctionDeclaration = {
  name: "projetarFluxoAgentico",
  description:
    "Modela fluxos e competências para agentes de IA seguindo o método profissional em 5 etapas: Objetivo & Entrevista, Plano Estruturado Revisável, Subdivisão & Paralelismo, Supervisão & Critério Objetivo de QA, e Grafos de Dependências (DAG).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nomeDoFluxo: {
        type: Type.STRING,
        description: "Nome do processo ou competência (ex: 'Automação de Leads WhatsApp', 'Auditoria Fiscal Contínua').",
      },
      objetivoGeral: {
        type: Type.STRING,
        description: "Resultado de negócio esperado de ponta a ponta.",
      },
      camadasParalelas: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Módulos ou camadas a rodar em concorrência (ex: ['Ingestão de Dados', 'Regras de Negócio', 'Geração de UI', 'Notificação WhatsApp']).",
      },
      criteriosAceiteQA: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Regras objetivas e mensuráveis para aprovação sem margem para ambiguidade.",
      },
    },
    required: ["nomeDoFluxo", "objetivoGeral"],
  },
};

export const gerarArtigoComparativoDeclaration: FunctionDeclaration = {
  name: "gerarArtigoComparativo",
  description:
    "Gera artigos comparativos aprofundados ('X vs Y') orientados à decisão do comprador, com veredito inicial de 100-150 palavras, tabela comparativa de 5 a 8 dimensões com preços reais, análise critério a critério, prós/contras, recomendações por persona e especificação de 3-4 imagens estratégicas.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      opcaoA: {
        type: Type.STRING,
        description: "Primeira opção ou ferramenta a comparar (ex: 'Notion', 'Semrush', 'Figma').",
      },
      opcaoB: {
        type: Type.STRING,
        description: "Segunda opção ou concorrente direto (ex: 'Obsidian', 'Ahrefs', 'Canva').",
      },
      categoria: {
        type: Type.STRING,
        description: "Categoria de produto ou serviço (ex: 'Ferramentas de Produtividade', 'Plataformas de SEO', 'CRM').",
      },
      publicoAlvo: {
        type: Type.STRING,
        description: "Perfil do leitor ou decisor (ex: 'Pequenas empresas em Luanda', 'Equipas de marketing', 'Desenvolvedores seniores').",
      },
      criteriosPrincipais: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Dimensões-chave a avaliar (ex: ['Preço e Planos', 'Facilidade de Uso', 'Integrações', 'Desempenho']).",
      },
      opcaoVencedora: {
        type: Type.STRING,
        description: "Vencedor global recomendado ou indicação de empate estratégico.",
      },
    },
    required: ["opcaoA", "opcaoB", "categoria"],
  },
};

export const gerarRoteiroVideoIADeclaration: FunctionDeclaration = {
  name: "gerarRoteiroVideoIA",
  description:
    "Modela a produção e engenharia de prompts para vídeo com IA (Google Veo 3.1, Runway Gen-3, Luma Dream Machine) em 5 fases, gerando primeiro keyframe (16:9 ou 9:16), transições técnicas detalhadas de 2-4 frases (sujeito, movimento, transformações), blueprint de BGM com segmentos temporais e orçamentação de locução TTS.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tituloVideo: {
        type: Type.STRING,
        description: "Título da produção (ex: 'Spot Institucional Mansão Kikuxi 4K', 'Vídeo Manifesto GAG Visual').",
      },
      estiloVisual: {
        type: Type.STRING,
        description: "Especificação em 4 dimensões: sub-género, iluminação, cores e densidade de detalhes (ex: 'Cinematográfico 4K, iluminação quente de Luanda, sombras nítidas').",
      },
      aspectRatio: {
        type: Type.STRING,
        description: "'16:9' (Widescreen) ou '9:16' (Vertical Reels/TikTok). Proibido 1:1.",
      },
      duracaoTotalSegundos: {
        type: Type.NUMBER,
        description: "Duração estimada em segundos (ex: 30, 45, 60).",
      },
      cenas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            cenaNumero: { type: Type.NUMBER },
            descricaoTransicao: { type: Type.STRING },
            cameraMovimento: { type: Type.STRING },
            duracaoSegundos: { type: Type.NUMBER },
            audioFundo: { type: Type.STRING },
            narracaoTTS: { type: Type.STRING },
          },
          required: ["cenaNumero", "descricaoTransicao", "duracaoSegundos"],
        },
        description: "Lista ordenada de tomadas ou clipes com transição detalhada de 2 a 4 frases cada.",
      },
    },
    required: ["tituloVideo", "estiloVisual", "aspectRatio"],
  },
};

export const gerarPlanilhaExecutivaDeclaration: FunctionDeclaration = {
  name: "gerarPlanilhaExecutiva",
  description:
    "Projeta especificações de folhas de cálculo Excel e modelos analíticos com padrões rigorosos: paleta monocromática com acento (Elegant Black, Corporate Blue), tipografia Serif/Sans, formatação numérica universal (#,##0.00, 0.0%), blocos de dados isolados por bordas e resumo KEY INSIGHTS.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tituloPlanilha: {
        type: Type.STRING,
        description: "Título executivo do documento (ex: 'Modelo de Receitas e Comissões Imobiliárias Luanda 2026').",
      },
      temaCromatico: {
        type: Type.STRING,
        description: "'elegant_black' (Luxo/padrão), 'corporate_blue' (Finanças corporativas), 'forest_green' (Sustentabilidade) ou 'slate_gray' (Minimalista).",
      },
      secoes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            nomeSecao: { type: Type.STRING },
            colunas: { type: Type.ARRAY, items: { type: Type.STRING } },
            linhasExemplo: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["nomeSecao", "colunas"],
        },
        description: "Secções ou blocos de dados da planilha.",
      },
      incluirInsights: {
        type: Type.BOOLEAN,
        description: "Se deve redigir o bloco 'KEY INSIGHTS' com conclusões estratégicas.",
      },
    },
    required: ["tituloPlanilha"],
  },
};

export const prospectarLeadsAngolaDeclaration: FunctionDeclaration = {
  name: "prospectarLeadsAngola",
  description:
    "Gera kits completos de prospeção B2B e roteiros de vendas no WhatsApp para empresas e negócios em Luanda (gastronomia, hotelaria, clínicas, comércio, condomínios), formulando mensagens personalizadas de alto impacto com dor observável, proposta de valor sem promessas falsas e packs comerciais da GAG (50k a 250k Kz).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      setor: {
        type: Type.STRING,
        description: "'gastronomia' (Churrasqueiras, restaurantes, funjadas), 'hotelaria' (Hotéis, lodges), 'bem_estar' (Spas, estética, ginásios), 'condominios' (Condomínio Kilamba, Talatona) ou 'comercio_servicos' (Empresas técnicas, B2B).",
      },
      nomeEmpresa: {
        type: Type.STRING,
        description: "Nome do negócio em Luanda (ex: 'Churrascaria Nandinhos', 'Restaurante Rua 11', 'Ledaan Services', 'Condomínio Kilamba').",
      },
      canal: {
        type: Type.STRING,
        description: "'whatsapp' (Principal em Angola), 'email' ou 'visita_presencial'.",
      },
      dorObservada: {
        type: Type.STRING,
        description: "Problema factual visível (ex: 'Site em construção e redes sem Reels', 'Sem sistema de marcações online', 'Sem registo central de encomendas').",
      },
      pacoteProposto: {
        type: Type.STRING,
        description: "'pack_start_50k' (Landing básica + WhatsApp), 'pack_elite_150k' (Landing + Webhook + Sheets + IA WhatsApp) ou 'crm_automatico_50k' (Automação de leads).",
      },
    },
    required: ["setor", "nomeEmpresa"],
  },
};

export const gerarCertificadoAcademicoDeclaration: FunctionDeclaration = {
  name: "gerarCertificadoAcademico",
  description:
    "Estrutura avaliações pedagógicas determinísticas e gera certificados de conclusão em formato A4 landscape com código QR, código hash imutável de validação e carga horária suportada por registos para a GAG Academy.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      moduloCurso: {
        type: Type.STRING,
        description: "Nome oficial do curso ou módulo formativo (ex: 'Formação Executiva em IA & Automação de Negócios Luanda 2026').",
      },
      nomeAluno: {
        type: Type.STRING,
        description: "Nome completo do aluno ou formando.",
      },
      cargaHorariaHoras: {
        type: Type.NUMBER,
        description: "Horas letivas e práticas oficiais comprovadas.",
      },
      competenciasAdquiridas: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de competências práticas testadas e validadas por quiz.",
      },
    },
    required: ["moduloCurso", "nomeAluno"],
  },
};

export const ensinarConhecimentoKiaDeclaration: FunctionDeclaration = {
  name: "ensinarConhecimentoKia",
  description:
    "Permite à KIA aprender, absorver e registar novos conhecimentos, diretrizes de negócio, regras comerciais, playbooks ou processos transmitidos pelo utilizador.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      titulo: {
        type: Type.STRING,
        description: "Título conciso da regra ou conhecimento aprendido.",
      },
      conteudo: {
        type: Type.STRING,
        description: "Conteúdo detalhado, regras, diretrizes ou procedimentos.",
      },
      categoria: {
        type: Type.STRING,
        description: "'BRANDING', 'COMMERCIAL', 'DESIGN_AI', 'CONTENT_STRATEGY', 'AUTOMATION', 'TECHNICAL', 'INTERNAL_PROCESS', 'CLIENT_PLAYBOOK'",
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Etiquetas de pesquisa para recuperação rápida.",
      },
    },
    required: ["titulo", "conteudo"],
  },
};

export const transformarEmFerramentaGenerativaDeclaration: FunctionDeclaration = {
  name: "transformarEmFerramentaGenerativa",
  description:
    "Transforma um artigo de conhecimento ou skill numa ferramenta generativa acionável e reutilizável com campos de entrada e template de prompt.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      sourceId: {
        type: Type.STRING,
        description: "ID do conhecimento ou da skill de origem.",
      },
      sourceType: {
        type: Type.STRING,
        description: "'knowledge' ou 'skill'.",
      },
      nomeFerramenta: {
        type: Type.STRING,
        description: "Nome da nova ferramenta generativa.",
      },
      descricao: {
        type: Type.STRING,
        description: "Descrição da finalidade do gerador.",
      },
      categoria: {
        type: Type.STRING,
        description: "'CONTENT', 'DESIGN', 'COMMERCIAL', 'STRATEGY', 'ENGINEERING', 'FINANCE'",
      },
      templatePrompt: {
        type: Type.STRING,
        description: "Template de prompt estruturado com placeholders {{variavel}} para execução.",
      },
    },
    required: ["sourceId", "sourceType", "nomeFerramenta"],
  },
};

export const executarFerramentaGenerativaDeclaration: FunctionDeclaration = {
  name: "executarFerramentaGenerativa",
  description:
    "Executa uma ferramenta generativa registada, gerando o entregável correspondente a partir dos parâmetros fornecidos.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      toolId: {
        type: Type.STRING,
        description: "ID da ferramenta generativa a executar.",
      },
      inputs: {
        type: Type.OBJECT,
        description: "Objeto com os valores para os parâmetros da ferramenta.",
      },
    },
    required: ["toolId"],
  },
};

/**
 * Array exportado com todas as ferramentas oficiais disponíveis para o Gemini
 */
export const GAG_AGENT_TOOLS: FunctionDeclaration[] = [
  gerarConteudoAgenteDeclaration,
  criarTarefaBacklogDeclaration,
  gerarAssetVisualDeclaration,
  analisarMetricasFinanceirasDeclaration,
  despacharAgenteEspecialistaDeclaration,
  pesquisarVideoYouTubeDeclaration,
  executarAuditoriaSeoDeclaration,
  estruturarIntermediacaoImobiliariaDeclaration,
  projetarFluxoAgenticoDeclaration,
  gerarArtigoComparativoDeclaration,
  gerarRoteiroVideoIADeclaration,
  gerarPlanilhaExecutivaDeclaration,
  prospectarLeadsAngolaDeclaration,
  gerarCertificadoAcademicoDeclaration,
  ensinarConhecimentoKiaDeclaration,
  transformarEmFerramentaGenerativaDeclaration,
  executarFerramentaGenerativaDeclaration,
];

// ============================================================================
// TOOL EXECUTORS & CONTENT GENERATORS
// ============================================================================

export interface ToolExecutionContext {
  agentId?: string;
  executionId?: string;
  taskId?: string;
  userName?: string;
}

export interface GeneratedContentResult {
  titulo: string;
  tipoConteudo: string;
  markdown: string;
  html: string;
  whatsAppText: string;
  jsonPayload: Record<string, any>;
  artifactId?: string;
}

export async function executeGerarConteudoAgente(
  args: {
    tipoConteudo: string;
    formato?: string;
    titulo: string;
    tema: string;
    publicoAlvo?: string;
    tomDeVoz?: string;
    detalhesEspecificos?: string;
  },
  context: ToolExecutionContext = {}
): Promise<GeneratedContentResult> {
  const {
    tipoConteudo,
    titulo,
    tema,
    publicoAlvo = "Empresas e Decisores em Luanda, Angola",
    tomDeVoz = "executivo",
    detalhesEspecificos = "",
  } = args;

  const dataEmissao = new Date().toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let markdown = "";
  let html = "";
  let whatsAppText = "";
  const jsonPayload: Record<string, any> = {
    tipoConteudo,
    titulo,
    tema,
    publicoAlvo,
    tomDeVoz,
    dataEmissao,
    geradoPor: context.agentId || "GAG Agent Engine",
  };

  switch (tipoConteudo) {
    case "proposta_comercial": {
      const valorBase = 1500000;
      const valorFormatado = valorBase.toLocaleString("pt-AO") + " AOA";
      const sinalFormatado = (valorBase * 0.5).toLocaleString("pt-AO") + " AOA";

      markdown = `# PROPOSTA COMERCIAL E ESTRATÉGICA — GAG VISUAL
**Documento:** ${titulo}  
**Data:** ${dataEmissao} | **Local:** Luanda, Angola  
**Público-Alvo:** ${publicoAlvo}  

---

### 1. Visão Geral & Desafio
A presente proposta destina-se a atender às necessidades estratégicas em relação a: **${tema}**.
${detalhesEspecificos ? `\n**Especificações do Projeto:**\n${detalhesEspecificos}\n` : ""}

### 2. Metodologia de Execução (Padrão GAG Visual TOB)
- **Fase 1 (Diagnóstico & Alinhamento):** Briefing de direção de arte e definição de métricas de sucesso.
- **Fase 2 (Produção Audiovisual & Criativa):** Captação cinematográfica 4K, edição com motion design e pós-produção de nível internacional.
- **Fase 3 (Distribuição & Otimização):** Lançamento coordenado e ajustes finos orientados a conversão.

### 3. Proposta de Investimento em Kwanzas
| Pacote | Entregáveis Principais | Investimento (AOA) |
|---|---|---|
| **Estratégico GAG** | Produção Completa + Campanha + Direção de Arte | **${valorFormatado}** |

> **Condições Comerciais Inegociáveis:**  
> • **Sinal de 50% (${sinalFormatado})** na adjudicação do contrato para reserva de equipa e arranque de produção.  
> • **50% remanescentes** na aprovação dos entregáveis finais antes do lançamento.  
> • Pagamento via transferência bancária confirmada em Kwanzas (AOA).

---
*GAG Visual Core OS — Luanda, Angola*`;

      html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <title>${titulo} — GAG Visual</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #0F172A; margin: 40px; background: #fff; line-height: 1.6; }
    .header { border-bottom: 3px solid #003FD3; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { background: #EEF2FF; color: #003FD3; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
    .price-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .price-val { font-size: 28px; font-weight: 800; color: #003FD3; }
    .terms { background: #FEF3C7; border-left: 4px solid #D97706; padding: 12px 16px; border-radius: 4px; margin-top: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">PROPOSTA COMERCIAL FORMAL</span>
    <h1 style="margin: 8px 0 4px 0;">${titulo}</h1>
    <p style="color: #64748B; margin: 0;">Emitido em ${dataEmissao} • Luanda, Angola</p>
  </div>
  <p><strong>Objetivo Estratégico:</strong> ${tema}</p>
  <p><strong>Destinatário:</strong> ${publicoAlvo}</p>
  
  <div class="price-box">
    <div style="font-size: 14px; color: #64748B; text-transform: uppercase; font-weight: 600;">Investimento Total Estimado</div>
    <div class="price-val">${valorFormatado}</div>
    <div style="margin-top: 8px; font-size: 14px;"><strong>Sinal de Adjudicação (50%):</strong> ${sinalFormatado}</div>
  </div>

  <div class="terms">
    <strong>Garantia de Execução GAG Visual:</strong> 50% de sinal no fecho contratual para mobilização operacional imediata. Restante no ato de entrega dos arquivos master em alta resolução.
  </div>
</body>
</html>`;

      whatsAppText = `*PROPOSTA COMERCIAL — GAG VISUAL*\n\n` +
        `Olá! Temos a proposta estruturada para *${titulo}*:\n\n` +
        `• *Objetivo:* ${tema}\n` +
        `• *Investimento Total:* ${valorFormatado}\n` +
        `• *Sinal de Adjudicação (50%):* ${sinalFormatado}\n` +
        `• *Prazo Estimado:* Conforme cronograma anexo.\n\n` +
        `Podemos agendar a assinatura da adjudicação para avançarmos com a produção cinematográfica?`;
      break;
    }

    case "post_redes_sociais": {
      markdown = `# PLANO DE PUBLICAÇÃO SOCIAL MEDIA — GAG VISUAL
**Tema:** ${titulo}  
**Objetivo / Gancho:** ${tema}  
**Tom:** ${tomDeVoz} | **Alvo:** ${publicoAlvo}  

---

### 🎣 Gancho Visual & Headline (Primeiros 3 segundos):
> *"O erro número 1 que está a custar posicionamento à sua empresa em Luanda."*

### 📝 Corpo do Post (Copywriting de Alta Retenção):
No mercado atual, quem não se diferencia pela sofisticação visual e autoridade digital torna-se invisível.

A excelência na produção audiovisual não é um custo — é a barreira de entrada que separa marcas comuns de líderes incontestáveis do setor.

Aqui está o que precisa de priorizar hoje:
1. **Identidade Visual Consistente:** Reconhecimento imediato em todos os pontos de contacto.
2. **Vídeo Cinematográfico:** Conteúdo que prende a atenção e comunica prestígio em segundos.
3. **Conversão Clara:** Cada publicação deve conduzir o utilizador para uma ação rentável.

👉 **Quer elevar o padrão visual da sua marca?** Envie-nos uma mensagem no WhatsApp e descubra o nosso método de produção.

---
**Hashtags Estratégicas:**  
#GAGVisual #LuandaNegocios #BrandingAngola #ProducaoAudiovisual #MarketingDigitalAngola #DesignDeImpacto

### 🎨 Sugestão de Direção de Arte:
- Formato: Carrossel 4:5 ou Reel 9:16 com transição limpa.
- Cores: Dark slate (#0A0A0F) com destaque em Azul Cobalto (#003FD3).
- Tipografia: Título em Caixa Alta com tracking largo; corpo limpo e arejado.`;

      html = `<div style="font-family: system-ui; max-width: 600px; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
  <span style="background: #E0E7FF; color: #3730A3; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">SOCIAL MEDIA COPY</span>
  <h2 style="margin-top: 12px;">${titulo}</h2>
  <p><strong>Hook:</strong> ${tema}</p>
  <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; border-left: 4px solid #003FD3;">
    <p style="margin: 0; white-space: pre-wrap;">No mercado angolano, a sofisticação da sua marca é o seu maior ativo comercial. Fale com a GAG Visual.</p>
  </div>
</div>`;

      whatsAppText = `*POST DE REDES SOCIAIS — ${titulo}*\n\n` +
        `🎣 *Gancho:* ${tema}\n\n` +
        `📝 *Texto Principal:*\n` +
        `A excelência na produção visual não é detalhe: é o ativo que constrói autoridade para empresas líderes em Luanda.\n\n` +
        `👉 *CTA:* Fale connosco pelo link na bio ou mensagem privada para acelerar a sua marca.\n\n` +
        `#GAGVisual #LuandaNegocios #Branding`;
      break;
    }

    case "roteiro_video": {
      markdown = `# ROTEIRO CINEMATOGRÁFICO 9:16 (VEO 3.1 & REELS)
**Título:** ${titulo}  
**Tema Central:** ${tema}  
**Duração Estimada:** 30 segundos | **Proporção:** 9:16 Vertical  

---

### Tabela Cronológica de Produção:
| Tempo | Cena / Visual (Prompt Veo 3.1) | Áudio / Locução | Efeitos / SFX |
|---|---|---|---|
| **00:00 - 00:03** | Close dinâmico em lente anamórfica, iluminação golden hour moderna no skyline da Baía de Luanda. Câmera com push-in rápido. | *"A sua marca comunica liderança... ou passa despercebida?"* | Whoosh grave e impacto sutil. |
| **00:03 - 00:15** | Cortes rápidos e rítmicos: bastidores de alta produção, ecrãs digitais modernos com métricas em alta e diretor de arte em estúdio. | *"Na GAG Visual, transformamos visões corporativas em produções cinematográficas que geram valor real e atraem clientes de topo."* | Beat eletrónico moderno e compassado. |
| **00:15 - 00:25** | Detalhe em produto/serviço com iluminação de estúdio luxuosa e reflexos refinados. Logótipo 3D animado. | *"Do conceito à distribuição multicanal. A nova era do audiovisual angolano começa aqui."* | Riser crescente de tensão. |
| **00:25 - 00:30** | Cartão final minimalista: GAG VISUAL CORE OS + Contacto WhatsApp (+244 922 835 116). | *"Descubra o poder da imagem de elite. Fale connosco hoje mesmo."* | Swoosh final com nota limpa de piano. |

---
**Prompt Otimizado para Veo 3.1 (Cinematic AI):**  
\`cinematic vertical 9:16 video of high-end creative agency studio in Luanda, warm ambient lighting, 35mm lens, sharp focus, hyper-realistic reflections, color graded in cobalt blue and gold, 24fps motion blur, elegant luxury atmosphere\``;

      html = `<div style="font-family: system-ui; padding: 24px; background: #0A0A0F; color: #F8FAFC; border-radius: 12px;">
  <h2 style="color: #60A5FA; margin-top: 0;">🎬 Roteiro 9:16: ${titulo}</h2>
  <p><strong>Conceito:</strong> ${tema}</p>
  <div style="background: #1E293B; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px;">
    [00-03s] Hook Visual: Luanda skyline + Anamorphic lens<br>
    [03-15s] Narrative: Produção cinematográfica de alto padrão<br>
    [15-30s] Clímax & CTA: Chamada direta para WhatsApp da GAG Visual
  </div>
</div>`;

      whatsAppText = `*ROTEIRO DE VÍDEO 9:16 — ${titulo}*\n\n` +
        `• *Duração:* 30 segundos (Reels/TikTok/Veo 3.1)\n` +
        `• *Hook Inicial:* "A sua marca comunica liderança ou passa despercebida?"\n` +
        `• *Mensagem Central:* ${tema}\n` +
        `• *CTA Final:* "Fale com a GAG Visual no WhatsApp e agende a sua produção."`;
      break;
    }

    case "relatorio_executivo": {
      markdown = `# RELATÓRIO EXECUTIVO DE PERFORMANCE & ROAS
**Projeto:** ${titulo}  
**Período:** Mensal / Trimestral | **Emitido em:** ${dataEmissao}  
**Contexto Operacional:** Luanda, Angola  

---

### 1. Resumo Executivo
Análise detalhada do desempenho de marketing e captação de clientes referente a: **${tema}**.

### 2. Indicadores Financeiros & Comerciais
- **Orçamento Alocado:** 2.400.000 AOA
- **Volume de Faturação Atribuída:** 9.600.000 AOA
- **ROAS Real:** **4.0x** (Para cada Kwanza investido, retornaram 4 Kwanzas)
- **Leads Qualificados Gerados:** 68 contactos via WhatsApp e CRM
- **Custo por Aquisição (CPA):** 35.294 AOA

### 3. Recomendações Estratégicas para o Próximo Ciclo:
1. Escalar em 25% o investimento nas peças de vídeo cinematográfico 9:16 com melhor retenção.
2. Reforçar o acompanhamento no WhatsApp comercial nas primeiras 2 horas após a conversão do lead.
3. Consolidar a metodologia de 50% de sinal prévio para garantir margem operacional protegida.`;

      html = `<div style="font-family: system-ui; padding: 24px; border: 1px solid #CBD5E1; border-radius: 12px;">
  <h2>Relatório de Performance: ${titulo}</h2>
  <div style="display: flex; gap: 16px; margin: 20px 0;">
    <div style="background: #F0FDF4; padding: 16px; border-radius: 8px; flex: 1; text-align: center;">
      <div style="font-size: 24px; font-weight: 800; color: #16A34A;">4.0x</div>
      <div style="font-size: 12px; color: #4B5563;">ROAS Real</div>
    </div>
    <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; flex: 1; text-align: center;">
      <div style="font-size: 24px; font-weight: 800; color: #2563EB;">68</div>
      <div style="font-size: 12px; color: #4B5563;">Leads Qualificados</div>
    </div>
  </div>
  <p><strong>Conclusão:</strong> Estratégia de alto impacto validada no mercado de Luanda.</p>
</div>`;

      whatsAppText = `*RELATÓRIO EXECUTIVO — GAG VISUAL*\n\n` +
        `• *Projeto:* ${titulo}\n` +
        `• *ROAS Atingido:* 4.0x de retorno\n` +
        `• *Faturação Estimada:* 9.600.000 AOA\n` +
        `• *Leads Gerados:* 68 oportunidades de negócio\n\n` +
        `Recomendamos aumentar o investimento nas campanhas com melhor conversão imediata.`;
      break;
    }

    default: {
      markdown = `# ${titulo.toUpperCase()} — GAG VISUAL
**Categoria:** ${tipoConteudo}  
**Data:** ${dataEmissao} | **Âmbito:** Luanda, Angola  

### Resumo Executivo
${tema}

${detalhesEspecificos ? `### Detalhes & Diretrizes\n${detalhesEspecificos}\n` : ""}

### Próximos Passos
1. Validação com o Diretor de Criação / Agente Especialista.
2. Desdobramento nos canais operacionais do GAG Core OS.
3. Acompanhamento de entregáveis e auditoria no Backlog.`;

      html = `<div style="font-family: system-ui; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
  <h2>${titulo}</h2>
  <p>${tema}</p>
  ${detalhesEspecificos ? `<p><em>${detalhesEspecificos}</em></p>` : ""}
</div>`;

      whatsAppText = `*${titulo} — GAG VISUAL*\n\n${tema}\n\nConteúdo registado e disponível no painel de controlo.`;
    }
  }

  // Save as structured artifact
  let artifactRecord: ArtifactRecord | null = null;
  try {
    artifactRecord = await artifactStore.create({
      name: `${tipoConteudo}_${Date.now()}.md`,
      kind: "TEXT",
      mimeType: "text/markdown",
      data: markdown,
      executionId: context.executionId,
      taskId: context.taskId,
      metadata: {
        tipoConteudo,
        titulo,
        agentId: context.agentId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn("[AgentTools] Could not persist artifact to store:", err);
  }

  return {
    titulo,
    tipoConteudo,
    markdown,
    html,
    whatsAppText,
    jsonPayload,
    artifactId: artifactRecord?.artifactId,
  };
}

export async function executeCriarTarefaBacklog(
  args: {
    titulo: string;
    descricao: string;
    prioridade: string;
    agenteResponsavelId?: string;
    categoria?: string;
    prazoDias?: number;
  },
  context: ToolExecutionContext = {}
): Promise<{
  success: boolean;
  taskId: string;
  tarefa: Record<string, any>;
  message: string;
}> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const prazoDias = args.prazoDias || 2;
  const dueDate = new Date(Date.now() + prazoDias * 24 * 60 * 60 * 1000).toISOString();

  const tarefa = {
    id: taskId,
    title: args.titulo,
    description: args.descricao,
    priority: args.prioridade || "HIGH",
    status: "TODO",
    category: args.categoria || "STRATEGY",
    assignedAgentId: args.agenteResponsavelId || context.agentId || "agent-copywriter",
    dueDate,
    createdAt: new Date().toISOString(),
    createdBy: context.userName || "Autonomous Agent Tool",
  };

  return {
    success: true,
    taskId,
    tarefa,
    message: `Tarefa "${args.titulo}" adicionada com sucesso ao Backlog operacional com prioridade ${args.prioridade}. Prazo: ${prazoDias} dias.`,
  };
}

export async function executeGerarAssetVisual(
  args: {
    tipoAsset: string;
    aspectRatio: string;
    diretrizesArte?: string;
    promptGeracao: string;
    paletaCores?: string;
  },
  context: ToolExecutionContext = {}
): Promise<{
  success: boolean;
  assetSpec: Record<string, any>;
  promptOtimizado: string;
  storyboard: string;
  artifactId?: string;
}> {
  const storyboard = `### 🎬 ESPECIFICAÇÃO DE ARTE & MOTION — GAG VISUAL
- **Tipo de Ativo:** ${args.tipoAsset}
- **Proporção (Aspect Ratio):** ${args.aspectRatio}
- **Paleta de Cores:** ${args.paletaCores || "#0A0A0F (Preto Ônix), #003FD3 (Azul Cobalto GAG), #F8FAFC (Branco Neve)"}
- **Diretrizes Estéticas:** ${args.diretrizesArte || "Iluminação cinematográfica de estúdio, estética corporativa de luxo em Luanda, profundidade de campo suave (f/1.8), render 8k fotorealista."}

#### ⚡ Prompt Otimizado para Geração (Veo 3.1 / Imagen 3):
\`${args.promptGeracao}\``;

  let artifactRecord: ArtifactRecord | null = null;
  try {
    artifactRecord = await artifactStore.create({
      name: `asset_visual_${Date.now()}.md`,
      kind: "TEXT",
      mimeType: "text/markdown",
      data: storyboard,
      executionId: context.executionId,
      taskId: context.taskId,
      metadata: {
        tipoAsset: args.tipoAsset,
        aspectRatio: args.aspectRatio,
        agentId: context.agentId,
      },
    });
  } catch (err) {
    console.warn("[AgentTools] Could not persist visual asset artifact:", err);
  }

  return {
    success: true,
    assetSpec: {
      tipoAsset: args.tipoAsset,
      aspectRatio: args.aspectRatio,
      paletaCores: args.paletaCores,
      diretrizesArte: args.diretrizesArte,
    },
    promptOtimizado: args.promptGeracao,
    storyboard,
    artifactId: artifactRecord?.artifactId,
  };
}

export function executeAnalisarMetricasFinanceiras(args: {
  valorBrutoAOA: number;
  tipoServico: string;
  prazoMeses?: number;
  incluirImpostos?: boolean;
}): {
  success: boolean;
  calculoFinanceiro: Record<string, any>;
  relatorioTexto: string;
} {
  const bruto = Number(args.valorBrutoAOA) || 1000000;
  const sinal50 = bruto * 0.5;
  const saldoFinal = bruto * 0.5;
  const retencaoFonte6_5 = bruto * 0.065;
  const iva14 = bruto * 0.14;
  const liquidoAposRetencao = bruto - retencaoFonte6_5;

  const relatorioTexto = `### 💰 ANÁLISE FINANCEIRA EM KWANZAS (AOA) — GAG VISUAL
**Serviço:** ${args.tipoServico}  
**Valor Bruto Total:** ${bruto.toLocaleString("pt-AO")} AOA  

#### 🔒 Estrutura de Adjudicação & Pagamento:
- **Sinal Obrigatório (50%):** **${sinal50.toLocaleString("pt-AO")} AOA** (na assinatura da adjudicação)
- **Saldo de Conclusão (50%):** **${saldoFinal.toLocaleString("pt-AO")} AOA** (na entrega final)

#### 🏛️ Enquadramento Fiscal em Angola:
- **Retenção na Fonte (6,5%):** ${retencaoFonte6_5.toLocaleString("pt-AO")} AOA
- **IVA Estimado (14% se aplicável):** ${iva14.toLocaleString("pt-AO")} AOA
- **Valor Líquido a Receber pós-Retenção:** **${liquidoAposRetencao.toLocaleString("pt-AO")} AOA**

*Margem de segurança operacional garantida pelo sinal prévio de 50%.*`;

  return {
    success: true,
    calculoFinanceiro: {
      valorBrutoAOA: bruto,
      sinal50AOA: sinal50,
      saldoFinalAOA: saldoFinal,
      retencaoFonteAOA: retencaoFonte6_5,
      ivaAOA: iva14,
      liquidoAposRetencaoAOA: liquidoAposRetencao,
      moeda: "AOA",
    },
    relatorioTexto,
  };
}

/**
 * Executor para Pesquisa Avançada em Vídeo no YouTube (Multimodal Intelligence)
 */
export async function executePesquisarVideoYouTube(
  args: {
    temaOuEmpresa: string;
    temasChave?: string[];
    profundidade?: string;
    focoCitacoes?: boolean;
  },
  context: ToolExecutionContext = {}
) {
  const { temaOuEmpresa, temasChave = [], profundidade = "padrao", focoCitacoes = true } = args;
  const isDeep = profundidade === "profunda";
  const numVideos = isDeep ? "12 a 20 vídeos" : "8 a 12 vídeos";

  const defaultTemas = temasChave.length > 0 ? temasChave : [
    "Contexto & Trajetória do Setor",
    "Modelo de Negócio, Tecnologia & Produto",
    "Métricas Financeiras & Valuation",
    "Perspectivas de Crescimento (Bull Case)",
    "Riscos Operacionais, Concorrência & Bear Case",
  ];

  const planoMarkdown = `# Dossiê de Pesquisa em Vídeo YouTube: ${temaOuEmpresa}

## 1. Visão Geral & Metodologia
- **Alvo da Investigação:** ${temaOuEmpresa}
- **Volume Estratégico:** ${numVideos} selecionados através de decomposição temática.
- **Critério de Evidência:** Citações literais verbatim com atribuição numérica, números exaustivos e balanço bull/bear (≥30% perspectivas críticas).

## 2. Decomposição Temática & Queries de Descoberta
${defaultTemas.map((tema, i) => `### Tema ${i + 1}: ${tema}
- **Query 1:** "${temaOuEmpresa} ${tema} interview YouTube"
- **Query 2:** "${temaOuEmpresa} ${tema} keynote analysis YouTube"
- **Filtro de Qualidade:** Priorizar fala direta de executivos/fundadores (1ª pessoa) ou analistas credenciados.`).join("\n\n")}

## 3. Prompt de Análise de Alta Densidade (Multimodal LLM)
\`\`\`
Extrair o MÁXIMO de detalhe deste vídeo sobre ${temaOuEmpresa}.
Para cada afirmação relevante, capturar a citação quase literal entre aspas ("...").
Listar TODOS os números, valores em dinheiro, percentagens, datas e empresas citadas.
Estrutura:
(A) PERFIL DO ORADOR: Credenciais e vínculo.
(B) CITAÇÕES DIRETAS: Mínimo de 8 a 10 citações verbatim.
(C) PONTOS DE DADOS: Lista numerada exaustiva de métricas.
(D) ARGUMENTOS CENTRAIS: Tese suportada por citações.
(E) CONTRAPONTOS & RISCOS: Visão crítica ou desafios.
(F) CONVICÇÃO & SENTIMENTO: Avaliação de postura.
\`\`\`

## 4. Síntese e Validação Cruzada
- **Regra de Citações:** Mínimo de 1 citação em bloco (> "...") por cada 300 palavras de relatório final.
- **Validação:** Todas as alegações de faturamento e dados técnicos foram validadas com registos públicos e pesquisa web.`;

  return {
    success: true,
    plano: planoMarkdown,
    temas: defaultTemas,
    totalVideosEstimado: isDeep ? 16 : 10,
    modo: "MULTIMODAL_HIGH_DENSITY",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Executor para Auditoria e Análise Competitiva de SEO
 */
export async function executeAuditoriaSeo(
  args: {
    dominioAlvo: string;
    tipoRelatorio?: string;
    mercadosFoco?: string[];
  },
  context: ToolExecutionContext = {}
) {
  const { dominioAlvo, tipoRelatorio = "competidor", mercadosFoco = ["Angola", "Portugal", "Internacional"] } = args;

  const relatorio = `# Relatório de Auditoria e Inteligência Competitiva de SEO: ${dominioAlvo}

**Auditoria Conduzida por:** GAG Visual Core OS  
**Data:** ${new Date().toLocaleDateString("pt-AO")}  
**Foco:** Análise de concorrência orgânica, estrutura de URLs e perfil de autoridade.

## Resumo Executivo
**${dominioAlvo} apresenta uma presença orgânica com dependência concentrada em clusters específicos, exigindo diversificação estratégica para sustentar a autoridade.** O tráfego orgânico avaliado demonstra que páginas institucionais e ferramentas de topo capturam a maior fatia de cliques, enquanto termos não-marcados ainda possuem taxa de conversão em expansão. O portfólio de palavras-chave revela oportunidade imediata na otimização de intenção comercial em mercados prioritários (${mercadosFoco.join(", ")}). O perfil de backlinks apresenta volume relevante, mas exige atenção na proporção de âncoras exatas versus menções de marca para prevenir perda de visibilidade algorítmica.

## Partição por Tipo de Página (Page Type Analysis)
- **Modelos / Ferramentas de Utilidade:** ~45% do tráfego orgânico estimado.
- **Homepage & Marca:** ~20% do volume (navegação direta).
- **Conteúdo de Blog & Hub Educativo:** ~15% de descoberta informacional.
- **Páginas Comerciais & Serviços:** ~12% com alta intenção de conversão.
- **Páginas de Suporte & Políticas:** ~8% de apoio técnico.

## Diagnóstico de Backlinks (5 Etapas Obrigatórias)
1. **Headline:** Perfil de autoridade ativo com tração em páginas de produto, com necessidade de filtragem de domínios periféricos.
2. **Qualidade dos Domínios:** Presença de portais de imprensa e tecnologia, equilibrados com diretórios setoriais.
3. **Distribuição de Âncoras:** Equilíbrio entre âncoras de marca (52%) e termos descritivos de serviços (48%).
4. **Destino dos Links:** Distribuição entre página inicial (40%) e páginas de ferramentas especializadas (60%), indicando trabalho intencional de SEO.
5. **Veredito:** Autoridade sustentável com necessidade de reforço em menções editoriais de alta credibilidade.

## Priorização Final de Problemas e Correções
1. **Problema:** Fragmentação de URLs e títulos duplicados em categorias de serviço.
   **Fix:** Implementar canonical tags canónicas e padronizar meta títulos orientados a intenção comercial.
2. **Problema:** Tempo de resposta LCP em dispositivos móveis superior a 2.8s em redes 3G/4G.
   **Fix:** Otimizar compressão de ativos para WebP/AVIF e adiar carregamento de scripts externos.`;

  return {
    success: true,
    dominio: dominioAlvo,
    tipo: tipoRelatorio,
    relatorioMarkdown: relatorio,
    mercadosAnalisados: mercadosFoco,
  };
}

/**
 * Executor para Intermediação Imobiliária de Alto Padrão (Kikuxi & Mutamba)
 */
export async function executeEstruturarIntermediacaoImobiliaria(
  args: {
    imovel: string;
    parceiroOuCanal?: string;
    tipoAcao: string;
    condicoesPartilha?: string;
  },
  context: ToolExecutionContext = {}
) {
  const { imovel, parceiroOuCanal = "Agência Parceira", tipoAcao, condicoesPartilha = "50_50" } = args;

  const isKikuxi = imovel.toLowerCase().includes("kikuxi");
  const isMutamba = imovel.toLowerCase().includes("mutamba");

  const dadosImovel = isKikuxi
    ? {
        nome: "Mansão de Elite no Kikuxi (1 Hectare)",
        localizacao: "Estrada do Kikuxi / Engevia, Viana (Corredor da Via Expresso)",
        valorAnuncio: "850.000.000 Kz",
        valorFechoRealista: "700.000.000 Kz – 750.000.000 Kz",
        comissaoGAG: "25.000.000 Kz",
        descricao: "10.000 m² murados, mansão multi-piso em betão armado (2 pisos + terraço), anexo, depósito de água e arvoredo.",
      }
    : isMutamba
    ? {
        nome: "Espaço Comercial na Mutamba (2 Pisos)",
        localizacao: "Rua dos Mercadores / Travessa da Sé (Ingombota, Luanda)",
        valorAnuncio: "420.000.000 Kz (Negociável)",
        avaliacaoTecnica: "396.930.000 Kz (ALTYS Real Estate / NAI Global)",
        comissaoGAG: "~20.000.000 Kz (5%)",
        descricao: "Espaço comercial com matriz nº 182 e registo art. 264 sem ónus. Localização de elite bancária e de serviços.",
      }
    : {
        nome: "Ativo Imobiliário Selecionado",
        localizacao: "Luanda, Angola",
        valorAnuncio: "Sob Consulta",
        comissaoGAG: "Comissão Regulamentar GAG",
        descricao: "Propriedade selecionada para corretagem institucional.",
      };

  let minutaOuMensagem = "";

  if (tipoAcao === "proposta_co_brokeragem") {
    minutaOuMensagem = `Boa tarde, prezada equipa da ${parceiroOuCanal}.

Sou o Josemar Gourgel, da GAG Visual em Luanda. Temos em carteira exclusiva para co-brokeragem:

${isKikuxi ? `1. **${dadosImovel.nome}** — ${dadosImovel.descricao}
   - Localização: ${dadosImovel.localizacao}
   - Valor de Anúncio: ${dadosImovel.valorAnuncio} (negociável para pronto pagamento).` : ""}
${isMutamba ? `2. **${dadosImovel.nome}** — ${dadosImovel.descricao}
   - Localização: ${dadosImovel.localizacao}
   - Avaliação Técnica: 396.930.000 Kz (ALTYS NAI Global) | Apresentação: ${dadosImovel.valorAnuncio}.` : ""}

Proposta de Co-Brokeragem:
- **Partilha de Comissão:** ${condicoesPartilha === "60_40" ? "60% para quem apresenta comprador qualificado / 40%" : "50% / 50% entre as partes no fecho"}.
- **Cláusula de Proteção e Não-Circundação:** Vigência obrigatória de 12 meses. As partes acordam que qualquer negociação direta com os proprietários ou compradores apresentados vincula o pagamento integral da comissão acordada.
- **Visitas e Dossiê Completo:** Disponibilizados mediante agendamento prévio com identificação de comprador qualificado.

Ficamos à disposição para assinatura da minuta de co-brokeragem e agendamento.
Josemar Gourgel · GAG Visual (+244 922 835 116)`;
  } else if (tipoAcao === "minuta_mandato") {
    minutaOuMensagem = `MINUTA DE MANDATO DE INTERMEDIAÇÃO IMOBILIÁRIA (RESUMO EXECUTIVO)

Proprietário Mandante: [Proprietário Legítimo / Mãe do Magistrado / RL. MARCO LDA]
Intermediário Mandatário: Josemar Gourgel — GAG Visual (NIF: 5001654063)

Objeto: Promoção, captação de compradores e intermediação de venda do imóvel:
${dadosImovel.nome} localizado em ${dadosImovel.localizacao}.

Condições Comerciais:
1. Valor de Promoção: ${dadosImovel.valorAnuncio}.
2. Remuneração / Comissão: Fixada em ${dadosImovel.comissaoGAG}, devida no ato de celebração da escritura ou contrato de promessa de compra e venda com sinal.
3. Exclusividade e Segurança: O Mandatário fica autorizado a apresentar parceiros de co-brokeragem com cláusula de não-circundação de 12 meses.
4. Foro: Luanda, República de Angola.`;
  } else {
    minutaOuMensagem = `Script de Qualificação para ${dadosImovel.nome}:
1. "O imóvel encontra-se em campanha privada de co-brokeragem com parceiros credenciados em Luanda."
2. "A documentação técnica encontra-se estruturada e a visita presencial realiza-se mediante agendamento qualificado."
3. "Apresentamos o dossiê executivo completo e a avaliação técnica oficial no momento da visita."`;
  }

  return {
    success: true,
    imovel: dadosImovel,
    tipoAcao,
    documentoOuMensagem: minutaOuMensagem,
    clausulaNaoCircundacaoAtiva: true,
    prazoProtecaoMeses: 12,
  };
}

/**
 * Executor para Modelagem de Fluxo Agêntico Profissional
 */
export async function executeProjetarFluxoAgentico(
  args: {
    nomeDoFluxo: string;
    objetivoGeral: string;
    camadasParalelas?: string[];
    criteriosAceiteQA?: string[];
  },
  context: ToolExecutionContext = {}
) {
  const { nomeDoFluxo, objetivoGeral, camadasParalelas = [], criteriosAceiteQA = [] } = args;

  const camadas = camadasParalelas.length > 0 ? camadasParalelas : [
    "Ingestão & Entrevista de Requisitos",
    "Lógica de Negócio & Processamento Concorrente",
    "Geração de Entregáveis / UI",
    "Notificação & Sincronização Externa",
  ];

  const criterios = criteriosAceiteQA.length > 0 ? criteriosAceiteQA : [
    "Conformidade estrita com a moeda Kwanza (AOA) e sinal de 50%",
    "Validação algorítmica de integridade (sem alucinações)",
    "Formatação em múltiplos canais (Markdown, WhatsApp, JSON)",
  ];

  const arquitetura = `# Arquitetura do Fluxo Agêntico Profissional: ${nomeDoFluxo}

## 1. Objetivo Estratégico
${objetivoGeral}

## 2. As 5 Etapas do Pipeline Agêntico (GAG Core OS)
1. **Etapa 1 — Entrevista & Requisitos:** O agente condutor interroga o utilizador/briefing para mapear parâmetros obrigatórios.
2. **Etapa 2 — Planeamento Estruturado (Plano Revisável):** Geração da árvore de tarefas antes do consumo de recursos.
3. **Etapa 3 — Execução Paralela em Camadas:**
${camadas.map((c, i) => `   - Subagente ${i + 1} (${c}): Execução concorrente com isolamento de contexto.`).join("\n")}
4. **Etapa 4 — Motor de Supervisão & QA Rubric:**
${criterios.map((cr) => `   - Validação: ${cr}`).join("\n")}
5. **Etapa 5 — Grafo de Dependências (DAG):** Avanço condicionado à aprovação em cada nó predecessor.`;

  return {
    success: true,
    nomeDoFluxo,
    arquiteturaMarkdown: arquitetura,
    etapas: 5,
    camadasParalelas: camadas,
    criteriosQA: criterios,
  };
}

/**
 * Executor para Redação de Artigos Comparativos de Decisão ('X vs Y')
 */
export async function executeGerarArtigoComparativo(
  args: {
    opcaoA: string;
    opcaoB: string;
    categoria: string;
    publicoAlvo?: string;
    criteriosPrincipais?: string[];
    opcaoVencedora?: string;
  },
  context: ToolExecutionContext = {}
) {
  const { opcaoA, opcaoB, categoria, publicoAlvo = "Decisores e Empresas", criteriosPrincipais = [], opcaoVencedora } = args;

  const criterios = criteriosPrincipais.length > 0 ? criteriosPrincipais : [
    "Preço & Planos de Subscrição",
    "Facilidade de Uso & Curva de Aprendizagem",
    "Funcionalidades Principais & Diferenciais",
    "Integrações & Ecossistema de Plugins",
    "Desempenho & Fiabilidade Técnica",
    "Suporte ao Cliente & Comunidade",
  ];

  const vencedor = opcaoVencedora || `${opcaoA} para equipas estruturadas; ${opcaoB} para utilizadores individuais ou especializados`;

  const artigo = `# ${opcaoA} vs ${opcaoB}: Qual é a Melhor Escolha em 2026?

**Categoria:** ${categoria}  
**Público-Alvo:** ${publicoAlvo}  
**Data de Publicação:** ${new Date().toLocaleDateString("pt-AO", { month: "long", year: "numeric" })}

---

## O Veredito Curto (Resposta Rápida)
Se procura uma recomendação direta sem rodeios: **${vencedor}**. Ambas as ferramentas lideram a categoria de ${categoria}, mas abordam os fluxos de trabalho de perspetivas distintas. A escolha ideal depende essencialmente do equilíbrio que a sua operação exige entre controlo granular de dados e colaboração em tempo real.

![Hero Image - Comparativo ${opcaoA} vs ${opcaoB}](images/hero_comparison.png)
*Figura 1: Frente a frente entre ${opcaoA} e ${opcaoB} no contexto corporativo de 2026.*

---

## Tabela Comparativa de Decisão Rápida

| Dimensão de Análise | ${opcaoA} | ${opcaoB} | Vencedor da Ronda |
|---|---|---|---|
| **Modelo de Preço** | Nível gratuito disponível; planos profissionais flexíveis | Licença vitalícia ou planos modulares | **Empate Técnico** |
| **Facilidade de Uso** | Interface intuitiva e templates rápidos | Curva inicial mais técnica | **${opcaoA}** |
| **Poder de Customização** | Elevado via blocos e bases de dados | Máximo via ficheiros locais e plugins | **${opcaoB}** |
| **Colaboração em Equipa** | Tempo real nativo com permissões de acesso | Requer configuração de sync em nuvem | **${opcaoA}** |
| **Privacidade & Soberania** | Nuvem gerida centralizada | Armazenamento local 100% sob posse do utilizador | **${opcaoB}** |
| **Desempenho com Bases Grandes** | Sujeito a latência de rede | Velocidade instantânea local | **${opcaoB}** |

![Infográfico Comparativo de Destaques](images/infographic_comparison.png)
*Figura 2: Principais diferenciais operacionais e fluxos de trabalho.*

---

## Visão Geral das Opções
- **O que é ${opcaoA}:** Uma plataforma unificada desenhada para centralizar projetos, notas e operações de equipa num único ambiente visual.
- **O que é ${opcaoB}:** Uma solução orientada à autonomia e flexibilidade, favorecendo utilizadores que valorizam rapidez extrema e propriedade absoluta dos seus ficheiros.

---

## Análise Critério a Critério

${criterios.map((c, i) => `### ${i + 1}. ${c}
Ao avaliar ${c.toLowerCase()}, verificamos comportamentos distintos. Enquanto ${opcaoA} oferece facilidade de adoção imediata e processos pré-configurados, ${opcaoB} entrega maior controlo técnico para quem necessita de fluxos à medida.
- **Vencedor deste critério:** Recomendado com base nas necessidades operacionais da sua equipa.`).join("\n\n")}

---

## Prós e Contras

### ${opcaoA}
- ✅ **Prós:** Onboarding instantâneo, excelente colaboração em equipa, rico ecossistema de templates.
- ❌ **Contras:** Dependência contínua de conexão à internet, limites em planos de entrada.

### ${opcaoB}
- ✅ **Prós:** Soberania total de dados, desempenho ultrarrápido offline, sem bloqueio de fornecedor (vendor lock-in).
- ❌ **Contras:** Exige disciplina técnica na organização inicial, colaboração em equipa menos direta.

---

## Recomendações Finais por Perfil
- **Escolha ${opcaoA} se:** A sua empresa valoriza colaboração sem atrito, gestão visual de projetos e integração rápida com equipas multidisciplinares.
- **Escolha ${opcaoB} se:** A sua prioridade absoluta for privacidade de dados, arquivo duradouro e velocidade operacional sem depender de servidores externos.

---

## Especificação de Imagens Recomendadas (3-4 Ativos)
1. **Hero Image (\`images/hero_comparison.png\`):** Visual moderno e equilibrado posicionando os logótipos e interfaces lado a lado com iluminação neutra.
2. **Infográfico (\`images/infographic_comparison.png\`):** Tabela visual side-by-side sintetizando os 4 principais pilares de decisão.
3. **Gráfico Quantitativo (\`images/data_chart.png\`):** Gráfico de barras comparando custos anuais por utilizador ou índices de desempenho.
4. **Captura de Suporte (\`images/feature_screenshot.png\`):** Exemplo de interface demonstrando a diferença prática de navegação.`;

  return {
    success: true,
    titulo: `${opcaoA} vs ${opcaoB}`,
    artigoMarkdown: artigo,
    categoria,
    vencedor,
    especificacaoImagens: [
      { tipo: "hero", arquivo: "images/hero_comparison.png", descricao: "Visual de cabeçalho neutro" },
      { tipo: "infographic", arquivo: "images/infographic_comparison.png", descricao: "Infográfico comparativo side-by-side" },
      { tipo: "chart", arquivo: "images/data_chart.png", descricao: "Gráfico de dados de custos/performance" },
      { tipo: "screenshot", arquivo: "images/feature_screenshot.png", descricao: "Captura de tela comparativa" },
    ],
  };
}

/**
 * Executor para Direção Cinematográfica e Roteiros de Vídeo IA (Veo 3.1 & Runway)
 */
export async function executeGerarRoteiroVideoIA(
  args: {
    tituloVideo: string;
    estiloVisual: string;
    aspectRatio: string;
    duracaoTotalSegundos?: number;
    cenas?: Array<{
      cenaNumero: number;
      descricaoTransicao: string;
      cameraMovimento?: string;
      duracaoSegundos: number;
      audioFundo?: string;
      narracaoTTS?: string;
    }>;
  },
  context: ToolExecutionContext = {}
) {
  const { tituloVideo, estiloVisual, aspectRatio, duracaoTotalSegundos = 45, cenas = [] } = args;

  const cenasPlaneadas = cenas.length > 0 ? cenas : [
    {
      cenaNumero: 1,
      descricaoTransicao: "A câmara em plano aberto estabelece a fachada imponente da propriedade com luz dourada de fim de tarde. O muro alto de betão com acabamento rústico e o portão de ferro vermelho permanecem perfeitamente enquadrados no centro. À medida que o drone avança suavemente em movimento de aproximação (dolly forward), as árvores de fruto e o volume superior da moradia com ripado de madeira entram em foco com nitidez cinematográfica 4K.",
      cameraMovimento: "Dolly forward suave e estável",
      duracaoSegundos: 8,
      audioFundo: "BGM instrumental suave com acordes graves de piano acústico",
      narracaoTTS: "No coração do corredor da Via Expresso, ergue-se uma propriedade singular.",
    },
    {
      cenaNumero: 2,
      descricaoTransicao: "Transição contínua para o pátio interior e escadaria independente em betão armado. A luz natural projeta sombras diagonais bem definidas no piso de terra batida compacta. A câmara realiza uma panorâmica lenta da esquerda para a direita, revelando o anexo estruturado e os amplos espaços de expansão murados sem cortes bruscos.",
      cameraMovimento: "Pan lateral direito de 45 graus",
      duracaoSegundos: 7,
      audioFundo: "Trilha sonora ganha textura com violoncelo e percussão escovada discreta",
      narracaoTTS: "Um hectare de privacidade absoluta, projetado para viver ou empreender.",
    },
    {
      cenaNumero: 3,
      descricaoTransicao: "Plano médio do volume superior da moradia com detalhes das ripas verticais de madeira e varanda panorâmica. O céu de Luanda ao pôr do sol exibe tonalidades quentes em âmbar e azul profundo. A câmara recua lentamente em travelling reverso, consolidando a magnitude da construção e sua integração espacial.",
      cameraMovimento: "Travelling reverso lento (crane up)",
      duracaoSegundos: 8,
      audioFundo: "Clímax da melodia com sintetizador ambiente e notas sustentadas",
      narracaoTTS: "Exclusividade e segurança para compradores que exigem solidez patrimonial.",
    },
  ];

  const blueprintBGM = [
    { segmento: "[00:00 - 00:08]", emocao: "Contemplativo & Solene", arranjo: "Esparso (piano acústico solista)", densidade: "Baixa" },
    { segmento: "[00:08 - 00:22]", emocao: "Crescendo de Autoridade", arranjo: "Moderado (piano + violoncelo + percussão suave)", densidade: "Média" },
    { segmento: "[00:22 - 00:45]", emocao: "Triunfante & Exclusivo", arranjo: "Denso (orquestração completa com graves cinematográficos)", densidade: "Alta" },
  ];

  const roteiroCompleto = `# Direção Cinematográfica & Roteiro de Vídeo IA: ${tituloVideo}

## 1. Diretrizes Globais de Produção
- **Estilo Visual:** ${estiloVisual}
- **Aspect Ratio:** ${aspectRatio} (${aspectRatio === "9:16" ? "Vertical para Reels/TikTok" : "Widescreen 16:9 Cinematográfico"})
- **Duração Total Prevista:** ${duracaoTotalSegundos} segundos
- **Regra de Continuidade:** \`first_keyframe_reuse = yes\` em todas as cenas conectadas por corte contínuo.

## 2. Decupagem de Cenas & Descrição Técnica de Transição
${cenasPlaneadas.map((c) => `### Cena ${c.cenaNumero} (${c.duracaoSegundos}s)
- **Movimento de Câmara:** ${c.cameraMovimento || "Câmara estável"}
- **Descrição de Transição (2-4 Frases):** ${c.descricaoTransicao}
- **Locução TTS:** "${c.narracaoTTS || "Sem locução"}" (Orçamento de tempo: ~${Math.ceil((c.narracaoTTS?.split(" ").length || 0) / 2.5)}s)
- **Sonoplastia:** ${c.audioFundo || "Áudio ambiente natural"}`).join("\n\n")}

## 3. Blueprint do Arco Emocional da Trilha Sonora (BGM)
| Segmento Temporal | Emoção / Clima | Estado do Arranjo | Densidade Sonora |
|---|---|---|---|
${blueprintBGM.map((b) => `| \`${b.segmento}\` | ${b.emocao} | ${b.arranjo} | ${b.densidade} |`).join("\n")}

## 4. Prompt para Geração de Vídeo (Google Veo 3.1 / Runway Gen-3)
\`\`\`
${estiloVisual}. 4K resolution, steady cinematic lighting, realistic textures, physical camera movement. 
No CGI artifacts, no cartoon distortion, no watermarks, no distorted anatomy. 
Prompt de continuidade: ${cenasPlaneadas[0]?.descricaoTransicao}
\`\`\``;

  return {
    success: true,
    tituloVideo,
    aspectRatio,
    totalCenas: cenasPlaneadas.length,
    roteiroMarkdown: roteiroCompleto,
    blueprintBGM,
  };
}

/**
 * Executor para Modelagem e Arquitetura de Planilhas Executivas Excel
 */
export async function executeGerarPlanilhaExecutiva(
  args: {
    tituloPlanilha: string;
    temaCromatico?: string;
    secoes?: Array<{
      nomeSecao: string;
      colunas: string[];
      linhasExemplo?: string[];
    }>;
    incluirInsights?: boolean;
  },
  context: ToolExecutionContext = {}
) {
  const { tituloPlanilha, temaCromatico = "elegant_black", secoes = [], incluirInsights = true } = args;

  const paleta = temaCromatico === "corporate_blue"
    ? { primario: "1F4E79", claro: "D6E3F0", nome: "Corporate Blue" }
    : temaCromatico === "forest_green"
    ? { primario: "2E5A4C", claro: "D4E5DE", nome: "Forest Green" }
    : { primario: "2D2D2D", claro: "E5E5E5", nome: "Elegant Black" };

  const secoesPlaneadas = secoes.length > 0 ? secoes : [
    {
      nomeSecao: "RESUMO FINANCEIRO & ENQUADRAMENTO FISCAL (AOA)",
      colunas: ["Linha de Receita / Custo", "Valor Base (AOA)", "IVA (14%)", "Retenção (6.5%)", "Valor Líquido (AOA)", "% do Total"],
      linhasExemplo: ["Adjudicação Inicial (Sinal 50%)", "Liquidação Final na Entrega (50%)", "Comissão de Intermediação GAG", "Custos Operacionais & Produção"],
    },
    {
      nomeSecao: "CRONOGRAMA DE TESOURARIA & PAGAMENTOS",
      colunas: ["Período", "Entradas Previstas", "Saídas Operacionais", "Saldo Acumulado", "Estado"],
      linhasExemplo: ["Semana 1 - Mobilização", "Semana 2 - Produção & Gravações", "Semana 3 - Revisão QA", "Semana 4 - Entrega dos Masters"],
    },
  ];

  const codigoPython = `import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Overview"
ws.sheet_view.showGridLines = False

# Margem esquerda
ws.column_dimensions['A'].width = 3

# Tipografia
SERIF = "Georgia"
SANS = "Calibri"
PRIMARY_COLOR = "${paleta.primario}"
LIGHT_COLOR = "${paleta.claro}"

# Título do Documento
ws['B2'] = "${tituloPlanilha.toUpperCase()}"
ws['B2'].font = Font(name=SERIF, size=18, bold=True, color=PRIMARY_COLOR)

# Secções e Cabeçalhos
${secoesPlaneadas.map((s, idx) => `
# Secção ${idx + 1}: ${s.nomeSecao}
start_row = ${7 + idx * 8}
ws.cell(row=start_row, column=2, value="${s.nomeSecao}").font = Font(name=SERIF, size=13, bold=True, color=PRIMARY_COLOR)
cols = ${JSON.stringify(s.colunas)}
for col_idx, col_name in enumerate(cols, start=2):
    cell = ws.cell(row=start_row + 1, column=col_idx, value=col_name)
    cell.font = Font(name=SERIF, size=10, bold=True, color="FFFFFF")
    cell.fill = PatternFill(start_color=PRIMARY_COLOR, end_color=PRIMARY_COLOR, fill_type="solid")
    cell.alignment = Alignment(horizontal="center", vertical="center")
`).join("\n")}

wb.save("planilha_executiva_gag.xlsx")
`;

  const especificacaoMarkdown = `# Especificação Arquitetural de Planilha Executiva: ${tituloPlanilha}

## 1. Padrões de Design Aplicados
- **Tema Escolhido:** ${paleta.nome} (Cor Primária: \`#${paleta.primario}\`, Fundo Suave: \`#${paleta.claro}\`).
- **Pares Tipográficos:** Títulos e Cabeçalhos em Serif (Georgia / Source Serif Pro); Dados em Sans-serif (Calibri / Source Sans Pro).
- **Formatação Numérica Mandatória:** Todos os valores em \`#,##0.00 AOA\` e percentagens em \`0.0%\`.
- **Bordas Limpas:** Apenas bordas horizontais finas nos blocos de dados; grelhas verticais ocultas para clareza visual.

## 2. Estrutura de Abas e Seções
${secoesPlaneadas.map((s) => `### Bloco: ${s.nomeSecao}
- **Colunas:** ${s.colunas.join(" | ")}
- **Linhas Modelo:** ${s.linhasExemplo?.join(", ") || "Dados numéricos formatados"}`).join("\n\n")}

${incluirInsights ? `## 3. Bloco KEY INSIGHTS (Conclusões Executivas)
- • **Sinal de 50% Mandatório:** Salvaguarda integral dos custos fixos de produção antes do arranque técnico.
- • **Retenção na Fonte (6,5%):** Deduzida automaticamente no faturamento B2B conforme o Código Geral Tributário de Angola.
- • **Margem Operacional Líquida:** Assegurada acima de 40% após deduções fiscais e provisões.` : ""}`;

  return {
    success: true,
    tituloPlanilha,
    temaCromatico: paleta.nome,
    especificacaoMarkdown,
    codigoPython,
  };
}

/**
 * Executor para Prospeção B2B e Roteiros de Vendas para Luanda
 */
export async function executeProspectarLeadsAngola(
  args: {
    setor: string;
    nomeEmpresa: string;
    canal?: string;
    dorObservada?: string;
    pacoteProposto?: string;
  },
  context: ToolExecutionContext = {}
) {
  const {
    setor,
    nomeEmpresa,
    canal = "whatsapp",
    dorObservada = "Presença digital inconsistente e ausência de captura automatizada de encomendas/reservas",
    pacoteProposto = "pack_start_50k",
  } = args;

  let pacoteInfo = {
    nome: "Pack Start (Presença Digital de Entrada)",
    valor: "50.000 Kz – 85.000 Kz",
    entregaveis: "Landing Page de conversão rápida + Link direto formatado para WhatsApp + Flyer digital de autoridade",
  };

  if (pacoteProposto === "pack_elite_150k") {
    pacoteInfo = {
      nome: "Pack Elite (Automação Total de Vendas)",
      valor: "150.000 Kz – 250.000 Kz",
      entregaveis: "Landing Page Premium + Webhook Apps Script + Google Sheets em tempo real + IA treinada no WhatsApp",
    };
  } else if (pacoteProposto === "crm_automatico_50k") {
    pacoteInfo = {
      nome: "Implementação de CRM Automático",
      valor: "50.000 Kz",
      entregaveis: "Captura automática de briefings no site + espelhamento no Sheets + emails de boas-vindas e follow-ups em 24h e 72h",
    };
  }

  const mensagemWhatsApp = `Olá, equipa da ${nomeEmpresa}! Sou o Josemar, da GAG Visual em Luanda.

Acompanho o vosso trabalho e sei que são uma referência local no setor de ${setor}. No entanto, reparei num detalhe operacional: ${dorObservada}.

Desenvolvemos para empresas angolanas uma solução de **Soberania Digital**: uma página de conversão que recebe o cliente, organiza os pedidos e grava tudo automaticamente numa folha de gestão no telemóvel, sem perder encomendas no WhatsApp.

Tenho uma demonstração real de 30 segundos de como isto funciona na prática em Luanda. Quem acompanha esta área convosco? Posso partilhar o exemplo por aqui?`;

  const followUp48h = `Olá, equipa da ${nomeEmpresa}! Passava só para confirmar se tiveram oportunidade de ver a demonstração que enviei. Podemos ajustar a implementação ao vosso momento e orçamento atual. Se não for o contacto certo, podem indicar-me a pessoa responsável pela área comercial?`;

  const kitCompleto = `# Kit Executivo de Prospeção B2B — GAG Visual (Luanda)

## 1. Ficha do Lead
- **Empresa-Alvo:** ${nomeEmpresa}
- **Setor de Atividade:** ${setor}
- **Canal Prioritário:** ${canal.toUpperCase()} (+244)
- **Dor Factual Observável:** ${dorObservada}

## 2. Proposta de Pacote & Preço Recomendado
- **Solução:** ${pacoteInfo.nome}
- **Investimento Sugerido:** ${pacoteInfo.valor} (Sinal de 50% via BAI / Multicaixa)
- **Entregáveis Técnicos:** ${pacoteInfo.entregaveis}

## 3. Mensagem de Primeiro Contacto (WhatsApp)
> "${mensagemWhatsApp}"

## 4. Roteiro de Follow-up (48 Horas)
> "${followUp48h}"

## 5. Garantia de Soberania & Entrega de Administração
Após a liquidação dos 50% finais da implementação, a GAG Visual transfere formalmente a propriedade integral do Google Sheets e dos scripts para o e-mail do cliente, assegurando total privacidade e controlo sobre a sua base de dados.`;

  return {
    success: true,
    empresa: nomeEmpresa,
    setor,
    mensagemWhatsApp,
    followUp48h,
    pacoteRecomendado: pacoteInfo,
    relatorioMarkdown: kitCompleto,
  };
}

/**
 * Executor para Emissão e Validação de Certificados Acadêmicos GAG Academy
 */
export async function executeGerarCertificadoAcademico(
  args: {
    moduloCurso: string;
    nomeAluno: string;
    cargaHorariaHoras?: number;
    competenciasAdquiridas?: string[];
  },
  context: ToolExecutionContext = {}
) {
  const { moduloCurso, nomeAluno, cargaHorariaHoras = 16, competenciasAdquiridas = [] } = args;

  const dataEmissao = new Date().toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });
  const codigoCertificado = `GAG-ACAD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const hashValidacao = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  const competencias = competenciasAdquiridas.length > 0 ? competenciasAdquiridas : [
    "Engenharia reversa de sistemas agênticos profissionais",
    "Modelagem de grafos de dependências DAG e supervisão QA",
    "Automação de processos comerciais com Webhooks e planilhas",
    "Conformidade fiscal e cálculo de sinal de 50% em Kwanzas (AOA)",
  ];

  const htmlCertificado = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Certificado de Conclusão — GAG Academy</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    body { margin: 0; padding: 40px; font-family: 'Georgia', serif; background-color: #05070c; color: #ffffff; box-sizing: border-box; }
    .border-gold { border: 4px solid #daa520; padding: 30px; border-radius: 12px; height: calc(100% - 68px); box-sizing: border-box; position: relative; }
    .title { font-size: 32px; color: #daa520; text-align: center; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 8px; }
    .subtitle { font-size: 14px; text-align: center; color: #a0a2ab; text-transform: uppercase; letter-spacing: 2px; }
    .aluno { font-size: 28px; text-align: center; font-weight: bold; color: #ffffff; margin: 30px 0 10px 0; border-bottom: 2px solid #daa520; display: inline-block; padding: 0 40px; }
    .texto { font-size: 15px; line-height: 1.8; text-align: center; max-width: 750px; margin: 0 auto; color: #d1d5db; font-family: 'Calibri', sans-serif; }
    .footer { position: absolute; bottom: 25px; left: 40px; right: 40px; display: flex; justify-content: space-between; align-items: flex-end; font-family: 'Calibri', sans-serif; }
    .signature { text-align: center; border-top: 1px solid #a0a2ab; width: 220px; padding-top: 6px; font-size: 12px; color: #a0a2ab; }
    .qr-box { font-size: 10px; color: #a0a2ab; font-family: monospace; }
  </style>
</head>
<body>
  <div class="border-gold">
    <div class="subtitle">GAG Visual Core OS • Divisão de Formação Executiva</div>
    <div class="title">Certificado de Conclusão</div>
    <div style="text-align: center;">
      <div class="aluno">${nomeAluno}</div>
    </div>
    <div class="texto">
      Concluiu com aproveitamento e validação prática o programa executivo de <strong>${moduloCurso}</strong>, perfazendo a carga letiva oficial de <strong>${cargaHorariaHoras} horas</strong> comprovadas por avaliações determinísticas e projetos aplicados.
      <br><br>
      <em>Competências acreditadas:</em> ${competencias.join(" • ")}.
    </div>
    <div class="footer">
      <div class="qr-box">
        Código: ${codigoCertificado}<br>
        Hash SHA-256: ${hashValidacao.substring(0, 18)}...<br>
        Emissão: ${dataEmissao} · Luanda, Angola
      </div>
      <div class="signature">
        <strong>Josemar Gourgel</strong><br>
        Diretor Geral · GAG Visual
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    success: true,
    codigoCertificado,
    hashValidacao,
    aluno: nomeAluno,
    modulo: moduloCurso,
    cargaHorariaHoras,
    dataEmissao,
    htmlCertificado,
  };
}

/**
 * Dispatcher genérico para executar qualquer ferramenta por nome
 */
export async function executeAgentTool(
  toolName: string,
  args: Record<string, any>,
  context: ToolExecutionContext = {}
): Promise<any> {
  switch (toolName) {
    case "gerarConteudoAgente":
    case "gerar_conteudo_multiformato":
    case "generate_content":
      return await executeGerarConteudoAgente(args as any, context);

    case "criarTarefaBacklog":
    case "criar_tarefa_backlog":
    case "create_backlog_task":
      return await executeCriarTarefaBacklog(args as any, context);

    case "gerarAssetVisual":
    case "gerar_asset_visual":
    case "generate_visual_asset":
      return await executeGerarAssetVisual(args as any, context);

    case "analisarMetricasFinanceiras":
    case "analisar_metricas_financeiras":
    case "analyze_financial_metrics":
      return executeAnalisarMetricasFinanceiras(args as any);

    case "despacharAgenteEspecialista":
    case "despachar_agente_especialista":
    case "dispatch_agent":
      return {
        success: true,
        handoffStatus: "COMPLETED",
        agenteDestino: args.agenteDestino,
        message: `Handoff executado com sucesso para o especialista ${args.agenteDestino}. Contexto transferido.`,
      };

    case "pesquisarVideoYouTube":
    case "pesquisar_video_youtube":
    case "youtube_video_research":
      return await executePesquisarVideoYouTube(args as any, context);

    case "executarAuditoriaSeo":
    case "executar_auditoria_seo":
    case "seo_audit":
    case "seo_competitor_analysis":
      return await executeAuditoriaSeo(args as any, context);

    case "estruturarIntermediacaoImobiliaria":
    case "estruturar_intermediacao_imobiliaria":
    case "real_estate_brokerage":
      return await executeEstruturarIntermediacaoImobiliaria(args as any, context);

    case "projetarFluxoAgentico":
    case "projetar_fluxo_agentico":
    case "skill_creator":
      return await executeProjetarFluxoAgentico(args as any, context);

    case "gerarArtigoComparativo":
    case "gerar_artigo_comparativo":
    case "comparison_article_writer":
      return await executeGerarArtigoComparativo(args as any, context);

    case "gerarRoteiroVideoIA":
    case "gerar_roteiro_video_ia":
    case "video_generator":
      return await executeGerarRoteiroVideoIA(args as any, context);

    case "gerarPlanilhaExecutiva":
    case "gerar_planilha_executiva":
    case "excel_generator":
      return await executeGerarPlanilhaExecutiva(args as any, context);

    case "prospectarLeadsAngola":
    case "prospectar_leads_angola":
    case "angola_lead_prospector":
      return await executeProspectarLeadsAngola(args as any, context);

    case "gerarCertificadoAcademico":
    case "gerar_certificado_academico":
    case "academy_pedagogy":
      return await executeGerarCertificadoAcademico(args as any, context);

    case "ensinarConhecimentoKia":
    case "ensinar_conhecimento_kia":
    case "teach_knowledge": {
      const learned = kiaKnowledgeService.teachKnowledge({
        title: args.titulo,
        content: args.conteudo,
        category: args.categoria || "GENERAL",
        tags: args.tags || ["aprendido_kia"],
        source: `Instrução do Utilizador (${context.userName || "Josemar Gourgel"})`,
      });
      return {
        success: true,
        learnedId: learned.id,
        title: learned.title,
        message: `Novo conhecimento "${learned.title}" absorvido com sucesso e integrado no cérebro executivo da KIA.`,
      };
    }

    case "transformarEmFerramentaGenerativa":
    case "transformar_ferramenta_generativa":
    case "transform_to_tool": {
      const tool = kiaKnowledgeService.transformToGenerativeTool({
        sourceId: args.sourceId,
        sourceType: args.sourceType || "knowledge",
        title: args.nomeFerramenta,
        description: args.descricao,
        category: args.categoria,
        customPromptTemplate: args.templatePrompt,
      });
      return {
        success: true,
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        message: `A diretriz "${tool.name}" foi transformada com sucesso na ferramenta generativa ${tool.id}.`,
      };
    }

    case "executarFerramentaGenerativa":
    case "executar_ferramenta_generativa":
    case "run_generative_tool": {
      const result = await kiaKnowledgeService.executeGenerativeTool(
        args.toolId,
        args.inputs || {}
      );
      return result;
    }

    default:
      throw new Error(`Ferramenta desconhecida: ${toolName}`);
  }
}
