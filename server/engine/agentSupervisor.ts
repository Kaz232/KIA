/**
 * GAG CORE OS — PHASE 1: AGENT SUPERVISOR
 * Enforces pre-flight policies, RBAC access control, Autonomy Levels,
 * Guardrail checks, and resource limits before and during task execution.
 */

import { AutonomyLevel, SupervisorVerdict } from "./types";

export interface SupervisorPolicyCheckParams {
  agentId: string;
  agentRole?: string;
  userRole?: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  goal: string;
  actionType?: string;
  requestedTools?: string[];
  autonomyOverride?: AutonomyLevel;
}

export class AgentSupervisor {
  private static instance: AgentSupervisor;

  // Banned / High-Risk patterns requiring Owner approval or refusal
  private static HIGH_RISK_PATTERNS = [
    /\b(delete|drop|truncate|format|destroy)\s+(database|table|users|system|all)\b/i,
    /\b(rm\s+-rf|sudo\s+rm|killall|shutdown)\b/i,
    /\b(exfiltrate|leak|dump\s+secrets|export\s+keys|private_key)\b/i,
    /\b(transfer\s+funds|pagamento\s+externo|saque|banco)\b/i,
    /\b(bypass\s+auth|ignore\s+guardrails|jailbreak)\b/i,
  ];

  // Level 2 Autonomy Keywords (Requires Josemar Gourgel's explicit confirmation)
  private static OWNER_CONFIRMATION_PATTERNS = [
    /\b(deploy\s+production|deploy\s+prod|alterar\s+regime\s+fiscal|demitir|contratar)\b/i,
    /\b(alterar\s+politica\s+seguranca|apagar\s+auditoria|reset\s+sistema)\b/i,
    /\b(gastar|budget\s+acima|despesa\s+critica)\b/i,
  ];

  private constructor() {}

  public static getInstance(): AgentSupervisor {
    if (!AgentSupervisor.instance) {
      AgentSupervisor.instance = new AgentSupervisor();
    }
    return AgentSupervisor.instance;
  }

  /**
   * Pre-flight policy, RBAC and guardrails evaluation
   */
  public evaluate(params: SupervisorPolicyCheckParams): SupervisorVerdict {
    const violations: string[] = [];
    const guardrailFlags: string[] = [];
    const userRole = params.userRole || "OWNER";
    const goal = params.goal || "";

    // 1. Check for Security Guardrail Breaches
    for (const pattern of AgentSupervisor.HIGH_RISK_PATTERNS) {
      if (pattern.test(goal)) {
        violations.push(`HIGH_RISK_OPERATION_DETECTED: Padrão perigoso identificado '${pattern.source}'`);
      }
    }

    // 2. Check for Role-Based Access Control (RBAC)
    if (userRole === "VIEWER") {
      const writeKeywords = /\b(criar|adicionar|editar|alterar|apagar|executar|eliminar|salvar)\b/i;
      if (writeKeywords.test(goal)) {
        violations.push("RBAC_RESTRICTION: O perfil VIEWER possui apenas permissão de leitura.");
      }
    }

    // 3. Determine Autonomy Level
    let autonomyLevel: AutonomyLevel = 0; // Default: automatic
    let requiresOwnerConfirmation = false;

    // Check if goal hits Level 2 patterns
    for (const pattern of AgentSupervisor.OWNER_CONFIRMATION_PATTERNS) {
      if (pattern.test(goal)) {
        autonomyLevel = 2;
        requiresOwnerConfirmation = true;
        guardrailFlags.push("LEVEL_2_OWNER_AUTHORIZATION_MANDATORY");
        break;
      }
    }

    // If autonomyOverride is provided
    if (params.autonomyOverride !== undefined) {
      autonomyLevel = Math.max(autonomyLevel, params.autonomyOverride) as AutonomyLevel;
      if (autonomyLevel === 2) {
        requiresOwnerConfirmation = true;
      }
    }

    // If violations exist and user is not OWNER
    if (violations.length > 0 && userRole !== "OWNER") {
      return {
        allowed: false,
        autonomyLevel: 2,
        requiredRole: "OWNER",
        requiresOwnerConfirmation: true,
        violations,
        guardrailFlags: [...guardrailFlags, "EXECUTION_BLOCKED_BY_SUPERVISOR"],
        maxAllowedTokens: 0,
        timeoutMs: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // If violations exist but user is OWNER, mark as requiring explicit Level 2 confirmation
    if (violations.length > 0 && userRole === "OWNER") {
      autonomyLevel = 2;
      requiresOwnerConfirmation = true;
      guardrailFlags.push("OWNER_WARNING_HIGH_IMPACT");
    }

    const isAllowed = violations.length === 0 || userRole === "OWNER";

    return {
      allowed: isAllowed,
      autonomyLevel,
      requiredRole: autonomyLevel === 2 ? "OWNER" : "AGENT",
      requiresOwnerConfirmation,
      violations,
      guardrailFlags,
      maxAllowedTokens: 4096,
      timeoutMs: 15000,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluates generated text in real-time to detect hallucination markers or unsafe output
   */
  public inspectOutput(output: string): { isSafe: boolean; flags: string[]; sanitizedOutput: string } {
    const flags: string[] = [];
    let sanitized = output;

    if (output.includes("API_KEY_SECRET") || output.includes("PRIVATE_KEY_BEGIN")) {
      flags.push("SENSITIVE_CREDENTIAL_LEAK_PREVENTED");
      sanitized = sanitized.replace(/(?:sk-[a-zA-Z0-9]{20,}|PRIVATE_KEY_BEGIN[\s\S]*?END)/g, "[REDACTED_BY_SUPERVISOR]");
    }

    if (output.includes("TODO_IMPLEMENT_LATER") || output.includes("PLACEHOLDER_NOT_REAL")) {
      flags.push("INCOMPLETE_OR_PLACEHOLDER_OUTPUT_DETECTED");
    }

    return {
      isSafe: flags.length === 0,
      flags,
      sanitizedOutput: sanitized,
    };
  }
}

export const agentSupervisor = AgentSupervisor.getInstance();
