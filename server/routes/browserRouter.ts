/**
 * GAG CORE OS — AUTONOMOUS BROWSER HARNESS & WEB ENGINE
 * 
 * Provides headless URL navigation, DOM extraction, AI-powered scraping,
 * automated SEO/Security/Performance auditing, and synthetic E2E testing for agents.
 */

import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

export const browserRouter = Router();

export interface BrowserHistoryEntry {
  id: string;
  url: string;
  title: string;
  status: number;
  statusText: string;
  latencyMs: number;
  contentLength: number;
  timestamp: string;
  actionType: "NAVIGATE" | "SCRAPE" | "AUDIT" | "TEST_SUITE" | "AI_ACTION";
  summary?: string;
}

const browserHistory: BrowserHistoryEntry[] = [];

// Preset targets for testing and intelligence in Angola & Tech Ecosystem
const BROWSER_PRESETS = [
  {
    name: "GAG Visual (Oficial)",
    url: "https://gagvisual.com",
    category: "GAG_ECOSYSTEM",
    description: "Portal principal da agência GAG Visual em Luanda.",
  },
  {
    name: "Portal do Governo de Angola",
    url: "https://governo.gov.ao",
    category: "ANGOLA_PORTALS",
    description: "Portal institucional da República de Angola.",
  },
  {
    name: "Jornal de Angola",
    url: "https://www.jornaldeangola.ao",
    category: "MEDIA_ANGOLA",
    description: "Principal diário de informação e notícias em Angola.",
  },
  {
    name: "Expansão Angola (Economia)",
    url: "https://expansao.co.ao",
    category: "MEDIA_ANGOLA",
    description: "Jornal de economia, finanças e negócios em Angola.",
  },
  {
    name: "Make.com (Integromat)",
    url: "https://www.make.com",
    category: "INTEGRATION",
    description: "Plataforma de automações visuais Zero-Key.",
  },
  {
    name: "GitHub Status",
    url: "https://www.githubstatus.com",
    category: "DEV_OPS",
    description: "Monitor de disponibilidade e uptime de serviços.",
  },
];

// Helper: Normalize URL
function sanitizeUrl(rawUrl: string): string {
  let u = rawUrl.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  return u;
}

// Helper: Clean and extract text & metadata from HTML string
function extractHtmlDetails(html: string, url: string) {
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;

  // Description
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : "";

  // Headings (H1, H2)
  const h1s: string[] = [];
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let m;
  while ((m = h1Regex.exec(html)) !== null && h1s.length < 5) {
    const clean = m[1].replace(/<[^>]+>/g, "").trim();
    if (clean) h1s.push(clean);
  }

  // Links
  const links: { href: string; text: string; isExternal: boolean }[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let lm;
  while ((lm = linkRegex.exec(html)) !== null && links.length < 25) {
    const href = lm[1].trim();
    const text = lm[2].replace(/<[^>]+>/g, "").trim();
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      const isExternal = href.startsWith("http") && !href.includes(new URL(url).hostname);
      links.push({ href, text: text || href, isExternal });
    }
  }

  // Clean Text Content
  let cleanText = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  // Limit text length to 10k chars for fast downstream AI processing
  if (cleanText.length > 10000) {
    cleanText = cleanText.slice(0, 10000) + "... [Conteúdo truncado]";
  }

  return { title, description, h1s, links, cleanText };
}

// 1. Health & Configuration Status
browserRouter.get("/health", (_req, res) => {
  res.json({
    status: "HEALTHY",
    subsystem: "GAG Autonomous Browser Harness",
    version: "2.5.0",
    presetsCount: BROWSER_PRESETS.length,
    historyCount: browserHistory.length,
    capabilities: [
      "URL_NAVIGATION",
      "AI_STRUCTURED_SCRAPING",
      "AUTOMATED_AUDIT_ENGINE",
      "SYNTHETIC_TEST_RUNNER",
      "AGENT_ACTION_LOOP",
    ],
    timestamp: new Date().toISOString(),
  });
});

