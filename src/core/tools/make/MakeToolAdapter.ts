/**
 * GAG CORE OS — MAKE.COM TOOL ADAPTER
 * Adapts Make.com Zero-API-Key Webhook Scenarios into native CoreTool instances.
 * Enables autonomous execution from KIA Orchestrator and GAG Agents without managing 3rd party API keys.
 */

import { CoreTool, ToolParameter, ToolExecutionContext, ToolResult } from "../../types";
import { makeApi, MakeScenario } from "../../../services/makeApi";
import { ToolRegistry } from "../toolRegistry";

export class MakeToolAdapter {
  private static instance: MakeToolAdapter;

  public static getInstance(): MakeToolAdapter {
    if (!MakeToolAdapter.instance) {
      MakeToolAdapter.instance = new MakeToolAdapter();
    }
    return MakeToolAdapter.instance;
  }

  public adaptScenarioToCoreTool(scenario: MakeScenario): CoreTool {
    const parameters: ToolParameter[] = [
      {
        name: "payload",
        type: "object",
        description: `Dados JSON para disparo no cenário Make.com (${scenario.name})`,
        required: true,
      },
      {
        name: "webhookUrlOverride",
        type: "string",
        description: "URL alternativa de Webhook do Make.com (opcional)",
        required: false,
      },
    ];

    let toolCategory: CoreTool["category"] = "OPERATIONS";
    if (scenario.category === "WHATSAPP" || scenario.category === "MARKETING") {
      toolCategory = "GAG_BRAND";
    } else if (scenario.category === "CRM") {
      toolCategory = "OPERATIONS";
    } else if (scenario.category === "FINANCE") {
      toolCategory = "DATA_ANALYTICS";
    }

    return {
      id: scenario.id,
      name: `[Make.com] ${scenario.name}`,
      category: toolCategory,
      description: `Cenário Make.com (Zero-API-Key): ${scenario.description}`,
      parameters,
      requiredPermission: `make:execute:${scenario.category.toLowerCase()}`,
      autonomyLevel: 0,
      execute: async (args: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult> => {
        const start = Date.now();
        const auditRef = `0xMAKE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        try {
          const payload = typeof args.payload === "object" ? args.payload : { raw: args.payload };
          const result = await makeApi.dispatchWebhook({
            scenarioId: scenario.id,
            webhookUrl: args.webhookUrlOverride || scenario.defaultWebhookUrl,
            payload,
            senderAgent: context.agentId,
          });

          return {
            success: result.success,
            data: result,
            executionTimeMs: Date.now() - start,
            auditTrailRef: auditRef,
          };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Falha ao executar webhook no Make.com",
            executionTimeMs: Date.now() - start,
            auditTrailRef: auditRef,
          };
        }
      },
    };
  }

  public registerAllScenarios(registry: ToolRegistry, scenarios: MakeScenario[]): void {
    scenarios.forEach((scenario) => {
      const tool = this.adaptScenarioToCoreTool(scenario);
      registry.registerTool(tool);
    });
  }
}

export const makeToolAdapter = MakeToolAdapter.getInstance();
