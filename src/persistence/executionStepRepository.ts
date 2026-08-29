/**
 * GAG CORE OS — FASE 3: EXECUTION STEP REPOSITORY
 * Persistent database operations for DAG execution steps.
 */

import { dbClient } from "./supabaseClient";
import { ExecutionState } from "../engine/executionState";

export interface ExecutionStepRecord {
  id: string;
  execution_id: string;
  step_number: number;
  title: string;
  description?: string;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  state: ExecutionState;
  primary_capability_id?: string;
  selected_skills?: string[];
  selected_tools?: string[];
  dependencies?: string[];
  is_parallel_allowed?: boolean;
  input?: Record<string, any>;
  output?: string;
  artifacts?: any[];
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class ExecutionStepRepository {
  private static instance: ExecutionStepRepository;

  private constructor() {}

  public static getInstance(): ExecutionStepRepository {
    if (!ExecutionStepRepository.instance) {
      ExecutionStepRepository.instance = new ExecutionStepRepository();
    }
    return ExecutionStepRepository.instance;
  }

  public async create(step: ExecutionStepRecord): Promise<ExecutionStepRecord> {
    return dbClient.insert<ExecutionStepRecord>("execution_steps", step);
  }

  public async upsert(step: ExecutionStepRecord): Promise<ExecutionStepRecord> {
    return dbClient.upsert<ExecutionStepRecord>("execution_steps", step, "id");
  }

  public async getById(id: string): Promise<ExecutionStepRecord | null> {
    return dbClient.selectById<ExecutionStepRecord>("execution_steps", id);
  }

  public async getByExecutionId(executionId: string): Promise<ExecutionStepRecord[]> {
    const list = await dbClient.select<ExecutionStepRecord>(
      "execution_steps",
      (s) => s.execution_id === executionId
    );
    return list.sort((a, b) => a.step_number - b.step_number);
  }

  public async updateState(
    id: string,
    state: ExecutionState,
    extraUpdates?: Partial<ExecutionStepRecord>
  ): Promise<ExecutionStepRecord | null> {
    return dbClient.update<ExecutionStepRecord>("execution_steps", id, {
      state,
      ...extraUpdates,
    });
  }

  public async deleteByExecutionId(executionId: string): Promise<void> {
    const steps = await this.getByExecutionId(executionId);
    for (const s of steps) {
      await dbClient.delete("execution_steps", s.id);
    }
  }
}

export const executionStepRepository = ExecutionStepRepository.getInstance();
