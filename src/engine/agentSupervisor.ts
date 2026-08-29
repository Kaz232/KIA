/**
 * GAG CORE OS — FASE 1 & FASE 2: AGENT SUPERVISOR
 * Supervisions 13 registered GAG agents with RBAC, Capability validation, Skill & Tool authorization,
 * and Owner Approval triggers for high-risk/critical actions.
 */

import { AgentSupervisorCheck, UserRole } from "./executionTypes";
import { AGENT_CAPABILITY_MAP } from "../registry/agentCapabilityMap";
import { capabilityResolver } from "../registry/capabilityResolver";
import { toolRegistry } from "../registry/toolRegistry";
import { skillRegistry } from "../registry/skillRegistry";

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  specialty: string;
  category: "CORE" | "TECHNICAL" | "CREATIVE" | "BUSINESS";
  isAvailable: boolean;
  maxConcurrentTasks: number;
  currentTasksCount: number;
}

export const REGISTERED_AGENTS: AgentMetadata[] = [
  { id: "agent-kia", name: "KIA", role: "Master Orchestrator", specialty: "Coordenação Geral", category: "CORE", isAvailable: true, maxConcurrentTasks: 10, currentTasksCount: 0 },
  { id: "agent-soba", name: "O Soba", role: "Prompt Engineer & Architect", specialty: "Arquitetura de Agentes", category: "TECHNICAL", isAvailable: true, maxConcurrentTasks: 3, currentTasksCount: 0 },
  { id: "agent-consultant", name: "Consultor GAG", role: "Consultor Estratégico", specialty: "Diagnósticos e Estratégia", category: "BUSINESS", isAvailable: true, maxConcurrentTasks: 4, currentTasksCount: 0 },
  { id: "agent-scanner", name: "Scanner Documental", role: "Especialista OCR", specialty: "Processamento de Documentos", category: "TECHNICAL", isAvailable: true, maxConcurrentTasks: 5, currentTasksCount: 0 },
  { id: "agent-educator", name: "Professor GAG", role: "Educador & Pedagogo", specialty: "Formação e Conteúdo", category: "BUSINESS", isAvailable: true, maxConcurrentTasks: 3, currentTasksCount: 0 },
  { id: "agent-art-director", name: "Diretor de Arte", role: "Direção Visual & Motion", specialty: "Storyboards e Visuais", category: "CREATIVE", isAvailable: true, maxConcurrentTasks: 3, currentTasksCount: 0 },
  { id: "agent-copywriter", name: "Copywriter GAG", role: "Redator Persuasivo", specialty: "Copywriting de Alta Conversão", category: "CREATIVE", isAvailable: true, maxConcurrentTasks: 4, currentTasksCount: 0 },
  { id: "agent-automation-kaza", name: "Arquiteto Kaza", role: "Especialista em Automação", specialty: "Workflows e Integração", category: "TECHNICAL", isAvailable: true, maxConcurrentTasks: 5, currentTasksCount: 0 },
  { id: "agent-infra-network", name: "Analista de Redes", role: "Engenheiro de Infraestrutura", specialty: "Redes, Servidores e Cisco", category: "TECHNICAL", isAvailable: true, maxConcurrentTasks: 4, currentTasksCount: 0 },
  { id: "agent-avatar-veo", name: "Diretor Veo 3", role: "Especialista em Vídeo IA", specialty: "Avatares e Veo Generativo", category: "CREATIVE", isAvailable: true, maxConcurrentTasks: 2, currentTasksCount: 0 },
  { id: "agent-brandkit", name: "Estrategista de Marca", role: "Designer de Identidade", specialty: "Brand Kits e Manuais", category: "CREATIVE", isAvailable: true, maxConcurrentTasks: 3, currentTasksCount: 0 },
  { id: "agent-campaigns", name: "Gestor de Campanhas", role: "Estrategista de Tráfego", specialty: "Campanhas Digitais e ROAS", category: "BUSINESS", isAvailable: true, maxConcurrentTasks: 3, currentTasksCount: 0 },
  { id: "agent-support-ops", name: "Engenheiro de Suporte", role: "Gestor de CRM & Suporte", specialty: "Atendimento e Triagem de Leads", category: "BUSINESS", isAvailable: true, maxConcurrentTasks: 6, currentTasksCount: 0 },
];

export class AgentSupervisor {
  private static instance: AgentSupervisor;
  private agents: Map<string, AgentMetadata> = new Map();

  public static getInstance(): AgentSupervisor {
    if (!AgentSupervisor.instance) {
      AgentSupervisor.instance = new AgentSupervisor();
      AgentSupervisor.instance.initializeAgents();
    }
    return AgentSupervisor.instance;
  }

