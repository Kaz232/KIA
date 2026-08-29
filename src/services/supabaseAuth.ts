import { createClient, SupabaseClient, User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User, UserRole, AuthSession } from "../types";
import { dbClient } from "../persistence/supabaseClient";

let supabaseInstance: SupabaseClient | null = null;
const metaEnv = (import.meta as any).env || {};
let currentConfig = {
  url: (metaEnv.VITE_SUPABASE_URL as string) || (typeof localStorage !== "undefined" ? localStorage.getItem("gag_supabase_url") || "" : ""),
  anonKey: (metaEnv.VITE_SUPABASE_ANON_KEY as string) || (typeof localStorage !== "undefined" ? localStorage.getItem("gag_supabase_anon_key") || "" : ""),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    currentConfig.url &&
    currentConfig.anonKey &&
    currentConfig.url.startsWith("http") &&
    currentConfig.anonKey.length > 10
  );
}

export function getSupabaseConfig() {
  return {
    url: currentConfig.url,
    anonKey: currentConfig.anonKey,
    isConfigured: isSupabaseConfigured(),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): { success: boolean; error?: string } {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl && !cleanKey) {
    localStorage.removeItem("gag_supabase_url");
    localStorage.removeItem("gag_supabase_anon_key");
    currentConfig = { url: "", anonKey: "" };
    supabaseInstance = null;
    return { success: true };
  }

  if (!cleanUrl.startsWith("http")) {
    return { success: false, error: "O URL do Supabase deve começar por https:// ou http://" };
  }

  if (cleanKey.length < 15) {
    return { success: false, error: "A chave anónima (anon key) do Supabase é inválida." };
  }

  currentConfig = { url: cleanUrl, anonKey: cleanKey };
  localStorage.setItem("gag_supabase_url", cleanUrl);
  localStorage.setItem("gag_supabase_anon_key", cleanKey);
  
  // Reset singleton so next call re-instantiates with new creds
  supabaseInstance = null;
  try {
    dbClient.reloadConfig();
  } catch {}
  return { success: true };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(currentConfig.url, currentConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      });
    } catch (err) {
      console.error("Erro ao inicializar cliente Supabase:", err);
      return null;
    }
  }

  return supabaseInstance;
}

export function mapSupabaseUserToGagUser(sbUser: SupabaseUser): User {
  const meta = sbUser.user_metadata || {};
  const email = sbUser.email || "operador@gagvisual.com";
  const name = meta.name || meta.full_name || email.split("@")[0] || "Operador GAG";
  
  let role: UserRole = "ADMIN";
  if (meta.role && ["OWNER", "ADMIN", "AGENT", "VIEWER"].includes(meta.role)) {
    role = meta.role as UserRole;
  } else if (email.toLowerCase().includes("josemar") || email.toLowerCase().includes("owner") || email.toLowerCase().includes("gourgel")) {
    role = "OWNER";
  }

  return {
    id: sbUser.id,
    name,
    email,
    role,
    avatarUrl: meta.avatar_url || undefined,
  };
}

export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = "ADMIN"
): Promise<{ user: User | null; session: Session | null; error: string | null; requiresEmailConfirmation?: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      session: null,
      error: "O Supabase Auth não está configurado. Por favor, forneça as credenciais nas Configurações.",
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: fullName.trim(),
          full_name: fullName.trim(),
          role,
          created_in_gag_core: true,
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, session: null, error: "Falha ao registar o utilizador no Supabase." };
    }

    const mappedUser = mapSupabaseUserToGagUser(data.user);
    const requiresEmailConfirmation = !data.session;

    return {
      user: mappedUser,
      session: data.session,
      error: null,
      requiresEmailConfirmation,
    };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || "Erro inesperado durante o registo." };
  }
}

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      session: null,
      error: "O Supabase Auth não está configurado. Por favor, insira o URL e Anon Key nas Configurações ou utilize o Modo Convidado.",
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, session: null, error: "Não foi possível carregar a sessão do utilizador." };
    }

    return {
      user: mapSupabaseUserToGagUser(data.user),
      session: data.session,
      error: null,
    };
  } catch (err: any) {
    return { user: null, session: null, error: err.message || "Erro inesperado ao iniciar sessão." };
  }
}

export async function supabaseSignOut(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: null };
  }

  try {
    const { error } = await client.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Erro ao terminar sessão." };
  }
}

export async function supabaseResetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "O Supabase Auth não está configurado.",
    };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao solicitar recuperação de senha." };
  }
}

export async function supabaseGetInitialSession(): Promise<{ user: User | null; session: Session | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, session: null };
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.user) {
      return { user: null, session: null };
    }

    return {
      user: mapSupabaseUserToGagUser(data.session.user),
      session: data.session,
    };
  } catch (err) {
    console.warn("Erro ao obter sessão inicial do Supabase:", err);
    return { user: null, session: null };
  }
}
