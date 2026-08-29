/**
 * GAG CORE OS — TESTES DE SEGURANÇA DA API E RLS
 * Validação de autenticação, rejeição de tokens inválidos e proteção de storage.
 */
import http from "http";
import { app } from "../server/index";

export interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  error?: string;
}

export async function executeSecurityTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Validar bloqueio de acesso sem cabeçalho Authorization
    try {
      const res = await fetch(`${baseUrl}/api/registry`);
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 401 && (body.error !== undefined);
      results.push({
        name: "Deve bloquear pedidos sem cabeçalho Authorization com 401",
        passed,
        status: res.status,
      });
    } catch (e: any) {
      results.push({
        name: "Deve bloquear pedidos sem cabeçalho Authorization com 401",
        passed: false,
        error: e.message,
      });
    }

    // 2. Validar rejeição com token inválido
    try {
      const res = await fetch(`${baseUrl}/api/registry`, {
        headers: { Authorization: "Bearer token_invalido_123" },
      });
      const passed = res.status === 401;
      results.push({
        name: "Deve rejeitar tokens JWT malformatados ou expirados com 401",
        passed,
        status: res.status,
      });
    } catch (e: any) {
      results.push({
        name: "Deve rejeitar tokens JWT malformatados ou expirados com 401",
        passed: false,
        error: e.message,
      });
    }

    // 3. Validar isolamento de artefatos privados (não expostos em rotas públicas não mapeadas)
    try {
      const res = await fetch(`${baseUrl}/public/artifacts/secret.pdf`);
      const passed = res.status === 404;
      results.push({
        name: "Não deve expor URLs de armazenamento público direto sem autorização",
        passed,
        status: res.status,
      });
    } catch (e: any) {
      results.push({
        name: "Não deve expor URLs de armazenamento público direto sem autorização",
        passed: false,
        error: e.message,
      });
    }
  } finally {
    server.close();
  }

  return results;
}

// Execução autónoma caso seja invocado diretamente via CLI
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("security.test")) {
  executeSecurityTests().then((res) => {
    console.log("=== Resultados dos Testes de Segurança GAG ===");
    res.forEach((r) => {
      console.log(`${r.passed ? "✅ PASS" : "❌ FAIL"}: ${r.name} (Status: ${r.status ?? "N/A"})`);
    });
  });
}
