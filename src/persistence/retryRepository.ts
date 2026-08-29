/**
 * GAG CORE OS — FASE 3: RETRY REPOSITORY
 * Persistent database operations for self-correction retries.
 */

import { dbClient } from "./supabaseClient";

export interface RetryRecord {
  id: string;
  execution_id: string;
  step_id: string;
  task_id?: string;
  agent_id?: string;
  attempt_number: number;
  reason: string;
  error_details?: string;
  qa_score?: number;
  adapted_prompt?: string;
  created_at?: string;
}

export class RetryRepository {
  private static instance: RetryRepository;

  private constructor() {}

  public static getInstance(): RetryRepository {
    if (!RetryRepository.instance) {
      RetryRepository.instance = new RetryRepository();
    }
    return RetryRepository.instance;
  }

  public async record(retry: RetryRecord): Promise<RetryRecord> {
    return dbClient.insert<RetryRecord>("retry_attempts", retry);
  }

  public async getByExecutionId(executionId: string): Promise<RetryRecord[]> {
    const list = await dbClient.select<RetryRecord>(
      "retry_attempts",
      (r) => r.execution_id === executionId
    );
    return list.sort((a, b) => a.attempt_number - b.attempt_number);
  }

  public async getByStepId(stepId: string): Promise<RetryRecord[]> {
    const list = await dbClient.select<RetryRecord>(
      "retry_attempts",
      (r) => r.step_id === stepId
    );
    return list.sort((a, b) => a.attempt_number - b.attempt_number);
  }

  public async getLatestAttemptNumber(executionId: string, stepId: string): Promise<number> {
    const attempts = await dbClient.select<RetryRecord>(
      "retry_attempts",
      (r) => r.execution_id === executionId && r.step_id === stepId
    );
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map((a) => a.attempt_number));
  }
}

export const retryRepository = RetryRepository.getInstance();
