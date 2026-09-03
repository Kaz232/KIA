import { describe, expect, it } from "vitest";
import { summarizeDashboardAgents } from "./dashboardAgentSummary";

describe("summarizeDashboardAgents", () => {
  it("conta os 5 estados separadamente", () => {
    expect(summarizeDashboardAgents([
      { status: "Ativo" },
      { status: "Rascunho" },
      { status: "Em Teste" },
      { status: "Rejeitado" },
      { status: "Rejeitado" },
      { status: "Inativo" },
    ])).toEqual({
      total: 6,
      drafts: 1,
      tests: 1,
      active: 1,
      rejected: 2,
      inactive: 1,
    });
  });
});
