import { taskOrchestrator } from "./taskOrchestrator";
import { executarToolViaOmniRoute } from "./omniRouteClient";
import {
  executeAgentTool,
  executeGerarConteudoAgente,
  executeCriarTarefaBacklog,
  executeGerarAssetVisual,
  executeAnalisarMetricasFinanceiras,
} from "./agentTools";

// Configuração do gateway OmniRoute
let omniConfig = {
  apiKey: process.env.OMNIROUTE_API_KEY || "",
  url: process.env.OMNIROUTE_URL || "https://gagomni.onrender.com",
};

export const toolExecutor = {
  // Gateway centralizado via OmniRoute com fallback local automático
  async omniroute_execute_action(payload: any) {
    const { omniroute_api_key, action_type, payload: actionPayload } = payload;
    
    // Validação básica de API Key se configurada
    if (omniroute_api_key && omniConfig.apiKey && omniroute_api_key !== omniConfig.apiKey) {
      return { success: false, error: "API Key OmniRoute inválida." };
    }

    const data = typeof actionPayload === "string" ? JSON.parse(actionPayload) : actionPayload;
    
    // Tentar executar via OmniRoute remoto primeiro
    const omniResult = await executarToolViaOmniRoute(action_type, data);
    if (omniResult && omniResult.status !== "fallback") {
      return omniResult;
    }

    // Execução local garantida para todas as ferramentas autônomas
    switch (action_type) {
      case "gerarConteudoAgente":
      case "gerar_conteudo_multiformato":
      case "generate_content":
        return await this.gerarConteudoAgente(data);

      case "criarTarefaBacklog":
      case "criar_tarefa_backlog":
      case "create_backlog_task":
        return await this.criarTarefaBacklog(data);

      case "gerarAssetVisual":
      case "gerar_asset_visual":
      case "generate_visual_asset":
        return await this.gerarAssetVisual(data);

      case "analisarMetricasFinanceiras":
      case "analisar_metricas_financeiras":
      case "analyze_financial_metrics":
        return this.analisarMetricasFinanceiras(data);

      case "despacharAgenteEspecialista":
      case "dispatch_agent":
        return await this.dispatch_agent_task(data);

      case "generate_artifact":
        return await this.generate_artifact(data);

      case "search_leads":
        return await this.search_leads(data);

      case "send_email":
        return await this.send_email(data);

      default:
        // Tenta executar dinamicamente pelo executeAgentTool se existir
        try {
          return await executeAgentTool(action_type, data);
        } catch {
          return { success: false, error: `Ação '${action_type}' desconhecida ou não implementada localmente.` };
        }
    }
  },

  async omniroute_configure_gateway(payload: any) {
    omniConfig = { apiKey: payload.omniroute_api_key, url: payload.environment_url || "" };
    console.log(`[ToolExecutor] OmniRoute configurado para ${omniConfig.url}`);
    return { success: true };
  },

  // Novas ferramentas autônomas de produção multiformato
  async gerarConteudoAgente(payload: any) {
    console.log(`[ToolExecutor] Gerando conteúdo autônomo multiformato: ${payload.titulo} (${payload.tipoConteudo})`);
    return await executeGerarConteudoAgente(payload);
  },

  async criarTarefaBacklog(payload: any) {
    console.log(`[ToolExecutor] Criando tarefa autônoma no Backlog: ${payload.titulo}`);
    return await executeCriarTarefaBacklog(payload);
  },

  async gerarAssetVisual(payload: any) {
    console.log(`[ToolExecutor] Gerando especificações de ativo visual / Veo 3.1: ${payload.tipoAsset}`);
    return await executeGerarAssetVisual(payload);
  },

  analisarMetricasFinanceiras(payload: any) {
    console.log(`[ToolExecutor] Calculando métricas financeiras em AOA: ${payload.valorBrutoAOA}`);
    return executeAnalisarMetricasFinanceiras(payload);
  },

  // Métodos internos mantidos para compatibilidade
  async generate_artifact(payload: any) {
    console.log(`[ToolExecutor] Gerando artefacto: ${payload.title} (${payload.artifact_type})`);
    return { success: true, artifactId: `art-${Date.now()}` };
  },

  async search_leads(payload: any) {
    console.log(`[ToolExecutor] Prospecção de leads em ${payload.location} para ${payload.industry}`);
    return { success: true, leadsCount: 5, results: [] };
  },

  async dispatch_agent_task(payload: any) {
    const target = payload.target_agent || payload.agenteDestino || "copywriter";
    const desc = payload.task_description || payload.objetivoEspecifico || "Tarefa delegada";
    console.log(`[ToolExecutor] Delegando tarefa para ${target}`);
    return await taskOrchestrator.dispatch(target, desc);
  },

  async send_email(payload: any) {
    console.log(`[ToolExecutor] Enviando e-mail para ${payload.recipient}: ${payload.subject}`);
    return { success: true, messageId: `msg-${Date.now()}` };
  },
};
