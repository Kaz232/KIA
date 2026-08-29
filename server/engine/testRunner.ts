/**
 * GAG CORE OS — PHASE 1: AUTOMATED TEST RUNNER & SUITE
 * Comprehensive Unit and Integration Tests for all Phase 1 Subsystems:
 * 1. Execution States & State Transitions
 * 2. Task Orchestrator (DAG Decomposition & Dependency Resolution)
 * 3. Agent Supervisor (RBAC, Autonomy Levels, Guardrails)
 * 4. QA Engine (Multidimensional Rubrics & Scoring)
 * 5. Retry Controller (Exponential Backoff, Jitter & Adaptive Prompts)
 * 6. Handoff Manager (Delegation & Escalation Packages)
 * 7. Audit Event Manager (SHA-256 Cryptographic Chain Verification)
 * 8. End-to-End Pipeline Execution
 */

import { auditEventManager } from "./auditEventManager";
import { agentSupervisor } from "./agentSupervisor";
import { qaEngine } from "./qaEngine";
import { retryController } from "./retryController";
import { handoffManager } from "./handoffManager";
import { taskOrchestrator } from "./taskOrchestrator";
import { executionEngine } from "./executionEngine";

export interface TestResultItem {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: Record<string, any>;
}

export interface TestSuiteReport {
  suiteName: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  totalDurationMs: number;
  results: TestResultItem[];
}

