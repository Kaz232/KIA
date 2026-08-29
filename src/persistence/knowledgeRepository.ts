/**
 * GAG CORE OS — FASE 3: KNOWLEDGE REPOSITORY
 * Persistent database operations for enterprise knowledge base items.
 */

import { dbClient } from "./supabaseClient";
import { INITIAL_KNOWLEDGE } from "../data/initialData";

export interface KnowledgeItemRecord {
  id: string;
  title: string;
  content: string;
  category: "BRANDING" | "DESIGN_AI" | "CONTENT_STRATEGY" | "AUTOMATION" | "INTERNAL_PROCESS" | "CLIENT_PLAYBOOK" | "TECHNICAL";
  source?: string;
  version: string;
  status: "DRAFT" | "REVIEW_REQUIRED" | "APPROVED" | "ARCHIVED";
  owner: string;
  tags: string[];
  associated_doc_ids?: string[];
  associated_skill_ids?: string[];
  associated_agent_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export class KnowledgeRepository {
  private static instance: KnowledgeRepository;

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): KnowledgeRepository {
    if (!KnowledgeRepository.instance) {
      KnowledgeRepository.instance = new KnowledgeRepository();
    }
    return KnowledgeRepository.instance;
  }

  private async seedDefaults(): Promise<void> {
    for (const k of INITIAL_KNOWLEDGE) {
      const rec: KnowledgeItemRecord = {
        id: k.id,
        title: k.title,
        content: k.content,
        category: k.category,
        source: k.source || "INITIAL",
        version: k.version || "1.0.0",
        status: k.status || "APPROVED",
        owner: k.owner || "Josemar Gourgel",
        tags: k.tags || [],
        associated_doc_ids: k.associatedDocIds || [],
        associated_skill_ids: k.associatedSkillIds || [],
        associated_agent_ids: k.associatedAgentIds || [],
      };
      await dbClient.upsert("knowledge_items", rec, "id");
    }
  }

  public async getAll(limit = 100): Promise<KnowledgeItemRecord[]> {
    const list = await dbClient.select<KnowledgeItemRecord>("knowledge_items");
    return list.slice(0, limit);
  }

  public async getById(id: string): Promise<KnowledgeItemRecord | null> {
    return dbClient.selectById<KnowledgeItemRecord>("knowledge_items", id);
  }

  public async save(item: KnowledgeItemRecord): Promise<KnowledgeItemRecord> {
    return dbClient.upsert<KnowledgeItemRecord>("knowledge_items", item, "id");
  }

  public async search(query: string): Promise<KnowledgeItemRecord[]> {
    const q = query.toLowerCase();
    return dbClient.select<KnowledgeItemRecord>(
      "knowledge_items",
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.content.toLowerCase().includes(q) ||
        (Array.isArray(k.tags) && k.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }

  public async getByCategory(category: KnowledgeItemRecord["category"]): Promise<KnowledgeItemRecord[]> {
    return dbClient.select<KnowledgeItemRecord>("knowledge_items", (k) => k.category === category);
  }

  public async delete(id: string): Promise<boolean> {
    return dbClient.delete("knowledge_items", id);
  }
}

export const knowledgeRepository = KnowledgeRepository.getInstance();
