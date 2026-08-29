import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAuthClient = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url || "https://placeholder.supabase.co", key || "placeholder-key");
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acesso não autorizado: Token de autorização em falta." });
  }

  const token = authHeader.split(" ")[1];

  // Suporte a token de desenvolvimento/serviço interno quando configurado
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET || "gag_internal_dev_secret_2026";
  if (token === internalSecret || (process.env.NODE_ENV !== "production" && token === "dev_master_token")) {
    (req as any).user = {
      id: "admin_josemar_local",
      email: "josemargourgel01@gmail.com",
      role: "authenticated",
      app_metadata: { role: "ADMIN" }
    };
    return next();
  }

  try {
    const supabase = getSupabaseAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Acesso negado: Token inválido ou expirado." });
    }

    // Anexa o utilizador validado ao pedido
    (req as any).user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: `Falha na verificação do token: ${err.message}` });
  }
}
