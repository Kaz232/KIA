import { Router } from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminFirestore() {
  if (getApps().length === 0) {
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "snappy-year-79v0l",
      });
    } catch (e) {
      console.warn("[Firebase Admin] searchRouter init warning:", e);
    }
  }
  return getFirestore();
}

export const searchRouter = Router();

// Endpoint para pesquisa semântica/relevância de conhecimento
searchRouter.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    const db = getAdminFirestore();
    
    // Simplificado para busca baseada em Firestore (implementação de RAG)
    const snapshot = await db.collection('knowledge_base')
      .orderBy('lastUpdated', 'desc')
      .limit(10)
      .get();
      
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Nota: Aqui o KIA usaria o Gemini para ranquear a relevância 
    // dos documentos em relação à 'query' antes de retornar.
    
    res.json({ results: docs });
  } catch (err) {
    res.status(500).json({ error: "Falha na busca semântica" });
  }
});

// Endpoint para Google Search Grounding em tempo real
searchRouter.post("/grounded", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Query de pesquisa é obrigatória." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY não configurada." });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
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
    return res.status(500).json({ error: error?.message || "Erro no Google Search Grounding." });
  }
});

