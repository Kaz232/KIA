/**
 * GAG CORE OS — KIA
 * AGENT SUPERVISOR
 *
 * Responsabilidades:
 * - RBAC
 * - Autonomy Policy
 * - Capability Enforcement
 * - Security Guardrails
 * - Owner Approval
 * - Output Inspection
 *
 * IMPORTANTE:
 * O agente nunca pode elevar as próprias permissões.
 * O Supervisor é a autoridade de execução.
 */

import {
  AutonomyLevel,
  AgentCapability,
  SupervisorVerdict,
} from "./types";

import {
  AutonomyPolicy,
} from "./autonomyPolicy";

import {
  getAgentProfile,
} from "./agentProfiles";

import {
  assertAgentActionAllowed,
} from "./securityPolicy";

/* =========================================================
 * INPUT
 * ======================================================= */

export interface SupervisorPolicyCheckParams {
  agentId: string;

  agentRole?: string;

  userRole?:
    | "OWNER"
    | "ADMIN"
    | "AGENT"
    | "VIEWER";

  goal: string;

  actionType?: string;

  capability?: AgentCapability;

  requestedTools?: string[];

  autonomyOverride?: AutonomyLevel;
}

/* =========================================================
 * SUPERVISOR
 * ======================================================= */

export class AgentSupervisor {
  private static instance: AgentSupervisor;

  private readonly autonomyPolicy =
    new AutonomyPolicy();

  /* =======================================================
   * HIGH-RISK PATTERNS
   * ===================================================== */

  private static readonly HIGH_RISK_PATTERNS = [
    /\b(delete|drop|truncate|format|destroy)\s+(database|table|users|system|all)\b/i,

    /\b(rm\s+-rf|sudo\s+rm|killall|shutdown)\b/i,

    /\b(exfiltrate|leak|dump\s+secrets|export\s+keys|private_key)\b/i,

    /\b(transfer\s+funds|pagamento\s+externo|saque|banco)\b/i,

    /\b(bypass\s+auth|ignore\s+guardrails|jailbreak)\b/i,
  ];

  /* =======================================================
   * OWNER CONFIRMATION PATTERNS
   * ======================================================= */

  private static readonly OWNER_CONFIRMATION_PATTERNS = [
    /\b(deploy\s+production|deploy\s+prod|alterar\s+regime\s+fiscal|demitir|contratar)\b/i,

    /\b(alterar\s+politica\s+seguranca|apagar\s+auditoria|reset\s+sistema)\b/i,

    /\b(gastar|budget\s+acima|despesa\s+critica)\b/i,
  ];

  /* =======================================================
   * CONSTRUCTOR
   * ======================================================= */

  private constructor() {}

  public static getInstance(): AgentSupervisor {
    if (!AgentSupervisor.instance) {
      AgentSupervisor.instance =
        new AgentSupervisor();
    }

    return AgentSupervisor.instance;
  }

  /* =======================================================
   * EVALUATE
   * ======================================================= */

