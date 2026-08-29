/**
 * GAG CORE OS — FASE 2: SKILL TYPES
 * Defines skill metadata, statuses, risk levels, and execution handler interfaces.
 */

export type SkillStatus = "AVAILABLE" | "DISABLED" | "EXPERIMENTAL" | "DEPRECATED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SkillExecutionContext {
  skillId: string;
  executionId?: string;
  stepId?: string;
  agentId?: string;
  userId?: string;
  userRole?: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  environment?: Record<string, any>;
  timestamp: string;
}

export interface SkillExecutionResult {
  success: boolean;
  skillId: string;
  output: string;
  data?: Record<string, any>;
  artifacts?: {
    id: string;
    title: string;
    type: "DOCUMENT" | "CODE" | "IMAGE_PROMPT" | "VIDEO_PROMPT" | "DATA" | "CONFIG" | "REPORT" | "OTHER";
    content: string;
  }[];
  metadata: {
    durationMs: number;
    executedByAgent?: string;
    timestamp: string;
    riskLevel: RiskLevel;
  };
  error?: string;
}

export type SkillHandler = (
  input: Record<string, any>,
  context: SkillExecutionContext
) => Promise<SkillExecutionResult> | SkillExecutionResult;

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: SkillStatus;
  requiredCapabilities: string[];
  requiredTools: string[];
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
  enabled: boolean;
  handler: SkillHandler;
  tags?: string[];
}
