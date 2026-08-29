/**
 * GAG CORE OS — FASE 2: REGISTRY TEST RUNNER & SUITE
 * Implements rigorous testing for Skill Registry, Tool Registry, Capability Registry,
 * Security Guardrails, Owner Approval, Capability Resolvers, and the End-to-End Autonomous Pipeline.
 */

import { skillRegistry } from "./skillRegistry";
import { toolRegistry } from "./toolRegistry";
import { capabilityRegistry } from "./capabilityRegistry";
import { capabilityResolver } from "./capabilityResolver";
import { skillSelector } from "./skillSelector";
import { agentSupervisor } from "../engine/agentSupervisor";
import { executionEngine } from "../engine/executionEngine";
import { AGENT_CAPABILITY_MAP, AgentCapabilityMapService } from "./agentCapabilityMap";

export interface RegistryTestResult {
  id: number;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: any;
}

export interface RegistryTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  successRate: number;
  durationMs: number;
  results: RegistryTestResult[];
}

export class RegistryTestRunner {
  private results: RegistryTestResult[] = [];

  public async runAllTests(): Promise<RegistryTestSuiteSummary> {
    const startTime = Date.now();
    this.results = [];

    // Test 1: register skill
    await this.runTest(1, "Register Skill", () => {
      skillRegistry.register({
        id: "test-dynamic-skill",
        name: "Dynamic Test Skill",
        description: "Dynamic skill for unit validation",
        category: "test",
        version: "1.0.0",
        status: "AVAILABLE",
        requiredCapabilities: ["orchestration"],
        requiredTools: ["execution-engine"],
        inputSchema: { type: "object", properties: { param: { type: "string" } } },
        outputSchema: { type: "object", properties: { res: { type: "string" } } },
        riskLevel: "LOW",
        enabled: true,
        handler: () => ({
          success: true,
          skillId: "test-dynamic-skill",
          output: "Executed dynamic skill successfully",
          metadata: { durationMs: 5, timestamp: new Date().toISOString(), riskLevel: "LOW" },
        }),
      });
      if (!skillRegistry.has("test-dynamic-skill")) {
        throw new Error("Dynamic skill was not registered correctly.");
      }
    });

    // Test 2: retrieve skill
    await this.runTest(2, "Retrieve Skill", () => {
      const skill = skillRegistry.get("goal-analysis");
      if (!skill || skill.id !== "goal-analysis" || skill.category !== "orchestration") {
        throw new Error("Failed to retrieve core skill 'goal-analysis'.");
      }
    });

    // Test 3: disable skill
    await this.runTest(3, "Disable Skill", () => {
      skillRegistry.disable("test-dynamic-skill");
      const validation = skillRegistry.validate("test-dynamic-skill");
      if (validation.isValid) {
        throw new Error("Disabled skill should fail validation.");
      }
      // Re-enable for cleanliness
      skillRegistry.enable("test-dynamic-skill");
    });

    // Test 4: register tool
    await this.runTest(4, "Register Tool", () => {
      toolRegistry.register({
        id: "test-dynamic-tool",
        name: "Dynamic Test Tool",
        description: "Tool for testing registry lifecycle",
        category: "test",
        version: "1.0.0",
        status: "AVAILABLE",
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
        riskLevel: "LOW",
        requiresApproval: false,
        handler: () => ({
          success: true,
          toolId: "test-dynamic-tool",
          result: { ok: true },
          metadata: { durationMs: 2, executedAt: new Date().toISOString(), riskLevel: "LOW" },
        }),
      });
      if (!toolRegistry.has("test-dynamic-tool")) {
        throw new Error("Dynamic tool was not registered.");
      }
    });

    // Test 5: unavailable tool rejection
    await this.runTest(5, "Unavailable Tool Rejection", () => {
      toolRegistry.register({
        id: "unimplemented-external-crm",
        name: "Unimplemented External Tool",
        description: "Placeholder for future external system",
        category: "external",
        version: "0.1.0",
        status: "UNAVAILABLE",
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
        riskLevel: "HIGH",
        requiresApproval: false,
        handler: () => ({
          success: false,
          toolId: "unimplemented-external-crm",
          result: null,
          metadata: { durationMs: 0, executedAt: new Date().toISOString(), riskLevel: "HIGH" },
          error: "Not implemented",
        }),
      });
      const val = toolRegistry.validate("unimplemented-external-crm");
      if (val.isValid) {
        throw new Error("UNAVAILABLE tool must be rejected by validator.");
      }
    });

    // Test 6: register capability
    await this.runTest(6, "Register Capability", () => {
      capabilityRegistry.register({
        id: "dynamic-test-capability",
        name: "Dynamic Test Capability",
        description: "Capability for domain test",
        domain: "strategy",
        requiredSkills: ["business-strategy"],
        requiredTools: ["knowledge-base"],
        riskLevel: "LOW",
        enabled: true,
      });
      if (!capabilityRegistry.has("dynamic-test-capability")) {
        throw new Error("Capability was not registered.");
      }
    });

    // Test 7: capability resolution
    await this.runTest(7, "Capability Resolution", () => {
      const res = capabilityResolver.resolve("Criar copy persuasiva para lançamento de marca de luxo");
      if (!res.requiredCapabilities.includes("copywriting")) {
        throw new Error("Resolution failed to include 'copywriting' capability.");
      }
      if (res.recommendedAgent !== "agent-copywriter") {
        throw new Error(`Expected recommended agent 'agent-copywriter', got '${res.recommendedAgent}'.`);
      }
    });

    // Test 8: skill selection
    await this.runTest(8, "Skill Selection", () => {
      const sel = skillSelector.selectSkills("Desenvolver plano de aula e formação técnica", "agent-educator");
      if (!sel.selectedSkillIds.includes("lesson-design")) {
        throw new Error("SkillSelector failed to select 'lesson-design' for educator goal.");
      }
    });

    // Test 9: agent capability validation
    await this.runTest(9, "Agent Capability Validation", () => {
      const hasCap = AgentCapabilityMapService.hasCapability("agent-copywriter", "copywriting");
      if (!hasCap) {
        throw new Error("AgentCapabilityMap reported missing capability for copywriter.");
      }
    });

    // Test 10: incompatible agent rejection
    await this.runTest(10, "Incompatible Agent Rejection", () => {
      // Trying to assign network infrastructure task to copywriter
      const check = agentSupervisor.checkAssignment("agent-copywriter", "Auditar topologia de switches Cisco e portas de rede");
      if (check.allowed) {
        throw new Error("Supervisor should have rejected copywriter for network infrastructure task.");
      }
    });

    // Test 11: tool permission check
    await this.runTest(11, "Tool Permission Check", () => {
      const isAllowed = AgentCapabilityMapService.hasTool("agent-kia", "execution-engine");
      if (!isAllowed) {
        throw new Error("KIA must have permission to use execution-engine tool.");
      }
    });

    // Test 12: owner approval trigger
    await this.runTest(12, "Owner Approval Trigger", () => {
      const res = capabilityResolver.resolve("Apagar base de dados de produção e eliminar banco");
      if (!res.requiresOwnerApproval || res.riskLevel !== "CRITICAL") {
        throw new Error("Critical database deletion did not trigger OWNER_APPROVAL_REQUIRED.");
      }
    });

    // Test 13: internal tool execution
    await this.runTest(13, "Internal Tool Execution", async () => {
      const toolRes = await toolRegistry.execute(
        "knowledge-base",
        { query: "diretrizes de marca" },
        { toolId: "knowledge-base", agentId: "agent-kia", timestamp: new Date().toISOString() }
      );
      if (!toolRes.success || !toolRes.result.records) {
        throw new Error("Knowledge-base tool execution failed.");
      }
    });

    // Test 14: skill execution
    await this.runTest(14, "Skill Execution", async () => {
      const skillRes = await skillRegistry.execute(
        "sales-copy",
        { product: "Brand Kit Luxo GAG" },
        { skillId: "sales-copy", agentId: "agent-copywriter", timestamp: new Date().toISOString() }
      );
      if (!skillRes.success || !skillRes.output.includes("Transforme a Presença")) {
        throw new Error("Sales-copy skill execution failed to generate structured content.");
      }
    });

    // Test 15: complete capability chain
    await this.runTest(15, "Complete Capability Chain", () => {
      const mapping = AGENT_CAPABILITY_MAP["agent-consultant"];
      if (!mapping || !mapping.capabilities.includes("strategy") || !mapping.skills.includes("business-strategy")) {
        throw new Error("Agent-consultant mapping broken in capability matrix.");
      }
    });

    // Test 16: audit events
    await this.runTest(16, "Audit Events Verification", () => {
      const event = executionEngine.logAudit({
        type: "CAPABILITY_RESOLVED",
        executionId: "test_exec_audit",
        newState: "PLANNING",
        details: "Auditoria de teste de registro",
      });
      if (!event.hash.startsWith("sha256_") || event.type !== "CAPABILITY_RESOLVED") {
        throw new Error("Audit event did not generate valid SHA-256 hash chaining.");
      }
    });

    // Test 17: invalid input
    await this.runTest(17, "Invalid Input Validation", async () => {
      const res = await skillRegistry.execute(
        "non-existent-skill",
        {},
        { skillId: "non-existent-skill", timestamp: new Date().toISOString() }
      );
      if (res.success) {
        throw new Error("Executing non-existent skill should return success: false.");
      }
    });

    // Test 18: disabled skill
    await this.runTest(18, "Disabled Skill Check", async () => {
      skillRegistry.register({
        id: "temporary-disabled-skill",
        name: "Disabled Skill",
        description: "Testing disabled state",
        category: "test",
        version: "1.0.0",
        status: "DISABLED",
        requiredCapabilities: [],
        requiredTools: [],
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
        riskLevel: "LOW",
        enabled: false,
        handler: () => ({
          success: true,
          skillId: "temporary-disabled-skill",
          output: "ok",
          metadata: { durationMs: 1, timestamp: new Date().toISOString(), riskLevel: "LOW" },
        }),
      });

      const res = await skillRegistry.execute(
        "temporary-disabled-skill",
        {},
        { skillId: "temporary-disabled-skill", timestamp: new Date().toISOString() }
      );
      if (res.success) {
        throw new Error("Disabled skill execution should be blocked.");
      }
    });

    // Test 19: disabled tool
    await this.runTest(19, "Disabled Tool Check", async () => {
      toolRegistry.register({
        id: "temporary-disabled-tool",
        name: "Disabled Tool",
        description: "Testing disabled tool state",
        category: "test",
        version: "1.0.0",
        status: "DISABLED",
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
        riskLevel: "LOW",
        requiresApproval: false,
        handler: () => ({
          success: true,
          toolId: "temporary-disabled-tool",
          result: {},
          metadata: { durationMs: 1, executedAt: new Date().toISOString(), riskLevel: "LOW" },
        }),
      });

      const res = await toolRegistry.execute(
        "temporary-disabled-tool",
        {},
        { toolId: "temporary-disabled-tool", timestamp: new Date().toISOString() }
      );
      if (res.success) {
        throw new Error("Disabled tool execution should be blocked.");
      }
    });

    // Test 20: unknown capability
    await this.runTest(20, "Unknown Capability Check", () => {
      const val = capabilityRegistry.validate("quantum-teleportation-capability");
      if (val.isValid) {
        throw new Error("Unknown capability must fail validation.");
      }
    });

    // Integrated Test: Complete End-to-End Pipeline
    // GOAL -> CAPABILITY -> SKILL -> TOOL -> AGENT -> EXECUTION -> QA -> DELIVERY
    await this.runTest(21, "Integrated Pipeline: Goal -> Capability -> Skill -> Tool -> Agent -> Execution -> QA -> Delivery", async () => {
      const goal = "Desenvolver copy persuasiva e estratégia de lançamento para novo serviço da GAG Visual";
      const execResult = await executionEngine.executeGoal({
        goal,
        userRole: "OWNER",
        userId: "user_owner_josemar",
        userName: "Josemar Gourgel",
      });

      if (execResult.state !== "COMPLETED") {
        throw new Error(`Integrated execution did not reach COMPLETED state. Current state: ${execResult.state}. Error: ${execResult.error}`);
      }
      if (execResult.selectedCapabilities.length === 0) {
        throw new Error("No capabilities were attached to the execution result.");
      }
      if (!execResult.finalOutput || execResult.finalOutput.length < 50) {
        throw new Error("Final output is missing or too short.");
      }
      if (!execResult.qaResult || !execResult.qaResult.passed) {
        throw new Error("Execution did not pass QA evaluation.");
      }
    });

    const passedCount = this.results.filter((r) => r.passed).length;
    const failedCount = this.results.length - passedCount;

    return {
      total: this.results.length,
      passed: passedCount,
      failed: failedCount,
      successRate: (passedCount / this.results.length) * 100,
      durationMs: Date.now() - startTime,
      results: this.results,
    };
  }

  private async runTest(id: number, name: string, fn: () => Promise<void> | void): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      this.results.push({
        id,
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
    } catch (err: any) {
      this.results.push({
        id,
        name,
        passed: false,
        durationMs: Date.now() - start,
        error: err?.message || String(err),
      });
    }
  }
}

export const registryTestRunner = new RegistryTestRunner();
