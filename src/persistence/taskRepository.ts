/**
 * GAG CORE OS — FASE 3: TASK REPOSITORY
 * Persistent database operations for operational tasks and backlog items.
 */

import { dbClient } from "./supabaseClient";

export interface TaskRecord {
  id: string;
  execution_id?: string;
  parent_task_id?: string;
  title: string;
  objective?: string;
  agent_id?: string;
  state: "PENDING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "CANCELLED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "URGENT";
  dependencies?: string[];
  input?: Record<string, any>;
  output?: string;
  deliverables?: any[];
  scheduled_for?: string;
  idempotency_key?: string;
  created_at?: string;
  updated_at?: string;
}

export class TaskRepository {
  private static instance: TaskRepository;

  private constructor() {}

  public static getInstance(): TaskRepository {
    if (!TaskRepository.instance) {
      TaskRepository.instance = new TaskRepository();
    }
    return TaskRepository.instance;
  }

  public async create(task: TaskRecord): Promise<TaskRecord> {
    if (task.idempotency_key) {
      const existing = await this.findByIdempotencyKey(task.idempotency_key);
      if (existing) {
        return existing;
      }
    }
    return dbClient.insert<TaskRecord>("tasks", task);
  }

  public async upsert(task: TaskRecord): Promise<TaskRecord> {
    return dbClient.upsert<TaskRecord>("tasks", task, "id");
  }

  public async getById(id: string): Promise<TaskRecord | null> {
    return dbClient.selectById<TaskRecord>("tasks", id);
  }

  public async findByIdempotencyKey(key: string): Promise<TaskRecord | null> {
    const list = await dbClient.select<TaskRecord>("tasks", (t) => t.idempotency_key === key);
    return list.length > 0 ? list[0] : null;
  }

  public async getAll(limit = 100): Promise<TaskRecord[]> {
    const all = await dbClient.select<TaskRecord>("tasks");
    return all
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, limit);
  }

  public async getByExecutionId(executionId: string): Promise<TaskRecord[]> {
    return dbClient.select<TaskRecord>("tasks", (t) => t.execution_id === executionId);
  }

  public async getByAgentId(agentId: string): Promise<TaskRecord[]> {
    return dbClient.select<TaskRecord>("tasks", (t) => t.agent_id === agentId);
  }

  public async updateState(
    id: string,
    state: TaskRecord["state"],
    output?: string,
    deliverables?: any[]
  ): Promise<TaskRecord | null> {
    const updates: Partial<TaskRecord> = { state };
    if (output !== undefined) updates.output = output;
    if (deliverables !== undefined) updates.deliverables = deliverables;
    return dbClient.update<TaskRecord>("tasks", id, updates);
  }

  public async delete(id: string): Promise<boolean> {
    return dbClient.delete("tasks", id);
  }
}

export const taskRepository = TaskRepository.getInstance();