  private initializeAgents(): void {
    for (const a of REGISTERED_AGENTS) {
      this.agents.set(a.id, a);
    }
  }

  public getAgent(agentId: string): AgentMetadata | undefined {
    return this.agents.get(agentId);
  }

  public getAllAgents(): AgentMetadata[] {
    return Array.from(this.agents.values());
  }

  /**
   * Validates if an agent can execute a task with capability, skill, tool, risk and RBAC checks.
   */
  public checkAssignment(
    agentId: string,
    objective: string,
    userRole: UserRole = "ADMIN"
  ): AgentSupervisorCheck {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        allowed: false,
        agentId,
        agentName: "Desconhecido",
        isAvailable: false,
        matchedCapabilities: [],
        matchedSkills: [],
        matchedTools: [],
        riskLevel: "CRITICAL",
        requiresOwnerApproval: false,
        reason: `Agente com ID '${agentId}' não está registrado no sistema.`,
      };
    }

    if (!agent.isAvailable) {
      return {
        allowed: false,
        agentId: agent.id,
        agentName: agent.name,
        isAvailable: false,
        matchedCapabilities: [],
        matchedSkills: [],
        matchedTools: [],
        riskLevel: "LOW",
        requiresOwnerApproval: false,
        reason: `O agente ${agent.name} está atualmente indisponível.`,
      };
    }

    // Resolve capabilities and risk
    const res = capabilityResolver.resolve(objective);
    const mapping = AGENT_CAPABILITY_MAP[agentId];

    // Check capability compatibility (agent-kia acts as universal orchestrator)
    let isCapable = agentId === "agent-kia";
    const matchedCaps: string[] = [];

    if (mapping) {
      for (const cap of res.requiredCapabilities) {
        if (mapping.capabilities.includes(cap)) {
          matchedCaps.push(cap);
          isCapable = true;
        }
      }
    }

    if (!isCapable && res.requiredCapabilities.length > 0) {
      return {
        allowed: false,
        agentId: agent.id,
        agentName: agent.name,
        isAvailable: true,
        matchedCapabilities: [],
        matchedSkills: [],
        matchedTools: [],
        riskLevel: res.riskLevel,
        requiresOwnerApproval: false,
        reason: `O agente ${agent.name} não possui as capacidades necessárias (${res.requiredCapabilities.join(", ")}) para este objetivo.`,
      };
    }

    // Verify skills
    const matchedSkills: string[] = [];
    if (mapping) {
      for (const s of res.requiredSkills) {
        if (mapping.skills.includes(s) && skillRegistry.validate(s).isValid) {
          matchedSkills.push(s);
        }
      }
    }

    // Verify tools
    const matchedTools: string[] = [];
    if (mapping) {
      for (const t of res.requiredTools) {
        if (mapping.tools.includes(t) && toolRegistry.validate(t).isValid) {
          matchedTools.push(t);
        }
      }
    }

    // Check critical operations & Owner Approval
    if (res.requiresOwnerApproval && userRole !== "OWNER") {
      return {
        allowed: false,
        agentId: agent.id,
        agentName: agent.name,
        isAvailable: true,
        matchedCapabilities: matchedCaps,
        matchedSkills: matchedSkills,
        matchedTools: matchedTools,
        riskLevel: res.riskLevel,
        requiresOwnerApproval: true,
        approvalReason: res.approvalReason,
        reason: res.approvalReason || "Ação restrita: requer autorização expressa do Proprietário (OWNER).",
      };
    }

    return {
      allowed: true,
      agentId: agent.id,
      agentName: agent.name,
      isAvailable: true,
      matchedCapabilities: matchedCaps.length > 0 ? matchedCaps : res.requiredCapabilities,
      matchedSkills: matchedSkills,
      matchedTools: matchedTools,
      riskLevel: res.riskLevel,
      requiresOwnerApproval: res.requiresOwnerApproval,
      approvalReason: res.approvalReason,
    };
  }

  public validateAgent(agentId: string): { isValid: boolean; error?: string } {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return { isValid: false, error: `Agente '${agentId}' não está registrado.` };
    }
    if (!agent.isAvailable) {
      return { isValid: false, error: `Agente '${agent.name}' está indisponível.` };
    }
    return { isValid: true };
  }

  public incrementTaskCount(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) agent.currentTasksCount++;
  }

  public decrementTaskCount(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent && agent.currentTasksCount > 0) agent.currentTasksCount--;
  }
}

export const agentSupervisor = AgentSupervisor.getInstance();
