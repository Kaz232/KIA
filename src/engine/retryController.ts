/**
 * GAG CORE OS — FASE 1: RETRY CONTROLLER
 * Manages retry cycles, enforcing strict limits (MAX 3 attempts), preventing infinite loops,
 * and generating self-healing adaptive prompts based on QA Engine feedback.
 */

import { QAResult, RetryAttempt } from "./executionTypes";

export class RetryController {
  private static instance: RetryController;
  public static readonly MAX_RETRIES = 3;
  private readonly BASE_BACKOFF_MS = 600;

  public static getInstance(): RetryController {
    if (!RetryController.instance) {
      RetryController.instance = new RetryController();
    }
    return RetryController.instance;
  }

  /**
   * Checks whether another retry attempt is legally allowed.
   */
  public canRetry(currentAttempts: number, maxRetries = RetryController.MAX_RETRIES): boolean {
    return currentAttempts < maxRetries;
  }

  /**
   * Calculates exponential backoff delay with jitter.
   */
  public calculateBackoffMs(attemptNumber: number): number {
    const exponent = Math.max(0, attemptNumber - 1);
    const delay = this.BASE_BACKOFF_MS * Math.pow(2, exponent);
    const jitter = Math.floor(Math.random() * 150);
    return Math.min(5000, delay + jitter);
  }

  /**
   * Builds an adapted self-correcting prompt incorporating QA issues and recommendations.
   */
  public buildAdaptedPrompt(originalGoal: string, qaResult?: QAResult, error?: string): string {
    const corrections: string[] = [];

    if (qaResult?.issues && qaResult.issues.length > 0) {
      corrections.push(`- CORREÇÕES DE QUALIDADE NECESSÁRIAS: ${qaResult.issues.join("; ")}`);
    }

    if (qaResult?.recommendations && qaResult.recommendations.length > 0) {
      corrections.push(`- RECOMENDAÇÕES QA: ${qaResult.recommendations.join("; ")}`);
    }

    if (error) {
      corrections.push(`- ERRO ANTERIOR: ${error}`);
    }

    if (corrections.length === 0) {
      return originalGoal;
    }

    return `${originalGoal}\n\n[INSTRUÇÕES DE AUTO-CORREÇÃO GAG QA]:\n${corrections.join("\n")}\n\nPor favor, entregue o resultado final completamente revisado, sem placeholders e com formatação impecável.`;
  }

  /**
   * Creates a formal RetryAttempt record.
   */
  public recordRetry(
    attemptNumber: number,
    agentId: string,
    reason: string,
    error?: string,
    adaptedPrompt?: string
  ): RetryAttempt {
    return {
      attemptNumber,
      maxAttempts: RetryController.MAX_RETRIES,
      agentId,
      reason,
      error,
      timestamp: new Date().toISOString(),
      adaptedPrompt,
    };
  }
}

export const retryController = RetryController.getInstance();
