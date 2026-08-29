import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
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
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { KiaTamagotchiCompanion } from "./KiaTamagotchiCompanion";
import { wakeWordDetector } from "../utils/wakeWordDetector";
import { stopTtsAudio, playSfx, getIsSpeaking } from "../utils/audio";
import { ChatAttachment } from "../types";

export const KiaChatView: React.FC = () => {
  const {
    chatMessages,
    sendKiaMessage,
    isKiaThinking,
    supabaseHealth,
    refreshSupabaseHealth,
    systemSettings,
    updateSettings,
    clearChat,
    setActiveTab,
    setIsSynergyModalOpen,
    setIsScenarioModalOpen,
    setIsKazaModalOpen,
  } = useApp();

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isSilenceCountdown, setIsSilenceCountdown] = useState(false);
  const [isSpeakingLive, setIsSpeakingLive] = useState(false);
  const [isPanelCompact, setIsPanelCompact] = useState(() => {
    return localStorage.getItem("gag_kia_tamagotchi_collapsed") === "true";
  });
  const [ttsMuted, setTtsMuted] = useState(() => !systemSettings.autoAudioTts);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechDetectedRef = useRef(false);
  const autoSentRef = useRef(false);
  const isListeningRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isSpeakingLiveRef = useRef(false);
  const attachmentsRef = useRef(attachments);
  const systemSettingsRef = useRef(systemSettings);

  const isProcessing = isKiaThinking;
  const isBackendConnected = supabaseHealth.isOnline;

  // Keep mutable refs in sync with latest state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isSpeakingLiveRef.current = isSpeakingLive;
  }, [isSpeakingLive]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    systemSettingsRef.current = systemSettings;
  }, [systemSettings]);

  // Monitor speaking status to avoid TTS feedback loops
  useEffect(() => {
    const checkSpeaking = () => {
      const currentlySpeaking = getIsSpeaking();
      setIsSpeakingLive(currentlySpeaking);
    };
    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, []);

  // isSpeakingLive lock: Mutes wake-word detector & aborts ambient transcription during TTS playback
  // and seamlessly hands off back to listening mode once playback concludes
  useEffect(() => {
    isSpeakingLiveRef.current = isSpeakingLive;

    if (isSpeakingLive) {
      // 1. Lock wake word detector completely during TTS speech
      wakeWordDetector.setMutedForPlayback(true);

      // 2. Abort any active speech recognition so KIA's audio output isn't recorded as user input
      if (isListeningRef.current) {
        setIsListening(false);
        isListeningRef.current = false;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort ? recognitionRef.current.abort() : recognitionRef.current.stop();
          } catch {}
        }
      }

      // 3. Clear any pending silence timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setIsSilenceCountdown(false);
      setLiveTranscript("");
      liveTranscriptRef.current = "";
    } else {
      // 4. Seamless hand-off back to listening/wake-word mode when TTS finishes
      wakeWordDetector.setMutedForPlayback(false);
      if (!isListeningRef.current && systemSettingsRef.current.wakeWordEnabled) {
        wakeWordDetector.start();
      }
    }
  }, [isSpeakingLive]);

  // Auto-scroll ao receber novas mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, liveTranscript, isProcessing]);

  // Sincronizar preferência de som
  useEffect(() => {
    setTtsMuted(!systemSettings.autoAudioTts);
  }, [systemSettings.autoAudioTts]);

  const toggleTtsMute = () => {
    const nextMuted = !ttsMuted;
    setTtsMuted(nextMuted);
    updateSettings({ autoAudioTts: !nextMuted });
    if (nextMuted) {
      stopTtsAudio();
    }
  };

  const togglePanelCompact = () => {
    const next = !isPanelCompact;
    setIsPanelCompact(next);
    localStorage.setItem("gag_kia_tamagotchi_collapsed", String(next));
  };

  const handleActionCardClick = (card: any) => {
    playSfx("click", 0.3);
    const url = card.actionUrl || "";
    if (url.startsWith("#tab=")) {
      const tab = url.replace("#tab=", "") as any;
      setActiveTab(tab);
    } else if (url === "#modal=synergy") {
      setIsSynergyModalOpen(true);
    } else if (url === "#modal=scenario") {
      setIsScenarioModalOpen(true);
    } else if (url === "#modal=kaza") {
      setIsKazaModalOpen(true);
    } else {
      if (card.type === "task_created") {
        setActiveTab("tasks");
      } else if (card.type === "document_processed") {
        setActiveTab("scanner");
      } else if (card.type === "knowledge_added") {
        setActiveTab("knowledge");
      } else if (card.type === "skill_executed") {
        setIsSynergyModalOpen(true);
      } else if (card.type === "review_needed") {
        setActiveTab("incidents");
      }
    }
  };

  // Schedule auto-send after user stops speaking (configurable delay, default >= 800ms)
  const scheduleSilenceAutoSend = (text: string) => {
    if (!text || text.trim().length < 2) return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    setIsSilenceCountdown(true);

    const delay = Math.max(
      800,
      systemSettings.voiceSilenceDelayMs || 800
    );

    silenceTimerRef.current = setTimeout(() => {
      if (autoSentRef.current) return;

      autoSentRef.current = true;
      setIsSilenceCountdown(false);

      void stopVoiceRecordingAndSend();
    }, delay);
  };

  // Execução direta do comando de voz sem exigir botão "Enviar"
  const handleVoiceCommandExecution = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isProcessingRef.current) return;

    autoSentRef.current = true;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsSilenceCountdown(false);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort ? recognitionRef.current.abort() : recognitionRef.current.stop();
      }
    } catch {
      // ignore
    }

    setIsListening(false);
    isListeningRef.current = false;
    setLiveTranscript("");
    liveTranscriptRef.current = "";
    speechDetectedRef.current = false;

    playSfx("auto_send", 0.35);

    // Muta deteção de wake-word durante a geração e leitura da resposta
    wakeWordDetector.setMutedForPlayback(true);
    const currentAttachments = [...attachmentsRef.current];
    setAttachments([]);

    try {
      await sendKiaMessage(cleanText, currentAttachments);
    } catch (err) {
      console.error("Erro ao executar comando de voz:", err);
    } finally {
      autoSentRef.current = false;
      if (!getIsSpeaking() && !isSpeakingLiveRef.current) {
        wakeWordDetector.setMutedForPlayback(false);
        if (!systemSettingsRef.current.voiceContinuous && systemSettingsRef.current.wakeWordEnabled) {
          wakeWordDetector.start();
        }
      }
    }
  };

  const stopVoiceRecordingAndSend = async () => {
    const pendingText = liveTranscriptRef.current.trim();
    if (!pendingText || pendingText.length < 2) {
      stopVoiceRecording();
      return;
    }
    await handleVoiceCommandExecution(pendingText);
  };

  // Inicialização e Controlo Permanente do Reconhecimento de Voz
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    let recognition: any = null;

    try {
      recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-PT";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result?.[0]?.transcript || "";

          if (!transcript.trim()) continue;

          if (result.isFinal) {
            finalStr += transcript + " ";
          } else {
            interimStr += transcript;
          }
        }

        const combined = `${finalStr}${interimStr}`.trim();

        if (!combined) return;

        liveTranscriptRef.current = combined;
        setLiveTranscript(combined);
        speechDetectedRef.current = true;

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (finalStr.trim()) {
          scheduleSilenceAutoSend(combined);
        }
      };

      recognition.onspeechend = () => {
        const text = liveTranscriptRef.current.trim();

        if (text.length < 2 || autoSentRef.current) return;

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        setIsSilenceCountdown(true);

        silenceTimerRef.current = setTimeout(() => {
          if (autoSentRef.current) return;

          autoSentRef.current = true;
          setIsSilenceCountdown(false);

          void stopVoiceRecordingAndSend();
        }, 800);
      };

      recognition.onerror = (err: any) => {
        const errorType = err?.error;
        if (errorType !== "no-speech") {
          console.warn("SpeechRecognition event:", errorType);
        }

        if (errorType === "not-allowed" || errorType === "service-not-allowed") {
          setIsListening(false);
          isListeningRef.current = false;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          setIsSilenceCountdown(false);
        }
      };

      recognition.onend = () => {
        if (!isListeningRef.current) return;

        const text = liveTranscriptRef.current.trim();

        if (!text || autoSentRef.current) return;

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          if (autoSentRef.current) return;

          autoSentRef.current = true;
          setIsSilenceCountdown(false);

          void stopVoiceRecordingAndSend();
        }, 800);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Falha ao instanciar SpeechRecognition:", e);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Listener para Wake Word ("KIA") e comandos imediatos
  useEffect(() => {
    const handleWakeStart = () => {
      if (!isListeningRef.current && !isProcessingRef.current && !getIsSpeaking() && !isSpeakingLiveRef.current) {
        startVoiceRecording();
      }
    };
    window.addEventListener("kia-start-voice-recording", handleWakeStart);

    // Subscrição direta no detector de wake-word ("KIA", "Ei KIA", "Olá KIA", "Ok KIA")
    const unsubscribeWake = wakeWordDetector.subscribe((event) => {
      // Ignora ativação se a KIA estiver ativamente a falar (TTS)
      if (getIsSpeaking() || isSpeakingLiveRef.current) {
        return;
      }
      if (event.isImmediateCommand && event.commandText && event.commandText.length >= 2) {
        if (!isProcessingRef.current && !autoSentRef.current) {
          autoSentRef.current = true;
          void handleVoiceCommandExecution(event.commandText);
        }
      } else {
        if (!isListeningRef.current && !isProcessingRef.current) {
          startVoiceRecording();
        }
      }
    });

    return () => {
      window.removeEventListener("kia-start-voice-recording", handleWakeStart);
      unsubscribeWake();
    };
  }, []);

  const startVoiceRecording = () => {
    stopTtsAudio();
    setIsSpeakingLive(false);
    isSpeakingLiveRef.current = false;
    wakeWordDetector.stop();
    wakeWordDetector.setMutedForPlayback(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setLiveTranscript("");
    liveTranscriptRef.current = "";
    speechDetectedRef.current = false;
    autoSentRef.current = false;
    setIsSilenceCountdown(false);

    setIsListening(true);
    isListeningRef.current = true;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      playSfx("click", 0.3);
    } catch (e) {
      console.warn("Início de reconhecimento:", e);
    }
  };

  const stopVoiceRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsSilenceCountdown(false);
    setIsListening(false);
    isListeningRef.current = false;
    setLiveTranscript("");
    liveTranscriptRef.current = "";
    speechDetectedRef.current = false;
    autoSentRef.current = false;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch {
      // ignore
    }

    if (systemSettingsRef.current.wakeWordEnabled) {
      wakeWordDetector.start();
    }
  };

  const toggleListening = () => {
    if (isListeningRef.current) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleManualSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if ((!text && attachments.length === 0) || isProcessing) return;

    setInputText("");
    const currentAttachments = [...attachments];
    setAttachments([]);

    stopTtsAudio();
    playSfx("action", 0.3);

    wakeWordDetector.setMutedForPlayback(true);
    try {
      await sendKiaMessage(text, currentAttachments);
    } finally {
      if (!getIsSpeaking() && !isSpeakingLiveRef.current) {
        wakeWordDetector.setMutedForPlayback(false);
      }
    }
  };

  // Upload de ficheiros
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string)?.split(",")[1] || "";
        const newAttachment: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          base64Data: base64,
        };
        setAttachments((prev) => [...prev, newAttachment]);
        playSfx("click", 0.25);
      };
      reader.readAsDataURL(file);
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSfx("click", 0.2);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full max-h-screen w-full bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Alerta de Desconexão do Backend */}
      {!isBackendConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-amber-400 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Servidor Supabase Desconectado. Operando em modo de contingência local.</span>
          </div>
          <button
            onClick={() => refreshSupabaseHealth()}
            className="flex items-center gap-1 underline hover:text-amber-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reconectar
          </button>
        </div>
      )}

      {/* Painel da Companheira KIA (Tamagotchi / Header) */}
      <div
        className={`transition-all duration-300 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md shrink-0 ${
          isPanelCompact ? "py-2 px-3 sm:px-4" : "p-3 sm:p-4"
        }`}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto gap-3">
          <div className="flex-1 min-w-0">
            <KiaTamagotchiCompanion
              isCompact={isPanelCompact}
              isListening={isListening}
              isThinking={isProcessing}
              isSpeaking={isSpeakingLive}
              liveTranscript={liveTranscript}
              isSilenceCountdown={isSilenceCountdown}
              onStartListening={startVoiceRecording}
              onStopListening={stopVoiceRecording}
              onSendMessage={(txt) => handleVoiceCommandExecution(txt)}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <button
              onClick={toggleTtsMute}
              className={`p-2 rounded-xl border transition-all ${
                ttsMuted
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  : "bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-emerald-400"
              }`}
              title={ttsMuted ? "Ativar Voz KIA (TTS)" : "Silenciar Voz KIA"}
            >
              {ttsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (window.confirm("Deseja limpar todo o histórico desta conversa?")) {
                  clearChat();
                }
              }}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Limpar Histórico do Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={togglePanelCompact}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isPanelCompact ? "Expandir Painel KIA" : "Compactar Painel KIA"}
            >
              {isPanelCompact ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Contentor Principal de Mensagens */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 max-w-5xl mx-auto w-full">
        {chatMessages.length === 0 ? (
          <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">KIA &bull; IA Estratégica GAG Core</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Pronta para criar tarefas, orquestrar os 13 agentes, analisar documentos e executar comandos com voz 100% mãos-livres.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-fadeIn`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md relative group ${
                    isUser
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                      : "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-none"
                  }`}
                >
                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-black/40 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copiar texto"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                  {/* Render Action Result Cards if present */}
                  {msg.executionResult && msg.executionResult.actionCard && (
                    <div className="mt-3 p-3 rounded-xl bg-black/40 border border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-amber-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{msg.executionResult.actionCard.title}</span>
                      </div>
                      <p className="text-slate-300">{msg.executionResult.actionCard.description}</p>
                      <button
                        onClick={() => handleActionCardClick(msg.executionResult?.actionCard)}
                        className="mt-1 flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        <span>{msg.executionResult.actionCard.actionLabel || "Visualizar Ação"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Attachments pills */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/30 text-[11px] text-slate-200 border border-white/10"
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span className="truncate max-w-[140px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </div>
            );
          })
        )}

        {/* Transcrição ao Vivo de Voz */}
        {isListening && (
          <div className="flex flex-col items-end animate-fadeIn">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-blue-600/30 border border-blue-500/50 text-blue-100 rounded-br-none shadow-lg animate-pulse">
              <p className="italic break-words">
                {liveTranscript || "A escutar a tua voz... (envio automático ao pausar)"}
              </p>
            </div>
            <span className="text-[10px] text-blue-400 mt-1 font-semibold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isSilenceCountdown ? "bg-amber-400" : "bg-red-400 animate-ping"}`} />
              {isSilenceCountdown ? "A finalizar fala (800ms)..." : "Microfone Ativo (VAD 800ms)"}
            </span>
          </div>
        )}

        {/* Indicador de Processamento / KIA Thinking */}
        {isProcessing && (
          <div className="flex flex-col items-start animate-fadeIn">
            <div className="rounded-2xl px-4 py-3 bg-slate-900 border border-amber-500/30 text-amber-300 rounded-bl-none flex items-center space-x-2 text-sm shadow-md">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>A KIA está a orquestrar a resposta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Caixa de Entrada de Texto & Controlos de Áudio */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md shrink-0">
        {/* Quick Action Suggestion Chips */}
        <div className="max-w-5xl mx-auto mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Ações Rápidas:
          </span>
          {[
            { label: "⚡ Disparar Sinergia Global", prompt: "Disparar sinergia global com os 13 agentes" },
            { label: "📋 Criar Tarefa de Copywriting", prompt: "Criar uma tarefa urgente de redação para a campanha da GAG" },
            { label: "🔍 Abrir Scanner Documental", prompt: "Abre o scanner documental para OCR de faturas" },
            { label: "🛡️ Executar Autocura", prompt: "Executar diagnóstico e autocura do sistema" },
            { label: "📊 Abrir Dashboard", prompt: "Vai para o dashboard de métricas" },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(chip.prompt);
                void sendKiaMessage(chip.prompt, []);
              }}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 text-[11px] text-slate-300 hover:text-amber-300 font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-40"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Anexos Pendentes */}
        {attachments.length > 0 && (
          <div className="max-w-5xl mx-auto mb-2.5 flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[160px]">{att.name}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  className="text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleManualSend} className="max-w-5xl mx-auto flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Anexar ficheiro ou documento"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleManualSend(e);
                }
              }}
              placeholder={
                isListening ? "A escutar comandos de voz..." : "Escreve uma mensagem para a KIA..."
              }
              rows={1}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 resize-none min-h-[48px] max-h-32 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all shrink-0 ${
              isListening
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse shadow-lg shadow-rose-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
            title={isListening ? "Desativar Microfone" : "Ativar Microfone (Mãos-livres)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="submit"
            disabled={(!inputText.trim() && attachments.length === 0) || isProcessing}
            className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-30 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 shrink-0 cursor-pointer"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
