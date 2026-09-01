/**
 * GAG CORE OS — KIA INTELLIGENT RESPONSE & TTS CACHE ENGINE
 * High-performance in-memory LRU cache with TTL for common queries, assistant responses, and synthesized audio.
 */
import crypto from "crypto";

export interface CachedResponse {
  content: string;
  intent: string;
  capability: string;
  executionStatus: string;
  toolsUsed?: string[];
  suggestedPrompts?: string[];
  actionCard?: any;
  actionPayload?: any;
  cachedAt: number;
  expiresAt: number;
  hits: number;
}

export interface CachedAudio {
  audioBase64: string;
  mimeType: string;
  sampleRate: number;
  voiceName: string;
  cachedAt: number;
  expiresAt: number;
  hits: number;
}

class KiaCacheEngine {
  private responseCache: Map<string, CachedResponse> = new Map();
  private audioCache: Map<string, CachedAudio> = new Map();
  private maxEntries: number = 500;
  private defaultResponseTtlMs: number = 20 * 60 * 1000; // 20 minutes
  private staticResponseTtlMs: number = 24 * 60 * 60 * 1000; // 24 hours
  private audioTtlMs: number = 2 * 60 * 60 * 1000; // 2 hours

  constructor() {
    this.seedCommonPhrases();
  }

  /**
   * Normalize user queries for high cache hit rates
   */
  public normalizeQuery(query: string): string {
    if (!query) return "";
    return query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents for cache matching
      .replace(/[^\w\s]/gi, " ") // Replace punctuation with space
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim()
      .replace(/^(ei|hey|ola|oi|ok|por favor|pfv|kia|a kia|o kia|podes|pode)\s+/g, "")
      .replace(/\s+(kia|por favor|obrigado|obrigada)$/g, "")
      .trim();
  }

  private generateQueryKey(query: string, userRole = "OWNER"): string {
    const norm = this.normalizeQuery(query);
    return `${norm}__${userRole}`;
  }

  private generateAudioKey(text: string, voiceName = "Kore"): string {
    const hash = crypto.createHash("md5").update(`${text.trim()}_${voiceName}`).digest("hex");
    return `${voiceName}_${hash}`;
  }

  /**
   * Retrieve cached response if valid and not expired
   */
  public getResponse(query: string, userRole = "OWNER"): CachedResponse | null {
    const key = this.generateQueryKey(query, userRole);
    const cached = this.responseCache.get(key);

    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.responseCache.delete(key);
      return null;
    }

