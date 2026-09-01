/**
 * GAG CORE OS — BROWSER HARNESS TOOL ADAPTER
 * 
 * Exposes Autonomous Browser Harness actions as native CoreTools in the ToolRegistry.
 */

import { CoreTool, ToolExecutionContext, ToolResult } from "../../types";
import { browserApi } from "../../../services/browserApi";
import { ToolRegistry } from "../toolRegistry";

export class BrowserToolAdapter {
  private static instance: BrowserToolAdapter;

  public static getInstance(): BrowserToolAdapter {
    if (!BrowserToolAdapter.instance) {
      BrowserToolAdapter.instance = new BrowserToolAdapter();
    }
    return BrowserToolAdapter.instance;
  }

  public getBrowserNavigateTool(): CoreTool {
    return {
      id: "browser_navigate",
      name: "Navegador Web Headless",
      category: "RESEARCH",
      description: "Navega para qualquer URL na web, extrai texto limpo, links, títulos e meta-tags.",
      parameters: [
        {
          name: "url",
          type: "string",
          description: "URL de destino (ex: https://governo.gov.ao)",
          required: true,
        },
      ],
      requiredPermission: "browser:navigate",
      autonomyLevel: 0,
      execute: async (args: Record<string, any>, _context: ToolExecutionContext): Promise<ToolResult> => {
        const start = Date.now();
        try {
          const result = await browserApi.navigate(args.url);
          return {
            success: true,
            data: {
              url: result.url,
              title: result.title,
              description: result.description,
              latencyMs: result.latencyMs,
              linksCount: result.links.length,
              sampleLinks: result.links.slice(0, 5),
              extractedPreview: result.extractedText.slice(0, 500),
            },
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xBRW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Falha ao navegar com o Browser Harness",
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xBRW-ERR`,
          };
        }
      },
    };
  }

  public getBrowserScrapeTool(): CoreTool {
    return {
      id: "browser_scrape",
      name: "Extrator Estruturado com IA",
      category: "RESEARCH",
      description: "Raspa páginas web e extrai dados estruturados (contactos, preços, serviços, inteligência).",
      parameters: [
        {
          name: "url",
          type: "string",
          description: "URL da página a analisar",
          required: true,
        },
        {
          name: "customPrompt",
          type: "string",
          description: "Instruções específicas para a extração",
          required: false,
        },
      ],
      requiredPermission: "browser:scrape",
      autonomyLevel: 0,
      execute: async (args: Record<string, any>, _context: ToolExecutionContext): Promise<ToolResult> => {
        const start = Date.now();
        try {
          const result = await browserApi.scrape({
            url: args.url,
            customPrompt: args.customPrompt,
          });
          return {
            success: true,
            data: result.data,
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xSCR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Falha na extração de dados da web",
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xSCR-ERR`,
          };
        }
      },
    };
  }

  public getBrowserAuditTool(): CoreTool {
    return {
      id: "browser_audit",
      name: "Auditoria Web 360°",
      category: "OPERATIONS",
      description: "Executa auditoria automatizada de SEO, Segurança HTTPS/HSTS, Performance e Acessibilidade.",
      parameters: [
        {
          name: "url",
          type: "string",
          description: "URL a ser auditada",
          required: true,
        },
      ],
      requiredPermission: "browser:audit",
      autonomyLevel: 0,
      execute: async (args: Record<string, any>, _context: ToolExecutionContext): Promise<ToolResult> => {
        const start = Date.now();
        try {
          const result = await browserApi.audit(args.url);
          return {
            success: true,
            data: {
              overallScore: result.overallScore,
              scores: result.scores,
              recommendations: result.recommendations,
              latencyMs: result.metrics.latencyMs,
            },
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xAUD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Falha ao auditar página",
            executionTimeMs: Date.now() - start,
            auditTrailRef: `0xAUD-ERR`,
          };
        }
      },
    };
  }

  public registerAllTools(registry: ToolRegistry): void {
    registry.registerTool(this.getBrowserNavigateTool());
    registry.registerTool(this.getBrowserScrapeTool());
    registry.registerTool(this.getBrowserAuditTool());
  }
}

export const browserToolAdapter = BrowserToolAdapter.getInstance();
