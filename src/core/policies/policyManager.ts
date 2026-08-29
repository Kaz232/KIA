import { AutonomyLevel, PolicyRule } from "../types";

export class PolicyManager {
  private static instance: PolicyManager;
  private policies: PolicyRule[] = [
    // Level 0: Automático — Sem necessidade de aprovação humana
    {
      id: "pol-001",
      name: "Auto Análise & RAG Interno",
      description: "Permite leitura e pesquisa na base de conhecimento sem intervenção.",
      autonomyLevel: 0,
      requiredRole: "VIEWER",
      actionPattern: "intelligence:*"
    },
    {
      id: "pol-002",
      name: "Criação de Rascunhos & Ideação",
      description: "Permite redigir cópias, roteiros e códigos em estado de rascunho.",
      autonomyLevel: 0,
      requiredRole: "AGENT",
      actionPattern: "content:draft"
    },
    {
      id: "pol-003",
      name: "Decomposição e Handoff Interno",
      description: "Permite à KIA delegar sub-tarefas e transitar entre agentes autónomos.",
      autonomyLevel: 0,
      requiredRole: "AGENT",
      actionPattern: "orchestration:handoff"
    },
    {
      id: "pol-004",
      name: "Cálculos Financeiros & Simulação ROAS",
      description: "Permite execução de modelos matemáticos e orçamentários.",
      autonomyLevel: 0,
      requiredRole: "AGENT",
      actionPattern: "finance:calculate"
    },

    // Level 1: Supervisão Interna — Validação pelo Supervisor KIA / Admin
    {
      id: "pol-101",
      name: "Aprovação de Entregável em Backlog",
      description: "Exige que o QA Agent ou Supervisor valide o entregável antes do estado COMPLETED.",
      autonomyLevel: 1,
      requiredRole: "ADMIN",
      actionPattern: "task:status_change"
    },
    {
      id: "pol-102",
      name: "Alteração Estrutural de Workflows",
      description: "Modificação nas dependências ativas de tarefas em execução.",
      autonomyLevel: 1,
      requiredRole: "ADMIN",
      actionPattern: "workflow:reorder"
    },

    // Level 2: Proprietário / Owner — Aprovação Estrita de Josemar Gourgel
    {
      id: "pol-201",
      name: "Transações Financeiras & Pagamentos Reais",
      description: "Qualquer desembolso ou envio de faturas finais a clientes requer confirmação do Owner.",
      autonomyLevel: 2,
      requiredRole: "OWNER",
      actionPattern: "finance:disburse"
    },
    {
      id: "pol-202",
      name: "Publicação Externa em Redes & Campanhas Reais",
      description: "Disparo ao vivo de anúncios Meta Ads / Google Ads requer aprovação do Owner.",
      autonomyLevel: 2,
      requiredRole: "OWNER",
      actionPattern: "marketing:publish_live"
    },
    {
      id: "pol-203",
      name: "Eliminação Permanente de Registos",
      description: "Exclusão definitiva de agentes, base de conhecimento ou auditorias.",
      autonomyLevel: 2,
      requiredRole: "OWNER",
      actionPattern: "data:purge"
    },
  ];

  public static getInstance(): PolicyManager {
    if (!PolicyManager.instance) {
      PolicyManager.instance = new PolicyManager();
    }
    return PolicyManager.instance;
  }

  public checkActionPermission(
    action: string,
    userRole: string,
    requestedAutonomy: AutonomyLevel
  ): { allowed: boolean; requiresOwnerApproval: boolean; reason: string } {
    const matchingPolicy = this.policies.find((p) => {
      const regex = new RegExp("^" + p.actionPattern.replace("*", ".*") + "$");
      return regex.test(action);
    });

    const autonomy = matchingPolicy ? matchingPolicy.autonomyLevel : requestedAutonomy;

    if (autonomy === 2) {
      if (userRole === "OWNER") {
        return { allowed: true, requiresOwnerApproval: false, reason: "Ação autorizada pelo Proprietário (Josemar Gourgel)." };
      }
      return { allowed: false, requiresOwnerApproval: true, reason: "Ação de Nível 2 (Crítica). Requer autorização explícita de Josemar Gourgel." };
    }

    if (autonomy === 1) {
      if (userRole === "OWNER" || userRole === "ADMIN") {
        return { allowed: true, requiresOwnerApproval: false, reason: "Ação de Nível 1 autorizada por credencial executiva." };
      }
      return { allowed: false, requiresOwnerApproval: false, reason: "Ação de Nível 1 exige supervisão de Administrador." };
    }

    // Level 0
    return { allowed: true, requiresOwnerApproval: false, reason: "Ação de Nível 0 — Execução totalmente autónoma permitida." };
  }

  public getAllPolicies(): PolicyRule[] {
    return [...this.policies];
  }
}
