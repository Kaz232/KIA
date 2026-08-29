/**
 * GAG CORE OS — FASE 3: HANDOFF REPOSITORY
 * Persistent database operations for inter-agent handoff delegation events.
 */

import { dbClient } from "./supabaseClient";

export interface HandoffRecord {
  id: string;
  execution_id: string;
  step_id?: string;
  task_id?: string;
  source_agent_id: string;
  target_agent_id: string;
  reason: string;
  context_payload?: Record<string, any>;
  previous_output?: string;
  artifacts?: any[];
  handoff_depth: number;
  created_at?: string;
}

export class HandoffRepository {
  private static instance: HandoffRepository;

  private constructor() {}

  public static getInstance(): HandoffRepository {
    if (!HandoffRepository.instance) {
      HandoffRepository.instance = new HandoffRepository();
    }
    return HandoffRepository.instance;
  }

  public async record(handoff: HandoffRecord): Promise<HandoffRecord> {
    return dbClient.insert<HandoffRecord>("handoffs", handoff);
  }

  public async getByExecutionId(executionId: string): Promise<HandoffRecord[]> {
    const list = await dbClient.select<HandoffRecord>(
      "handoffs",
      (h) => h.execution_id === executionId
    );
    return list.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
  }

  public async getHandoffChain(executionId: string): Promise<string[]> {
    const records = await this.getByExecutionId(executionId);
    const chain: string[] = [];
    for (const r of records) {
      if (chain.length === 0) chain.push(r.source_agent_id);
      chain.push(r.target_agent_id);
    }
    return chain;
  }

  public async countByExecutionId(executionId: string): Promise<number> {
    const list = await this.getByExecutionId(executionId);
    return list.length;
  }
}

export const handoffRepository = HandoffRepository.getInstance();
