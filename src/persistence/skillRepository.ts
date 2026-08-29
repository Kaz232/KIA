/**
 * GAG CORE OS — FASE 3: SKILL REPOSITORY
 * Persistent database repository for all 20 official skills.
 */

import { dbClient } from "./supabaseClient";
import { skillRegistry } from "../registry/skillRegistry";

export interface SkillRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  enabled: boolean;
  required_capabilities: string[];
  required_tools: string[];
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export class SkillRepository {
  private static instance: SkillRepository;

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): SkillRepository {
    if (!SkillRepository.instance) {
      SkillRepository.instance = new SkillRepository();
    }
    return SkillRepository.instance;
  }

  private async seedDefaults(): Promise<void> {
    const list = skillRegistry.getAll();
    for (const s of list) {
      const rec: SkillRecord = {
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        version: s.version,
        status: s.status,
        risk_level: s.riskLevel,
        enabled: s.enabled,
        required_capabilities: s.requiredCapabilities,
        required_tools: s.requiredTools,
        input_schema: s.inputSchema,
        output_schema: s.outputSchema,
      };
      await dbClient.upsert("skills", rec, "id");
    }
  }

  public async getAll(): Promise<SkillRecord[]> {
    return dbClient.select<SkillRecord>("skills");
  }

  public async getById(id: string): Promise<SkillRecord | null> {
    return dbClient.selectById<SkillRecord>("skills", id);
  }

  public async save(skill: SkillRecord): Promise<SkillRecord> {
    return dbClient.upsert<SkillRecord>("skills", skill, "id");
  }

  public async setEnabled(id: string, enabled: boolean): Promise<SkillRecord | null> {
    return dbClient.update<SkillRecord>("skills", id, { enabled });
  }

  public async findByCategory(category: string): Promise<SkillRecord[]> {
    return dbClient.select<SkillRecord>("skills", (s) => s.category.toLowerCase() === category.toLowerCase());
  }

  public async findByCapability(capabilityId: string): Promise<SkillRecord[]> {
    return dbClient.select<SkillRecord>("skills", (s) =>
      Array.isArray(s.required_capabilities) && s.required_capabilities.includes(capabilityId)
    );
  }
}

export const skillRepository = SkillRepository.getInstance();
