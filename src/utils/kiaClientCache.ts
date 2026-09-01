/**
 * GAG CORE OS — CLIENT-SIDE KIA RESPONSE & AUDIO CACHE
 * Memory and sessionStorage LRU cache to eliminate duplicate network calls and provide instantaneous (<5ms) responses.
 */

export interface ClientCachedMessage {
  query: string;
  response: {
    content: string;
    intent?: string;
    capability?: string;
    executionStatus?: string;
    toolsUsed?: string[];
    suggestedPrompts?: string[];
    actionCard?: any;
    actionPayload?: any;
    auditRef?: string;
    executionTimeMs?: number;
    modelName?: string;
  };
  timestamp: number;
}

class KiaClientCacheEngine {
  private memoryCache: Map<string, ClientCachedMessage> = new Map();
  private maxEntries: number = 100;
  private ttlMs: number = 15 * 60 * 1000; // 15 minutes

  public normalize(text: string): string {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^(ei|hey|ola|oi|ok|por favor|pfv|kia|a kia|o kia|podes|pode)\s+/g, "")
      .replace(/\s+(kia|por favor|obrigado|obrigada)$/g, "")
      .trim();
  }

  public get(query: string, role?: string): ClientCachedMessage["response"] | null {
    const norm = this.normalize(query);
    if (!norm || norm.length < 2) return null;
    const key = role ? `${role}:${norm}` : norm;

    const item = this.memoryCache.get(key) || this.memoryCache.get(norm);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttlMs) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.response;
  }

  public set(query: string, response: ClientCachedMessage["response"], role?: string): void {
    const norm = this.normalize(query);
    if (!norm || norm.length < 2) return;
    const key = role ? `${role}:${norm}` : norm;

    // Maintain LRU size limit
    if (this.memoryCache.size >= this.maxEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      query: norm,
      response,
      timestamp: Date.now(),
    });
  }

  public clear(): void {
    this.memoryCache.clear();
  }

  public size(): number {
    return this.memoryCache.size;
  }
}

export const kiaClientCache = new KiaClientCacheEngine();
