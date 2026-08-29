import { Router } from "express";
import { getPrivateArtifactUrl, uploadPrivateArtifact } from "../../src/lib/storage";

export const n8nRouter = Router();

// Health check para conectividade n8n
n8nRouter.get("/health", async (_req, res) => {
  const n8nUrl = process.env.N8N_BASE_URL || "https://n8n.gagvisual.com";
  res.json({
    status: "ok",
    n8nConnected: true,
    baseUrl: n8nUrl,
    timestamp: new Date().toISOString(),
  });
});

// 1. Guardar Artefato Privado gerado por um fluxo/engine
n8nRouter.post("/artifact/upload", async (req, res) => {
  try {
    const { filename, content, contentType } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: "Nome do ficheiro e conteúdo são obrigatórios." });
    }

    const fileBuffer = Buffer.from(content, "utf-8");
    const filePath = `exports/${Date.now()}_${filename}`;

    // Upload seguro para o Storage Privado
    await uploadPrivateArtifact(filePath, fileBuffer, contentType || "text/plain");

    // Gera URL assinada com expiração de 5 minutos
    const signedUrl = await getPrivateArtifactUrl(filePath, 300);

    return res.status(201).json({
      message: "Artefato guardado com sucesso",
      path: filePath,
      downloadUrl: signedUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
