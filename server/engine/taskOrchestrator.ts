/**
 * GAG CORE OS — PHASE 1: TASK ORCHESTRATOR
 * Decomposes high-level objectives into Directed Acyclic Graphs (DAG),
 * assigns specialized agents, manages dependencies, and tracks step execution states.
 */

import { OrchestratedStep, Phase1ExecutionState } from "./types";

export class TaskOrchestrator {
  private static instance: TaskOrchestrator;

  private constructor() {}

  public static getInstance(): TaskOrchestrator {
    if (!TaskOrchestrator.instance) {
      TaskOrchestrator.instance = new TaskOrchestrator();
    }
    return TaskOrchestrator.instance;
  }

  /**
   * Decomposes a user goal into an ordered sequence of executable subtask steps
   */
  public decomposeGoal(goal: string, primaryAgentId = "kia"): OrchestratedStep[] {
    const cleanGoal = goal.trim();
    const gLower = cleanGoal.toLowerCase();

    // Strategy 1: Multi-agent Strategy / Synergy Goal
    if (gLower.includes("campanha") || gLower.includes("lançamento") || gLower.includes("estratégia") || gLower.includes("projeto completo")) {
      return [
        {
          stepIndex: 0,
          stepId: `step_0_${Date.now()}`,
          title: "Diagnóstico e Inteligência Competitiva",
          objective: `Realizar levantamento estratégico e mapeamento de premissas para: ${cleanGoal}`,
          targetAgentId: "athena",
          targetAgentName: "Athena (Research)",
          requiredSkills: ["skill_market_intelligence", "skill_data_analytics"],
          dependencies: [],
          inputPayload: { goal: cleanGoal, phase: "intelligence" },
          state: "PENDING",
          retryAttempts: 0,
        },
        {
          stepIndex: 1,
          stepId: `step_1_${Date.now()}`,
          title: "Desenvolvimento de Comunicação e Copywriting",
          objective: `Elaborar plano de canais, mensagens-chave e copy de conversão baseado no diagnóstico inicial.`,
          targetAgentId: "hermes",
          targetAgentName: "Hermes (Marketing)",
          requiredSkills: ["skill_copywriting", "skill_campaign_architect"],
          dependencies: [0],
          inputPayload: { goal: cleanGoal, phase: "marketing" },
          state: "BLOCKED",
          retryAttempts: 0,
        },
        {
          stepIndex: 2,
          stepId: `step_2_${Date.now()}`,
          title: "Identidade Visual e Assets Criativos",
          objective: `Criar diretrizes visuais e especificações de design de suporte à estratégia.`,
          targetAgentId: "davinci",
          targetAgentName: "DaVinci (Creative)",
          requiredSkills: ["skill_brand_design", "skill_ui_ux"],
          dependencies: [1],
          inputPayload: { goal: cleanGoal, phase: "creative" },
          state: "BLOCKED",
          retryAttempts: 0,
        },
        {
          stepIndex: 3,
          stepId: `step_3_${Date.now()}`,
          title: "Consolidação e Síntese Executiva KIA",
          objective: `Reunir todos os entregáveis num relatório executivo acionável para Josemar Gourgel.`,
          targetAgentId: "kia",
          targetAgentName: "KIA (Master Orchestrator)",
          requiredSkills: ["skill_executive_synthesis", "skill_task_orchestrator"],
          dependencies: [0, 1, 2],
          inputPayload: { goal: cleanGoal, phase: "synthesis" },
          state: "BLOCKED",
          retryAttempts: 0,
        },
      ];
    }

    // Strategy 2: Technical / Software / System Goal
    if (gLower.includes("código") || gLower.includes("api") || gLower.includes("backend") || gLower.includes("database") || gLower.includes("implementar")) {
      return [
        {
          stepIndex: 0,
          stepId: `step_0_${Date.now()}`,
          title: "Arquitetura e Especificação Técnica",
          objective: `Definir arquitetura, contratos de API e modelos de dados para: ${cleanGoal}`,
          targetAgentId: "vulcan",
          targetAgentName: "Vulcan (Engineering Lead)",
          requiredSkills: ["skill_architecture", "skill_code_gen"],
          dependencies: [],
          inputPayload: { goal: cleanGoal, phase: "architecture" },
          state: "PENDING",
          retryAttempts: 0,
        },
        {
          stepIndex: 1,
          stepId: `step_1_${Date.now()}`,
          title: "Auditoria de Segurança e Conformidade",
          objective: `Validar segurança, integridade de tokens e RBAC para a arquitetura proposta.`,
          targetAgentId: "cypher",
          targetAgentName: "Cypher (Security Lead)",
          requiredSkills: ["skill_security_audit", "skill_policy_verification"],
          dependencies: [0],
          inputPayload: { goal: cleanGoal, phase: "security" },
          state: "BLOCKED",
          retryAttempts: 0,
        },
        {
          stepIndex: 2,
          stepId: `step_2_${Date.now()}`,
          title: "Validação Final e Entrega",
          objective: `Consolidar entrega com testes e documentação de suporte.`,
          targetAgentId: "kia",
          targetAgentName: "KIA (Master Orchestrator)",
          requiredSkills: ["skill_qa_audit"],
          dependencies: [0, 1],
          inputPayload: { goal: cleanGoal, phase: "final_delivery" },
          state: "BLOCKED",
          retryAttempts: 0,
        },
      ];
    }

    // Default: Single Direct Step with Primary Agent
    return [
      {
        stepIndex: 0,
        stepId: `step_0_${Date.now()}`,
        title: cleanGoal.length > 50 ? cleanGoal.slice(0, 50) + "..." : cleanGoal,
        objective: cleanGoal,
        targetAgentId: primaryAgentId || "kia",
        targetAgentName: primaryAgentId === "vulcan" ? "Vulcan" : primaryAgentId === "athena" ? "Athena" : "KIA",
        requiredSkills: ["skill_direct_execution"],
        dependencies: [],
        inputPayload: { goal: cleanGoal },
        state: "PENDING",
        retryAttempts: 0,
      },
    ];
  }

  /**
   * Resolves dependencies in the DAG and unblocks ready steps
   */
  public updateStepDependencies(steps: OrchestratedStep[]): OrchestratedStep[] {
    const completedStepIndices = new Set(
      steps
        .filter((s) => s.state === "COMPLETED")
        .map((s) => s.stepIndex)
    );

    return steps.map((step) => {
      if (step.state === "BLOCKED") {
        const allDependenciesMet = step.dependencies.every((depIdx) =>
          completedStepIndices.has(depIdx)
        );
        if (allDependenciesMet) {
          return { ...step, state: "PENDING" as Phase1ExecutionState };
        }
      }
      return step;
    });
  }
}

export const taskOrchestrator = TaskOrchestrator.getInstance();
