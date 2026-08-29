/**
 * GAG CORE OS — N8N TOOL ADAPTER
 * Adapts N8N workflows into native CoreTool instances for GAG Core OS (AOS).
 * Enables seamless execution from KIA Orchestrator, Supervisor, and ExecutionEngine.
 */

import { CoreTool, ToolParameter, ToolExecutionContext, ToolResult } from "../../types";
import { N8NClient } from "./N8NClient";
import { N8NWorkflowDefinition, GAG_N8N_WORKFLOWS, getAllN8NWorkflows } from "./workflows";
import { ToolRegistry } from "../toolRegistry";

export class N8NToolAdapter {
  private static instance: N8NToolAdapter;
  private client: N8NClient;

  private constructor() {
    this.client = N8NClient.getInstance();
  }

  public static getInstance(): N8NToolAdapter {
    if (!N8NToolAdapter.instance) {
      N8NToolAdapter.instance = new N8NToolAdapter();
    }
    return N8NToolAdapter.instance;
  }

  /**
   * Adapts an N8NWorkflowDefinition into a native CoreTool
   */
  public adaptWorkflowToCoreTool(workflow: N8NWorkflowDefinition): CoreTool {
    const parameters: ToolParameter[] = [
      ...workflow.requiredParams.map((p) => ({
        name: p,
        type: "string" as const,
        description: `Parâmetro obrigatório para workflow ${workflow.name}`,
        required: true,
      })),
      ...workflow.optionalParams.map((p) => ({
        name: p,
        type: "string" as const,
        description: `Parâmetro opcional para workflow ${workflow.name}`,
        required: false,
      })),
    ];

    let toolCategory: CoreTool["category"] = "OPERATIONS";
    if (workflow.category === "CRM" || workflow.category === "MARKETING") {
      toolCategory = "GAG_BRAND";
    } else if (workflow.category === "FINANCE" || workflow.category === "AGT_TAX") {
      toolCategory = "DATA_ANALYTICS";
    } else if (workflow.category === "ERP") {
      toolCategory = "DOCUMENTS";
    }

    return {
      id: workflow.id,
      name: `[N8N] ${workflow.name}`,
      category: toolCategory,
      description: `Workflow N8N automatizado: ${workflow.description} (Sistemas: ${workflow.targetSystems.join(", ")})`,
      parameters,
      requiredPermission: `n8n:execute:${workflow.category.toLowerCase()}`,
      autonomyLevel: workflow.autonomyLevel,
      execute: async (params: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult> => {
        const start = Date.now();

        // Check required parameters
        for (const reqParam of workflow.requiredParams) {
          if (params[reqParam] === undefined || params[reqParam] === null || params[reqParam] === "") {
            return {
              success: false,
              error: `Parâmetro obrigatório em falta no workflow N8N: ${reqParam}`,
              executionTimeMs: Date.now() - start,
              auditTrailRef: `0xN8N-ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            };
          }
        }

        const enrichedPayload = {
          ...params,
          _context: {
            taskId: context.taskId,
            agentId: context.agentId || "kia_orchestrator",
            userId: context.userId || "owner_josemar",
            userRole: context.userRole || "OWNER",
            triggeredAt: new Date().toISOString(),
          },
        };

        const result = await this.client.triggerWebhook(
          workflow.webhookEndpoint,
          enrichedPayload,
          { method: workflow.method }
        );

        const executionDuration = Date.now() - start;
        const auditRef = `0xN8N-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        if (!result.success && result.status !== "simulated") {
          return {
            success: false,
            error: result.error || "Falha na execução do workflow N8N",
            executionTimeMs: executionDuration,
            auditTrailRef: auditRef,
          };
        }

        return {
          success: true,
          data: {
            workflowId: workflow.id,
            workflowName: workflow.name,
            endpoint: workflow.webhookEndpoint,
            status: result.status,
            targetSystems: workflow.targetSystems,
            n8nResponse: result.data,
            durationMs: result.durationMs,
          },
          executionTimeMs: executionDuration,
          auditTrailRef: auditRef,
          artifacts: [
            {
              name: `n8n_execution_${workflow.id}.json`,
              type: "json",
              content: JSON.stringify(
                {
                  workflow: workflow.name,
                  executedAt: new Date().toISOString(),
                  status: result.status,
                  payload: enrichedPayload,
                  response: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      },
    };
  }

  /**
   * Registers all predefined N8N workflows into the ToolRegistry
   */
  public registerAllN8NToolsIntoRegistry(): void {
    const registry = ToolRegistry.getInstance();
    const workflows = getAllN8NWorkflows();

    for (const wf of workflows) {
      const tool = this.adaptWorkflowToCoreTool(wf);
      registry.registerTool(tool);
    }

    // Also register a generic universal N8N dispatcher tool
    registry.registerTool({
      id: "n8n_universal_webhook_dispatcher",
      name: "Disparador Universal de Webhook N8N",
      category: "OPERATIONS",
      description: "Envia requisições flexíveis a qualquer webhook ou workflow configurado no cluster N8N da GAG Visual.",
      parameters: [
        { name: "webhookPath", type: "string", description: "Caminho do webhook no N8N (ex: 'gag-custom-event')", required: true },
        { name: "payload", type: "object", description: "JSON com os dados a enviar", required: true },
        { name: "method", type: "string", description: "Método HTTP (POST, GET, PUT)", required: false, defaultValue: "POST" },
      ],
      requiredPermission: "n8n:universal_dispatch",
      autonomyLevel: 1,
      execute: async (params, context): Promise<ToolResult> => {
        const start = Date.now();
        const webhookPath = String(params.webhookPath || "");
        const payload = params.payload || {};
        const method = (params.method || "POST") as "POST" | "GET" | "PUT";

        const res = await this.client.triggerWebhook(webhookPath, payload, { method });
        return {
          success: res.success || res.status === "simulated",
          data: res.data,
          error: res.error,
          executionTimeMs: Date.now() - start,
          auditTrailRef: `0xN8N-UNIV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
      },
    });
  }
}
