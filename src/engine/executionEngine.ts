/**
 * GAG CORE OS — FASE 1 & FASE 2: AUTONOMOUS EXECUTION ENGINE
 * Central state machine and orchestrator implementing the full execution pipeline:
 * KIA -> GOAL ANALYSIS -> CAPABILITY RESOLUTION -> TASK ORCHESTRATION ->
 * SKILL SELECTION -> AGENT SUPERVISOR -> TOOL VALIDATION -> EXECUTION ->
 * QA -> RETRY / HANDOFF -> DELIVERY + SHA-256 AUDIT LOGGING.
 */

import {
  ExecutionContext,
  ExecutionResult,
  ExecutionStep,
  EngineAuditEvent,
  EngineAuditEventType,
  UserRole,
  Artifact,
} from "./executionTypes";
import { ExecutionState } from "./executionState";
import { taskOrchestrator } from "./taskOrchestrator";
import { agentSupervisor } from "./agentSupervisor";
import { qaEngine } from "./qaEngine";
import { retryController } from "./retryController";
import { handoffManager } from "./handoffManager";
import { capabilityResolver } from "../registry/capabilityResolver";
import { skillSelector } from "../registry/skillSelector";
import { skillRegistry } from "../registry/skillRegistry";
import { toolRegistry } from "../registry/toolRegistry";

function simpleSha256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `sha256_${hex}_${input.length}`;
}

export class ExecutionEngine {
  private static instance: ExecutionEngine;
  private auditChain: EngineAuditEvent[] = [];
  private activeExecutions: Map<string, { state: ExecutionState; steps: ExecutionStep[] }> = new Map();

  public static getInstance(): ExecutionEngine {
    if (!ExecutionEngine.instance) {
      ExecutionEngine.instance = new ExecutionEngine();
    }
    return ExecutionEngine.instance;
  }

  /**
   * Appends an event to the immutable SHA-256 chained audit trail.
   */
  public logAudit(params: {
    type: EngineAuditEventType;
    executionId: string;
    stepId?: string;
    agentId?: string;
    previousState?: ExecutionState;
    newState: ExecutionState;
    details: string;
    metadata?: Record<string, any>;
  }): EngineAuditEvent {
    const previousEvent = this.auditChain[this.auditChain.length - 1];
    const previousHash = previousEvent ? previousEvent.hash : "00000000000000000000000000000000";
    const index = this.auditChain.length + 1;
    const timestamp = new Date().toISOString();

    const rawPayload = `${index}:${timestamp}:${params.type}:${params.executionId}:${params.newState}:${params.details}:${previousHash}`;
    const hash = simpleSha256(rawPayload);

    const event: EngineAuditEvent = {
      id: `audit_${Date.now()}_${index}`,
      index,
      timestamp,
      type: params.type,
      executionId: params.executionId,
      stepId: params.stepId,
      agentId: params.agentId,
      previousState: params.previousState,
      newState: params.newState,
      details: params.details,
      metadata: params.metadata,
      previousHash,
      hash,
    };

    this.auditChain.push(event);
    return event;
  }

  public getAuditTrail(limit = 100): EngineAuditEvent[] {
    return this.auditChain.slice(-limit);
  }

  public resetForTesting(): void {
    this.auditChain = [];
    this.activeExecutions.clear();
  }

  public cancelExecution(executionId: string): boolean {
    const active = this.activeExecutions.get(executionId);
    if (active) {
      active.state = "CANCELLED";
    }
    this.logAudit({
      type: "EXECUTION_CANCELLED",
      executionId,
      newState: "CANCELLED",
      details: `Execução ${executionId} cancelada pelo utilizador.`,
    });
    return true;
  }

  /**
   * Main Autonomous Pipeline execution entry point.
   */
  public async executeGoal(params: {
    goal: string;
    userRole?: UserRole;
    userId?: string;
    userName?: string;
    autonomyLevel?: 0 | 1 | 2;
  }): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userRole: UserRole = params.userRole || "ADMIN";

    this.logAudit({
      type: "EXECUTION_STARTED",
      executionId,
      newState: "QUEUED",
      details: `Iniciando execução autónoma para meta: "${params.goal.slice(0, 80)}"`,
      metadata: { userRole, goal: params.goal },
    });

    // 1. CAPABILITY RESOLUTION
    const resolution = capabilityResolver.resolve(params.goal);
    this.logAudit({
      type: "CAPABILITY_RESOLVED",
      executionId,
      newState: "PLANNING",
      details: `Capacidades resolvidas: [${resolution.requiredCapabilities.join(", ")}]. Agente sugerido: ${resolution.recommendedAgent}`,
      metadata: { resolution },
    });

