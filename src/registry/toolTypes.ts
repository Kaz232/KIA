/**
 * GAG CORE OS — FASE 2: TOOL TYPES
 * Strict definitions for internal and external tool metadata, status, approval and handlers.
 */

import { RiskLevel } from "./skillTypes";

export type ToolStatus = "AVAILABLE" | "UNAVAILABLE" | "DISABLED" | "EXTERNAL" | "INTERNAL";

export interface ToolExecutionContext {
  toolId: string;
  executionId?: string;
  stepId?: string;
  agentId?: string;
  userRole?: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  timestamp: string;
}

export interface ToolExecutionResult {
  success: boolean;
  toolId: string;
  result: any;
  metadata: {
    durationMs: number;
    executedAt: string;
    riskLevel: RiskLevel;
  };
  error?: string;
}

export type ToolHandler = (
  input: Record<string, any>,
  context: ToolExecutionContext
) => Promise<ToolExecutionResult> | ToolExecutionResult;

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: ToolStatus;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  outputSchema: {
    type: "object";
    properties: Record<string, any>;
  };
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  handler: ToolHandler;
  metadata?: Record<string, any>;
}
