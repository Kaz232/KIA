/**
 * GAG CORE OS — KIA CONTINUOUS WAKE-WORD DETECTION ENGINE
 * Listens in background for "KIA", "Ei KIA", "Olá KIA", "Ok KIA" etc.
 * Features phonetic tolerance (e.g. "quia", "kya", "que ia"),
 * instant activation chime, automatic command extraction, and continuous audio loop recovery.
 */

import { playSfx } from "./audio";

export interface WakeWordEvent {
  wakeWordMatched: string;
  rawTranscript: string;
  commandText?: string;
  isImmediateCommand: boolean;
  timestamp: string;
}

export type WakeWordCallback = (event: WakeWordEvent) => void;
export type WakeWordStatusCallback = (status: "listening" | "inactive" | "triggered" | "permission_blocked" | "unsupported") => void;

// Wake word trigger regex patterns with phonetic variants in Portuguese (PT-PT, PT-AO, PT-BR)
const WAKE_WORD_PATTERNS = [
  /\b(ei|hey|ola|olá|ok|ouça|ouca|escuta|alô|alo|fala|falar com a|chamar|chama a|acorda|acordar|oi)?\s*(kia|quia|kya|kea|k-i-a|qui a|ki a|tia|guia)\b/i,
  /\b(kia|quia|kya|kea)\b/i,
];

// Helper to check if text contains a wake word
export function matchWakeWord(text: string): { matched: boolean; wakeWord: string; command: string } {
  if (!text) return { matched: false, wakeWord: "", command: "" };

  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  for (const pattern of WAKE_WORD_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      const matchIndex = match.index || 0;
      const matchedPhrase = match[0];
      
      // Extract command after the wake phrase
      const afterMatch = normalized.slice(matchIndex + matchedPhrase.length).trim();
      const cleanedCommand = afterMatch
        .replace(/^(por favor|podes|quero que|faz favor|diz-me|mostra-me|me diz|vai para|abrir|cria|cria uma)\s+/i, (m) => m)
        .replace(/^[,.\s-]+/, "")
        .trim();

      return {
        matched: true,
        wakeWord: matchedPhrase,
        command: cleanedCommand,
      };
    }
  }

  return { matched: false, wakeWord: "", command: "" };
}

class KiaWakeWordDetector {
  private static instance: KiaWakeWordDetector;
  private recognition: any = null;
  private isListening: boolean = false;
  private isEnabled: boolean = false;
  private shouldRestart: boolean = false;
  private isMutedForPlayback: boolean = false;
  private isPausedForActiveInput: boolean = false;
  private isSoundFeedbackEnabled: boolean = false;
  private lastTriggerTime: number = 0;
  private lastStartTime: number = 0;
  private restartTimeout: any = null;

  private listeners: Set<WakeWordCallback> = new Set();
  private statusListeners: Set<WakeWordStatusCallback> = new Set();
  private currentStatus: "listening" | "inactive" | "triggered" | "permission_blocked" | "unsupported" = "inactive";

