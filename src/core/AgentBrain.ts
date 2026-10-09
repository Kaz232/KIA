
/**
 * AgentBrain.ts - Módulo de Tomada de Decisão Estratégica (GAG Core)
 * 
 * Este módulo atua como o middleware lógico da KIA, analisando a intenção do utilizador
 * e delegando tarefas aos agentes especializados.
 */

import { AGENTS_LIST } from "../utils/agentsCsvExport";

// Definição das Permissões e Ferramentas associadas a cada Agente
export interface AgentPermission {
  agentId: string;
  allowedTools: Array<'IMAGE_GEN' | 'VEO_VIDEO' | 'PROPOSAL_AOA' | 'BRAND_KIT' | 'OCR_SCAN' | 'WHATSAPP_DISPATCH'>;
  canExecuteAutonomously: boolean;
  maxBudgetAOA?: number;
}

// Tabela de Permissões mapeada para a lista existente de 13 agentes
export const AGENT_PERMISSIONS: Record<string, AgentPermission> = {
  'avatar-gen': {
    agentId: 'avatar-gen',
    allowedTools: ['IMAGE_GEN', 'BRAND_KIT'],
    canExecuteAutonomously: true,
  },
  'dir-art-motion': {
    agentId: 'dir-art-motion',
    allowedTools: ['VEO_VIDEO', 'IMAGE_GEN'],
    canExecuteAutonomously: true,
  },
  'comercial-agt': {
    agentId: 'comercial-agt',
    allowedTools: ['PROPOSAL_AOA', 'WHATSAPP_DISPATCH'],
    canExecuteAutonomously: true,
    maxBudgetAOA: 5000000,
  },
  'brand-kits': {
    agentId: 'brand-kits',
    allowedTools: ['BRAND_KIT', 'IMAGE_GEN'],
    canExecuteAutonomously: true,
  },
  'scanner-doc': {
    agentId: 'scanner-doc',
    allowedTools: ['OCR_SCAN'],
    canExecuteAutonomously: true,
  },
  'kia-master': {
    agentId: 'kia-master',
    allowedTools: ['IMAGE_GEN', 'VEO_VIDEO', 'PROPOSAL_AOA', 'BRAND_KIT', 'OCR_SCAN', 'WHATSAPP_DISPATCH'],
    canExecuteAutonomously: true,
  },
};

/**
 * Atribuição e Validação de Funções nos Agentes Existentes
 */
export class AgentBrain {
  /**
   * Valida se o agente tem permissão para a ferramenta solicitada e executa a ação com retry
   */
  public async dispatchTaskToAgent(
    agentId: string, 
    toolType: AgentPermission['allowedTools'][number], 
    payload: any,
    retries = 3
  ): Promise<any> {
    const agent = AGENTS_LIST.find((a) => a.id === agentId);
    if (!agent) throw new Error(`Agente '${agentId}' não encontrado na lista oficial.`);

    const permission = AGENT_PERMISSIONS[agentId];
    if (!permission || !permission.allowedTools.includes(toolType)) {
      throw new Error(`Permissão negada: O agente '${agent.name}' não tem autorização para executar '${toolType}'.`);
    }

    try {
      // Execução da função atribuída usando a API existente
      return await this.executeAssignedTool(toolType, payload);
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`[RecoveryOrchestrator] Falha ao despachar para ${agentId}. Retentativas restantes: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Backoff exponencial simples
        return this.dispatchTaskToAgent(agentId, toolType, payload, retries - 1);
      } else {
        console.error(`[RecoveryOrchestrator] Falha crítica do agente ${agentId} após esgotar retentativas. Alertando KIA Master.`);
        await this.notifyKiaMaster(agentId, toolType, error.message);
        throw error;
      }
    }
  }

  private async notifyKiaMaster(agentId: string, toolType: string, error: string) {
    // Alerta o KIA Master (simulação de endpoint de sistema)
    await fetch(`/api/engine/alert-kia-master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, toolType, error, timestamp: new Date().toISOString() }),
    });
  }

  private async executeAssignedTool(toolType: string, payload: any) {
    const response = await fetch(`/api/engine/execute-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolType, payload }),
    });

    if (!response.ok) {
      throw new Error(`Falha na execução da ferramenta ${toolType} via engineRouter.`);
    }

    return await response.json();
  }
}

export const agentBrain = new AgentBrain();
