/**
 * Asynchronous Message Queue System & Voice Pipeline Manager
 * Designed for High-Throughput, Low-Latency AI Interaction in GAG Core OS
 */

export type TaskPriority = "P0_AI_RESPONSE" | "P1_UI_STREAM" | "P2_BACKGROUND_STORAGE";

interface QueuedTask<T = any> {
  id: string;
  priority: TaskPriority;
  execute: () => Promise<T> | T;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  timestamp: number;
}

class AsyncMessageQueue {
  private p0Queue: QueuedTask[] = [];
  private p1Queue: QueuedTask[] = [];
  private p2Queue: QueuedTask[] = [];
  private isProcessing = false;
  private backgroundIdleHandle: number | null = null;

  /**
   * Enqueue a task with specified priority
   */
  public enqueue<T>(execute: () => Promise<T> | T, priority: TaskPriority = "P0_AI_RESPONSE"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task: QueuedTask<T> = {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        priority,
        execute,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      if (priority === "P0_AI_RESPONSE") {
        this.p0Queue.push(task);
      } else if (priority === "P1_UI_STREAM") {
        this.p1Queue.push(task);
      } else {
        this.p2Queue.push(task);
      }

      this.scheduleProcessing();
    });
  }

  /**
   * Schedule processing with priority sorting
   */
  private scheduleProcessing() {
    if (this.isProcessing) return;

    // Use microtask for immediate P0 execution, requestAnimationFrame for P1, and idle for P2
    if (this.p0Queue.length > 0) {
      queueMicrotask(() => this.processNext());
    } else if (this.p1Queue.length > 0) {
      requestAnimationFrame(() => this.processNext());
    } else if (this.p2Queue.length > 0) {
      this.scheduleBackgroundIdle();
    }
  }

  private scheduleBackgroundIdle() {
    if (this.backgroundIdleHandle !== null) return;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      this.backgroundIdleHandle = (window as any).requestIdleCallback(
        () => {
          this.backgroundIdleHandle = null;
          this.processNext();
        },
        { timeout: 150 }
      );
    } else {
      this.backgroundIdleHandle = setTimeout(() => {
        this.backgroundIdleHandle = null;
        this.processNext();
      }, 50) as unknown as number;
    }
  }

  private async processNext() {
    if (this.isProcessing) return;

    // Pick highest priority task
    let task: QueuedTask | undefined;
    if (this.p0Queue.length > 0) {
      task = this.p0Queue.shift();
    } else if (this.p1Queue.length > 0) {
      task = this.p1Queue.shift();
    } else if (this.p2Queue.length > 0) {
      task = this.p2Queue.shift();
    }

    if (!task) return;

    this.isProcessing = true;
    try {
      const result = await task.execute();
      task.resolve(result);
    } catch (err) {
      task.reject(err);
    } finally {
      this.isProcessing = false;
      // Continue queue
      if (this.p0Queue.length > 0 || this.p1Queue.length > 0 || this.p2Queue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }

  /**
   * Offload non-critical storage or hashing side-effects so the UI thread is never blocked
   */
  public runInBackground(fn: () => void) {
    this.enqueue(fn, "P2_BACKGROUND_STORAGE").catch((err) => {
      console.warn("Background task deferred error:", err);
    });
  }

  /**
   * Clear all pending tasks
   */
  public clear() {
    this.p0Queue = [];
    this.p1Queue = [];
    this.p2Queue = [];
  }
}

export const messageQueue = new AsyncMessageQueue();

/**
 * Throttles high-frequency UI updates (e.g. audio waveforms, live transcription streams)
 * to run at most once per animation frame to prevent layout thrashing.
 */
export function throttleToFrame<T extends (...args: any[]) => void>(fn: T): T {
  let frameId: number | null = null;
  let lastArgs: any[] = [];

  const throttled = (...args: any[]) => {
    lastArgs = args;
    if (frameId === null) {
      frameId = requestAnimationFrame(() => {
        fn(...lastArgs);
        frameId = null;
      });
    }
  };

  return throttled as T;
}
