import {
  ExecutionState,
  ToolExecutionContext,
  OrchestratedTask,
  QAEvaluation,
  AgentHandoff,
} from "../types";
import { CapabilityRegistry } from "../capabilities/capabilityRegistry";
import { AgentRegistry } from "../agents/agentRegistry";
import { SkillRegistry } from "../skills/skillRegistry";
import { ToolRegistry } from "../tools/toolRegistry";
import { PolicyManager } from "../policies/policyManager";
import { QAAgent } from "../qa/qaAgent";
import { HandoffManager } from "../handoff/handoffManager";
import { MemoryManager } from "../memory/memoryManager";
import { TaskOrchestrator } from "../tasks/taskOrchestrator";

export type TaskLifecycleEventType =
  | "TASK_QUEUED"
  | "TASK_STARTED"
  | "TASK_PROGRESS"
  | "TASK_COMPLETED"
  | "TASK_FAILED"
  | "TASK_BLOCKED"
  | "TASK_HANDOFF"
  | "TASK_APPROVAL_REQUIRED"
  | "TASK_RETRY"
  | "TASK_CANCELLED";

export interface TaskLifecycleEvent {
  taskId: string;
  type: TaskLifecycleEventType;
  previousState?: ExecutionState;
  newState: ExecutionState;
  agentId?: string;
  timestamp: string;
  message: string;
  metadata?: Record<string, any>;
}

export type TaskEventListener = (event: TaskLifecycleEvent) => void;

export interface ExecutionEngineOutput {
  status: ExecutionState;
  deliverable?: string;
  artifacts?: { name: string; type: string; content: string }[];
  qaEvaluation?: QAEvaluation;
  handoff?: { toAgentId: string; reason: string };
  error?: string;
  executionTimeMs: number;
  attemptsUsed: number;
}

export interface QueueExecutionSummary {
  totalProcessed: number;
  completedCount: number;
  failedCount: number;
  blockedCount: number;
  approvalRequiredCount: number;
  durationMs: number;
  results: Record<string, ExecutionEngineOutput>;
}

export interface EngineMetrics {
  tasksExecutedTotal: number;
  tasksCompletedTotal: number;
  tasksFailedTotal: number;
  averageExecutionTimeMs: number;
  activeExecutions: number;
}

/**
 * ExecutionEngine — Core Task Lifecycle & Execution Engine for GAG Core OS (AOS)
 * Manages the state machine, autonomy levels, skill execution pipeline, QA checks,
 * memory persistence and direct integration with TaskOrchestrator.
 */
export class ExecutionEngine {
  private static instance: ExecutionEngine;

  private capabilityRegistry = CapabilityRegistry.getInstance();
  private agentRegistry = AgentRegistry.getInstance();
  private skillRegistry = SkillRegistry.getInstance();
  private toolRegistry = ToolRegistry.getInstance();
  private policyManager = PolicyManager.getInstance();
  private qaAgent = QAAgent.getInstance();
  private handoffManager = HandoffManager.getInstance();
  private memoryManager = MemoryManager.getInstance();
  private taskOrchestrator = TaskOrchestrator.getInstance();

  private eventListeners: Set<TaskEventListener> = new Set();
  private metrics: EngineMetrics = {
    tasksExecutedTotal: 0,
    tasksCompletedTotal: 0,
    tasksFailedTotal: 0,
    averageExecutionTimeMs: 0,
    activeExecutions: 0,
  };

  private constructor() {}

  public static getInstance(): ExecutionEngine {
    if (!ExecutionEngine.instance) {
      ExecutionEngine.instance = new ExecutionEngine();
    }
    return ExecutionEngine.instance;
  }

  // --- Task State Machine Transitions ---

