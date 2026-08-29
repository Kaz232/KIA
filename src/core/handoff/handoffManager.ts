import { AgentHandoff } from "../types";

export class HandoffManager {
  private static instance: HandoffManager;
  private handoffHistory: AgentHandoff[] = [];

  public static getInstance(): HandoffManager {
    if (!HandoffManager.instance) {
      HandoffManager.instance = new HandoffManager();
    }
    return HandoffManager.instance;
  }

  public recordHandoff(
    fromAgentId: string,
    toAgentId: string,
    reason: string,
    payload: any,
    createdTaskId?: string
  ): AgentHandoff {
    const handoff: AgentHandoff = {
      fromAgentId,
      toAgentId,
      reason,
      payload,
      createdTaskId,
      timestamp: new Date().toISOString(),
    };
    this.handoffHistory.push(handoff);
    return handoff;
  }

  public getHandoffsForTask(taskId: string): AgentHandoff[] {
    return this.handoffHistory.filter((h) => h.createdTaskId === taskId);
  }

  public getAllHandoffs(): AgentHandoff[] {
    return [...this.handoffHistory];
  }
}
