/**
 * KIA — SECURITY POLICY
 *
 * Regras imutáveis de segurança.
 */

const FORBIDDEN_AGENT_CONTROLS = new Set([
  "CHANGE_OWN_PERMISSIONS",
  "CHANGE_OWN_ROLE",
  "GRANT_PERMISSIONS",
  "REVOKE_PERMISSIONS",
  "MODIFY_AUTONOMY_POLICY",
  "DISABLE_SECURITY",
  "BYPASS_SUPERVISOR",
]);

export function isForbiddenAgentControl(
  action: string,
): boolean {
  return FORBIDDEN_AGENT_CONTROLS.has(
    action,
  );
}

export function assertAgentActionAllowed(
  agentId: string,
  action: string,
): void {
  if (
    isForbiddenAgentControl(action)
  ) {
    throw new Error(
      `SECURITY_BLOCK: Agent ${agentId} cannot perform ${action}.`,
    );
  }
}

export function canAgentModifyOwnPermissions(
  _agentId: string,
): false {
  return false;
}

export function canAgentModifyOwnRole(
  _agentId: string,
): false {
  return false;
}

export function canAgentModifyAutonomyPolicy(
  _agentId: string,
): false {
  return false;
}
