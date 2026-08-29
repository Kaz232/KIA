/**
 * GAG CORE OS — PHASE 1: EXECUTION ENGINE & ORCHESTRATION TYPES
 * Complete type definitions for Execution States, Task Orchestrator,
 * Agent Supervisor, QA Engine, Retry Controller, Handoff Manager, and Audit Events.
 */

export type Phase1ExecutionState =
  | "PENDING"
  | "QUEUED"
  | "ROUTING"
  | "SUPERVISING"
  | "EXECUTING"
  | "QA_VERIFYING"
  | "RETRYING"
  | "HANDOFF_IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "ESCALATED"
  | "OWNER_APPROVAL_REQUIRED"
  | "NOT_IMPLEMENTED";

export type AutonomyLevel = 0 | 1 | 2;
// Level 0 — Automatic (No authorization required)
// Level 1 — Internal Supervision (Supervised by KIA Supervisor & QA)
// Level 2 — Owner Level (Explicit human confirmation required)

export interface SupervisorVerdict {
  allowed: boolean;
  autonomyLevel: AutonomyLevel;
  requiredRole: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  requiresOwnerConfirmation: boolean;
  violations: string[];
  guardrailFlags: string[];
  maxAllowedTokens?: number;
  timeoutMs: number;
  timestamp: string;
}

export interface QACriteriaScore {
  criterion: string;
  weight: number; // e.g. 0.25
  score: number; // 0 - 100
  passed: boolean;
  notes?: string;
}

export interface QAEvaluationReport {
  executionId: string;
  taskId: string;
  passed: boolean;
  overallScore: number; // 0 - 100
  criteriaScores: QACriteriaScore[];
  summaryFeedback: string;
  correctiveInstructions?: string;
  retryRecommended: boolean;
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface RetryPlan {
  shouldRetry: boolean;
  attemptNumber: number;
  maxAttempts: number;
  backoffDelayMs: number;
  errorCategory: "TRANSIENT_NETWORK" | "RATE_LIMIT" | "TIMEOUT" | "QA_REVISION_NEEDED" | "PERMISSION_DENIED" | "FATAL_LOGIC";
  adaptedPrompt: string;
  reason: string;
}

export interface HandoffPackage {
  handoffId: string;
  executionId: string;
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  targetRole: string;
  reason: string;
  contextPayload: {
    originalGoal: string;
    previousOutputSnippet?: string;
    qaFeedback?: string;
    attemptCount: number;
    collectedArtifacts: { name: string; type: string; content: string }[];
  };
  escalationToHuman: boolean;
  timestamp: string;
}

export interface AuditEventBlock {
  id: string;
  traceId: string;
  executionId: string;
  taskId?: string;
  agentId?: string;
  actor: string;
  action: string;
  previousState?: Phase1ExecutionState;
  newState: Phase1ExecutionState;
  details: Record<string, any>;
  timestamp: string;
  previousHash: string;
  hash: string;
}

export interface OrchestratedStep {
  stepIndex: number;
  stepId: string;
  title: string;
  objective: string;
  targetAgentId: string;
  targetAgentName: string;
  requiredSkills: string[];
  dependencies: number[]; // indices of prerequisites
  inputPayload: Record<string, any>;
  state: Phase1ExecutionState;
  output?: string;
  artifacts?: { name: string; type: string; content: string }[];
  qaReport?: QAEvaluationReport;
  retryAttempts: number;
  executionTimeMs?: number;
}

export interface ExecutionPipelineRequest {
  goal: string;
  taskId?: string;
  userId?: string;
  userName?: string;
  userRole?: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  preferredAgentId?: string;
  inputs?: Record<string, any>;
  autonomyOverride?: AutonomyLevel;
  maxRetries?: number;
  skipQa?: boolean;
}

export interface ExecutionPipelineResult {
  executionId: string;
  traceId: string;
  goal: string;
  status: Phase1ExecutionState;
  primaryAgentId: string;
  steps: OrchestratedStep[];
  finalDeliverable: string;
  artifacts: { name: string; type: string; content: string }[];
  qaReport?: QAEvaluationReport;
  supervisorVerdict: SupervisorVerdict;
  handoffHistory: HandoffPackage[];
  auditChain: AuditEventBlock[];
  totalExecutionTimeMs: number;
  retriesUsed: number;
  error?: string;
}
