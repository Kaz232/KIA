import { agentBrain } from '../src/core/AgentBrain';

async function runTests() {
  console.log("--- Iniciando Testes do AgentBrain ---");
  
  // Teste de sucesso (kia-master ou comercial-agt)
  try {
    console.log("Teste 1: Dispatch de PROPOSAL_AOA para comercial-agt...");
    const res = await agentBrain.dispatchTaskToAgent('comercial-agt', 'PROPOSAL_AOA', {
      clientName: 'Cliente Teste Luanda',
      totalAmountAOA: 2500000
    });
    console.log("Sucesso:", res);
  } catch (err) {
    console.error("Erro no Teste 1:", err);
  }

  // Teste de rejeição de permissão (ex: scanner-doc a tentar gerar vídeo)
  try {
    console.log("Teste 2: Dispatch de VEO_VIDEO para scanner-doc (deve falhar)...");
    await agentBrain.dispatchTaskToAgent('scanner-doc', 'VEO_VIDEO', {});
  } catch (err: any) {
    console.log('Bloqueio confirmado:', err.message);
  }
  
  console.log("--- Fim dos Testes ---");
}

runTests();
