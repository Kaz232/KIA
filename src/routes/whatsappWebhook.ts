import express from 'express';
import { normalizeMarkdownForWhatsApp, normalizeInboundWhatsAppPayload } from '../utils/whatsappTextNormalizer';
import { DeliverableGenerator, ProposalPayload, ReportPayload, MeetingMinutePayload } from '../services/deliverableGenerator';
import { MemoryManager } from '../core/memory/memoryManager';

const router = express.Router();

// 1. Definição do URL do Webhook que criaste na Make
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/wiv820ed8sbdrmf22s6d226jvgv49mme';

/**
 * Rota para receber mensagens do WhatsApp e integrar com a KIA / Make.
 * Inclui:
 * - Normalizador de WhatsApp (converte tabelas e Markdown para formato limpo de telemóvel)
 * - Gerador de Documentos Corporativos em Kwanzas (AOA) com regra de sinal de 50%
 * - Sincronização com Memória de Longo Prazo da KIA
 * - Despacho automático para o webhook da Make.com
 */
router.post('/api/whatsapp/message', async (req, res) => {
  try {
    let { phone, message, senderName, generateDeliverable, deliverableType, deliverablePayload } = req.body;

    // Normalizador de Payload: aceita payloads diretos ou estruturas do WhatsApp / Z-API
    if (!message && req.body) {
      const normalizedInbound = normalizeInboundWhatsAppPayload(req.body);
      if (normalizedInbound.messageText) {
        message = normalizedInbound.messageText;
        phone = phone || normalizedInbound.senderNumber;
        senderName = senderName || normalizedInbound.senderName;
      }
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Mensagem vazia' });
    }

    const cleanPhone = phone ? String(phone).replace(/[^0-9+]/g, '') : '+244 9XX XXX XXX';
    const clientName = senderName ? String(senderName).trim() : 'Cliente WhatsApp';

    // 1. Normalizador de WhatsApp (Limpa Markdown, formata títulos e tabelas para ecrãs móveis)
    const normalizedInputMessage = normalizeMarkdownForWhatsApp(message);

    // 2. Memória KIA: Consulta regras do Owner e contexto prévio
    const unifiedSessionId = `session_wa_${cleanPhone.replace(/[^0-9]/g, '') || 'lead'}`;
    const memory = MemoryManager.getInstance();
    const memoryContext = memory.getRelevantContextForPrompt(normalizedInputMessage);

    // 3. Gerador de Documentos Corporativos (se explicitamente solicitado ou se intenção detetada)
    let generatedDoc: any = null;
    const lower = normalizedInputMessage.toLowerCase();
    const shouldGenerateDoc = Boolean(
      generateDeliverable ||
      deliverableType ||
      lower.includes('gerar proposta') ||
      lower.includes('proposta comercial') ||
      lower.includes('orçamento') ||
      lower.includes('fatura proforma') ||
      lower.includes('relatório executivo') ||
      lower.includes('minuta de reunião')
    );

    if (shouldGenerateDoc) {
      try {
        const generator = DeliverableGenerator.getInstance();

        if (deliverableType === 'EXECUTIVE_REPORT' || lower.includes('relatório')) {
          const reportData: ReportPayload = deliverablePayload || {
            reportTitle: 'Relatório Executivo de Performance Digital',
            period: 'Trimestre Vigente',
            clientOrProject: clientName,
            clientPhone: cleanPhone,
            executiveSummary: `Relatório gerado a partir de solicitação WhatsApp: "${normalizedInputMessage.slice(0, 100)}"`,
            kpis: [
              { metric: 'Retorno s/ Investimento (ROAS)', value: '3.8x', benchmark: '3.0x' },
              { metric: 'Leads Qualificados em Luanda', value: '320 leads', benchmark: '+28%' }
            ],
            financialSummaryAOA: {
              budgetSpentAOA: 1500000,
              estimatedRevenueAOA: 5700000,
              roas: '3.8x'
            },
            keyFindings: ['Campanhas de tráfego direto para WhatsApp obtiveram maior taxa de conversão em Angola.'],
            recommendations: ['Manter taxa de sinal de 50% e priorizar atendimento 24/7.']
          };
          generatedDoc = await generator.generateExecutiveReport(reportData);
        } else if (deliverableType === 'MEETING_MINUTES' || lower.includes('minuta')) {
          const minuteData: MeetingMinutePayload = deliverablePayload || {
            meetingTitle: 'Alinhamento Estratégico GAG Visual',
            date: new Date().toLocaleDateString('pt-PT'),
            locationOrChannel: 'WhatsApp Voice / Luanda',
            participants: ['Josemar Gourgel (Owner)', clientName],
            clientOrProject: clientName,
            clientPhone: cleanPhone,
            objective: `Alinhamento comercial com base na mensagem: "${normalizedInputMessage.slice(0, 80)}"`,
            ownerDirectives: [
              'Sinal obrigatório de 50% em Kwanzas (AOA) antes de iniciar qualquer trabalho.',
              'Taxa de urgência de 48h acresce +50% no valor global.'
            ],
            decisionsTaken: [
              'Metodologia TOB aprovada.',
              'Fase de diagnóstico e branding programada.'
            ],
            actionItems: [
              { task: 'Envio de Proposta e Fatura Proforma', assignee: 'Agente Financeiro', deadline: 'Hoje' }
            ]
          };
          generatedDoc = await generator.generateMeetingMinutes(minuteData);
        } else {
          // Default: Proposta Comercial em AOA com sinal de 50%
          const proposalData: ProposalPayload = deliverablePayload || {
            clientName,
            companyName: `Empresa / Marca de ${clientName}`,
            clientPhone: cleanPhone,
            projectScope: `Implementação e Gestão de Soluções Estratégicas GAG Visual: "${normalizedInputMessage}"`,
            urgency48h: lower.includes('urgente') || lower.includes('48h'),
            options: [
              {
                title: 'Pacote Estratégico Core',
                description: 'Identidade e posicionamento institucional',
                priceAOA: 1250000,
                deliveryDays: 10,
                deliverables: ['Identidade Visual', 'Manual de Aplicação', 'Assets Digitais']
              },
              {
                title: 'Pacote Performance 360° (Recomendado)',
                description: 'Identidade, Produção Audiovisual e Tráfego Pago',
                priceAOA: 2450000,
                deliveryDays: 15,
                deliverables: ['Brandbook Completo', '3 Vídeos Institucionais', 'Gestão de Anúncios Meta/Google']
              }
            ]
          };
          generatedDoc = await generator.generateCommercialProposal(proposalData);
        }
      } catch (docErr: any) {
        console.warn('[DocGenerator] Aviso ao gerar documento:', docErr?.message);
      }
    }

    // 4. Gravação na Memória de Sessão da KIA
    memory.recordTurn(unifiedSessionId, 'user', normalizedInputMessage);
    if (generatedDoc?.whatsAppSummary) {
      memory.recordTurn(unifiedSessionId, 'assistant', generatedDoc.whatsAppSummary);
    }

    // 5. Normalização do conteúdo para Make.com
    const makePayload = {
      phone: cleanPhone,
      message: normalizedInputMessage,
      senderName: clientName,
      timestamp: new Date().toISOString(),
      sessionId: unifiedSessionId,
      source: 'Z-API / GAG Core OS',
      ownerDirectivesApplied: {
        currency: 'AOA',
        depositRule: '50% sinal obrigatório',
        urgencyRule: '48h com taxa de +50%'
      },
      hasMemoryContext: Boolean(memoryContext),
      deliverable: generatedDoc
        ? {
            id: generatedDoc.id,
            type: generatedDoc.type,
            title: generatedDoc.title,
            whatsAppSummary: generatedDoc.whatsAppSummary,
            htmlContentLength: generatedDoc.htmlContent?.length || 0,
            storagePath: generatedDoc.storagePath || null
          }
        : null
    };

    // 6. Dispara os dados para o Webhook da Make (sem travar a resposta)
    let makeDispatchSuccess = false;
    let makeErrorDetails: string | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makePayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!makeResponse.ok) {
        throw new Error(`Erro no Webhook da Make: ${makeResponse.status} ${makeResponse.statusText}`);
      }
      makeDispatchSuccess = true;
    } catch (err: any) {
      makeErrorDetails = err.message;
      console.warn('[Make.com Webhook] Processado nativamente na GAG (Aviso Make):', err.message);
      // Se Make estiver inacessível ou offline temporariamente, não quebra a resposta para o cliente Z-API
    }

    // 7. Resposta formatada para Z-API, Make ou Front-end
    return res.status(200).json({
      status: 'success',
      message: 'Mensagem processada pelo Normalizador e enviada com sucesso para o fluxo da KIA na Make!',
      makeDispatched: makeDispatchSuccess,
      makeWebhookUrl: MAKE_WEBHOOK_URL,
      makeError: makeErrorDetails,
      data: {
        phone: cleanPhone,
        senderName: clientName,
        normalizedMessage: normalizedInputMessage,
        sessionId: unifiedSessionId,
        generatedDeliverable: generatedDoc
          ? {
              id: generatedDoc.id,
              type: generatedDoc.type,
              title: generatedDoc.title,
              whatsAppSummary: generatedDoc.whatsAppSummary
            }
          : null
      }
    });

  } catch (error: any) {
    console.error('Falha na integração WhatsApp <-> KIA:', error.message);
    return res.status(500).json({ status: 'error', details: error.message });
  }
});

// Endpoint GET para verificação e teste rápido de conectividade com a Make
router.get('/api/whatsapp/message', (_req, res) => {
  res.json({
    status: 'online',
    endpoint: '/api/whatsapp/message',
    makeWebhookUrl: MAKE_WEBHOOK_URL,
    features: [
      'Normalizador de Texto WhatsApp (limpeza Markdown e conversão de tabelas)',
      'Gerador Automático de Entregáveis em Kwanzas (AOA)',
      'Regra de Negócio: 50% de sinal obrigatório e urgência 48h (+50%)',
      'Despacho Direto para Make.com Webhook'
    ]
  });
});

export default router;
