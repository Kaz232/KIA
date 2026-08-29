// Validação de variáveis de ambiente com suporte a modo de contingência

const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

export function validateEnv(): boolean {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.warn(
      `[CONFIG] Variáveis de ambiente Supabase não configuradas no momento: ${missingVars.join(", ")}. O sistema operará com fallbacks locais.`
    );
    if (process.env.NODE_ENV === "production" && process.env.STRICT_ENV_CHECK === "true") {
      throw new Error(
        `[CRÍTICO] Inicialização abortada em produção estrita. Variáveis em falta: ${missingVars.join(", ")}`
      );
    }
    return false;
  }
  return true;
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  PORT: process.env.PORT || 3000,
};