  private static VALID_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
    BLOCKED: ["IN_PROGRESS", "FAILED", "NOT_IMPLEMENTED", "OWNER_APPROVAL_REQUIRED"],
    IN_PROGRESS: ["COMPLETED", "FAILED", "BLOCKED", "HANDOFF", "NOT_IMPLEMENTED", "OWNER_APPROVAL_REQUIRED"],
    HANDOFF: ["IN_PROGRESS", "BLOCKED", "FAILED"],
    OWNER_APPROVAL_REQUIRED: ["IN_PROGRESS", "BLOCKED", "FAILED"],
    NOT_IMPLEMENTED: ["IN_PROGRESS", "FAILED"],
    COMPLETED: ["IN_PROGRESS"], // Allowed in case of manual retry or revision
    FAILED: ["IN_PROGRESS"],    // Allowed in case of retry
  };

  public canTransition(from: ExecutionState, to: ExecutionState): boolean {
    if (from === to) return true;
    const allowed = ExecutionEngine.VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  public transitionState(
    taskId: string,
    nextState: ExecutionState,
    reason?: string
  ): OrchestratedTask | undefined {
    const task = this.taskOrchestrator.getTask(taskId);
    if (!task) return undefined;

    const previousState = task.status;
    task.status = nextState;

    if (nextState === "IN_PROGRESS" && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if (nextState === "COMPLETED" || nextState === "FAILED") {
      task.completedAt = new Date().toISOString();
    }

    this.emitEvent({
      taskId,
      type: this.mapStateToEventType(nextState),
      previousState,
      newState: nextState,
      agentId: task.agentId,
      timestamp: new Date().toISOString(),
      message: reason || `Transição de estado para ${nextState}.`,
    });

    return task;
  }

  // --- Event Listener Subscriptions ---

  public addEventListener(listener: TaskEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(event: TaskLifecycleEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Erro no listener de evento do ExecutionEngine:", err);
      }
    });
  }

  private mapStateToEventType(state: ExecutionState): TaskLifecycleEventType {
    switch (state) {
      case "IN_PROGRESS":
        return "TASK_STARTED";
      case "COMPLETED":
        return "TASK_COMPLETED";
      case "FAILED":
        return "TASK_FAILED";
      case "BLOCKED":
        return "TASK_BLOCKED";
      case "HANDOFF":
        return "TASK_HANDOFF";
      case "OWNER_APPROVAL_REQUIRED":
        return "TASK_APPROVAL_REQUIRED";
      default:
        return "TASK_PROGRESS";
    }
  }

  // --- Task Execution Lifecycle ---

  /**
   * Executes a task identified by its ID using TaskOrchestrator.
   */
  public async executeTaskId(
    taskId: string,
    context: ToolExecutionContext = {}
  ): Promise<ExecutionEngineOutput> {
    const task = this.taskOrchestrator.getTask(taskId);
    if (!task) {
      return {
        status: "FAILED",
        error: `Tarefa com ID '${taskId}' não encontrada no TaskOrchestrator.`,
        executionTimeMs: 0,
        attemptsUsed: 0,
      };
    }
    return this.executeTask(task, context);
  }

  /**
   * Main Task Execution Engine:
   * Lifecycle: VALIDATE -> PERMISSIONS/AUTONOMY -> SKILLS RUN -> QA EVALUATE -> UPDATE MEMORY & ORCHESTRATOR
   */
  public async executeTask(
    task: OrchestratedTask,
    context: ToolExecutionContext = {}
  ): Promise<ExecutionEngineOutput> {
    const startTime = Date.now();
    this.metrics.activeExecutions++;
    task.attempts = (task.attempts || 0) + 1;

    // Transition to IN_PROGRESS
    this.taskOrchestrator.updateTaskStatus(task.id, "IN_PROGRESS");
    this.emitEvent({
      taskId: task.id,
      type: "TASK_STARTED",
      previousState: "BLOCKED",
      newState: "IN_PROGRESS",
      agentId: task.agentId,
      timestamp: new Date().toISOString(),
      message: `Iniciada execução da tarefa '${task.title}' com o agente '${task.agentId}'.`,
    });

    // 1. Agent Verification
    const agent = this.agentRegistry.getAgent(task.agentId);
    if (!agent) {
      const errorMsg = `Agente com ID '${task.agentId}' não registado no Agent Registry.`;
      this.finishExecution(task, "FAILED", startTime, errorMsg);
      return {
        status: "FAILED",
        error: errorMsg,
        executionTimeMs: Date.now() - startTime,
        attemptsUsed: task.attempts,
      };
    }

    // 2. Policy & Autonomy Verification
    const policyCheck = this.policyManager.checkActionPermission(
      task.category.toLowerCase(),
      context.userRole || "OWNER",
      0
    );
    if (!policyCheck.allowed) {
      const finalState: ExecutionState = policyCheck.requiresOwnerApproval
        ? "OWNER_APPROVAL_REQUIRED"
        : "BLOCKED";
      this.finishExecution(task, finalState, startTime, policyCheck.reason);
      return {
        status: finalState,
        error: policyCheck.reason,
        executionTimeMs: Date.now() - startTime,
        attemptsUsed: task.attempts,
      };
    }

    // 3. Skill & Capability Check
    const skillsToRun =
      task.skillsRequired && task.skillsRequired.length > 0
        ? task.skillsRequired
        : agent.allocatedSkillIds;

    if (!skillsToRun || skillsToRun.length === 0) {
      const errorMsg = `Nenhuma skill alocada para executar o objetivo: ${task.objective}`;
      this.finishExecution(task, "NOT_IMPLEMENTED", startTime, errorMsg);
      return {
        status: "NOT_IMPLEMENTED",
        error: errorMsg,
        executionTimeMs: Date.now() - startTime,
        attemptsUsed: task.attempts,
      };
    }

    let accumulatedOutput = "";
    const accumulatedArtifacts: { name: string; type: string; content: string }[] = [];

    // 4. Sequential Skill Execution Pipeline
    for (const skillId of skillsToRun) {
      const skill = this.skillRegistry.getSkill(skillId);
      if (!skill) {
        const errorMsg = `Capacidade/Skill '${skillId}' não implementada no Skill Registry.`;
        this.finishExecution(task, "NOT_IMPLEMENTED", startTime, errorMsg);
        return {
          status: "NOT_IMPLEMENTED",
          error: errorMsg,
          executionTimeMs: Date.now() - startTime,
          attemptsUsed: task.attempts,
        };
      }

      this.emitEvent({
        taskId: task.id,
        type: "TASK_PROGRESS",
        newState: "IN_PROGRESS",
        agentId: task.agentId,
        timestamp: new Date().toISOString(),
        message: `A executar skill '${skill.name}'...`,
        metadata: { skillId, skillCategory: skill.category },
      });

      try {
        const skillResult = await skill.handler(
          {
            ...task.inputs,
            title: task.title,
            description: task.description,
            goal: task.objective,
          },
          {
            ...context,
            taskId: task.id,
            agentId: task.agentId,
          }
        );

        if (typeof skillResult === "string") {
          accumulatedOutput += (accumulatedOutput ? "\n\n" : "") + skillResult;
        } else if (skillResult && typeof skillResult === "object") {
          if (skillResult.markdownReport) {
            accumulatedOutput += (accumulatedOutput ? "\n\n" : "") + skillResult.markdownReport;
          } else if (skillResult.formattedMarkdown) {
            accumulatedOutput += (accumulatedOutput ? "\n\n" : "") + skillResult.formattedMarkdown;
          } else if (skillResult.script) {
            accumulatedOutput +=
              (accumulatedOutput ? "\n\n" : "") + `### 🎬 Roteiro Audiovisual\n${skillResult.script}`;
          } else if (skillResult.tsxCode) {
            accumulatedOutput +=
              (accumulatedOutput ? "\n\n" : "") +
              `### 💻 Código UI/UX Entregue\n\`\`\`tsx\n${skillResult.tsxCode}\n\`\`\``;
            accumulatedArtifacts.push({
              name: "Component.tsx",
              type: "code",
              content: skillResult.tsxCode,
            });
          } else {
            accumulatedOutput +=
              (accumulatedOutput ? "\n\n" : "") + JSON.stringify(skillResult, null, 2);
          }
        }
      } catch (err: any) {
        const errorMsg = `Falha na execução da skill '${skill.name}': ${err.message}`;
        this.finishExecution(task, "FAILED", startTime, errorMsg);
        return {
          status: "FAILED",
          error: errorMsg,
          executionTimeMs: Date.now() - startTime,
          attemptsUsed: task.attempts,
        };
      }
    }

    if (!accumulatedOutput) {
      accumulatedOutput = `Entregável gerado por ${agent.name} para o objetivo: ${task.objective}.`;
    }

    // 5. Automated QA Verification
    const qaEvaluation = await this.qaAgent.evaluateDeliverable(
      task.title,
      accumulatedOutput,
      task.category,
      task.description
    );

    // 6. Memory Persistence & Cache
    this.memoryManager.cacheDeliverable(task.id, {
      output: accumulatedOutput,
      artifacts: accumulatedArtifacts,
      qa: qaEvaluation,
    });
    this.memoryManager.recordDecision(
      `Execução de Tarefa #${task.id} (${task.title})`,
      qaEvaluation.passed
        ? `Aprovado pelo QA com score ${qaEvaluation.score}/100.`
        : `Reprovado pelo QA: ${qaEvaluation.feedback}`
    );

    const finalStatus: ExecutionState = qaEvaluation.passed ? "COMPLETED" : "FAILED";

    // 7. Update TaskOrchestrator
    this.taskOrchestrator.updateTaskStatus(
      task.id,
      finalStatus,
      accumulatedOutput,
      accumulatedArtifacts
    );
    task.qaEvaluation = qaEvaluation;

    this.finishExecution(
      task,
      finalStatus,
      startTime,
      finalStatus === "COMPLETED" ? undefined : qaEvaluation.feedback
    );

    return {
      status: finalStatus,
      deliverable: accumulatedOutput,
      artifacts: accumulatedArtifacts,
      qaEvaluation,
      executionTimeMs: Date.now() - startTime,
      attemptsUsed: task.attempts,
    };
  }

  /**
   * Retries execution for a failed task if attempts <= maxAttempts.
   */
  public async retryTask(
    taskId: string,
    context: ToolExecutionContext = {}
  ): Promise<ExecutionEngineOutput> {
    const task = this.taskOrchestrator.getTask(taskId);
    if (!task) {
      return {
        status: "FAILED",
        error: `Tarefa '${taskId}' inexistente.`,
        executionTimeMs: 0,
        attemptsUsed: 0,
      };
    }

    if (task.attempts >= task.maxAttempts) {
      return {
        status: "FAILED",
        error: `Limite máximo de tentativas atingido (${task.maxAttempts}/${task.maxAttempts}).`,
        executionTimeMs: 0,
        attemptsUsed: task.attempts,
      };
    }

    this.emitEvent({
      taskId: task.id,
      type: "TASK_RETRY",
      newState: "IN_PROGRESS",
      agentId: task.agentId,
      timestamp: new Date().toISOString(),
      message: `Re-execução disparada (Tentativa ${task.attempts + 1}/${task.maxAttempts}).`,
    });

    return this.executeTask(task, context);
  }

  /**
   * Cancels a pending or in-progress task.
   */
  public cancelTask(taskId: string, reason = "Cancelada pelo utilizador."): OrchestratedTask | undefined {
    const task = this.taskOrchestrator.getTask(taskId);
    if (!task) return undefined;

    task.status = "FAILED";
    task.lastError = reason;
    task.completedAt = new Date().toISOString();

    this.emitEvent({
      taskId,
      type: "TASK_CANCELLED",
      newState: "FAILED",
      agentId: task.agentId,
      timestamp: new Date().toISOString(),
      message: reason,
    });

    return task;
  }

  /**
   * Runs all currently executable tasks in the queue until completion or limit reached.
   */
  public async runQueue(
    maxTasks = 20,
    context: ToolExecutionContext = {}
  ): Promise<QueueExecutionSummary> {
    const startTime = Date.now();
    let processed = 0;
    let completed = 0;
    let failed = 0;
    let blocked = 0;
    let approvalRequired = 0;
    const results: Record<string, ExecutionEngineOutput> = {};

    let nextTask = this.taskOrchestrator.getNextExecutableTask();

    while (nextTask && processed < maxTasks) {
      processed++;
      const res = await this.executeTask(nextTask, context);
      results[nextTask.id] = res;

      if (res.status === "COMPLETED") completed++;
      else if (res.status === "FAILED") failed++;
      else if (res.status === "BLOCKED") blocked++;
      else if (res.status === "OWNER_APPROVAL_REQUIRED") approvalRequired++;

      // Next ready task whose dependencies are satisfied
      nextTask = this.taskOrchestrator.getNextExecutableTask();
    }

    return {
      totalProcessed: processed,
      completedCount: completed,
      failedCount: failed,
      blockedCount: blocked,
      approvalRequiredCount: approvalRequired,
      durationMs: Date.now() - startTime,
      results,
    };
  }

  // --- Metrics & Lifecycle Helpers ---

  private finishExecution(
    task: OrchestratedTask,
    status: ExecutionState,
    startTime: number,
    errorMsg?: string
  ): void {
    const duration = Date.now() - startTime;
    this.metrics.activeExecutions = Math.max(0, this.metrics.activeExecutions - 1);
    this.metrics.tasksExecutedTotal++;

    if (status === "COMPLETED") {
      this.metrics.tasksCompletedTotal++;
    } else if (status === "FAILED") {
      this.metrics.tasksFailedTotal++;
      task.lastError = errorMsg;
    }

    // Update moving average for duration
    this.metrics.averageExecutionTimeMs = Math.round(
      (this.metrics.averageExecutionTimeMs * (this.metrics.tasksExecutedTotal - 1) + duration) /
        this.metrics.tasksExecutedTotal
    );

    this.emitEvent({
      taskId: task.id,
      type: this.mapStateToEventType(status),
      newState: status,
      agentId: task.agentId,
      timestamp: new Date().toISOString(),
      message: errorMsg || `Tarefa finalizada com estado ${status} em ${duration}ms.`,
      metadata: { durationMs: duration, attempts: task.attempts },
    });
  }

  public getEngineMetrics(): EngineMetrics {
    return { ...this.metrics };
  }
}

// Export default alias
export const Engine = ExecutionEngine;
