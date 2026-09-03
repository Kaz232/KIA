import { useState, useEffect, useCallback, useRef } from "react";
import { Agent } from "../types";

export type HeartbeatStatus = "active" | "high_latency" | "failing" | "recovering" | "checking";

export interface RecoveryLog {
  id: string;
  agentId: string;
  timestamp: string;
  success: boolean;
  message: string;
  latencyAfterMs?: number;
}

export interface AgentHeartbeatState {
  agentId: string;
  status: HeartbeatStatus;
  latencyMs: number;
  lastChecked: number;
  statusCode?: number;
  error?: string;
  uptimePercentage?: number;
  restartCount?: number;
  isAutoRecovering?: boolean;
}

export const LATENCY_THRESHOLD_MS = 250;
const POLL_INTERVAL_MS = 10000; // 10 seconds

export function useAgentHeartbeats(agents: Agent[]) {
  const [heartbeats, setHeartbeats] = useState<Record<string, AgentHeartbeatState>>({});
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRestartEnabled, setAutoRestartEnabled] = useState(true);
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const isMountedRef = useRef(true);
  const restartAttemptsRef = useRef<Record<string, number>>({});
  const inFlightRestartsRef = useRef<Set<string>>(new Set());

  // Restart an agent endpoint
  const restartAgent = useCallback(async (agentId: string, isAuto = false): Promise<boolean> => {
    if (inFlightRestartsRef.current.has(agentId)) return false;
    inFlightRestartsRef.current.add(agentId);

    // Optimistically show recovering state
    setHeartbeats((prev) => {
      const current = prev[agentId] || { agentId, status: "recovering", latencyMs: 0, lastChecked: Date.now() };
      return {
        ...prev,
        [agentId]: {
          ...current,
          status: "recovering",
          isAutoRecovering: true,
        },
      };
    });

    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAuto, requestedAt: new Date().toISOString() }),
      });

      const data = await res.json();
      const success = res.ok && data.status === "active";

      const log: RecoveryLog = {
        id: `rec_${Date.now()}_${agentId}`,
        agentId,
        timestamp: new Date().toISOString(),
        success,
        message: data.message || (success ? "Agente reiniciado com sucesso." : "Falha ao reiniciar agente."),
        latencyAfterMs: data.latencyMs || 25,
      };

      if (isMountedRef.current) {
        setRecoveryLogs((prev) => [log, ...prev.slice(0, 19)]);
        setHeartbeats((prev) => ({
          ...prev,
          [agentId]: {
            agentId,
            status: success ? "active" : "failing",
            latencyMs: data.latencyMs || 22,
            lastChecked: Date.now(),
            uptimePercentage: 99.99,
            restartCount: (prev[agentId]?.restartCount || 0) + 1,
            isAutoRecovering: false,
          },
        }));
      }

      inFlightRestartsRef.current.delete(agentId);
      return success;
    } catch (err: any) {
      if (isMountedRef.current) {
        setHeartbeats((prev) => ({
          ...prev,
          [agentId]: {
            ...(prev[agentId] || { agentId, latencyMs: 0, lastChecked: Date.now() }),
            status: "failing",
            isAutoRecovering: false,
            error: err?.message || "Erro no restart",
          },
        }));
      }
      inFlightRestartsRef.current.delete(agentId);
      return false;
    }
  }, []);

  // Poll single agent endpoint
  const pollAgent = useCallback(async (agentId: string): Promise<AgentHeartbeatState> => {
    const startTime = performance.now();
    try {
      const response = await fetch(`/api/agents/${encodeURIComponent(agentId)}/heartbeat`, {
        cache: "no-store",
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const failState: AgentHeartbeatState = {
          agentId,
          status: "failing",
          latencyMs,
          lastChecked: Date.now(),
          statusCode: response.status,
          error: `HTTP ${response.status}`,
          uptimePercentage: 88.0,
        };

        // Auto-Restart trigger: if failing and autoRestartEnabled, schedule recovery
        if (autoRestartEnabled && !inFlightRestartsRef.current.has(agentId)) {
          const attempts = restartAttemptsRef.current[agentId] || 0;
          if (attempts < 3) {
            restartAttemptsRef.current[agentId] = attempts + 1;
            setTimeout(() => {
              restartAgent(agentId, true);
            }, 600);
          }
        }

        return failState;
      }

      const data = await response.json();
      // Reset attempt counter on success
      restartAttemptsRef.current[agentId] = 0;

      const isHighLatency = latencyMs >= LATENCY_THRESHOLD_MS || data.status === "high_latency";
      const resolvedStatus: HeartbeatStatus = isHighLatency ? "high_latency" : "active";

      return {
        agentId,
        status: resolvedStatus,
        latencyMs: Math.max(latencyMs, data.latencyMs || 0),
        lastChecked: Date.now(),
        statusCode: 200,
        uptimePercentage: data.uptimePercentage || 99.98,
        restartCount: data.restartCount || 0,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const failState: AgentHeartbeatState = {
        agentId,
        status: "failing",
        latencyMs,
        lastChecked: Date.now(),
        error: err?.message || "Network Error",
        uptimePercentage: 0,
      };

      if (autoRestartEnabled && !inFlightRestartsRef.current.has(agentId)) {
        const attempts = restartAttemptsRef.current[agentId] || 0;
        if (attempts < 3) {
          restartAttemptsRef.current[agentId] = attempts + 1;
          setTimeout(() => {
            restartAgent(agentId, true);
          }, 600);
        }
      }

      return failState;
    }
  }, [autoRestartEnabled, restartAgent]);

  // Poll all agents
  const pollAllAgents = useCallback(async () => {
    if (!agents.length) return;
    setIsRefreshing(true);

    // Initial temporary checking state for agents without one
    setHeartbeats((prev) => {
      const next = { ...prev };
      agents.forEach((ag) => {
        if (!next[ag.id]) {
          next[ag.id] = {
            agentId: ag.id,
            status: "checking",
            latencyMs: 0,
            lastChecked: Date.now(),
          };
        }
      });
      return next;
    });

    // Execute in parallel chunks of 4 to balance load
    const results: AgentHeartbeatState[] = [];
    const chunkSize = 4;
    for (let i = 0; i < agents.length; i += chunkSize) {
      const chunk = agents.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map((ag) => pollAgent(ag.id)));
      results.push(...chunkResults);
    }

    if (isMountedRef.current) {
      setHeartbeats((prev) => {
        const next = { ...prev };
        results.forEach((res) => {
          next[res.agentId] = res;
        });
        return next;
      });
      setIsRefreshing(false);
    }
  }, [agents, pollAgent]);

  // Simulate or set state on an agent for instant testing
  const simulateAgentHeartbeat = useCallback(
    async (agentId: string, mode: "active" | "latency" | "fail" | "reset") => {
      try {
        await fetch(`/api/agents/${encodeURIComponent(agentId)}/heartbeat?simulate=${mode}`, {
          cache: "no-store",
        });
      } catch (err) {
        console.warn("Heartbeat simulation request error:", err);
      }
      // Re-poll immediately
      const updated = await pollAgent(agentId);
      if (isMountedRef.current) {
        setHeartbeats((prev) => ({
          ...prev,
          [agentId]: updated,
        }));
      }
    },
    [pollAgent]
  );

  // Setup periodic polling
  useEffect(() => {
    isMountedRef.current = true;
    pollAllAgents();

    if (!isPollingActive) return;

    const timer = setInterval(() => {
      pollAllAgents();
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
    };
  }, [pollAllAgents, isPollingActive]);

  // Summary counts
  const summary = {
    total: agents.length,
    active: 0,
    high_latency: 0,
    failing: 0,
    checking: 0,
  };

  agents.forEach((ag) => {
    const hb = heartbeats[ag.id];
    if (!hb || hb.status === "checking") {
      summary.checking++;
    } else if (hb.status === "active") {
      summary.active++;
    } else if (hb.status === "high_latency") {
      summary.high_latency++;
    } else if (hb.status === "failing") {
      summary.failing++;
    } else if (hb.status === "recovering") {
      summary.checking++;
    }
  });

  return {
    heartbeats,
    isRefreshing,
    isPollingActive,
    setIsPollingActive,
    pollAllAgents,
    pollAgent,
    simulateAgentHeartbeat,
    autoRestartEnabled,
    setAutoRestartEnabled,
    restartAgent,
    recoveryLogs,
    summary,
  };
}
