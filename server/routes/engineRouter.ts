import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export const engineRouter = Router();

// 1. Iniciar e Registar Execução na Base de Dados
engineRouter.post("/execute", async (req, res) => {
  try {
    const { payload } = req.body;
    const userId = (req as any).user?.id;

    // Regista o arranque da execução na tabela 'executions'
    const { data, error } = await supabase
      .from("executions")
      .insert([
        {
          user_id: userId,
          status: "running",
          payload: payload || {},
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;

    return res.status(202).json({
      message: "Execução iniciada e registada com sucesso",
      execution: data[0],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Consultar Estado Real da Execução
engineRouter.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(404).json({ error: "Execução não encontrada ou erro de consulta" });
  }
});
