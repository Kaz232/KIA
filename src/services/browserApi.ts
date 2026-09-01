/**
 * GAG CORE OS — BROWSER HARNESS CLIENT SERVICE
 * 
 * Provides front-end interface for navigating, scraping, auditing, and testing
 * web targets using the server-side Browser Harness.
 */

export interface BrowserNavigationResult {
  success: boolean;
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  latencyMs: number;
  contentLength: number;
  isHtml: boolean;
  title: string;
  description: string;
  h1s: string[];
  links: { href: string; text: string; isExternal: boolean }[];
  extractedText: string;
  rawHtml?: string;
  error?: string;
}

export interface BrowserAuditResult {
  url: string;
  overallScore: number;
  scores: {
    seo: number;
    security: number;
    performance: number;
    accessibility: number;
  };
  metrics: {
    latencyMs: number;
    pageSizeBytes: number;
    isHttps: boolean;
    headersSummary: {
      server: string;
      hsts: boolean;
      csp: boolean;
      xFrameOptions: string;
    };
    imagesFound: number;
    imagesWithAlt: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface BrowserTestCase {
  id: string;
  name: string;
  type: "STATUS_CODE" | "LATENCY_UNDER" | "PROTOCOL_HTTPS" | "HAS_TITLE" | "MOBILE_VIEWPORT" | "CONTAINS_TEXT";
  expected?: any;
  expectedMs?: number;
  expectedText?: string;
  passed?: boolean;
  actual?: any;
}

export interface BrowserTestReport {
  url: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: BrowserTestCase[];
  latencyMs: number;
  timestamp: string;
}

export interface BrowserScrapeResult {
  success: boolean;
  data: {
    pageTitle?: string;
    mainSummary?: string;
    contacts?: {
      emails: string[];
      phones: string[];
      whatsapp: string[];
      locations: string[];
    };
    keyOfferings?: Array<{
      name: string;
      description: string;
      priceEstimated?: string;
    }>;
    techStackDetected?: string[];
    marketInsightsAngola?: string;
    extractedEntities?: string[];
    rawText?: string;
  };
  latencyMs: number;
  timestamp: string;
}

export interface BrowserAgentActionResult {
  success: boolean;
  url: string;
  pageTitle: string;
  goal: string;
  agentName: string;
  agentAnalysis: string;
  proposedActions: Array<{ action: string; target: string }>;
  latencyMs: number;
  timestamp: string;
}

export interface BrowserPreset {
  name: string;
  url: string;
  category: string;
  description: string;
}

class BrowserApiService {
  private static instance: BrowserApiService;

  public static getInstance(): BrowserApiService {
    if (!BrowserApiService.instance) {
      BrowserApiService.instance = new BrowserApiService();
    }
    return BrowserApiService.instance;
  }

  public async getPresets(): Promise<BrowserPreset[]> {
    try {
      const res = await fetch("/api/browser/presets");
      if (!res.ok) throw new Error("Failed to fetch presets");
      const data = await res.json();
      return data.presets || [];
    } catch {
      return [
        { name: "GAG Visual", url: "https://gagvisual.com", category: "GAG_ECOSYSTEM", description: "Site oficial da GAG Visual" },
        { name: "Portal Governo Angola", url: "https://governo.gov.ao", category: "ANGOLA_PORTALS", description: "Portal Institucional" },
        { name: "Jornal de Angola", url: "https://www.jornaldeangola.ao", category: "MEDIA_ANGOLA", description: "Notícias e Economia" },
        { name: "Make.com Hub", url: "https://www.make.com", category: "INTEGRATION", description: "Plataforma de automações" },
      ];
    }
  }

  public async navigate(url: string): Promise<BrowserNavigationResult> {
    const res = await fetch("/api/browser/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Falha ao navegar no browser headless");
    }
    return data;
  }

  public async scrape(params: {
    url?: string;
    schemaType?: string;
    customPrompt?: string;
    extractedText?: string;
  }): Promise<BrowserScrapeResult> {
    const res = await fetch("/api/browser/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Falha na extração de dados");
    }
    return data;
  }

  public async audit(url: string): Promise<BrowserAuditResult> {
    const res = await fetch("/api/browser/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Falha na auditoria da página");
    }
    return data.audit;
  }

  public async runTestSuite(url: string, testCases?: BrowserTestCase[]): Promise<BrowserTestReport> {
    const res = await fetch("/api/browser/test-suite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, testCases }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Falha nos testes sintéticos");
    }
    return data.report;
  }

  public async executeAgentAction(params: {
    url: string;
    userGoal: string;
    agentName?: string;
  }): Promise<BrowserAgentActionResult> {
    const res = await fetch("/api/browser/ai-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Falha na ação do agente");
    }
    return data;
  }

  public async getHistory(): Promise<any[]> {
    try {
      const res = await fetch("/api/browser/history");
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  }

  public async clearHistory(): Promise<void> {
    await fetch("/api/browser/history/clear", { method: "POST" });
  }
}

export const browserApi = BrowserApiService.getInstance();
