import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  X,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Copy,
  Check,
  MoreHorizontal,
  Download,
  ExternalLink,
  Calendar,
  Share2,
  FileCode,
  FileSpreadsheet,
  Play,
  Square,
  MessageSquare,
  Bot,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ScanText,
  Loader2,
  Image as ImageIcon,
  FileCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  stopTtsAudio,
  playSfx,
  getIsSpeaking,
  isAnyAudioSpeaking,
  speakNaturalText,
} from "../utils/audio";
import { wakeWordDetector } from "../utils/wakeWordDetector";
import { ChatAttachment, ChatMessage } from "../types";
import { ensureSentenceSanity } from "../services/kiaRobustChat";
import {
  extractTextFromFile,
  performOcr,
  formatOcrForChatInput,
  OcrProgress,
} from "../services/ocrService";
import { KiaPersonaModal } from "./KiaPersonaModal";
import { AgentAvatar } from "./AgentAvatar";
import { loadPersonaConfig, savePersonaConfig, KiaPersonaConfig } from "../config/kiaPersona";
import { useKiaContext } from "../hooks/useKiaContext";
import { useOmniRouteStatus } from "../hooks/useOmniRouteStatus";
import { KiaFace } from "./KiaFace";

/**
 * Avatar of KIA — Defaulting to the iconic GAG Golden Crown avatar that the user loved.
 */
