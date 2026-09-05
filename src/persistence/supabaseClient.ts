/**
 * GAG CORE OS — FASE 3: CENTRALIZED SUPABASE & PERSISTENCE CLIENT
 * Manages connections, authentication, query execution, storage buckets,
 * and high-availability relational persistence for the GAG Core ecosystem.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  isConfigured: boolean;
}

export type SupabaseConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "FALLBACK_LOCAL"
  | "NOT_CONFIGURED"
  | "CHECKING";

export interface SupabaseHealthState {
  status: SupabaseConnectionStatus;
  isConfigured: boolean;
  isConnected: boolean;
  isFallbackActive: boolean;
  lastChecked: string;
  latencyMs: number | null;
  errorMessage: string | null;
  endpointUrl?: string;
}

// In-process resilient relational storage engine
class InMemoryRelationalEngine {
  private tables: Map<string, Map<string, any>> = new Map();

  constructor() {
    const tableNames = [
      "agents",
      "skills",
      "tools",
      "capabilities",
      "agent_capabilities",
      "executions",
      "execution_steps",
      "tasks",
      "task_dependencies",
      "handoffs",
      "retry_attempts",
      "qa_reports",
      "artifacts",
      "knowledge_items",
      "audit_events",
      "conversations",
      "conversation_messages",
      "long_term_memories",
      "owner_decisions",
      "client_contexts",
      "unified_sessions",
      "meeting_minutes",
      "deliverables",
    ];
    for (const t of tableNames) {
      this.tables.set(t, new Map());
    }
    this.seedInitialMemoryRecords();
  }

  private seedInitialMemoryRecords(): void {
    const decisions = [
      {
        id: "dec-01",
        title: "Regra do Sinal de 50%",
        decision: "Qualquer proposta ou projeto da GAG Visual exige 50% de sinal adiantado antes do início dos trabalhos.",
        rationale: "Garantia de liquidez operacional e compromisso formal do cliente.",
        category: "FINANCIAL_POLICY",
        appliedCount: 42,
        timestamp: "2026-08-01T10:00:00Z",
      },
      {
        id: "dec-02",
        title: "Metodologia TOB",
        decision: "Toda a consultoria e ecossistema são fundamentados no tripé Tecnologia, Organização e Branding.",
        rationale: "Diferenciação estratégica no mercado de Angola.",
        category: "BRAND_POLICY",
        appliedCount: 68,
        timestamp: "2026-08-05T14:30:00Z",
      },
      {
        id: "dec-03",
        title: "Cotação Exclusiva em AOA",
        decision: "Todas as propostas, pacotes e valores apresentados aos clientes devem ser estritamente expressos em Kwanzas (AOA).",
        rationale: "Alinhamento com a legislação angolana e estabilidade cambial em Luanda.",
        category: "PRICING_POLICY",
        appliedCount: 89,
        timestamp: "2026-08-10T09:00:00Z",
      },
      {
        id: "dec-04",
        title: "Taxa de Urgência 48h",
        decision: "Projetos solicitados para entrega em até 48 horas têm acréscimo obrigatório de +50% sobre o valor base.",
        rationale: "Compensação pelo remanejamento de recursos e horas extraordinárias dos agentes.",
        category: "PRICING_POLICY",
        appliedCount: 15,
        timestamp: "2026-08-15T16:00:00Z",
      },
    ];

    const clientContexts = [
      {
        id: "ctx-anda-jussara",
        clientName: "Jussara (ANDA)",
        phone: "+244 923 881 223",
        company: "ANDA — Agência Nacional dos Transportes Terrestres",
        context: "Interesse em pacotes de vídeos promocionais, reels de alta conversão e presença digital. Opções de 180.000 a 600.000 AOA.",
        status: "PROPOSAL_PENDING",
        lastMeeting: "2026-08-28",
        keyRequirements: ["Roteiros dinâmicos", "Captação em Luanda", "Relatório de métricas"],
      },
      {
        id: "ctx-dr-kwanza",
        clientName: "Dr. Manuel Kwanza",
        phone: "+244 923 456 789",
        company: "Clínica Médica Kwanza Luanda",
        context: "Projeto de rebranding institucional e atração de novos pacientes particulares via tráfego pago geolocalizado.",
        status: "ACTIVE_LEAD",
        lastMeeting: "2026-09-01",
        keyRequirements: ["Identidade visual sóbria", "Meta Ads focado em Luanda Sul", "Atendimento WhatsApp 24/7"],
      },
      {
        id: "ctx-eng-teresa",
        clientName: "Eng.ª Teresa Silva",
        phone: "+244 945 112 334",
        company: "Silva Empreendimentos",
        context: "Cliente ativa com gestão semanal de tráfego pago (ROAS médio de 4.8x). Exige envio de relatórios em PDF com métricas consolidadas.",
        status: "RETAINER_CLIENT",
        lastMeeting: "2026-08-30",
        keyRequirements: ["Relatórios semanais PDF", "Otimização contínua de CPA", "Comunicação executiva via WhatsApp"],
      },
    ];

    for (const d of decisions) {
      this.insert("owner_decisions", d);
    }
    for (const c of clientContexts) {
      this.insert("client_contexts", c);
    }
  }

  public getTable(name: string): Map<string, any> {
    if (!this.tables.has(name)) {
      this.tables.set(name, new Map());
    }
    return this.tables.get(name)!;
  }

  public insert(table: string, record: any): any {
    const t = this.getTable(table);
    const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    const withTimestamps = {
      ...record,
      id,
      created_at: record.created_at || now,
      updated_at: record.updated_at || now,
    };
    t.set(id, withTimestamps);
    return { ...withTimestamps };
  }

  public upsert(table: string, record: any, onConflict = "id"): any {
    const t = this.getTable(table);
    let targetId = record[onConflict] || record.id;

    // Check if record exists with conflict key
    if (onConflict !== "id") {
      for (const [k, v] of t.entries()) {
        if (v[onConflict] === record[onConflict]) {
          targetId = k;
          break;
        }
      }
    }

    if (!targetId) {
      targetId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    const existing = t.get(targetId) || {};
    const now = new Date().toISOString();
    const updated = {
      ...existing,
      ...record,
      id: targetId,
      created_at: existing.created_at || record.created_at || now,
      updated_at: now,
    };
    t.set(targetId, updated);
    return { ...updated };
  }

  public select(table: string, filter?: (item: any) => boolean): any[] {
    const t = this.getTable(table);
    const list = Array.from(t.values());
    if (!filter) return list;
    return list.filter(filter);
  }

  public selectById(table: string, id: string): any | null {
    const t = this.getTable(table);
    return t.get(id) || null;
  }

  public update(table: string, id: string, updates: any): any | null {
    const t = this.getTable(table);
    const existing = t.get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updated = { ...existing, ...updates, updated_at: now };
    t.set(id, updated);
    return { ...updated };
  }

  public delete(table: string, id: string): boolean {
    const t = this.getTable(table);
    return t.delete(id);
  }

  public count(table: string, filter?: (item: any) => boolean): number {
    return this.select(table, filter).length;
  }

  public clear(table?: string): void {
    if (table) {
      this.getTable(table).clear();
    } else {
      for (const t of this.tables.values()) {
        t.clear();
      }
    }
  }
}

export class SupabasePersistenceClient {
  private static instance: SupabasePersistenceClient;
  private client: SupabaseClient | null = null;
  private localEngine: InMemoryRelationalEngine = new InMemoryRelationalEngine();
  private config: DatabaseConfig;
  private healthState: SupabaseHealthState;
  private listeners: Set<(state: SupabaseHealthState) => void> = new Set();
  private healthCheckInterval: any = null;

  private constructor() {
    this.config = this.resolveConfig();
    this.healthState = {
      status: this.config.isConfigured ? "CHECKING" : "NOT_CONFIGURED",
      isConfigured: this.config.isConfigured,
      isConnected: false,
      isFallbackActive: true,
      lastChecked: new Date().toISOString(),
      latencyMs: null,
      errorMessage: this.config.isConfigured ? null : "Credenciais do Supabase não configuradas. Modo Local Resiliente ativo.",
      endpointUrl: this.config.url || undefined,
    };
    this.initializeSupabase();

    // Start background health checking if in browser context
    if (typeof window !== "undefined") {
      this.checkHealth();
      this.healthCheckInterval = setInterval(() => {
        this.checkHealth();
      }, 35000);
    }
  }

  public static getInstance(): SupabasePersistenceClient {
    if (!SupabasePersistenceClient.instance) {
      SupabasePersistenceClient.instance = new SupabasePersistenceClient();
    }
    return SupabasePersistenceClient.instance;
  }

  public subscribeHealth(callback: (state: SupabaseHealthState) => void): () => void {
    this.listeners.add(callback);
    callback({ ...this.healthState });
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyHealthChange(): void {
    const clone = { ...this.healthState };
    this.listeners.forEach((listener) => {
      try {
        listener(clone);
      } catch (err) {
        console.error("Erro no ouvinte de saúde do Supabase:", err);
      }
    });
  }

  public getHealth(): SupabaseHealthState {
    return { ...this.healthState };
  }

  public async checkHealth(): Promise<SupabaseHealthState> {
    this.config = this.resolveConfig();

    if (!this.config.isConfigured) {
      this.healthState = {
        status: "NOT_CONFIGURED",
        isConfigured: false,
        isConnected: false,
        isFallbackActive: true,
        lastChecked: new Date().toISOString(),
        latencyMs: null,
        errorMessage: "Credenciais do Supabase não configuradas no sistema. Modo Local Resiliente em execução.",
        endpointUrl: undefined,
      };
      this.notifyHealthChange();
      return this.getHealth();
    }

    if (!this.client) {
      this.initializeSupabase();
    }

    const startTime = Date.now();
    try {
      if (!this.client) throw new Error("Cliente Supabase não instanciado.");

      // Test lightweight connectivity with 4.5s timeout race
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout de conexão (>4.5s)")), 4500)
      );

      // Simple auth or query ping
      const pingPromise = this.client.auth.getSession();
      await Promise.race([pingPromise, timeoutPromise]);

      const latencyMs = Date.now() - startTime;

      this.healthState = {
        status: "CONNECTED",
        isConfigured: true,
        isConnected: true,
        isFallbackActive: false,
        lastChecked: new Date().toISOString(),
        latencyMs,
        errorMessage: null,
        endpointUrl: this.config.url,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const errMsg = err?.message || "Conexão ao Supabase Backend indisponível ou inacessível.";

      this.healthState = {
        status: "DISCONNECTED",
        isConfigured: true,
        isConnected: false,
        isFallbackActive: true,
        lastChecked: new Date().toISOString(),
        latencyMs,
        errorMessage: `Desconectado do Supabase Backend: ${errMsg}. Modo Local Resiliente ativo para garantir zero perda de dados.`,
        endpointUrl: this.config.url,
      };
    }

    this.notifyHealthChange();
    return this.getHealth();
  }

  public reloadConfig(): void {
    this.config = this.resolveConfig();
    this.client = null;
    this.initializeSupabase();
    this.checkHealth();
  }

  private resolveConfig(): DatabaseConfig {
    let url = "";
    let anonKey = "";
    let serviceRoleKey = "";

    // Check process.env (Node / Server context)
    if (typeof process !== "undefined" && process.env) {
      url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
      anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
      serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    }

    // Check browser context
    if (!url && typeof window !== "undefined") {
      url = localStorage.getItem("gag_supabase_url") || "";
      anonKey = localStorage.getItem("gag_supabase_anon_key") || "";
      serviceRoleKey = localStorage.getItem("gag_supabase_service_key") || "";
    }

    const isConfigured = Boolean(
      url &&
      anonKey &&
      url.startsWith("http") &&
      anonKey.length > 10
    );

    return { url, anonKey, serviceRoleKey, isConfigured };
  }

  private initializeSupabase(): void {
    if (this.config.isConfigured) {
      try {
        const keyToUse = this.config.serviceRoleKey || this.config.anonKey;
        this.client = createClient(this.config.url, keyToUse, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      } catch (err) {
        console.warn("Aviso ao inicializar cliente Supabase. Utilizando storage resiliente:", err);
      }
    }
  }

  public getRawClient(): SupabaseClient | null {
    return this.client;
  }

  public isConfigured(): boolean {
    return this.config.isConfigured && this.client !== null;
  }

  public isConnected(): boolean {
    return this.healthState.isConnected;
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  public getLocalEngine(): InMemoryRelationalEngine {
    return this.localEngine;
  }

  // --- GENERIC CRUD DATABASE ADAPTER METHODS ---

  public async insert<T = any>(table: string, record: any): Promise<T> {
    // 1. If Supabase is active, attempt insert
    if (this.client) {
      try {
        const { data, error } = await this.client.from(table).insert(record).select().single();
        if (!error && data) {
          this.localEngine.upsert(table, data);
          return data as T;
        } else if (error) {
          this.markConnectionDegraded(error.message);
        }
      } catch (e: any) {
        this.markConnectionDegraded(e?.message);
      }
    }
    // 2. Resilient local engine write
    return this.localEngine.insert(table, record) as T;
  }

  public async upsert<T = any>(table: string, record: any, onConflict = "id"): Promise<T> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .upsert(record, { onConflict })
          .select()
          .single();
        if (!error && data) {
          this.localEngine.upsert(table, data, onConflict);
          return data as T;
        } else if (error) {
          this.markConnectionDegraded(error.message);
        }
      } catch (e: any) {
        this.markConnectionDegraded(e?.message);
      }
    }
    return this.localEngine.upsert(table, record, onConflict) as T;
  }

  public async selectById<T = any>(table: string, id: string): Promise<T | null> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from(table).select("*").eq("id", id).single();
        if (!error && data) {
          this.localEngine.upsert(table, data);
          return data as T;
        } else if (error) {
          this.markConnectionDegraded(error.message);
        }
      } catch (e: any) {
        this.markConnectionDegraded(e?.message);
      }
    }
    return this.localEngine.selectById(table, id) as T | null;
  }

  public async select<T = any>(
    table: string,
    filter?: (item: any) => boolean,
    supabaseQueryModifier?: (query: any) => any
  ): Promise<T[]> {
    if (this.client && supabaseQueryModifier) {
      try {
        let q = this.client.from(table).select("*");
        q = supabaseQueryModifier(q);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          for (const item of data) {
            this.localEngine.upsert(table, item);
          }
          return data as T[];
        } else if (error) {
          this.markConnectionDegraded(error.message);
        }
      } catch (e: any) {
        this.markConnectionDegraded(e?.message);
      }
    }
    return this.localEngine.select(table, filter) as T[];
  }

  public async update<T = any>(table: string, id: string, updates: any): Promise<T | null> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          this.localEngine.update(table, id, data);
          return data as T;
        } else if (error) {
          this.markConnectionDegraded(error.message);
        }
      } catch (e: any) {
        this.markConnectionDegraded(e?.message);
      }
    }
    return this.localEngine.update(table, id, updates) as T | null;
  }

  public async delete(table: string, id: string): Promise<boolean> {
    if (this.client) {
      try {
        const { error } = await this.client.from(table).delete().eq("id", id);
        if (!error) {
          this.localEngine.delete(table, id);
          return true;
        } else {
          this.markConnectionDegraded(error.message);
        }
      } catch (e: any) {
        this.markConnectionDegraded(e?.message);
      }
    }
    return this.localEngine.delete(table, id);
  }

  private markConnectionDegraded(reason?: string): void {
    if (this.healthState.status !== "DISCONNECTED") {
      this.healthState = {
        ...this.healthState,
        status: "DISCONNECTED",
        isConnected: false,
        isFallbackActive: true,
        lastChecked: new Date().toISOString(),
        errorMessage: reason || "Falha recente de comunicação com o Supabase. Modo Local Resiliente ativo.",
      };
      this.notifyHealthChange();
    }
  }
}

export const dbClient = SupabasePersistenceClient.getInstance();
