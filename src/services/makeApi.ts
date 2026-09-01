/**
 * GAG CORE OS — MAKE.COM INTEGRATION API CLIENT
 * Client-side interface to dispatch and monitor Make.com Zero-API-Key Webhook Automations.
 */

export interface MakeScenario {
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

export interface MakeLogEntry {
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

export interface MakeHealthResponse {
  status: string;
  subsystem: string;
  zeroApiKeyMode: boolean;
  scenariosCount: number;
  activeScenarios: number;
  totalLogsRecorded: number;
  timestamp: string;
}

export class MakeApiClient {
  private static instance: MakeApiClient;

  public static getInstance(): MakeApiClient {
    if (!MakeApiClient.instance) {
      MakeApiClient.instance = new MakeApiClient();
    }
    return MakeApiClient.instance;
  }

  async getHealth(): Promise<MakeHealthResponse> {
    const res = await fetch("/api/make/health");
    if (!res.ok) throw new Error("Falha ao contactar subsistema Make.com");
    return res.json();
  }

  async getScenarios(): Promise<MakeScenario[]> {
    const res = await fetch("/api/make/scenarios");
    if (!res.ok) throw new Error("Falha ao carregar cenários do Make.com");
    const data = await res.json();
    return data.scenarios || [];
  }

  async updateScenario(scenarioId: string, webhookUrl: string, isActive?: boolean): Promise<{ success: boolean; scenario: MakeScenario }> {
    const res = await fetch("/api/make/scenarios/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId, webhookUrl, isActive }),
    });
    if (!res.ok) throw new Error("Falha ao atualizar configuração do cenário Make.com");
    return res.json();
  }

  async dispatchWebhook(params: {
    scenarioId: string;
    webhookUrl?: string;
    payload: Record<string, any>;
    senderAgent?: string;
  }): Promise<{
    success: boolean;
    dispatched: boolean;
    simulated?: boolean;
    httpStatus?: number;
    latencyMs?: number;
    response?: any;
    log?: MakeLogEntry;
    message?: string;
  }> {
    const res = await fetch("/api/make/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return res.json();
  }

  async getLogs(limit = 50): Promise<{ success: boolean; totalLogs: number; logs: MakeLogEntry[] }> {
    const res = await fetch(`/api/make/logs?limit=${limit}`);
    if (!res.ok) throw new Error("Falha ao carregar registos do Make.com");
    return res.json();
  }

  async clearLogs(): Promise<void> {
    await fetch("/api/make/logs/clear", { method: "POST" });
  }
}

export const makeApi = MakeApiClient.getInstance();
