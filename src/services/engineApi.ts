/**
 * GAG CORE OS — PHASE 1: ENGINE API CLIENT SERVICE
 * Connects frontend state and AppContext to the Phase 1 backend Execution Engine,
 * Task Orchestrator, Agent Supervisor, QA Engine, Retry Controller, Handoff Manager, and Audit Trail.
 */

export interface Phase1ExecutionRequest {
  goal: string;
  taskId?: string;
  userId?: string;
  userName?: string;
  userRole?: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  preferredAgentId?: string;
  inputs?: Record<string, any>;
  autonomyOverride?: 0 | 1 | 2;
  maxRetries?: number;
  skipQa?: boolean;
}

export interface Phase1Step {
  stepIndex: number;
  stepId: string;
  title: string;
  objective: string;
  targetAgentId: string;
  targetAgentName: string;
  requiredSkills: string[];
  dependencies: number[];
  inputPayload: Record<string, any>;
  state: string;
  output?: string;
  artifacts?: { name: string; type: string; content: string }[];
  qaReport?: any;
  retryAttempts: number;
  executionTimeMs?: number;
}

export interface Phase1ExecutionResponse {
  executionId: string;
  traceId: string;
  goal: string;
  status: string;
  primaryAgentId: string;
  steps: Phase1Step[];
  finalDeliverable: string;
  artifacts: { name: string; type: string; content: string }[];
  qaReport?: any;
  supervisorVerdict: {
    allowed: boolean;
    autonomyLevel: 0 | 1 | 2;
    requiredRole: string;
    requiresOwnerConfirmation: boolean;
    violations: string[];
    guardrailFlags: string[];
    maxAllowedTokens?: number;
    timeoutMs: number;
    timestamp: string;
  };
  handoffHistory: any[];
  auditChain: any[];
  totalExecutionTimeMs: number;
  retriesUsed: number;
  error?: string;
}

export interface TestSuiteResponse {
  suiteName: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  totalDurationMs: number;
  results: {
    name: string;
    category: string;
    passed: boolean;
    durationMs: number;
    error?: string;
    details?: Record<string, any>;
  }[];
}

class EngineApiService {
  private baseUrl = "/api/engine";

  /**
   * Health status of Engine Subsystem
   */
  public async getHealth(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error("Failed to fetch engine health");
    return res.json();
  }

  /**
   * Executes a complete goal via the Execution Engine pipeline
   */
  public async executePipeline(request: Phase1ExecutionRequest): Promise<Phase1ExecutionResponse> {
    const res = await fetch(`${this.baseUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro na chamada do Execution Engine" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  /**
   * Decomposes a goal into an execution DAG
   */
  public async orchestrateGoal(goal: string, primaryAgentId = "kia"): Promise<{ steps: Phase1Step[]; stepsCount: number }> {
    const res = await fetch(`${this.baseUrl}/orchestrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, primaryAgentId }),
    });

    if (!res.ok) throw new Error("Failed to orchestrate goal");
    return res.json();
  }

  /**
   * Evaluates supervisor policy for an action/goal
   */
  public async superviseCheck(params: {
    agentId: string;
    userRole: string;
    goal: string;
    autonomyOverride?: number;
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/supervise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("Failed to perform supervisor check");
    return res.json();
  }

  /**
   * Evaluates content with the QA Engine
   */
  public async evaluateQA(params: {
    executionId: string;
    taskId: string;
    goal: string;
    agentId: string;
    deliverable: string;
    artifacts?: any[];
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/qa-evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("Failed to perform QA evaluation");
    return res.json();
  }

  /**
   * Retrieves the global audit chain and its cryptographic integrity status
   */
  public async getAuditTrail(limit = 50): Promise<{ integrity: { isValid: boolean; checkedCount: number }; chain: any[] }> {
    const res = await fetch(`${this.baseUrl}/audit-trail?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch audit trail");
    return res.json();
  }

  /**
   * Runs the automated Phase 1 test suite
   */
  public async runTestSuite(): Promise<TestSuiteResponse> {
    const res = await fetch(`${this.baseUrl}/test-suite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to run Phase 1 test suite");
    return res.json();
  }
}

export const engineApi = new EngineApiService();