  public evaluate(
    params: SupervisorPolicyCheckParams,
  ): SupervisorVerdict {
    const violations: string[] = [];

    const guardrailFlags: string[] = [];

    const userRole =
      params.userRole ?? "OWNER";

    const goal =
      params.goal ?? "";

    const agentProfile =
      getAgentProfile(params.agentId);

    /* =====================================================
     * 1. AGENT EXISTENCE
     * =================================================== */

    if (!agentProfile) {
      violations.push(
        `AGENT_NOT_REGISTERED: Agent '${params.agentId}' is not registered.`,
      );

      return {
        allowed: false,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation: false,

        violations,

        guardrailFlags: [
          "UNKNOWN_AGENT",
          "EXECUTION_BLOCKED_BY_SUPERVISOR",
        ],

        maxAllowedTokens: 0,

        timeoutMs: 0,

        timestamp:
          new Date().toISOString(),
      };
    }

    /* =====================================================
     * 2. SECURITY ACTION CHECK
     * =================================================== */

    if (params.actionType) {
      try {
        assertAgentActionAllowed(
          params.agentId,
          params.actionType,
        );
      } catch (error) {
        violations.push(
          error instanceof Error
            ? error.message
            : "SECURITY_BLOCK",
        );

        guardrailFlags.push(
          "SECURITY_POLICY_BLOCK",
        );
      }
    }

    /* =====================================================
     * 3. HIGH-RISK GUARDRAILS
     * =================================================== */

    for (
      const pattern of
        AgentSupervisor.HIGH_RISK_PATTERNS
    ) {
      if (pattern.test(goal)) {
        violations.push(
          `HIGH_RISK_OPERATION_DETECTED: Padrão perigoso identificado '${pattern.source}'`,
        );
      }
    }

    /* =====================================================
     * 4. RBAC
     * =================================================== */

    if (userRole === "VIEWER") {
      const writeKeywords =
        /\b(criar|adicionar|editar|alterar|apagar|executar|eliminar|salvar|enviar)\b/i;

      if (writeKeywords.test(goal)) {
        violations.push(
          "RBAC_RESTRICTION: O perfil VIEWER possui apenas permissão de leitura.",
        );

        guardrailFlags.push(
          "RBAC_WRITE_BLOCK",
        );
      }
    }

    /* =====================================================
     * 5. CAPABILITY CHECK
     * =================================================== */

    if (params.capability) {
      const capability =
        params.capability;

      const capabilityPolicy =
        agentProfile.capabilities;

      const capabilityAllowed =
        capabilityPolicy.allowed.includes(
          capability,
        );

      const capabilityDenied =
        capabilityPolicy.denied.includes(
          capability,
        );

      const capabilityOwnerOnly =
        capabilityPolicy.ownerOnly.includes(
          capability,
        );

      /* ---------------------------------------------------
       * Explicit denial
       * ------------------------------------------------- */

      if (capabilityDenied) {
        violations.push(
          `CAPABILITY_DENIED: Agent '${params.agentId}' cannot use '${capability}'.`,
        );

        guardrailFlags.push(
          "CAPABILITY_DENIED",
        );
      }

      /* ---------------------------------------------------
       * Owner-only capability
       * ------------------------------------------------- */

      if (
        capabilityOwnerOnly &&
        userRole !== "OWNER"
      ) {
        violations.push(
          `OWNER_APPROVAL_REQUIRED: Capability '${capability}' requires OWNER authorization.`,
        );

        guardrailFlags.push(
          "OWNER_APPROVAL_REQUIRED",
        );
      }

      /* ---------------------------------------------------
       * Capability not granted
       * ------------------------------------------------- */

      if (
        !capabilityAllowed &&
        !capabilityDenied &&
        !capabilityOwnerOnly
      ) {
        violations.push(
          `CAPABILITY_NOT_GRANTED: Agent '${params.agentId}' does not have '${capability}'.`,
        );

        guardrailFlags.push(
          "CAPABILITY_NOT_GRANTED",
        );
      }

      /* ---------------------------------------------------
       * Explicitly protected actions
       * ------------------------------------------------- */

      const protectedCapabilities:
        AgentCapability[] = [
          "DEPLOY",
        ];

      if (
        protectedCapabilities.includes(
          capability,
        ) &&
        userRole !== "OWNER"
      ) {
        violations.push(
          `OWNER_APPROVAL_REQUIRED: '${capability}' requires explicit OWNER authorization.`,
        );

        guardrailFlags.push(
          "PROTECTED_CAPABILITY",
        );
      }
    }

    /* =====================================================
     * 6. DETERMINE AUTONOMY
     * =================================================== */

    let autonomyLevel:
      AutonomyLevel = 0;

    let requiresOwnerConfirmation =
      false;

    for (
      const pattern of
        AgentSupervisor.OWNER_CONFIRMATION_PATTERNS
    ) {
      if (pattern.test(goal)) {
        autonomyLevel = 2;

        requiresOwnerConfirmation = true;

        guardrailFlags.push(
          "LEVEL_2_OWNER_AUTHORIZATION_MANDATORY",
        );

        break;
      }
    }

    /* =====================================================
     * 7. AUTONOMY OVERRIDE
     * =================================================== */

    if (
      params.autonomyOverride !==
      undefined
    ) {
      autonomyLevel =
        Math.max(
          autonomyLevel,
          params.autonomyOverride,
        ) as AutonomyLevel;

      if (
        autonomyLevel === 2
      ) {
        requiresOwnerConfirmation =
          true;
      }
    }

    /*
     * Um agente nunca pode usar override
     * para elevar a própria autoridade.
     */

    if (
      params.autonomyOverride === 2 &&
      userRole !== "OWNER"
    ) {
      violations.push(
        "AUTONOMY_OVERRIDE_REJECTED: Agent cannot elevate its own autonomy level.",
      );

      guardrailFlags.push(
        "AUTONOMY_ESCALATION_BLOCKED",
      );

      requiresOwnerConfirmation =
        true;

      autonomyLevel = 2;
    }

    /* =====================================================
     * 8. APPLY AUTONOMY POLICY
     * =================================================== */

    if (params.capability) {
      const policyVerdict =
        this.autonomyPolicy.evaluate({
          agentId:
            params.agentId,

          capability:
            params.capability,

          userRole,

          requestedAutonomy:
            params.autonomyOverride,

          policy:
            agentProfile.capabilities,
        });

      if (!policyVerdict.allowed) {
        violations.push(
          ...policyVerdict.violations,
        );

        guardrailFlags.push(
          ...policyVerdict.guardrailFlags,
        );
      }

      if (
        policyVerdict
          .requiresOwnerConfirmation
      ) {
        requiresOwnerConfirmation =
          true;

        autonomyLevel = 2;
      }
    }

    /* =====================================================
     * 9. OWNER APPROVAL LOGIC
     * =================================================== */

    if (
      violations.length > 0 &&
      userRole === "OWNER"
    ) {
      autonomyLevel = 2;

      requiresOwnerConfirmation =
        true;

      guardrailFlags.push(
        "OWNER_WARNING_HIGH_IMPACT",
      );
    }

    /* =====================================================
     * 10. NON-OWNER BLOCK
     * =================================================== */

    if (
      violations.length > 0 &&
      userRole !== "OWNER"
    ) {
      return {
        allowed: false,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation:
          requiresOwnerConfirmation,

        violations,

        guardrailFlags: [
          ...guardrailFlags,
          "EXECUTION_BLOCKED_BY_SUPERVISOR",
        ],

        maxAllowedTokens: 0,

        timeoutMs: 0,

        timestamp:
          new Date().toISOString(),
      };
    }

    /* =====================================================
     * 11. OWNER WITH REQUIRED CONFIRMATION
     * =================================================== */

    if (
      requiresOwnerConfirmation
    ) {
      return {
        allowed: true,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation:
          true,

        violations,

        guardrailFlags,

        maxAllowedTokens: 4096,

        timeoutMs: 30000,

        timestamp:
          new Date().toISOString(),
      };
    }

    /* =====================================================
     * 12. NORMAL AUTONOMOUS EXECUTION
     * =================================================== */

    return {
      allowed: true,

      autonomyLevel,

      requiredRole: "AGENT",

      requiresOwnerConfirmation:
        false,

      violations,

      guardrailFlags,

      maxAllowedTokens: 4096,

      timeoutMs: 30000,

      timestamp:
        new Date().toISOString(),
    };
  }

