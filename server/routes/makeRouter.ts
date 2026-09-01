/**
 * GAG CORE OS — MAKE.COM (INTEGROMAT) ZERO-API-KEY AUTOMATION HUB
 * 
 * Central router for Webhook-based integration with Make.com.
 * Allows full two-way communication with WhatsApp, CRMs, ERPs, Social Media,
 * and External Tools without storing or managing third-party API keys in the app.
 */

import { Router } from "express";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

export const makeRouter = Router();

// In-memory logs for recent Make.com dispatches and inbound events
export interface MakeWebhookLog {
  id: string;
  scenarioId: string;
  scenarioName: string;
  direction: "OUTBOUND" | "INBOUND";
  status: "SUCCESS" | "FAILED" | "PROCESSED";
  httpStatus?: number;
  payload: any;
  response?: any;
  latencyMs: number;
  timestamp: string;
  error?: string;
}

const makeLogs: MakeWebhookLog[] = [];

// Persistent Make.com scenarios registry
export interface MakeScenarioDefinition {
  id: string;
  name: string;
  category: "WHATSAPP" | "CRM" | "FINANCE" | "MARKETING" | "CUSTOM";
  description: string;
  defaultWebhookUrl?: string;
  isActive: boolean;
  triggerType: "OUTBOUND_DISPATCH" | "INBOUND_WEBHOOK" | "BI_DIRECTIONAL";
  blueprintDoc: string;
  samplePayload: Record<string, any>;
}

