import { createClient, SupabaseClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = (metaEnv.VITE_SUPABASE_URL as string) || (typeof localStorage !== "undefined" ? localStorage.getItem("gag_supabase_url") || "" : "");
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || (typeof localStorage !== "undefined" ? localStorage.getItem("gag_supabase_anon_key") || "" : "");

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 10
);

let supabaseClientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error("Erro ao inicializar o cliente Supabase em src/lib/supabase.ts:", error);
  }
}

export const supabase = supabaseClientInstance;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const currentMeta = (import.meta as any).env || {};
  const currentUrl = (currentMeta.VITE_SUPABASE_URL as string) || (typeof localStorage !== "undefined" ? localStorage.getItem("gag_supabase_url") || "" : "");
  const currentKey = (currentMeta.VITE_SUPABASE_ANON_KEY as string) || (typeof localStorage !== "undefined" ? localStorage.getItem("gag_supabase_anon_key") || "" : "");

  if (currentUrl && currentKey && currentUrl.startsWith("http") && currentKey.length > 10) {
    try {
      supabaseClientInstance = createClient(currentUrl, currentKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseClientInstance;
    } catch (err) {
      console.error("Falha ao inicializar o Supabase sob demanda:", err);
      return null;
    }
  }

  return null;
}

export default supabase;
