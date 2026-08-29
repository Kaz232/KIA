/**
 * GAG CORE OS — N8N PRECONFIGURED WORKFLOW CATALOG
 * Definitions and metadata for automated business workflows executed on N8N.
 */

export interface N8NWorkflowDefinition {
  id: string;
  name: string;
  category: "CRM" | "FINANCE" | "MARKETING" | "ERP" | "WHATSAPP" | "AGT_TAX" | "NOTIFICATIONS";
  description: string;
  webhookEndpoint: string;
  method: "POST" | "GET" | "PUT";
  requiredParams: string[];
  optionalParams: string[];
  autonomyLevel: 0 | 1 | 2; // 0: Auto, 1: Supervisor, 2: Owner (Josemar Gourgel)
  samplePayload: Record<string, any>;
  targetSystems: string[];
}

export const GAG_N8N_WORKFLOWS: Record<string, N8NWorkflowDefinition> = {
  CRM_LEAD_QUALIFICATION: {
    id: "n8n_crm_lead_intake",
    name: "Qualificação & Ingestão de Leads no CRM",
    category: "CRM",
    description: "Recebe leads qualificados da KIA ou Typeform, valida NIF/Contacto em Angola, cria registo no CRM e notifica a equipa comercial.",
    webhookEndpoint: "gag-lead-intake-v2",
    method: "POST",
    requiredParams: ["clientName", "contactPerson", "serviceRequested"],
    optionalParams: ["budgetAOA", "urgency", "phone", "email", "notes"],
    autonomyLevel: 0,
    samplePayload: {
      clientName: "Empresa Mineira de Catoca Lda",
      contactPerson: "Dr. Manuel Santos",
      serviceRequested: "Rebranding Corporativo & Sinalética Industrial",
      budgetAOA: "25.000.000 Kz",
      urgency: "Alta",
      phone: "+244923000111",
      email: "contato@catoca.co.ao",
      source: "KIA_AGENT_CONVERSATION",
    },
    targetSystems: ["HubSpot/Supabase CRM", "Slack #leads-luanda", "WhatsApp Sales"],
  },

  INVOICE_ERP_SYNC: {
    id: "n8n_invoice_erp_sync",
    name: "Sincronização de Faturas com ERP (Primavera/SAP)",
    category: "ERP",
    description: "Exporta itens faturados, cálculo de IVA (14%) e retenções (6.5%) para o sistema de gestão contabilística e arquivo tributário da AGT.",
    webhookEndpoint: "gag-erp-invoice-sync",
    method: "POST",
    requiredParams: ["invoiceId", "clientNIF", "totalAOA", "items"],
    optionalParams: ["retencaoAOA", "ivaAOA", "dueDate", "paymentMethod"],
    autonomyLevel: 1,
    samplePayload: {
      invoiceId: "FT-GAG-2026-00482",
      clientNIF: "5418920192",
      clientName: "Sonangol Distribuidora",
      totalAOA: 14500000,
      ivaAOA: 2030000,
      retencaoAOA: 942500,
      items: [
        { desc: "Design & Produção de Catálogo Institucional", qty: 1000, unitPriceAOA: 14500 },
      ],
      paymentMethod: "TRANSFERENCIA_BFA",
    },
    targetSystems: ["Primavera ERP", "AGT Portal", "Arquivo Digital GAG"],
  },

  WHATSAPP_BROADCAST_SEQUENCE: {
    id: "n8n_whatsapp_broadcast",
    name: "Disparo Automatizado de Campanha WhatsApp",
    category: "WHATSAPP",
    description: "Dispara sequências transacionais ou promocionais via Meta Cloud API / N8N para clientes segmentados da GAG Visual.",
    webhookEndpoint: "gag-whatsapp-broadcast",
    method: "POST",
    requiredParams: ["recipientPhone", "templateName", "parameters"],
    optionalParams: ["mediaUrl", "scheduledTime", "campaignId"],
    autonomyLevel: 1,
    samplePayload: {
      recipientPhone: "+244923456789",
      templateName: "proposta_aprovada_notificacao",
      parameters: ["Sr. Alberto", "Proposta de Sinalética LED 2026", "24 horas"],
      campaignId: "CAMP-RETALHO-02-2026",
    },
    targetSystems: ["Meta WhatsApp Cloud API", "GAG Logs", "Supabase Messages"],
  },

  FINANCIAL_EXECUTIVE_REPORT: {
    id: "n8n_financial_report",
    name: "Gerador de Relatório Financeiro Executivo",
    category: "FINANCE",
    description: "Gera consolidação em PDF e planilha Excel com análise de DRE, fluxo de caixa, ponto de equilíbrio e margem EBITDA da GAG Visual.",
    webhookEndpoint: "gag-finance-report-builder",
    method: "POST",
    requiredParams: ["periodMonth", "periodYear"],
    optionalParams: ["includeProjections", "recipientEmail", "currency"],
    autonomyLevel: 1,
    samplePayload: {
      periodMonth: "Fevereiro",
      periodYear: 2026,
      includeProjections: true,
      recipientEmail: "josemargourgel01@gmail.com",
      currency: "AOA",
    },
    targetSystems: ["Google Drive", "Email Executivo", "Painel Financeiro"],
  },

  ANGOLA_AGT_TAX_ALERT: {
    id: "n8n_agt_tax_compliance",
    name: "Auditoria & Alerta Tributário AGT (Angola)",
    category: "AGT_TAX",
    description: "Valida prazos do mapa de IVA, Retenção na Fonte e Modelo 1 do II, emitindo alertas preventivos de multas fiscais.",
    webhookEndpoint: "gag-agt-tax-compliance",
    method: "POST",
    requiredParams: ["taxType", "declaredAmountAOA", "referencePeriod"],
    optionalParams: ["bankTransferProofRef", "complianceStatus"],
    autonomyLevel: 2, // Requer aprovação do Owner Josemar Gourgel
    samplePayload: {
      taxType: "IVA_MENSAL_14",
      declaredAmountAOA: 4280000,
      referencePeriod: "2026-02",
      bankTransferProofRef: "COMP-BFA-991204820",
    },
    targetSystems: ["Portal AGT Angola", "Diretoria Financeira", "Telegram Executivo"],
  },

  SOCIAL_MEDIA_AUTO_POST: {
    id: "n8n_social_media_publish",
    name: "Distribuição Multicanal de Conteúdo (Instagram/LinkedIn)",
    category: "MARKETING",
    description: "Publica criativos gerados pelo Multimodal Studio e textos aprovados no Instagram da @gagvisual e LinkedIn Institucional.",
    webhookEndpoint: "gag-social-post-distributor",
    method: "POST",
    requiredParams: ["channels", "captionText", "mediaAssetUrl"],
    optionalParams: ["scheduleTime", "hashtags", "mentions"],
    autonomyLevel: 1,
    samplePayload: {
      channels: ["instagram", "linkedin", "facebook"],
      captionText: "Novo projeto de comunicação visual entregue para o Edifício Sky Center em Luanda. Excelência gráfica por GAG Visual. ✨",
      mediaAssetUrl: "https://gagvisual.com/assets/portfolio-sky-center.jpg",
      hashtags: ["#GAGVisual", "#DesignAngola", "#ComunicacaoVisual", "#Luanda"],
    },
    targetSystems: ["Meta Graph API (Instagram)", "LinkedIn Pages API", "Buffer"],
  },
};

/**
 * Gets a workflow definition by its unique key or id
 */
export function getN8NWorkflow(keyOrId: string): N8NWorkflowDefinition | undefined {
  if (GAG_N8N_WORKFLOWS[keyOrId]) {
    return GAG_N8N_WORKFLOWS[keyOrId];
  }
  return Object.values(GAG_N8N_WORKFLOWS).find(
    (w) => w.id === keyOrId || w.webhookEndpoint === keyOrId
  );
}

/**
 * Returns all active N8N workflow definitions
 */
export function getAllN8NWorkflows(): N8NWorkflowDefinition[] {
  return Object.values(GAG_N8N_WORKFLOWS);
}

/**
 * Returns workflows filtered by operational category
 */
export function getN8NWorkflowsByCategory(
  category: N8NWorkflowDefinition["category"]
): N8NWorkflowDefinition[] {
  return Object.values(GAG_N8N_WORKFLOWS).filter((w) => w.category === category);
}
