import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
  Heart,
  Coffee,
  Gift,
  Zap,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { playSfx } from "../utils/audio";
import { safeStorage } from "../utils/safeStorage";

// Função para disparar a Tool através do gateway do OmniRoute
export async function executarToolViaOmniRoute(toolName: string, toolParams: object) {
  const OMNIROUTE_URL =
    (typeof process !== "undefined" && process.env?.OMNIROUTE_URL) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_OMNIROUTE_URL) ||
    "https://gagomni.onrender.com";
  const OMNIROUTE_KEY =
    typeof process !== "undefined" ? process.env?.OMNIROUTE_API_KEY : undefined;

  try {
    const response = await axios.post(
      `${OMNIROUTE_URL}/api/omniroute/execute-tool`,
      {
        tool: toolName,
        parameters: toolParams,
        agent: "KIA Master",
        context: "GAG Core OS - Luanda",
      },
      {
        headers: {
          ...(OMNIROUTE_KEY ? { Authorization: `Bearer ${OMNIROUTE_KEY}` } : {}),
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10s de timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao executar ${toolName} no OmniRoute:`, error);
    // Fallback de contingência caso o Render esteja a hibernar
    return { status: "fallback", message: "Execução local de contingência ativada." };
  }
}

export type KiaMood =
  | "HAPPY"
  | "LISTENING"
  | "THINKING"
  | "TALKING"
  | "LOVING"
  | "SURPRISED"
  | "RESTING";

export interface KiaTamagotchiFaceProps {
  size?: "sm" | "md" | "lg";
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  isHappy?: boolean;
  onClick?: () => void;
  avgEnergy?: number;
  className?: string;
  showStatusBadge?: boolean;
}

/**
 * Reusable animated Tamagotchi face for KIA.
 * Autonomous blinking, gaze tracking, mood expressions, sound reaction, and aura.
 */
export const KiaTamagotchiFace: React.FC<KiaTamagotchiFaceProps> = ({
  size = "lg",
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  isHappy = false,
  onClick,
  avgEnergy = 0,
  className = "",
  showStatusBadge = false,
}) => {
  const [blinkState, setBlinkState] = useState(false);
  const [lookDirection, setLookDirection] = useState<"center" | "left" | "right">("center");

  // Autonomous eye blinking & natural gaze shift loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 180);
    }, 3600 + Math.random() * 2200);

    const lookInterval = setInterval(() => {
      const dirs: ("center" | "left" | "right")[] = ["center", "center", "left", "right", "center"];
      setLookDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 4500);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
    };
  }, []);

  // Dimensions based on size
  const sizeClasses = {
    sm: "w-11 h-11",
    md: "w-16 h-16",
    lg: "w-28 h-28 sm:w-32 sm:h-32",
  }[size];

  const ringClasses = {
    sm: isListening
      ? "bg-gradient-to-tr from-red-600/40 via-amber-500/30 to-yellow-400/30 border-2 border-red-400 ring-2 ring-red-500/30 scale-105"
      : isThinking
      ? "bg-gradient-to-tr from-amber-600/40 via-yellow-500/30 to-amber-300/30 border-2 border-amber-400 ring-2 ring-amber-500/30 animate-pulse"
      : isSpeaking
      ? "bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-emerald-400/30 border-2 border-yellow-400 ring-2 ring-yellow-400/30 scale-105"
      : isHappy
      ? "bg-gradient-to-tr from-rose-600/30 via-amber-500/30 to-yellow-300/30 border-2 border-rose-400 ring-2 ring-rose-400/20"
      : "bg-gradient-to-tr from-amber-950/80 via-slate-900 to-black border border-amber-500/50 hover:border-amber-400 ring-1 ring-amber-500/10",
    md: isListening
      ? "bg-gradient-to-tr from-red-600/40 via-amber-500/30 to-yellow-400/30 border-2 border-red-400 ring-4 ring-red-500/30 scale-105"
      : isThinking
      ? "bg-gradient-to-tr from-amber-600/40 via-yellow-500/30 to-amber-300/30 border-2 border-amber-400 ring-4 ring-amber-500/30 animate-pulse"
      : isSpeaking
      ? "bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-emerald-400/30 border-2 border-yellow-400 ring-4 ring-yellow-400/30 scale-105"
      : isHappy
      ? "bg-gradient-to-tr from-rose-600/30 via-amber-500/30 to-yellow-300/30 border-2 border-rose-400 ring-4 ring-rose-400/20"
      : "bg-gradient-to-tr from-amber-950/80 via-slate-900 to-black border-2 border-amber-500/50 hover:border-amber-400 ring-2 ring-amber-500/10",
    lg: isListening
      ? "bg-gradient-to-tr from-red-600/40 via-amber-500/30 to-yellow-400/30 border-4 border-red-400 scale-105 ring-8 ring-red-500/20"
      : isThinking
      ? "bg-gradient-to-tr from-amber-600/40 via-yellow-500/30 to-amber-300/30 border-4 border-amber-400 ring-8 ring-amber-500/20 animate-pulse"
      : isSpeaking
      ? "bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-emerald-400/30 border-4 border-yellow-400 ring-8 ring-yellow-400/20 scale-105"
      : isHappy
      ? "bg-gradient-to-tr from-rose-600/30 via-amber-500/30 to-yellow-300/30 border-4 border-rose-400 ring-8 ring-rose-400/20"
      : "bg-gradient-to-tr from-amber-950/80 via-slate-900 to-black border-2 border-amber-500/50 hover:border-amber-400 hover:scale-105 ring-4 ring-amber-500/10",
  }[size];

  const translateX =
    lookDirection === "left"
      ? size === "sm"
        ? "-1.5px"
        : size === "md"
        ? "-2.5px"
        : "-3.5px"
      : lookDirection === "right"
      ? size === "sm"
        ? "1.5px"
        : size === "md"
        ? "2.5px"
        : "3.5px"
      : "0px";

  return (
    <div className={`relative inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
      {/* Outer Holographic Glow Orb */}
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
          onClick ? "cursor-pointer" : ""
        } ${ringClasses}`}
        title={
          isListening
            ? "A escutar em direto... Fala naturalmente!"
            : isThinking
            ? "KIA está a processar o teu pedido..."
            : isSpeaking
            ? "KIA está a falar contigo..."
            : "KIA Tamagotchi (Clica para falar)"
        }
      >
        {/* Live Audio Reactive Frequency Wave Ring */}
        {(isListening || isSpeaking) && size === "lg" && (
          <div
            className="absolute inset-0 rounded-full border-2 border-amber-400/60 animate-ping pointer-events-none"
            style={{
              animationDuration: isListening ? "1.4s" : "1.1s",
              transform: `scale(${1 + (avgEnergy / 100) * 0.25})`,
            }}
          />
        )}

        {/* The Digital Eyes & Mouth Structure */}
        <div className="flex flex-col items-center justify-center pointer-events-none select-none">
          {/* Eyes Row */}
          <div
            className={`flex items-center ${
              size === "sm"
                ? "space-x-2"
                : size === "md"
                ? "space-x-3.5"
                : "space-x-6 sm:space-x-8"
            }`}
          >
            {/* Left Eye */}
            <div
              className={`transition-all duration-150 flex items-center justify-center ${
                blinkState
                  ? size === "sm"
                    ? "w-2 h-0.5 bg-amber-300 rounded-full"
                    : size === "md"
                    ? "w-3 h-0.5 bg-amber-300 rounded-full"
                    : "w-4 sm:w-5 h-0.5 bg-amber-300 rounded-full"
                  : isThinking
                  ? size === "sm"
                    ? "w-2 h-2 rounded-full bg-amber-400 animate-spin border border-dashed border-white"
                    : size === "md"
                    ? "w-3 h-3 rounded-full bg-amber-400 animate-spin border border-dashed border-white"
                    : "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-amber-400 animate-spin border-2 border-dashed border-white"
                  : isSpeaking
                  ? size === "sm"
                    ? "w-2.5 h-3 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-sm shadow-amber-400"
                    : size === "md"
                    ? "w-3.5 h-4 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-md shadow-amber-400"
                    : "w-4 sm:w-5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-lg shadow-amber-400/80"
                  : isListening
                  ? size === "sm"
                    ? "w-2.5 h-2.5 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-sm shadow-red-400"
                    : size === "md"
                    ? "w-3.5 h-3.5 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-md shadow-red-400"
                    : "w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-lg shadow-red-400/80"
                  : isHappy
                  ? size === "sm"
                    ? "w-2 h-1.5 border-t-2 border-amber-300 rounded-t-full"
                    : size === "md"
                    ? "w-3 h-2 border-t-2 border-amber-300 rounded-t-full"
                    : "w-4 sm:w-5 h-2.5 sm:h-3 border-t-2 border-amber-300 rounded-t-full"
                  : size === "sm"
                  ? "w-2 h-2.5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm"
                  : size === "md"
                  ? "w-3 h-3.5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm"
                  : "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-md shadow-amber-400/60"
              }`}
              style={{ transform: `translateX(${translateX})` }}
            >
              {!blinkState && !isThinking && !isHappy && (
                <div
                  className={`rounded-full bg-white self-start ${
                    size === "sm"
                      ? "w-0.5 h-0.5 ml-0.5 mt-0.5"
                      : size === "md"
                      ? "w-1 h-1 ml-0.5 mt-0.5"
                      : "w-1.5 h-1.5 ml-0.5 mt-0.5"
                  }`}
                />
              )}
            </div>

            {/* Right Eye */}
            <div
              className={`transition-all duration-150 flex items-center justify-center ${
                blinkState
                  ? size === "sm"
                    ? "w-2 h-0.5 bg-amber-300 rounded-full"
                    : size === "md"
                    ? "w-3 h-0.5 bg-amber-300 rounded-full"
                    : "w-4 sm:w-5 h-0.5 bg-amber-300 rounded-full"
                  : isThinking
                  ? size === "sm"
                    ? "w-2 h-2 rounded-full bg-amber-400 animate-spin border border-dashed border-white"
                    : size === "md"
                    ? "w-3 h-3 rounded-full bg-amber-400 animate-spin border border-dashed border-white"
                    : "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-amber-400 animate-spin border-2 border-dashed border-white"
                  : isSpeaking
                  ? size === "sm"
                    ? "w-2.5 h-3 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-sm shadow-amber-400"
                    : size === "md"
                    ? "w-3.5 h-4 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-md shadow-amber-400"
                    : "w-4 sm:w-5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-lg shadow-amber-400/80"
                  : isListening
                  ? size === "sm"
                    ? "w-2.5 h-2.5 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-sm shadow-red-400"
                    : size === "md"
                    ? "w-3.5 h-3.5 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-md shadow-red-400"
                    : "w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-lg shadow-red-400/80"
                  : isHappy
                  ? size === "sm"
                    ? "w-2 h-1.5 border-t-2 border-amber-300 rounded-t-full"
                    : size === "md"
                    ? "w-3 h-2 border-t-2 border-amber-300 rounded-t-full"
                    : "w-4 sm:w-5 h-2.5 sm:h-3 border-t-2 border-amber-300 rounded-t-full"
                  : size === "sm"
                  ? "w-2 h-2.5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm"
                  : size === "md"
                  ? "w-3 h-3.5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm"
                  : "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-md shadow-amber-400/60"
              }`}
              style={{ transform: `translateX(${translateX})` }}
            >
              {!blinkState && !isThinking && !isHappy && (
                <div
                  className={`rounded-full bg-white self-start ${
                    size === "sm"
                      ? "w-0.5 h-0.5 ml-0.5 mt-0.5"
                      : size === "md"
                      ? "w-1 h-1 ml-0.5 mt-0.5"
                      : "w-1.5 h-1.5 ml-0.5 mt-0.5"
                  }`}
                />
              )}
            </div>
          </div>

          {/* Rosy Cheek Blush Dots (Subtle Tamagotchi Charm) */}
          <div
            className={`flex items-center justify-between pointer-events-none ${
              size === "sm"
                ? "w-6 h-1 mt-0.5"
                : size === "md"
                ? "w-9 h-1.5 mt-0.5"
                : "w-16 sm:w-18 h-2 mt-1"
            }`}
          >
            <span
              className={`rounded-full bg-rose-400/50 blur-[0.5px] transition-opacity ${
                isHappy ? "opacity-90" : "opacity-40"
              } ${
                size === "sm"
                  ? "w-1 h-0.5"
                  : size === "md"
                  ? "w-1.5 h-1"
                  : "w-2.5 h-1.5"
              }`}
            />
            <span
              className={`rounded-full bg-rose-400/50 blur-[0.5px] transition-opacity ${
                isHappy ? "opacity-90" : "opacity-40"
              } ${
                size === "sm"
                  ? "w-1 h-0.5"
                  : size === "md"
                  ? "w-1.5 h-1"
                  : "w-2.5 h-1.5"
              }`}
            />
          </div>

          {/* Mouth Expression */}
          <div
            className={`flex items-center justify-center ${
              size === "sm"
                ? "h-2 mt-0.5"
                : size === "md"
                ? "h-2.5 mt-0.5"
                : "h-4 mt-1"
            }`}
          >
            {isSpeaking ? (
              <div
                className={`relative flex items-center justify-center overflow-hidden transition-all duration-75 ${
                  size === "sm"
                    ? "w-4 h-2"
                    : size === "md"
                    ? "w-6 h-3"
                    : "w-8 sm:w-10 h-4 sm:h-5"
                }`}
                style={{
                  transform: `scaleY(${1 + Math.min(1.4, (avgEnergy / 100) * 1.5)})`,
                }}
              >
                {/* Lábio Superior com movimento dinâmico */}
                <div className="absolute top-0 w-full border-t-2 border-amber-300 rounded-t-full shadow-[0_-1px_4px_rgba(251,191,36,0.9)] animate-kiaUpperLip" />
                {/* Abertura Oral com movimento articulado de lábios/fala */}
                <div className="w-full h-full bg-gradient-to-b from-amber-950 via-[#2a1705] to-black rounded-full border border-amber-400/50 shadow-[inset_0_0_6px_rgba(245,158,11,0.6)] animate-kiaLipMovement flex items-center justify-center">
                  <div className="w-2/5 h-2/5 rounded-full bg-amber-400/90 blur-[0.5px] animate-pulse" />
                </div>
                {/* Lábio Inferior com movimento dinâmico */}
                <div className="absolute bottom-0 w-full border-b-2 border-amber-300 rounded-b-full shadow-[0_1px_4px_rgba(251,191,36,0.9)] animate-kiaLowerLip" />
              </div>
            ) : isListening ? (
              <div className="flex items-center space-x-0.5">
                <span
                  className={`bg-red-400 rounded-full animate-ping ${
                    size === "sm"
                      ? "w-0.5 h-1"
                      : size === "md"
                      ? "w-0.5 h-1.5"
                      : "w-1 h-2"
                  }`}
                />
                <span
                  className={`bg-amber-300 rounded-full animate-pulse ${
                    size === "sm"
                      ? "w-1 h-1.5"
                      : size === "md"
                      ? "w-1 h-2"
                      : "w-1.5 h-3"
                  }`}
                />
                <span
                  className={`bg-red-400 rounded-full animate-ping ${
                    size === "sm"
                      ? "w-0.5 h-1"
                      : size === "md"
                      ? "w-0.5 h-1.5"
                      : "w-1 h-2"
                  }`}
                />
              </div>
            ) : isThinking ? (
              <div
                className={`rounded-full bg-amber-300 animate-ping ${
                  size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : "w-2 h-2"
                }`}
              />
            ) : isHappy ? (
              <div
                className={`border-b-2 border-amber-300 rounded-b-full shadow-sm ${
                  size === "sm"
                    ? "w-3 h-1.5"
                    : size === "md"
                    ? "w-4 h-2"
                    : "w-6 h-2.5"
                }`}
              />
            ) : (
              <div
                className={`border-b-2 border-amber-300/90 rounded-b-full shadow-sm ${
                  size === "sm"
                    ? "w-2.5 h-1"
                    : size === "md"
                    ? "w-3.5 h-1.5"
                    : "w-5 h-2"
                }`}
              />
            )}
          </div>
        </div>

        {/* Live Operational Status Indicator Dot */}
        {showStatusBadge && (
          <span
            className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-950 ${
              size === "sm"
                ? "w-2.5 h-2.5"
                : size === "md"
                ? "w-3 h-3"
                : "w-4 h-4"
            } ${
              isListening
                ? "bg-red-500 animate-ping"
                : isThinking
                ? "bg-amber-400 animate-spin"
                : isSpeaking
                ? "bg-emerald-400 animate-bounce"
                : "bg-emerald-400"
            }`}
          />
        )}
      </div>
    </div>
  );
};

