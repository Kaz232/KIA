/**
 * GAG CORE OS — FASE 3: EXECUTION REPOSITORY
 * Persistent database operations for autonomous pipeline executions.
 */

import { dbClient } from "./supabaseClient";
import { ExecutionState } from "../engine/executionState";

export interface ExecutionRecord {
  id: string;
  goal: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  state: ExecutionState;
  preferred_agent_id?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  total_retries: number;
  total_handoffs: number;
  idempotency_key?: string;
  created_at?: string;
  updated_at?: string;
}

export class ExecutionRepository {
  private static instance: ExecutionRepository;

  private constructor() {}

  public static getInstance(): ExecutionRepository {
    if (!ExecutionRepository.instance) {
      ExecutionRepository.instance = new ExecutionRepository();
    }
    return ExecutionRepository.instance;
  }

  public async create(record: Omit<ExecutionRecord, "created_at" | "updated_at">): Promise<ExecutionRecord> {
    // Idempotency check if idempotency_key is provided
    if (record.idempotency_key) {
      const existing = await this.findByIdempotencyKey(record.idempotency_key);
      if (existing) {
        return existing;
      }
    }

    return dbClient.insert<ExecutionRecord>("executions", {
      ...record,
      total_retries: record.total_retries || 0,
      total_handoffs: record.total_handoffs || 0,
    });
  }

  public async getById(id: string): Promise<ExecutionRecord | null> {
    return dbClient.selectById<ExecutionRecord>("executions", id);
  }

  public async findByIdempotencyKey(key: string): Promise<ExecutionRecord | null> {
    const list = await dbClient.select<ExecutionRecord>(
      "executions",
      (e) => e.idempotency_key === key
    );
    return list.length > 0 ? list[0] : null;
  }

  public async updateState(
    id: string,
    state: ExecutionState,
    extraUpdates?: Partial<ExecutionRecord>
  ): Promise<ExecutionRecord | null> {
    const updates: Partial<ExecutionRecord> = {
      state,
      ...extraUpdates,
    };
    if (state === "COMPLETED" || state === "FAILED" || state === "CANCELLED") {
      updates.completed_at = updates.completed_at || new Date().toISOString();
    }
    return dbClient.update<ExecutionRecord>("executions", id, updates);
  }

  public async getAll(limit = 100): Promise<ExecutionRecord[]> {
    const all = await dbClient.select<ExecutionRecord>("executions");
    return all
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, limit);
  }

  public async getActiveExecutions(): Promise<ExecutionRecord[]> {
    const activeStates: ExecutionState[] = [
      "QUEUED",
      "PLANNING",
      "ASSIGNED",
      "IN_PROGRESS",
      "QA_PENDING",
      "RETRYING",
      "HANDOFF_PENDING",
      "OWNER_APPROVAL_REQUIRED",
    ];
    return dbClient.select<ExecutionRecord>("executions", (e) => activeStates.includes(e.state));
  }

  public async delete(id: string): Promise<boolean> {
    return dbClient.delete("executions", id);
  }
}

export const executionRepository = ExecutionRepository.getInstance();
