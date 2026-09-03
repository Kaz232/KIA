export interface KiaUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface KiaApiResponse {
  content: string;
  intent?: string;
  capability?: string;
  executionStatus?: string;
  modelName?: string;
  finishReason?: string;
  usageMetadata?: KiaUsageMetadata;
  isTruncated?: boolean;
  auditRef?: string;
  executionTimeMs?: number;
  suggestedPrompts?: string[];
  actionCard?: any;
  actionPayload?: any;
}

export interface CompletenessValidation {
  isComplete: boolean;
  reason: string;
  hasUnclosedCodeBlock: boolean;
  hasUnclosedParenthesis: boolean;
  endsAbruptly: boolean;
  completenessScore: number; // 0 to 100
}

export interface AttemptLog {
  attempt: number;
  maxTokensUsed: number;
  durationMs: number;
  status: "SUCCESS" | "TRUNCATED" | "ERROR_RETRYING" | "RATE_LIMITED";
  finishReason?: string;
  error?: string;
  tokenCount?: number;
  completenessScore: number;
}

export interface KiaRobustResult {
  fullContent: string;
  isComplete: boolean;
  totalAttempts: number;
  retriesPerformed: number;
  finalFinishReason: string;
  usedModel: string;
  totalDurationMs: number;
  history: AttemptLog[];
  validation: CompletenessValidation;
  finalResponse: KiaApiResponse;
}

export interface KiaRobustQueryOptions {
  message: string;
  history?: Array<{ role: string; content: string }>;
  baseUrl?: string;
  maxRetries?: number;
  initialMaxTokens?: number;
  maxTokensCap?: number;
  backoffBaseMs?: number;
  onAttempt?: (log: AttemptLog) => void;
  requestContinuationOnTruncate?: boolean;
  userName?: string;
  userRole?: string;
}

/**
 * Validates whether a response from KIA is complete without cuts or truncations.
 */
