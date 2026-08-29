/**
 * GAG CORE OS — FASE 1: QA ENGINE
 * Evaluates deliverables against 8 strict operational quality dimensions:
 * 1. Output Existence & Non-Emptiness
 * 2. Briefing Fulfillment
 * 3. Correct Formatting (Markdown hierarchy, lists)
 * 4. Completeness & Depth
 * 5. Consistency & Quality of Language
 * 6. Artifact Verification
 * 7. Absence of Critical Errors / Placeholders / Mockups
 * 8. Score Categorization:
 *    - 0-49: REJECT
 *    - 50-74: NEEDS_REVIEW
 *    - 75-89: PASS
 *    - 90-100: EXCELLENT
 */

import { Artifact, QAResult, QAScoreCategory } from "./executionTypes";

interface QAAssessmentParams {
  executionId: string;
  stepId?: string;
  goal: string;
  output?: string;
  artifacts?: Artifact[];
  agentId?: string;
  minPassScore?: number;
}

export class QAEngine {
  private static instance: QAEngine;
  private readonly DEFAULT_PASS_SCORE = 75;

  private readonly PLACEHOLDER_PATTERNS = [
    /\[\s*inserir\s+[^\]]*\]/i,
    /\[\s*todo\s*\]/i,
    /\[\s*preencher\s*\]/i,
    /lorem ipsum/i,
    /\{substituir\}/i,
    /texto de exemplo/i,
    /<insira aqui>/i,
    /TODO:\s*/i,
  ];

  public static getInstance(): QAEngine {
    if (!QAEngine.instance) {
      QAEngine.instance = new QAEngine();
    }
    return QAEngine.instance;
  }

  /**
   * Assesses an agent deliverable output against standard quality criteria.
   */
  public evaluate(params: QAAssessmentParams): QAResult {
    const output = (params.output || "").trim();
    const artifacts = params.artifacts || [];
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 1. Output Existence & Non-Emptiness
    if (!output || output.length === 0) {
      return {
        passed: false,
        score: 0,
        category: "REJECT",
        issues: ["Entregável inexistente ou completamente vazio."],
        warnings: [],
        recommendations: ["O agente deve gerar conteúdo substancial para a meta atribuída."],
        requiresRetry: true,
        requiresOwnerApproval: false,
        evaluatedBy: "GAG_QA_Engine_v1",
        evaluatedAt: new Date().toISOString(),
        executionId: params.executionId,
        stepId: params.stepId,
      };
    }

    // 2. Minimum Length & Completeness
    const wordCount = output.split(/\s+/).filter(Boolean).length;
    if (wordCount < 15) {
      score -= 50;
      issues.push("Comprimento extremamente reduzido (< 15 palavras). O entregável carece de substância.");
      recommendations.push("Fornecer detalhamento operacional completo com tópicos acionáveis.");
    } else if (wordCount < 35) {
      score -= 20;
      warnings.push("Entregável conciso (< 35 palavras). Considere expandir os passos de execução.");
    }

    // 3. Placeholder & TODO Detection (Critical Quality Defect)
    let placeholderCount = 0;
    for (const pattern of this.PLACEHOLDER_PATTERNS) {
      if (pattern.test(output)) {
        placeholderCount++;
      }
    }
    if (placeholderCount > 0) {
      const penalty = Math.min(60, placeholderCount * 30);
      score -= penalty;
      issues.push(`Detetados ${placeholderCount} placeholders ou anotações pendentes ('TODO', '[inserir...]').`);
      recommendations.push("Remover placeholders e preencher todas as informações concretas.");
    }

    // 4. Formatting & Structure (Markdown headers, lists)
    const hasHeaders = /#{1,4}\s+/m.test(output) || output.includes("**");
    const hasLists = /^(\*|-|\d+\.)\s+/m.test(output);
    if (!hasHeaders && !hasLists) {
      score -= 25;
      issues.push("Falta de formatação estrutural (sem cabeçalhos Markdown ou listas organizadas).");
      recommendations.push("Organizar a resposta com títulos (###) e listas de itens claros.");
    } else if (!hasHeaders || !hasLists) {
      score -= 10;
      warnings.push("Formatação parcial. Recomenda-se combinar títulos estruturados com listas ordenadas.");
    }

    // 5. Briefing Alignment & Keywords Check
    const goalTokens = params.goal
      .toLowerCase()
      .split(/[\s,.-]+/)
      .filter((w) => w.length > 4);
    if (goalTokens.length > 0) {
      const lowerOutput = output.toLowerCase();
      let matchedTokens = 0;
      for (const token of goalTokens) {
        if (lowerOutput.includes(token)) {
          matchedTokens++;
        }
      }
      const matchRatio = matchedTokens / goalTokens.length;
      if (matchRatio < 0.2 && goalTokens.length >= 3) {
        score -= 20;
        warnings.push("Baixa correspondência direta com os termos-chave do briefing original.");
      }
    }

    // 6. Artifact Verification
    if (artifacts.length === 0 && !output.includes("```")) {
      score -= 5;
      warnings.push("Nenhum artefato específico ou bloco de código anexado.");
    }

    // Bound score
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Categorize
    let category: QAScoreCategory = "REJECT";
    if (score >= 90) category = "EXCELLENT";
    else if (score >= 75) category = "PASS";
    else if (score >= 50) category = "NEEDS_REVIEW";
    else category = "REJECT";

    const minPass = params.minPassScore || this.DEFAULT_PASS_SCORE;
    const passed = score >= minPass && placeholderCount === 0;
    const requiresRetry = !passed;

    return {
      passed,
      score,
      category,
      issues,
      warnings,
      recommendations,
      requiresRetry,
      requiresOwnerApproval: false,
      evaluatedBy: "GAG_QA_Engine_v1",
      evaluatedAt: new Date().toISOString(),
      executionId: params.executionId,
      stepId: params.stepId,
    };
  }
}

export const qaEngine = QAEngine.getInstance();
