import { OrchestratedTask, ExecutionState } from "../types";

export class TaskOrchestrator {
  private static instance: TaskOrchestrator;
  private tasks: Map<string, OrchestratedTask> = new Map();

  public static getInstance(): TaskOrchestrator {
    if (!TaskOrchestrator.instance) {
      TaskOrchestrator.instance = new TaskOrchestrator();
    }
    return TaskOrchestrator.instance;
  }

  public addTask(task: OrchestratedTask): void {
    this.tasks.set(task.id, task);
  }

  public getTask(id: string): OrchestratedTask | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(): OrchestratedTask[] {
    return Array.from(this.tasks.values());
  }

  public updateTaskStatus(
    taskId: string,
    status: ExecutionState,
    output?: string,
    artifacts?: { name: string; type: string; content: string }[]
  ): OrchestratedTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.status = status;
    if (output) task.executionOutput = output;
    if (artifacts) task.executionArtifacts = artifacts;

    if (status === "IN_PROGRESS" && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if (status === "COMPLETED" || status === "FAILED") {
      task.completedAt = new Date().toISOString();
    }

    // Unblock dependent tasks if this task is completed
    if (status === "COMPLETED") {
      this.checkAndUnblockDependents(taskId);
    }

    return task;
  }

  private checkAndUnblockDependents(completedTaskId: string): void {
    for (const task of this.tasks.values()) {
      if (task.status === "BLOCKED" && task.dependencies.includes(completedTaskId)) {
        const allDepsCompleted = task.dependencies.every((depId) => {
          const dep = this.tasks.get(depId);
          return dep && dep.status === "COMPLETED";
        });
        if (allDepsCompleted) {
          task.status = "IN_PROGRESS"; // or ready for execution
        }
      }
    }
  }

  /**
   * "Qual é a próxima tarefa que pode ser executada agora?"
   * Finds the highest priority task whose dependencies are all COMPLETED.
   */
  public getNextExecutableTask(): OrchestratedTask | undefined {
    const candidateTasks = Array.from(this.tasks.values()).filter((t) => {
      if (t.status === "COMPLETED" || t.status === "FAILED" || t.status === "NOT_IMPLEMENTED" || t.status === "OWNER_APPROVAL_REQUIRED") {
        return false;
      }
      // Check if all dependencies are satisfied
      const allDepsMet = t.dependencies.every((depId) => {
        const dep = this.tasks.get(depId);
        return dep && dep.status === "COMPLETED";
      });
      return allDepsMet;
    });

    if (candidateTasks.length === 0) return undefined;

    // Sort by priority: CRITICAL > HIGH > MEDIUM > LOW
    const priorityWeight: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    candidateTasks.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 1;
      const weightB = priorityWeight[b.priority] || 1;
      return weightB - weightA;
    });

    return candidateTasks[0];
  }
}