export const KiaExecutiveAvatar: React.FC<{
  size?: "sm" | "md" | "lg";
  isThinking?: boolean;
}> = ({ size = "md", isThinking = false }) => {
  return (
    <div className="relative inline-flex shrink-0">
      <AgentAvatar agentId="agent-kia" size={size} showBadge={false} />
      {/* Live Operational Status Badge */}
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
          isThinking
            ? "bg-amber-400 animate-ping"
            : "bg-emerald-400"
        }`}
        title={isThinking ? "A orquestrar tarefa..." : "KIA Online (Luanda)"}
      />
      {isThinking && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-950" />
      )}
    </div>
  );
};

export function filterIntrusiveMetaThoughts(text: string): string {
  if (!text) return "";
  let result = text;
  result = result
    .replace(/^(?:olha,?\s*)?(?:agora\s+)?(?:eu\s+)?(?:vou\s+)?(?:mudar\s+de\s+tom|mudar\s+o\s+tom|adotar\s+um\s+tom|falar\s+com\s+um\s+tom|adotar\s+uma\s+postura)[^.!?\n]*[.!?\n]+\s*/i, "")
    .replace(/^(?:deixa-me\s+)?(?:pensar\s+para\s+mim\s+mesma|refletir\s+aqui|pensar\s+estrategicamente)[^.!?\n]*[.!?\n]+\s*/i, "")
    .replace(/^(?:como\s+diretora\s+executiva,?\s*)?(?:vou\s+agora\s+estruturar|vou\s+mudar\s+a\s+minha\s+abordagem)[^.!?\n]*[.!?\n]+\s*/i, "")
    .trim();
  return result;
}

export function parseKiaInterpretation(rawText: string) {
  if (!rawText) {
    return { interpretation: "", isInterpreting: false, cleanContent: "" };
  }

  // Support both <interpretacao> and <think>
  const openTagMatch = rawText.match(/<(?:interpretacao|think)>/i);
  if (!openTagMatch) {
    return {
      interpretation: "",
      isInterpreting: false,
      cleanContent: filterIntrusiveMetaThoughts(rawText),
    };
  }

  const closeTagMatch = rawText.match(/<\/(?:interpretacao|think)>/i);
  if (!closeTagMatch) {
    const openIndex = openTagMatch.index! + openTagMatch[0].length;
    const partial = rawText.slice(openIndex).trim();
    return {
      interpretation: partial,
      isInterpreting: true,
      cleanContent: "",
    };
  }

  const openIndex = openTagMatch.index! + openTagMatch[0].length;
  const closeIndex = closeTagMatch.index!;
  const interpretation = rawText.slice(openIndex, closeIndex).trim();
  const rawClean = (
    rawText.slice(0, openTagMatch.index!) +
    rawText.slice(closeIndex + closeTagMatch[0].length)
  ).trim();

  return {
    interpretation,
    isInterpreting: false,
    cleanContent: filterIntrusiveMetaThoughts(rawClean),
  };
}

export const KiaChatView: React.FC = () => {
  const {
    chatMessages,
    isKiaThinking,
    sendKiaMessage,
    supabaseHealth,
    refreshSupabaseHealth,
    systemSettings,
    updateSettings,
    clearChat,
    setActiveTab,
    setIsSynergyModalOpen,
    setIsScenarioModalOpen,
    tasks,
    currentUser,
  } = useApp();

  const { getContextAwareResponse, thoughtProcess } = useKiaContext();
  const { status, latency } = useOmniRouteStatus();
  const [showThoughtProcess, setShowThoughtProcess] = useState(false);

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState<boolean>(() => Boolean(systemSettings.voiceContinuous));
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isWaitingSilence, setIsWaitingSilence] = useState(false);
  const [isGlobalSpeaking, setIsGlobalSpeaking] = useState<boolean>(() => getIsSpeaking() || isAnyAudioSpeaking());
  const [ttsMuted, setTtsMuted] = useState(() => !systemSettings.autoAudioTts);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [personaConfig, setPersonaConfig] = useState<KiaPersonaConfig>(loadPersonaConfig);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [expandedInterpretations, setExpandedInterpretations] = useState<Record<string, boolean>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // OCR state for scanning attachments
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<{ progress: number; status: string; fileName: string } | null>(null);
  const [ocrNotification, setOcrNotification] = useState<{ fileName: string; count: number; confidence: number } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handsFreeRestartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullSpokenTextRef = useRef<string>("");
  const isListeningRef = useRef<boolean>(false);
  const isHandsFreeRef = useRef<boolean>(isHandsFree);
  const isSpeakingRef = useRef<boolean>(false);
  const isKiaThinkingRef = useRef<boolean>(isKiaThinking);

  // Status unificado de áudio activo da KIA
  const isSpeaking = Boolean(speakingMsgId) || isGlobalSpeaking || getIsSpeaking() || isAnyAudioSpeaking();

  // Texto atualmente a ser falado ou acompanhado para leitura em tempo real
  const currentSpeakingText = useMemo(() => {
    if (speakingMsgId) {
      const m = chatMessages.find((msg) => msg.id === speakingMsgId);
      if (m) {
        const { cleanContent } = parseKiaInterpretation(m.content);
        return cleanContent.replace(/<[^>]+>/g, "").replace(/\[.*?\]/g, "").trim();
      }
    }
    if (isSpeaking) {
      const lastAsst = [...chatMessages].reverse().find((m) => m.role === "assistant");
      if (lastAsst) {
        const { cleanContent } = parseKiaInterpretation(lastAsst.content);
        return cleanContent.replace(/<[^>]+>/g, "").replace(/\[.*?\]/g, "").trim();
      }
    }
    return "";
  }, [speakingMsgId, isSpeaking, chatMessages]);

  const isReadingOrListening = Boolean(currentTranscript) || isListening || isWaitingSilence || isSpeaking;

  useEffect(() => {
    isKiaThinkingRef.current = isKiaThinking;
  }, [isKiaThinking]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Sincronizar modo mãos-livres quando modificado nas definições globais
  useEffect(() => {
    if (systemSettings.voiceContinuous !== undefined && systemSettings.voiceContinuous !== isHandsFree) {
      setIsHandsFree(Boolean(systemSettings.voiceContinuous));
      isHandsFreeRef.current = Boolean(systemSettings.voiceContinuous);
    }
  }, [systemSettings.voiceContinuous]);

  // Auto scroll suave acompanhando texto e mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isKiaThinking, currentTranscript]);

  // Redimensionamento dinâmico da caixa de texto
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Submissão de mensagem para o chat da KIA
  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend && attachments.length === 0) return;
    if (isKiaThinking) return;

    const currentAttachments = [...attachments];
    setInputText("");
    setCurrentTranscript("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendKiaMessage(textToSend, currentAttachments);
  };

  // Parar escuta e limpar timers
  const stopListening = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (handsFreeRestartTimerRef.current) {
      clearTimeout(handsFreeRestartTimerRef.current);
      handsFreeRestartTimerRef.current = null;
    }
    setIsWaitingSilence(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
    wakeWordDetector.resumeAfterActiveInput(800);
  };

  // Iniciar escuta garantindo que isSpeaking === false e isKiaThinking === false
  const startListening = async () => {
    if (isSpeakingRef.current || getIsSpeaking() || isAnyAudioSpeaking()) {
      console.log("[Voz KIA] Escuta cancelada: KIA está a falar (isSpeaking === true).");
      return;
    }
    if (isKiaThinkingRef.current) {
      console.log("[Voz KIA] Escuta cancelada: KIA está a raciocinar.");
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn("SpeechRecognition não suportado no navegador.");
      return;
    }

    try {
      await wakeWordDetector.pauseForActiveInput();
    } catch {}

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "pt-PT";

    rec.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      playSfx("click");
    };

    // 1. Temporizador de silêncio (debounce de 1.8s) no evento onresult
    rec.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript + " ";
        } else {
          interimTranscript += res[0].transcript;
        }
      }

      const liveText = (finalTranscript + interimTranscript).trim();
      if (!liveText) return;

      fullSpokenTextRef.current = liveText;
      setCurrentTranscript(liveText);
      setInputText(liveText);

      // Reiniciar temporizador de silêncio com debounce de 1.8s
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      setIsWaitingSilence(true);

      silenceTimeoutRef.current = setTimeout(() => {
        setIsWaitingSilence(false);
        const textToSubmit = fullSpokenTextRef.current.trim();

        // Submeter mensagem após 1.8s de silêncio se a KIA não estiver a falar nem a pensar
        if (
          textToSubmit &&
          !isKiaThinkingRef.current &&
          !isSpeakingRef.current &&
          !getIsSpeaking() &&
          !isAnyAudioSpeaking()
        ) {
          console.log(`[Voz KIA] Silêncio de 1.8s atingido. A submeter: "${textToSubmit}"`);
          fullSpokenTextRef.current = "";
          setCurrentTranscript("");
          setInputText("");

          try {
            rec.stop();
          } catch {}
          setIsListening(false);
          isListeningRef.current = false;

          handleSend(textToSubmit);
        }
      }, 1800);
    };

    rec.onerror = (event: any) => {
      console.debug("[SpeechRecognition Error]:", event?.error);
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        setIsListening(false);
        isListeningRef.current = false;
        setIsWaitingSilence(false);
        wakeWordDetector.resumeAfterActiveInput(1000);
        return;
      }
      if (event?.error === "no-speech") {
        setIsWaitingSilence(false);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      setIsWaitingSilence(false);

      // 2. No modo Mãos-Livres, garante que o microfone só reinicia a escuta após a KIA terminar de reproduzir a voz
      if (
        isHandsFreeRef.current &&
        !isKiaThinkingRef.current &&
        !isSpeakingRef.current &&
        !getIsSpeaking() &&
        !isAnyAudioSpeaking()
      ) {
        if (handsFreeRestartTimerRef.current) {
          clearTimeout(handsFreeRestartTimerRef.current);
        }
        handsFreeRestartTimerRef.current = setTimeout(() => {
          if (
            isHandsFreeRef.current &&
            !isKiaThinkingRef.current &&
            !isSpeakingRef.current &&
            !getIsSpeaking() &&
            !isAnyAudioSpeaking() &&
            !isListeningRef.current
          ) {
            startListening();
          }
        }, 500);
      } else {
        wakeWordDetector.resumeAfterActiveInput(800);
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err) {
      console.warn("Erro ao iniciar escuta:", err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  // Alternar microfone manual
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Alternar modo Mãos-Livres
  const toggleHandsFree = () => {
    const nextVal = !isHandsFree;
    setIsHandsFree(nextVal);
    isHandsFreeRef.current = nextVal;
    updateSettings({ voiceContinuous: nextVal });
    playSfx("click");

    if (nextVal) {
      if (
        !isKiaThinkingRef.current &&
        !isSpeakingRef.current &&
        !getIsSpeaking() &&
        !isAnyAudioSpeaking()
      ) {
        startListening();
      }
    } else {
      stopListening();
    }
  };

  // 2. No modo Mãos-Livres, garante que o microfone só reinicia a escuta (recognition.start()) após a KIA terminar completamente de reproduzir a voz (isSpeaking === false)
  useEffect(() => {
    const isSpeakingNow = isGlobalSpeaking || Boolean(speakingMsgId) || getIsSpeaking() || isAnyAudioSpeaking();
    isSpeakingRef.current = isSpeakingNow;

    if (isSpeakingNow) {
      // Se a KIA começou a falar, cancela qualquer submissão de silêncio pendente e pára a escuta imediatamente
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      setIsWaitingSilence(false);

      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        setIsListening(false);
        isListeningRef.current = false;
      }
    } else {
      // A KIA terminou completamente de falar (isSpeaking === false)!
      // No modo Mãos-Livres, reinicia a escuta de voz de forma segura após margem de 400ms
      if (isHandsFreeRef.current && !isKiaThinkingRef.current) {
        if (handsFreeRestartTimerRef.current) {
          clearTimeout(handsFreeRestartTimerRef.current);
        }
        handsFreeRestartTimerRef.current = setTimeout(() => {
          if (
            isHandsFreeRef.current &&
            !isKiaThinkingRef.current &&
            !isSpeakingRef.current &&
            !getIsSpeaking() &&
            !isAnyAudioSpeaking() &&
            !isListeningRef.current
          ) {
            console.log("[Mãos-Livres] Voz da KIA concluída (isSpeaking === false). Reiniciando escuta do microfone...");
            startListening();
          }
        }, 400);
      }
    }
  }, [isGlobalSpeaking, speakingMsgId, isKiaThinking]);

  // Eventos de áudio globais
  useEffect(() => {
    const handleSpeakingState = (e: any) => {
      const speaking = Boolean(e?.detail?.isSpeaking);
      setIsGlobalSpeaking(speaking);
    };

    const handleSpeechEnded = () => {
      setIsGlobalSpeaking(false);
      if (isHandsFreeRef.current && !isKiaThinkingRef.current) {
        setTimeout(() => {
          if (
            isHandsFreeRef.current &&
            !isKiaThinkingRef.current &&
            !isSpeakingRef.current &&
            !getIsSpeaking() &&
            !isAnyAudioSpeaking() &&
            !isListeningRef.current
          ) {
            console.log("[Mãos-Livres] Evento de áudio terminado recebido. Reiniciando microfone...");
            startListening();
          }
        }, 400);
      }
    };

    const handleStartVoiceRecording = () => {
      if (
        !isKiaThinkingRef.current &&
        !isSpeakingRef.current &&
        !getIsSpeaking() &&
        !isAnyAudioSpeaking()
      ) {
        startListening();
      }
    };

    window.addEventListener("kia-speaking-state", handleSpeakingState);
    window.addEventListener("kia-speech-ended", handleSpeechEnded);
    window.addEventListener("kia-start-voice-recording", handleStartVoiceRecording);

    return () => {
      window.removeEventListener("kia-speaking-state", handleSpeakingState);
      window.removeEventListener("kia-speech-ended", handleSpeechEnded);
      window.removeEventListener("kia-start-voice-recording", handleStartVoiceRecording);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (handsFreeRestartTimerRef.current) clearTimeout(handsFreeRestartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleTtsMute = () => {
    const nextMuted = !ttsMuted;
    setTtsMuted(nextMuted);
    updateSettings({ autoAudioTts: !nextMuted });
    if (nextMuted) {
      stopTtsAudio();
      setSpeakingMsgId(null);
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingMsgId === id) {
      stopTtsAudio();
      setSpeakingMsgId(null);
    } else {
      stopTtsAudio();
      setSpeakingMsgId(id);
      const clean = text.replace(/<[^>]+>/g, "").replace(/\[.*?\]/g, "");
      speakNaturalText(clean, {
        onEnd: () => setSpeakingMsgId(null),
      });
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    playSfx("click");
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // OCR & File processing engine
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    for (const file of files) {
      // 1. Read and add to attachments preview
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          base64Data: reader.result as string,
        };
        setAttachments((prev) => [...prev, newAttachment]);
        playSfx("notification");
      };
      reader.readAsDataURL(file);

      // 2. Identify if file contains visual or text data eligible for OCR / extraction
      const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|gif|tiff)$/i.test(file.name);
      const isText = file.type.startsWith("text/") || /\.(txt|csv|json|md|log)$/i.test(file.name);

      if (isImage || isText) {
        setIsOcrProcessing(true);
        setOcrProgress({
          progress: 10,
          status: isImage ? "A inicializar motor OCR Tesseract..." : "A ler documento de texto...",
          fileName: file.name,
        });

        try {
          const result = await extractTextFromFile(file, {
            onProgress: (prog: OcrProgress) => {
              setOcrProgress({
                progress: prog.progress,
                status: prog.status,
                fileName: file.name,
              });
            },
          });

          if (result.success && result.text) {
            setInputText((prev) => {
              const updated = formatOcrForChatInput(prev, file.name, result.text);
              // Resize and focus textarea dynamically
              setTimeout(() => {
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
                  textareaRef.current.focus();
                }
              }, 60);
              return updated;
            });

            setOcrNotification({
              fileName: file.name,
              count: result.text.length,
              confidence: result.confidence,
            });
            playSfx("notification");
          } else if (!result.text && isImage) {
            setOcrNotification({
              fileName: file.name,
              count: 0,
              confidence: 0,
            });
          }
        } catch (ocrErr) {
          console.error("[OCR Process Error]:", ocrErr);
        } finally {
          setIsOcrProcessing(false);
          setOcrProgress(null);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Allow pasting screenshots directly from clipboard with instant OCR extraction
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const pastedFile = new File([blob], `captura-${timestamp}.png`, { type: blob.type });
          imageFiles.push(pastedFile);
        }
      }
    }

    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  };

  // Re-run OCR manually on an already attached image
  const handleReRunOcr = async (att: ChatAttachment) => {
    if (!att.base64Data) return;
    setIsOcrProcessing(true);
    setOcrProgress({
      progress: 10,
      status: `A reanalisar OCR de ${att.name}...`,
      fileName: att.name,
    });
    try {
      const result = await performOcr(att.base64Data, att.name, {
        onProgress: (p) => {
          setOcrProgress({
            progress: p.progress,
            status: p.status,
            fileName: att.name,
          });
        },
      });
      if (result.success && result.text) {
        setInputText((prev) => {
          const updated = formatOcrForChatInput(prev, att.name, result.text);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
              textareaRef.current.focus();
            }
          }, 60);
          return updated;
        });
        setOcrNotification({
          fileName: att.name,
          count: result.text.length,
          confidence: result.confidence,
        });
        playSfx("notification");
      }
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(null);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleInterpretation = (msgId: string) => {
    setExpandedInterpretations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // Render a Claude-style Artifact / File Box
  const renderArtifact = (title: string, content: string, type = "document") => {
    const handleDownload = () => {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title.toLowerCase().replace(/[^a-z0-9_-]/g, "_") + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <div className="my-3 rounded-xl border border-amber-500/30 bg-slate-950/80 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white truncate">{title}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 uppercase font-mono">
              {type}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                playSfx("click");
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Copiar código"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium transition-colors"
              title="Descarregar ficheiro"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
        <div className="p-3 font-mono text-xs text-slate-200 overflow-x-auto max-h-72 bg-[#080b11]">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    );
  };

  // Render Action Cards (e.g. Task created, calendar event, whatsapp link)
  const renderActionCard = (actionCard: any) => {
    if (!actionCard) return null;
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 text-xs shadow-lg">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm">{actionCard.title}</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{actionCard.description}</p>
            {actionCard.actionUrl && (
              <button
                onClick={() => {
                  if (actionCard.actionUrl.includes("#tab=tasks")) setActiveTab("tasks");
                  else if (actionCard.actionUrl.includes("#tab=calendar")) setActiveTab("calendar");
                  else if (actionCard.actionUrl.includes("#tab=knowledge")) setActiveTab("knowledge");
                  else if (actionCard.actionUrl.includes("#modal=synergy")) setIsSynergyModalOpen(true);
                  else if (actionCard.actionUrl.startsWith("http")) window.open(actionCard.actionUrl, "_blank");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
              >
                {actionCard.actionLabel || "Abrir Registo"}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative border rounded-2xl border-slate-800/80 bg-[#07090e] text-slate-100 shadow-2xl">
      {/* Supabase Disconnected Warning */}
      {!supabaseHealth.isConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-amber-400 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Servidor Supabase Desconectado. Algumas operações locais em cache.</span>
          </div>
          <button
            onClick={() => refreshSupabaseHealth()}
            className="flex items-center gap-1 font-semibold underline hover:text-amber-300"
          >
            <RefreshCw className="w-3 h-3" /> Reconectar
          </button>
        </div>
      )}

      {/* Header — Executive & Clean with Angolan Woman Avatar */}
      <div className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-5xl mx-auto gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <KiaExecutiveAvatar size="md" isThinking={isKiaThinking} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide truncate">
                  KIA
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Orquestradora Executiva
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Luanda (+244)
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Comando Central · 21 Agentes Especializados · Regra 50% Sinal (AOA)
              </p>
            </div>
          </div>

          {/* Secondary Actions Kebab Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* OmniRoute Widget */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border ${status === 'online' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{status === 'online' ? `${latency}ms` : 'Offline'}</span>
            </div>

            <button
              onClick={toggleTtsMute}
              className={`p-2 rounded-xl border transition-colors ${
                ttsMuted
                  ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-300"
              }`}
              title={ttsMuted ? "Ativar leitura por voz" : "Silenciar voz da KIA"}
            >
              {ttsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 hover:bg-slate-700/80 text-slate-300 transition-colors"
                title="Opções da KIA"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 text-xs text-slate-300 space-y-1">
                    <button
                      onClick={() => {
                        setShowThoughtProcess(!showThoughtProcess);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      {showThoughtProcess ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                      {showThoughtProcess ? "Ocultar Processo de Pensamento" : "Ver Processo de Pensamento"}
                    </button>
                    <button
                      onClick={() => {
                        setIsPersonaModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Ajustar Persona da KIA
                    </button>
                    <button
                      onClick={() => {
                        setIsSynergyModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      Disparar Sinergia Operacional
                    </button>
                    <button
                      onClick={() => {
                        setIsScenarioModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Bot className="w-4 h-4 text-blue-400" />
                      Simulador de Cenários & ROAS
                    </button>
                    <div className="border-t border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        if (window.confirm("Deseja limpar todo o histórico desta conversa?")) {
                          clearChat();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar Conversa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rosto Tamagotchi do KIA no Topo da Janela de Chat */}
      <div className="shrink-0 px-3 sm:px-4 pt-2.5 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1424] to-slate-950 border border-amber-500/25 shadow-lg shadow-amber-500/5">
          <div className="flex items-center space-x-3.5">
            <KiaFace
              status={
                isListening
                  ? "listening"
                  : isKiaThinking
                  ? "thinking"
                  : isSpeaking
                  ? "speaking"
                  : "active"
              }
              state={
                isListening
                  ? "listening"
                  : isKiaThinking
                  ? "thinking"
                  : isSpeaking
                  ? "speaking"
                  : "active"
              }
              size="md"
              interactive={true}
              onClick={toggleListening}
              showStatusText={false}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-white">KIA</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                    isListening && isWaitingSilence
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse"
                      : isListening
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                      : isKiaThinking
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : isSpeaking
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isListening && isWaitingSilence
                    ? "Silêncio (1.8s)..."
                    : isListening
                    ? "A escutar voz..."
                    : isKiaThinking
                    ? "A raciocinar..."
                    : isSpeaking
                    ? "A falar..."
                    : "Operacional"}
                </span>
                {isHandsFree && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Mãos-Livres
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isHandsFree
                  ? "Modo Mãos-Livres ativo • Escuta reinicia automaticamente quando a KIA termina de falar"
                  : "Co-piloto Executiva da GAG Visual em Luanda • Clique no microfone ou no botão Mãos-Livres"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Alternador de Modo Mãos-Livres no Cabeçalho */}
            <button
              type="button"
              onClick={toggleHandsFree}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isHandsFree
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
              title={
                isHandsFree
                  ? "Desativar Modo Mãos-Livres"
                  : "Ativar Modo Mãos-Livres (escuta contínua com pausa de 1.8s e reinício automático)"
              }
            >
              <Zap className={`w-3.5 h-3.5 ${isHandsFree ? "text-emerald-400 fill-current animate-pulse" : "text-slate-400"}`} />
              <span className="hidden sm:inline">Mãos-Livres</span>
            </button>

            {/* Microfone */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title={isListening ? "Parar escuta" : "Falar por voz com a KIA"}
            >
              {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Painel Fixo de Transcrição e Leitura em Tempo Real logo abaixo do rosto da KIA */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 max-w-5xl mx-auto w-full transition-all duration-300">
        {isReadingOrListening ? (
          <div className="p-3.5 sm:p-4 bg-slate-900/90 backdrop-blur-xl border border-amber-500/35 rounded-2xl shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/20 flex flex-col gap-2.5 animate-fade-in-up">
            {/* Cabeçalho do Painel */}
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isSpeaking
                      ? "bg-emerald-400 animate-ping"
                      : isWaitingSilence
                      ? "bg-amber-400 animate-bounce"
                      : isListening
                      ? "bg-rose-500 animate-pulse"
                      : "bg-amber-400"
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 truncate">
                  {isSpeaking ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                      <span>Acompanhamento de Leitura (KIA a falar)</span>
                    </>
                  ) : isListening ? (
                    <>
                      <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                      <span>Transcrição de Voz em Tempo Real</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Transcrição Recente</span>
                    </>
                  )}
                </span>

                {/* Equalizador de áudio animado */}
                {(isSpeaking || isListening) && (
                  <div className="flex items-center gap-0.5 h-3.5 ml-1">
                    <span className={`w-0.5 rounded-full animate-kiaEqualizer ${isSpeaking ? "bg-emerald-400" : "bg-rose-400"}`} style={{ animationDelay: "0ms" }} />
                    <span className={`w-0.5 rounded-full animate-kiaEqualizer ${isSpeaking ? "bg-emerald-400" : "bg-rose-400"}`} style={{ animationDelay: "150ms" }} />
                    <span className={`w-0.5 rounded-full animate-kiaEqualizer ${isSpeaking ? "bg-emerald-400" : "bg-rose-400"}`} style={{ animationDelay: "300ms" }} />
                    <span className={`w-0.5 rounded-full animate-kiaEqualizer ${isSpeaking ? "bg-emerald-400" : "bg-rose-400"}`} style={{ animationDelay: "450ms" }} />
                  </div>
                )}
              </div>

              {/* Status chips & Ações */}
              <div className="shrink-0 flex items-center gap-2">
                {isWaitingSilence && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 animate-pulse flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Auto-envio (1.8s)
                  </span>
                )}
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={() => {
                      stopTtsAudio();
                      setSpeakingMsgId(null);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Parar áudio da KIA"
                  >
                    <Square className="w-3 h-3" />
                    Parar Áudio
                  </button>
                )}
                {currentTranscript && !isSpeaking && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTranscript("");
                      setInputText("");
                      if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                        silenceTimeoutRef.current = null;
                      }
                      setIsWaitingSilence(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Corpo de Leitura Confortável e Acessível */}
            <div className="max-h-28 sm:max-h-36 overflow-y-auto pr-1 text-slate-100 text-sm sm:text-[15px] font-medium leading-relaxed select-text">
              {currentTranscript ? (
                <p className="italic text-amber-100/95 selection:bg-amber-500 selection:text-black">
                  "{currentTranscript}"
                </p>
              ) : isSpeaking && currentSpeakingText ? (
                <p className="text-slate-200 leading-relaxed font-sans selection:bg-amber-500 selection:text-black">
                  {currentSpeakingText}
                </p>
              ) : isListening ? (
                <p className="text-slate-400 italic text-xs sm:text-sm">
                  A escutar a tua voz... Podes falar livremente para a transcrição imediata.
                </p>
              ) : (
                <p className="text-slate-400 italic text-xs sm:text-sm">
                  Áudio da KIA em reprodução...
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Estado Standby Fixo Elegante — Sem quebra de layout nem saltos */
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs text-slate-400 transition-all hover:border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span className="font-medium text-slate-300">
                Transcrição e Leitura em Tempo Real
              </span>
              <span className="hidden sm:inline text-slate-500">·</span>
              <span className="hidden sm:inline text-[11px] text-slate-400">
                Sincronização imediata de voz e texto
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="hidden md:inline">Clica no microfone ou em Ouvir</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" title="Pronta para ouvir ou ler" />
            </div>
          </div>
        )}
      </div>

      {/* 1. Área do Chat / Mensagens (ocupa todo o espaço disponível com scroll interno) */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-4 max-w-5xl mx-auto w-full scroll-smooth">
        {/* Thought Process Panel */}
        {showThoughtProcess && thoughtProcess.length > 0 && (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-amber-500 mb-2">Processo de Pensamento da KIA:</div>
            {thoughtProcess.map((step, i) => <div key={i}>• {step}</div>)}
          </div>
        )}
        {/* Welcome Briefing Screen when no messages */}
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[45vh] text-center max-w-2xl mx-auto space-y-6 py-6">
            <div className="relative">
              <KiaFace
                size="lg"
                status={
                  isListening
                    ? "listening"
                    : isKiaThinking
                    ? "thinking"
                    : isSpeaking
                    ? "speaking"
                    : "idle"
                }
                state={
                  isListening
                    ? "listening"
                    : isKiaThinking
                    ? "thinking"
                    : isSpeaking
                    ? "speaking"
                    : "idle"
                }
                interactive={true}
                onClick={toggleListening}
                showStatusText={true}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Olá, {currentUser?.name || "Líder Executivo"}!
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                Sou a <span className="text-amber-400 font-semibold">KIA</span>, Orquestradora Executiva da GAG Visual em Luanda. Comando 21 agentes autónomos para fecho comercial, orçamentação em Kwanzas (AOA) com regra inegociável de 50% de sinal, CRM e alinhamento tático.
              </p>
            </div>

            {/* Quick Tactical Execution Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              <button
                onClick={() => handleSend("Qual é o estado do pipeline comercial e as leads prioritárias em Luanda?")}
                className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20 hover:shadow-amber-500/5 transition-all text-xs group ring-1 ring-white/5 hover:ring-amber-500/20"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-amber-400 transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Pipeline Comercial AOA</span>
                </div>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Avaliar oportunidades de fecho imediato em Luanda e leads no CRM.
                </p>
              </button>

              <button
                onClick={() => handleSend("Cria uma proposta comercial formal para projeto de branding com valor em Kwanzas (AOA) e regra de 50% de sinal.")}
                className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20 hover:shadow-amber-500/5 transition-all text-xs group ring-1 ring-white/5 hover:ring-amber-500/20"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-amber-400 transition-colors">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Gerar Proposta Comercial</span>
                </div>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Elaborar proposta formal em Kwanzas com 50% adiantado e artefacto para download.
                </p>
              </button>

              <button
                onClick={() => handleSend("Agenda uma reunião estratégica de alinhamento com cliente no Calendário da GAG Visual.")}
                className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20 hover:shadow-amber-500/5 transition-all text-xs group ring-1 ring-white/5 hover:ring-amber-500/20"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-amber-400 transition-colors">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agendar no Calendário</span>
                </div>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Criar compromisso executivo e sincronizar com o calendário corporativo.
                </p>
              </button>

              <button
                onClick={() => handleSend("Dispara a Sinergia Operacional com os agentes de Estratégia, Copywriting e Design.")}
                className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20 hover:shadow-amber-500/5 transition-all text-xs group ring-1 ring-white/5 hover:ring-amber-500/20"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-amber-400 transition-colors">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Sinergia Multi-Agente</span>
                </div>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Mobilizar agentes especializados para execução simultânea de deliverables.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {chatMessages.map((msg) => {
          const isUser = msg.role === "user";
          const { interpretation, isInterpreting, cleanContent } = isUser
            ? { interpretation: "", isInterpreting: false, cleanContent: msg.content }
            : parseKiaInterpretation(msg.content);

          const isSpeaking = speakingMsgId === msg.id;

          // Check if cleanContent or executionResult has downloadable artifact
          const hasArtifact = msg.executionResult?.data?.fileUrl || (cleanContent && cleanContent.includes("```"));

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} group animate-fade-in-up`}
            >
              {!isUser && (
                <div className="mt-1">
                  <KiaExecutiveAvatar size="sm" isThinking={false} />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 transition-all backdrop-blur-md shadow-md ${
                  isUser
                    ? "bg-gradient-to-br from-amber-600/20 via-amber-700/15 to-amber-950/25 border border-amber-500/40 text-white rounded-tr-sm shadow-amber-500/5 ring-1 ring-amber-500/15"
                    : "bg-slate-900/85 backdrop-blur-md border border-amber-500/20 hover:border-amber-500/35 transition-all text-slate-200 rounded-tl-sm shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/10"
                }`}
              >
                {/* Bubble Header */}
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-500/15 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    {isUser ? (
                      <span className="text-amber-300 font-semibold">{currentUser?.name || "Tu"}</span>
                    ) : (
                      <>
                        <span className="text-amber-400 font-bold">KIA</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">Orquestradora Executiva</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Attachments if user message */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate max-w-[160px]">{att.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {(att.size / 1024).toFixed(0)}KB
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collapsible Strategic Interpretation / Thinking Section */}
                {interpretation && (
                  <div className="mb-3 rounded-xl bg-slate-950/70 border border-amber-500/25 backdrop-blur-sm overflow-hidden">
                    <button
                      onClick={() => toggleInterpretation(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-left text-[11px] text-amber-400/90 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold">Raciocínio Estratégico da KIA</span>
                      </div>
                      {expandedInterpretations[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {expandedInterpretations[msg.id] && (
                      <div className="p-3 text-xs text-slate-300 italic border-t border-slate-800/80 bg-black/20 leading-relaxed font-sans">
                        {interpretation}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Message Content */}
                <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed text-sm selection:bg-amber-500 selection:text-black">
                  <ReactMarkdown
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="my-3 overflow-x-auto rounded-lg border border-slate-800">
                          <table className="w-full text-xs text-left" {...props} />
                        </div>
                      ),
                      th: ({ node, ...props }) => (
                        <th className="bg-slate-800/80 px-3 py-2 text-amber-300 font-bold border-b border-slate-700" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="px-3 py-2 border-b border-slate-800 text-slate-300" {...props} />
                      ),
                      code: ({ node, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const textVal = String(children).replace(/\n$/, "");
                        const isBlock = match || textVal.includes("\n");

                        if (isBlock) {
                          return renderArtifact(
                            match ? `Artefacto (${match[1].toUpperCase()})` : "Artefacto Executivo",
                            textVal,
                            match ? match[1] : "código"
                          );
                        }
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {cleanContent}
                  </ReactMarkdown>
                </div>

                {/* Direct Download button if executionResult provided fileUrl */}
                {msg.executionResult?.data?.fileUrl && (
                  <div className="mt-3">
                    <a
                      href={msg.executionResult.data.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
                    >
                      <Download className="w-4 h-4" />
                      Descarregar Ficheiro: {msg.executionResult.data.filename || "Artefacto_KIA.pdf"}
                    </a>
                  </div>
                )}

                {/* Action Card Rendering if present */}
                {msg.executionResult?.actionCard && renderActionCard(msg.executionResult.actionCard)}

                {/* Message Interactive Controls Footer */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.id, cleanContent)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-[11px] cursor-pointer ${
                          isSpeaking
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10"
                            : "hover:bg-slate-800 hover:text-white"
                        }`}
                        title={isSpeaking ? "Parar áudio" : "Ouvir em voz alta"}
                      >
                        {isSpeaking ? (
                          <>
                            <Square className="w-3 h-3 text-amber-400" />
                            <span>Parar</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Ouvir</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, cleanContent)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-[11px] cursor-pointer"
                        title="Copiar mensagem"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      GAG OS v2.4
                    </span>
                  </div>
                )}

                {/* Suggested Prompts / Follow-up Actions */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Thinking / Orchestration Indicator */}
        {isKiaThinking && (
          <div className="flex gap-3 justify-start items-center animate-fade-in-up">
            <KiaExecutiveAvatar size="sm" isThinking={true} />
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/30 text-xs text-amber-300 flex items-center gap-3 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/15">
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="font-medium">
                KIA está a orquestrar os agentes executivos e a processar o resultado em Luanda...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. Contentor Inferior Fixo (Footer) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (e.dataTransfer.files?.length) {
            processFiles(e.dataTransfer.files);
          }
        }}
        className={`shrink-0 w-full border-t border-slate-800/90 bg-slate-900/95 backdrop-blur-xl p-2.5 sm:p-3.5 flex flex-col gap-2 z-20 shadow-2xl transition-colors ${
          isDraggingOver ? "bg-amber-950/20 ring-2 ring-amber-500/50" : ""
        }`}
      >
        {/* Banner de Progresso OCR em Tempo Real */}
        {isOcrProcessing && ocrProgress && (
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs shadow-lg animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanText className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="font-semibold text-amber-200">Leitor OCR Tesseract Ativo:</span>
                <span className="truncate max-w-[200px] sm:max-w-md font-mono text-[11px] text-amber-300">
                  {ocrProgress.fileName}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-400">{ocrProgress.progress}%</span>
            </div>
            <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(6, ocrProgress.progress)}%` }}
              />
            </div>
            <div className="text-[10px] text-amber-400/90 flex items-center justify-between">
              <span>{ocrProgress.status}</span>
              <span className="font-medium text-amber-500">GAG OCR Engine · Luanda</span>
            </div>
          </div>
        )}

        {/* Notificação de Sucesso OCR / Inserção no Chat */}
        {ocrNotification && !isOcrProcessing && (
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs animate-fade-in-up">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                {ocrNotification.count > 0 ? (
                  <>
                    Texto de <strong className="text-white font-medium">{ocrNotification.fileName}</strong> ({ocrNotification.confidence}% precisão) extraído e inserido no campo abaixo para sua revisão.
                  </>
                ) : (
                  <>
                    Ficheiro <strong className="text-white font-medium">{ocrNotification.fileName}</strong> anexado (sem texto nítido detetado para transcrição).
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOcrNotification(null)}
              className="p-1 hover:text-white text-emerald-400/80 cursor-pointer ml-2 transition-colors"
              title="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Lista de Ficheiros Anexados (com limite de altura e scroll próprio) */}
        {attachments.length > 0 && (
          <div className="max-h-24 overflow-y-auto flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 min-h-0 max-w-5xl mx-auto w-full">
            {attachments.map((att) => {
              const isImg = att.type.startsWith("image/");
              return (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {isImg ? (
                    <ScanText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  {isImg && (
                    <button
                      type="button"
                      onClick={() => handleReRunOcr(att)}
                      disabled={isOcrProcessing}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer border border-amber-500/30 flex items-center gap-1"
                      title="Re-extrair texto com motor OCR Tesseract"
                    >
                      <ScanText className="w-2.5 h-2.5" />
                      <span>Re-OCR</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                    title="Remover anexo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Barra de Input e Botões de Ação */}
        <div className="max-w-5xl mx-auto w-full flex items-end gap-1.5 sm:gap-2 relative">
          {/* Hidden File Input com suporte explícito a imagens e documentos */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.txt,.csv,.json,.doc,.docx"
            multiple
            className="hidden"
          />

          {/* Botão de Anexar Ficheiro / Scanner OCR */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-amber-400 flex items-center justify-center cursor-pointer transition-colors border border-transparent hover:border-slate-700/80 group"
            aria-label="Anexar ficheiro ou imagem com OCR"
            title="Anexar documento ou imagem (Extrai texto automaticamente com OCR Tesseract)"
          >
            <Paperclip className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
          </button>

          {/* Caixa de Texto com suporte a Paste de Screenshots e inserção OCR */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Escreve uma instrução, cola uma captura de ecrã (OCR) ou fala por voz..."
            rows={1}
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/90 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 resize-none max-h-40 leading-relaxed transition-all shadow-inner placeholder:text-slate-500 font-sans"
          />

          {/* Microfone com indicação visual de prontidão */}
          <button
            type="button"
            onClick={toggleListening}
            className={`shrink-0 p-2.5 rounded-xl transition-all cursor-pointer border ${
              isListening
                ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/30"
                : "bg-slate-800/80 border-slate-700/80 text-amber-400/90 hover:text-amber-300 hover:bg-slate-800"
            }`}
            title={
              isListening
                ? "A escutar voz... Clique para parar escuta"
                : "Microfone pronto: Falar com a KIA por voz (Português)"
            }
          >
            <Mic className={`w-5 h-5 ${isListening ? "text-white" : "text-amber-400 hover:text-amber-300"}`} />
          </button>

          {/* Botão de Modo Mãos-Livres */}
          <button
            type="button"
            onClick={toggleHandsFree}
            className={`shrink-0 px-2.5 sm:px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              isHandsFree
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20"
                : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title={
              isHandsFree
                ? "Modo Mãos-Livres Ativo (escuta contínua com pausa de 1.8s e reinício automático após resposta falada)"
                : "Ativar Modo Mãos-Livres (conversa contínua por voz)"
            }
          >
            <Zap className={`w-3.5 h-3.5 ${isHandsFree ? "text-emerald-400 fill-current animate-pulse" : "text-slate-400"}`} />
            <span className="hidden sm:inline">Mãos-Livres</span>
          </button>

          {/* Botão de Enviar */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && attachments.length === 0) || isKiaThinking}
            className="shrink-0 px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl hover:opacity-95 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>

        {/* Rodapé Estratégico */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5">
          <span className="truncate">
            GAG Visual OS · Orquestração em Kwanzas (AOA) · Regra inegociável de 50% de sinal
          </span>
          <span className="hidden sm:inline shrink-0 ml-2">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </span>
        </div>
      </div>

      {/* Persona Customization Modal */}
      <KiaPersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        currentConfig={personaConfig}
        onSave={(newCfg) => {
          setPersonaConfig(newCfg);
          savePersonaConfig(newCfg);
        }}
      />
    </div>
  );
};
