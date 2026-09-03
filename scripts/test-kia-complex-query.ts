/**
 * Script de Teste Automatizado: Consulta Complexa para KIA com Validação de Integridade e Retry
 * Execução: npx tsx scripts/test-kia-complex-query.ts
 */

import { sendComplexKiaQueryWithRetry, validateResponseCompleteness } from "../src/services/kiaRobustChat";

async function runKiaIntegrityTest() {
  console.log("\n" + "=".repeat(75));
  console.log("🚀 INICIANDO TESTE DE INTEGRIDADE & RESILIÊNCIA - KIA GAG CORE");
  console.log("=".repeat(75));

  const complexQuestion = `
Elabora um plano operacional completo e detalhado para a GAG Visual em Luanda:
1. Diagnóstico do mercado publicitário e de comunicação empresarial em Luanda, identificando os 3 setores com maior procura por serviços de alta conversão.
2. Portfólio estruturado de serviços (Design de Elite, Produção Audiovisual/Vídeos Promocionais, Gestão de Redes Sociais, Tráfego Pago e Automações) com valores e orçamentos sugeridos EXCLUSIVAMENTE em Kwanzas (AOA).
3. Cronograma tático de execução de 4 semanas com marcos de validação e entregáveis específicos semana a semana.
4. Matriz de mitigação de riscos operacionais em Angola (estabilidade de energia, redundância de telecomunicações e fluxos de aprovação com decisores locais).
5. Argumentário comercial de fecho de vendas para decisores de topo (CEOs e Diretores Gerais em Luanda) com proposta de chamada de alinhamento.
`.trim();

  console.log("\n📋 Pergunta Complexa Enviada:");
  console.log(complexQuestion);
  console.log("\n" + "-".repeat(75));
  console.log("⏳ Enviando para endpoint /api/kia/chat...");

  const startTime = Date.now();

  try {
    const result = await sendComplexKiaQueryWithRetry({
      message: complexQuestion,
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
      maxRetries: 3,
      initialMaxTokens: 2048,
      maxTokensCap: 8192,
      backoffBaseMs: 1000,
      requestContinuationOnTruncate: true,
      userName: "Josemar Gourgel",
      userRole: "OWNER",
      onAttempt: (log) => {
        const icon =
          log.status === "SUCCESS"
            ? "✅"
            : log.status === "TRUNCATED"
            ? "⚠️"
            : log.status === "RATE_LIMITED"
            ? "⏳"
            : "❌";
        console.log(
          `  [Tentativa ${log.attempt}] ${icon} Status: ${log.status} | Duração: ${log.durationMs}ms | Tokens: ${log.maxTokensUsed} | Score: ${log.completenessScore}%`
        );
        if (log.error) {
          console.log(`    ↳ Aviso: ${log.error}`);
        }
      },
    });

    const elapsed = Date.now() - startTime;

    console.log("\n" + "=".repeat(75));
    console.log("📊 RELATÓRIO DE EXECUÇÃO & VALIDAÇÃO");
    console.log("=".repeat(75));

    console.log(`• Status de Integridade:   ${result.isComplete ? "INTEGRAL (SEM CORTES) ✅" : "INCOMPLETO ⚠️"}`);
    console.log(`• Total de Tentativas:     ${result.totalAttempts} (Retries acionados: ${result.retriesPerformed})`);
    console.log(`• Tempo Total Decorrido:   ${result.totalDurationMs}ms (${(elapsed / 1000).toFixed(2)}s)`);
    console.log(`• Modelo Utilizado:        ${result.usedModel}`);
    console.log(`• Motivo de Finalização:   ${result.finalFinishReason}`);
    console.log(`• Score de Integridade:    ${result.validation.completenessScore}/100`);
    console.log(`• Diagnóstico do Validador: ${result.validation.reason}`);
    console.log(`• Caracteres Recebidos:    ${result.fullContent.length} caracteres`);

    console.log("\n" + "-".repeat(75));
    console.log("📝 AMOSTRA DO CONTEÚDO RECEBIDO (PRIMEIROS 500 CARACTERES):");
    console.log("-".repeat(75));
    console.log(result.fullContent.slice(0, 500) + (result.fullContent.length > 500 ? "\n[... continua ...]" : ""));

    console.log("\n" + "-".repeat(75));
    console.log("📝 FECHO DO CONTEÚDO (ÚLTIMOS 300 CARACTERES):");
    console.log("-".repeat(75));
    console.log(result.fullContent.slice(-300));

    // Validations assertions for automated scripts
    if (!result.isComplete) {
      console.error("\n❌ FALHA: A resposta da KIA foi recebida com cortes ou truncada.");
      process.exit(1);
    }

    if (result.fullContent.length < 100) {
      console.error("\n❌ FALHA: A resposta recebida foi excessivamente curta para a complexidade exigida.");
      process.exit(1);
    }

    console.log("\n✨ SUCESSO: A resposta foi recebida integralmente, sem cortes, e a lógica de Retry foi validada com perfeição!\n");
  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE A EXECUÇÃO DO TESTE:", error.message || error);
    process.exit(1);
  }
}

runKiaIntegrityTest();
