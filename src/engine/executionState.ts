/**
 * GAG CORE OS — FASE 1: EXECUTION STATE MACHINE
 * Strictly defines valid states, transitions, terminal criteria, and state validation.
 */

export type ExecutionState =
  | "QUEUED"
  | "PLANNING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "QA_PENDING"
  | "QA_PASSED"
  | "QA_FAILED"
  | "RETRYING"
  | "HANDOFF_PENDING"
  | "HANDED_OFF"
  | "OWNER_APPROVAL_REQUIRED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export const TERMINAL_STATES: ReadonlySet<ExecutionState> = new Set([
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const ACTIVE_STATES: ReadonlySet<ExecutionState> = new Set([
  "QUEUED",
  "PLANNING",
  "ASSIGNED",
  "IN_PROGRESS",
  "QA_PENDING",
  "QA_PASSED",
  "QA_FAILED",
  "RETRYING",
  "HANDOFF_PENDING",
  "HANDED_OFF",
  "OWNER_APPROVAL_REQUIRED",
]);

/**
 * Valid state transition graph for the execution lifecycle.
 */
export const VALID_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
  QUEUED: ["PLANNING", "ASSIGNED", "CANCELLED", "FAILED", "OWNER_APPROVAL_REQUIRED"],
  PLANNING: ["ASSIGNED", "QUEUED", "OWNER_APPROVAL_REQUIRED", "FAILED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "HANDOFF_PENDING", "OWNER_APPROVAL_REQUIRED", "CANCELLED", "FAILED"],
  IN_PROGRESS: ["QA_PENDING", "HANDOFF_PENDING", "OWNER_APPROVAL_REQUIRED", "RETRYING", "FAILED", "CANCELLED"],
  QA_PENDING: ["QA_PASSED", "QA_FAILED", "OWNER_APPROVAL_REQUIRED", "FAILED", "CANCELLED"],
  QA_PASSED: ["COMPLETED", "ASSIGNED", "PLANNING"], // next step or completion
  QA_FAILED: ["RETRYING", "HANDOFF_PENDING", "OWNER_APPROVAL_REQUIRED", "FAILED"],
  RETRYING: ["IN_PROGRESS", "HANDOFF_PENDING", "FAILED", "CANCELLED"],
  HANDOFF_PENDING: ["HANDED_OFF", "ASSIGNED", "IN_PROGRESS", "OWNER_APPROVAL_REQUIRED", "FAILED", "CANCELLED"],
  HANDED_OFF: ["ASSIGNED", "IN_PROGRESS", "FAILED", "CANCELLED"],
  OWNER_APPROVAL_REQUIRED: ["QUEUED", "PLANNING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export class ExecutionStateMachine {
  /**
   * Checks if a transition from `current` to `target` state is legal.
   */
  public static canTransition(current: ExecutionState, target: ExecutionState): boolean {
    if (current === target) return true;
    const allowed = VALID_TRANSITIONS[current];
    return allowed ? allowed.includes(target) : false;
  }

  /**
   * Validates transition and throws an error if illegal.
   */
  public static validateTransition(current: ExecutionState, target: ExecutionState): void {
    if (!this.canTransition(current, target)) {
      throw new Error(`Transição de estado inválida no GAG Execution Engine: de [${current}] para [${target}].`);
    }
  }

  /**
   * Checks if state is terminal (execution finished).
   */
  public static isTerminal(state: ExecutionState): boolean {
    return TERMINAL_STATES.has(state);
  }

  /**
   * Checks if state is active.
   */
  public static isActive(state: ExecutionState): boolean {
    return ACTIVE_STATES.has(state);
  }

  /**
   * Returns human-readable label for UI / Audit.
   */
  public static getLabel(state: ExecutionState): string {
    const labels: Record<ExecutionState, string> = {
      QUEUED: "Na Fila",
      PLANNING: "Em Planeamento / Decomposição",
      ASSIGNED: "Atribuído ao Agente",
      IN_PROGRESS: "Em Execução Ativa",
      QA_PENDING: "Aguardando Auditoria QA",
      QA_PASSED: "Aprovado no QA",
      QA_FAILED: "Reprovado no QA",
      RETRYING: "Em Tentativa de Auto-Correção",
      HANDOFF_PENDING: "Handoff Pendente",
      HANDED_OFF: "Handoff Realizado",
      OWNER_APPROVAL_REQUIRED: "Aprovação do Proprietário Necessária",
      COMPLETED: "Concluído com Sucesso",
      FAILED: "Falhou",
      CANCELLED: "Cancelado",
    };
    return labels[state] || state;
  }
}
