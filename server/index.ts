/**
 * GAG CORE OS — SERVER ENTRY & ROUTER INDEX
 * Centralized export for all Express API routes, middlewares, and server extensions.
 */
import express, { Router, Express } from "express";
import { kiaRouter } from "./routes/kiaRouter";
import { n8nRouter } from "./routes/n8nRouter";
import { makeRouter } from "./routes/makeRouter";
import { browserRouter } from "./routes/browserRouter";
import { engineRouter } from "./routes/engineRouter";
import { registryRouter } from "./routes/registryRouter";
import { searchRouter } from "./routes/searchRouter";
import { omniRouter } from "./routes/omniRouter";
import { mediaRouter } from "./routes/mediaRouter";
import { requireAuth, optionalAuth } from "./middleware/auth";
import { validateEnv } from "./config/env";
import { agentBackgroundWorker } from "./services/agentWorker";

// 1. Validar variáveis de ambiente no carregamento das rotas
validateEnv();
agentBackgroundWorker.start();

export const serverApiRouter = Router();

// Health check endpoint
serverApiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "gag-visual-core-os",
    timestamp: new Date().toISOString(),
  });
});

// 2. Proteger e consolidar os routers dos ecossistemas com o middleware de autenticação
serverApiRouter.use("/make", makeRouter);
serverApiRouter.use("/browser", browserRouter);
serverApiRouter.use("/n8n", requireAuth, n8nRouter);
serverApiRouter.use("/kia", optionalAuth, kiaRouter);
serverApiRouter.use("/engine", optionalAuth, engineRouter);
serverApiRouter.use("/registry", requireAuth, registryRouter);
serverApiRouter.use("/search", requireAuth, searchRouter);
serverApiRouter.use("/media", mediaRouter);
serverApiRouter.use("/omniroute", omniRouter);

// 3. Aplicação Express utilitária para testes de integração e sub-serviços
export const app: Express = express();
app.use(express.json());
app.use("/api", serverApiRouter);

export { n8nRouter, makeRouter, browserRouter, engineRouter, registryRouter, kiaRouter, omniRouter, mediaRouter };
export default serverApiRouter;
