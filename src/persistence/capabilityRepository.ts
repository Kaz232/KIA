/**
 * GAG CORE OS — FASE 3: CAPABILITY REPOSITORY
 * Persistent database operations for canonical capabilities and agent mappings.
 */

import { dbClient } from "./supabaseClient";
import { capabilityRegistry } from "../registry/capabilityRegistry";

export interface CapabilityRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  enabled: boolean;
  default_skills: string[];
  default_tools: string[];
  compatible_agents: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AgentCapabilityRecord {
  id?: string;
  agent_id: string;
  capability_id: string;
  proficiency: "BEGINNER" | "INTERMEDIATE" | "EXPERT" | "MASTER";
  created_at?: string;
}

export class CapabilityRepository {
  private static instance: CapabilityRepository;

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): CapabilityRepository {
    if (!CapabilityRepository.instance) {
      CapabilityRepository.instance = new CapabilityRepository();
    }
    return CapabilityRepository.instance;
  }

  private async seedDefaults(): Promise<void> {
    const list = capabilityRegistry.getAll();
    for (const c of list) {
      const rec: CapabilityRecord = {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.domain,
        risk_level: c.riskLevel,
        enabled: c.enabled,
        default_skills: c.requiredSkills,
        default_tools: c.requiredTools,
        compatible_agents: ["agent-kia"],
      };
      await dbClient.upsert("capabilities", rec, "id");
    }
  }

  public async getAll(): Promise<CapabilityRecord[]> {
    return dbClient.select<CapabilityRecord>("capabilities");
  }

  public async getById(id: string): Promise<CapabilityRecord | null> {
    return dbClient.selectById<CapabilityRecord>("capabilities", id);
  }

  public async save(cap: CapabilityRecord): Promise<CapabilityRecord> {
    return dbClient.upsert<CapabilityRecord>("capabilities", cap, "id");
  }

  public async getAgentCapabilities(agentId: string): Promise<string[]> {
    const list = await dbClient.select<AgentCapabilityRecord>(
      "agent_capabilities",
      (ac) => ac.agent_id === agentId
    );
    return list.map((ac) => ac.capability_id);
  }

  public async assignCapabilityToAgent(
    agentId: string,
    capabilityId: string,
    proficiency: AgentCapabilityRecord["proficiency"] = "EXPERT"
  ): Promise<AgentCapabilityRecord> {
    return dbClient.upsert<AgentCapabilityRecord>(
      "agent_capabilities",
      {
        id: `ac_${agentId}_${capabilityId}`,
        agent_id: agentId,
        capability_id: capabilityId,
        proficiency,
      },
      "id"
    );
  }

  public async isAgentCapable(agentId: string, capabilityId: string): Promise<boolean> {
    const caps = await this.getAgentCapabilities(agentId);
    return caps.includes(capabilityId);
  }
}

export const capabilityRepository = CapabilityRepository.getInstance();
