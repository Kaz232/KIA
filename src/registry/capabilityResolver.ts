/**
 * GAG CORE OS — FASE 2: CAPABILITY RESOLVER
 * Analyzes operational goals and infers required capabilities, tools, risk and owner approval.
 */

import { CapabilityResolutionResult } from "./capabilityTypes";
import { capabilityRegistry } from "./capabilityRegistry";
import { AGENT_CAPABILITY_MAP } from "./agentCapabilityMap";
import { RiskLevel } from "./skillTypes";

export class CapabilityResolver {
  private static instance: CapabilityResolver;

  private readonly CRITICAL_PATTERNS = [
    "eliminar banco",
    "apagar base de dados",
    "drop table",
    "truncate",
    "apagar utilizadores",
    "alterar permissões de rbac",
    "transferência financeira",
    "pagamento bancário",
    "publicar externamente em produção",
    "fechar contrato crítico",
    "alterar regime fiscal",
    "destruir ficheiros permanentemente",
  ];

  public static getInstance(): CapabilityResolver {
    if (!CapabilityResolver.instance) {
      CapabilityResolver.instance = new CapabilityResolver();
    }
    return CapabilityResolver.instance;
  }

  /**
   * Resolves capabilities, recommended agent, skills, tools, and risk from an objective.
   */
  public resolve(goal: string): CapabilityResolutionResult {
    const lower = goal.toLowerCase();
    const requiredCapabilities: string[] = [];
    let riskLevel: RiskLevel = "LOW";
    let requiresOwnerApproval = false;
    let approvalReason: string | undefined;

    // Check critical triggers
    for (const pattern of this.CRITICAL_PATTERNS) {
      if (lower.includes(pattern)) {
        riskLevel = "CRITICAL";
        requiresOwnerApproval = true;
        approvalReason = `Operação crítica detectada: "${pattern}". Requer autorização explícita do Proprietário (Josemar Gourgel).`;
        break;
      }
    }

    // Keyword to capability domain resolution
    if (lower.includes("orquestra") || lower.includes("coordena") || lower.includes("geral") || lower.includes("projeto")) {
      requiredCapabilities.push("orchestration", "planning", "delegation", "quality-control");
    }
    if (lower.includes("copy") || lower.includes("texto") || lower.includes("artigo") || lower.includes("redação")) {
      requiredCapabilities.push("copywriting");
    }
    if (lower.includes("design") || lower.includes("arte") || lower.includes("visual") || lower.includes("storyboard")) {
      requiredCapabilities.push("art-direction", "visual-design");
    }
    if (lower.includes("estratégia") || lower.includes("mercado") || lower.includes("negócio") || lower.includes("diagnóstico")) {
      requiredCapabilities.push("strategy", "market-analysis", "business-analysis");
    }
    if (lower.includes("documento") || lower.includes("ocr") || lower.includes("contrato") || lower.includes("extração")) {
      requiredCapabilities.push("document-processing", "ocr");
    }
    if (lower.includes("formação") || lower.includes("aula") || lower.includes("tutoria") || lower.includes("ensino")) {
      requiredCapabilities.push("education");
    }
    if (lower.includes("automação") || lower.includes("webhook") || lower.includes("integração") || lower.includes("kaza")) {
      requiredCapabilities.push("automation");
    }
    if (lower.includes("rede") || lower.includes("infra") || lower.includes("cisco") || lower.includes("servidor")) {
      requiredCapabilities.push("infrastructure");
    }
    if (lower.includes("avatar") || lower.includes("veo") || lower.includes("personagem")) {
      requiredCapabilities.push("avatar-production", "visual-design");
    }
    if (lower.includes("brand") || lower.includes("marca") || lower.includes("logotipo") || lower.includes("identidade")) {
      requiredCapabilities.push("branding");
    }
    if (lower.includes("campanha") || lower.includes("tráfego") || lower.includes("anúncio") || lower.includes("roas")) {
      requiredCapabilities.push("marketing");
    }
    if (lower.includes("suporte") || lower.includes("crm") || lower.includes("atendimento") || lower.includes("lead")) {
      requiredCapabilities.push("support");
    }
    if (lower.includes("agente") || lower.includes("prompt") || lower.includes("arquitetura")) {
      requiredCapabilities.push("agent-architecture", "prompt-engineering");
    }

    // Default fallback to general orchestration
    if (requiredCapabilities.length === 0) {
      requiredCapabilities.push("orchestration");
    }

    // Remove duplicates
    const uniqueCapabilities = Array.from(new Set(requiredCapabilities));

    // Recommend agent matching highest capability coverage
    let recommendedAgent = "agent-kia";
    let maxMatches = 0;

    for (const [agentId, mapping] of Object.entries(AGENT_CAPABILITY_MAP)) {
      if (agentId === "agent-kia") continue;
      let matches = 0;
      for (const cap of uniqueCapabilities) {
        if (mapping.capabilities.includes(cap)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        recommendedAgent = agentId;
      }
    }

    // Resolve dependencies (Skills and Tools)
    const deps = capabilityRegistry.resolveDependencies(uniqueCapabilities);

    return {
      goal,
      requiredCapabilities: uniqueCapabilities,
      recommendedAgent,
      requiredSkills: deps.skills,
      requiredTools: deps.tools,
      riskLevel,
      requiresOwnerApproval,
      approvalReason,
    };
  }
}

export const capabilityResolver = CapabilityResolver.getInstance();