    // 2. CHECK OWNER APPROVAL ON CRITICAL OPERATIONS
    if (resolution.requiresOwnerApproval && userRole !== "OWNER") {
      this.logAudit({
        type: "OWNER_APPROVAL_REQUIRED",
        executionId,
        newState: "OWNER_APPROVAL_REQUIRED",
        details: resolution.approvalReason || "Ação requer autorização expressa do Proprietário.",
        metadata: { riskLevel: resolution.riskLevel },
      });

      return {
        executionId,
        traceId,
        goal: params.goal,
        state: "OWNER_APPROVAL_REQUIRED",
        primaryAgentId: resolution.recommendedAgent,
        selectedCapabilities: resolution.requiredCapabilities,
        selectedSkills: resolution.requiredSkills,
        selectedTools: resolution.requiredTools,
        steps: [],
        finalOutput: `⚠️ **AÇÃO BLOQUEADA POR GOVERNANÇA (OWNER_APPROVAL_REQUIRED)**\n\n${resolution.approvalReason || "Esta operação envolve risco crítico ou impacto financeiro/estrutural irreversível."}\n\nPor favor, solicite a autorização de **Josemar Gourgel (Proprietário)** para desbloquear esta execução.`,
        artifacts: [],
        retriesTotal: 0,
        handoffsTotal: 0,
        requiresOwnerApproval: true,
        ownerApprovalReason: resolution.approvalReason,
        auditEvents: this.auditChain.filter((e) => e.executionId === executionId),
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        totalDurationMs: Date.now() - startTime,
      };
    }

    // 3. TASK ORCHESTRATION (DAG Planning)
    const plan = taskOrchestrator.planExecution(params.goal);
    const steps: ExecutionStep[] = [...plan.steps];

