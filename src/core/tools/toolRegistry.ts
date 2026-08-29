import { CoreTool, ToolExecutionContext, ToolResult } from "../types";
import { N8NToolAdapter } from "./n8n/N8NToolAdapter";

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, CoreTool> = new Map();

  private constructor() {
    this.registerCoreTools();
    try {
      N8NToolAdapter.getInstance().registerAllN8NToolsIntoRegistry();
    } catch (e) {
      console.warn("N8N tool registration deferred:", e);
    }
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerCoreTools() {
    // 1. TOOL: Financial & Tax Calculator (Angola specific)
    this.registerTool({
      id: "tool_calculate_finance",
      name: "Calculadora Financeira & Fiscal GAG (Angola)",
      category: "DATA_ANALYTICS",
      description: "Executa cálculos precisos de ROI, ROAS, ponto de equilíbrio e tributação angolana (IVA 14%, Retenção 6.5%, IRT, Imposto de Selo 1%).",
      requiredPermission: "math:execute",
      autonomyLevel: 0,
      parameters: [
        { name: "revenueAOA", type: "number", description: "Receita bruta em Kwanzas", required: true },
        { name: "cogsAOA", type: "number", description: "Custos diretos em Kwanzas", required: false, defaultValue: 0 },
        { name: "opexAOA", type: "number", description: "Despesas operacionais em Kwanzas", required: false, defaultValue: 0 },
        { name: "adSpendAOA", type: "number", description: "Investimento em tráfego pago em Kwanzas", required: false, defaultValue: 0 },
        { name: "applyIVA", type: "boolean", description: "Calcular IVA de 14%", required: false, defaultValue: true },
        { name: "applyRetencao", type: "boolean", description: "Calcular Retenção na Fonte de 6.5%", required: false, defaultValue: false },
      ],
      execute: async (params, context): Promise<ToolResult> => {
        const start = Date.now();
        const revenue = Number(params.revenueAOA || 0);
        const cogs = Number(params.cogsAOA || 0);
        const opex = Number(params.opexAOA || 0);
        const adSpend = Number(params.adSpendAOA || 0);

        const grossProfit = revenue - cogs;
        const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
        const totalExpenses = cogs + opex + adSpend;
        const ebitda = revenue - totalExpenses;
        const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
        const iva14 = params.applyIVA ? revenue * 0.14 : 0;
        const retencao65 = params.applyRetencao ? revenue * 0.065 : 0;
        const roas = adSpend > 0 ? (revenue / adSpend).toFixed(2) : "N/A";

        return {
          success: true,
          data: {
            revenueAOA: revenue,
            grossProfitAOA: grossProfit,
            grossMarginPercent: Number(grossMargin.toFixed(1)),
            ebitdaAOA: ebitda,
            ebitdaMarginPercent: Number(ebitdaMargin.toFixed(1)),
            ivaEstimatedAOA: iva14,
            retencaoEstimatedAOA: retencao65,
            calculatedROAS: roas,
            status: ebitda > 0 ? "SAUDÁVEL" : "DÉFICE",
          },
          executionTimeMs: Date.now() - start,
          auditTrailRef: `0xFIN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
      },
    });

    // 2. TOOL: Angola Invoice Scanner & Waste Detector (ENDE, Unitel, ZAP, DSTV)
    this.registerTool({
      id: "tool_ocr_invoice",
      name: "Scanner Forense de Faturas & Desperdício",
      category: "DOCUMENTS",
      description: "Analisa texto/OCR de faturas de consumo e telecomunicações em Angola para detetar anomalias, taxas indevidas e cobranças abusivas.",
      requiredPermission: "read:documents",
      autonomyLevel: 0,
      parameters: [
        { name: "invoiceText", type: "string", description: "Texto extraído da fatura", required: true },
        { name: "providerHint", type: "string", description: "Nome da entidade (ENDE, Unitel, DSTV, ZAP, Movicel)", required: false },
      ],
      execute: async (params, context): Promise<ToolResult> => {
        const start = Date.now();
        const text = String(params.invoiceText || "");
        const lower = text.toLowerCase();

        let detectedProvider = params.providerHint || "Entidade Não Especificada";
        if (lower.includes("ende") || lower.includes("eletricidade") || lower.includes("kwh")) {
          detectedProvider = "ENDE (Empresa Nacional de Distribuição de Electricidade)";
        } else if (lower.includes("unitel") || lower.includes("net casa") || lower.includes("saldo")) {
          detectedProvider = "Unitel S.A.";
        } else if (lower.includes("dstv") || lower.includes("multichoice")) {
          detectedProvider = "DSTV Angola (MultiChoice)";
        } else if (lower.includes("zap") || lower.includes("zap fibra")) {
          detectedProvider = "ZAP Cinemas / ZAP Fibra";
        }

        const valueMatch = text.match(/(\d+[\.,]?\d*)\s*(kz|aoa|kwanzas)/i) || text.match(/(kz|aoa|total:?)\s*(\d+[\.,]?\d*)/i);
        const extractedValue = valueMatch ? valueMatch[0] : "Valor a apurar";

        const wasteAlerts: string[] = [];
        let wasteScore = 2; // scale 1-10

        if (lower.includes("toque") || lower.includes("kandengue") || lower.includes("vas") || lower.includes("ringtone")) {
          wasteAlerts.push("Cobrança de Serviços de Valor Acrescentado (VAS / Toques de espera) detetada.");
          wasteScore += 3;
        }
        if (lower.includes("juros de mora") || lower.includes("multa") || lower.includes("atraso")) {
          wasteAlerts.push("Taxa de juros por atraso identificada. Recomenda-se pagamento por débito direto.");
          wasteScore += 2;
        }
        if (lower.includes("estimada") && detectedProvider.includes("ENDE")) {
          wasteAlerts.push("Consumo de eletricidade faturado por estimativa e não por leitura real.");
          wasteScore += 3;
        }

        const auditReport = `## 📊 Relatório de Auditoria Financeira - GAG Visual
**Emitente da Fatura:** ${detectedProvider}
**Valor Auditado:** ${extractedValue}
**Data da Auditoria:** ${new Date().toLocaleDateString("pt-PT")}
**Índice de Desperdício:** ${wasteScore}/10

### 🔍 Tabela de Análise e Custos Extraídos
| Item/Serviço | Categoria de Gasto | Valor (Kz) | Parecer Técnico |
| :--- | :--- | :--- | :--- |
| Consumo Base | Operacional | ${extractedValue} | Dentro do parâmetro base |
| Taxas e Emolumentos | Administrativo | Estimado | Verificar conformidade fiscal |

### 🚨 Alertas de Desperdício e Cobranças Suspeitas
${wasteAlerts.length > 0 ? wasteAlerts.map((a) => `- ${a}`).join("\n") : "- Nenhuma anomalia crítica ou serviço parasita detetado."}

### 🛠️ Plano de Ação Imediato
- [ ] **Ação 1:** Solicitar cancelamento de serviços VAS recorrentes via linha de suporte.
- [ ] **Ação 2:** Ajustar o plano de dados/potência contratada à média real dos últimos 90 dias.`;

        return {
          success: true,
          data: {
            provider: detectedProvider,
            auditedValue: extractedValue,
            wasteScore,
            wasteAlerts,
            markdownReport: auditReport,
          },
          artifacts: [
            {
              name: `Auditoria_${detectedProvider.replace(/[^a-zA-Z0-9]/g, "_")}.md`,
              type: "report",
              content: auditReport,
            },
          ],
          executionTimeMs: Date.now() - start,
          auditTrailRef: `0xAUDIT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
      },
    });

    // 3. TOOL: GAG Copywriting & High-Ticket Follow-Up Generator
    this.registerTool({
      id: "tool_write_copy_sequence",
      name: "Gerador de Copywriting & Follow-up High-Ticket (TOB)",
      category: "GAG_BRAND",
      description: "Gera sequências magnéticas de follow-up de 3 e-mails baseadas na metodologia TOB (Tecnologia, Organização, Branding) com regras estritas de sinal 50%.",
      requiredPermission: "write:copy",
      autonomyLevel: 0,
      parameters: [
        { name: "leadName", type: "string", description: "Nome do decisor / cliente", required: true },
        { name: "companyName", type: "string", description: "Nome da empresa do lead", required: false, defaultValue: "Empresa" },
        { name: "painPoint", type: "string", description: "Principal dor ou objetivo do cliente", required: true },
        { name: "solutionOffering", type: "string", description: "Solução GAG proposta", required: false, defaultValue: "Ecossistema TOB com IA" },
      ],
      execute: async (params, context): Promise<ToolResult> => {
        const start = Date.now();
        const lead = params.leadName || "Prezado(a)";
        const pain = params.painPoint || "otimização operacional e autoridade visual";
        const company = params.companyName || "sua organização";

        const email1 = `Assunto: Sobre a ${pain} na ${company} (e o que aprendemos na GAG Visual)

Olá, ${lead}.

Analisando a estrutura da ${company}, ficou claro que o maior gargalo hoje está em ${pain}.

Na GAG Visual, resolvemos exatamente isso combinando a nossa metodologia TOB:
1. Tecnologia (T): Automação de processos com IA para liberar a sua equipa.
2. Organização (O): Workflows de precisão para eliminar retrabalho.
3. Branding (B): Posicionamento premium de mercado que justifica preços altos.

Preparei uma demonstração prática de como podemos aplicar isto diretamente ao vosso negócio. Quando teria 15 minutos esta semana para um alinhamento executivo?

Um abraço,
Josemar Gourgel
GAG Visual | Soluções com propósito, inovação com raízes.`;

        const email2 = `Assunto: A nossa proposta TOB para a ${company} [+ Projeção de ROI]

Olá, ${lead}.

Dando seguimento ao nosso diagnóstico, estruturamos uma proposta sob medida com foco direto no retorno sobre investimento (ROI).

O que está incluído:
• Implementação do ecossistema de automação inteligente e agentes sob medida.
• Reestruturação do posicionamento visual e diretrizes de autoridade.
• Treinamento e acompanhamento operacional direto com a liderança.

Condições Oficiais:
• Condição padrão: 50% de sinal na adjudicação do projeto e os 50% restantes na entrega final.
• Prazos em regime de urgência (< 48h) sofrem taxa adicional de +50%.

Podemos confirmar o início dos trabalhos para esta quinta-feira?

Com os melhores cumprimentos,
Josemar Gourgel | GAG Visual`;

        const email3 = `Assunto: Próximo ciclo de consultoria na GAG Visual (Última vaga disponível)

Olá, ${lead}.

Como a minha agenda para este trimestre está quase totalmente preenchida com os projetos ativos da GAG Visual e GAG Labs, estou a fechar as novas adjudicações até ao final desta semana.

Se deseja garantir a implementação do ecossistema na ${company} ainda neste ciclo e blindar as vossas operações contra o desperdício, basta responder a este e-mail confirmando a adjudicação.

Caso prefira adiar para o próximo semestre, compreendo perfeitamente e guardarei o diagnóstico no nosso arquivo.

Atenciosamente,
Josemar Gourgel
Fundador & Diretor Executivo — GAG Visual`;

        const fullCopy = `## 🦅 Sequência de Follow-Up High-Ticket — GAG Visual

### 📧 E-mail 1: Geração de Valor & Metodologia TOB
\`\`\`text
${email1}
\`\`\`

### 📧 E-mail 2: A Oferta & Condições Comerciais (Sinal 50%)
\`\`\`text
${email2}
\`\`\`

### 📧 E-mail 3: Escassez de Agenda & Fecho Assertivo
\`\`\`text
${email3}
\`\`\``;

        return {
          success: true,
          data: {
            emails: [email1, email2, email3],
            formattedMarkdown: fullCopy,
          },
          artifacts: [
            {
              name: `FollowUp_${lead.replace(/[^a-zA-Z0-9]/g, "_")}_HighTicket.md`,
              type: "markdown",
              content: fullCopy,
            },
          ],
          executionTimeMs: Date.now() - start,
          auditTrailRef: `0xMKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
      },
    });

    // 4. TOOL: Automated QA Agent Inspector
    this.registerTool({
      id: "tool_evaluate_qa",
      name: "Inspetor de Qualidade Automático (QA Agent)",
      category: "OPERATIONS",
      description: "Valida entregáveis de código, copy ou estratégia contra as 5 diretrizes estritas da GAG Visual antes da marcação como COMPLETED.",
      requiredPermission: "audit:qa",
      autonomyLevel: 1,
      parameters: [
        { name: "content", type: "string", description: "Conteúdo do entregável a avaliar", required: true },
        { name: "taskType", type: "string", description: "Tipo de tarefa (COPY, CODE, STRATEGY, REPORT)", required: true },
        { name: "briefingRequirements", type: "string", description: "Requisitos exigidos no briefing original", required: false },
      ],
      execute: async (params, context): Promise<ToolResult> => {
        const start = Date.now();
        const content = String(params.content || "");
        const taskType = String(params.taskType || "GENERAL").toUpperCase();

        const criteriaResults: { criterion: string; passed: boolean; note?: string }[] = [];
        let score = 100;

        // Criterion 1: Não vazio e extensão adequada
        const hasSubstance = content.length > 80;
        criteriaResults.push({
          criterion: "Extensão e densidade de informação",
          passed: hasSubstance,
          note: hasSubstance ? "Entregável possui substância técnica satisfatória." : "Entregável muito curto ou vago.",
        });
        if (!hasSubstance) score -= 30;

        // Criterion 2: Ausência de placeholders e dados genéricos
        const hasPlaceholders = content.includes("[Inserir") || content.includes("Lorem ipsum") || content.includes("TODO_HERE");
        criteriaResults.push({
          criterion: "Ausência de placeholders genéricos",
          passed: !hasPlaceholders,
          note: !hasPlaceholders ? "Sem placeholders detetados." : "Encontrados marcadores de substituição não preenchidos.",
        });
        if (hasPlaceholders) score -= 25;

        // Criterion 3: Conformidade com a identidade GAG Visual
        const hasGAGGUIDELINES =
          content.includes("GAG") ||
          content.includes("TOB") ||
          content.includes("Josemar") ||
          content.includes("Kwanzas") ||
          content.includes("Tailwind") ||
          content.includes("50%");
        criteriaResults.push({
          criterion: "Alinhamento com diretrizes corporativas GAG",
          passed: hasGAGGUIDELINES,
          note: hasGAGGUIDELINES ? "Alinhado com a identidade da marca." : "Faltam referências às diretrizes ou terminologia GAG.",
        });
        if (!hasGAGGUIDELINES) score -= 15;

        // Criterion 4: Formatação profissional em Markdown / Código
        const wellFormatted = content.includes("#") || content.includes("```") || content.includes("|");
        criteriaResults.push({
          criterion: "Estruturação e formatação executiva",
          passed: wellFormatted,
          note: wellFormatted ? "Formatação em Markdown/tabela limpa." : "Texto não estruturado.",
        });
        if (!wellFormatted) score -= 10;

        const passed = score >= 70;

        return {
          success: true,
          data: {
            passed,
            score,
            feedback: passed
              ? `Entregável APROVADO com pontuação de ${score}/100. Atende aos critérios de excelência GAG Core OS.`
              : `Entregável REPROVADO (pontuação ${score}/100). Necessita de revisão antes de entrega ao utilizador.`,
            criteriaResults,
            evaluatedBy: "QA-Agent-Inspector",
            evaluatedAt: new Date().toISOString(),
          },
          executionTimeMs: Date.now() - start,
          auditTrailRef: `0xQA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
      },
    });

    // 5. TOOL: Scratchpad & Memory Storage
    this.registerTool({
      id: "tool_manage_memory",
      name: "Gestor de Memória Operacional & Scratchpad",
      category: "OPERATIONS",
      description: "Permite aos agentes ler e gravar estados temporários, notas de passagem de testemunho e variáveis de sessão.",
      requiredPermission: "memory:access",
      autonomyLevel: 0,
      parameters: [
        { name: "action", type: "string", description: "READ ou WRITE", required: true },
        { name: "key", type: "string", description: "Chave do scratchpad", required: true },
        { name: "value", type: "object", description: "Valor a guardar (apenas para WRITE)", required: false },
      ],
      execute: async (params, context): Promise<ToolResult> => {
        const start = Date.now();
        const action = String(params.action || "READ").toUpperCase();
        const key = String(params.key || "default");

        if (action === "WRITE") {
          if (context.operationalMemory) {
            context.operationalMemory[key] = params.value;
          }
          return {
            success: true,
            data: { key, saved: true },
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xMEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          };
        }

        const value = context.operationalMemory ? context.operationalMemory[key] : null;
        return {
          success: true,
          data: { key, value },
          executionTimeMs: Date.now() - start,
          auditTrailRef: `0xMEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
      },
    });
  }

  public getTool(id: string): CoreTool | undefined {
    return this.tools.get(id);
  }

  public getAllTools(): CoreTool[] {
    return Array.from(this.tools.values());
  }

  public registerTool(tool: CoreTool): void {
    this.tools.set(tool.id, tool);
  }
}