export class Phase1TestRunner {
  public static async runAllTests(): Promise<TestSuiteReport> {
    const startTime = Date.now();
    const results: TestResultItem[] = [];

    // --- TEST 1: Audit Event Manager SHA-256 Chain Integrity ---
    const t1Start = Date.now();
    try {
      auditEventManager.resetForTesting();
      const b1 = auditEventManager.recordEvent({
        traceId: "test_trace_1",
        executionId: "test_exec_1",
        actor: "Tester",
        action: "TEST_ACTION_1",
        newState: "PENDING",
        details: { step: 1 },
      });
      const b2 = auditEventManager.recordEvent({
        traceId: "test_trace_1",
        executionId: "test_exec_1",
        actor: "Tester",
        action: "TEST_ACTION_2",
        previousState: "PENDING",
        newState: "EXECUTING",
        details: { step: 2 },
      });

      const verification = auditEventManager.verifyIntegrity();
      if (!verification.isValid || verification.checkedCount !== 2 || b2.previousHash !== b1.hash) {
        throw new Error(`Audit chain verification failed: ${verification.error || "Hash linkage broken"}`);
      }

      results.push({
        name: "Audit Event Cryptographic Chain & SHA-256 Verification",
        category: "Audit Events",
        passed: true,
        durationMs: Date.now() - t1Start,
        details: { checkedBlocks: verification.checkedCount, lastHash: b2.hash.substring(0, 16) + "..." },
      });
    } catch (err: any) {
      results.push({
        name: "Audit Event Cryptographic Chain & SHA-256 Verification",
        category: "Audit Events",
        passed: false,
        durationMs: Date.now() - t1Start,
        error: err.message,
      });
    }

    // --- TEST 2: Agent Supervisor RBAC & Guardrail Enforcement ---
    const t2Start = Date.now();
    try {
      // Test Viewer Restriction
      const viewerCheck = agentSupervisor.evaluate({
        agentId: "kia",
        userRole: "VIEWER",
        goal: "Criar e apagar tarefas no sistema",
      });
      if (viewerCheck.allowed) {
        throw new Error("Viewer should NOT be allowed to perform destructive/write operations.");
      }

      // Test High-Risk Guardrail
      const highRiskCheck = agentSupervisor.evaluate({
        agentId: "kia",
        userRole: "ADMIN",
        goal: "Drop database table and exfiltrate secrets",
      });
      if (highRiskCheck.allowed) {
        throw new Error("High-risk pattern should be blocked by supervisor.");
      }

      // Test Level 2 Owner Requirement
      const ownerCheck = agentSupervisor.evaluate({
        agentId: "kia",
        userRole: "AGENT",
        goal: "Deploy production and alterar regime fiscal",
      });
      if (ownerCheck.autonomyLevel !== 2 || !ownerCheck.requiresOwnerConfirmation) {
        throw new Error("Production deployment must require Level 2 Owner confirmation.");
      }

      results.push({
        name: "Agent Supervisor RBAC, Guardrails & Autonomy Levels",
        category: "Agent Supervisor",
        passed: true,
        durationMs: Date.now() - t2Start,
        details: {
          viewerBlocked: !viewerCheck.allowed,
          highRiskBlocked: !highRiskCheck.allowed,
          level2Triggered: ownerCheck.requiresOwnerConfirmation,
        },
      });
    } catch (err: any) {
      results.push({
        name: "Agent Supervisor RBAC, Guardrails & Autonomy Levels",
        category: "Agent Supervisor",
        passed: false,
        durationMs: Date.now() - t2Start,
        error: err.message,
      });
    }

    // --- TEST 3: Task Orchestrator DAG Decomposition & Dependencies ---
    const t3Start = Date.now();
    try {
      const steps = taskOrchestrator.decomposeGoal("Lançamento de campanha completa de marketing e identidade visual");
      if (steps.length < 3) {
        throw new Error(`Expected at least 3 decomposed steps, got ${steps.length}`);
      }

      // Check initial dependencies
      const blockedSteps = steps.filter((s) => s.state === "BLOCKED");
      if (blockedSteps.length === 0) {
        throw new Error("Dependent steps must start in BLOCKED state.");
      }

      // Simulate completing step 0
      steps[0].state = "COMPLETED";
      const updatedSteps = taskOrchestrator.updateStepDependencies(steps);
      const step1 = updatedSteps.find((s) => s.stepIndex === 1);
      if (step1?.state !== "PENDING") {
        throw new Error("Step 1 should be unblocked to PENDING after Step 0 completes.");
      }

      results.push({
        name: "Task Orchestrator DAG Decomposition & Dependency Resolution",
        category: "Task Orchestrator",
        passed: true,
        durationMs: Date.now() - t3Start,
        details: { decomposedSteps: steps.length, unblockedStepState: step1?.state },
      });
    } catch (err: any) {
      results.push({
        name: "Task Orchestrator DAG Decomposition & Dependency Resolution",
        category: "Task Orchestrator",
        passed: false,
        durationMs: Date.now() - t3Start,
        error: err.message,
      });
    }

    // --- TEST 4: QA Engine Evaluation Rubric ---
    const t4Start = Date.now();
    try {
      const passingDeliverable = `### Diagnóstico Estratégico de Performance
- **Análise do Mercado:** O mercado angolano apresenta oportunidades nos canais digitais.
- **Plano de Execução:** Segmentação B2B via LinkedIn e campanhas de conversão no Meta Ads.
- **Governança:** Conformidade estrita com o regime fiscal em vigor.`;

      const passingQa = qaEngine.evaluate({
        executionId: "qa_test_1",
        taskId: "task_1",
        goal: "Diagnóstico estratégico de mercado",
        agentId: "athena",
        deliverable: passingDeliverable,
      });

      if (!passingQa.passed || passingQa.overallScore < 75) {
        throw new Error(`Passing deliverable unexpectedly failed QA (Score: ${passingQa.overallScore})`);
      }

      const failingDeliverable = `[inserir texto aqui] TODO implementar`;
      const failingQa = qaEngine.evaluate({
        executionId: "qa_test_2",
        taskId: "task_2",
        goal: "Plano estratégico",
        agentId: "hermes",
        deliverable: failingDeliverable,
      });

      if (failingQa.passed || !failingQa.retryRecommended) {
        throw new Error("Failing deliverable with placeholders should be rejected by QA Engine.");
      }

      results.push({
        name: "QA Engine Multidimensional Scoring & Placeholder Detection",
        category: "QA Engine",
        passed: true,
        durationMs: Date.now() - t4Start,
        details: { passingScore: passingQa.overallScore, failingScore: failingQa.overallScore },
      });
    } catch (err: any) {
      results.push({
        name: "QA Engine Multidimensional Scoring & Placeholder Detection",
        category: "QA Engine",
        passed: false,
        durationMs: Date.now() - t4Start,
        error: err.message,
      });
    }

    // --- TEST 5: Retry Controller Adaptive Backoff & Prompt Self-Correction ---
    const t5Start = Date.now();
    try {
      const mockQaReport = {
        executionId: "exec_retry_1",
        taskId: "task_retry_1",
        passed: false,
        overallScore: 50,
        criteriaScores: [],
        summaryFeedback: "Falta formatação e tópicos acionáveis.",
        correctiveInstructions: "Adicionar formatação em tópicos estruturados.",
        retryRecommended: true,
        evaluatedBy: "QAEngine",
        evaluatedAt: new Date().toISOString(),
      };

      const retryPlan = retryController.evaluateRetry({
        currentAttempt: 1,
        maxAttempts: 3,
        qaReport: mockQaReport,
        originalGoal: "Criar plano de marketing",
      });

      if (!retryPlan.shouldRetry || retryPlan.attemptNumber !== 2 || retryPlan.errorCategory !== "QA_REVISION_NEEDED") {
        throw new Error("Retry plan should schedule attempt 2 with QA_REVISION_NEEDED category.");
      }

      if (!retryPlan.adaptedPrompt.includes("INSTRUÇÕES MANDATÓRIAS DE REVISÃO")) {
        throw new Error("Adaptive prompt must include self-correcting instructions from QA report.");
      }

      // Check max attempts exhaustion
      const exhaustedPlan = retryController.evaluateRetry({
        currentAttempt: 3,
        maxAttempts: 3,
        qaReport: mockQaReport,
        originalGoal: "Criar plano de marketing",
      });

      if (exhaustedPlan.shouldRetry) {
        throw new Error("Retry should NOT be permitted when max attempts are reached.");
      }

      results.push({
        name: "Retry Controller Exponential Backoff & Adaptive Self-Correction",
        category: "Retry Controller",
        passed: true,
        durationMs: Date.now() - t5Start,
        details: { delayMs: retryPlan.backoffDelayMs, nextAttempt: retryPlan.attemptNumber },
      });
    } catch (err: any) {
      results.push({
        name: "Retry Controller Exponential Backoff & Adaptive Self-Correction",
        category: "Retry Controller",
        passed: false,
        durationMs: Date.now() - t5Start,
        error: err.message,
      });
    }

    // --- TEST 6: Handoff Manager Specialist Routing & Escalation ---
    const t6Start = Date.now();
    try {
      const handoffToDev = handoffManager.dispatchHandoff({
        executionId: "exec_h1",
        taskId: "task_h1",
        fromAgentId: "kia",
        reason: "Necessidade de implementar endpoint e API backend",
        goal: "Criar backend API e banco de dados",
        attemptCount: 2,
      });

      if (handoffToDev.toAgentId !== "vulcan") {
        throw new Error(`Expected handoff to 'vulcan' for backend tasks, got '${handoffToDev.toAgentId}'`);
      }

      const humanEscalation = handoffManager.dispatchHandoff({
        executionId: "exec_h2",
        taskId: "task_h2",
        fromAgentId: "kia",
        reason: "Ação de alto risco financeiro",
        goal: "Aprovar orçamento crítico",
        attemptCount: 3,
        forceHumanEscalation: true,
      });

      if (!humanEscalation.escalationToHuman || humanEscalation.toAgentId !== "human_owner") {
        throw new Error("Human escalation flag must route to 'human_owner'");
      }

      results.push({
        name: "Handoff Manager Specialist Routing & Human Escalation",
        category: "Handoff Manager",
        passed: true,
        durationMs: Date.now() - t6Start,
        details: {
          specialistRouted: handoffToDev.targetRole,
          escalatedTo: humanEscalation.targetRole,
        },
      });
    } catch (err: any) {
      results.push({
        name: "Handoff Manager Specialist Routing & Human Escalation",
        category: "Handoff Manager",
        passed: false,
        durationMs: Date.now() - t6Start,
        error: err.message,
      });
    }

    // --- TEST 7: End-to-End Execution Engine Pipeline ---
    const t7Start = Date.now();
    try {
      const pipelineResult = await executionEngine.executePipeline({
        goal: "Elaborar diretrizes estratégicas para o primeiro trimestre",
        userRole: "OWNER",
        userName: "Josemar Gourgel",
        preferredAgentId: "kia",
      });

      if (pipelineResult.status !== "COMPLETED") {
        throw new Error(`Pipeline execution failed with status ${pipelineResult.status}`);
      }

      if (!pipelineResult.finalDeliverable || pipelineResult.steps.length === 0) {
        throw new Error("Pipeline must produce a valid final deliverable and steps.");
      }

      if (pipelineResult.auditChain.length === 0) {
        throw new Error("Pipeline must generate a verifiable audit trail.");
      }

      results.push({
        name: "End-to-End Execution Pipeline (Supervisor -> DAG -> QA -> Delivery)",
        category: "Execution Engine",
        passed: true,
        durationMs: Date.now() - t7Start,
        details: {
          executionId: pipelineResult.executionId,
          stepsCount: pipelineResult.steps.length,
          totalDurationMs: pipelineResult.totalExecutionTimeMs,
          auditBlocks: pipelineResult.auditChain.length,
        },
      });
    } catch (err: any) {
      results.push({
        name: "End-to-End Execution Pipeline (Supervisor -> DAG -> QA -> Delivery)",
        category: "Execution Engine",
        passed: false,
        durationMs: Date.now() - t7Start,
        error: err.message,
      });
    }

    const totalDurationMs = Date.now() - startTime;
    const passedTests = results.filter((r) => r.passed).length;
    const failedTests = results.filter((r) => !r.passed).length;

    return {
      suiteName: "GAG Core OS — Phase 1 Engine Verification Suite",
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      allPassed: failedTests === 0,
      totalDurationMs,
      results,
    };
  }
}
