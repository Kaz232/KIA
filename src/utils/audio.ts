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

  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit signed PCM
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
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
  return text
    .replace(/```[\s\S]*?```/g, "bloco de código omitido.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[*#_~>]/g, "")
    .replace(/\bAOA\b/g, "Kwanzas")
    .replace(/\bKz\b/g, "Kwanzas")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Split text into natural conversational sentence chunks to bypass browser utterance limits
function splitIntoSpokenChunks(text: string, maxChunkLength = 160): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).trim().length <= maxChunkLength) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxChunkLength) {
        // Subdivide long clauses by commas
        const subParts = trimmed.split(/,\s*/);
        let subCurrent = "";
        for (const sub of subParts) {
          if ((subCurrent + ", " + sub).length <= maxChunkLength) {
            subCurrent = subCurrent ? `${subCurrent}, ${sub}` : sub;
          } else {
            if (subCurrent) chunks.push(subCurrent);
            subCurrent = sub;
          }
        }
        if (subCurrent) current = subCurrent;
        else current = "";
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
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
  const { voiceName = "Kore", engine = "instant_browser", onStart, onEnd, onError } = options;
  const clean = sanitizeForVoice(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopTtsAudio();
  isCurrentlySpeaking = true;
  onStart?.();

  // Limit to reasonable conversational snippet (up to 450 chars) to prevent speech fatigue
  const voiceSnippet = clean.length > 500 ? clean.slice(0, 480) + "..." : clean;
  const chunks = splitIntoSpokenChunks(voiceSnippet);

  // 1. Instant Browser SpeechSynthesis with sequential chunk playback
  if (engine === "instant_browser" || engine === "auto") {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        wakeWordDetector.setMutedForPlayback(true);

        // Keep-alive watchdog for Chrome SpeechSynthesis 14s bug
        if (chromeKeepAliveInterval) clearInterval(chromeKeepAliveInterval);
        chromeKeepAliveInterval = setInterval(() => {
          if (isCurrentlySpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 8000);

        let chunkIndex = 0;

        const speakNextChunk = () => {
          if (!isCurrentlySpeaking || chunkIndex >= chunks.length) {
            stopTtsAudio();
            onEnd?.();
            return;
          }

          const currentText = chunks[chunkIndex];
          chunkIndex++;

          const utterance = new SpeechSynthesisUtterance(currentText);
          utterance.lang = "pt-PT";
          utterance.rate = 1.08;
          utterance.pitch = 1.0;

          const voice = getBestPortugueseVoice();
          if (voice) {
            utterance.voice = voice;
          }

          utterance.onend = () => {
            if (chunkIndex < chunks.length && isCurrentlySpeaking) {
              setTimeout(speakNextChunk, 30);
            } else {
              stopTtsAudio();
              onEnd?.();
            }
          };

          utterance.onerror = (e) => {
            console.debug("Speech synthesis chunk event:", e);
            if (chunkIndex < chunks.length && isCurrentlySpeaking) {
              speakNextChunk();
            } else {
              stopTtsAudio();
              onEnd?.();
            }
          };

          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          speakNextChunk();
          return;
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            speakNextChunk();
          };
          setTimeout(() => {
            if (isCurrentlySpeaking && !window.speechSynthesis.speaking) {
              speakNextChunk();
            }
          }, 60);
          return;
        }
      } catch (err) {
        console.warn("Browser SpeechSynthesis error, attempting fallback:", err);
      }
    }
  }

  // 2. Gemini Neural Studio TTS endpoint fallback (24kHz audio)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: voiceSnippet,
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
    }
  } catch (err) {
    console.warn("Gemini Studio TTS failed:", err);
  }

  // 3. Final safety resolve
  stopTtsAudio();
  onEnd?.();
}
