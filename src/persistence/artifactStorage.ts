/**
 * GAG CORE OS — FASE 3: ARTIFACT STORAGE MANAGER
 * Manages physical and binary artifact storage in Supabase Storage (`gag-artifacts` bucket),
 * categorized by subfolders: documents/, images/, videos/, audio/, spreadsheets/, code/, archives/, other/.
 */

import { dbClient } from "./supabaseClient";
import { artifactRepository, ArtifactRecord, ArtifactCategory } from "./artifactRepository";

export interface ArtifactUploadParams {
  name: string;
  type: string;
  content: string | Blob | ArrayBuffer | Uint8Array;
  mimeType?: string;
  executionId?: string;
  stepId?: string;
  taskId?: string;
  agentId?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface ArtifactUploadResult {
  artifact: ArtifactRecord;
  storagePath: string;
  publicUrl?: string;
  isStoredInSupabase: boolean;
}

// In-process resilient storage simulation for offline / testing / fallback
const localBinaryVault: Map<string, { buffer: Uint8Array; mimeType: string }> = new Map();

export class ArtifactStorageManager {
  private static instance: ArtifactStorageManager;
  private readonly BUCKET_NAME = "gag-artifacts";

  private constructor() {}

  public static getInstance(): ArtifactStorageManager {
    if (!ArtifactStorageManager.instance) {
      ArtifactStorageManager.instance = new ArtifactStorageManager();
    }
    return ArtifactStorageManager.instance;
  }