  private constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        this.currentStatus = "unsupported";
      }
    }
  }

  public static getInstance(): KiaWakeWordDetector {
    if (!KiaWakeWordDetector.instance) {
      KiaWakeWordDetector.instance = new KiaWakeWordDetector();
    }
    return KiaWakeWordDetector.instance;
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public getStatus(): "listening" | "inactive" | "triggered" | "permission_blocked" | "unsupported" {
    return this.currentStatus;
  }

  public setSoundFeedback(enabled: boolean) {
    this.isSoundFeedbackEnabled = enabled;
  }

  public subscribe(callback: WakeWordCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public subscribeStatus(callback: WakeWordStatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setStatus(status: "listening" | "inactive" | "triggered" | "permission_blocked" | "unsupported") {
    this.currentStatus = status;
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (e) {
        console.error("Status callback error:", e);
      }
    });
  }

  /**
   * Pause wake word listening temporarily while KIA is speaking TTS
   */
  public setMutedForPlayback(muted: boolean) {
    this.isMutedForPlayback = muted;
    if (muted && this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {}
      this.recognition = null;
      this.isListening = false;
    } else if (!muted && this.isEnabled && !this.isPausedForActiveInput && !this.isListening) {
      this.resumeAfterActiveInput(800);
    }
  }

  /**
   * Cleanly pause wake word detector when user opens manual microphone recording in chat
   * Releases the hardware cleanly so speech recognition does not collide.
   */
  public async pauseForActiveInput(): Promise<void> {
    this.isPausedForActiveInput = true;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }
    this.isListening = false;
    this.setStatus("inactive");
    // Hardware release buffer
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  /**
   * Resume wake word detector after manual microphone recording stops
   */
  public resumeAfterActiveInput(delayMs = 1200) {
    this.isPausedForActiveInput = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.isEnabled && !this.isListening && !this.isMutedForPlayback) {
      this.restartTimeout = setTimeout(() => {
        if (!this.isPausedForActiveInput && this.isEnabled && !this.isListening && !this.isMutedForPlayback) {
          this.initRecognition();
        }
      }, delayMs);
    }
  }

  /**
   * Start continuous background listening for "KIA"
   */
  public start(): boolean {
    if (!this.isSupported()) {
      this.setStatus("unsupported");
      return false;
    }

    this.isEnabled = true;
    this.shouldRestart = true;
    this.isPausedForActiveInput = false;

    if (this.isListening) {
      return true;
    }

    this.initRecognition();
    return true;
  }

  /**
   * Stop wake word listening completely
   */
  public stop() {
    this.isEnabled = false;
    this.shouldRestart = false;
    this.isPausedForActiveInput = false;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    this.isListening = false;
    this.setStatus("inactive");
  }

  private initRecognition() {
    if (
      typeof window === "undefined" ||
      !this.isEnabled ||
      this.isPausedForActiveInput ||
      this.isMutedForPlayback
    ) {
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      this.setStatus("unsupported");
      return;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.onend = null;
          this.recognition.onerror = null;
          this.recognition.abort();
        } catch (e) {}
        this.recognition = null;
      }

      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "pt-PT";
      rec.maxAlternatives = 2;

      rec.onstart = () => {
        this.lastStartTime = Date.now();
        this.isListening = true;
        this.setStatus("listening");
      };

      rec.onresult = (event: any) => {
        if (this.isMutedForPlayback || this.isPausedForActiveInput) return;

        const results = event.results;
        for (let i = event.resultIndex; i < results.length; i++) {
          const result = results[i];
          const transcript = result[0]?.transcript || "";
          
          if (!transcript.trim()) continue;

          const match = matchWakeWord(transcript);
          if (match.matched) {
            const now = Date.now();
            // Debounce: prevent multiple triggers within 2.5 seconds
            if (now - this.lastTriggerTime < 2500) {
              return;
            }
            this.lastTriggerTime = now;

            // Trigger activation audio only if explicitly enabled
            if (this.isSoundFeedbackEnabled) {
              playSfx("wake_activation", 0.3);
            }
            this.setStatus("triggered");

            const payload: WakeWordEvent = {
              wakeWordMatched: match.wakeWord,
              rawTranscript: transcript,
              commandText: match.command,
              isImmediateCommand: !!match.command && match.command.length > 2,
              timestamp: new Date().toISOString(),
            };

            // Notify all subscribers
            this.listeners.forEach((callback) => {
              try {
                callback(payload);
              } catch (e) {
                console.error("Wake word event callback error:", e);
              }
            });

            // Return to listening status after feedback
            setTimeout(() => {
              if (this.isEnabled && !this.isPausedForActiveInput && !this.isMutedForPlayback) {
                this.setStatus("listening");
              }
            }, 1800);

            break;
          }
        }
      };

      rec.onerror = (event: any) => {
        const error = event?.error;
        if (error === "not-allowed" || error === "service-not-allowed") {
          this.shouldRestart = false;
          this.setStatus("permission_blocked");
          this.isListening = false;
        } else if (error === "no-speech" || error === "aborted" || error === "network") {
          // Normal transient pause / silence in speech recognition
        }
      };

      rec.onend = () => {
        const runDuration = Date.now() - this.lastStartTime;
        this.isListening = false;
        this.recognition = null;

        if (this.shouldRestart && this.isEnabled && !this.isPausedForActiveInput && !this.isMutedForPlayback) {
          // Anti-flapping: If the browser dropped within 2.5s, back off quietly to avoid hardware clicking
          const restartDelay = runDuration < 2500 ? 3500 : 1800;
          this.restartTimeout = setTimeout(() => {
            if (this.shouldRestart && this.isEnabled && !this.isPausedForActiveInput && !this.isMutedForPlayback) {
              this.initRecognition();
            }
          }, restartDelay);
        } else if (!this.isPausedForActiveInput) {
          this.setStatus("inactive");
        }
      };

      rec.start();
      this.recognition = rec;
    } catch (err: any) {
      console.warn("SpeechRecognition init info:", err?.message || err);
      if (this.shouldRestart && this.isEnabled && !this.isPausedForActiveInput) {
        this.restartTimeout = setTimeout(() => {
          this.initRecognition();
        }, 3000);
      }
    }
  }
}

export const wakeWordDetector = KiaWakeWordDetector.getInstance();
