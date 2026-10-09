import { Router, Request, Response } from "express";
import axios from "axios";
import { executarToolViaOmniRoute } from "../engine/omniRouteClient";
import { toolExecutor } from "../engine/toolExecutor";

export const omniRouter = Router();

/**
 * POST /api/omniroute/execute-tool
 * Rota oficial para despachar Tools através do gateway do OmniRoute em https://gagomni.onrender.com
 */
omniRouter.post("/execute-tool", async (req: Request, res: Response) => {
  try {
    const { tool, toolType, parameters, payload } = req.body || {};
    const toolName = tool || toolType;
    const toolParams = parameters || payload || {};

    if (!toolName) {
      return res.status(400).json({ error: "Parâmetro 'tool' ou 'toolType' é obrigatório." });
    }

    console.log(`[OmniRoute Gateway] Despachando ferramenta '${toolName}' para https://gagomni.onrender.com...`);
    const omniResult = await executarToolViaOmniRoute(toolName, toolParams);

    // Se o OmniRoute responder com sucesso (não for o fallback de contingência)
    if (omniResult && omniResult.status !== "fallback") {
      return res.json({
        ...omniResult,
        gateway: "omniroute_cloud",
        timestamp: new Date().toISOString(),
      });
    }

    // Se houve fallback ou erro de conexão, executar localmente como contingência se existir a ferramenta
    if (typeof toolExecutor[toolName as keyof typeof toolExecutor] === "function") {
      const localResult = await toolExecutor[toolName as keyof typeof toolExecutor](toolParams);
      return res.json({
        ...localResult,
        gateway: "local_contingency",
        omniFallback: omniResult,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json(omniResult);
  } catch (error: any) {
    console.error("[OmniRoute Gateway Error]:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/omniroute/health
 * Verifica a latência e o status do backend OmniRoute no Render
 */
omniRouter.get("/health", async (_req: Request, res: Response) => {
  const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://gagomni.onrender.com";
  const start = Date.now();
  try {
    const response = await axios.get(`${OMNIROUTE_URL}/api/omniroute/health`, { timeout: 5000 });
    const latency = Date.now() - start;
    return res.json({
      status: "ONLINE",
      url: OMNIROUTE_URL,
      latencyMs: latency,
      remoteData: response.data,
    });
  } catch (error: any) {
    return res.json({
      status: "HIBERNATING_OR_OFFLINE",
      url: OMNIROUTE_URL,
      latencyMs: Date.now() - start,
      message: "Gateway OmniRoute em hibernação ou temporariamente indisponível. Contingência local ativa.",
      error: error.message,
    });
  }
});