  /**
   * Resolves appropriate storage category and subfolder based on file extension / MIME type.
   */
  public resolveCategory(fileName: string, mimeType?: string): ArtifactCategory {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const mime = (mimeType || "").toLowerCase();

    if (["pdf", "docx", "doc", "txt", "md", "rtf"].includes(ext) || mime.includes("pdf") || mime.includes("document")) {
      return "documents";
    }
    if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) || mime.includes("image")) {
      return "images";
    }
    if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext) || mime.includes("video")) {
      return "videos";
    }
    if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext) || mime.includes("audio")) {
      return "audio";
    }
    if (["xlsx", "xls", "csv", "tsv"].includes(ext) || mime.includes("spreadsheet") || mime.includes("csv")) {
      return "spreadsheets";
    }
    if (["ts", "tsx", "js", "jsx", "json", "html", "css", "py", "sql", "sh"].includes(ext) || mime.includes("json") || mime.includes("javascript")) {
      return "code";
    }
    if (["zip", "tar", "gz", "rar", "7z"].includes(ext) || mime.includes("zip") || mime.includes("compressed")) {
      return "archives";
    }
    return "other";
  }

  /**
   * Resolves standard MIME type from extension if not provided.
   */
  public resolveMimeType(fileName: string, providedMime?: string): string {
    if (providedMime && providedMime.trim() !== "") return providedMime;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const map: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      mp4: "video/mp4",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv: "text/csv",
      txt: "text/plain",
      json: "application/json",
      zip: "application/zip",
    };
    return map[ext] || "application/octet-stream";
  }

  /**
   * Uploads an artifact, stores binary in Supabase Storage (or fallback vault), and records metadata in Postgres.
   */
  public async upload(params: ArtifactUploadParams): Promise<ArtifactUploadResult> {
    const category = this.resolveCategory(params.name, params.mimeType);
    const mimeType = this.resolveMimeType(params.name, params.mimeType);
    const artifactId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedName = params.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${category}/${Date.now()}_${sanitizedName}`;

    // Convert content to Uint8Array for binary handling
    let uint8: Uint8Array;
    if (typeof params.content === "string") {
      uint8 = new TextEncoder().encode(params.content);
    } else if (params.content instanceof Uint8Array) {
      uint8 = params.content;
    } else if (params.content instanceof ArrayBuffer) {
      uint8 = new Uint8Array(params.content);
    } else {
      // Blob / other
      uint8 = new TextEncoder().encode(String(params.content));
    }

    const fileSize = uint8.byteLength;
    let isStoredInSupabase = false;
    let publicUrl = "";

    const rawClient = dbClient.getRawClient();
    if (rawClient && dbClient.isConfigured()) {
      try {
        const { data, error } = await rawClient.storage
          .from(this.BUCKET_NAME)
          .upload(storagePath, uint8, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error && data) {
          isStoredInSupabase = true;
          const { data: urlData } = rawClient.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(storagePath);
          publicUrl = urlData?.publicUrl || "";
        }
      } catch (err) {
        console.warn("Storage upload fallback:", err);
      }
    }

    // Always keep in resilient local binary vault for instant retrieval
    localBinaryVault.set(storagePath, { buffer: uint8, mimeType });
    if (!publicUrl) {
      publicUrl = `/api/artifacts/download/${artifactId}`;
    }

    const record: ArtifactRecord = {
      id: artifactId,
      execution_id: params.executionId,
      step_id: params.stepId,
      task_id: params.taskId,
      agent_id: params.agentId,
      name: params.name,
      type: params.type || params.name.split(".").pop() || "unknown",
      category,
      storage_path: storagePath,
      file_size: fileSize,
      mime_type: mimeType,
      public_url: publicUrl,
      metadata: params.metadata || {},
      idempotency_key: params.idempotencyKey,
    };

    const savedRecord = await artifactRepository.save(record);

    return {
      artifact: savedRecord,
      storagePath,
      publicUrl,
      isStoredInSupabase,
    };
  }

  /**
   * Downloads binary content of an artifact.
   */
  public async download(storagePathOrArtifactId: string): Promise<{ data: Uint8Array; mimeType: string } | null> {
    // 1. Check if input is artifact ID
    let storagePath = storagePathOrArtifactId;
    let mimeType = "application/octet-stream";

    if (storagePathOrArtifactId.startsWith("art_")) {
      const art = await artifactRepository.getById(storagePathOrArtifactId);
      if (art && art.storage_path) {
        storagePath = art.storage_path;
        mimeType = art.mime_type;
      }
    }

    // 2. Try Supabase Storage
    const rawClient = dbClient.getRawClient();
    if (rawClient && dbClient.isConfigured()) {
      try {
        const { data, error } = await rawClient.storage
          .from(this.BUCKET_NAME)
          .download(storagePath);

        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer();
          return { data: new Uint8Array(arrayBuffer), mimeType };
        }
      } catch (e) {
        // Fallback to local vault
      }
    }

    // 3. Fallback to local vault
    const local = localBinaryVault.get(storagePath);
    if (local) {
      return { data: local.buffer, mimeType: local.mimeType || mimeType };
    }

    return null;
  }

  /**
   * Generates a secure pre-signed download URL.
   */
  public async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
    const rawClient = dbClient.getRawClient();
    if (rawClient && dbClient.isConfigured()) {
      try {
        const { data, error } = await rawClient.storage
          .from(this.BUCKET_NAME)
          .createSignedUrl(storagePath, expiresInSeconds);

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (e) {
        // Fallback
      }
    }
    return `/api/artifacts/download?path=${encodeURIComponent(storagePath)}`;
  }

  /**
   * Deletes an artifact from storage and metadata from database.
   */
  public async delete(artifactId: string): Promise<boolean> {
    const art = await artifactRepository.getById(artifactId);
    if (!art) return false;

    if (art.storage_path) {
      localBinaryVault.delete(art.storage_path);
      const rawClient = dbClient.getRawClient();
      if (rawClient && dbClient.isConfigured()) {
        try {
          await rawClient.storage.from(this.BUCKET_NAME).remove([art.storage_path]);
        } catch (e) {
          // Continue deletion
        }
      }
    }

    return artifactRepository.delete(artifactId);
  }

  /**
   * Lists artifacts by category or execution ID.
   */
  public async list(options?: { category?: ArtifactCategory; executionId?: string }): Promise<ArtifactRecord[]> {
    if (options?.category) {
      return artifactRepository.getByCategory(options.category);
    }
    if (options?.executionId) {
      return artifactRepository.getByExecutionId(options.executionId);
    }
    return artifactRepository.getAll();
  }
}

export const artifactStorage = ArtifactStorageManager.getInstance();
