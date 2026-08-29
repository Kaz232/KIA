// Audio helper utility for GAG Core UI feedback & Gemini TTS Playback
import { wakeWordDetector } from "./wakeWordDetector";

let audioCtx: AudioContext | null = null;
let currentTtsSource: AudioBufferSourceNode | null = null;
let isCurrentlySpeaking = false;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
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

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.35);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "success" || type === "execute") {
      // Elegant gold chime chord
      const freqs = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(volume * 0.2, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.5);
      });
    } else if (type === "notification" || type === "action") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      gain.gain.setValueAtTime(volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "warning") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(260, now + 0.1);
      gain.gain.setValueAtTime(volume * 0.3, now);
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
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Natural voice output with dual-engine fallback (Instant Browser SpeechSynthesis vs Gemini Neural Studio TTS)
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

  // Extract a readable portion (up to 480 chars) for responsive conversational feel
  const voiceSnippet = clean.length > 500 ? clean.slice(0, 480) + "..." : clean;

  // 1. Instant Browser SpeechSynthesis (0ms latency, starts speaking immediately without network wait)
  if (engine === "instant_browser" || engine === "auto") {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voiceSnippet);
        utterance.lang = voiceName === "Aoede" || voiceName === "Fenrir" ? "pt-PT" : "pt-PT";
        utterance.rate = 1.08;
        utterance.pitch = 1.0;

        const selectAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          const ptVoice = voices.find(
            (v) =>
              v.lang.startsWith("pt") ||
              v.name.toLowerCase().includes("portuguese") ||
              v.name.toLowerCase().includes("maria") ||
              v.name.toLowerCase().includes("joana") ||
              v.name.toLowerCase().includes("helena") ||
              v.name.toLowerCase().includes("luciana")
          );
          if (ptVoice) {
            utterance.voice = ptVoice;
          }

          utterance.onstart = () => {
            try {
              wakeWordDetector.setMutedForPlayback(true);
            } catch {}
          };
          utterance.onend = () => {
            isCurrentlySpeaking = false;
            try {
              wakeWordDetector.setMutedForPlayback(false);
            } catch {}
            onEnd?.();
          };
          utterance.onerror = (e) => {
            isCurrentlySpeaking = false;
            try {
              wakeWordDetector.setMutedForPlayback(false);
            } catch {}
            onError?.(e);
            onEnd?.();
          };

          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          selectAndSpeak();
          return;
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            selectAndSpeak();
          };
          // In case voiceschanged doesn't trigger immediately:
          setTimeout(() => {
            if (isCurrentlySpeaking && !window.speechSynthesis.speaking) {
              selectAndSpeak();
            }
          }, 50);
          return;
        }
      }
    } catch (err) {
      console.warn("Browser SpeechSynthesis fallback triggered:", err);
    }
  }

  // 2. Gemini Neural Studio TTS endpoint (High-fidelity 24kHz audio)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
    console.warn("Gemini Studio TTS unavailable, falling back to instant browser speech:", err);
  }

  // 3. Ultimate Fallback to Browser SpeechSynthesis
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceSnippet);
      utterance.lang = "pt-PT";
      utterance.rate = 1.05;
      utterance.onstart = () => {
        try {
          wakeWordDetector.setMutedForPlayback(true);
        } catch {}
      };
      utterance.onend = () => {
        isCurrentlySpeaking = false;
        try {
          wakeWordDetector.setMutedForPlayback(false);
        } catch {}
        onEnd?.();
      };
      utterance.onerror = (e) => {
        isCurrentlySpeaking = false;
        try {
          wakeWordDetector.setMutedForPlayback(false);
        } catch {}
        onError?.(e);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
      return;
    }
  } catch (err) {
    console.error("All voice engines failed:", err);
    onError?.(err);
  }

  isCurrentlySpeaking = false;
  onEnd?.();
}

