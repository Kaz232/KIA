/**
 * GAG CORE OS — FASE 1 & FASE 2: EXECUTION TYPES
 * Canonical TypeScript types for the autonomous Execution Engine, Task Orchestration,
 * Agent Supervision, QA Evaluation, Retry Management, Handoffs, Registries and Audit Trails.
 */

import { ExecutionState } from "./executionState";
import { RiskLevel } from "../registry/skillTypes";

export type { ExecutionState };
export type { RiskLevel };

export type UserRole = "OWNER" | "ADMIN" | "AGENT" | "VIEWER";

export type QAScoreCategory = "REJECT" | "NEEDS_REVIEW" | "PASS" | "EXCELLENT";

export interface Artifact {
  id: string;
  title: string;
  type: "DOCUMENT" | "CODE" | "IMAGE_PROMPT" | "VIDEO_PROMPT" | "DATA" | "CONFIG" | "REPORT" | "OTHER";
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface QAResult {
  passed: boolean;
  score: number; // 0 - 100
  category: QAScoreCategory;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  requiresRetry: boolean;
  requiresOwnerApproval: boolean;
  evaluatedBy: string;
  evaluatedAt: string;
  executionId: string;
  stepId?: string;
}

export interface RetryAttempt {
  attemptNumber: number; // 1, 2, 3
  maxAttempts: number;
  agentId: string;
  reason: string;
  error?: string;
  timestamp: string;
  adaptedPrompt?: string;
}

export interface HandoffRecord {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  targetAgentName?: string;
  taskId: string;
  executionId: string;
  reason: string;
  input: any;
  previousOutput?: string;
  artifacts?: Artifact[];
  timestamp: string;
  handoffDepth: number;
}

export interface ExecutionStep {
  id: string;
  stepIndex: number;
  title: string;
  description: string;
  assignedAgentId: string;
  assignedAgentName: string;
  requiredCapabilities: string[];
  requiredSkills: string[];
  requiredTools: string[];
  recommendedAgent?: string;
  riskLevel: RiskLevel;
  dependencies: string[]; // step IDs that must complete first
  isParallelAllowed: boolean;
  input: Record<string, any>;
  state: ExecutionState;
  output?: string;
  artifacts?: Artifact[];
  qaResult?: QAResult;
  retries: RetryAttempt[];
  handoffs: HandoffRecord[];
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface ExecutionContext {
  executionId: string;
  traceId: string;
  goal: string;
  userId?: string;
  userName?: string;
  userRole: UserRole;
  autonomyLevel: 0 | 1 | 2;
  initialAgentId: string;
  currentAgentId: string;
  selectedCapabilities?: string[];
  selectedSkills?: string[];
  selectedTools?: string[];
  maxRetries: number;
  maxHandoffs: number;
  handoffHistory: string[]; // list of agentIds to detect loops: [A, B, A, B]
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionResult {
  executionId: string;
  traceId: string;
  goal: string;
  state: ExecutionState;
  primaryAgentId: string;
  selectedCapabilities: string[];
  selectedSkills: string[];
  selectedTools: string[];
  steps: ExecutionStep[];
  finalOutput: string;
  artifacts: Artifact[];
  qaResult?: QAResult;
  retriesTotal: number;
  handoffsTotal: number;
  requiresOwnerApproval: boolean;
  ownerApprovalReason?: string;
  auditEvents: EngineAuditEvent[];
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  error?: string;
}

export interface ExecutionRun {
  id: string;
  context: ExecutionContext;
  state: ExecutionState;
  steps: ExecutionStep[];
  currentStepIndex: number;
  auditTrail: EngineAuditEvent[];
  result?: ExecutionResult;
  isPaused: boolean;
  isCancelled: boolean;
}

export type EngineAuditEventType =
  | "EXECUTION_STARTED"
  | "CAPABILITY_RESOLVED"
  | "SKILL_SELECTED"
  | "TOOL_SELECTED"
  | "TASK_ASSIGNED"
  | "AGENT_STARTED"
  | "AGENT_COMPLETED"
  | "SKILL_EXECUTION_STARTED"
  | "SKILL_EXECUTION_COMPLETED"
  | "TOOL_EXECUTION_STARTED"
  | "TOOL_EXECUTION_COMPLETED"
  | "TOOL_EXECUTION_FAILED"
  | "CAPABILITY_VALIDATION_FAILED"
  | "QA_STARTED"
  | "QA_PASSED"
  | "QA_FAILED"
  | "RETRY_STARTED"
  | "HANDOFF_STARTED"
  | "HANDOFF_COMPLETED"
  | "OWNER_APPROVAL_REQUIRED"
  | "EXECUTION_COMPLETED"
  | "EXECUTION_FAILED"
  | "EXECUTION_CANCELLED";

export interface EngineAuditEvent {
  id: string;
  index: number;
  timestamp: string;
  type: EngineAuditEventType;
  executionId: string;
  stepId?: string;
  agentId?: string;
  previousState?: ExecutionState;
  newState: ExecutionState;
  details: string;
  metadata?: Record<string, any>;
  previousHash: string;
  hash: string;
}

export interface AgentSupervisorCheck {
  allowed: boolean;
  agentId: string;
  agentName: string;
  isAvailable: boolean;
  matchedCapabilities: string[];
  matchedSkills: string[];
  matchedTools: string[];
  riskLevel: RiskLevel;
  requiresOwnerApproval: boolean;
  approvalReason?: string;
  reason?: string;
}

export interface OrchestrationPlan {
  goal: string;
  primaryAgentId: string;
  steps: ExecutionStep[];
  isSequential: boolean;
  totalSteps: number;
  resolvedCapabilities?: string[];
  resolvedSkills?: string[];
  resolvedTools?: string[];
}