interface KiaTamagotchiCompanionProps {
  isCompact?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  liveTranscript?: string;
  isSilenceCountdown?: boolean;
  audioLevels?: number[];
  onStartListening?: () => void;
  onStopListening?: () => void;
  onSendMessage?: (text: string) => void;
  userName?: string;
  storageKey?: string;
}

export const KiaTamagotchiCompanion: React.FC<KiaTamagotchiCompanionProps> = ({
  isCompact,
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  liveTranscript = "",
  isSilenceCountdown = false,
  audioLevels = [],
  onStartListening,
  onStopListening,
  onSendMessage,
  userName = "Josemar",
  storageKey = "gag_kia_tamagotchi_collapsed",
}) => {
  // Collapse/minimize state with persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof isCompact === "boolean") return isCompact;
    const saved = safeStorage.getItem(storageKey);
    return saved === "true";
  });

  useEffect(() => {
    if (typeof isCompact === "boolean") {
      setIsCollapsed(isCompact);
    }
  }, [isCompact]);

  // Tamagotchi internal state persisted in storage
  const [affinity, setAffinity] = useState<number>(() => {
    const saved = safeStorage.getItem("gag_kia_affinity");
    return saved ? Math.min(100, Math.max(20, parseInt(saved, 10))) : 88;
  });

  const [energy, setEnergy] = useState<number>(() => {
    const saved = safeStorage.getItem("gag_kia_energy");
    return saved ? Math.min(100, Math.max(30, parseInt(saved, 10))) : 95;
  });

  const [level, setLevel] = useState<number>(() => {
    const saved = safeStorage.getItem("gag_kia_level");
    return saved ? parseInt(saved, 10) : 7;
  });

  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [floatingSparks, setFloatingSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [companionQuote, setCompanionQuote] = useState<string>("");
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [isHappyReaction, setIsHappyReaction] = useState(false);

  // Save to storage
  useEffect(() => {
    safeStorage.setItem("gag_kia_affinity", affinity.toString());
  }, [affinity]);

  useEffect(() => {
    safeStorage.setItem("gag_kia_energy", energy.toString());
  }, [energy]);

  useEffect(() => {
    safeStorage.setItem("gag_kia_level", level.toString());
  }, [level]);

  // Compute average mic energy for audio reaction
  const avgEnergy = audioLevels.length
    ? Math.round(audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length)
    : 0;

  // Show a temporary spontaneous companion bubble
  const showBubbleQuote = (text: string, duration = 4500) => {
    setCompanionQuote(text);
    setQuoteVisible(true);
    setTimeout(() => {
      setQuoteVisible(false);
    }, duration);
  };

  // Tamagotchi Action: Pet / Carinho
  const handlePet = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left - 10,
      y: e.clientY - rect.top - 20,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);

    setIsHappyReaction(true);
    setTimeout(() => setIsHappyReaction(false), 2500);

    playSfx("tamagotchi_love", 0.4);
    setAffinity((prev) => Math.min(100, prev + 3));
    if (affinity + 3 >= 100 && level < 20) {
      setLevel((prev) => prev + 1);
      playSfx("tamagotchi_happy", 0.5);
      showBubbleQuote(`🎉 Subiste para Nível ${level + 1} de Afinidade com a KIA!`, 5000);
      return;
    }

    const petPhrases = [
      `Amo trabalhar contigo, ${userName}! Vamos com tudo! 💖`,
      `Obrigada pelo carinho! A minha calibração executiva está a 100%! ✨`,
      `Sinto que somos uma dupla imbatível na gestão da GAG! 🚀`,
      `Adoro a nossa sintonia! O que vamos conquistar a seguir? 😊`,
    ];
    showBubbleQuote(petPhrases[Math.floor(Math.random() * petPhrases.length)]);
  };

  // Tamagotchi Action: Feed / Café Energético
  const handleFeed = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newSpark = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left - 10,
      y: e.clientY - rect.top - 20,
    };
    setFloatingSparks((prev) => [...prev, newSpark]);
    setTimeout(() => {
      setFloatingSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1200);

    setIsHappyReaction(true);
    setTimeout(() => setIsHappyReaction(false), 2000);

    playSfx("tamagotchi_pop", 0.35);
    setEnergy(100);
    setAffinity((prev) => Math.min(100, prev + 1));

    const feedPhrases = [
      `⚡ Café executivo recebido! Processador Gemini Flash acelerado ao máximo!`,
      `☕ Hmm, revigorante! Todos os agentes operacionais estão em alta frequência!`,
      `✨ Bateria recarregada! Estou pronta para escanear qualquer documento ou criar tarefas!`,
    ];
    showBubbleQuote(feedPhrases[Math.floor(Math.random() * feedPhrases.length)]);
  };

  // Tamagotchi Action: Surpresa do Dia
  const handleSurprise = () => {
    playSfx("tamagotchi_happy", 0.4);
    setAffinity((prev) => Math.min(100, prev + 2));
    setIsHappyReaction(true);
    setTimeout(() => setIsHappyReaction(false), 2000);

    const surprises = [
      `💡 Dica de Ouro: Podes falar comandos com a KIA e delegar ordens executivas aos agentes com 50% de sinal garantido!`,
      `🎯 Sabias que na Fábrica de Agentes podes desenhar novos agentes para qualquer tarefa específica da tua empresa?`,
      `✨ Lembrete executivo: O segredo da alta produtividade na GAG é delegar tarefas rotineiras e focar na direção estratégica!`,
      `🚀 "A excelência não é um ato, mas um hábito." — Vamos liderar o mercado em Luanda, ${userName}!`,
    ];
    const picked = surprises[Math.floor(Math.random() * surprises.length)];
    showBubbleQuote(picked, 6500);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#0c101d] via-[#10172b] to-[#0a0d18] border-2 border-amber-500/40 p-3 sm:p-4 shadow-2xl shadow-amber-500/10 mb-3 overflow-hidden select-none transition-all">
      {/* Background Animated Circuits & Halo Glow */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening
            ? "bg-red-500/20 scale-125"
            : isThinking
            ? "bg-amber-400/25 animate-pulse scale-110"
            : isSpeaking
            ? "bg-yellow-400/30 scale-125"
            : isHappyReaction
            ? "bg-rose-500/25 scale-125"
            : "bg-amber-500/10"
        }`}
      />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Hearts & Sparks */}
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          className="absolute z-50 text-xl pointer-events-none animate-floatUp"
          style={{ left: h.x, top: h.y }}
        >
          💖
        </span>
      ))}
      {floatingSparks.map((s) => (
        <span
          key={s.id}
          className="absolute z-50 text-xl pointer-events-none animate-floatUp"
          style={{ left: s.x, top: s.y }}
        >
          ⚡
        </span>
      ))}

      {/* Header bar: Identity + Level + Affinity & Energy Meters + Minimize Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-amber-500/20">
        <div className="flex items-center space-x-3">
          {/* Animated Status Pulse */}
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${
                isListening
                  ? "bg-red-500 animate-ping"
                  : isThinking
                  ? "bg-amber-400 animate-pulse"
                  : isSpeaking
                  ? "bg-emerald-400 animate-bounce"
                  : "bg-amber-400"
              }`}
            />
            <span
              className={`absolute w-3 h-3 rounded-full ${
                isListening
                  ? "bg-red-500"
                  : isThinking
                  ? "bg-amber-400"
                  : isSpeaking
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                KIA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 font-bold border border-amber-500/40">
                ✨ Companheira IA &middot; Nível {level}
              </span>
            </div>
            <p className="text-[11px] text-amber-400/80 font-medium">
              {isListening
                ? "🎙️ A ouvir em tempo real — Fala livremente..."
                : isThinking
                ? "💭 A raciocinar e estruturar resposta com IA..."
                : isSpeaking
                ? "🗣️ A falar contigo por voz..."
                : isHappyReaction
                ? "💖 Calibração executiva e sintonia máxima!"
                : `Amiga executiva de ${userName} &middot; Luanda OS`}
            </p>
          </div>
        </div>

        {/* Tamagotchi Meters (Afinidade & Energia) + Collapse Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-3 bg-black/40 px-3 py-1.5 rounded-2xl border border-slate-800">
            {/* Afinidade */}
            <div className="flex items-center space-x-1.5" title="Nível de Afinidade & Sintonia">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/80 animate-pulse" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold gap-1">
                  <span className="hidden sm:inline">Afinidade:</span>
                  <span className="text-rose-300 font-bold">{affinity}%</span>
                </div>
                <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${affinity}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Energia */}
            <div className="flex items-center space-x-1.5" title="Energia Operacional do Núcleo">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/80" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold gap-1">
                  <span className="hidden sm:inline">Energia:</span>
                  <span className="text-amber-300 font-bold">{energy}%</span>
                </div>
                <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                    style={{ width: `${energy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Minimize / Expand Console Toggle Button */}
          <button
            onClick={() => {
              const next = !isCollapsed;
              setIsCollapsed(next);
              safeStorage.setItem(storageKey, String(next));
              playSfx("click");
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm"
            title={isCollapsed ? "Expandir Painel Visual da KIA" : "Minimizar Painel"}
          >
            {isCollapsed ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Expandir</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Compactar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interaction Stage (Expanded or Compact) */}
      {!isCollapsed ? (
        <div className="py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: The Large Animated Tamagotchi Face */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <KiaTamagotchiFace
              size="lg"
              isListening={isListening}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              isHappy={isHappyReaction}
              avgEnergy={avgEnergy}
              onClick={isListening ? onStopListening : onStartListening}
            />

            {/* Sub-label under Face */}
            <span className="mt-2 text-[11px] font-bold text-amber-300 flex items-center space-x-1">
              <span>
                {isListening
                  ? "🔴 A Escutar..."
                  : isThinking
                  ? "⚡ A Pensar..."
                  : isSpeaking
                  ? "🔊 A Falar..."
                  : isHappyReaction
                  ? "💖 Feliz!"
                  : "✨ Toca para Falar"}
              </span>
            </span>
          </div>

          {/* Center: Live Spoken Speech Bubble + Status */}
          <div className="flex-1 w-full bg-black/60 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-h-[100px]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>
                  {isListening
                    ? "🎙️ Transcrição em Direto (Mãos-Livres):"
                    : isThinking
                    ? "🧠 Processamento IA Executivo:"
                    : quoteVisible
                    ? "💬 Mensagem da KIA:"
                    : "💬 Assistente Executiva Ativa:"}
                </span>
              </div>

              {/* Zero-Clicks VAD Active Pill */}
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 border transition-all ${
                  isSilenceCountdown
                    ? "bg-amber-500 text-black border-amber-300 animate-pulse"
                    : isListening
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>
                  {isSilenceCountdown
                    ? "⚡ A Enviar..."
                    : isListening
                    ? "Auto-Envio ao Pausar"
                    : "100% Mãos-Livres"}
                </span>
              </div>
            </div>

            {/* Bubble Content Body */}
            <div className="py-1 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              {liveTranscript ? (
                <p className="text-amber-200 font-semibold">
                  <span className="text-slate-400 font-normal">Tu disseste: </span>"{liveTranscript}"
                  <span className="inline-block w-2 h-3.5 bg-amber-400 ml-1 animate-pulse align-middle rounded-sm" />
                </p>
              ) : quoteVisible ? (
                <p className="text-amber-300 font-medium italic animate-fadeIn">"{companionQuote}"</p>
              ) : isListening ? (
                <p className="text-slate-300 italic flex items-center space-x-2">
                  <span className="text-red-400 font-bold">🎙️ Pode falar:</span>
                  <span>"KIA, cria uma tarefa...", "Faz um resumo", "Qual o estado dos projetos?"</span>
                </p>
              ) : (
                <p className="text-slate-400 text-xs sm:text-sm">
                  Olá! Estou pronta para te apoiar na liderança da GAG Visual. Podes falar comigo por voz clicando no meu rosto ou escrever diretamente abaixo.
                </p>
              )}
            </div>

            {/* Frequency Bars when listening */}
            {isListening && audioLevels.length > 0 && (
              <div className="flex items-center space-x-1 h-2.5 pt-1.5">
                {audioLevels.slice(0, 24).map((lvl, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-full bg-gradient-to-t from-red-500 via-amber-400 to-yellow-300 transition-all duration-75"
                    style={{ height: `${Math.max(20, lvl)}%` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Tactile Care Actions (Pet, Coffee, Surprise) */}
          <div className="grid grid-cols-3 md:grid-cols-1 gap-2 w-full md:w-auto shrink-0">
            {/* Action 1: Fazer Carinho */}
            <button
              onClick={handlePet}
              className="px-3 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center md:justify-start space-x-2 transition-all active:scale-95 shadow-sm group"
              title="Dar carinho à KIA (+Afinidade)"
            >
              <Heart className="w-4 h-4 text-rose-400 group-hover:scale-125 transition-transform fill-rose-400/40" />
              <span className="hidden sm:inline">Fazer Carinho</span>
            </button>

            {/* Action 2: Dar Café Energético */}
            <button
              onClick={handleFeed}
              className="px-3 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold flex items-center justify-center md:justify-start space-x-2 transition-all active:scale-95 shadow-sm group"
              title="Recarregar Energia Operacional da KIA"
            >
              <Coffee className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Dar Café</span>
            </button>

            {/* Action 3: Surpresa do Dia */}
            <button
              onClick={handleSurprise}
              className="px-3 py-2 rounded-2xl bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/40 text-yellow-300 hover:text-white text-xs font-bold flex items-center justify-center md:justify-start space-x-2 transition-all active:scale-95 shadow-sm group"
              title="Dica de Ouro & Surpresa Executiva"
            >
              <Gift className="w-4 h-4 text-yellow-400 group-hover:scale-125 transition-transform" />
              <span className="hidden sm:inline">Surpresa</span>
            </button>
          </div>
        </div>
      ) : (
        /* Compact Mode: Tamagotchi Mini Face ALWAYS visible and animated! */
        <div className="pt-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <KiaTamagotchiFace
              size="sm"
              isListening={isListening}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              isHappy={isHappyReaction}
              onClick={isListening ? onStopListening : onStartListening}
            />
            <div
              onClick={isListening ? onStopListening : onStartListening}
              className={`cursor-pointer px-2.5 py-1 rounded-xl border transition-all ${
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                  : isThinking
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse"
                  : isSpeaking
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40 text-slate-300"
              }`}
            >
              <span className="font-bold text-[11px]">
                {isListening
                  ? "🔴 A Ouvir..."
                  : isThinking
                  ? "⚡ A Processar..."
                  : isSpeaking
                  ? "🔊 A Falar..."
                  : "🎙️ Toca para Falar"}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 truncate text-slate-400 text-xs px-2">
            {liveTranscript ? (
              <span className="text-amber-300 font-medium">"{liveTranscript}"</span>
            ) : isListening ? (
              <span className="text-red-300 italic">A escutar... Auto-envio ao pausar</span>
            ) : quoteVisible ? (
              <span className="text-amber-300 italic">"{companionQuote}"</span>
            ) : (
              <span className="text-slate-400">KIA Tamagotchi Ativa &bull; Mãos-livres</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handlePet}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-90"
              title="Carinho"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={handleFeed}
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all active:scale-90"
              title="Café"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSurprise}
              className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition-all active:scale-90"
              title="Surpresa"
            >
              <Gift className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
