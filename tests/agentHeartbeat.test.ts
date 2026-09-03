import { describe, it, expect } from "vitest";
import { LATENCY_THRESHOLD_MS } from "../src/hooks/useAgentHeartbeats";

describe("Agent Heartbeat Polling & Indicator Logic", () => {
  const BASE_URL = "http://localhost:3000";

  it("should have a defined high latency threshold of 250ms", () => {
    expect(LATENCY_THRESHOLD_MS).toBe(250);
  });

  it("polls agent endpoint and returns healthy active status under nominal load", async () => {
    // Ensure agent-kia is reset to normal
    await fetch(`${BASE_URL}/api/agents/agent-kia/heartbeat?simulate=reset`);

    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/agents/agent-kia/heartbeat`);
    const duration = performance.now() - t0;

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.agentId).toBe("agent-kia");
    expect(data.status).toBe("active");
    expect(data.uptimePercentage).toBeGreaterThanOrEqual(99.0);
    expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
  });

  it("correctly identifies high latency when simulated on the endpoint", async () => {
    // Simulate high latency (380ms)
    const res = await fetch(`${BASE_URL}/api/agents/agent-kia/heartbeat?simulate=latency&latency=380`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("high_latency");
    expect(data.latencyMs).toBeGreaterThanOrEqual(250);
  });

  it("correctly identifies failing state when endpoint returns 503 or error", async () => {
    // Simulate failing state
    const res = await fetch(`${BASE_URL}/api/agents/agent-kia/heartbeat?simulate=fail`);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe("failing");
    expect(data.error).toBeDefined();
    expect(data.checks.connectivity).toBe("failed");
  });

  it("restores active healthy status after reset", async () => {
    // Reset back to active
    const res = await fetch(`${BASE_URL}/api/agents/agent-kia/heartbeat?simulate=reset`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("active");
  });
});