  /* =======================================================
   * OUTPUT INSPECTION
   * ======================================================= */

  public inspectOutput(
    output: string,
  ): {
    isSafe: boolean;

    flags: string[];

    sanitizedOutput: string;
  } {
    const flags: string[] = [];

    let sanitized =
      output;

    if (
      output.includes(
        "API_KEY_SECRET",
      ) ||
      output.includes(
        "PRIVATE_KEY_BEGIN",
      )
    ) {
      flags.push(
        "SENSITIVE_CREDENTIAL_LEAK_PREVENTED",
      );

      sanitized =
        sanitized.replace(
          /(?:sk-[a-zA-Z0-9]{20,}|PRIVATE_KEY_BEGIN[\s\S]*?END)/g,
          "[REDACTED_BY_SUPERVISOR]",
        );
    }

    if (
      output.includes(
        "TODO_IMPLEMENT_LATER",
      ) ||
      output.includes(
        "PLACEHOLDER_NOT_REAL",
      )
    ) {
      flags.push(
        "INCOMPLETE_OR_PLACEHOLDER_OUTPUT_DETECTED",
      );
    }

    return {
      isSafe:
        flags.length === 0,

      flags,

      sanitizedOutput:
        sanitized,
    };
  }
}

/* =========================================================
 * SINGLETON
 * ======================================================= */

export const agentSupervisor =
  AgentSupervisor.getInstance();
