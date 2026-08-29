/**
 * GAG CORE OS — FASE 3: AGENT REPOSITORY
 * Persistent database operations for all 13 official autonomous agents.
 */

import { dbClient } from "./supabaseClient";

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  specialty: string;
  category: "CORE" | "TECHNICAL" | "CREATIVE" | "BUSINESS" | "OPERATIONAL";
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "MAINTENANCE";
  is_available: boolean;
  max_concurrent_tasks: number;
  current_tasks_count: number;
  avatar_url?: string;
  system_prompt?: string;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_DB_AGENTS: AgentRecord[] = [
  { id: "agent-kia", name: "KIA", role: "Master Orchestrator", specialty: "Coordenação Geral e Supervisão Autónoma", category: "CORE", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 10, current_tasks_count: 0 },
  { id: "agent-soba", name: "O Soba", role: "Prompt Engineer & Architect", specialty: "Arquitetura de Agentes e Engenharia de Prompts", category: "TECHNICAL", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 3, current_tasks_count: 0 },
  { id: "agent-consultant", name: "Consultor GAG", role: "Consultor Estratégico", specialty: "Diagnósticos de Negócio e Proposições de Valor", category: "BUSINESS", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 4, current_tasks_count: 0 },
  { id: "agent-scanner", name: "Scanner Documental", role: "Especialista OCR", specialty: "Processamento de Documentos e Extração de Entidades", category: "TECHNICAL", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 5, current_tasks_count: 0 },
  { id: "agent-educator", name: "Professor GAG", role: "Educador & Pedagogo", specialty: "Formação Corporativa e Desenho Pedagógico", category: "BUSINESS", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 3, current_tasks_count: 0 },
  { id: "agent-art-director", name: "Diretor de Arte", role: "Direção Visual & Motion", specialty: "Storyboards Cinematográficos e Direção Estética", category: "CREATIVE", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 3, current_tasks_count: 0 },
  { id: "agent-copywriter", name: "Copywriter GAG", role: "Redator Persuasivo", specialty: "Copywriting de Alta Conversão e Comunicação AIDA", category: "CREATIVE", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 4, current_tasks_count: 0 },
  { id: "agent-automation-kaza", name: "Arquiteto Kaza", role: "Especialista em Automação", specialty: "Workflows n8n, Webhooks e Integrações", category: "TECHNICAL", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 5, current_tasks_count: 0 },
  { id: "agent-infra-network", name: "Analista de Redes", role: "Engenheiro de Infraestrutura", specialty: "Topologias de Rede, Servidores e Segurança Cisco", category: "TECHNICAL", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 4, current_tasks_count: 0 },
  { id: "agent-avatar-veo", name: "Diretor Veo 3", role: "Especialista em Vídeo IA", specialty: "Geração de Vídeo, Avatares e Veo Generativo", category: "CREATIVE", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 2, current_tasks_count: 0 },
  { id: "agent-brandkit", name: "Estrategista de Marca", role: "Designer de Identidade", specialty: "Brand Kits, Manuais de Identidade e Paletas", category: "CREATIVE", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 3, current_tasks_count: 0 },
  { id: "agent-campaigns", name: "Gestor de Campanhas", role: "Estrategista de Tráfego", specialty: "Campanhas Digitais, Otimização de ROAS e Funis", category: "BUSINESS", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 3, current_tasks_count: 0 },
  { id: "agent-support-ops", name: "Engenheiro de Suporte", role: "Gestor de CRM & Suporte", specialty: "Triagem de Leads e Gestão de Atendimento", category: "BUSINESS", status: "AVAILABLE", is_available: true, max_concurrent_tasks: 6, current_tasks_count: 0 },
];

export class AgentRepository {
  private static instance: AgentRepository;

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): AgentRepository {
    if (!AgentRepository.instance) {
      AgentRepository.instance = new AgentRepository();
    }
    return AgentRepository.instance;
  }

  private async seedDefaults(): Promise<void> {
    for (const a of INITIAL_DB_AGENTS) {
      await dbClient.upsert("agents", a, "id");
    }
  }

  public async getAll(): Promise<AgentRecord[]> {
    return dbClient.select<AgentRecord>("agents");
  }

  public async getById(id: string): Promise<AgentRecord | null> {
    return dbClient.selectById<AgentRecord>("agents", id);
  }

  public async save(agent: AgentRecord): Promise<AgentRecord> {
    return dbClient.upsert<AgentRecord>("agents", agent, "id");
  }

  public async updateStatus(
    id: string,
    status: AgentRecord["status"],
    isAvailable?: boolean
  ): Promise<AgentRecord | null> {
    const updates: Partial<AgentRecord> = { status };
    if (typeof isAvailable === "boolean") {
      updates.is_available = isAvailable;
    }
    return dbClient.update<AgentRecord>("agents", id, updates);
  }

  public async incrementTaskCount(id: string): Promise<AgentRecord | null> {
    const current = await this.getById(id);
    if (!current) return null;
    return dbClient.update<AgentRecord>("agents", id, {
      current_tasks_count: (current.current_tasks_count || 0) + 1,
    });
  }

  public async decrementTaskCount(id: string): Promise<AgentRecord | null> {
    const current = await this.getById(id);
    if (!current) return null;
    return dbClient.update<AgentRecord>("agents", id, {
      current_tasks_count: Math.max(0, (current.current_tasks_count || 0) - 1),
    });
  }

  public async getByCategory(category: AgentRecord["category"]): Promise<AgentRecord[]> {
    return dbClient.select<AgentRecord>("agents", (a) => a.category === category);
  }
}

export const agentRepository = AgentRepository.getInstance();
