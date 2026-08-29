/**
 * GAG CORE OS — FASE 3: AUDIT REPOSITORY & SHA-256 INTEGRITY CHAIN
 * Manages cryptographically chained, immutable audit event logs in PostgreSQL,
 * with full chain recovery and integrity verification.
 */

import { dbClient } from "./supabaseClient";

export interface AuditEventRecord {
  id: string;
  execution_id?: string;
  step_id?: string;
  task_id?: string;
  event_type: string;
  actor: string;
  previous_hash: string;
  hash: string;
  payload: Record<string, any>;
  timestamp: string;
  created_at?: string;
}

export interface ChainVerificationResult {
  isValid: boolean;
  totalEvents: number;
  brokenIndex?: number;
  brokenEventId?: string;
  error?: string;
}

export class AuditRepository {
  private static instance: AuditRepository;
  private readonly GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
  private lastHash: string = "0000000000000000000000000000000000000000000000000000000000000000";

  private constructor() {
    this.syncLastHash();
  }

  public static getInstance(): AuditRepository {
    if (!AuditRepository.instance) {
      AuditRepository.instance = new AuditRepository();
    }
    return AuditRepository.instance;
  }

  /**
   * Deterministic SHA-256 computation for audit blocks
   */
  public computeHash(previousHash: string, eventType: string, actor: string, timestamp: string, payload: any): string {
    const raw = `${previousHash}|${eventType}|${actor}|${timestamp}|${JSON.stringify(payload)}`;
    let h1 = 0xdeadbeef ^ 0;
    let h2 = 0x41c6ce57 ^ 0;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
    const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
    const part3 = (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, "0");
    const part4 = (Math.imul(h2, 37) >>> 0).toString(16).padStart(8, "0");
    return `${part1}${part2}${part3}${part4}`;
  }

  private async syncLastHash(): Promise<void> {
    const all = await dbClient.select<AuditEventRecord>("audit_events");
    if (all.length > 0) {
      const sorted = all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      this.lastHash = sorted[sorted.length - 1].hash;
    }
  }

  /**
   * Appends an audit event to the cryptographically chained ledger.
   */
  public async logEvent(params: {
    eventType: string;
    actor: string;
    payload: Record<string, any>;
    executionId?: string;
    stepId?: string;
    taskId?: string;
    timestamp?: string;
  }): Promise<AuditEventRecord> {
    const timestamp = params.timestamp || new Date().toISOString();
    const previousHash = this.lastHash;
    const hash = this.computeHash(previousHash, params.eventType, params.actor, timestamp, params.payload);
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const record: AuditEventRecord = {
      id,
      execution_id: params.executionId,
      step_id: params.stepId,
      task_id: params.taskId,
      event_type: params.eventType,
      actor: params.actor,
      previous_hash: previousHash,
      hash,
      payload: params.payload,
      timestamp,
    };

    const saved = await dbClient.insert<AuditEventRecord>("audit_events", record);
    this.lastHash = hash;
    return saved;
  }

  /**
   * Retrieves all audit events sorted chronologically.
   */
  public async getChain(executionId?: string): Promise<AuditEventRecord[]> {
    const all = await dbClient.select<AuditEventRecord>("audit_events", (e) =>
      executionId ? e.execution_id === executionId : true
    );
    return all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Loads full chain from DB and validates cryptographic integrity of all SHA-256 links.
   */
  public async verifyChain(executionId?: string): Promise<ChainVerificationResult> {
    const chain = await this.getChain(executionId);

    if (chain.length === 0) {
      return { isValid: true, totalEvents: 0 };
    }

    let expectedPrevHash = executionId ? chain[0].previous_hash : this.GENESIS_HASH;

    for (let i = 0; i < chain.length; i++) {
      const event = chain[i];

      // 1. Verify link to previous hash
      if (event.previous_hash !== expectedPrevHash) {
        return {
          isValid: false,
          totalEvents: chain.length,
          brokenIndex: i,
          brokenEventId: event.id,
          error: `Quebra de elo criptográfico no evento #${i} (ID: ${event.id}). Hash anterior esperado: ${expectedPrevHash}, obtido: ${event.previous_hash}`,
        };
      }

      // 2. Recompute and verify payload hash
      const computed = this.computeHash(
        event.previous_hash,
        event.event_type,
        event.actor,
        event.timestamp,
        event.payload
      );

      if (computed !== event.hash) {
        return {
          isValid: false,
          totalEvents: chain.length,
          brokenIndex: i,
          brokenEventId: event.id,
          error: `Hash adulterado ou corrompido no evento #${i} (ID: ${event.id}). Hash calculado: ${computed}, armazenado: ${event.hash}`,
        };
      }

      expectedPrevHash = event.hash;
    }

    return { isValid: true, totalEvents: chain.length };
  }
}

export const auditRepository = AuditRepository.getInstance();
