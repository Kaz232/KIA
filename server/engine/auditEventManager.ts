/**
 * GAG CORE OS — PHASE 1: AUDIT EVENT MANAGER
 * Implements an immutable, SHA-256 cryptographic chain-linked audit trail
 * for all engine state transitions, supervisor verdicts, QA scores, retries and handoffs.
 */

import crypto from "crypto";
import { AuditEventBlock, Phase1ExecutionState } from "./types";

export class AuditEventManager {
  private static instance: AuditEventManager;
  private auditChain: AuditEventBlock[] = [];
  private lastHash: string = "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";

  private constructor() {}

  public static getInstance(): AuditEventManager {
    if (!AuditEventManager.instance) {
      AuditEventManager.instance = new AuditEventManager();
    }
    return AuditEventManager.instance;
  }

  /**
   * Calculates the SHA-256 hash for a block payload and its previousHash
   */
  private calculateHash(
    traceId: string,
    executionId: string,
    action: string,
    newState: Phase1ExecutionState,
    timestamp: string,
    previousHash: string,
    details: Record<string, any>
  ): string {
    const raw = `${traceId}|${executionId}|${action}|${newState}|${timestamp}|${previousHash}|${JSON.stringify(details)}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  /**
   * Records a new audit event and appends it to the immutable hash chain
   */
  public recordEvent(params: {
    traceId: string;
    executionId: string;
    taskId?: string;
    agentId?: string;
    actor: string;
    action: string;
    previousState?: Phase1ExecutionState;
    newState: Phase1ExecutionState;
    details: Record<string, any>;
  }): AuditEventBlock {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const previousHash = this.lastHash;

    const hash = this.calculateHash(
      params.traceId,
      params.executionId,
      params.action,
      params.newState,
      timestamp,
      previousHash,
      params.details
    );

    const block: AuditEventBlock = {
      id,
      traceId: params.traceId,
      executionId: params.executionId,
      taskId: params.taskId,
      agentId: params.agentId,
      actor: params.actor,
      action: params.action,
      previousState: params.previousState,
      newState: params.newState,
      details: params.details,
      timestamp,
      previousHash,
      hash,
    };

    this.auditChain.push(block);
    this.lastHash = hash;

    return block;
  }

  /**
   * Retrieves the full audit trail for a specific executionId or traceId
   */
  public getTrailForExecution(executionId: string): AuditEventBlock[] {
    return this.auditChain.filter(
      (b) => b.executionId === executionId || b.traceId === executionId
    );
  }

  /**
   * Retrieves the global audit chain (latest N blocks)
   */
  public getGlobalChain(limit: number = 100): AuditEventBlock[] {
    return this.auditChain.slice(-limit);
  }

  /**
   * Verifies the cryptographic integrity of the entire chain
   */
  public verifyIntegrity(): { isValid: boolean; checkedCount: number; brokenBlockId?: string; error?: string } {
    if (this.auditChain.length === 0) {
      return { isValid: true, checkedCount: 0 };
    }

    let expectedPrevHash = "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < this.auditChain.length; i++) {
      const block = this.auditChain[i];

      // Check linkage
      if (block.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          checkedCount: i,
          brokenBlockId: block.id,
          error: `Broken linkage at block ${block.id}. Expected prev: ${expectedPrevHash}, got: ${block.previousHash}`,
        };
      }

      // Recompute hash
      const computed = this.calculateHash(
        block.traceId,
        block.executionId,
        block.action,
        block.newState,
        block.timestamp,
        block.previousHash,
        block.details
      );

      if (computed !== block.hash) {
        return {
          isValid: false,
          checkedCount: i,
          brokenBlockId: block.id,
          error: `Hash mismatch at block ${block.id}. Recomputed: ${computed}, stored: ${block.hash}`,
        };
      }

      expectedPrevHash = block.hash;
    }

    return {
      isValid: true,
      checkedCount: this.auditChain.length,
    };
  }

  /**
   * Clears the chain (for testing purposes)
   */
  public resetForTesting(): void {
    this.auditChain = [];
    this.lastHash = "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";
  }
}

export const auditEventManager = AuditEventManager.getInstance();