// 2. Get Browser Presets
browserRouter.get("/presets", (_req, res) => {
  res.json({ success: true, presets: BROWSER_PRESETS });
});

// 3. Navigate & Proxy Fetch URL
browserRouter.post("/navigate", async (req, res) => {
  const startTime = Date.now();
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL é obrigatória." });
    }

    const sanitized = sanitizeUrl(url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const fetchResponse = await fetch(sanitized, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 GAG-BrowserHarness/2.5",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    const contentType = fetchResponse.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html") || contentType.includes("application/xhtml");
    const rawBody = await fetchResponse.text();

    const headersObj: Record<string, string> = {};
    fetchResponse.headers.forEach((val, key) => {
      headersObj[key] = val;
    });

    let details = {
      title: sanitized,
      description: "",
      h1s: [] as string[],
      links: [] as any[],
      cleanText: isHtml ? rawBody.slice(0, 5000) : rawBody,
    };

    if (isHtml) {
      details = extractHtmlDetails(rawBody, sanitized);
    }

    const historyItem: BrowserHistoryEntry = {
      id: `nav-${Date.now()}`,
      url: sanitized,
      title: details.title || sanitized,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      latencyMs,
      contentLength: rawBody.length,
      timestamp: new Date().toISOString(),
      actionType: "NAVIGATE",
      summary: details.description || details.h1s.join(" | ") || `Página carregada (${rawBody.length} bytes)`,
    };

    browserHistory.unshift(historyItem);
    if (browserHistory.length > 100) browserHistory.pop();

    return res.json({
      success: true,
      url: sanitized,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: headersObj,
      latencyMs,
      contentLength: rawBody.length,
      isHtml,
      title: details.title,
      description: details.description,
      h1s: details.h1s,
      links: details.links,
      extractedText: details.cleanText,
      rawHtml: rawBody.slice(0, 250000), // capped at 250kb for client rendering
      historyItem,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      error: `Falha ao navegar para URL: ${err.message}`,
      latencyMs,
    });
  }
});

