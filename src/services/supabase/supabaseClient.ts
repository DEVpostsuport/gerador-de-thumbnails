import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Retrieve config from env or user settings stored in localStorage
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) || "";
  let anonKey = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || "";

  // Check localStorage for custom user configured keys in Settings
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("cf_supabase_url");
    const customKey = localStorage.getItem("cf_supabase_anon_key");
    if (customUrl) url = customUrl;
    if (customKey) anonKey = customKey;
  }

  const isConfigured = Boolean(url && anonKey && url.startsWith("http"));
  return { url, anonKey, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn("[Supabase] Falha ao instanciar cliente:", err);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: "Credenciais do Supabase não configuradas. Use as Configurações para conectar sua URL e Anon Key.",
    };
  }

  try {
    const { data, error } = await client.from("profiles").select("count").limit(1);
    if (error) {
      // If table does not exist, let user know schema needs to be executed
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return {
          success: false,
          message: "Conectado ao Supabase, mas as tabelas ainda não foram criadas. Copie e execute o Schema SQL no Supabase SQL Editor.",
        };
      }
      return { success: false, message: `Erro Supabase: ${error.message}` };
    }
    return { success: true, message: "Conexão com PostgreSQL / Supabase ativa e respondendo com sucesso!" };
  } catch (err: any) {
    return { success: false, message: `Falha de rede ao conectar: ${err?.message || "Erro desconhecido"}` };
  }
}
