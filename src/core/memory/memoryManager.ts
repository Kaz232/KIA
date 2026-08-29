import { ThreeTierMemory, OrchestratedTask, AgentHandoff, PolicyRule } from "../types";
import { PolicyManager } from "../policies/policyManager";

export class MemoryManager {
  private static instance: MemoryManager;
  private memory: ThreeTierMemory;

  private constructor() {
    this.memory = {
      session: {
        activeConversationId: "default-session",
        scratchpad: {},
        lastTurnTimestamp: new Date().toISOString(),
      },
      operational: {
        tasksQueue: [],
        activeHandoffs: [],
        cachedDeliverables: {},
        recentDecisions: [],
      },
      permanent: {
        knowledgeVersion: "2026.1",
        brandGuidelinesSummary: "GAG Visual / GAG Labs: Soluções com propósito, inovação com raízes. Metodologia TOB (Tecnologia, Organização, Branding). Paleta: #0A0A0F, #003FD3, #DAA520. Sinal obrigatório 50%, taxa urgência 48h +50%.",
        clientPlaybooksSummary: "Playbooks de alta autoridade, fechamento High-Ticket, auditoria forense ENDE/Unitel/DSTV, triagem Inbox Zero.",
        approvedPolicies: PolicyManager.getInstance().getAllPolicies(),
      },
    };
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Session Memory
  public setSessionScratchpad(key: string, value: any): void {
    this.memory.session.scratchpad[key] = value;
    this.memory.session.lastTurnTimestamp = new Date().toISOString();
  }

  public getSessionScratchpad(key: string): any {
    return this.memory.session.scratchpad[key];
  }

  public clearSessionScratchpad(): void {
    this.memory.session.scratchpad = {};
  }

  // Operational Memory
  public recordDecision(decision: string, rationale: string): void {
    this.memory.operational.recentDecisions.unshift({
      decision,
      rationale,
      timestamp: new Date().toISOString(),
    });
    if (this.memory.operational.recentDecisions.length > 20) {
      this.memory.operational.recentDecisions.pop();
    }
  }

  public cacheDeliverable(taskId: string, deliverable: any): void {
    this.memory.operational.cachedDeliverables[taskId] = deliverable;
  }

  public getCachedDeliverable(taskId: string): any {
    return this.memory.operational.cachedDeliverables[taskId];
  }

  // Permanent Memory
  public getBrandGuidelinesSummary(): string {
    return this.memory.permanent.brandGuidelinesSummary;
  }

  public getSnapshot(): ThreeTierMemory {
    return JSON.parse(JSON.stringify(this.memory));
  }
}
