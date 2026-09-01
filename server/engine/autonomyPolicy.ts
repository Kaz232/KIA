/**
 * KIA — AUTONOMY POLICY
 *
 * Autoridade central para decidir se uma ação:
 *
 * 1. pode executar automaticamente;
 * 2. necessita supervisão;
 * 3. necessita OWNER;
 * 4. deve ser bloqueada.
 */

import {
  AutonomyLevel,
  AgentCapability,
  CapabilityPolicy,
  SupervisorVerdict,
} from "./types";

export interface AutonomyEvaluationInput {
  agentId: string;

  capability: AgentCapability;

  userRole?:
    | "OWNER"
    | "ADMIN"
    | "AGENT"
    | "VIEWER";

  requestedAutonomy?: AutonomyLevel;

  policy: CapabilityPolicy;
}

export class AutonomyPolicy {
  evaluate(
    input: AutonomyEvaluationInput,
  ): SupervisorVerdict {
    const timestamp =
      new Date().toISOString();

    const violations: string[] = [];

    const guardrailFlags: string[] = [];

    const isOwner =
      input.userRole === "OWNER";

    /*
     * OWNER-only capability.
     */
    if (
      input.policy.ownerOnly.includes(
        input.capability,
      )
    ) {
      if (!isOwner) {
        return {
          allowed: false,

          autonomyLevel: 2,

          requiredRole: "OWNER",

          requiresOwnerConfirmation: true,

          violations: [
            `Capability ${input.capability} requires OWNER authorization.`,
          ],

          guardrailFlags: [
            "OWNER_APPROVAL_REQUIRED",
          ],

          timeoutMs: 30000,

          timestamp,
        };
      }

      return {
        allowed: true,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation: true,

        violations,

        guardrailFlags,

        timeoutMs: 30000,

        timestamp,
      };
    }

    /*
     * Explicitly denied capability.
     */
    if (
      input.policy.denied.includes(
        input.capability,
      )
    ) {
      return {
        allowed: false,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation: false,

        violations: [
          `Capability ${input.capability} is denied.`,
        ],

        guardrailFlags: [
          "CAPABILITY_DENIED",
        ],

        timeoutMs: 30000,

        timestamp,
      };
    }

    /*
     * Capability is not granted.
     */
    if (
      !input.policy.allowed.includes(
        input.capability,
      )
    ) {
      return {
        allowed: false,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation: false,

        violations: [
          `Capability ${input.capability} is not granted to agent ${input.agentId}.`,
        ],

        guardrailFlags: [
          "CAPABILITY_NOT_GRANTED",
        ],

        timeoutMs: 30000,

        timestamp,
      };
    }

    /*
     * Requested autonomy override cannot
     * bypass security.
     */
    if (
      input.requestedAutonomy === 2 &&
      !isOwner
    ) {
      guardrailFlags.push(
        "AUTONOMY_OVERRIDE_REJECTED",
      );

      return {
        allowed: false,

        autonomyLevel: 2,

        requiredRole: "OWNER",

        requiresOwnerConfirmation: true,

        violations: [
          "Agent cannot elevate its own autonomy level.",
        ],

        guardrailFlags,

        timeoutMs: 30000,

        timestamp,
      };
    }

    /*
     * Normal authorized operation.
     */
    return {
      allowed: true,

      autonomyLevel:
        input.requestedAutonomy ?? 0,

      requiredRole: "AGENT",

      requiresOwnerConfirmation: false,

      violations,

      guardrailFlags,

      timeoutMs: 30000,

      timestamp,
    };
  }
}

export const autonomyPolicy = new AutonomyPolicy();
