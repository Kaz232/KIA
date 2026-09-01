/**
 * GAG CORE OS — SERVER ENTRY & ROUTER INDEX
 * Centralized export for all Express API routes, middlewares, and server extensions.
 */
import express, { Router, Express } from "express";
import { n8nRouter } from "./routes/n8nRouter";
import { makeRouter } from "./routes/makeRouter";
import { browserRouter } from "./routes/browserRouter";
import { engineRouter } from "./routes/engineRouter";
import { registryRouter } from "./routes/registryRouter";
import { requireAuth } from "./middleware/auth";
import { validateEnv } from "./config/env";

// 1. Validar variáveis de ambiente no carregamento das rotas
validateEnv();

export const serverApiRouter = Router();

// 2. Proteger e consolidar os routers dos ecossistemas com o middleware de autenticação
serverApiRouter.use("/make", makeRouter);
serverApiRouter.use("/browser", browserRouter);
serverApiRouter.use("/n8n", requireAuth, n8nRouter);
serverApiRouter.use("/engine", requireAuth, engineRouter);
serverApiRouter.use("/registry", requireAuth, registryRouter);

// 3. Aplicação Express utilitária para testes de integração e sub-serviços
export const app: Express = express();
app.use(express.json());
app.use("/api", serverApiRouter);

export { n8nRouter, makeRouter, browserRouter, engineRouter, registryRouter };
export default serverApiRouter;
