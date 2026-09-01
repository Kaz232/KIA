import { createHash, randomUUID } from "node:crypto";
import {
  ArtifactRecord,
  CreateArtifactInput,
} from "./artifactTypes";

export interface StoredArtifact {
  record: ArtifactRecord;
  data: Buffer;
}

/**
 * Storage interno inicial.
 *
 * IMPORTANTE:
 * Este store é uma camada abstrata.
 * Posteriormente poderá ser ligado a:
 *
 * - Supabase Storage
 * - Firebase Storage
 * - S3
 * - Cloudflare R2
 * - filesystem local
 *
 * sem alterar o Execution Engine.
 */
export class ArtifactStore {
  private readonly artifacts = new Map<
    string,
    StoredArtifact
  >();

  async create(
    input: CreateArtifactInput,
  ): Promise<ArtifactRecord> {
    const artifactId = randomUUID();

    const data =
      typeof input.data === "string"
        ? Buffer.from(input.data, "utf-8")
        : input.data;

    const checksum = createHash("sha256")
      .update(data)
      .digest("hex");

    const now = new Date().toISOString();

    const record: ArtifactRecord = {
      artifactId,

      executionId: input.executionId,
      taskId: input.taskId,
      ownerId: input.ownerId,

      name: input.name,
      kind: input.kind,
      mimeType: input.mimeType,

      size: data.length,
      checksum,

      storageKey: `artifacts/${artifactId}/${input.name}`,

      version: 1,

      parentArtifactId:
        input.parentArtifactId,

      status: "READY",

      metadata: input.metadata ?? {},

      createdAt: now,
      updatedAt: now,
    };

    this.artifacts.set(artifactId, {
      record,
      data,
    });

    return record;
  }

  async get(
    artifactId: string,
  ): Promise<StoredArtifact | null> {
    return this.artifacts.get(artifactId) ?? null;
  }

  async getData(
    artifactId: string,
  ): Promise<Buffer | null> {
    const artifact =
      this.artifacts.get(artifactId);

    return artifact?.data ?? null;
  }

  async update(
    artifactId: string,
    data: Buffer | string,
  ): Promise<ArtifactRecord> {
    const existing =
      this.artifacts.get(artifactId);

    if (!existing) {
      throw new Error(
        `Artifact not found: ${artifactId}`,
      );
    }

    const buffer =
      typeof data === "string"
        ? Buffer.from(data, "utf-8")
        : data;

    const checksum = createHash("sha256")
      .update(buffer)
      .digest("hex");

    const updated: ArtifactRecord = {
      ...existing.record,

      size: buffer.length,
      checksum,

      version:
        existing.record.version + 1,

      status: "REVISED",

      updatedAt:
        new Date().toISOString(),
    };

    this.artifacts.set(artifactId, {
      record: updated,
      data: buffer,
    });

    return updated;
  }

  async delete(
    artifactId: string,
  ): Promise<void> {
    const existing =
      this.artifacts.get(artifactId);

    if (!existing) {
      throw new Error(
        `Artifact not found: ${artifactId}`,
      );
    }

    existing.record.status = "DELETED";
    existing.record.updatedAt =
      new Date().toISOString();

    this.artifacts.set(
      artifactId,
      existing,
    );
  }

  async listByExecution(
    executionId: string,
  ): Promise<ArtifactRecord[]> {
    return Array.from(
      this.artifacts.values(),
    )
      .filter(
        (item) =>
          item.record.executionId ===
          executionId,
      )
      .map((item) => item.record);
  }
}

export const artifactStore = new ArtifactStore();