const MAKE_SCENARIO_BLUEPRINTS: MakeScenarioDefinition[] = [
  {
    id: "make-whatsapp-24-7",
    name: "WhatsApp 24/7 Agent Hub (Zero-Key)",
    category: "WHATSAPP",
    description: "Recepção e envio de mensagens WhatsApp via Make.com conectado a Z-API, Evolution, ou Meta Cloud sem expor chaves no app.",
    defaultWebhookUrl: process.env.MAKE_WHATSAPP_WEBHOOK_URL || "",
    isActive: true,
    triggerType: "BI_DIRECTIONAL",
    blueprintDoc: "Make.com -> Webhook Inbound -> Router GAG -> Resposta KIA -> Módulo WhatsApp Send",
    samplePayload: {
      event: "whatsapp_message_received",
      senderNumber: "+244923884190",
      senderName: "Cliente Luanda",
      message: "Olá! Gostaria de saber os preços de gestão de redes sociais.",
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: "make-lead-crm-sync",
    name: "Sincronizador de Leads (Notion / HubSpot / Google Sheets)",
    category: "CRM",
    description: "Captura de leads em tempo real gerados pela KIA e envio automático para CRM externo configurado visualmente no Make.",
    defaultWebhookUrl: process.env.MAKE_CRM_WEBHOOK_URL || "",
    isActive: true,
    triggerType: "OUTBOUND_DISPATCH",
    blueprintDoc: "GAG Webhook -> Make.com Webhook Trigger -> Google Sheets / Notion / HubSpot Create Record",
    samplePayload: {
      leadName: "Empresa de Logística Sonangol",
      contactEmail: "contacto@sonangol-log.co.ao",
      phone: "+244923112233",
      budgetEstimatedAOA: 2500000,
      urgency: "HIGH",
      serviceRequested: "Identidade Visual & Tráfego Pago",
      capturedByAgent: "agent-sales-whatsapp",
    },
  },
  {
    id: "make-invoice-finance-sync",
    name: "Emissão de Faturas & AGT Angola (Fiscal Hub)",
    category: "FINANCE",
    description: "Disparo de faturas pró-forma, recibos e documentos fiscais via Make.com para ERPs (Primavera, PHC ou SAP).",
    defaultWebhookUrl: process.env.MAKE_FINANCE_WEBHOOK_URL || "",
    isActive: true,
    triggerType: "OUTBOUND_DISPATCH",
    blueprintDoc: "GAG Finance Engine -> Make.com Webhook -> Primavera/PHC ERP API -> Email com PDF assinado",
    samplePayload: {
      invoiceId: "FT-2026-0089",
      clientNif: "5000192837",
      clientName: "Grupo Kero Luanda",
      amountAOA: 4800000,
      currency: "AOA",
      taxRate: 0.14,
      items: [{ desc: "Gestão Mensal de Redes Sociais & Vídeos Veo 3.1", qty: 1, unitPriceAOA: 4800000 }],
    },
  },
  {
    id: "make-social-media-publisher",
    name: "Publicador Multi-Plataforma (Instagram / LinkedIn / Facebook)",
    category: "MARKETING",
    description: "Publicação automática de criativos, carrosséis e vídeos gerados pela KIA diretamente nas redes sociais.",
    defaultWebhookUrl: process.env.MAKE_SOCIAL_WEBHOOK_URL || "",
    isActive: true,
    triggerType: "OUTBOUND_DISPATCH",
    blueprintDoc: "GAG Creative Engine -> Make.com Webhook -> Meta Graph API / LinkedIn API Publish Post",
    samplePayload: {
      platform: ["INSTAGRAM", "LINKEDIN", "FACEBOOK"],
      caption: "Transforme a sua marca com IA no mercado angolano. 🚀 #GAGVisual #Luanda #MarketingDigital",
      mediaUrl: "https://storage.gagvisual.com/exports/post_banner_2026.png",
      scheduledTime: new Date().toISOString(),
    },
  },
  {
    id: "make-custom-agent-executor",
    name: "Executor Universal de Ações Externas KIA",
    category: "CUSTOM",
    description: "Permite aos agentes autónomos da GAG disparar qualquer cenário arbitrário no Make.com passando parâmetros JSON dinâmicos.",
    defaultWebhookUrl: "",
    isActive: true,
    triggerType: "OUTBOUND_DISPATCH",
    blueprintDoc: "KIA Agent Tool Call -> Make.com Custom Webhook -> Any App / Service",
    samplePayload: {
      agentId: "gag-programmer-engineer",
      action: "trigger_backup_or_deploy",
      parameters: { target: "staging", priority: "HIGH" },
    },
  },
];

// 1. Health check & configuration status
makeRouter.get("/health", (_req, res) => {
  res.json({
    status: "HEALTHY",
    subsystem: "Make.com Automation Hub",
    zeroApiKeyMode: true,
    scenariosCount: MAKE_SCENARIO_BLUEPRINTS.length,
    activeScenarios: MAKE_SCENARIO_BLUEPRINTS.filter((s) => s.isActive).length,
    totalLogsRecorded: makeLogs.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Get list of all Make.com scenario blueprints
makeRouter.get("/scenarios", (_req, res) => {
  res.json({
    success: true,
    scenarios: MAKE_SCENARIO_BLUEPRINTS,
  });
});

// 3. Update Scenario configuration (Webhook URL, Active state)
makeRouter.post("/scenarios/update", (req, res) => {
  const { scenarioId, webhookUrl, isActive } = req.body;
  if (!scenarioId) {
    return res.status(400).json({ error: "scenarioId is required" });
  }

  const scenario = MAKE_SCENARIO_BLUEPRINTS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return res.status(404).json({ error: "Scenario not found" });
  }

  if (typeof webhookUrl === "string") {
    scenario.defaultWebhookUrl = webhookUrl.trim();
  }
  if (typeof isActive === "boolean") {
    scenario.isActive = isActive;
  }

  res.json({
    success: true,
    message: `Cenário '${scenario.name}' atualizado com sucesso.`,
    scenario,
  });
});

// 4. Dispatch Outbound Webhook to Make.com
makeRouter.post("/dispatch", async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      scenarioId = "make-custom-agent-executor",
      webhookUrl,
      payload = {},
      senderAgent = "agent-kia",
    } = req.body;

    const scenario = MAKE_SCENARIO_BLUEPRINTS.find((s) => s.id === scenarioId);
    const targetUrl = (webhookUrl || scenario?.defaultWebhookUrl || "").trim();

    const enrichedPayload = {
      ...payload,
      _gagMeta: {
        source: "GAG Core OS v2.4",
        senderAgent,
        scenarioId,
        dispatchId: `dsp-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        timestamp: new Date().toISOString(),
      },
    };

    // If no URL is configured yet, simulate local success for seamless testing
    if (!targetUrl) {
      const latencyMs = Date.now() - startTime;
      const logEntry: MakeWebhookLog = {
        id: `mlog-${Date.now()}`,
        scenarioId,
        scenarioName: scenario?.name || "Custom Scenario",
        direction: "OUTBOUND",
        status: "PROCESSED",
        httpStatus: 200,
        payload: enrichedPayload,
        response: { simulated: true, message: "Disparo simulado com sucesso (Webhook URL não preenchida)." },
        latencyMs,
        timestamp: new Date().toISOString(),
      };
      makeLogs.unshift(logEntry);
      if (makeLogs.length > 200) makeLogs.pop();

      return res.json({
        success: true,
        dispatched: false,
        simulated: true,
        message: "Cenário disparado em modo simulação. Adicione a URL do Webhook do Make.com para envio real.",
        log: logEntry,
      });
    }

    // Real HTTP POST to Make.com Webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GAG-Core-OS-MakeDispatcher/1.0",
        "X-GAG-Dispatch-Id": enrichedPayload._gagMeta.dispatchId,
      },
      body: JSON.stringify(enrichedPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    let responseData: any;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const logEntry: MakeWebhookLog = {
      id: `mlog-${Date.now()}`,
      scenarioId,
      scenarioName: scenario?.name || "Custom Scenario",
      direction: "OUTBOUND",
      status: response.ok ? "SUCCESS" : "FAILED",
      httpStatus: response.status,
      payload: enrichedPayload,
      response: responseData,
      latencyMs,
      timestamp: new Date().toISOString(),
    };

    makeLogs.unshift(logEntry);
    if (makeLogs.length > 200) makeLogs.pop();

    return res.status(response.ok ? 200 : response.status).json({
      success: response.ok,
      dispatched: true,
      httpStatus: response.status,
      latencyMs,
      response: responseData,
      log: logEntry,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const logEntry: MakeWebhookLog = {
      id: `mlog-${Date.now()}`,
      scenarioId: req.body?.scenarioId || "unknown",
      scenarioName: "Dispatch Error",
      direction: "OUTBOUND",
      status: "FAILED",
      payload: req.body?.payload || {},
      error: err.message,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
    makeLogs.unshift(logEntry);
    return res.status(500).json({ error: err.message, log: logEntry });
  }
});

// 5. Inbound Webhook Receiver from Make.com (e.g., Incoming WhatsApp, Lead Submitted, Task Event)
makeRouter.post("/inbound/:scenarioId?", async (req, res) => {
  const startTime = Date.now();
  try {
    const scenarioId = req.params.scenarioId || req.body?.scenarioId || "make-inbound-general";
    const body = req.body || {};

    const isWhatsApp =
      scenarioId.includes("whatsapp") ||
      body.event === "whatsapp_message_received" ||
      !!body.senderNumber;

    let aiReply = "";

    // If it's an incoming WhatsApp message forwarded by Make.com:
    if (isWhatsApp) {
      const senderNumber = body.senderNumber || body.phone || "+244 923 000 000";
      const senderName = body.senderName || body.name || "Cliente WhatsApp";
      const message = body.message || body.text || "Olá";

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `És o agente comercial e de atendimento 24/7 da GAG Visual no WhatsApp (Luanda, Angola).
O cliente ${senderName} (${senderNumber}) enviou a mensagem: "${message}".
Gera uma resposta acolhedora, executiva, comercial e calorosa (valores em Kwanzas AOA se aplicável). Máximo 2 a 3 frases.`;

          const gen = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
          });
          aiReply = gen.text?.trim() || "";
        }
      } catch (e) {
        console.warn("Make Inbound AI generation fallback:", e);
      }

      if (!aiReply) {
        aiReply = `Olá ${senderName}! A GAG Visual registou a sua mensagem: "${message.slice(0, 50)}". O nosso consultor comercial irá responder de imediato!`;
      }
    }

    const latencyMs = Date.now() - startTime;
    const logEntry: MakeWebhookLog = {
      id: `mlog-in-${Date.now()}`,
      scenarioId,
      scenarioName: isWhatsApp ? "WhatsApp Inbound via Make" : "Make Inbound Webhook",
      direction: "INBOUND",
      status: "PROCESSED",
      httpStatus: 200,
      payload: body,
      response: isWhatsApp ? { aiReply, autoReplied: true } : { processed: true },
      latencyMs,
      timestamp: new Date().toISOString(),
    };

    makeLogs.unshift(logEntry);
    if (makeLogs.length > 200) makeLogs.pop();

    return res.status(200).json({
      received: true,
      scenarioId,
      processedAt: new Date().toISOString(),
      latencyMs,
      aiReply: aiReply || undefined,
      replyToSender: isWhatsApp ? aiReply : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Get Execution Logs
makeRouter.get("/logs", (req, res) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  res.json({
    success: true,
    totalLogs: makeLogs.length,
    logs: makeLogs.slice(0, limit),
  });
});

// 7. Clear Logs
makeRouter.post("/logs/clear", (_req, res) => {
  makeLogs.length = 0;
  res.json({ success: true, message: "Logs do Make.com limpos com sucesso." });
});
