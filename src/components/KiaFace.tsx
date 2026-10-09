import React, { useState, useEffect } from "react";
import { Sparkles, Heart, Zap, AlertCircle } from "lucide-react";
import { playSfx } from "../utils/audio";

export type KiaFaceState =
  | "idle"
  | "thinking"
  | "active"
  | "error"
  | "listening"
  | "speaking"
  | "happy";

export interface KiaFaceProps {
  state?: KiaFaceState;
  status?: KiaFaceState;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  showStatusText?: boolean;
  statusText?: string;
  energyLevel?: number;
}

/**
 * Reusable animated Tamagotchi-style face for the KIA agent.
 * Powered by CSS keyframes and responsive to states: idle, thinking, active, error.
 */
export const KiaFace: React.FC<KiaFaceProps> = ({
  state = "idle",
  status,
  size = "md",
  className = "",
  onClick,
  interactive = true,
  showStatusText = false,
  statusText,
  energyLevel = 90,
}) => {
  const [internalHappy, setInternalHappy] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Map state variations to standardized categories (supports both status and state)
  const resolvedState = status || state || "idle";
  const effectiveState: KiaFaceState = internalHappy
    ? "happy"
    : resolvedState;

  const isThinking = effectiveState === "thinking";
  const isSpeaking = effectiveState === "speaking";
  const isListening = effectiveState === "listening";
  const isActive = effectiveState === "active" || isListening || isSpeaking;
  const isError = effectiveState === "error";
  const isHappy = effectiveState === "happy";
  const isIdle = effectiveState === "idle";

  // Size dimensions
  const dimensions = {
    sm: {
      box: "w-11 h-11",
      eyeSize: "w-2.5 h-3",
      eyeSpacing: "space-x-2.5",
      pupilSize: "w-1 h-1",
      mouthWidth: "w-3 h-1.5",
      blushWidth: "w-6",
      blushDot: "w-1 h-0.5",
    },
    md: {
      box: "w-16 h-16",
      eyeSize: "w-3.5 h-4",
      eyeSpacing: "space-x-3.5",
      pupilSize: "w-1.5 h-1.5",
      mouthWidth: "w-4 h-2",
      blushWidth: "w-9",
      blushDot: "w-1.5 h-1",
    },
    lg: {
      box: "w-28 h-28 sm:w-32 sm:h-32",
      eyeSize: "w-5 sm:w-6 h-6 sm:h-7",
      eyeSpacing: "space-x-6 sm:space-x-8",
      pupilSize: "w-2 h-2",
      mouthWidth: "w-6 sm:w-7 h-3",
      blushWidth: "w-16 sm:w-20",
      blushDot: "w-2.5 h-1.5",
    },
    xl: {
      box: "w-36 h-36 sm:w-44 sm:h-44",
      eyeSize: "w-7 sm:w-8 h-8 sm:h-9",
      eyeSpacing: "space-x-8 sm:space-x-10",
      pupilSize: "w-2.5 h-2.5",
      mouthWidth: "w-8 sm:w-10 h-4",
      blushWidth: "w-22 sm:w-26",
      blushDot: "w-3 h-2",
    },
  }[size];

  // Outer ring & aura styling based on state
  const ringAuraClasses = isError
    ? "bg-gradient-to-tr from-rose-950/90 via-red-900/60 to-black border-2 border-rose-500 shadow-rose-500/40 animate-kiaGlitch ring-4 ring-rose-500/25"
    : isThinking
    ? "bg-gradient-to-tr from-amber-950/80 via-yellow-900/40 to-black border-2 border-amber-400 shadow-amber-500/30 ring-4 ring-amber-400/25 animate-pulse"
    : isActive
    ? "bg-gradient-to-tr from-amber-950/90 via-amber-800/40 to-slate-950 border-2 border-amber-300 shadow-amber-400/40 ring-4 ring-amber-400/30 scale-105"
    : isHappy
    ? "bg-gradient-to-tr from-rose-950/70 via-amber-900/30 to-black border-2 border-rose-400 shadow-rose-400/30 ring-4 ring-rose-400/20"
    : "bg-gradient-to-tr from-amber-950/70 via-slate-900 to-black border-2 border-amber-500/40 hover:border-amber-400 shadow-amber-500/10 ring-2 ring-amber-500/10 animate-kiaFloat";

  const handleFaceClick = (e: React.MouseEvent) => {
    if (interactive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newHeart = {
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left - 8,
        y: e.clientY - rect.top - 16,
      };
      setFloatingHearts((prev) => [...prev, newHeart]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1200);

      setInternalHappy(true);
      setTimeout(() => setInternalHappy(false), 2200);
      playSfx("tamagotchi_pop", 0.4);
    }

    if (onClick) {
      onClick();
    }
  };

  // Status tooltip description in Portuguese
  const tooltipText =
    statusText ||
    (isError
      ? "KIA em Alerta — Anomalia detetada"
      : isThinking
      ? "KIA a Raciocinar com IA..."
      : isActive
      ? "KIA Ativa & em Execução"
      : isHappy
      ? "KIA Feliz & Sintonizada! 💖"
      : "KIA Tamagotchi • Assistente Executiva");

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Floating Click Hearts */}
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          className="absolute z-50 text-base sm:text-xl pointer-events-none animate-floatUp"
          style={{ left: h.x, top: h.y }}
        >
          💖
        </span>
      ))}

      {/* Main Face Container */}
      <div
        onClick={handleFaceClick}
        title={tooltipText}
        className={`relative ${dimensions.box} rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
          interactive ? "cursor-pointer hover:scale-105 active:scale-95" : ""
        } ${ringAuraClasses}`}
      >
        {/* CSS Keyframe Pulsing Rings */}
        {isActive && (
          <div className="absolute -inset-1.5 rounded-full border border-amber-400/50 animate-kiaPulsingRing pointer-events-none" />
        )}
        {isThinking && (
          <div className="absolute -inset-1 rounded-full border border-dashed border-amber-400/60 animate-spin pointer-events-none" />
        )}

        {/* Tamagotchi Screen Visor Inner Glow */}
        <div className="absolute inset-1.5 rounded-full bg-radial from-amber-500/5 via-transparent to-black/80 pointer-events-none" />

        {/* Digital Face Elements Container */}
        <div className="relative flex flex-col items-center justify-center pointer-events-none z-10">
          {/* Eyes Row */}
          <div className={`flex items-center ${dimensions.eyeSpacing} ${isThinking ? "animate-kiaScanThinking" : ""}`}>
            {/* Left Eye */}
            <div
              className={`flex items-center justify-center transition-all duration-200 ${
                isError
                  ? `${dimensions.eyeSize} rounded-sm bg-rose-500 shadow-sm shadow-rose-500 text-black font-black text-xs flex items-center justify-center`
                  : isThinking
                  ? `${dimensions.eyeSize} rounded-full bg-amber-400 border border-dashed border-white animate-spin`
                  : isHappy
                  ? `${dimensions.eyeSize} border-t-2 sm:border-t-3 border-amber-300 rounded-t-full`
                  : isActive
                  ? `${dimensions.eyeSize} rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-md shadow-amber-400 animate-pulse`
                  : `${dimensions.eyeSize} rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm shadow-amber-400/50 animate-kiaBlink`
              }`}
            >
              {/* Pupil highlights for idle/active */}
              {!isError && !isThinking && !isHappy && (
                <span className={`rounded-full bg-white self-start ml-0.5 mt-0.5 ${dimensions.pupilSize}`} />
              )}
              {isError && <span className="text-[10px] font-mono text-white leading-none">✕</span>}
            </div>

            {/* Right Eye */}
            <div
              className={`flex items-center justify-center transition-all duration-200 ${
                isError
                  ? `${dimensions.eyeSize} rounded-sm bg-rose-500 shadow-sm shadow-rose-500 text-black font-black text-xs flex items-center justify-center`
                  : isThinking
                  ? `${dimensions.eyeSize} rounded-full bg-amber-400 border border-dashed border-white animate-spin`
                  : isHappy
                  ? `${dimensions.eyeSize} border-t-2 sm:border-t-3 border-amber-300 rounded-t-full`
                  : isActive
                  ? `${dimensions.eyeSize} rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-md shadow-amber-400 animate-pulse`
                  : `${dimensions.eyeSize} rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm shadow-amber-400/50 animate-kiaBlink`
              }`}
            >
              {!isError && !isThinking && !isHappy && (
                <span className={`rounded-full bg-white self-start ml-0.5 mt-0.5 ${dimensions.pupilSize}`} />
              )}
              {isError && <span className="text-[10px] font-mono text-white leading-none">✕</span>}
            </div>
          </div>

          {/* Rosy Blush Cheeks */}
          <div className={`flex items-center justify-between ${dimensions.blushWidth} mt-0.5`}>
            <span
              className={`rounded-full bg-rose-400/60 blur-[0.4px] transition-opacity ${
                isHappy ? "opacity-100 scale-125" : isError ? "opacity-10" : "opacity-50"
              } ${dimensions.blushDot}`}
            />
            <span
              className={`rounded-full bg-rose-400/60 blur-[0.4px] transition-opacity ${
                isHappy ? "opacity-100 scale-125" : isError ? "opacity-10" : "opacity-50"
              } ${dimensions.blushDot}`}
            />
          </div>

          {/* Mouth Expression */}
          <div className="flex items-center justify-center mt-0.5 min-h-[6px]">
            {isError ? (
              <div className="w-3 sm:w-5 h-1 border-t-2 border-rose-400 rounded-t-full rotate-3" />
            ) : isThinking ? (
              <div className="flex items-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : isSpeaking ? (
              <div
                className={`relative flex items-center justify-center overflow-hidden transition-all duration-75 ${
                  size === "sm"
                    ? "w-4 h-2"
                    : size === "md"
                    ? "w-5 h-2.5"
                    : size === "lg"
                    ? "w-7 sm:w-8 h-3.5 sm:h-4"
                    : "w-9 sm:w-10 h-4 sm:h-5"
                }`}
              >
                {/* Lábio Superior com movimento articulado */}
                <div className="absolute top-0 w-full border-t-2 border-amber-300 rounded-t-full shadow-[0_-1px_4px_rgba(251,191,36,0.9)] animate-kiaUpperLip" />
                {/* Abertura Oral com movimento articulado de lábios */}
                <div className="w-full h-full bg-gradient-to-b from-amber-950 via-[#2a1705] to-black rounded-full border border-amber-400/50 shadow-[inset_0_0_6px_rgba(245,158,11,0.6)] animate-kiaLipMovement flex items-center justify-center">
                  <div className="w-2/5 h-2/5 rounded-full bg-amber-400/90 blur-[0.5px] animate-pulse" />
                </div>
                {/* Lábio Inferior com movimento articulado */}
                <div className="absolute bottom-0 w-full border-b-2 border-amber-300 rounded-b-full shadow-[0_1px_4px_rgba(251,191,36,0.9)] animate-kiaLowerLip" />
              </div>
            ) : isActive ? (
              <div className="flex items-end space-x-0.5 h-3">
                <span className="w-0.5 sm:w-1 bg-amber-300 rounded-full animate-kiaEqualizer" style={{ animationDelay: "0ms" }} />
                <span className="w-0.5 sm:w-1 bg-amber-300 rounded-full animate-kiaEqualizer" style={{ animationDelay: "200ms" }} />
                <span className="w-0.5 sm:w-1 bg-amber-300 rounded-full animate-kiaEqualizer" style={{ animationDelay: "100ms" }} />
              </div>
            ) : isHappy ? (
              <div className={`${dimensions.mouthWidth} border-b-2 sm:border-b-3 border-amber-300 rounded-b-full shadow-sm`} />
            ) : (
              <div className={`${dimensions.mouthWidth} border-b-2 border-amber-300/80 rounded-b-full shadow-sm`} />
            )}
          </div>
        </div>

        {/* Small Status Badge Indicator on Edge */}
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-950 ${
            size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3 h-3" : "w-3.5 h-3.5"
          } ${
            isError
              ? "bg-rose-500 animate-ping"
              : isThinking
              ? "bg-amber-400 animate-pulse"
              : isActive
              ? "bg-emerald-400 animate-ping"
              : "bg-emerald-400"
          }`}
        />
      </div>

      {/* Optional Status Text / Caption */}
      {showStatusText && (
        <span className="mt-1.5 text-[10px] sm:text-xs font-semibold text-amber-300/90 tracking-wide">
          {tooltipText}
        </span>
      )}
    </div>
  );
};