    const context: ExecutionContext = {
      executionId,
      traceId,
      goal: params.goal,
      userId: params.userId,
      userName: params.userName,
      userRole,
      autonomyLevel: params.autonomyLevel ?? 2,
      initialAgentId: plan.primaryAgentId,
      currentAgentId: plan.primaryAgentId,
      selectedCapabilities: resolution.requiredCapabilities,
      selectedSkills: resolution.requiredSkills,
      selectedTools: resolution.requiredTools,
      maxRetries: 3,
      maxHandoffs: 3,
      handoffHistory: [plan.primaryAgentId],
      createdAt: new Date(startTime).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let totalRetries = 0;
    let totalHandoffs = 0;
    const accumulatedArtifacts: Artifact[] = [];
    const completedStepOutputs: string[] = [];

    // 4. EXECUTE STEPS IN PIPELINE
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let currentAgentId = step.assignedAgentId;

      this.logAudit({
        type: "TASK_ASSIGNED",
        executionId,
        stepId: step.id,
        agentId: currentAgentId,
        newState: "ASSIGNED",
        details: `Passo ${i + 1}/${steps.length} atribuído a ${step.assignedAgentName}: "${step.title}"`,
      });

      // 4.1 AGENT SUPERVISOR VALIDATION
      const supervisorCheck = agentSupervisor.checkAssignment(currentAgentId, step.description, userRole);
      if (!supervisorCheck.allowed) {
        if (supervisorCheck.requiresOwnerApproval && userRole !== "OWNER") {
          step.state = "OWNER_APPROVAL_REQUIRED";
          this.logAudit({
            type: "OWNER_APPROVAL_REQUIRED",
            executionId,
            stepId: step.id,
            agentId: currentAgentId,
            newState: "OWNER_APPROVAL_REQUIRED",
            details: supervisorCheck.reason || "Operação requer aprovação do Proprietário.",
          });
          return {
            executionId,
            traceId,
            goal: params.goal,
            state: "OWNER_APPROVAL_REQUIRED",
            primaryAgentId: plan.primaryAgentId,
            selectedCapabilities: resolution.requiredCapabilities,
            selectedSkills: resolution.requiredSkills,
            selectedTools: resolution.requiredTools,
            steps,
            finalOutput: `⚠️ **Aprovação do Proprietário Obrigatória:** ${supervisorCheck.reason}`,
            artifacts: accumulatedArtifacts,
            retriesTotal: totalRetries,
            handoffsTotal: totalHandoffs,
            requiresOwnerApproval: true,
            ownerApprovalReason: supervisorCheck.reason,
            auditEvents: this.auditChain.filter((e) => e.executionId === executionId),
            startedAt: new Date(startTime).toISOString(),
            completedAt: new Date().toISOString(),
            totalDurationMs: Date.now() - startTime,
          };
        }

        // Attempt Autonomous Handoff if agent is incompatible
        this.logAudit({
          type: "CAPABILITY_VALIDATION_FAILED",
          executionId,
          stepId: step.id,
          agentId: currentAgentId,
          newState: "HANDOFF_PENDING",
          details: `Agente ${currentAgentId} não qualificado para o passo. Disparando handoff automático.`,
        });

        const handoffRes = handoffManager.createHandoff({
          sourceAgentId: currentAgentId,
          targetAgentId: resolution.recommendedAgent !== currentAgentId ? resolution.recommendedAgent : "agent-kia",
          taskId: step.id,
          executionId,
          reason: `Reatribuição por competência técnica: ${supervisorCheck.reason}`,
          input: step.input,
          handoffHistory: context.handoffHistory,
        });

        if (handoffRes.handoff) {
          step.handoffs.push(handoffRes.handoff);
          currentAgentId = handoffRes.handoff.targetAgentId;
          step.assignedAgentId = currentAgentId;
          context.handoffHistory.push(currentAgentId);
          totalHandoffs++;
          this.logAudit({
            type: "HANDOFF_COMPLETED",
            executionId,
            stepId: step.id,
            agentId: currentAgentId,
            newState: "ASSIGNED",
            details: `Handoff concluído com sucesso para ${currentAgentId}.`,
          });
        }
      }

      // 4.2 SKILL SELECTION & TOOL VALIDATION
      const skillSelection = skillSelector.selectSkills(step.description, currentAgentId);
      this.logAudit({
        type: "SKILL_SELECTED",
        executionId,
        stepId: step.id,
        agentId: currentAgentId,
        newState: "IN_PROGRESS",
        details: `Skills selecionadas para ${currentAgentId}: [${skillSelection.selectedSkillIds.join(", ")}]`,
      });

      for (const toolId of skillSelection.requiredTools) {
        const toolValidation = toolRegistry.validate(toolId);
        if (!toolValidation.isValid) {
          this.logAudit({
            type: "TOOL_EXECUTION_FAILED",
            executionId,
            stepId: step.id,
            agentId: currentAgentId,
            newState: "FAILED",
            details: `Validação da ferramenta '${toolId}' falhou: ${toolValidation.error}`,
          });
        } else {
          this.logAudit({
            type: "TOOL_SELECTED",
            executionId,
            stepId: step.id,
            agentId: currentAgentId,
            newState: "IN_PROGRESS",
            details: `Ferramenta validada e autorizada: ${toolId}`,
          });
        }
      }

      // 4.3 STEP EXECUTION WITH RETRY LOOP (Max 3 attempts)
      let stepPassed = false;
      let attemptCount = 0;
      let stepOutput = "";
      let stepArtifacts: Artifact[] = [];

      step.state = "IN_PROGRESS";
      step.startedAt = new Date().toISOString();

      while (!stepPassed && attemptCount < context.maxRetries) {
        attemptCount++;

        this.logAudit({
          type: "AGENT_STARTED",
          executionId,
          stepId: step.id,
          agentId: currentAgentId,
          newState: "IN_PROGRESS",
          details: `Executando passo (tentativa ${attemptCount}/${context.maxRetries}) com agente ${currentAgentId}.`,
        });

        // Execute primary matched skill
        const primarySkillId = skillSelection.selectedSkillIds[0] || "goal-analysis";
        this.logAudit({
          type: "SKILL_EXECUTION_STARTED",
          executionId,
          stepId: step.id,
          agentId: currentAgentId,
          newState: "IN_PROGRESS",
          details: `Disparando skill: ${primarySkillId}`,
        });

        const skillResult = await skillRegistry.execute(
          primarySkillId,
          { goal: step.description, input: step.input },
          {
            skillId: primarySkillId,
            executionId,
            stepId: step.id,
            agentId: currentAgentId,
            userRole,
            timestamp: new Date().toISOString(),
          }
        );

        this.logAudit({
          type: "SKILL_EXECUTION_COMPLETED",
          executionId,
          stepId: step.id,
          agentId: currentAgentId,
          newState: "IN_PROGRESS",
          details: `Skill ${primarySkillId} concluída em ${skillResult.metadata.durationMs}ms.`,
        });

        stepOutput = skillResult.output || `Entrega estruturada do agente ${currentAgentId} para: ${step.title}`;
        stepArtifacts = (skillResult.artifacts || []).map((art) => ({
          id: art.id,
          title: art.title,
          type: art.type,
          content: art.content,
          createdAt: new Date().toISOString(),
        }));

        // 4.4 QA EVALUATION
        this.logAudit({
          type: "QA_STARTED",
          executionId,
          stepId: step.id,
          agentId: "agent-kia",
          newState: "QA_PENDING",
          details: `Iniciando auditoria de qualidade (QA) do resultado do passo.`,
        });

        const qaResult = qaEngine.evaluate({
          executionId,
          stepId: step.id,
          goal: step.description,
          output: stepOutput,
          artifacts: stepArtifacts,
        });

        step.qaResult = qaResult;

        if (qaResult.passed) {
          stepPassed = true;
          step.state = "COMPLETED";
          step.output = stepOutput;
          step.artifacts = stepArtifacts;
          step.completedAt = new Date().toISOString();
          step.durationMs = Date.now() - startTime;
          accumulatedArtifacts.push(...stepArtifacts);
          completedStepOutputs.push(stepOutput);

          this.logAudit({
            type: "QA_PASSED",
            executionId,
            stepId: step.id,
            agentId: "agent-kia",
            newState: "COMPLETED",
            details: `QA APROVADO com nota ${qaResult.score}/100. Categoria: ${qaResult.category}.`,
            metadata: { score: qaResult.score },
          });
        } else {
          // QA Failed - Retry or fail
          this.logAudit({
            type: "QA_FAILED",
            executionId,
            stepId: step.id,
            agentId: "agent-kia",
            newState: "RETRYING",
            details: `QA REPROVADO (Nota ${qaResult.score}/100). Problemas: ${qaResult.issues.join("; ")}`,
            metadata: { issues: qaResult.issues },
          });

          if (attemptCount < context.maxRetries) {
            totalRetries++;
            const adapted = retryController.buildAdaptedPrompt(step.description, qaResult);
            step.retries.push({
              attemptNumber: attemptCount,
              maxAttempts: context.maxRetries,
              agentId: currentAgentId,
              reason: `QA Reprovado: ${qaResult.issues[0] || "Ajuste de completude"}`,
              adaptedPrompt: adapted,
              timestamp: new Date().toISOString(),
            });

            this.logAudit({
              type: "RETRY_STARTED",
              executionId,
              stepId: step.id,
              agentId: currentAgentId,
              newState: "RETRYING",
              details: `Iniciando re-tentativa adaptativa ${attemptCount + 1}/${context.maxRetries}.`,
            });
          } else {
            step.state = "FAILED";
            step.error = `Limite de re-tentativas (${context.maxRetries}) atingido sem aprovação de QA.`;
            break;
          }
        }
      }

      if (!stepPassed) {
        this.logAudit({
          type: "EXECUTION_FAILED",
          executionId,
          stepId: step.id,
          agentId: currentAgentId,
          newState: "FAILED",
          details: `Execução do passo ${step.id} falhou.`,
        });

        return {
          executionId,
          traceId,
          goal: params.goal,
          state: "FAILED",
          primaryAgentId: plan.primaryAgentId,
          selectedCapabilities: resolution.requiredCapabilities,
          selectedSkills: resolution.requiredSkills,
          selectedTools: resolution.requiredTools,
          steps,
          finalOutput: stepOutput || "Falha na execução do pipeline.",
          artifacts: accumulatedArtifacts,
          qaResult: step.qaResult,
          retriesTotal: totalRetries,
          handoffsTotal: totalHandoffs,
          requiresOwnerApproval: false,
          auditEvents: this.auditChain.filter((e) => e.executionId === executionId),
          startedAt: new Date(startTime).toISOString(),
          completedAt: new Date().toISOString(),
          totalDurationMs: Date.now() - startTime,
          error: step.error || "Erro durante o processamento do pipeline.",
        };
      }
    }

    // 5. FINAL SUCCESSFUL DELIVERY
    this.logAudit({
      type: "EXECUTION_COMPLETED",
      executionId,
      newState: "COMPLETED",
      details: `Execução autónoma concluída e entregue com sucesso em ${Date.now() - startTime}ms.`,
      metadata: { stepsCompleted: steps.length, totalRetries, totalHandoffs },
    });

    const finalCombinedOutput = completedStepOutputs.join("\n\n---\n\n");

    return {
      executionId,
      traceId,
      goal: params.goal,
      state: "COMPLETED",
      primaryAgentId: plan.primaryAgentId,
      selectedCapabilities: resolution.requiredCapabilities,
      selectedSkills: resolution.requiredSkills,
      selectedTools: resolution.requiredTools,
      steps,
      finalOutput: finalCombinedOutput,
      artifacts: accumulatedArtifacts,
      qaResult: steps[steps.length - 1]?.qaResult,
      retriesTotal: totalRetries,
      handoffsTotal: totalHandoffs,
      requiresOwnerApproval: false,
      auditEvents: this.auditChain.filter((e) => e.executionId === executionId),
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      totalDurationMs: Date.now() - startTime,
    };
  }
}

export const executionEngine = ExecutionEngine.getInstance();
