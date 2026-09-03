import { ThreeTierMemory } from "../types";
import { PolicyManager } from "../policies/policyManager";
import { SupabasePersistenceClient } from "../../persistence/supabaseClient";

export interface OwnerDecision {
  id: string;
  title: string;
  decision: string;
  rationale: string;
  category: "FINANCIAL_POLICY" | "BRAND_POLICY" | "PRICING_POLICY" | "OPERATIONAL";
  appliedCount?: number;
  timestamp: string;
}

export interface ClientContextRecord {
  id: string;
  clientName: string;
  phone?: string;
  company: string;
  context: string;
  status: string;
  lastMeeting?: string;
  keyRequirements?: string[];
}

export interface MeetingMinuteRecord {
  id: string;
  title: string;
  date: string;
  participants: string[];
  keyDecisions: string[];
  actionItems: Array<{ task: string; assignee: string; deadline?: string }>;
  clientOrContext?: string;
  rawNotes?: string;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private memory: ThreeTierMemory;
  private db: SupabasePersistenceClient;

  private constructor() {
    this.db = SupabasePersistenceClient.getInstance();
    this.memory = {
      session: {
        activeConversationId: "default-session",
        scratchpad: {},
        lastTurnTimestamp: new Date().toISOString(),
      },
      operational: {
        tasksQueue: [],
        activeHandoffs: [],
        cachedDeliverables: {},
        recentDecisions: [],
      },
      permanent: {
        knowledgeVersion: "2026.1",
        brandGuidelinesSummary: "GAG Visual / GAG Labs: Soluções com propósito, inovação com raízes. Metodologia TOB (Tecnologia, Organização, Branding). Paleta: #0A0A0F, #003FD3, #DAA520. Sinal obrigatório 50%, taxa urgência 48h +50%.",
        clientPlaybooksSummary: "Playbooks de alta autoridade, fechamento High-Ticket, auditoria forense ENDE/Unitel/DSTV, triagem Inbox Zero.",
        approvedPolicies: PolicyManager.getInstance().getAllPolicies(),
      },
    };
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Session & Short-Term Memory
  private sessionTurns: Map<string, Array<{ role: string; content: string; timestamp: string }>> = new Map();

  public recordTurn(sessionId: string, role: string, content: string): void {
    if (!this.sessionTurns.has(sessionId)) {
      this.sessionTurns.set(sessionId, []);
    }
    const turns = this.sessionTurns.get(sessionId)!;
    turns.push({ role, content, timestamp: new Date().toISOString() });
    if (turns.length > 50) turns.shift();
  }

  public getSessionHistory(sessionId: string): Array<{ role: string; content: string; timestamp: string }> {
    return this.sessionTurns.get(sessionId) || [];
  }

  public setSessionScratchpad(key: string, value: any): void {
    this.memory.session.scratchpad[key] = value;
    this.memory.session.lastTurnTimestamp = new Date().toISOString();
  }

  public getSessionScratchpad(key: string): any {
    return this.memory.session.scratchpad[key];
  }

  public clearSessionScratchpad(): void {
    this.memory.session.scratchpad = {};
  }

  // Long-Term: Owner Decisions
  public getOwnerDecisions(): OwnerDecision[] {
    return this.db.getLocalEngine().select("owner_decisions");
  }

  public addOwnerDecision(
    param1: string | { title: string; decision: string; rationale?: string; category?: any },
    param2?: string,
    param3?: string,
    param4?: OwnerDecision["category"]
  ): OwnerDecision {
    let title = "";
    let decision = "";
    let rationale = "";
    let category: OwnerDecision["category"] = "OPERATIONAL";

    if (typeof param1 === "object") {
      title = param1.title;
      decision = param1.decision;
      rationale = param1.rationale || "Diretriz operacional do Owner.";
      category = (param1.category as OwnerDecision["category"]) || "OPERATIONAL";
    } else {
      title = param1;
      decision = param2 || "";
      rationale = param3 || "Diretriz operacional do Owner.";
      category = param4 || "OPERATIONAL";
    }

    const record: OwnerDecision = {
      id: `dec-${Date.now()}`,
      title,
      decision,
      rationale,
      category,
      appliedCount: 0,
      timestamp: new Date().toISOString(),
    };
    this.db.getLocalEngine().insert("owner_decisions", record);
    this.recordDecision(decision, rationale);
    return record;
  }

  // Long-Term: Client Contexts
  public getAllClientContexts(): ClientContextRecord[] {
    return this.db.getLocalEngine().select("client_contexts");
  }

  public getClientContext(clientOrCompany: string): ClientContextRecord | null {
    if (!clientOrCompany) return null;
    const lower = clientOrCompany.toLowerCase();
    const list = this.getAllClientContexts();
    return (
      list.find(
        (c) =>
          c.clientName.toLowerCase().includes(lower) ||
          c.company.toLowerCase().includes(lower) ||
          (c.phone && c.phone.includes(lower))
      ) || null
    );
  }

  public upsertClientContext(context: Partial<ClientContextRecord> & { clientName: string; company: string }): ClientContextRecord {
    const id = context.id || `ctx-${Date.now()}`;
    const record: ClientContextRecord = {
      id,
      clientName: context.clientName,
      company: context.company,
      phone: context.phone,
      context: context.context || "",
      status: context.status || "ACTIVE",
      lastMeeting: context.lastMeeting || new Date().toISOString().split("T")[0],
      keyRequirements: context.keyRequirements || [],
    };
    return this.db.getLocalEngine().upsert("client_contexts", record);
  }

  // Long-Term: Meeting Minutes & Decided Actions
  public getAllMeetingMinutes(): MeetingMinuteRecord[] {
    return this.db.getLocalEngine().select("meeting_minutes");
  }

  public addMeetingMinute(minute: Omit<MeetingMinuteRecord, "id">): MeetingMinuteRecord {
    const record: MeetingMinuteRecord = {
      id: `meet-${Date.now()}`,
      ...minute,
    };
    this.db.getLocalEngine().insert("meeting_minutes", record);
    // Also record key decisions into operational memory
    minute.keyDecisions.forEach((dec) => {
      this.recordDecision(`Reunião ${minute.title}: ${dec}`, `Minuta de ${minute.date}`);
    });
    return record;
  }

  /**
   * Vector-like semantic relevance retriever for prompt injection.
   * Finds matching client context, owner decisions, and meeting notes based on input text.
   */
  public getRelevantContextForPrompt(query: string): string {
    const q = query.toLowerCase();
    const sections: string[] = [];

    // 1. Check Owner Decisions
    const decisions = this.getOwnerDecisions();
    const matchingDecisions = decisions.filter(
      (d) =>
        q.includes("proposta") ||
        q.includes("preço") ||
        q.includes("pagamento") ||
        q.includes("sinal") ||
        q.includes("urgente") ||
        q.includes("tob") ||
        d.title.toLowerCase().split(" ").some((w) => w.length > 3 && q.includes(w))
    );

    if (matchingDecisions.length > 0) {
      sections.push(
        `DECISÕES ESTRATÉGICAS DO OWNER (OBRIGATÓRIO RESPEITAR):\n` +
          matchingDecisions.map((d) => `• [${d.title}] ${d.decision} (Razão: ${d.rationale})`).join("\n")
      );
    }

    // 2. Check Client Contexts
    const clients = this.getAllClientContexts();
    const matchingClients = clients.filter(
      (c) =>
        q.includes(c.clientName.toLowerCase()) ||
        q.includes(c.company.toLowerCase()) ||
        (c.phone && q.includes(c.phone.replace(/[^0-9]/g, "")))
    );

    if (matchingClients.length > 0) {
      sections.push(
        `HISTÓRICO E CONTEXTO DE CLIENTES:\n` +
          matchingClients
            .map(
              (c) =>
                `• Cliente: ${c.clientName} (${c.company}) | Status: ${c.status}\n  Contexto: ${c.context}\n  Requisitos Chave: ${c.keyRequirements?.join(", ")}`
            )
            .join("\n")
      );
    }

    // 3. Check Meeting Minutes
    const minutes = this.getAllMeetingMinutes();
    const matchingMinutes = minutes.filter((m) =>
      m.title.toLowerCase().split(" ").some((w) => w.length > 3 && q.includes(w))
    );

    if (matchingMinutes.length > 0) {
      sections.push(
        `MINUTAS DE REUNIÃO RELEVANTES:\n` +
          matchingMinutes
            .slice(0, 2)
            .map(
              (m) =>
                `• [${m.date}] ${m.title}: Decisões: ${m.keyDecisions.join("; ")} | Ações: ${m.actionItems.map((a) => `${a.task} (${a.assignee})`).join(", ")}`
            )
            .join("\n")
      );
    }

    return sections.join("\n\n");
  }

  // Operational Memory
  public recordDecision(decision: string, rationale: string): void {
    this.memory.operational.recentDecisions.unshift({
      decision,
      rationale,
      timestamp: new Date().toISOString(),
    });
    if (this.memory.operational.recentDecisions.length > 20) {
      this.memory.operational.recentDecisions.pop();
    }
  }

  public cacheDeliverable(taskId: string, deliverable: any): void {
    this.memory.operational.cachedDeliverables[taskId] = deliverable;
  }

  public getCachedDeliverable(taskId: string): any {
    return this.memory.operational.cachedDeliverables[taskId];
  }

  // Permanent Memory
  public getBrandGuidelinesSummary(): string {
    return this.memory.permanent.brandGuidelinesSummary;
  }

  public getSnapshot(): ThreeTierMemory {
    return JSON.parse(JSON.stringify(this.memory));
  }
}

