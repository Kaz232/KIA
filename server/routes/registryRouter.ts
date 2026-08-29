import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente oficial do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export const registryRouter = Router();

// 1. LEITURA EFETIVA: Consulta dados reais da tabela 'registry'
registryRouter.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("registry")
      .select("*");

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. ESCRITA EFETIVA: Insere dados reais na tabela 'registry'
registryRouter.post("/", async (req, res) => {
  try {
    const payload = req.body;

    const { data, error } = await supabase
      .from("registry")
      .insert([payload])
      .select();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});
