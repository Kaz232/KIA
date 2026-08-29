/**
 * GAG CORE OS — FASE 3: ARTIFACT REPOSITORY
 * Persistent database operations for artifact metadata.
 */

import { dbClient } from "./supabaseClient";

export type ArtifactCategory =
  | "documents"
  | "images"
  | "videos"
  | "audio"
  | "spreadsheets"
  | "code"
  | "archives"
  | "other";

export interface ArtifactRecord {
  id: string;
  execution_id?: string;
  step_id?: string;
  task_id?: string;
  agent_id?: string;
  name: string;
  type: string;
  category: ArtifactCategory;
  storage_path?: string;
  file_size: number;
  mime_type: string;
  public_url?: string;
  content_hash?: string;
  metadata?: Record<string, any>;
  idempotency_key?: string;
  created_at?: string;
  updated_at?: string;
}

export class ArtifactRepository {
  private static instance: ArtifactRepository;

  private constructor() {}

  public static getInstance(): ArtifactRepository {
    if (!ArtifactRepository.instance) {
      ArtifactRepository.instance = new ArtifactRepository();
    }
    return ArtifactRepository.instance;
  }

  public async save(artifact: ArtifactRecord): Promise<ArtifactRecord> {
    if (artifact.idempotency_key) {
      const existing = await this.findByIdempotencyKey(artifact.idempotency_key);
      if (existing) {
        return existing;
      }
    }
    return dbClient.upsert<ArtifactRecord>("artifacts", artifact, "id");
  }

  public async getById(id: string): Promise<ArtifactRecord | null> {
    return dbClient.selectById<ArtifactRecord>("artifacts", id);
  }

  public async findByIdempotencyKey(key: string): Promise<ArtifactRecord | null> {
    const list = await dbClient.select<ArtifactRecord>("artifacts", (a) => a.idempotency_key === key);
    return list.length > 0 ? list[0] : null;
  }

  public async getAll(limit = 100): Promise<ArtifactRecord[]> {
    const all = await dbClient.select<ArtifactRecord>("artifacts");
    return all
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, limit);
  }

  public async getByExecutionId(executionId: string): Promise<ArtifactRecord[]> {
    return dbClient.select<ArtifactRecord>("artifacts", (a) => a.execution_id === executionId);
  }

  public async getByCategory(category: ArtifactCategory): Promise<ArtifactRecord[]> {
    return dbClient.select<ArtifactRecord>("artifacts", (a) => a.category === category);
  }

  public async delete(id: string): Promise<boolean> {
    return dbClient.delete("artifacts", id);
  }
}

export const artifactRepository = ArtifactRepository.getInstance();
