import { executionEngine } from "../engine/executionEngine";
import { auditEventManager } from "../engine/auditEventManager";
import cron from "node-cron";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export interface AutonomousWorkerTask {
  id: string;
  title: string;
  description?: string;
  assignedAgentId: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
  updatedAt: string;
  finalDeliverable?: string;
  confidenceScore?: number;
}

// Inicializar Firebase de forma segura (evita inicializações duplicadas)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Agent Background Worker
 * Serviço autónomo 24/7 que monitoriza e executa o fluxo `processarChamadaAgent`
 * para agentes ativos, mantendo rotinas agendadas e auditorias sem necessidade de supervisão manual.
 */
export class AgentBackgroundWorker {
  private static instance: AgentBackgroundWorker;
  private isRunning = false;
  private cronJob: any = null;
  private localTaskQueue: AutonomousWorkerTask[] = [];
  private lastRunTimestamp: string | null = null;
  private isCycleInProgress = false;

  private constructor() {
    this.seedInitialAutonomousTasks();
  }

  public static getInstance(): AgentBackgroundWorker {
    if (!AgentBackgroundWorker.instance) {
      AgentBackgroundWorker.instance = new AgentBackgroundWorker();
    }
    return AgentBackgroundWorker.instance;
  }

  /**
   * Inicializa tarefas autónomas padrão do ecossistema GAG Visual em Luanda
   */
  private seedInitialAutonomousTasks() {
    this.localTaskQueue = [
      {
        id: `autotask_init_athena_${Date.now()}`,
        title: "Monitorização de Inteligência Cambial e Preços (AOA)",
        description: "Analisar flutuações cambiais do Kwanza (AOA) e impacto nos custos de impressão e consumíveis de grande formato.",
        assignedAgentId: "athena",
        status: "TODO",
        priority: "MEDIUM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `autotask_init_cypher_${Date.now()}`,
        title: "Auditoria Proativa de Segurança e Integridade RBAC",
        description: "Verificar consistência de permissões e registar bloco criptográfico SHA-256 no histórico de auditoria.",
        assignedAgentId: "cypher",
        status: "TODO",
        priority: "LOW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Adiciona uma tarefa à fila autónoma
   */
  public enqueueTask(task: Omit<AutonomousWorkerTask, "id" | "createdAt" | "updatedAt" | "status">): AutonomousWorkerTask {
    const newTask: AutonomousWorkerTask = {
      ...task,
      id: `task_worker_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: "TODO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.localTaskQueue.push(newTask);
    console.log(`[AgentWorker] Nova tarefa enfileirada: ${newTask.id} - ${newTask.title} (Agente: ${newTask.assignedAgentId})`);
    return newTask;
  }

  /**
   * Obtém a lista atual de tarefas autónomas
   */
  public getTasks(): AutonomousWorkerTask[] {
    return [...this.localTaskQueue];
  }

  /**
   * Retorna o estado operacional do worker
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      isCycleInProgress: this.isCycleInProgress,
      lastRunTimestamp: this.lastRunTimestamp,
      pendingTasksCount: this.localTaskQueue.filter((t) => t.status === "TODO").length,
      completedTasksCount: this.localTaskQueue.filter((t) => t.status === "COMPLETED").length,
      totalQueueCount: this.localTaskQueue.length,
      activeAgents: ["kia", "athena", "hermes", "davinci", "vulcan", "cypher"],
    };
  }

  /**
   * Inicia o ciclo 24/7 do background worker
   */
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[AgentWorker] Background worker iniciado (24/7 operacional para agentes executivos GAG Visual).");

    // Agendar verificação periódica a cada 5 minutos
    this.cronJob = cron.schedule("*/5 * * * *", async () => {
      await this.runMaintenanceCycle();
    });

    // Disparar uma primeira verificação com debounce de 15 segundos para inicialização estável
    setTimeout(() => {
      this.runMaintenanceCycle().catch((err) => {
        console.debug("[AgentWorker] Aviso no arranque do ciclo inicial:", err?.message);
      });
    }, 15000);
  }

  /**
   * Pára o worker (usado em testes ou encerramentos)
   */
  public stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log("[AgentWorker] Background worker pausado.");
  }

  /**
   * Executa todas as tarefas canceladas que estejam na fila do worker
   */
  public async executeCancelledTasks(): Promise<{ completedCount: number; tasks: AutonomousWorkerTask[] }> {
    const cancelled = this.localTaskQueue.filter((t) => t.status === "CANCELLED");
    const executed: AutonomousWorkerTask[] = [];

    console.log(`[AgentWorker] A executar ${cancelled.length} tarefas canceladas...`);

    for (const task of cancelled) {
      task.status = "IN_PROGRESS";
      task.updatedAt = new Date().toISOString();

      const execResult = await this.processarChamadaAgent(
        task.assignedAgentId || "kia",
        task.description || task.title,
        task.id
      );

      task.status = execResult.status === "COMPLETED" ? "COMPLETED" : "FAILED";
      task.finalDeliverable = execResult.deliverable;
      task.confidenceScore = execResult.confidenceScore;
      task.updatedAt = new Date().toISOString();
      executed.push(task);
    }

    return { completedCount: executed.length, tasks: executed };
  }

  /**
   * Executa o fluxo `processarChamadaAgent` para um agente específico de forma autónoma
   */
  public async processarChamadaAgent(
    agentId: string,
    goal: string,
    taskId?: string
  ): Promise<{ status: "COMPLETED" | "FAILED"; deliverable: string; confidenceScore: number }> {
    console.log(`[AgentWorker] A processar chamada autónoma para agente '${agentId}': "${goal.slice(0, 60)}..."`);

    try {
      const result = await executionEngine.executePipeline({
        goal,
        taskId: taskId || `worker_auto_${Date.now()}`,
        preferredAgentId: agentId,
        userName: "GAG_AUTONOMOUS_WORKER",
        userRole: "OWNER",
        inputs: {
          automatedWorkerTrigger: true,
          executionMode: "AUTONOMOUS_SCHEDULED",
        },
      });

      const deliverable = result.finalDeliverable || `Execução concluída com sucesso pelo agente ${agentId}.`;
      const confidence = result.qaReport?.overallScore ? Math.round(result.qaReport.overallScore * 100) : 95;

      // Registar evento de auditoria autónomo
      auditEventManager.recordEvent({
        traceId: `trace_worker_${Date.now()}`,
        executionId: `exec_worker_${Date.now()}`,
        taskId,
        agentId,
        actor: `AutonomousWorker:${agentId}`,
        action: "AUTONOMOUS_SCHEDULED_EXECUTION",
        newState: result.status,
        details: {
          agentId,
          goal,
          status: result.status,
          confidenceScore: confidence,
          stepsCompleted: result.steps?.length || 1,
        },
      });

      return {
        status: result.status === "COMPLETED" ? "COMPLETED" : "FAILED",
        deliverable,
        confidenceScore: confidence,
      };
    } catch (err: any) {
      console.warn(`[AgentWorker] Erro ao processar chamada do agente ${agentId}:`, err?.message);
      return {
        status: "FAILED",
        deliverable: `Falha na execução autónoma: ${err?.message || "Erro desconhecido"}`,
        confidenceScore: 40,
      };
    }
  }

  /**
   * Ciclo de manutenção periódica
   */
  public async runMaintenanceCycle(): Promise<void> {
    if (this.isCycleInProgress) {
      console.log("[AgentWorker] Ciclo de manutenção já em curso. Ignorando invocação concorrente.");
      return;
    }

    this.isCycleInProgress = true;
    this.lastRunTimestamp = new Date().toISOString();
    console.log("[AgentWorker] A iniciar ciclo de manutenção periódica autónoma...");

    try {
      // 1. Processar tarefas pendentes da fila local autónoma
      const pendingTasks = this.localTaskQueue.filter((t) => t.status === "TODO");

      for (const task of pendingTasks) {
        task.status = "IN_PROGRESS";
        task.updatedAt = new Date().toISOString();

        console.log(`[AgentWorker] A executar tarefa autónoma [${task.id}]: ${task.title} (Agente: ${task.assignedAgentId})`);

        const execResult = await this.processarChamadaAgent(
          task.assignedAgentId || "kia",
          task.description || task.title,
          task.id
        );

        task.status = execResult.status;
        task.finalDeliverable = execResult.deliverable;
        task.confidenceScore = execResult.confidenceScore;
        task.updatedAt = new Date().toISOString();
      }

      // 2. Se houver autenticação Firebase ativa no servidor, sincronizar colecção 'tasks' de forma segura
      await this.safeSyncFirestoreTasks();

      console.log(`[AgentWorker] Ciclo de manutenção concluído com sucesso. Tarefas processadas nesta ronda: ${pendingTasks.length}`);
    } catch (err: any) {
      // Tratamento gracioso sem poluir logs com erros fatais
      console.warn("[AgentWorker] Aviso durante o ciclo de manutenção:", err?.message || err);
    } finally {
      this.isCycleInProgress = false;
    }
  }

  /**
   * Sincronização segura com Firestore:
   * Apenas tenta consultar caso haja sessão autenticada, prevenindo FirebaseError de permissões
   */
  private async safeSyncFirestoreTasks(): Promise<void> {
    try {
      const auth = getAuth(app);
      // Se não houver utilizador autenticado no SDK do servidor, não efetuar leitura direta restrita por regras
      if (!auth.currentUser) {
        // Acesso mantido através da fila local autónoma sem emitir erros de permissão
        return;
      }

      const tasksQuery = query(collection(db, "tasks"), where("status", "==", "TODO"));
      const querySnapshot = await getDocs(tasksQuery);

      for (const taskDoc of querySnapshot.docs) {
        const taskData = taskDoc.data();
        console.log(`[AgentWorker] Tarefa Firestore detetada: ${taskDoc.id} - ${taskData.title}`);

        await updateDoc(doc(db, "tasks", taskDoc.id), { status: "IN_PROGRESS" });

        const execResult = await this.processarChamadaAgent(
          taskData.assignedAgentId || "kia",
          taskData.description || taskData.title || "Executar tarefa pendente",
          taskDoc.id
        );

        await updateDoc(doc(db, "tasks", taskDoc.id), {
          status: execResult.status,
          finalDeliverable: execResult.deliverable,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      // Captura erros de permissão de forma silenciosa para não quebrar o serviço
      console.debug("[AgentWorker] Sincronização remota de tarefas Firestore em pausa (modo offline/local ativo):", err?.message);
    }
  }
}

export const agentBackgroundWorker = AgentBackgroundWorker.getInstance();
