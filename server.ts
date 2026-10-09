import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from "vite";
import { serverApiRouter } from "./server/index";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // API Routes & CORS
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: "25mb" }));
  app.use("/api", serverApiRouter);

  // Live Audio WebSocket
  const wss = new WebSocketServer({ server, path: '/live' });
  wss.on('connection', (ws) => {
    console.log('[KIA Live API] Cliente ligado à transmissão de voz.');

    ws.on('message', (data: Buffer) => {
      // Processamento do fluxo de áudio PCM vindo do frontend
      // Reenviar para o motor neural usando o modelo estável
      // Modelo alternativo leve para evitar estourar limites: gemini-3.6-flash / gemini-3.1-flash-lite
    });

    ws.on('close', () => {
      console.log('[KIA Live API] Conexão de voz encerrada.');
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
