/**
 * GAG CORE OS — KIA
 * EXECUTION ENGINE TYPES
 *
 * Phase:
 * - Execution
 * - Orchestration
 * - Autonomy
 * - Capabilities
 * - QA
 * - Retry
 * - Handoff
 * - Audit
 * - Artifact Storage
 */

import type { ArtifactRecord } from "../artifacts/artifactTypes";

/* =========================================================
 * EXECUTION STATES
 * ======================================================= */

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

/* =========================================================
 * AUTONOMY
 * ======================================================= */

export type AutonomyLevel = 0 | 1 | 2;

/**
 * Level 0
 * Automatic execution.
 *
 * Level 1
 * Internal supervision by KIA Supervisor + QA.
 *
 * Level 2
 * Explicit OWNER confirmation.
 */

export interface SupervisorVerdict {
  allowed: boolean;

  autonomyLevel: AutonomyLevel;

  requiredRole:
    | "OWNER"
    | "ADMIN"
    | "AGENT"
    | "VIEWER";

  requiresOwnerConfirmation: boolean;

  violations: string[];

  guardrailFlags: string[];

  maxAllowedTokens?: number;

  timeoutMs: number;

  timestamp: string;
}

/* =========================================================
 * CAPABILITIES
 * ======================================================= */

export type AgentCapability =
  | "READ"
  | "WRITE"
  | "EDIT"
  | "CORRECT"
  | "REVIEW"
  | "SEND"
  | "RUN_TESTS"
  | "READ_CODE"
  | "WRITE_CODE"
  | "EDIT_CODE"
  | "DEPLOY";

export interface CapabilityPolicy {
  allowed: AgentCapability[];

  denied: AgentCapability[];

  ownerOnly: AgentCapability[];
}

export interface CapabilityCheck {
  agentId: string;

  capability: AgentCapability;

  allowed: boolean;

  reason: string;
}

/* =========================================================
 * QA
 * ======================================================= */

export interface QACriteriaScore {
  criterion: string;

  weight: number;

  score: number;

  passed: boolean;

  notes?: string;
}

export interface QAEvaluationReport {
  executionId: string;

  taskId: string;

  passed: boolean;

  overallScore: number;

  criteriaScores: QACriteriaScore[];

  summaryFeedback: string;

  correctiveInstructions?: string;

  retryRecommended: boolean;

  evaluatedBy: string;

  evaluatedAt: string;
}

/* =========================================================
 * RETRY
 * ======================================================= */

export interface RetryPlan {
  shouldRetry: boolean;

  attemptNumber: number;

  maxAttempts: number;

  backoffDelayMs: number;

  errorCategory:
    | "TRANSIENT_NETWORK"
    | "RATE_LIMIT"
    | "TIMEOUT"
    | "QA_REVISION_NEEDED"
    | "PERMISSION_DENIED"
    | "FATAL_LOGIC";

  adaptedPrompt: string;

  reason: string;
}

/* =========================================================
 * HANDOFF
 * ======================================================= */

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

    collectedArtifacts: ArtifactRecord[];
  };

  escalationToHuman: boolean;

  timestamp: string;
}

/* =========================================================
 * AUDIT
 * ======================================================= */

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

/* =========================================================
 * ORCHESTRATION
 * ======================================================= */

export interface OrchestratedStep {
  stepIndex: number;

  stepId: string;

  title: string;

  objective: string;

  targetAgentId: string;

  targetAgentName: string;

  requiredSkills: string[];

  dependencies: number[];

  inputPayload: Record<string, any>;

  state: Phase1ExecutionState;

  output?: string;

  artifacts?: ArtifactRecord[];

  qaReport?: QAEvaluationReport;

  retryAttempts: number;

  executionTimeMs?: number;
}

/* =========================================================
 * EXECUTION REQUEST
 * ======================================================= */

export interface ExecutionPipelineRequest {
  goal: string;

  taskId?: string;

  userId?: string;

  userName?: string;

  userRole?:
    | "OWNER"
    | "ADMIN"
    | "AGENT"
    | "VIEWER";

  preferredAgentId?: string;

  inputs?: Record<string, any>;

  autonomyOverride?: AutonomyLevel;

  maxRetries?: number;

  skipQa?: boolean;
}

/* =========================================================
 * EXECUTION RESULT
 * ======================================================= */

export interface ExecutionPipelineResult {
  executionId: string;

  traceId: string;

  goal: string;

  status: Phase1ExecutionState;

  primaryAgentId: string;

  steps: OrchestratedStep[];

  finalDeliverable: string;

  artifacts: ArtifactRecord[];

  qaReport?: QAEvaluationReport;

  supervisorVerdict: SupervisorVerdict;

  handoffHistory: HandoffPackage[];

  auditChain: AuditEventBlock[];

  totalExecutionTimeMs: number;

  retriesUsed: number;

  error?: string;
}
