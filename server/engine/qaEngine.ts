/**
 * GAG CORE OS — PHASE 1: QA ENGINE
 * Automated Quality Assurance Evaluator for agent deliverables.
 * Evaluates deliverables across 5 distinct dimensions and produces structured QA reports.
 */

import { QAEvaluationReport, QACriteriaScore } from "./types";

export interface QAAssessmentInput {
  executionId: string;
  taskId: string;
  goal: string;
  agentId: string;
  deliverable: string;
  artifacts?: { name: string; type: string; content: string }[];
  expectedFormat?: string;
  passingScoreThreshold?: number; // default: 75
}

export class QAEngine {
  private static instance: QAEngine;

  private constructor() {}

  public static getInstance(): QAEngine {
    if (!QAEngine.instance) {
      QAEngine.instance = new QAEngine();
    }
    return QAEngine.instance;
  }

  /**
   * Evaluates a deliverable against GAG OS quality rubrics
   */
  public evaluate(input: QAAssessmentInput): QAEvaluationReport {
    const threshold = input.passingScoreThreshold ?? 75;
    const content = input.deliverable || "";
    const goal = input.goal || "";

    const criteriaScores: QACriteriaScore[] = [];

    // 1. Criterion: Completude e Abrangência (Weight 25%)
    const hasSufficientLength = content.length >= 80;
    const coversKeySubject = goal
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .some((word) => content.toLowerCase().includes(word));
    
    const completenessScore = !hasSufficientLength ? 30 : coversKeySubject ? 95 : 75;
    criteriaScores.push({
      criterion: "Completude e Cobertura do Objetivo",
      weight: 0.25,
      score: completenessScore,
      passed: completenessScore >= 70,
      notes: completenessScore >= 70
        ? "Entregável aborda os elementos centrais do pedido."
        : "Entregável excessivamente sucinto ou incompleto.",
    });

    // 2. Criterion: Estrutura e Formatação Acionável (Weight 20%)
    const hasMarkdownOrBullets =
      content.includes("\n-") ||
      content.includes("\n*") ||
      content.includes("\n1.") ||
      content.includes("##") ||
      content.includes("**");
    
    const structureScore = hasMarkdownOrBullets ? 95 : content.length > 150 ? 80 : 55;
    criteriaScores.push({
      criterion: "Estrutura e Legibilidade Acionável",
      weight: 0.20,
      score: structureScore,
      passed: structureScore >= 70,
      notes: structureScore >= 70
        ? "Formatação clara com pontos estruturados e hierarquia visual."
        : "Texto sem formatação ou blocos densos de difícil leitura.",
    });

    // 3. Criterion: Ausência de Placeholders ou Inconclusões (Weight 20%)
    const hasPlaceholders =
      /\[(?:inserir|adicionar|todo|placeholder|aqui|xyz)\]/i.test(content) ||
      content.includes("TODO") ||
      content.includes("FIXME") ||
      content.includes("PLACEHOLDER");
    
    const placeholderScore = hasPlaceholders ? 20 : 100;
    criteriaScores.push({
      criterion: "Ausência de Placeholders ou Rascunhos",
      weight: 0.20,
      score: placeholderScore,
      passed: !hasPlaceholders,
      notes: !hasPlaceholders
        ? "Sem pendências, rascunhos ou placeholders detectados."
        : "Foram encontrados placeholders não preenchidos (ex: [inserir], TODO).",
    });

    // 4. Criterion: Tom Institucional GAG Visual Core (Weight 20%)
    const isProfessional = !/\b(haha|kkk|droga|merda|sei lá)\b/i.test(content);
    const toneScore = isProfessional ? 95 : 35;
    criteriaScores.push({
      criterion: "Alinhamento com Tom e Padrões GAG Core OS",
      weight: 0.20,
      score: toneScore,
      passed: isProfessional,
      notes: isProfessional
        ? "Tom executivo, rigoroso e alinhado com a governança da empresa."
        : "Linguagem informal ou inadequada para o ambiente corporativo.",
    });

    // 5. Criterion: Integridade dos Artefatos Anexados (Weight 15%)
    const artifactsValid = input.artifacts && input.artifacts.length > 0
      ? input.artifacts.every((a) => a.content && a.content.length > 10)
      : true;
    
    const artifactScore = artifactsValid ? 90 : 40;
    criteriaScores.push({
      criterion: "Integridade e Consistência dos Artefatos",
      weight: 0.15,
      score: artifactScore,
      passed: artifactsValid,
      notes: artifactsValid
        ? "Artefatos válidos e consistentes com o entregável."
        : "Artefatos vazios ou malformados.",
    });

    // Calculate weighted overall score
    const overallScore = Math.round(
      criteriaScores.reduce((acc, curr) => acc + curr.score * curr.weight, 0)
    );

    const passed = overallScore >= threshold && !hasPlaceholders;

    // Generate targeted corrective instructions for retry controller if failed
    let correctiveInstructions: string | undefined = undefined;
    if (!passed) {
      const failedCriteria = criteriaScores.filter((c) => !c.passed);
      correctiveInstructions = `Ajustar os seguintes pontos reprovados no QA: ${failedCriteria
        .map((c) => `${c.criterion} (${c.notes})`)
        .join("; ")}. Certifique-se de entregar um texto completo, sem placeholders [inserir], formatado em tópicos claros.`;
    }

    const summaryFeedback = passed
      ? `Aprovado pelo QA Engine com nota ${overallScore}/100. Todos os critérios de completude, formatação e conformidade foram validados.`
      : `Reprovado pelo QA Engine com nota ${overallScore}/100 (Nota de corte: ${threshold}). É necessária revisão autônoma ou intervenção.`;

    return {
      executionId: input.executionId,
      taskId: input.taskId,
      passed,
      overallScore,
      criteriaScores,
      summaryFeedback,
      correctiveInstructions,
      retryRecommended: !passed,
      evaluatedBy: "QA-Engine-v1.0",
      evaluatedAt: new Date().toISOString(),
    };
  }
}

export const qaEngine = QAEngine.getInstance();