// 4. AI Structured Scraper
browserRouter.post("/scrape", async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, schemaType = "GENERAL_INTELLIGENCE", customPrompt, extractedText } = req.body;
    let textToAnalyze = extractedText;

    if (!textToAnalyze && url) {
      const sanitized = sanitizeUrl(url);
      const resp = await fetch(sanitized, {
        headers: {
          "User-Agent": "Mozilla/5.0 GAG-BrowserHarness/2.5",
        },
      });
      const html = await resp.text();
      const extracted = extractHtmlDetails(html, sanitized);
      textToAnalyze = extracted.cleanText;
    }

    if (!textToAnalyze) {
      return res.status(400).json({ error: "Texto extraído ou URL é obrigatória para raspagem." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedData: any = {};

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `És o motor de raspagem e inteligência web do GAG Core OS (Luanda, Angola).
Analisa o conteúdo extraído da página web abaixo e extrai dados estruturados em JSON estrito.

Tipo de extração: ${schemaType}
Instruções customizadas: ${customPrompt || "Extrai os pontos-chave, contactos (telefones, emails, WhatsApp), produtos/serviços com preços (em Kz AOA ou USD se existirem), equipa, e proposta de valor."}

CONTEÚDO DA PÁGINA:
${textToAnalyze.slice(0, 12000)}

Responde APENAS com um objeto JSON válido contendo:
{
  "pageTitle": "...",
  "mainSummary": "...",
  "contacts": { "emails": [], "phones": [], "whatsapp": [], "locations": [] },
  "keyOfferings": [ { "name": "...", "description": "...", "priceEstimated": "..." } ],
  "techStackDetected": [],
  "marketInsightsAngola": "...",
  "extractedEntities": []
}`;

      const gen = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      const responseText = gen.text || "{}";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        parsedData = JSON.parse(cleanJson);
      } catch {
        parsedData = { rawText: responseText };
      }
    } else {
      parsedData = {
        pageTitle: "Modo Simulado (Sem Chave Gemini)",
        mainSummary: textToAnalyze.slice(0, 200),
        contacts: { emails: ["contacto@gagvisual.com"], phones: ["+244 923 884 190"], whatsapp: ["+244 923 884 190"], locations: ["Luanda, Angola"] },
        keyOfferings: [{ name: "Serviço Identificado", description: "Extração de texto", priceEstimated: "Sob Consulta" }],
        techStackDetected: ["HTML5", "Modern Web"],
      };
    }

    const latencyMs = Date.now() - startTime;

    const historyItem: BrowserHistoryEntry = {
      id: `scr-${Date.now()}`,
      url: url || "RAW_TEXT",
      title: parsedData.pageTitle || "Scrape Result",
      status: 200,
      statusText: "OK",
      latencyMs,
      contentLength: textToAnalyze.length,
      timestamp: new Date().toISOString(),
      actionType: "SCRAPE",
      summary: parsedData.mainSummary || "Extração de dados concluída.",
    };
    browserHistory.unshift(historyItem);

    return res.json({
      success: true,
      data: parsedData,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Erro de extração: ${err.message}` });
  }
});

// 5. Automated Web Audit Engine (SEO, Security, Performance, Accessibility)
browserRouter.post("/audit", async (req, res) => {
  const startTime = Date.now();
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL é obrigatória para auditoria." });

    const sanitized = sanitizeUrl(url);
    const fetchResponse = await fetch(sanitized, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0 GAG-Auditor/2.5" },
    });

    const latencyMs = Date.now() - startTime;
    const html = await fetchResponse.text();
    const headers = fetchResponse.headers;

    // 1. SEO Evaluation
    const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
    const hasMetaDesc = /<meta[^>]*name=["']description["']/i.test(html);
    const hasOgTags = /<meta[^>]*property=["']og:/i.test(html);
    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    let seoScore = 0;
    if (hasTitle) seoScore += 25;
    if (hasMetaDesc) seoScore += 25;
    if (hasOgTags) seoScore += 25;
    if (h1Count === 1) seoScore += 25;
    else if (h1Count > 1) seoScore += 15;

    // 2. Security Evaluation
    const isHttps = sanitized.startsWith("https://");
    const hasHsts = headers.has("strict-transport-security");
    const hasCsp = headers.has("content-security-policy");
    const hasXFrame = headers.has("x-frame-options");
    let securityScore = 0;
    if (isHttps) securityScore += 35;
    if (hasHsts) securityScore += 25;
    if (hasXFrame) securityScore += 20;
    if (hasCsp) securityScore += 20;

    // 3. Performance Benchmark (TTFB & Payload)
    let perfScore = 100;
    if (latencyMs > 300) perfScore -= 15;
    if (latencyMs > 800) perfScore -= 20;
    if (latencyMs > 1500) perfScore -= 25;
    if (html.length > 500000) perfScore -= 20;
    else if (html.length > 200000) perfScore -= 10;
    perfScore = Math.max(20, perfScore);

    // 4. Accessibility & Mobile Readiness
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    const hasLang = /<html[^>]*lang=["']/i.test(html);
    const imgTags = html.match(/<img[^>]+>/gi) || [];
    const imgsWithAlt = imgTags.filter((img) => /alt=["'][^"']+["']/i.test(img));
    const altRatio = imgTags.length > 0 ? imgsWithAlt.length / imgTags.length : 1;
    let a11yScore = 0;
    if (hasViewport) a11yScore += 35;
    if (hasLang) a11yScore += 25;
    a11yScore += Math.round(altRatio * 40);

    const overallScore = Math.round((seoScore + securityScore + perfScore + a11yScore) / 4);

    const recommendations: string[] = [];
    if (!hasMetaDesc) recommendations.push("Adicione uma meta-tag 'description' rica para melhorar a indexação no Google.");
    if (h1Count === 0) recommendations.push("A página não possui nenhuma tag <h1> principal.");
    if (!hasHsts) recommendations.push("Ative o cabeçalho Strict-Transport-Security (HSTS) para reforço criptográfico.");
    if (!hasXFrame) recommendations.push("Configure X-Frame-Options para prevenir ataques de Clickjacking.");
    if (latencyMs > 800) recommendations.push(`O tempo de resposta (${latencyMs}ms) é superior ao ideal de 300ms. Considere CDN Edge.`);
    if (altRatio < 0.8) recommendations.push("Várias imagens na página não possuem o atributo 'alt' para acessibilidade.");

    const auditResult = {
      url: sanitized,
      overallScore,
      scores: {
        seo: seoScore,
        security: securityScore,
        performance: perfScore,
        accessibility: a11yScore,
      },
      metrics: {
        latencyMs,
        pageSizeBytes: html.length,
        isHttps,
        headersSummary: {
          server: headers.get("server") || "Oculto/Cloudflare",
          hsts: hasHsts,
          csp: hasCsp,
          xFrameOptions: headers.get("x-frame-options") || "Não configurado",
        },
        imagesFound: imgTags.length,
        imagesWithAlt: imgsWithAlt.length,
      },
      recommendations,
      timestamp: new Date().toISOString(),
    };

    const historyItem: BrowserHistoryEntry = {
      id: `aud-${Date.now()}`,
      url: sanitized,
      title: `Auditoria (${overallScore}/100)`,
      status: fetchResponse.status,
      statusText: "OK",
      latencyMs,
      contentLength: html.length,
      timestamp: new Date().toISOString(),
      actionType: "AUDIT",
      summary: `Score Global: ${overallScore}/100 | SEO: ${seoScore} | Segurança: ${securityScore} | Performance: ${perfScore}`,
    };
    browserHistory.unshift(historyItem);

    return res.json({ success: true, audit: auditResult });
  } catch (err: any) {
    return res.status(500).json({ error: `Falha na auditoria: ${err.message}` });
  }
});

// 6. Synthetic E2E Test Suite Runner
browserRouter.post("/test-suite", async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, testCases = [] } = req.body;
    if (!url) return res.status(400).json({ error: "URL é obrigatória." });

    const sanitized = sanitizeUrl(url);

    // Default test suite if none provided
    const suite = testCases.length > 0 ? testCases : [
      { id: "tc-1", name: "Status HTTP 200 (Disponibilidade)", type: "STATUS_CODE", expected: 200 },
      { id: "tc-2", name: "Tempo de Resposta < 2000ms", type: "LATENCY_UNDER", expectedMs: 2000 },
      { id: "tc-3", name: "Certificado HTTPS Ativo", type: "PROTOCOL_HTTPS", expected: true },
      { id: "tc-4", name: "Tag <title> Presente e Válida", type: "HAS_TITLE", expected: true },
      { id: "tc-5", name: "Viewport Mobile Configurado", type: "MOBILE_VIEWPORT", expected: true },
    ];

    const fetchRes = await fetch(sanitized);
    const latencyMs = Date.now() - startTime;
    const html = await fetchRes.text();
    const isHttps = sanitized.startsWith("https://");
    const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);

    const results = suite.map((tc: any) => {
      let passed = false;
      let actual: any = null;

      switch (tc.type) {
        case "STATUS_CODE":
          actual = fetchRes.status;
          passed = fetchRes.status === (tc.expected || 200);
          break;
        case "LATENCY_UNDER":
          actual = `${latencyMs}ms`;
          passed = latencyMs <= (tc.expectedMs || 2000);
          break;
        case "PROTOCOL_HTTPS":
          actual = isHttps;
          passed = isHttps === true;
          break;
        case "HAS_TITLE":
          actual = hasTitle;
          passed = hasTitle === true;
          break;
        case "MOBILE_VIEWPORT":
          actual = hasViewport;
          passed = hasViewport === true;
          break;
        case "CONTAINS_TEXT":
          actual = html.includes(tc.expectedText);
          passed = actual === true;
          break;
        default:
          passed = true;
          actual = "N/A";
      }

      return {
        ...tc,
        passed,
        actual,
      };
    });

    const passedCount = results.filter((r: any) => r.passed).length;
    const allPassed = passedCount === results.length;

    const report = {
      url: sanitized,
      totalTests: results.length,
      passedCount,
      failedCount: results.length - passedCount,
      allPassed,
      results,
      latencyMs,
      timestamp: new Date().toISOString(),
    };

    const historyItem: BrowserHistoryEntry = {
      id: `test-${Date.now()}`,
      url: sanitized,
      title: `E2E Test: ${passedCount}/${results.length} Passou`,
      status: fetchRes.status,
      statusText: allPassed ? "ALL_PASSED" : "TEST_FAILED",
      latencyMs,
      contentLength: html.length,
      timestamp: new Date().toISOString(),
      actionType: "TEST_SUITE",
      summary: `Testes: ${passedCount}/${results.length} passaram em ${latencyMs}ms.`,
    };
    browserHistory.unshift(historyItem);

    return res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ error: `Falha ao executar testes: ${err.message}` });
  }
});

// 7. Autonomous Agent Browser Action
browserRouter.post("/ai-action", async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, userGoal, agentName = "Agent KIA" } = req.body;
    if (!url || !userGoal) {
      return res.status(400).json({ error: "URL e userGoal são obrigatórios." });
    }

    const sanitized = sanitizeUrl(url);
    const resp = await fetch(sanitized, { headers: { "User-Agent": "Mozilla/5.0 GAG-AgentHarness/2.5" } });
    const html = await resp.text();
    const details = extractHtmlDetails(html, sanitized);

    const apiKey = process.env.GEMINI_API_KEY;
    let agentAnalysis = "";
    let proposedActions: any[] = [];

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `És o ${agentName} a operar no Browser Harness do GAG Core OS (Luanda, Angola).
O teu objetivo como agente é: "${userGoal}".

Página navegada: ${sanitized} (Título: ${details.title})
Conteúdo extraído da página:
${details.cleanText.slice(0, 10000)}

Links encontrados na página:
${JSON.stringify(details.links.slice(0, 15))}

Produz uma resposta estruturada contendo:
1. Resumo da descoberta da página relativamente ao objetivo.
2. Extrações de inteligência de mercado ou dados críticos.
3. Plano de próximas ações sugeridas (ex: criar lead no CRM, disparar webhook no Make.com, criar tarefa de design, contatar no WhatsApp).
`;

      const gen = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });
      agentAnalysis = gen.text || "Análise concluída.";
      proposedActions = [
        { action: "Salvar na Base de Conhecimento GAG", target: "KNOWLEDGE_BASE" },
        { action: "Disparar Webhook de Lead para Make.com", target: "MAKE_WEBHOOK" },
        { action: "Criar Tarefa de Acompanhamento", target: "TASKS_ENGINE" },
      ];
    } else {
      agentAnalysis = `[Modo Offline] O agente ${agentName} inspecionou a página ${details.title}. Foram identificados ${details.links.length} links relevantes e 1 título principal. Proposta: integrar no CRM e registar métricas.`;
      proposedActions = [{ action: "Salvar registo", target: "LOCAL_STORE" }];
    }

    const latencyMs = Date.now() - startTime;

    return res.json({
      success: true,
      url: sanitized,
      pageTitle: details.title,
      goal: userGoal,
      agentName,
      agentAnalysis,
      proposedActions,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Erro na ação do agente: ${err.message}` });
  }
});

// 8. History Management
browserRouter.get("/history", (_req, res) => {
  res.json({ success: true, history: browserHistory });
});

browserRouter.post("/history/clear", (_req, res) => {
  browserHistory.length = 0;
  res.json({ success: true, message: "Histórico do Browser Harness limpo." });
});
