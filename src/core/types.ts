/**
 * GAG CORE OS — AGENT OPERATING SYSTEM (AOS) TYPES
 * Centralized Type System for KIA Orchestrator, Supervisor, Execution Engine,
 * Skill Registry, Tool Registry, QA Evaluator & Policy Manager.
 */

export type ExecutionState =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "HANDOFF"
  | "BLOCKED"
  | "NOT_IMPLEMENTED"
  | "OWNER_APPROVAL_REQUIRED"
  | "FAILED";

export type AutonomyLevel = 0 | 1 | 2;
// Level 0 — Automático (Sem necessidade de autorização)
// Level 1 — Supervisão Interna (Requer validação do Supervisor KIA)
// Level 2 — Proprietário / Owner (Requer confirmação explícita de Josemar Gourgel)

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  autonomyLevel: AutonomyLevel;
  requiredRole: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  actionPattern: string;
}

export interface Capability {
  id: string;
  capability: string;
  category: "INTELLIGENCE" | "DOCUMENT" | "DATA" | "GAG_VISUAL" | "SOFTWARE" | "OPERATIONS";
  implemented: boolean;
  handler: string;
  permissions: string[];
  requiresApproval: boolean;
  autonomyLevel: AutonomyLevel;
  description: string;
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface ToolExecutionContext {
  taskId?: string;
  agentId?: string;
  userId?: string;
  userRole?: string;
  sessionMemory?: Record<string, any>;
  operationalMemory?: Record<string, any>;
  signal?: AbortSignal;
}

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
  auditTrailRef: string;
  artifacts?: {
    name: string;
    type: "code" | "markdown" | "json" | "csv" | "html" | "report";
    content: string;
  }[];
}

export interface CoreTool {
  id: string;
  name: string;
  category: "FILE_IO" | "DOCUMENTS" | "DATA_ANALYTICS" | "GAG_BRAND" | "CODE_EXEC" | "OPERATIONS" | "RESEARCH";
  description: string;
  parameters: ToolParameter[];
  requiredPermission: string;
  autonomyLevel: AutonomyLevel;
  execute: (params: Record<string, any>, context: ToolExecutionContext) => Promise<ToolResult>;
}

export interface CoreSkill {
  id: string;
  name: string;
  category: "INTELLIGENCE" | "DOCUMENT" | "DATA" | "GAG_VISUAL" | "SOFTWARE" | "OPERATIONS";
  description: string;
  version: string;
  requiredTools: string[]; // Tool IDs
  permissions: string[];
  autonomyLevel: AutonomyLevel;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  handler: (input: any, context: ToolExecutionContext) => Promise<any>;
}

export interface AgentProfile {
  id: string;
  slug: string;
  name: string;
  roleTitle: string;
  description: string;
  objective: string;
  avatarColor: string;
  allocatedSkillIds: string[];
  allocatedToolIds: string[];
  permissions: string[];
  systemPrompt: string;
  maxConcurrentTasks: number;
}

export interface QACriteria {
  id: string;
  criterion: string;
  weight: number;
}

export interface QAEvaluation {
  passed: boolean;
  score: number; // 0 - 100
  feedback: string;
  criteriaResults: { criterion: string; passed: boolean; note?: string }[];
  evaluatedBy: string;
  evaluatedAt: string;
  retryRecommended: boolean;
}

export interface AgentHandoff {
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  payload: any;
  createdTaskId?: string;
  timestamp: string;
}

export interface OrchestratedTask {
  id: string;
  objective: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  agentId: string;
  skillsRequired: string[];
  toolsRequired: string[];
  inputs: Record<string, any>;
  dependencies: string[]; // Task IDs that must be COMPLETED first
  expectedOutput: string;
  status: ExecutionState;
  attempts: number;
  maxAttempts: number;
  deadline?: string;
  parentTaskId?: string;
  category: string;
  tags: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionOutput?: string;
  executionArtifacts?: { name: string; type: string; content: string }[];
  qaEvaluation?: QAEvaluation;
  handoffHistory?: AgentHandoff[];
  lastError?: string;
}

export interface DecomposedPlanStep {
  stepNumber: number;
  objective: string;
  agentId: string;
  skillsRequired: string[];
  toolsRequired: string[];
  dependencies: number[]; // Indices of preceding steps
  expectedOutput: string;
  category: string;
}

export interface OrchestratorPlan {
  id: string;
  userGoal: string;
  reasoning: string;
  steps: DecomposedPlanStep[];
  createdTasks: OrchestratedTask[];
  overallStatus: "PLANNING" | "EXECUTING" | "COMPLETED" | "BLOCKED" | "FAILED";
  createdAt: string;
  completedAt?: string;
}

export interface ThreeTierMemory {
  session: {
    activePlanId?: string;
    activeConversationId: string;
    scratchpad: Record<string, any>;
    lastTurnTimestamp: string;
  };
  operational: {
    tasksQueue: OrchestratedTask[];
    activeHandoffs: AgentHandoff[];
    cachedDeliverables: Record<string, any>;
    recentDecisions: { decision: string; rationale: string; timestamp: string }[];
  };
  permanent: {
    knowledgeVersion: string;
    brandGuidelinesSummary: string;
    clientPlaybooksSummary: string;
    approvedPolicies: PolicyRule[];
  };
}
