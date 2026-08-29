import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Heart,
  Coffee,
  Gift,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Smile,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { playSfx } from "../utils/audio";

export type KiaMood =
  | "HAPPY"
  | "LISTENING"
  | "THINKING"
  | "TALKING"
  | "LOVING"
  | "SURPRISED"
  | "RESTING";

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
}) => {
  // Allow user to collapse/minimize companion to maximize chat viewport space
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof isCompact === "boolean") return isCompact;
    const saved = localStorage.getItem("gag_kia_tamagotchi_collapsed");
    return saved === "true";
  });

  useEffect(() => {
    if (typeof isCompact === "boolean") {
      setIsCollapsed(isCompact);
    }
  }, [isCompact]);

  // Tamagotchi internal companion state persisted in localStorage
  const [affinity, setAffinity] = useState<number>(() => {
    const saved = localStorage.getItem("gag_kia_affinity");
    return saved ? Math.min(100, Math.max(20, parseInt(saved, 10))) : 88;
  });

  const [energy, setEnergy] = useState<number>(() => {
    const saved = localStorage.getItem("gag_kia_energy");
    return saved ? Math.min(100, Math.max(30, parseInt(saved, 10))) : 95;
  });

  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem("gag_kia_level");
    return saved ? parseInt(saved, 10) : 7;
  });

  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [floatingSparks, setFloatingSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [companionQuote, setCompanionQuote] = useState<string>("");
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [blinkState, setBlinkState] = useState(false);
  const [lookDirection, setLookDirection] = useState<"center" | "left" | "right">("center");

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("gag_kia_affinity", affinity.toString());
  }, [affinity]);

  useEffect(() => {
    localStorage.setItem("gag_kia_energy", energy.toString());
  }, [energy]);

  useEffect(() => {
    localStorage.setItem("gag_kia_level", level.toString());
  }, [level]);

  // Determine current active mood dynamically
  let currentMood: KiaMood = "RESTING";
  if (isThinking) {
    currentMood = "THINKING";
  } else if (isSpeaking) {
    currentMood = "TALKING";
  } else if (isListening) {
    currentMood = "LISTENING";
  } else if (affinity > 90) {
    currentMood = "HAPPY";
  }

  // Eye blinking & natural gaze animation loop (like a lively creature)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 180);
    }, 3800 + Math.random() * 2000);

    const lookInterval = setInterval(() => {
      const dirs: ("center" | "left" | "right")[] = ["center", "center", "left", "right", "center"];
      setLookDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
    };
  }, []);

  // Compute average mic energy for visual face resonance
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

    playSfx("tamagotchi_pop", 0.35);
    setEnergy(100);
    setAffinity((prev) => Math.min(100, prev + 1));

    const feedPhrases = [
      `⚡ Café executivo recebido! Processador Gemini Flash acelerado ao máximo!`,
      `☕ Hmm, revigorante! Todos os 13 agentes operacionais estão em alta frequência!`,
      `✨ Bateria recarregada! Estou pronta para escanear qualquer documento ou criar tarefas!`,
    ];
    showBubbleQuote(feedPhrases[Math.floor(Math.random() * feedPhrases.length)]);
  };

  // Tamagotchi Action: Surpresa do Dia
  const handleSurprise = () => {
    playSfx("tamagotchi_happy", 0.4);
    setAffinity((prev) => Math.min(100, prev + 2));

    const surprises = [
      `💡 Dica de Ouro: Podes dizer "KIA, cria uma tarefa para..." em voz alta e ela é adicionada ao Kanban imediatamente sem tocares em nada!`,
      `🎯 Sabias que o Soba na Agent Factory já tem blueprints prontos para criar novos agentes para a tua equipa?`,
      `✨ Lembrete executivo: O segredo da alta produtividade na GAG é delegar tarefas rotineiras e focar na direção estratégica!`,
      `🚀 "A inovação distingue um líder de um seguidor." — Estás a construir algo grandioso, ${userName}!`,
    ];
    const picked = surprises[Math.floor(Math.random() * surprises.length)];
    showBubbleQuote(picked, 6500);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#0c101d] via-[#10172b] to-[#0a0d18] border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl shadow-amber-500/10 mb-4 overflow-hidden select-none transition-all">
      {/* Background Animated Circuits & Halo Glow */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening
            ? "bg-red-500/20 scale-125"
            : isThinking
            ? "bg-amber-400/25 animate-pulse scale-110"
            : isSpeaking
            ? "bg-yellow-400/30 scale-125"
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

      {/* Header bar: Companion Identity + Level & Meters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center space-x-3">
          {/* Animated Mood Status Indicator */}
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
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
              className={`absolute w-3.5 h-3.5 rounded-full ${
                isListening ? "bg-red-500" : isThinking ? "bg-amber-400" : isSpeaking ? "bg-emerald-400" : "bg-amber-400"
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
                : `Amiga executiva de ${userName} &middot; Modo Mãos-Livres 100%`}
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
              localStorage.setItem("gag_kia_tamagotchi_collapsed", String(next));
              playSfx("click");
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm"
            title={isCollapsed ? "Expandir Painel Visual da KIA" : "Minimizar para Maximizar Visibilidade do Chat"}
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

      {/* Main Tamagotchi Interaction Stage (or Compact Stage if Collapsed) */}
      {!isCollapsed ? (
      <div className="py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: The Animated Digital Pet Face / Core Hologram */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Holographic Glowing Orb Stage */}
          <div
            onClick={isListening ? onStopListening : onStartListening}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? "bg-gradient-to-tr from-red-600/40 via-amber-500/30 to-yellow-400/30 border-4 border-red-400 scale-105 ring-8 ring-red-500/20"
                : isThinking
                ? "bg-gradient-to-tr from-amber-600/40 via-yellow-500/30 to-amber-300/30 border-4 border-amber-400 ring-8 ring-amber-500/20 animate-pulse"
                : isSpeaking
                ? "bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-emerald-400/30 border-4 border-yellow-400 ring-8 ring-yellow-400/20 scale-105"
                : "bg-gradient-to-tr from-amber-950/80 via-slate-900 to-black border-2 border-amber-500/50 hover:border-amber-400 hover:scale-105 ring-4 ring-amber-500/10"
            }`}
            title={
              isListening
                ? "A escutar em direto... Fala naturalmente!"
                : "Clica para falar com a KIA (Modo Mãos-Livres Automático)"
            }
          >
            {/* Live Frequency Rings when listening or speaking */}
            {(isListening || isSpeaking) && (
              <div
                className="absolute inset-0 rounded-full border-2 border-amber-400/60 animate-ping pointer-events-none"
                style={{
                  animationDuration: isListening ? "1.5s" : "1.2s",
                  transform: `scale(${1 + (avgEnergy / 100) * 0.3})`,
                }}
              />
            )}

            {/* The Digital Tamagotchi Eyes & Facial Expression */}
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              {/* Eyes Row */}
              <div className="flex items-center space-x-6 sm:space-x-8">
                {/* Left Eye */}
                <div
                  className={`transition-all duration-150 flex items-center justify-center ${
                    blinkState
                      ? "w-4 sm:w-5 h-0.5 bg-amber-300 rounded-full"
                      : isThinking
                      ? "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-amber-400 animate-spin border-2 border-dashed border-white"
                      : isSpeaking
                      ? "w-4 sm:w-5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-lg shadow-amber-400/80"
                      : isListening
                      ? "w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-lg shadow-red-400/80"
                      : "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-md shadow-amber-400/60"
                  }`}
                  style={{
                    transform:
                      lookDirection === "left"
                        ? "translateX(-3px)"
                        : lookDirection === "right"
                        ? "translateX(3px)"
                        : "none",
                  }}
                >
                  {!blinkState && !isThinking && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white self-start ml-0.5 mt-0.5" />
                  )}
                </div>

                {/* Right Eye */}
                <div
                  className={`transition-all duration-150 flex items-center justify-center ${
                    blinkState
                      ? "w-4 sm:w-5 h-0.5 bg-amber-300 rounded-full"
                      : isThinking
                      ? "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-amber-400 animate-spin border-2 border-dashed border-white"
                      : isSpeaking
                      ? "w-4 sm:w-5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-lg shadow-amber-400/80"
                      : isListening
                      ? "w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-b from-red-300 to-amber-400 animate-pulse shadow-lg shadow-red-400/80"
                      : "w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500 shadow-md shadow-amber-400/60"
                  }`}
                  style={{
                    transform:
                      lookDirection === "left"
                        ? "translateX(-3px)"
                        : lookDirection === "right"
                        ? "translateX(3px)"
                        : "none",
                  }}
                >
                  {!blinkState && !isThinking && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white self-start ml-0.5 mt-0.5" />
                  )}
                </div>
              </div>

              {/* Mouth Expression */}
              <div className="flex items-center justify-center h-4">
                {isSpeaking ? (
                  /* Animated Speaking Mouth */
                  <div
                    className="w-5 sm:w-6 h-2 sm:h-3 rounded-full bg-amber-300 animate-bounce shadow-md shadow-amber-300"
                    style={{ transform: `scaleY(${1 + (avgEnergy / 100) * 1.5})` }}
                  />
                ) : isListening ? (
                  /* Listening Wave Mouth */
                  <div className="flex items-center space-x-0.5">
                    <span className="w-1 h-2 bg-red-400 rounded-full animate-ping" />
                    <span className="w-1.5 h-3 bg-amber-300 rounded-full animate-pulse" />
                    <span className="w-1 h-2 bg-red-400 rounded-full animate-ping" />
                  </div>
                ) : isThinking ? (
                  /* Thinking Dot */
                  <div className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                ) : (
                  /* Happy Smile Arc */
                  <div className="w-5 h-2 border-b-2 border-amber-300 rounded-b-full shadow-sm" />
                )}
              </div>
            </div>
          </div>

          {/* Quick Pet Face Tag */}
          <span className="mt-2 text-[11px] font-bold text-amber-300 flex items-center space-x-1">
            <span>{isListening ? "🔴 A Escutar..." : isThinking ? "⚡ A Pensar..." : isSpeaking ? "🔊 A Falar..." : "✨ Toca para Falar"}</span>
          </span>
        </div>

        {/* Center: Live Spoken Speech Bubble + VAD Automatic Countdown */}
        <div className="flex-1 w-full bg-black/60 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-h-[105px]">
          {/* Top of Bubble */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {isListening
                  ? "🎙️ Transcrição em Direto (Mãos-Livres Total):"
                  : isThinking
                  ? "🧠 Processamento com Gemini Flash:"
                  : quoteVisible
                  ? "💬 Mensagem da KIA:"
                  : "💬 Conversa sem Botões:"}
              </span>
            </div>

            {/* Zero-Clicks VAD Active Pill */}
            <div
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 border transition-all ${
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
                  ? "⚡ Silêncio Detetado — A Enviar..."
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
                <span className="text-slate-400 font-normal">Tu estás a dizer: </span>"{liveTranscript}"
                <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse align-middle rounded-sm" />
              </p>
            ) : quoteVisible ? (
              <p className="text-amber-300 font-medium italic animate-fadeIn">"{companionQuote}"</p>
            ) : isListening ? (
              <p className="text-slate-300 italic flex items-center space-x-2">
                <span className="text-red-400 font-bold">🎙️ Pode falar:</span>
                <span>"KIA, cria uma tarefa...", "Vai para o scanner", "Qual o resumo de hoje?"</span>
              </p>
            ) : (
              <p className="text-slate-400">
                Podes dizer em voz alta <strong className="text-amber-300">"KIA"</strong> ou clicar na minha esfera para falar. Assim que parares de falar, eu envio o teu comando <span className="text-emerald-400 font-semibold underline">automaticamente sem clicares em nada</span>!
              </p>
            )}
          </div>

          {/* Bottom Interactive Equalizer Bar when speaking/listening */}
          {isListening && audioLevels.length > 0 && (
            <div className="flex items-center space-x-1 h-3 pt-2">
              {audioLevels.slice(0, 24).map((lvl, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-full bg-gradient-to-t from-red-500 via-amber-400 to-yellow-300 transition-all duration-75"
                  style={{ height: `${Math.max(15, lvl)}%` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Tamagotchi Tactile Care Actions (Pet, Coffee, Surprise, Quick Synergy) */}
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
        /* Compact Mode Bar */
        <div className="pt-2 flex items-center justify-between gap-3 text-xs">
          <div
            onClick={isListening ? onStopListening : onStartListening}
            className={`cursor-pointer flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition-all ${
              isListening
                ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                : isThinking
                ? "bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse"
                : isSpeaking
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40 text-slate-300"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="font-bold">
              {isListening ? "🔴 A Ouvir (Mãos-Livres)..." : isThinking ? "⚡ A Processar..." : isSpeaking ? "🔊 A Falar..." : "🎙️ Falar com KIA"}
            </span>
          </div>

          <div className="flex-1 min-w-0 truncate text-slate-400 text-xs px-2">
            {liveTranscript ? (
              <span className="text-amber-300 font-medium">"{liveTranscript}"</span>
            ) : isListening ? (
              <span className="text-red-300 italic">A escutar... Auto-envio ao pausar</span>
            ) : (
              <span className="text-slate-400">Modo compacto ativo &bull; 100% mãos-livres</span>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handlePet}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
              title="Carinho"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={handleFeed}
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
              title="Café"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