export function validateResponseCompleteness(
  text: string,
  finishReason?: string,
  isTruncated?: boolean
): CompletenessValidation {
  const clean = (text || "").trim();

  // If server explicitly flagged MAX_TOKENS or isTruncated
  if (finishReason === "MAX_TOKENS" || isTruncated === true) {
    return {
      isComplete: false,
      reason: "Limite de tokens excedido (finishReason: MAX_TOKENS ou isTruncated: true).",
      hasUnclosedCodeBlock: false,
      hasUnclosedParenthesis: false,
      endsAbruptly: true,
      completenessScore: 40,
    };
  }

  if (!clean || clean.length < 10) {
    return {
      isComplete: false,
      reason: "Resposta vazia ou excessivamente curta.",
      hasUnclosedCodeBlock: false,
      hasUnclosedParenthesis: false,
      endsAbruptly: true,
      completenessScore: 10,
    };
  }

  // 1. Check unclosed code blocks (```)
  const codeBlockMatches = clean.match(/```/g);
  const hasUnclosedCodeBlock = Boolean(codeBlockMatches && codeBlockMatches.length % 2 !== 0);

  // 2. Check unclosed brackets / braces
  const openParens = (clean.match(/\(/g) || []).length;
  const closeParens = (clean.match(/\)/g) || []).length;
  const openBrackets = (clean.match(/\[/g) || []).length;
  const closeBrackets = (clean.match(/\]/g) || []).length;
  const hasUnclosedParenthesis = openParens > closeParens || openBrackets > closeBrackets;

  // 3. Check if text ends abruptly mid-sentence
  const terminalPunctuation = /[.!?:"'”’\)\*✓\]]$/;
  const endsWithTerminal = terminalPunctuation.test(clean);
  const endsWithDanglingPunctuation = /[,;\-–—\/&]$/.test(clean);

  const endsAbruptly = hasUnclosedCodeBlock || (!endsWithTerminal && !clean.endsWith("```")) || endsWithDanglingPunctuation;

  let score = 100;
  if (hasUnclosedCodeBlock) score -= 35;
  if (hasUnclosedParenthesis) score -= 20;
  if (endsWithDanglingPunctuation) score -= 30;
  if (!endsWithTerminal && !clean.endsWith("```")) score -= 25;

  const isComplete = !hasUnclosedCodeBlock && !endsWithDanglingPunctuation && (endsWithTerminal || clean.endsWith("```"));

  const reason = isComplete
    ? "Resposta recebida integralmente com terminação e estrutura válidas."
    : hasUnclosedCodeBlock
    ? "Corte detetado: bloco de código markdown não fechado."
    : endsWithDanglingPunctuation
    ? "Corte detetado: a resposta terminou abruptamente com pontuação aberta."
    : "Corte detetado: frase final interrompida antes da conclusão.";

  return {
    isComplete,
    reason,
    hasUnclosedCodeBlock,
    hasUnclosedParenthesis,
    endsAbruptly,
    completenessScore: Math.max(0, Math.min(100, score)),
  };
}

/**
 * Sends a complex query to KIA with automatic retry, token limit increase,
 * and seamless continuation if truncation occurs.
 */
export async function sendComplexKiaQueryWithRetry(
  options: KiaRobustQueryOptions
): Promise<KiaRobustResult> {
  const {
    message,
    history = [],
    baseUrl = "",
    maxRetries = 3,
    initialMaxTokens = 2048,
    maxTokensCap = 8192,
    backoffBaseMs = 800,
    onAttempt,
    requestContinuationOnTruncate = true,
    userName = "Josemar Gourgel",
    userRole = "OWNER",
  } = options;

  const resolvedBaseUrl = baseUrl || (typeof window !== "undefined" ? "" : "http://localhost:3000");
  const endpoint = `${resolvedBaseUrl}/api/kia/chat`;

  const attemptHistory: AttemptLog[] = [];
  let currentMaxTokens = initialMaxTokens;
  let accumulatedContent = "";
  let lastApiResponse: KiaApiResponse = { content: "" };
  let overallStart = Date.now();

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const attemptStart = Date.now();

    // Determine query message (initial message vs continuation request)
    let queryMessage = message;
    let queryHistory = [...history];

    if (accumulatedContent && requestContinuationOnTruncate) {
      const lastContextPiece = accumulatedContent.slice(-250);
      queryMessage = `Continua exatamente a partir do seguinte ponto sem repetir o que já foi dito, completando a análise com todas as secções em falta:\n"...${lastContextPiece}"`;
      queryHistory.push(
        { role: "user", content: message },
        { role: "model", content: accumulatedContent }
      );
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryMessage,
          history: queryHistory,
          maxOutputTokens: currentMaxTokens,
          userName,
          userRole,
        }),
      });

      const attemptDuration = Date.now() - attemptStart;

      // Handle Rate Limit (HTTP 429) or Server Overload (HTTP 503)
      if (res.status === 429 || res.status === 503) {
        const backoffMs = backoffBaseMs * Math.pow(2, attempt - 1) + Math.random() * 200;
        const log: AttemptLog = {
          attempt,
          maxTokensUsed: currentMaxTokens,
          durationMs: attemptDuration,
          status: "RATE_LIMITED",
          error: `HTTP ${res.status}: Limite de taxa ou sobrecarga atingido. Aguardando ${Math.round(backoffMs)}ms.`,
          completenessScore: 0,
        };
        attemptHistory.push(log);
        onAttempt?.(log);

        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        } else {
          throw new Error(`Excedido o número de tentativas após erro ${res.status}.`);
        }
      }

      if (!res.ok) {
        throw new Error(`Erro na API da KIA: HTTP ${res.status} ${res.statusText}`);
      }

      const data: KiaApiResponse = await res.json();
      lastApiResponse = data;

      const chunkContent = data.content || "";
      accumulatedContent = accumulatedContent
        ? `${accumulatedContent.trimEnd()}\n\n${chunkContent.trimStart()}`
        : chunkContent;

      const validation = validateResponseCompleteness(
        accumulatedContent,
        data.finishReason,
        data.isTruncated
      );

      // If response is complete and not truncated
      if (validation.isComplete && !data.isTruncated) {
        const log: AttemptLog = {
          attempt,
          maxTokensUsed: currentMaxTokens,
          durationMs: attemptDuration,
          status: "SUCCESS",
          finishReason: data.finishReason || "STOP",
          tokenCount: data.usageMetadata?.candidatesTokenCount,
          completenessScore: validation.completenessScore,
        };
        attemptHistory.push(log);
        onAttempt?.(log);

        return {
          fullContent: accumulatedContent,
          isComplete: true,
          totalAttempts: attempt,
          retriesPerformed: attempt - 1,
          finalFinishReason: data.finishReason || "STOP",
          usedModel: data.modelName || "gemini-3.7-flash",
          totalDurationMs: Date.now() - overallStart,
          history: attemptHistory,
          validation,
          finalResponse: { ...data, content: accumulatedContent },
        };
      }

      // Truncation detected - Trigger Retry Logic
      const nextMaxTokens = Math.min(maxTokensCap, currentMaxTokens * 2);
      const log: AttemptLog = {
        attempt,
        maxTokensUsed: currentMaxTokens,
        durationMs: attemptDuration,
        status: "TRUNCATED",
        finishReason: data.finishReason || "MAX_TOKENS",
        tokenCount: data.usageMetadata?.candidatesTokenCount,
        completenessScore: validation.completenessScore,
        error: `Resposta truncada (${validation.reason}). Aumentando capacidade para ${nextMaxTokens} tokens e solicitando continuação.`,
      };
      attemptHistory.push(log);
      onAttempt?.(log);

      if (attempt <= maxRetries) {
        currentMaxTokens = nextMaxTokens;
        const delay = backoffBaseMs * Math.pow(1.5, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If reached maxRetries but still incomplete
      return {
        fullContent: accumulatedContent,
        isComplete: false,
        totalAttempts: attempt,
        retriesPerformed: attempt - 1,
        finalFinishReason: data.finishReason || "MAX_TOKENS",
        usedModel: data.modelName || "gemini-3.7-flash",
        totalDurationMs: Date.now() - overallStart,
        history: attemptHistory,
        validation,
        finalResponse: { ...data, content: accumulatedContent },
      };
    } catch (err: any) {
      const attemptDuration = Date.now() - attemptStart;
      const errorMsg = err?.message || String(err);
      const log: AttemptLog = {
        attempt,
        maxTokensUsed: currentMaxTokens,
        durationMs: attemptDuration,
        status: "ERROR_RETRYING",
        error: errorMsg,
        completenessScore: 0,
      };
      attemptHistory.push(log);
      onAttempt?.(log);

      if (attempt <= maxRetries) {
        const backoff = backoffBaseMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      } else {
        throw new Error(`Falha irrecuperável após ${attempt} tentativas: ${errorMsg}`);
      }
    }
  }

  const finalValidation = validateResponseCompleteness(accumulatedContent, "MAX_RETRIES_EXCEEDED", true);
  return {
    fullContent: accumulatedContent,
    isComplete: false,
    totalAttempts: maxRetries + 1,
    retriesPerformed: maxRetries,
    finalFinishReason: "MAX_RETRIES_EXCEEDED",
    usedModel: lastApiResponse.modelName || "unknown",
    totalDurationMs: Date.now() - overallStart,
    history: attemptHistory,
    validation: finalValidation,
    finalResponse: { ...lastApiResponse, content: accumulatedContent },
  };
}
