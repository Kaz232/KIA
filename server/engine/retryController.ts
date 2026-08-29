/**
 * GAG CORE OS — PHASE 1: RETRY CONTROLLER
 * Manages exponential backoff with jitter, error categorization,
 * retry budgets, and adaptive prompt self-correction based on QA reports.
 */

import { RetryPlan, QAEvaluationReport } from "./types";

export interface RetryEvaluationParams {
  currentAttempt: number;
  maxAttempts: number;
  error?: any;
  qaReport?: QAEvaluationReport;
  originalGoal: string;
  previousOutput?: string;
}

export class RetryController {
  private static instance: RetryController;
  private static DEFAULT_MAX_ATTEMPTS = 3;
  private static BASE_DELAY_MS = 800;
  private static MAX_DELAY_MS = 6000;

  private constructor() {}

  public static getInstance(): RetryController {
    if (!RetryController.instance) {
      RetryController.instance = new RetryController();
    }
    return RetryController.instance;
  }

  /**
   * Evaluates if a task execution should be retried and constructs the adaptive retry plan
   */
  public evaluateRetry(params: RetryEvaluationParams): RetryPlan {
    const maxAttempts = params.maxAttempts || RetryController.DEFAULT_MAX_ATTEMPTS;
    const currentAttempt = params.currentAttempt || 1;

    // Check if budget exhausted
    if (currentAttempt >= maxAttempts) {
      return {
        shouldRetry: false,
        attemptNumber: currentAttempt,
        maxAttempts,
        backoffDelayMs: 0,
        errorCategory: "FATAL_LOGIC",
        adaptedPrompt: params.originalGoal,
        reason: `Orçamento de tentativas esgotado (${currentAttempt}/${maxAttempts}). Encaminhando para Handoff / Escalação.`,
      };
    }

    // Determine error category
    let errorCategory: RetryPlan["errorCategory"] = "TRANSIENT_NETWORK";
    let reason = "Falha detectada durante a execução.";

    if (params.qaReport && !params.qaReport.passed) {
      errorCategory = "QA_REVISION_NEEDED";
      reason = `Reprovação no QA Engine (Nota: ${params.qaReport.overallScore}/100).`;
    } else if (params.error) {
      const errStr = String(params.error?.message || params.error).toLowerCase();
      if (errStr.includes("rate") || errStr.includes("429") || errStr.includes("quota")) {
        errorCategory = "RATE_LIMIT";
        reason = "Limite de requisições na API atingido.";
      } else if (errStr.includes("timeout") || errStr.includes("timed out")) {
        errorCategory = "TIMEOUT";
        reason = "Tempo limite excedido na execução do modelo.";
      } else if (errStr.includes("permission") || errStr.includes("unauthorized") || errStr.includes("forbidden")) {
        errorCategory = "PERMISSION_DENIED";
        return {
          shouldRetry: false,
          attemptNumber: currentAttempt,
          maxAttempts,
          backoffDelayMs: 0,
          errorCategory: "PERMISSION_DENIED",
          adaptedPrompt: params.originalGoal,
          reason: "Erro de permissão ou RBAC. Tentativa subsequente não recomendada sem autorização.",
        };
      }
    }

    // Exponential Backoff with Jitter: delay = min(MAX, BASE * 2^(attempt - 1)) + jitter
    const exponential = RetryController.BASE_DELAY_MS * Math.pow(2, currentAttempt - 1);
    const jitter = Math.floor(Math.random() * 300);
    const backoffDelayMs = Math.min(RetryController.MAX_DELAY_MS, exponential + jitter);

    // Construct Adaptive Self-Correcting Prompt
    let adaptedPrompt = params.originalGoal;
    if (errorCategory === "QA_REVISION_NEEDED" && params.qaReport?.correctiveInstructions) {
      adaptedPrompt = `${params.originalGoal}

[INSTRUÇÕES MANDATÓRIAS DE REVISÃO DO SUPERVISOR QA - TENTATIVA ${currentAttempt + 1} DE ${maxAttempts}]:
O seu resultado anterior foi reprovado pelo QA. Corrija estritamente os seguintes problemas:
${params.qaReport.correctiveInstructions}
Certifique-se de apresentar uma resposta final completa, estruturada e de alto nível.`;
    } else if (errorCategory === "TIMEOUT") {
      adaptedPrompt = `${params.originalGoal}\n[AVISO DE DESEMPENHO]: Mantenha a resposta focada e concisa para evitar timeout.`;
    }

    return {
      shouldRetry: true,
      attemptNumber: currentAttempt + 1,
      maxAttempts,
      backoffDelayMs,
      errorCategory,
      adaptedPrompt,
      reason,
    };
  }

  /**
   * Helper delay promise for backoff execution
   */
  public async waitBackoff(delayMs: number): Promise<void> {
    if (delayMs <= 0) return;
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

export const retryController = RetryController.getInstance();
