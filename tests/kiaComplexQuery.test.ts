import { describe, it, expect, vi } from "vitest";
import {
  validateResponseCompleteness,
  sendComplexKiaQueryWithRetry,
  KiaApiResponse,
} from "../src/services/kiaRobustChat";

describe("KIA Complex Query & Retry Engine", () => {
  describe("validateResponseCompleteness", () => {
    it("identifies a perfectly complete response with proper terminal punctuation", () => {
      const text = "A proposta comercial da GAG Visual contempla 3 fases executivas com entrega em Luanda. O valor global é de 2.500.000 AOA.";
      const result = validateResponseCompleteness(text, "STOP", false);
      expect(result.isComplete).toBe(true);
      expect(result.endsAbruptly).toBe(false);
      expect(result.hasUnclosedCodeBlock).toBe(false);
      expect(result.completenessScore).toBe(100);
    });

    it("detects truncation when finishReason is MAX_TOKENS", () => {
      const text = "A proposta comercial inclui design, vídeo e automação";
      const result = validateResponseCompleteness(text, "MAX_TOKENS", true);
      expect(result.isComplete).toBe(false);
      expect(result.reason).toContain("MAX_TOKENS");
    });

    it("detects cutoffs mid-sentence with dangling punctuation", () => {
      const text = "Os entregáveis do projeto de tráfego pago incluem relatórios semanais, criativos dinâmicos,";
      const result = validateResponseCompleteness(text, "STOP", false);
      expect(result.isComplete).toBe(false);
      expect(result.endsAbruptly).toBe(true);
      expect(result.reason).toContain("pontuação aberta");
    });

    it("detects unclosed markdown code blocks", () => {
      const text = "Aqui está o snippet de integração:\n```typescript\nconst totalAoa = 450000;\nconsole.log(totalAoa);";
      const result = validateResponseCompleteness(text, "STOP", false);
      expect(result.isComplete).toBe(false);
      expect(result.hasUnclosedCodeBlock).toBe(true);
      expect(result.reason).toContain("bloco de código markdown não fechado");
    });

    it("validates closed code blocks as complete", () => {
      const text = "Segue o exemplo em JSON:\n```json\n{\"status\": \"ok\"}\n```";
      const result = validateResponseCompleteness(text, "STOP", false);
      expect(result.isComplete).toBe(true);
      expect(result.hasUnclosedCodeBlock).toBe(false);
    });
  });

  describe("sendComplexKiaQueryWithRetry logic", () => {
    it("retries automatically when first attempt is truncated and stitches response", async () => {
      let callCount = 0;
      const originalFetch = global.fetch;

      // Mock fetch to simulate truncation on attempt 1, and full completion on attempt 2
      global.fetch = vi.fn().mockImplementation(async (_url: string, init?: any) => {
        callCount++;
        const parsedBody = JSON.parse(init.body);

        if (callCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async (): Promise<KiaApiResponse> => ({
              content: "Fase 1: Diagnóstico e Planeamento Estratégico em Luanda. Levantamento de requisitos e definição de personas para o mercado angolano,",
              finishReason: "MAX_TOKENS",
              isTruncated: true,
              modelName: "gemini-3.7-flash",
              usageMetadata: { candidatesTokenCount: 2048 },
            }),
          };
        }

        // Attempt 2: returns continuation smoothly
        return {
          ok: true,
          status: 200,
          json: async (): Promise<KiaApiResponse> => ({
            content: "garantindo total aderência às regras comerciais da GAG Visual. O cronograma prevê 15 dias úteis para a entrega final.",
            finishReason: "STOP",
            isTruncated: false,
            modelName: "gemini-3.7-flash",
            usageMetadata: { candidatesTokenCount: 512 },
          }),
        };
      }) as any;

      try {
        const result = await sendComplexKiaQueryWithRetry({
          message: "Apresenta o plano executivo detalhado de expansão digital para um cliente empresarial em Luanda.",
          baseUrl: "http://localhost:3000",
          maxRetries: 2,
          initialMaxTokens: 2048,
          backoffBaseMs: 10,
        });

        expect(callCount).toBe(2);
        expect(result.retriesPerformed).toBe(1);
        expect(result.isComplete).toBe(true);
        expect(result.fullContent).toContain("Fase 1: Diagnóstico");
        expect(result.fullContent).toContain("cronograma prevê 15 dias úteis");
        expect(result.history[0].status).toBe("TRUNCATED");
        expect(result.history[1].status).toBe("SUCCESS");
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("handles HTTP 429 rate limit with backoff and succeeds on retry", async () => {
      let callCount = 0;
      const originalFetch = global.fetch;

      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            ok: false,
            status: 429,
            statusText: "Too Many Requests",
          };
        }

        return {
          ok: true,
          status: 200,
          json: async (): Promise<KiaApiResponse> => ({
            content: "Proposta consolidada com sucesso após contingência de taxa. Orçamento: 1.800.000 AOA.",
            finishReason: "STOP",
            isTruncated: false,
            modelName: "gemini-3.7-flash",
          }),
        };
      }) as any;

      try {
        const result = await sendComplexKiaQueryWithRetry({
          message: "Test Rate Limit",
          baseUrl: "http://localhost:3000",
          maxRetries: 2,
          backoffBaseMs: 10,
        });

        expect(callCount).toBe(2);
        expect(result.isComplete).toBe(true);
        expect(result.history[0].status).toBe("RATE_LIMITED");
        expect(result.history[1].status).toBe("SUCCESS");
      } finally {
        global.fetch = originalFetch;
      }
    });

    it(
      "successfully queries running dev server with a complex prompt without cuts",
      async () => {
        // Integration test with live server endpoint
        const complexPrompt =
          "Elabora uma estratégia completa para lançamento de uma marca em Luanda com 3 etapas: branding, produção audiovisual e anúncios pagos, com estimativa em Kwanzas (AOA) e prazos de execução.";

        const result = await sendComplexKiaQueryWithRetry({
          message: complexPrompt,
          baseUrl: "http://localhost:3000",
          maxRetries: 2,
          initialMaxTokens: 2048,
          backoffBaseMs: 100,
        });

        expect(result).toBeDefined();
        expect(result.fullContent.length).toBeGreaterThan(50);
        expect(result.isComplete).toBe(true);
        expect(result.validation.endsAbruptly).toBe(false);
        expect(result.validation.hasUnclosedCodeBlock).toBe(false);
      },
      30000
    );
  });
});
