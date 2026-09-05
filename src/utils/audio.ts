// Audio helper utility for GAG Core OS & KIA Voice Engine (Zero-Latency Dual-Engine TTS & SFX)
import { wakeWordDetector } from "./wakeWordDetector";

let audioCtx: AudioContext | null = null;
let currentTtsSource: AudioBufferSourceNode | null = null;
let isCurrentlySpeaking = false;
let chromeKeepAliveInterval: any = null;

// Ensure AudioContext is unlocked by user interaction
export function getAudioContext(): AudioContext {
  if (!audioCtx && typeof window !== "undefined") {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx!;
}

// Global user gesture unlocker for browser autoplay policies
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    // Also unlock SpeechSynthesis in Chrome/Safari
    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };
  window.addEventListener("click", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
}

export function playSfx(
  type:
    | "success"
    | "action"
    | "click"
    | "notification"
    | "warning"
    | "execute"
    | "wake_activation"
    | "tamagotchi_happy"
    | "tamagotchi_love"
    | "tamagotchi_pop"
    | "auto_send",
  volume = 0.3
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "auto_send") {
      // Futuristic swift whoosh & confirmation pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "tamagotchi_happy") {
      // Playful rising 3-note arcade chord (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(volume * 0.25, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } else if (type === "tamagotchi_love") {
      // Warm sparkling bell chord (A5 -> C#6 -> E6)
      const freqs = [880.0, 1108.73, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(volume * 0.28, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } else if (type === "tamagotchi_pop") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      gain.gain.setValueAtTime(volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "wake_activation") {
      // Futuristic two-tone rising chime (Jarvis / Alexa style)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5
      osc2.frequency.setValueAtTime(880.0, now + 0.08); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6
      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.26);
    } else if (type === "success") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "action" || type === "execute") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.linearRampToValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
      gain.gain.setValueAtTime(volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "warning") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.debug("Audio play skipped:", e);
  }
}

