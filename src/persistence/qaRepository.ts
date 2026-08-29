/**
 * GAG CORE OS — FASE 3: QA REPOSITORY
 * Persistent database operations for QA evaluation audits.
 */

import { dbClient } from "./supabaseClient";

export interface QARecord {
  id: string;
  execution_id: string;
  step_id: string;
  task_id?: string;
  agent_id?: string;
  score: number;
  passed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  requires_retry: boolean;
  requires_owner_approval: boolean;
  evaluated_at?: string;
  created_at?: string;
}

export class QARepository {
  private static instance: QARepository;

  private constructor() {}

  public static getInstance(): QARepository {
    if (!QARepository.instance) {
      QARepository.instance = new QARepository();
    }
    return QARepository.instance;
  }

  public async record(qa: QARecord): Promise<QARecord> {
    return dbClient.insert<QARecord>("qa_reports", qa);
  }

  public async getByExecutionId(executionId: string): Promise<QARecord[]> {
    return dbClient.select<QARecord>("qa_reports", (q) => q.execution_id === executionId);
  }

  public async getLatestByStepId(stepId: string): Promise<QARecord | null> {
    const list = await dbClient.select<QARecord>("qa_reports", (q) => q.step_id === stepId);
    if (list.length === 0) return null;
    return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
  }

  public async getPassingReports(executionId: string): Promise<QARecord[]> {
    return dbClient.select<QARecord>("qa_reports", (q) => q.execution_id === executionId && q.passed);
  }
}

export const qaRepository = QARepository.getInstance();
