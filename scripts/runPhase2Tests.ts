/**
 * GAG CORE OS — FASE 1 & FASE 2: CONSOLIDATED TEST SUITE RUNNER
 */

import { EngineTestRunner } from "../src/engine/testRunner";
import { registryTestRunner } from "../src/registry/registryTestRunner";

async function main() {
  console.log("==================================================");
  console.log("⚡ INICIANDO VALIDAÇÃO COMPLETA: FASE 1 & FASE 2");
  console.log("==================================================\n");

  // Run Phase 1 Suite
  console.log("▶️ EXECUTANDO TESTES DA FASE 1 (Core Autonomous Engine)...");
  const phase1Report = await EngineTestRunner.runAllTests();
  console.log(`Fase 1: ${phase1Report.passedCount}/${phase1Report.totalTests} testes aprovados.`);
  for (const t of phase1Report.results) {
    console.log(`  [${t.passed ? "PASS" : "FAIL"}] ${t.name} (${t.durationMs}ms) - ${t.message}`);
  }

  // Run Phase 2 Suite
  console.log("\n▶️ EXECUTANDO TESTES DA FASE 2 (Skill, Tool, Capability Registries)...");
  const phase2Report = await registryTestRunner.runAllTests();
  console.log(`Fase 2: ${phase2Report.passed}/${phase2Report.total} testes aprovados (${phase2Report.successRate.toFixed(1)}%).`);
  for (const t of phase2Report.results) {
    console.log(`  [${t.passed ? "PASS" : "FAIL"}] Teste #${t.id}: ${t.name} (${t.durationMs}ms) ${t.error ? `Erro: ${t.error}` : ""}`);
  }

  console.log("\n==================================================");
  console.log("📊 RESUMO FINAL DE CONFORMIDADE");
  console.log("==================================================");
  console.log(`Fase 1: ${phase1Report.passedCount}/${phase1Report.totalTests} Aprovados`);
  console.log(`Fase 2: ${phase2Report.passed}/${phase2Report.total} Aprovados`);
  console.log(`Total Consolidado: ${phase1Report.passedCount + phase2Report.passed}/${phase1Report.totalTests + phase2Report.total} Aprovados`);

  if (!phase1Report.allPassed || phase2Report.failed > 0) {
    console.error("\n❌ ERRO: Existem testes falhados.");
    process.exit(1);
  } else {
    console.log("\n✅ TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Erro fatal durante a execução dos testes:", err);
  process.exit(1);
});
