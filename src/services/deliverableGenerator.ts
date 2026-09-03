/**
 * GAG CORE OS — STRUCTURED DELIVERABLE GENERATION ENGINE
 * Generates official GAG Visual corporate deliverables:
 * 1. Propostas Comerciais em AOA (com pacotes, sinal de 50%, metodologia TOB e cálculo fiscal)
 * 2. Relatórios Executivos em PDF (métricas de tráfego, ROAS, investimentos em AOA)
 * 3. Minutas de Reunião Estruturadas (decisões do Owner, participantes, prazos e responsáveis)
 * 
 * Supports storage in Supabase Artifact Storage and instant dispatch to WhatsApp!
 */

import { ArtifactStorageManager } from "../persistence/artifactStorage";
import { normalizeMarkdownForWhatsApp } from "../utils/whatsappTextNormalizer";

export type DeliverableType = "COMMERCIAL_PROPOSAL" | "EXECUTIVE_REPORT" | "MEETING_MINUTES";

export interface DeliverablePackageOption {
  title: string;
  description: string;
  priceAOA: number;
  deliveryDays: number;
  deliverables: string[];
}

export interface ProposalPayload {
  clientName: string;
  companyName: string;
  clientPhone?: string;
  projectScope: string;
  options: DeliverablePackageOption[];
  validityDays?: number;
  paymentTerms?: string; // Default: 50% adiantado, 50% na aprovação final
  urgency48h?: boolean;
  preparedBy?: string;
}

export interface ReportPayload {
  reportTitle: string;
  period: string;
  clientOrProject: string;
  clientPhone?: string;
  executiveSummary: string;
  kpis: Array<{ metric: string; value: string; benchmark?: string }>;
  financialSummaryAOA: {
    budgetSpentAOA: number;
    estimatedRevenueAOA: number;
    roas: string;
  };
  keyFindings: string[];
  recommendations: string[];
  preparedBy?: string;
}

export interface MeetingMinutePayload {
  meetingTitle: string;
  date: string;
  locationOrChannel: string;
  participants: string[];
  clientOrProject?: string;
  clientPhone?: string;
  objective: string;
  ownerDirectives: string[];
  decisionsTaken: string[];
  actionItems: Array<{ task: string; assignee: string; deadline: string }>;
  nextCheckpointDate?: string;
  preparedBy?: string;
}

export interface GeneratedDeliverable {
  id: string;
  type: DeliverableType;
  title: string;
  clientName: string;
  clientPhone?: string;
  htmlContent: string;
  markdownContent: string;
  whatsAppSummary: string;
  storagePath?: string;
  downloadUrl?: string;
  createdAt: string;
}

export class DeliverableGenerator {
  private static instance: DeliverableGenerator;
  private storage: ArtifactStorageManager;

  private constructor() {
    this.storage = ArtifactStorageManager.getInstance();
  }

  public static getInstance(): DeliverableGenerator {
    if (!DeliverableGenerator.instance) {
      DeliverableGenerator.instance = new DeliverableGenerator();
    }
    return DeliverableGenerator.instance;
  }

