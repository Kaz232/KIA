/**
 * KIA — Artifact Types
 */

export type ArtifactStatus =
  | "CREATED"
  | "PROCESSING"
  | "READY"
  | "REVISED"
  | "FAILED"
  | "DELETED";

export type ArtifactKind =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "JSON"
  | "TEXT"
  | "CODE"
  | "ZIP"
  | "OTHER";

export interface ArtifactMetadata {
  [key: string]: unknown;
}

export interface ArtifactRecord {
  artifactId: string;

  executionId?: string;
  taskId?: string;
  ownerId?: string;

  name: string;
  kind: ArtifactKind;
  mimeType: string;

  size: number;
  checksum?: string;

  storageKey: string;

  version: number;
  parentArtifactId?: string;

  status: ArtifactStatus;

  metadata: ArtifactMetadata;

  createdAt: string;
  updatedAt: string;
}

export interface CreateArtifactInput {
  name: string;
  kind: ArtifactKind;
  mimeType: string;

  data: Buffer | string;

  executionId?: string;
  taskId?: string;
  ownerId?: string;

  metadata?: ArtifactMetadata;

  parentArtifactId?: string;
}
