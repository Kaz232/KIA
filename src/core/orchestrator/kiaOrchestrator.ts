import {
  OrchestratorPlan,
  OrchestratedTask,
  DecomposedPlanStep,
  ToolExecutionContext,
  ExecutionState,
} from "../types";
import { CapabilityRegistry } from "../capabilities/capabilityRegistry";
import { AgentRegistry } from "../agents/agentRegistry";
import { SkillRegistry } from "../skills/skillRegistry";
import { ToolRegistry } from "../tools/toolRegistry";
import { PolicyManager } from "../policies/policyManager";
import { ExecutionEngine } from "../execution/executionEngine";
import { TaskOrchestrator } from "../tasks/taskOrchestrator";
import { MemoryManager } from "../memory/memoryManager";
import { HandoffManager } from "../handoff/handoffManager";

export interface KIAOrchestrationResult {
  planId: string;
  planSummary: string;
  createdTasks: OrchestratedTask[];
  executedTasksCount: number;
  overallStatus: "COMPLETED" | "PARTIALLY_COMPLETED" | "BLOCKED" | "FAILED";
  finalDeliverablesSummary: string;
  executionLogs: string[];
}

export class KIAOrchestrator {
  private static instance: KIAOrchestrator;

  private capabilityRegistry = CapabilityRegistry.getInstance();
  private agentRegistry = AgentRegistry.getInstance();
  private skillRegistry = SkillRegistry.getInstance();
  private toolRegistry = ToolRegistry.getInstance();
  private policyManager = PolicyManager.getInstance();
  private executionEngine = ExecutionEngine.getInstance();
  private taskOrchestrator = TaskOrchestrator.getInstance();
  private memoryManager = MemoryManager.getInstance();
  private handoffManager = HandoffManager.getInstance();

  public static getInstance(): KIAOrchestrator {
    if (!KIAOrchestrator.instance) {
      KIAOrchestrator.instance = new KIAOrchestrator();
    }
    return KIAOrchestrator.instance;
  }

  /**
   * Complete Autonomous Decision Flow:
   * PEDIDO -> ENTENDER -> PLANEAR -> DECOMPOR -> ESCOLHER AGENTE -> ESCOLHER SKILLS -> ESCOLHER TOOLS -> EXECUTAR -> VERIFICAR -> ENTREGAR -> CONTINUAR
   */
  public async orchestrateUserRequest(
    userGoal: string,
    context: ToolExecutionContext = {}
  ): Promise<KIAOrchestrationResult> {
    const logs: string[] = [];
    logs.push(`[KIA]: Pedido recebido -> "${userGoal}"`);

    // 1. ENTENDER & DECOMPOR (Decomposition)
    const decomposeSkill = this.skillRegistry.getSkill("skill_decompose_task");
    let rawSteps: any[] = [];
    if (decomposeSkill) {
      rawSteps = await decomposeSkill.handler({ goal: userGoal }, context);
    } else {
      rawSteps = [
        { step: 1, title: `Execução Direta: ${userGoal}`, agentId: "agent-consultant", skills: ["skill_brand_strategy"], deps: [] },
      ];
    }

    logs.push(`[KIA]: Objetivo decomposto em ${rawSteps.length} etapas estratégicas com dependências.`);

    const planId = `plan-${Date.now()}`;
    const createdTasks: OrchestratedTask[] = [];

    // 2. ESCOLHER AGENTES, SKILLS & FERRAMENTAS PARA CADA ETAPA
    for (let i = 0; i < rawSteps.length; i++) {
      const step = rawSteps[i];
      const taskId = `task-${planId}-${i + 1}`;
      const agent = this.agentRegistry.getAgent(step.agentId) || this.agentRegistry.getAgent("agent-kia")!;

      const depTaskIds: string[] = (step.deps || []).map((dIndex: number) => `task-${planId}-${dIndex}`);

      const task: OrchestratedTask = {
        id: taskId,
        objective: step.title,
        title: step.title,
        description: `Etapa ${i + 1} do plano '${userGoal}'. Atribuída ao especialista ${agent.name}.`,
        priority: i === 0 ? "HIGH" : "MEDIUM",
        agentId: agent.id,
        skillsRequired: step.skills || agent.allocatedSkillIds,
        toolsRequired: agent.allocatedToolIds,
        inputs: { goal: userGoal, parentPlanId: planId },
        dependencies: depTaskIds,
        expectedOutput: `Entregável validado de ${step.title}`,
        status: depTaskIds.length === 0 ? "IN_PROGRESS" : "BLOCKED",
        attempts: 0,
        maxAttempts: 3,
        category: "Estratégia & Operações",
        tags: ["GAG-AOS", "Orquestrado-KIA"],
        createdAt: new Date().toISOString(),
      };

      this.taskOrchestrator.addTask(task);
      createdTasks.push(task);
      logs.push(`[Supervisor]: Tarefa #${i + 1} ('${task.title}') criada para ${agent.name} (Estado: ${task.status}).`);
    }

    // 3. EXECUTAR -> VERIFICAR (QA) -> CONTINUAR LOOP AUTÔNOMO
    let executedCount = 0;
    let nextTask = this.taskOrchestrator.getNextExecutableTask();

    while (nextTask && executedCount < 10) {
      logs.push(`[Execution Engine]: A executar tarefa '${nextTask.title}' com o agente '${nextTask.agentId}'...`);
      nextTask.status = "IN_PROGRESS";

      const output = await this.executionEngine.executeTask(nextTask, context);

      if (output.status === "COMPLETED") {
        this.taskOrchestrator.updateTaskStatus(
          nextTask.id,
          "COMPLETED",
          output.deliverable,
          output.artifacts
        );
        logs.push(`[QA Agent]: Tarefa '${nextTask.title}' APROVADA (Score: ${output.qaEvaluation?.score || 100}/100). Status: COMPLETED.`);
        executedCount++;
      } else {
        this.taskOrchestrator.updateTaskStatus(
          nextTask.id,
          output.status,
          output.error || "Execução interrompida."
        );
        logs.push(`[Execution Engine]: Tarefa '${nextTask.title}' finalizou com estado: ${output.status}.`);
        break;
      }

      // Check next ready task
      nextTask = this.taskOrchestrator.getNextExecutableTask();
    }

    const allCompleted = createdTasks.every((t) => t.status === "COMPLETED");
    const summary = `Plano de execução concluído pela KIA Master Orchestrator com ${executedCount} tarefas finalizadas e verificadas pelo QA Inspector.`;

    return {
      planId,
      planSummary: summary,
      createdTasks,
      executedTasksCount: executedCount,
      overallStatus: allCompleted ? "COMPLETED" : "PARTIALLY_COMPLETED",
      finalDeliverablesSummary: summary,
      executionLogs: logs,
    };
  }
}
