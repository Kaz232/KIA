/**
 * GAG CORE OS — FASE 3: TOOL REPOSITORY
 * Persistent database operations for all registered tools.
 */

import { dbClient } from "./supabaseClient";
import { toolRegistry } from "../registry/toolRegistry";

export interface ToolRecord {
  id: string;
  name: string;
  description: string;
  type: "INTERNAL" | "API" | "EXTERNAL" | "AUTOMATION" | "STORAGE";
  category: string;
  status: string;
  enabled: boolean;
  permissions: string[];
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  configuration: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export class ToolRepository {
  private static instance: ToolRepository;

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): ToolRepository {
    if (!ToolRepository.instance) {
      ToolRepository.instance = new ToolRepository();
    }
    return ToolRepository.instance;
  }

  private async seedDefaults(): Promise<void> {
    const list = toolRegistry.getAll();
    for (const t of list) {
      const rec: ToolRecord = {
        id: t.id,
        name: t.name,
        description: t.description,
        type: "INTERNAL",
        category: t.category,
        status: t.status,
        enabled: t.status !== "DISABLED",
        permissions: [],
        risk_level: t.riskLevel,
        configuration: {},
      };
      await dbClient.upsert("tools", rec, "id");
    }
  }

  public async getAll(): Promise<ToolRecord[]> {
    return dbClient.select<ToolRecord>("tools");
  }

  public async getById(id: string): Promise<ToolRecord | null> {
    return dbClient.selectById<ToolRecord>("tools", id);
  }

  public async save(tool: ToolRecord): Promise<ToolRecord> {
    return dbClient.upsert<ToolRecord>("tools", tool, "id");
  }

  public async setEnabled(id: string, enabled: boolean): Promise<ToolRecord | null> {
    return dbClient.update<ToolRecord>("tools", id, { enabled });
  }

  public async getByType(type: ToolRecord["type"]): Promise<ToolRecord[]> {
    return dbClient.select<ToolRecord>("tools", (t) => t.type === type);
  }
}

export const toolRepository = ToolRepository.getInstance();
