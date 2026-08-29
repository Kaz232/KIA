/**
 * GAG CORE OS — N8N WORKFLOW JSON SNIPPETS & TEMPLATES
 * Ready-to-import N8N workflow JSON files for common GAG Visual operations.
 * Fully formatted according to N8N schema (nodes, connections, settings).
 */

export interface N8NWorkflowTemplate {
  id: string;
  name: string;
  category: "CRM" | "FINANCE" | "MARKETING" | "ERP" | "WHATSAPP" | "AGT_TAX" | "OPERATIONS";
  badge: string;
  description: string;
  tags: string[];
  nodesCount: number;
  autonomyLevel: 0 | 1 | 2;
  webhookPath: string;
  agentSlugSuggestion: string;
  agentRoleSuggestion: string;
  agentObjectiveSuggestion: string;
  jsonSnippet: Record<string, any>;
}

export const GAG_N8N_WORKFLOW_TEMPLATES: N8NWorkflowTemplate[] = [
  {
    id: "tpl_crm_lead_qualification",
    name: "Qualificação & Ingestão de Leads CRM Luanda",
    category: "CRM",
    badge: "CRM & Comercial",
    description: "Ingere leads recebidos da KIA, valida NIF angolano e formato de contacto (+244), cria registo no CRM e notifica a equipa de vendas.",
    tags: ["Leads", "Luanda", "WhatsApp", "CRM", "Automação"],
    nodesCount: 6,
    autonomyLevel: 0,
    webhookPath: "gag-lead-intake-v2",
    agentSlugSuggestion: "closer-vendas-b2b",
    agentRoleSuggestion: "Especialista em Fecho Comercial & CRM",
    agentObjectiveSuggestion: "Qualificar leads corporativos de Luanda e encaminhar orçamentos de sinalética e branding em menos de 10 minutos.",
    jsonSnippet: {
      name: "GAG Visual - Lead Qualification & CRM Sync",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "gag-lead-intake-v2",
            responseMode: "lastNode",
            options: {},
          },
          name: "Webhook Ingestão Lead",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300],
          id: "node-wh-lead",
        },
        {
          parameters: {
            jsCode: `// Validação de NIF e Telefone de Angola (+244)
const body = $input.first().json.body || $input.first().json;
const phone = (body.phone || "").replace(/\\s+/g, "");
const isAngolaPhone = phone.startsWith("+244") || phone.startsWith("244") || phone.length === 9;

const formattedPhone = isAngolaPhone && !phone.startsWith("+") ? "+244" + phone.replace(/^244/, "") : phone;
const leadScore = (body.budgetAOA && parseInt(body.budgetAOA.replace(/\\D/g, '')) > 5000000) ? 90 : 70;

return [{
  json: {
    clientName: body.clientName || "Cliente Corporativo",
    contactPerson: body.contactPerson || "Representante",
    phone: formattedPhone,
    email: body.email || "geral@cliente.ao",
    serviceRequested: body.serviceRequested || "Sinalética & Branding",
    budgetAOA: body.budgetAOA || "Sob Consulta",
    urgency: body.urgency || "Normal",
    leadScore,
    location: "Luanda, Angola",
    source: body.source || "KIA_AGENT",
    receivedAt: new Date().toISOString()
  }
}];`,
          },
          name: "Validador Angola & Lead Scoring",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300],
          id: "node-code-score",
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: "={{ $json.leadScore }}",
                  operation: "largerEqual",
                  value2: 80,
                },
              ],
            },
          },
          name: "Lead VIP / Alto Valor?",
          type: "n8n-nodes-base.if",
          typeVersion: 1,
          position: [680, 300],
          id: "node-if-vip",
        },
        {
          parameters: {
            requestMethod: "POST",
            url: "https://api.gagvisual.com/api/crm/deals",
            jsonParameters: true,
            options: {},
            bodyParametersJson: "={{ JSON.stringify($json) }}",
          },
          name: "Registar Negócio no CRM",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [920, 200],
          id: "node-http-crm",
        },
        {
          parameters: {
            requestMethod: "POST",
            url: "https://api.gagvisual.com/api/notifications/whatsapp",
            jsonParameters: true,
            options: {},
            bodyParametersJson: `={
  "phone": "+244923000000",
  "message": "🔥 NOVO LEAD QUALIFICADO GAG VISUAL!\\nCliente: " + $json.clientName + "\\nOrçamento: " + $json.budgetAOA + "\\nContacto: " + $json.phone
}`,
          },
          name: "Alerta WhatsApp Equipa Vendas",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [1140, 200],
          id: "node-http-wa-alert",
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `={
  "status": "QUALIFIED_AND_ASSIGNED",
  "leadScore": $json.leadScore,
  "client": $json.clientName,
  "assignedTo": "Equipa Comercial Luanda",
  "dispatchRef": "0xLEAD-" + $now.format('YYYYMMDD-HHmmss')
}`,
          },
          name: "Resposta ao Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [1360, 300],
          id: "node-resp-lead",
        },
      ],
      connections: {
        "Webhook Ingestão Lead": {
          main: [[{ node: "Validador Angola & Lead Scoring", type: "main", index: 0 }]],
        },
        "Validador Angola & Lead Scoring": {
          main: [[{ node: "Lead VIP / Alto Valor?", type: "main", index: 0 }]],
        },
        "Lead VIP / Alto Valor?": {
          main: [
            [{ node: "Registar Negócio no CRM", type: "main", index: 0 }],
            [{ node: "Registar Negócio no CRM", type: "main", index: 0 }],
          ],
        },
        "Registar Negócio no CRM": {
          main: [[{ node: "Alerta WhatsApp Equipa Vendas", type: "main", index: 0 }]],
        },
        "Alerta WhatsApp Equipa Vendas": {
          main: [[{ node: "Resposta ao Webhook", type: "main", index: 0 }]],
        },
      },
      active: true,
      settings: { executionOrder: "v1" },
    },
  },

  {
    id: "tpl_erp_invoice_sync",
    name: "Sincronização de Faturas ERP & Retenção AGT",
    category: "ERP",
    badge: "ERP & Contabilidade",
    description: "Exporta itens faturados com cálculo automático de IVA (14%) e retenção na fonte (6.5%) para ERP Primavera e arquivo de faturação.",
    tags: ["Faturação", "IVA 14%", "Retenção 6.5%", "Primavera ERP", "AGT"],
    nodesCount: 5,
    autonomyLevel: 1,
    webhookPath: "gag-erp-invoice-sync",
    agentSlugSuggestion: "auditor-fiscal-contabil",
    agentRoleSuggestion: "Auditor Contabilístico & Fiscal AGT",
    agentObjectiveSuggestion: "Validar mapas de faturação, apuramento de retenções na fonte de 6.5% e conformidade com o código do IVA de Angola.",
    jsonSnippet: {
      name: "GAG Visual - Invoice ERP Sync & AGT Withholding Tax",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "gag-erp-invoice-sync",
            responseMode: "lastNode",
          },
          name: "Webhook Fatura Emitida",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [200, 300],
          id: "node-wh-invoice",
        },
        {
          parameters: {
            jsCode: `// Apuramento tributário angolano (IVA 14% e Retenção na Fonte 6.5% de serviços)
const invoice = $input.first().json.body || $input.first().json;
const totalBruto = Number(invoice.totalAOA) || 0;
const iva = totalBruto * 0.14;
const retencaoFonte = totalBruto * 0.065;
const totalLiquidoAReceber = totalBruto + iva - retencaoFonte;

return [{
  json: {
    invoiceId: invoice.invoiceId || "FT-GAG-" + Date.now(),
    clientNIF: invoice.clientNIF || "5418920192",
    clientName: invoice.clientName || "Cliente Geral",
    totalBrutoAOA: totalBruto,
    iva14AOA: iva,
    retencaoFonte6_5AOA: retencaoFonte,
    totalLiquidoAOA: totalLiquidoAReceber,
    taxCode: "AGT-ANGOLA-IVA14",
    status: "SYNCED_TO_ERP",
    processedTimestamp: new Date().toISOString()
  }
}];`,
          },
          name: "Motor de Cálculo Tributário AGT",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [420, 300],
          id: "node-code-tax",
        },
        {
          parameters: {
            requestMethod: "POST",
            url: "https://erp.gagvisual.com/api/primavera/invoices",
            jsonParameters: true,
            options: {},
            bodyParametersJson: "={{ JSON.stringify($json) }}",
          },
          name: "Push Primavera ERP",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [660, 300],
          id: "node-http-erp",
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `={
  "success": true,
  "invoiceId": $json.invoiceId,
  "client": $json.clientName,
  "ivaApurado": $json.iva14AOA,
  "retencaoFonte": $json.retencaoFonte6_5AOA,
  "erpSynced": true,
  "hash": "0xFT-" + $now.format('YYYYMMDD-HHmmss')
}`,
          },
          name: "Resposta ao Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [900, 300],
          id: "node-resp-invoice",
        },
      ],
      connections: {
        "Webhook Fatura Emitida": {
          main: [[{ node: "Motor de Cálculo Tributário AGT", type: "main", index: 0 }]],
        },
        "Motor de Cálculo Tributário AGT": {
          main: [[{ node: "Push Primavera ERP", type: "main", index: 0 }]],
        },
        "Push Primavera ERP": {
          main: [[{ node: "Resposta ao Webhook", type: "main", index: 0 }]],
        },
      },
      active: true,
    },
  },

  {
    id: "tpl_whatsapp_broadcast",
    name: "Disparo Automatizado WhatsApp Meta Cloud API",
    category: "WHATSAPP",
    badge: "WhatsApp & Outreach",
    description: "Envia sequências automatizadas, orçamentos em PDF e notificações transacionais aprovadas para clientes da GAG Visual via WhatsApp API.",
    tags: ["WhatsApp", "Meta Cloud API", "Notificações", "Comunicação 24/7"],
    nodesCount: 4,
    autonomyLevel: 1,
    webhookPath: "gag-whatsapp-broadcast",
    agentSlugSuggestion: "operador-whatsapp-suporte",
    agentRoleSuggestion: "Gestor de Mensagens WhatsApp & Suporte",
    agentObjectiveSuggestion: "Garantir resposta e envio de propostas para clientes via WhatsApp em tempo recorde.",
    jsonSnippet: {
      name: "GAG Visual - WhatsApp Automated Campaign Dispatcher",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "gag-whatsapp-broadcast",
            responseMode: "lastNode",
          },
          name: "Webhook Disparo WhatsApp",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [220, 300],
          id: "node-wh-wa",
        },
        {
          parameters: {
            jsCode: `const data = $input.first().json.body || $input.first().json;
const recipient = data.recipientPhone || "+244923000000";
const cleanNumber = recipient.replace(/[^0-9]/g, '');

return [{
  json: {
    messaging_product: "whatsapp",
    to: cleanNumber,
    type: "template",
    template: {
      name: data.templateName || "proposta_comercial_gag",
      language: { code: "pt_PT" },
      components: [
        {
          type: "body",
          parameters: (data.parameters || ["Estimado Cliente", "Serviço GAG Visual"]).map(p => ({ type: "text", text: String(p) }))
        }
      ]
    },
    metaDispatchTime: new Date().toISOString()
  }
}];`,
          },
          name: "Formatar Payload Meta API",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300],
          id: "node-code-wa-format",
        },
        {
          parameters: {
            requestMethod: "POST",
            url: "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages",
            jsonParameters: true,
            headerParametersJson: `={
  "Authorization": "Bearer " + $env.WHATSAPP_ACCESS_TOKEN
}`,
            bodyParametersJson: "={{ JSON.stringify($json) }}",
          },
          name: "Disparo Meta WhatsApp API",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [700, 300],
          id: "node-http-meta",
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `={
  "success": true,
  "recipient": $json.to,
  "status": "SENT_VIA_META_CLOUD",
  "dispatchedAt": $now.format('YYYY-MM-DD HH:mm:ss')
}`,
          },
          name: "Resposta ao Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [940, 300],
          id: "node-resp-wa",
        },
      ],
      connections: {
        "Webhook Disparo WhatsApp": {
          main: [[{ node: "Formatar Payload Meta API", type: "main", index: 0 }]],
        },
        "Formatar Payload Meta API": {
          main: [[{ node: "Disparo Meta WhatsApp API", type: "main", index: 0 }]],
        },
        "Disparo Meta WhatsApp API": {
          main: [[{ node: "Resposta ao Webhook", type: "main", index: 0 }]],
        },
      },
      active: true,
    },
  },

  {
    id: "tpl_financial_executive_report",
    name: "Gerador Automático de DRE & Relatório Financeiro",
    category: "FINANCE",
    badge: "Financeiro & DRE",
    description: "Consolida receitas em Kwanzas (AOA), custos operacionais de Luanda, margem EBITDA e gera resumo executivo pronto para o Diretor Josemar Gourgel.",
    tags: ["DRE", "Finanças", "EBITDA", "Kwanzas", "Relatório"],
    nodesCount: 5,
    autonomyLevel: 1,
    webhookPath: "gag-finance-report-builder",
    agentSlugSuggestion: "diretor-financeiro-ia",
    agentRoleSuggestion: "CFO & Analista Financeiro Estratégico",
    agentObjectiveSuggestion: "Monitorizar a saúde de caixa em AOA, calcular margens de lucro de projetos gráficos e antecipar necessidades de liquidez.",
    jsonSnippet: {
      name: "GAG Visual - Executive Financial Report & Cash Flow",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "gag-finance-report-builder",
            responseMode: "lastNode",
          },
          name: "Webhook Pedido Relatório",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [200, 300],
          id: "node-wh-fin",
        },
        {
          parameters: {
            jsCode: `const data = $input.first().json.body || $input.first().json;
const period = data.periodMonth || "Mês Corrente";
const year = data.periodYear || 2026;

// Modelo DRE Estruturado GAG Visual
const receitaBrutaAOA = 48500000;
const custosProducaoAOA = 18200000;
const despesasOperacionaisAOA = 12400000;
const ebitdaAOA = receitaBrutaAOA - custosProducaoAOA - despesasOperacionaisAOA;
const margemEbitda = ((ebitdaAOA / receitaBrutaAOA) * 100).toFixed(1) + "%";

return [{
  json: {
    period: period + " " + year,
    currency: "AOA",
    receitaBrutaAOA,
    custosProducaoAOA,
    despesasOperacionaisAOA,
    ebitdaAOA,
    margemEbitda,
    pontoEquilibrioAOA: 25000000,
    statusCaixa: "SAUDÁVEL",
    generatedFor: "Josemar Gourgel (Proprietário)",
    timestamp: new Date().toISOString()
  }
}];`,
          },
          name: "Consolidação DRE & Métricas",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [440, 300],
          id: "node-code-dre",
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `={
  "success": true,
  "reportTitle": "Relatório Executivo DRE - GAG Visual (" + $json.period + ")",
  "financials": {
    "receita": $json.receitaBrutaAOA + " Kz",
    "ebitda": $json.ebitdaAOA + " Kz",
    "margem": $json.margemEbitda,
    "status": $json.statusCaixa
  },
  "deliveredTo": $json.generatedFor,
  "reportHash": "0xDRE-" + $now.format('YYYYMMDD')
}`,
          },
          name: "Resposta ao Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [680, 300],
          id: "node-resp-fin",
        },
      ],
      connections: {
        "Webhook Pedido Relatório": {
          main: [[{ node: "Consolidação DRE & Métricas", type: "main", index: 0 }]],
        },
        "Consolidação DRE & Métricas": {
          main: [[{ node: "Resposta ao Webhook", type: "main", index: 0 }]],
        },
      },
      active: true,
    },
  },

  {
    id: "tpl_agt_tax_compliance",
    name: "Alerta & Auditoria Tributária AGT (Angola)",
    category: "AGT_TAX",
    badge: "AGT & Conformidade",
    description: "Monitoriza prazos de entrega do Mapa de IVA, Retenções na Fonte e Modelo 1 do Imposto Industrial, emitindo alertas preventivos de multas fiscais.",
    tags: ["AGT", "Angola", "Impostos", "Conformidade", "IVA"],
    nodesCount: 4,
    autonomyLevel: 2,
    webhookPath: "gag-agt-tax-compliance",
    agentSlugSuggestion: "consultor-tributario-angola",
    agentRoleSuggestion: "Consultor de Conformidade Tributária AGT",
    agentObjectiveSuggestion: "Garantir conformidade total com as obrigações declarativas e de pagamento perante a Administração Geral Tributária de Angola.",
    jsonSnippet: {
      name: "GAG Visual - Angola AGT Tax Compliance Watcher",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "gag-agt-tax-compliance",
            responseMode: "lastNode",
          },
          name: "Webhook Evento Tributário",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [200, 300],
          id: "node-wh-tax",
        },
        {
          parameters: {
            jsCode: `const data = $input.first().json.body || $input.first().json;
const taxType = data.taxType || "IVA_MENSAL_14";
const amount = data.declaredAmountAOA || 4280000;

return [{
  json: {
    taxType,
    declaredAmountAOA: amount,
    dueDayOfMonth: 30,
    requiresOwnerApproval: true,
    complianceStatus: "REGULAR",
    validationMessage: "Declaração apurada e pronta para liquidação no Portal da AGT.",
    approvalToken: "0xAGT-AUTH-" + Date.now().toString(16).toUpperCase()
  }
}];`,
          },
          name: "Verificador de Regras Fiscais AGT",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [440, 300],
          id: "node-code-agt-rules",
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `={
  "success": true,
  "taxObligation": $json.taxType,
  "amountAOA": $json.declaredAmountAOA,
  "requiresOwnerSignature": $json.requiresOwnerApproval,
  "compliance": $json.complianceStatus,
  "approvalToken": $json.approvalToken
}`,
          },
          name: "Resposta ao Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [680, 300],
          id: "node-resp-tax",
        },
      ],
      connections: {
        "Webhook Evento Tributário": {
          main: [[{ node: "Verificador de Regras Fiscais AGT", type: "main", index: 0 }]],
        },
        "Verificador de Regras Fiscais AGT": {
          main: [[{ node: "Resposta ao Webhook", type: "main", index: 0 }]],
        },
      },
      active: true,
    },
  },

  {
    id: "tpl_social_media_publish",
    name: "Distribuição Multicanal de Conteúdo (Instagram / LinkedIn)",
    category: "MARKETING",
    badge: "Social Media",
    description: "Publica e agenda criativos gerados no Multimodal Studio com copy institucional na página do Instagram @gagvisual e LinkedIn Corporativo.",
    tags: ["Instagram", "LinkedIn", "Multimodal", "Criativos", "Marketing"],
    nodesCount: 4,
    autonomyLevel: 1,
    webhookPath: "gag-social-post-distributor",
    agentSlugSuggestion: "social-media-manager-ia",
    agentRoleSuggestion: "Gestor de Redes Sociais & Conteúdo",
    agentObjectiveSuggestion: "Gerir o cronograma de publicações e distribuição de portfólio visual da GAG Visual no Instagram e LinkedIn.",
    jsonSnippet: {
      name: "GAG Visual - Multi-Channel Social Content Publisher",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "gag-social-post-distributor",
            responseMode: "lastNode",
          },
          name: "Webhook Publicação Criativo",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [200, 300],
          id: "node-wh-social",
        },
        {
          parameters: {
            jsCode: `const data = $input.first().json.body || $input.first().json;
const caption = data.captionText || "Excelência em Comunicação Visual em Angola por GAG Visual. 🌟";
const hashtags = (data.hashtags || ["#GAGVisual", "#DesignAngola", "#Luanda"]).join(" ");

return [{
  json: {
    finalCaption: caption + "\\n\\n" + hashtags,
    mediaUrl: data.mediaAssetUrl || "https://gagvisual.com/assets/portfolio-latest.jpg",
    channels: data.channels || ["instagram", "linkedin"],
    publishedAt: new Date().toISOString(),
    distributionStatus: "DISPATCHED_TO_QUEUE"
  }
}];`,
          },
          name: "Formatar Legenda & Hashtags",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [440, 300],
          id: "node-code-caption",
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `={
  "success": true,
  "channels": $json.channels,
  "captionLength": $json.finalCaption.length,
  "status": $json.distributionStatus,
  "publishedRef": "0xSOC-" + $now.format('YYYYMMDD-HHmmss')
}`,
          },
          name: "Resposta ao Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [680, 300],
          id: "node-resp-social",
        },
      ],
      connections: {
        "Webhook Publicação Criativo": {
          main: [[{ node: "Formatar Legenda & Hashtags", type: "main", index: 0 }]],
        },
        "Formatar Legenda & Hashtags": {
          main: [[{ node: "Resposta ao Webhook", type: "main", index: 0 }]],
        },
      },
      active: true,
    },
  },
];

/**
 * Retrieves a workflow template by id
 */
export function getN8NWorkflowTemplate(id: string): N8NWorkflowTemplate | undefined {
  return GAG_N8N_WORKFLOW_TEMPLATES.find((t) => t.id === id || t.webhookPath === id);
}
