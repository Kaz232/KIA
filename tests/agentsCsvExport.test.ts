import { describe, it, expect } from "vitest";
import { generateAgentsCsv, escapeCsv } from "../src/utils/agentsCsvExport";
import { Agent } from "../src/types";

describe("agentsCsvExport utility", () => {
  const mockSkills: Array<{ id: string; name: string }> = [
    {
      id: "skill-1",
      name: "Code Generation",
    },
    {
      id: "skill-2",
      name: "Security Audit",
    },
  ];

  const mockAgents: Agent[] = [
    {
      id: "agent-programmer",
      slug: "programmer",
      name: "Dev Lead",
      roleTitle: "Engenheiro de Software",
      status: "ACTIVE",
      version: "2.1.0",
      objective: "Construir features com qualidade e robustez, \"sem bugs\".",
      description: "Agente encarregado pelo desenvolvimento fullstack.",
      skills: ["skill-1", "skill-2"],
      permissions: ["EXECUTE_CODE", "GIT_COMMIT"],
      avatarColor: "#3b82f6",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T12:00:00.000Z",
    },
    {
      id: "agent-qa",
      slug: "qa-specialist",
      name: "QA Validator",
      roleTitle: "Validador de Qualidade",
      status: "REVIEW_REQUIRED",
      version: "1.0.0",
      objective: "Garantir testes e compliance.",
      description: "Valida requisitos de entrega.",
      skills: ["skill-2"],
      permissions: ["READ_LOGS"],
      avatarColor: "#10b981",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
  ];

  it("escapes quotes and special characters correctly", () => {
    expect(escapeCsv('Hello "World"')).toBe('"Hello ""World"""');
    expect(escapeCsv("Normal")).toBe('"Normal"');
    expect(escapeCsv(123)).toBe('"123"');
    expect(escapeCsv(null)).toBe('""');
    expect(escapeCsv(undefined)).toBe('""');
  });

  it("generates CSV with header and correct agent fields including status", () => {
    const csv = generateAgentsCsv(mockAgents, mockSkills);
    const lines = csv.split("\r\n");

    // Header line
    expect(lines[0]).toContain('"ID"');
    expect(lines[0]).toContain('"Nome"');
    expect(lines[0]).toContain('"Status"');
    expect(lines[0]).toContain('"Cargo / Função"');

    // First agent line
    expect(lines[1]).toContain('"agent-programmer"');
    expect(lines[1]).toContain('"Dev Lead"');
    expect(lines[1]).toContain('"ACTIVE"');
    expect(lines[1]).toContain('"Code Generation; Security Audit"');
    expect(lines[1]).toContain('"EXECUTE_CODE; GIT_COMMIT"');

    // Second agent line
    expect(lines[2]).toContain('"agent-qa"');
    expect(lines[2]).toContain('"QA Validator"');
    expect(lines[2]).toContain('"REVIEW_REQUIRED"');
    expect(lines[2]).toContain('"Security Audit"');
  });

  it("handles empty agent list gracefully", () => {
    const csv = generateAgentsCsv([], []);
    const lines = csv.split("\r\n");
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('"Status"');
  });
});
