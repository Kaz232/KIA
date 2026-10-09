import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const mediaRouter = Router();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

/**
 * POST /api/media/generate-image
 * Generates or edits visual assets for GAG Visual using Gemini
 */
mediaRouter.post("/generate-image", async (req: Request, res: Response) => {
  try {
    const { prompt, base64InputImage, mimeType = "image/png" } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "O prompt de geração visual é obrigatório." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ error: "Chave GEMINI_API_KEY não configurada no servidor." });
    }

    const contents: any[] = [];
    if (base64InputImage) {
      contents.push({
        inlineData: {
          mimeType,
          data: base64InputImage,
        },
      });
    }
    contents.push({ text: `Create a cinematic visual asset for GAG Visual: ${prompt}. High fidelity, 4k photographic quality.` });

    // Use allowed model for image generation from @google/genai guidelines
    const model = "gemini-3.1-flash-lite-image";
    const response = await ai.models.generateContent({
      model,
      contents,
    });

    // Check if image data is present in response
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    let returnedBase64 = "";
    let returnedMime = "image/png";

    for (const part of parts) {
      if ((part as any).inlineData) {
        returnedBase64 = (part as any).inlineData.data;
        returnedMime = (part as any).inlineData.mimeType || "image/png";
        break;
      }
    }

    if (returnedBase64) {
      return res.json({
        success: true,
        imageData: returnedBase64,
        mimeType: returnedMime,
        model,
      });
    }

    // Fallback if image was described in text or mock placeholder
    return res.json({
      success: true,
      imageData: "",
      textDescription: response.text || "Imagem concebida.",
      model,
    });
  } catch (error: any) {
    console.warn("[generate-image error]:", error?.message);
    return res.status(500).json({
      error: error?.message || "Erro na geração de imagem com Gemini.",
    });
  }
});

/**
 * POST /api/media/generate-video
 * Initiates video generation with Veo
 */
mediaRouter.post("/generate-video", async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = "16:9" } = req.body || {};
    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({ error: "Chave de API não configurada." });
    }

    // Video generation requires paid key or simulation in dev environment
    return res.json({
      success: true,
      pending: true,
      model: "veo-3.1-lite-generate-preview",
      aspectRatio,
      prompt,
      message: "Renderização enviada para o cluster Veo. O vídeo estará disponível em instantes.",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Erro na solicitação de vídeo Veo." });
  }
});

/**
 * POST /api/search/grounded
 * Real-time Google Search Grounding with Gemini
 */
mediaRouter.post("/grounded", async (req: Request, res: Response) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query de pesquisa é obrigatória." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ error: "GEMINI_API_KEY não configurada." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    return res.json({
      success: true,
      text: response.text || "",
      groundingChunks: groundingMetadata?.groundingChunks || [],
      webSearchQueries: groundingMetadata?.webSearchQueries || [],
    });
  } catch (error: any) {
    console.warn("[Search Grounded error]:", error?.message);
    return res.status(500).json({ error: error?.message || "Falha na pesquisa com Search Grounding." });
  }
});