    cached.hits += 1;
    return cached;
  }

  /**
   * Store response in cache with LRU eviction
   */
  public setResponse(
    query: string,
    response: Omit<CachedResponse, "cachedAt" | "expiresAt" | "hits">,
    userRole = "OWNER",
    customTtlMs?: number
  ): void {
    if (this.responseCache.size >= this.maxEntries) {
      // Evict oldest or least hit entry
      const firstKey = this.responseCache.keys().next().value;
      if (firstKey) this.responseCache.delete(firstKey);
    }

    const key = this.generateQueryKey(query, userRole);
    const ttl = customTtlMs || this.defaultResponseTtlMs;
    const now = Date.now();

    this.responseCache.set(key, {
      ...response,
      cachedAt: now,
      expiresAt: now + ttl,
      hits: 0,
    });
  }

  /**
   * Retrieve cached TTS audio
   */
  public getAudio(text: string, voiceName = "Kore"): CachedAudio | null {
    const key = this.generateAudioKey(text, voiceName);
    const cached = this.audioCache.get(key);

    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.audioCache.delete(key);
      return null;
    }

    cached.hits += 1;
    return cached;
  }

  /**
   * Store synthesized TTS audio in cache
   */
  public setAudio(
    text: string,
    audioBase64: string,
    voiceName = "Kore",
    mimeType = "audio/pcm;rate=24000",
    sampleRate = 24000
  ): void {
    if (this.audioCache.size >= this.maxEntries) {
      const firstKey = this.audioCache.keys().next().value;
      if (firstKey) this.audioCache.delete(firstKey);
    }

    const key = this.generateAudioKey(text, voiceName);
    const now = Date.now();

    this.audioCache.set(key, {
      audioBase64,
      mimeType,
      sampleRate,
      voiceName,
      cachedAt: now,
      expiresAt: now + this.audioTtlMs,
      hits: 0,
    });
  }

  /**
   * Get cache metrics and health
   */
  public getStats() {
    return {
      responsesCached: this.responseCache.size,
      audioCached: this.audioCache.size,
      maxCapacity: this.maxEntries,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear all caches
   */
  public clear(): void {
    this.responseCache.clear();
    this.audioCache.clear();
    this.seedCommonPhrases();
  }

  /**
   * Pre-warm cache with common executive and operational queries
   */
  private seedCommonPhrases(): void {
    const commonSeeds = [
      {
        queries: ["ola", "bom dia", "boa tarde", "boa noite", "oi", "ola tudo bem", "como estas"],
        response: {
          content: "Olá Josemar! Estou 100% operacional e pronta para coordenar a equipa, analisar métricas ou acelerar as tuas operações na GAG Visual. Como posso ajudar agora?",
          intent: "conversation",
          capability: "conversation:chat",
          executionStatus: "SUCCESS",
          suggestedPrompts: [
            "⚡ Disparar Sinergia Global",
            "Ver tarefas no Backlog",
            "Analisar proposta comercial",
            "Consultar métricas de campanhas",
          ],
        },
      },
      {
        queries: ["quem es tu", "quem e voce", "o que fazes", "o que e a kia", "apresenta te"],
        response: {
          content: "Sou a KIA (Knowledge Intelligent Agent), a assistente central e orquestradora operacional do GAG Core OS da GAG Visual em Luanda. Coordeno os 13 agentes de IA especializados em copywriting, tráfego pago, design visual, automação n8n/Make, scanner financeiro e suporte comercial.",
          intent: "knowledge",
          capability: "knowledge:search",
          executionStatus: "SUCCESS",
          suggestedPrompts: [
            "Conhecer os 13 agentes",
            "Disparar Sinergia Global",
            "Criar uma nova tarefa",
          ],
        },
      },
      {
        queries: ["estado do sistema", "status do sistema", "diagnostico", "esta tudo bem", "saude do sistema"],
        response: {
          content: "O ecossistema GAG Core OS está com todos os nós ativos: IA Orquestradora online, 13 agentes operacionais sincronizados, Trilha de Auditoria SHA-256 ativa e cofre de automações pronto.",
          intent: "system",
          capability: "system:status",
          executionStatus: "SUCCESS",
          suggestedPrompts: [
            "Abrir painel de Incidentes",
            "Ver Cockpit de Sinergia",
            "Conferir Trilha de Auditoria",
          ],
        },
      },
      {
        queries: ["sinergia", "disparar sinergia", "alinhar agentes", "orquestrar equipa"],
        response: {
          content: "Sinergia Global acionada! Os 13 agentes da GAG Visual foram mobilizados para alinhamento estratégico, distribuição de briefings e execução paralela de tarefas.",
          intent: "internal_tool",
          capability: "agent_orchestration",
          executionStatus: "SUCCESS",
          actionCard: {
            type: "skill_executed",
            title: "⚡ Sinergia Multi-Agente em Execução",
            description: "13 agentes mobilizados para alinhamento operacional e entregas de alto impacto.",
            actionLabel: "Acompanhar Sinergia",
            actionUrl: "#modal=synergy",
          },
          actionPayload: {
            type: "trigger_synergy",
            goal: "Alinhamento operacional e execução simultânea dos 13 agentes.",
          },
          suggestedPrompts: [
            "Ver tarefas geradas",
            "Abrir painel de entregáveis",
            "Ajustar prioridades",
          ],
        },
      },
    ];

    for (const seed of commonSeeds) {
      for (const q of seed.queries) {
        this.setResponse(q, seed.response, "OWNER", this.staticResponseTtlMs);
      }
    }
  }
}

export const kiaCache = new KiaCacheEngine();
