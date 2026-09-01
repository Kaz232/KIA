/**
 * KIA — Capability Layer
 *
 * Define as operações que um agente pode executar.
 * As permissões são somente declarativas aqui.
 * A autorização efetiva deve ser feita pelo Supervisor/Autonomy Policy.
 */

export const AGENT_CAPABILITIES = [
  "READ",
  "WRITE",
  "EDIT",
  "CORRECT",
  "REVIEW",
  "SEND",
  "RUN_TESTS",
  "READ_CODE",
  "WRITE_CODE",
  "EDIT_CODE",
  "DEPLOY",
] as const;

export type AgentCapability = (typeof AGENT_CAPABILITIES)[number];

export interface CapabilityPolicy {
  allowed: AgentCapability[];
  denied: AgentCapability[];
  ownerOnly: AgentCapability[];
}

export interface CapabilityCheck {
  agentId: string;
  capability: AgentCapability;
  allowed: boolean;
  reason: string;
}

/**
 * Capacidades protegidas.
 *
 * Nenhum agente pode conceder, remover ou alterar
 * as próprias permissões através desta camada.
 */
export const PROTECTED_CAPABILITIES = [
  "DEPLOY",
] as const;

/**
 * Capacidades que nunca devem ser modificadas
 * pelo próprio agente.
 */
export const IMMUTABLE_AGENT_CONTROLS = [
  "CHANGE_OWN_PERMISSIONS",
  "CHANGE_OWN_ROLE",
  "GRANT_PERMISSIONS",
  "REVOKE_PERMISSIONS",
  "MODIFY_AUTONOMY_POLICY",
] as const;

export type ImmutableAgentControl =
  (typeof IMMUTABLE_AGENT_CONTROLS)[number];

/**
 * Verifica uma capacidade contra a política fornecida.
 */
export function checkCapability(
  policy: CapabilityPolicy,
  capability: AgentCapability,
): CapabilityCheck {
  if (policy.ownerOnly.includes(capability)) {
    return {
      agentId: "unknown",
      capability,
      allowed: false,
      reason: `Capability ${capability} requires OWNER authorization.`,
    };
  }

  if (policy.denied.includes(capability)) {
    return {
      agentId: "unknown",
      capability,
      allowed: false,
      reason: `Capability ${capability} is explicitly denied.`,
    };
  }

  if (policy.allowed.includes(capability)) {
    return {
      agentId: "unknown",
      capability,
      allowed: true,
      reason: `Capability ${capability} is authorized.`,
    };
  }

  return {
    agentId: "unknown",
    capability,
    allowed: false,
    reason: `Capability ${capability} is not granted.`,
  };
}

/**
 * Verifica se uma ação tenta modificar o próprio
 * modelo de segurança do agente.
 */
export function isProtectedAgentControl(
  action: string,
): boolean {
  return IMMUTABLE_AGENT_CONTROLS.includes(
    action as ImmutableAgentControl,
  );
}
