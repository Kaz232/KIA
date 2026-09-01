import { Router } from "express";
import { executionEngine } from "../engine/executionEngine";
import { taskOrchestrator } from "../engine/taskOrchestrator";
import { agentSupervisor } from "../engine/agentSupervisor";
import { qaEngine } from "../engine/qaEngine";
import { auditEventManager } from "../engine/auditEventManager";
import { Phase1TestRunner } from "../engine/testRunner";

export const engineRouter = Router();

// 1. Health Status
engineRouter.get("/health", (_req, res) => {
  res.json({
    status: "HEALTHY",
    subsystem: "GAG Core Phase 1 Execution Engine",
    version: "1.2.0",
    timestamp: new Date().toISOString(),
    capabilities: [
      "DAG_ORCHESTRATION",
      "AGENT_SUPERVISOR_RBAC",
      "QA_RUBRIC_EVALUATION",
      "EXPONENTIAL_BACKOFF_RETRY",
      "DYNAMIC_HANDOFF",
      "SHA256_AUDIT_TRAIL",
    ],
  });
});

// 2. Execute Goal Pipeline (Phase 1 Engine)
engineRouter.post("/execute", async (req, res) => {
  try {
    const {
      goal,
      taskId,
      userId,
      userName,
      userRole = "OWNER",
      preferredAgentId = "gag-programmer-engineer",
      inputs = {},
      autonomyOverride,
      maxRetries = 2,
      skipQa = false,
    } = req.body;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ error: "Campo 'goal' é obrigatório." });
    }

    const result = await executionEngine.executePipeline({
      goal,
      taskId,
      userId,
      userName,
      userRole,
      preferredAgentId,
      inputs,
      autonomyOverride,
      maxRetries,
      skipQa,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Execution Engine Error:", err);
    return res.status(500).json({
      error: err.message || "Falha interna no Execution Engine",
    });
  }
});

// 3. Decompose & Orchestrate Goal
engineRouter.post("/orchestrate", async (req, res) => {
  try {
    const { goal, primaryAgentId = "kia" } = req.body;
    if (!goal) {
      return res.status(400).json({ error: "Goal is required" });
    }

    const steps = taskOrchestrator.decomposeGoal(goal, primaryAgentId);
    return res.json({
      success: true,
      steps,
      stepsCount: steps.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Agent Supervisor Evaluation
engineRouter.post("/supervise", async (req, res) => {
  try {
    const { agentId, userRole = "OWNER", goal, autonomyOverride, capability } = req.body;
    if (!agentId || !goal) {
      return res.status(400).json({ error: "agentId and goal are required" });
    }

    const verdict = agentSupervisor.evaluate({
      agentId,
      userRole,
      goal,
      autonomyOverride,
      capability,
    });

    return res.json(verdict);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. QA Engine Evaluation
engineRouter.post("/qa-evaluate", async (req, res) => {
  try {
    const { executionId, taskId, goal, agentId, deliverable, artifacts = [] } = req.body;
    if (!executionId || !goal || !deliverable) {
      return res.status(400).json({ error: "executionId, goal and deliverable are required" });
    }

    const qaReport = qaEngine.evaluate({
      executionId,
      taskId,
      goal,
      agentId: agentId || "agent-general",
      deliverable,
      artifacts,
    });

    return res.json(qaReport);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. SHA-256 Audit Trail
engineRouter.get("/audit-trail", (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const chain = auditEventManager.getGlobalChain(limit);
    const integrity = auditEventManager.verifyIntegrity();

    return res.json({
      integrity,
      chain,
      totalRecorded: chain.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Automated Phase 1 Test Suite
engineRouter.post("/test-suite", async (_req, res) => {
  try {
    const report = await Phase1TestRunner.runAllTests();
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Execution Status
engineRouter.get("/status/:id", (req, res) => {
  const trail = auditEventManager.getTrailForExecution(req.params.id);
  if (trail.length === 0) {
    return res.status(404).json({ error: "Execução não encontrada." });
  }
  return res.json({
    executionId: req.params.id,
    eventsCount: trail.length,
    latestState: trail[trail.length - 1]?.newState,
    trail,
  });
});
