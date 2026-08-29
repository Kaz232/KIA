/**
 * GAG CORE OS — FASE 1: HANDOFF MANAGER
 * Manages autonomous agent-to-agent delegation, cycle detection (A -> B -> A -> B),
 * max handoff caps (10 max), and specialist routing.
 */

import { Artifact, HandoffRecord } from "./executionTypes";
import { REGISTERED_AGENTS } from "./agentSupervisor";

export interface CreateHandoffParams {
  sourceAgentId: string;
  targetAgentId?: string;
  taskId: string;
  executionId: string;
  reason: string;
  input: any;
  previousOutput?: string;
  artifacts?: Artifact[];
  handoffHistory?: string[]; // Chain of agent IDs: ["agent-kia", "agent-copywriter", ...]
}

export class HandoffManager {
  private static instance: HandoffManager;
  public static readonly MAX_HANDOFFS = 10;

  // Domain routing keywords
  private readonly DOMAIN_ROUTING_MAP: Record<string, string> = {
    design: "agent-art-director",
    visual: "agent-art-director",
    motion: "agent-art-director",
    veo: "agent-avatar-veo",
    avatar: "agent-avatar-veo",
    copy: "agent-copywriter",
    texto: "agent-copywriter",
    artigo: "agent-copywriter",
    estratégia: "agent-consultant",
    diagnóstico: "agent-consultant",
    documento: "agent-scanner",
    ocr: "agent-scanner",
    formação: "agent-educator",
    pedagógico: "agent-educator",
    automação: "agent-automation-kaza",
    webhook: "agent-automation-kaza",
    infraestrutura: "agent-infra-network",
    redes: "agent-infra-network",
    branding: "agent-brandkit",
    brandkit: "agent-brandkit",
    campanha: "agent-campaigns",
    tráfego: "agent-campaigns",
    suporte: "agent-support-ops",
    crm: "agent-support-ops",
    arquiteto: "agent-soba",
  };

  public static getInstance(): HandoffManager {
    if (!HandoffManager.instance) {
      HandoffManager.instance = new HandoffManager();
    }
    return HandoffManager.instance;
  }

  /**
   * Selects best target agent based on reason and context.
   */
  public resolveTargetAgent(sourceAgentId: string, reason: string, explicitTarget?: string): string {
    if (explicitTarget && REGISTERED_AGENTS.some((a) => a.id === explicitTarget) && explicitTarget !== sourceAgentId) {
      return explicitTarget;
    }

    const lower = reason.toLowerCase();
    for (const [kw, targetId] of Object.entries(this.DOMAIN_ROUTING_MAP)) {
      if (lower.includes(kw) && targetId !== sourceAgentId) {
        return targetId;
      }
    }

    // Default escalation back to KIA or Soba if source is already KIA
    return sourceAgentId === "agent-kia" ? "agent-consultant" : "agent-kia";
  }

  /**
   * Detects cycles in handoff history to prevent infinite ping-pong loops (e.g., A -> B -> A -> B).
   */
  public detectCycle(history: string[], nextAgentId: string): { hasCycle: boolean; cycleType?: string } {
    if (history.length === 0) return { hasCycle: false };

    // 1. Direct consecutive ping-pong: A -> B -> A -> B
    if (history.length >= 2) {
      const last = history[history.length - 1];
      const secondLast = history[history.length - 2];
      if (secondLast === nextAgentId && last !== nextAgentId) {
        return {
          hasCycle: true,
          cycleType: `Ciclo ping-pong direto detetado entre [${last}] e [${nextAgentId}].`,
        };
      }
    }

    // 2. Repetition threshold: same agent visited more than 2 times
    const occurrences = history.filter((id) => id === nextAgentId).length;
    if (occurrences >= 2) {
      return {
        hasCycle: true,
        cycleType: `Agente [${nextAgentId}] já foi acionado ${occurrences} vezes na mesma cadeia de handoff.`,
      };
    }

    // 3. Chain limit
    if (history.length >= HandoffManager.MAX_HANDOFFS) {
      return {
        hasCycle: true,
        cycleType: `Limite máximo de ${HandoffManager.MAX_HANDOFFS} handoffs atingido na execução.`,
      };
    }

    return { hasCycle: false };
  }

  /**
   * Creates and validates a HandoffRecord.
   */
  public createHandoff(params: CreateHandoffParams): { handoff?: HandoffRecord; error?: string } {
    const history = params.handoffHistory || [];
    const targetAgentId = this.resolveTargetAgent(params.sourceAgentId, params.reason, params.targetAgentId);

    // Check for loops / caps
    const cycleCheck = this.detectCycle(history, targetAgentId);
    if (cycleCheck.hasCycle) {
      return {
        error: `Handoff bloqueado por segurança: ${cycleCheck.cycleType}`,
      };
    }

    const targetDescriptor = REGISTERED_AGENTS.find((a) => a.id === targetAgentId);
    const handoff: HandoffRecord = {
      id: `handoff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sourceAgentId: params.sourceAgentId,
      targetAgentId,
      targetAgentName: targetDescriptor ? targetDescriptor.name : targetAgentId,
      taskId: params.taskId,
      executionId: params.executionId,
      reason: params.reason,
      input: params.input,
      previousOutput: params.previousOutput,
      artifacts: params.artifacts || [],
      timestamp: new Date().toISOString(),
      handoffDepth: history.length + 1,
    };

    return { handoff };
  }
}

export const handoffManager = HandoffManager.getInstance();