  /**
   * Generates a Commercial Proposal in AOA
   */
  public async generateCommercialProposal(payload: ProposalPayload): Promise<GeneratedDeliverable> {
    const id = `prop_${Date.now()}`;
    const validityDays = payload.validityDays || 15;
    const paymentTerms = payload.paymentTerms || "50% de sinal obrigatório para início imediato e 50% na entrega e homologação final.";
    const preparedBy = payload.preparedBy || "Josemar Gourgel (Owner & Diretor Criativo GAG Visual)";

    // Calculate urgency surcharge if requested
    const processedOptions = payload.options.map((opt) => {
      const price = payload.urgency48h ? Math.round(opt.priceAOA * 1.5) : opt.priceAOA;
      return { ...opt, finalPriceAOA: price };
    });

    // Markdown formatted representation
    const markdown = `# PROPOSTA COMERCIAL & ESTRATÉGICA — GAG VISUAL
**Cliente:** ${payload.clientName} | **Empresa:** ${payload.companyName}
**Data de Emissão:** ${new Date().toLocaleDateString("pt-PT")} | **Validade:** ${validityDays} dias
**Metodologia:** TOB (Tecnologia, Organização & Branding)

---

### 1. Escopo & Diagnóstico
${payload.projectScope}

### 2. Pacotes & Opções de Investimento (em Kwanzas — AOA)
${processedOptions
  .map(
    (opt, i) => `#### Opção ${i + 1}: ${opt.title}
* **Investimento:** **${opt.finalPriceAOA.toLocaleString("pt-AO")} AOA** ${payload.urgency48h ? "*(Taxa de Urgência 48h inclusa)*" : ""}
* **Prazo Estimado:** ${opt.deliveryDays} dias úteis
* **Entregáveis Inclusos:**
${opt.deliverables.map((d) => `  - ${d}`).join("\n")}
`
  )
  .join("\n")}

### 3. Condições Comerciais & Políticas do Owner
* **Condições de Pagamento:** ${paymentTerms}
* **Faturação:** Sujeito a Imposto e Retenção na Fonte conforme regime AGT.
* **Coordenadas Bancárias:** Disponíveis na Fatura Proforma emitida pelo Agente Financeiro.

*Elaborado por: ${preparedBy}*
`;

    // WhatsApp-ready summary
    const waSummary = normalizeMarkdownForWhatsApp(
      `*GAG VISUAL — PROPOSTA COMERCIAL*\n` +
      `Olá ${payload.clientName}! Apresentamos a proposta estratégica para ${payload.companyName} com base na Metodologia TOB:\n\n` +
      processedOptions
        .map(
          (opt, i) =>
            `*Opção ${i + 1} — ${opt.title}:* ${opt.finalPriceAOA.toLocaleString("pt-AO")} AOA\n` +
            `• Prazo: ${opt.deliveryDays} dias úteis\n` +
            `• Entregáveis: ${opt.deliverables.slice(0, 2).join(", ")}`
        )
        .join("\n\n") +
      `\n\n*Condições:* Sinal de 50% para início dos trabalhos.\nFicamos ao dispor para agendar a homologação!`
    );

    // Clean HTML Document for preview and PDF printing
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>Proposta Comercial — ${payload.companyName}</title>
  <style>
    @media print { @page { margin: 1.5cm; } body { font-size: 11pt; } }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1E293B; margin: 0; padding: 40px; background: #fff; line-height: 1.6; }
    .header { border-bottom: 2px solid #003FD3; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo-text { font-size: 24px; font-weight: 900; color: #0A0A0F; letter-spacing: -0.5px; }
    .logo-accent { color: #003FD3; }
    .badge-tob { background: #EEF2FF; color: #003FD3; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-top: 5px; }
    .meta-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .package-card { border: 1px solid #CBD5E1; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
    .package-card.highlight { border-color: #003FD3; background: #FAFCFF; }
    .price-tag { font-size: 22px; font-weight: 800; color: #003FD3; }
    ul { margin: 8px 0; padding-left: 20px; }
    .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 11px; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-text">GAG <span class="logo-accent">VISUAL</span></div>
      <div class="badge-tob">Metodologia TOB (Tecnologia, Organização & Branding)</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748B;">
      <div>Ref: ${id.toUpperCase()}</div>
      <div>Luanda, Angola</div>
      <div>Data: ${new Date().toLocaleDateString("pt-PT")}</div>
    </div>
  </div>

  <div class="meta-box">
    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">Proposta Comercial para: ${payload.clientName}</div>
    <div style="color: #475569; font-size: 14px;"><strong>Organização:</strong> ${payload.companyName} | <strong>Contacto:</strong> ${payload.clientPhone || "Não indicado"}</div>
  </div>

  <h3 style="color: #0A0A0F; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">1. Diagnóstico & Escopo de Atuação</h3>
  <p style="color: #334155;">${payload.projectScope}</p>

  <h3 style="color: #0A0A0F; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px;">2. Opções de Investimento Estratégico (AOA)</h3>
  ${processedOptions
    .map(
      (opt, i) => `
    <div class="package-card ${i === 1 ? "highlight" : ""}">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
        <h4 style="margin: 0; font-size: 18px; color: #0A0A0F;">Opção ${i + 1}: ${opt.title}</h4>
        <div class="price-tag">${opt.finalPriceAOA.toLocaleString("pt-AO")} AOA</div>
      </div>
      <p style="margin: 4px 0 12px 0; color: #475569; font-size: 13px;">${opt.description}</p>
      <div style="font-size: 13px; font-weight: 600; color: #1E293B;">Entregáveis incluídos:</div>
      <ul style="font-size: 13px; color: #334155;">
        ${opt.deliverables.map((d) => `<li>${d}</li>`).join("")}
      </ul>
      <div style="margin-top: 10px; font-size: 12px; color: #64748B;">Prazo de execução: <strong>${opt.deliveryDays} dias úteis</strong></div>
    </div>
  `
    )
    .join("")}

  <h3 style="color: #0A0A0F; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px;">3. Termos Comerciais & Pagamento</h3>
  <p style="font-size: 13px; color: #334155;"><strong>Condição:</strong> ${paymentTerms}</p>
  <p style="font-size: 13px; color: #334155;"><strong>Validade da Proposta:</strong> ${validityDays} dias a contar da data de emissão.</p>

  <div class="footer">
    GAG Visual — Inovação com Raízes, Soluções com Propósito • Luanda, Angola • Preparado por ${preparedBy}
  </div>
</body>
</html>
`;

    // Save in artifact storage
    let storagePath = "";
    try {
      const uploadRes = await this.storage.upload({
        name: `Proposta_${payload.companyName.replace(/[^a-zA-Z0-9]/g, "_")}_${id}.html`,
        type: "html",
        content: htmlContent,
        mimeType: "text/html",
        metadata: {
          deliverableType: "COMMERCIAL_PROPOSAL",
          clientName: payload.clientName,
          company: payload.companyName,
        },
      });
      storagePath = uploadRes.storagePath;
    } catch {
      storagePath = `documents/Proposta_${id}.html`;
    }

    return {
      id,
      type: "COMMERCIAL_PROPOSAL",
      title: `Proposta Comercial — ${payload.companyName}`,
      clientName: payload.clientName,
      clientPhone: payload.clientPhone,
      htmlContent,
      markdownContent: markdown,
      whatsAppSummary: waSummary,
      storagePath,
      downloadUrl: `/api/artifacts/download?path=${encodeURIComponent(storagePath)}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates an Executive PDF Report
   */
  public async generateExecutiveReport(payload: ReportPayload): Promise<GeneratedDeliverable> {
    const id = `rep_${Date.now()}`;
    const preparedBy = payload.preparedBy || "KIA Master Agent & GAG Visual Analytics Engine";

    const markdown = `# RELATÓRIO EXECUTIVO DE PERFORMANCE — GAG VISUAL
**Título:** ${payload.reportTitle} | **Período:** ${payload.period}
**Cliente/Projeto:** ${payload.clientOrProject}
**Emissão:** ${new Date().toLocaleDateString("pt-PT")}

---

### Resumo Executivo
${payload.executiveSummary}

### Indicadores Chave de Desempenho (KPIs)
${payload.kpis.map((k) => `* **${k.metric}:** ${k.value} ${k.benchmark ? `*(Referência: ${k.benchmark})*` : ""}`).join("\n")}

### Desempenho Financeiro (Kwanzas AOA)
* **Investimento Aplicado:** ${payload.financialSummaryAOA.budgetSpentAOA.toLocaleString("pt-AO")} AOA
* **Retorno / Faturação Gerada:** ${payload.financialSummaryAOA.estimatedRevenueAOA.toLocaleString("pt-AO")} AOA
* **ROAS Alcançado:** **${payload.financialSummaryAOA.roas}**

### Principais Diagnósticos
${payload.keyFindings.map((f) => `- ${f}`).join("\n")}

### Próximos Passos & Recomendações
${payload.recommendations.map((r) => `- ${r}`).join("\n")}
`;

    const waSummary = normalizeMarkdownForWhatsApp(
      `*GAG VISUAL — RELATÓRIO EXECUTIVO*\n` +
      `Olá! Disponibilizamos o relatório de performance *${payload.reportTitle}* (${payload.period}):\n\n` +
      `• *ROAS:* ${payload.financialSummaryAOA.roas}\n` +
      `• *Investimento:* ${payload.financialSummaryAOA.budgetSpentAOA.toLocaleString("pt-AO")} AOA\n` +
      `• *Retorno Estimado:* ${payload.financialSummaryAOA.estimatedRevenueAOA.toLocaleString("pt-AO")} AOA\n\n` +
      `*Principais Ações:* ${payload.recommendations.slice(0, 2).join("; ")}\n\n` +
      `O relatório detalhado está arquivado e disponível no painel executivo.`
    );

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>${payload.reportTitle} — GAG Visual</title>
  <style>
    @media print { @page { margin: 1.5cm; } body { font-size: 11pt; } }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1E293B; margin: 0; padding: 40px; background: #fff; line-height: 1.6; }
    .header { border-bottom: 2px solid #003FD3; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0; }
    .kpi-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; text-align: center; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #003FD3; }
    .kpi-label { font-size: 12px; color: #64748B; margin-top: 4px; }
    .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 11px; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="margin: 0; color: #0A0A0F;">${payload.reportTitle}</h2>
      <div style="color: #003FD3; font-weight: 600; font-size: 13px;">GAG VISUAL CORE OS — Analytics & ROAS</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748B;">
      <div>Período: ${payload.period}</div>
      <div>Projeto: ${payload.clientOrProject}</div>
    </div>
  </div>

  <p><strong>Resumo:</strong> ${payload.executiveSummary}</p>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-val">${payload.financialSummaryAOA.roas}</div>
      <div class="kpi-label">Retorno s/ Investimento (ROAS)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val">${payload.financialSummaryAOA.budgetSpentAOA.toLocaleString("pt-AO")} Kz</div>
      <div class="kpi-label">Investimento Alocado (AOA)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val">${payload.financialSummaryAOA.estimatedRevenueAOA.toLocaleString("pt-AO")} Kz</div>
      <div class="kpi-label">Volume Estimado Gerado</div>
    </div>
  </div>

  <h3>Indicadores Detalhados</h3>
  <ul>
    ${payload.kpis.map((k) => `<li><strong>${k.metric}:</strong> ${k.value}</li>`).join("")}
  </ul>

  <h3>Recomendações Estratégicas</h3>
  <ul>
    ${payload.recommendations.map((r) => `<li>${r}</li>`).join("")}
  </ul>

  <div class="footer">
    Relatório emitido automaticamente por ${preparedBy} • GAG Visual Luanda
  </div>
</body>
</html>
`;

    let storagePath = "";
    try {
      const uploadRes = await this.storage.upload({
        name: `Relatorio_${id}.html`,
        type: "html",
        content: htmlContent,
        mimeType: "text/html",
        metadata: { deliverableType: "EXECUTIVE_REPORT", project: payload.clientOrProject },
      });
      storagePath = uploadRes.storagePath;
    } catch {
      storagePath = `documents/Relatorio_${id}.html`;
    }

    return {
      id,
      type: "EXECUTIVE_REPORT",
      title: payload.reportTitle,
      clientName: payload.clientOrProject,
      clientPhone: payload.clientPhone,
      htmlContent,
      markdownContent: markdown,
      whatsAppSummary: waSummary,
      storagePath,
      downloadUrl: `/api/artifacts/download?path=${encodeURIComponent(storagePath)}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates Structured Meeting Minutes
   */
  public async generateMeetingMinutes(payload: MeetingMinutePayload): Promise<GeneratedDeliverable> {
    const id = `min_${Date.now()}`;
    const preparedBy = payload.preparedBy || "KIA Executive Secretary & Memory Engine";

    const markdown = `# MINUTA DE REUNIÃO EXECUTIVA — GAG VISUAL
**Título:** ${payload.meetingTitle} | **Data:** ${payload.date}
**Canal/Local:** ${payload.locationOrChannel}
**Participantes:** ${payload.participants.join(", ")}

---

### 1. Objetivo da Reunião
${payload.objective}

### 2. Diretrizes & Decisões do Owner
${payload.ownerDirectives.map((d) => `• **Decisão:** ${d}`).join("\n")}

### 3. Matriz de Ações & Responsabilidades (Tarefas)
| Ação / Tarefa | Responsável | Prazo |
|---|---|---|
${payload.actionItems.map((a) => `| ${a.task} | ${a.assignee} | ${a.deadline} |`).join("\n")}

${payload.nextCheckpointDate ? `\n**Próximo Ponto de Situação:** ${payload.nextCheckpointDate}` : ""}

*Registado por: ${preparedBy}*
`;

    const waSummary = normalizeMarkdownForWhatsApp(
      `*GAG VISUAL — MINUTA DE REUNIÃO*\n` +
      `*Reunião:* ${payload.meetingTitle} (${payload.date})\n` +
      `*Participantes:* ${payload.participants.join(", ")}\n\n` +
      `*Decisões Tomadas:*\n` +
      payload.decisionsTaken.map((d) => `• ${d}`).join("\n") +
      `\n\n*Ações Estabelecidas:*\n` +
      payload.actionItems.map((a) => `• *${a.task}* — Resp: ${a.assignee} (Prazo: ${a.deadline})`).join("\n") +
      (payload.nextCheckpointDate ? `\n\n*Próximo Alinhamento:* ${payload.nextCheckpointDate}` : "")
    );

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>${payload.meetingTitle} — Minuta</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1E293B; padding: 36px; background: #fff; line-height: 1.6; }
    .header { border-bottom: 2px solid #003FD3; padding-bottom: 14px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    th, td { border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
    th { background: #F1F5F9; font-weight: 700; color: #0A0A0F; }
    .footer { margin-top: 36px; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0 0 6px 0;">Minuta: ${payload.meetingTitle}</h2>
    <div style="font-size: 12px; color: #64748B;">Data: ${payload.date} | Canal: ${payload.locationOrChannel}</div>
  </div>

  <p><strong>Participantes:</strong> ${payload.participants.join(", ")}</p>
  <p><strong>Objetivo:</strong> ${payload.objective}</p>

  <h3>Decisões Registadas do Owner</h3>
  <ul>
    ${payload.ownerDirectives.map((d) => `<li><strong>${d}</strong></li>`).join("")}
  </ul>

  <h3>Matriz de Tarefas & Entregáveis</h3>
  <table>
    <thead><tr><th>Tarefa / Ação</th><th>Responsável</th><th>Prazo</th></tr></thead>
    <tbody>
      ${payload.actionItems.map((a) => `<tr><td>${a.task}</td><td>${a.assignee}</td><td>${a.deadline}</td></tr>`).join("")}
    </tbody>
  </table>

  <div class="footer">GAG Visual GAG Core OS • Minuta registada na Memória Permanente de Longo Prazo</div>
</body>
</html>
`;

    let storagePath = "";
    try {
      const uploadRes = await this.storage.upload({
        name: `Minuta_${id}.html`,
        type: "html",
        content: htmlContent,
        mimeType: "text/html",
        metadata: { deliverableType: "MEETING_MINUTES" },
      });
      storagePath = uploadRes.storagePath;
    } catch {
      storagePath = `documents/Minuta_${id}.html`;
    }

    return {
      id,
      type: "MEETING_MINUTES",
      title: payload.meetingTitle,
      clientName: payload.clientOrProject || "Interno GAG",
      clientPhone: payload.clientPhone,
      htmlContent,
      markdownContent: markdown,
      whatsAppSummary: waSummary,
      storagePath,
      downloadUrl: `/api/artifacts/download?path=${encodeURIComponent(storagePath)}`,
      createdAt: new Date().toISOString(),
    };
  }
}
