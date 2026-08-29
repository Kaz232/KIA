/**
 * GAG CORE OS — FASE 1 & FASE 2: TASK ORCHESTRATOR
 * Decomposes high-level goals into a Directed Acyclic Graph (DAG) of execution steps,
 * enriching each node with required capabilities, skills, tools, and risk assessments.
 */

import { ExecutionStep, OrchestrationPlan } from "./executionTypes";
import { capabilityResolver } from "../registry/capabilityResolver";
import { skillSelector } from "../registry/skillSelector";
import { AGENT_CAPABILITY_MAP } from "../registry/agentCapabilityMap";

export class TaskOrchestrator {
  private static instance: TaskOrchestrator;

  public static getInstance(): TaskOrchestrator {
    if (!TaskOrchestrator.instance) {
      TaskOrchestrator.instance = new TaskOrchestrator();
    }
    return TaskOrchestrator.instance;
  }

  /**
   * Plans an autonomous execution pipeline from a natural language goal.
   */
  public planExecution(goal: string): OrchestrationPlan {
    const resolution = capabilityResolver.resolve(goal);
    const lower = goal.toLowerCase();

    // Check if goal is a compound multi-agent pipeline
    const isMultiAgent =
      lower.includes("lançamento completo") ||
      lower.includes("campanha completa") ||
      lower.includes("plano completo") ||
      lower.includes("estratégia e copy") ||
      lower.includes("artigo e design") ||
      lower.includes("marketing e design") ||
      lower.includes("sistema completo");

    if (isMultiAgent) {
      return this.buildMultiAgentDAG(goal, resolution);
    }

    // Specialized single-agent or direct delegation DAG
    const targetAgentId = resolution.recommendedAgent;
    const agentMapping = AGENT_CAPABILITY_MAP[targetAgentId];
    const skillSelection = skillSelector.selectSkills(goal, targetAgentId);

    const stepId = `step_1_${Date.now()}`;
    const primaryStep: ExecutionStep = {
      id: stepId,
      stepIndex: 0,
      title: `Execução Especializada: ${agentMapping ? agentMapping.name : "Agente Especialista"}`,
      description: goal,
      assignedAgentId: targetAgentId,
      assignedAgentName: agentMapping ? agentMapping.name : "Especialista GAG",
      requiredCapabilities: resolution.requiredCapabilities,
      requiredSkills: skillSelection.selectedSkillIds,
      requiredTools: skillSelection.requiredTools,
      recommendedAgent: targetAgentId,
      riskLevel: resolution.riskLevel,
      dependencies: [],
      isParallelAllowed: false,
      input: { goal, context: "Execução direta via DAG Task Orchestrator" },
      state: "QUEUED",
      retries: [],
      handoffs: [],
    };

    return {
      goal,
      primaryAgentId: targetAgentId,
      steps: [primaryStep],
      isSequential: true,
      totalSteps: 1,
      resolvedCapabilities: resolution.requiredCapabilities,
      resolvedSkills: skillSelection.selectedSkillIds,
      resolvedTools: skillSelection.requiredTools,
    };
  }

  /**
   * Builds a multi-phase DAG pipeline (Strategy -> Content/Visual -> Review).
   */
  private buildMultiAgentDAG(goal: string, resolution: any): OrchestrationPlan {
    const steps: ExecutionStep[] = [];
    const timestamp = Date.now();

    // Step 1: Strategic Planning (Consultant)
    const step1Id = `step_dag_strat_${timestamp}`;
    steps.push({
      id: step1Id,
      stepIndex: 0,
      title: "Planeamento Estratégico & Proposição",
      description: `Definição estratégica para: ${goal}`,
      assignedAgentId: "agent-consultant",
      assignedAgentName: "Consultor GAG",
      requiredCapabilities: ["strategy", "market-analysis"],
      requiredSkills: ["business-strategy", "market-analysis"],
      requiredTools: ["knowledge-base"],
      recommendedAgent: "agent-consultant",
      riskLevel: "LOW",
      dependencies: [],
      isParallelAllowed: false,
      input: { goal, phase: "STRATEGY" },
      state: "QUEUED",
      retries: [],
      handoffs: [],
    });

    // Step 2: Persuasive Copywriting (Copywriter)
    const step2Id = `step_dag_copy_${timestamp}`;
    steps.push({
      id: step2Id,
      stepIndex: 1,
      title: "Produção de Conteúdo & Redação Persuasiva",
      description: `Elaboração de copy de alta conversão baseada na estratégia.`,
      assignedAgentId: "agent-copywriter",
      assignedAgentName: "Copywriter GAG",
      requiredCapabilities: ["copywriting"],
      requiredSkills: ["sales-copy"],
      requiredTools: ["knowledge-base"],
      recommendedAgent: "agent-copywriter",
      riskLevel: "LOW",
      dependencies: [step1Id],
      isParallelAllowed: true,
      input: { goal, phase: "CONTENT" },
      state: "QUEUED",
      retries: [],
      handoffs: [],
    });

    // Step 3: Art Direction & Visual Concept (Art Director)
    const step3Id = `step_dag_art_${timestamp}`;
    steps.push({
      id: step3Id,
      stepIndex: 2,
      title: "Direção de Arte & Storyboarding",
      description: `Criação de identidade visual e conceitos estéticos.`,
      assignedAgentId: "agent-art-director",
      assignedAgentName: "Diretor de Arte",
      requiredCapabilities: ["art-direction", "visual-design"],
      requiredSkills: ["creative-concept", "storyboard"],
      requiredTools: ["knowledge-base"],
      recommendedAgent: "agent-art-director",
      riskLevel: "LOW",
      dependencies: [step1Id],
      isParallelAllowed: true,
      input: { goal, phase: "VISUAL" },
      state: "QUEUED",
      retries: [],
      handoffs: [],
    });

    // Step 4: Final Consolidation & QA (KIA)
    const step4Id = `step_dag_kia_${timestamp}`;
    steps.push({
      id: step4Id,
      stepIndex: 3,
      title: "Consolidação Executiva & Validação de Qualidade",
      description: `Auditoria de entrega final e empacotamento.`,
      assignedAgentId: "agent-kia",
      assignedAgentName: "KIA",
      requiredCapabilities: ["orchestration", "quality-control"],
      requiredSkills: ["qa-review", "execution-monitoring"],
      requiredTools: ["qa-engine", "execution-engine", "audit-manager"],
      recommendedAgent: "agent-kia",
      riskLevel: "LOW",
      dependencies: [step2Id, step3Id],
      isParallelAllowed: false,
      input: { goal, phase: "CONSOLIDATION" },
      state: "QUEUED",
      retries: [],
      handoffs: [],
    });

    return {
      goal,
      primaryAgentId: "agent-kia",
      steps,
      isSequential: false,
      totalSteps: steps.length,
      resolvedCapabilities: resolution.requiredCapabilities,
      resolvedSkills: ["business-strategy", "sales-copy", "creative-concept", "qa-review"],
      resolvedTools: ["knowledge-base", "qa-engine", "audit-manager"],
    };
  }
}

export const taskOrchestrator = TaskOrchestrator.getInstance();
