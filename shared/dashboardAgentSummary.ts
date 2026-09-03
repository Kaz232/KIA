export type DashboardAgentStatus = "Rascunho" | "Em Teste" | "Ativo" | "Rejeitado" | "Inativo";

export function summarizeDashboardAgents(agents: Array<{ status: string }>) {
  return {
    total: agents.length,
    drafts: agents.filter((agent) => agent.status === "Rascunho").length,
    tests: agents.filter((agent) => agent.status === "Em Teste").length,
    active: agents.filter((agent) => agent.status === "Ativo").length,
    rejected: agents.filter((agent) => agent.status === "Rejeitado").length,
    inactive: agents.filter((agent) => agent.status === "Inativo").length,
  };
}
