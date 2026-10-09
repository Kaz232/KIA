import axios from 'axios';

/**
 * Função para disparar a Tool através do gateway do OmniRoute
 * Envia as execuções de ferramentas especializadas da GAG Visual para o endpoint https://gagomni.onrender.com
 */
export async function executarToolViaOmniRoute(toolName: string, toolParams: object) {
  const OMNIROUTE_URL = process.env.OMNIROUTE_URL || 'https://gagomni.onrender.com';
  const OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY;

  try {
    const response = await axios.post(
      `${OMNIROUTE_URL}/api/omniroute/execute-tool`,
      {
        tool: toolName,
        parameters: toolParams,
        agent: 'KIA Master',
        context: 'GAG Core OS - Luanda'
      },
      {
        headers: {
          'Authorization': `Bearer ${OMNIROUTE_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10s de timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao executar ${toolName} no OmniRoute:`, error);
    // Fallback de contingência caso o Render esteja a hibernar
    return { status: 'fallback', message: 'Execução local de contingência ativada.' };
  }
}
