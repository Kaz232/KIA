/**
 * GAG CORE OS — PHASE 1: HANDOFF MANAGER
 * Manages inter-agent delegation and escalation to Human-in-the-Loop (Josemar Gourgel / Owner).
 * Preserves complete lineage, artifacts, and context across transitions.
 */

import { HandoffPackage } from "./types";

export interface HandoffRequestParams {
  executionId: string;
  taskId: string;
  fromAgentId: string;
  preferredTargetAgentId?: string;
  reason: string;
  goal: string;
  previousOutput?: string;
  qaFeedback?: string;
  attemptCount: number;
  artifacts?: { name: string; type: string; content: string }[];
  forceHumanEscalation?: boolean;
}

export class HandoffManager {
  private static instance: HandoffManager;
  private handoffLog: HandoffPackage[] = [];

  // Specialization routing table
  private static SPECIALIST_ROUTING: { pattern: RegExp; agentId: string; role: string }[] = [
    { pattern: /\b(código|script|backend|api|database|sql|bug|servidor|deploy)\b/i, agentId: "vulcan", role: "Vulcan (Dev/Engineering Lead)" },
    { pattern: /\b(pesquisa|mercado|análise|dados|relatório|benchmark|artigo)\b/i, agentId: "athena", role: "Athena (Research & Intelligence)" },
    { pattern: /\b(marketing|campanha|anúncio|copy|tráfego|leads|vendas|social)\b/i, agentId: "hermes", role: "Hermes (Growth & Marketing)" },
    { pattern: /\b(design|branding|identidade|logo|layout|ui|ux|visual|tipografia)\b/i, agentId: "davinci", role: "DaVinci (Creative & Design)" },
    { pattern: /\b(segurança|auditoria|permissão|vulnerabilidade|auth|criptografia)\b/i, agentId: "cypher", role: "Cypher (Security & Compliance)" },
    { pattern: /\b(financeiro|custos|fiscal|iva|orçamento|ebitda|lucro|faturamento)\b/i, agentId: "argus", role: "Argus (Financial & Operations)" },
  ];

  private constructor() {}

  public static getInstance(): HandoffManager {
    if (!HandoffManager.instance) {
      HandoffManager.instance = new HandoffManager();
    }
    return HandoffManager.instance;
  }

  /**
   * Dispatches a handoff to the most suitable specialist agent or escalates to Owner
   */
  public dispatchHandoff(params: HandoffRequestParams): HandoffPackage {
    const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    let toAgentId = params.preferredTargetAgentId || "kia";
    let targetRole = "KIA (Core Orchestrator)";
    let escalationToHuman = !!params.forceHumanEscalation;

    if (!escalationToHuman && !params.preferredTargetAgentId) {
      // Find matching specialist from goal/reason keywords
      const combinedText = `${params.goal} ${params.reason}`.toLowerCase();
      for (const route of HandoffManager.SPECIALIST_ROUTING) {
        if (route.pattern.test(combinedText) && route.agentId !== params.fromAgentId) {
          toAgentId = route.agentId;
          targetRole = route.role;
          break;
        }
      }
    }

    if (escalationToHuman) {
      toAgentId = "human_owner";
      targetRole = "Josemar Gourgel (Owner / Human In The Loop)";
    }

    const handoffPackage: HandoffPackage = {
      handoffId,
      executionId: params.executionId,
      taskId: params.taskId,
      fromAgentId: params.fromAgentId,
      toAgentId,
      targetRole,
      reason: params.reason,
      contextPayload: {
        originalGoal: params.goal,
        previousOutputSnippet: params.previousOutput ? params.previousOutput.slice(0, 300) : undefined,
        qaFeedback: params.qaFeedback,
        attemptCount: params.attemptCount,
        collectedArtifacts: params.artifacts || [],
      },
      escalationToHuman,
      timestamp: new Date().toISOString(),
    };

    this.handoffLog.push(handoffPackage);
    return handoffPackage;
  }

  /**
   * Retrieves all handoffs for an execution ID
   */
  public getHandoffsForExecution(executionId: string): HandoffPackage[] {
    return this.handoffLog.filter((h) => h.executionId === executionId);
  }

  /**
   * Retrieves all handoffs in memory
   */
  public getAllHandoffs(): HandoffPackage[] {
    return [...this.handoffLog];
  }
}

export const handoffManager = HandoffManager.getInstance();
