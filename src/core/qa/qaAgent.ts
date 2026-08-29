import { QAEvaluation } from "../types";
import { ToolRegistry } from "../tools/toolRegistry";

export class QAAgent {
  private static instance: QAAgent;

  public static getInstance(): QAAgent {
    if (!QAAgent.instance) {
      QAAgent.instance = new QAAgent();
    }
    return QAAgent.instance;
  }

  public async evaluateDeliverable(
    taskTitle: string,
    content: string,
    taskType = "GENERAL",
    briefing?: string
  ): Promise<QAEvaluation> {
    const toolRegistry = ToolRegistry.getInstance();
    const qaTool = toolRegistry.getTool("tool_evaluate_qa");

    if (qaTool) {
      const res = await qaTool.execute(
        {
          content,
          taskType,
          briefingRequirements: briefing,
        },
        {}
      );

      if (res.success && res.data) {
        return {
          passed: res.data.passed,
          score: res.data.score,
          feedback: res.data.feedback,
          criteriaResults: res.data.criteriaResults || [],
          evaluatedBy: "QA-Agent-Supervisor",
          evaluatedAt: new Date().toISOString(),
          retryRecommended: !res.data.passed,
        };
      }
    }

    // Default fallback verification
    const passed = content.length > 50 && !content.includes("TODO_HERE");
    return {
      passed,
      score: passed ? 85 : 45,
      feedback: passed
        ? "Entregável atende aos requisitos estruturais mínimos."
        : "Entregável insuficiente ou com pendências não resolvidas.",
      criteriaResults: [
        { criterion: "Completude do texto", passed },
        { criterion: "Ausência de placeholders", passed: !content.includes("TODO_HERE") },
      ],
      evaluatedBy: "QA-Agent-Fallback",
      evaluatedAt: new Date().toISOString(),
      retryRecommended: !passed,
    };
  }
}