export function stopTtsAudio() {
  isCurrentlySpeaking = false;
  if (chromeKeepAliveInterval) {
    clearInterval(chromeKeepAliveInterval);
    chromeKeepAliveInterval = null;
  }
  try {
    wakeWordDetector.setMutedForPlayback(false);
  } catch {}
  if (currentTtsSource) {
    try {
      currentTtsSource.stop();
      currentTtsSource.disconnect();
    } catch {}
    currentTtsSource = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function getIsSpeaking(): boolean {
  return isCurrentlySpeaking;
}

// Convert base64 PCM 24kHz audio from Gemini TTS into playable AudioBuffer
export async function playPcmAudio(base64Data: string, sampleRate = 24000): Promise<void> {
  stopTtsAudio();
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {}
  }

  const binaryString = atob(base64Data);
  const len = binaryString.length;
  // Ensure even number of bytes for 16-bit PCM
  const pcmBytesCount = Math.floor(len / 2) * 2;
  const buffer = new ArrayBuffer(pcmBytesCount);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < pcmBytesCount; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit signed PCM little-endian
  const dataView = new DataView(buffer);
  const samplesCount = pcmBytesCount / 2;
  const float32Array = new Float32Array(samplesCount);
  for (let i = 0; i < samplesCount; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32Array[i] = int16 / 32768;
  }

  const audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.copyToChannel(float32Array, 0);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  currentTtsSource = source;
  isCurrentlySpeaking = true;

  return new Promise((resolve) => {
    wakeWordDetector.setMutedForPlayback(true);
    source.onended = () => {
      if (currentTtsSource === source) {
        currentTtsSource = null;
        isCurrentlySpeaking = false;
        try {
          wakeWordDetector.setMutedForPlayback(false);
        } catch {}
      }
      resolve();
    };
    source.start(0);
  });
}

// Clean markdown text for fluid spoken audio output
export function sanitizeForVoice(text: string): string {
  if (!text) return "";
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "bloco de código omitido.")
    .replace(/`([^`]+)`/g, "$1")
    // Replace markdown links with their text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    // Natural spoken numbers with thousands ("180.000" -> "180 mil")
    .replace(/(\d+)\.000\.000/g, "$1 milhões")
    .replace(/(\d+)\.(\d{3})\.000/g, "$1 milhões e $2 mil")
    .replace(/(\d+)\.000/g, "$1 mil")
    // Numbered lists into spoken pauses ("1. " -> "1, ")
    .replace(/(\d+)\.\s+/g, "$1, ")
    // Normalize currencies
    .replace(/\bAOA\b/gi, "Kwanzas")
    .replace(/\bKz\b/gi, "Kwanzas")
    // Strip markdown symbols
    .replace(/[*#_~>]/g, "")
    // Turn bullet markers into natural pauses
    .replace(/^[\s•\-–—]+\s*/gm, "")
    // Turn semicolons into commas for natural rhythm
    .replace(/;\s*/g, ", ")
    // Turn newlines into periods for clean sentence breaks
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Split text into natural conversational sentence chunks to bypass browser utterance limits and Chrome 14s timeout
function splitIntoSpokenChunks(text: string, maxChunkLength = 160): string[] {
  if (!text) return [];
  // Split on sentence terminators (. ! ?)
  const rawSentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((current ? `${current} ${trimmed}` : trimmed).length <= maxChunkLength) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);

      if (trimmed.length > maxChunkLength) {
        // Break long sentence by commas or clauses
        const subParts = trimmed.split(/(?<=[,;:])\s+/);
        let subCurrent = "";
        for (const sub of subParts) {
          if ((subCurrent ? `${subCurrent} ${sub}` : sub).length <= maxChunkLength) {
            subCurrent = subCurrent ? `${subCurrent} ${sub}` : sub;
          } else {
            if (subCurrent) chunks.push(subCurrent);
            subCurrent = sub;
          }
        }
        current = subCurrent;
      } else {
        current = trimmed;
      }
    }
  }

  if (current && current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.trim().length > 0);
}

// Find best Portuguese voice available in browser
function getBestPortugueseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. PT-PT (Portugal)
  const ptPt = voices.find((v) => v.lang === "pt-PT" || v.lang === "pt_PT");
  if (ptPt) return ptPt;

  // 2. High-quality Portuguese named voices (Joana, Maria, Luciana, Raquel, Duarte)
  const namedPt = voices.find((v) => {
    const n = v.name.toLowerCase();
    return (
      (v.lang.startsWith("pt") || n.includes("portuguese")) &&
      (n.includes("natural") || n.includes("google") || n.includes("joana") || n.includes("maria") || n.includes("luciana"))
    );
  });
  if (namedPt) return namedPt;

  // 3. Any Portuguese (PT-BR, etc.)
  const anyPt = voices.find((v) => v.lang.startsWith("pt") || v.name.toLowerCase().includes("portuguese"));
  if (anyPt) return anyPt;

  // 4. Default native voice
  return voices.find((v) => v.default) || voices[0] || null;
}

// Speak text using browser SpeechSynthesis with full chunk completion and GC protection
async function speakViaBrowserSynthesis(
  chunks: string[],
  onEnd?: () => void
): Promise<boolean> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      wakeWordDetector.setMutedForPlayback(true);

      // Keep-alive watchdog for browser pause / sleep bug
      if (chromeKeepAliveInterval) clearInterval(chromeKeepAliveInterval);
      chromeKeepAliveInterval = setInterval(() => {
        if (isCurrentlySpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }
      }, 3000);

      let chunkIndex = 0;

      const speakNextChunk = () => {
        if (!isCurrentlySpeaking || chunkIndex >= chunks.length) {
          stopTtsAudio();
          onEnd?.();
          resolve(true);
          return;
        }

        const currentText = chunks[chunkIndex];
        chunkIndex++;

        const utterance = new SpeechSynthesisUtterance(currentText);
        // CRITICAL: Retain strong global reference to prevent V8 GC from silencing audio mid-sentence
        (window as any).__activeUtterance = utterance;

        utterance.lang = "pt-PT";
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        const voice = getBestPortugueseVoice();
        if (voice) {
          utterance.voice = voice;
          if (voice.lang) utterance.lang = voice.lang;
        }

        utterance.onend = () => {
          (window as any).__activeUtterance = null;
          if (!isCurrentlySpeaking) return;
          if (chunkIndex < chunks.length) {
            // Natural pause between sentences (50ms)
            setTimeout(speakNextChunk, 50);
          } else {
            stopTtsAudio();
            onEnd?.();
            resolve(true);
          }
        };

        utterance.onerror = (e: any) => {
          (window as any).__activeUtterance = null;
          console.debug("Speech synthesis chunk event:", e?.error || e);
          if (!isCurrentlySpeaking) return;
          if (e?.error === "canceled" || e?.error === "interrupted") {
            stopTtsAudio();
            onEnd?.();
            resolve(true);
            return;
          }
          // Continue to next chunk so a single hiccup does not truncate entire speech
          if (chunkIndex < chunks.length) {
            setTimeout(speakNextChunk, 50);
          } else {
            stopTtsAudio();
            onEnd?.();
            resolve(true);
          }
        };

        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speakNextChunk();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speakNextChunk();
        };
        setTimeout(() => {
          if (isCurrentlySpeaking && !window.speechSynthesis.speaking) {
            speakNextChunk();
          }
        }, 80);
      }
    } catch (err) {
      console.warn("Browser SpeechSynthesis error:", err);
      resolve(false);
    }
  });
}

// Server TTS cooldown timestamp (to avoid waiting on 429 quota exhausted)
let serverTtsCooldownUntil = 0;

// Natural voice output with dual-engine fallback & sentence chunking
export async function speakNaturalText(
  text: string,
  options: {
    voiceName?: string;
    engine?: "instant_browser" | "gemini_studio" | "auto";
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): Promise<void> {
  const { voiceName = "Kore", engine = "auto", onStart, onEnd, onError } = options;
  const clean = sanitizeForVoice(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopTtsAudio();
  isCurrentlySpeaking = true;
  onStart?.();

  // Speak the FULL clean text without ANY truncation!
  const chunks = splitIntoSpokenChunks(clean);

  // 1. Try Server Gemini Studio TTS if requested and not in cooldown
  const canAttemptServer = (engine === "gemini_studio" || engine === "auto") && Date.now() > serverTtsCooldownUntil;
  if (canAttemptServer) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: clean,
          voiceName,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          await playPcmAudio(data.audioBase64, data.sampleRate || 24000);
          isCurrentlySpeaking = false;
          onEnd?.();
          return;
        }
      } else {
        // Cooldown for 3 minutes if quota or server error
        serverTtsCooldownUntil = Date.now() + 180000;
      }
    } catch (err) {
      serverTtsCooldownUntil = Date.now() + 180000;
      console.warn("Gemini Studio TTS unavailable, switching to browser synthesis:", err);
    }
  }

  // 2. High-performance Browser SpeechSynthesis speaks all chunks sequentially
  const synthesisSuccess = await speakViaBrowserSynthesis(chunks, onEnd);
  if (synthesisSuccess) return;

  // 3. Final safety resolve
  stopTtsAudio();
  onEnd?.();
}
