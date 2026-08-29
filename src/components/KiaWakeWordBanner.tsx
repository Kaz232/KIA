import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { wakeWordDetector, WakeWordEvent } from "../utils/wakeWordDetector";

export const KiaWakeWordBanner: React.FC = () => {
  const {
    systemSettings,
    setActiveTab,
    sendKiaMessage,
    activeTab,
  } = useApp();

  const isEnabled = systemSettings.wakeWordEnabled ?? true;
  const [lastWakeEvent, setLastWakeEvent] = useState<WakeWordEvent | null>(null);
  const [isTriggerActive, setIsTriggerActive] = useState(false);
  const triggerTimeoutRef = useRef<any>(null);

  // Sync wake word detector with settings
  useEffect(() => {
    const unsubEvents = wakeWordDetector.subscribe((event: WakeWordEvent) => {
      setLastWakeEvent(event);
      setIsTriggerActive(true);

      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }

      // Switch to KIA tab if not already there
      if (activeTab !== "kia") {
        setActiveTab("kia");
      }

      // If an immediate command was spoken along with the wake word (e.g. "KIA cria uma tarefa...")
      if (event.isImmediateCommand && event.commandText) {
        // Dispatch directly to KIA
        sendKiaMessage(event.commandText);
      } else {
        // Only wake word said: trigger microphone recording in KiaChatView hands-free
        window.dispatchEvent(
          new CustomEvent("kia-start-voice-recording", {
            detail: { source: "wake_word", timestamp: event.timestamp },
          })
        );
      }

      triggerTimeoutRef.current = setTimeout(() => {
        setIsTriggerActive(false);
      }, 2500);
    });

    if (isEnabled) {
      wakeWordDetector.start();
    } else {
      wakeWordDetector.stop();
    }

    return () => {
      unsubEvents();
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [isEnabled, activeTab, setActiveTab, sendKiaMessage]);

  // Only render a lightweight, non-intrusive floating HUD when actually triggered by voice
  if (!isTriggerActive || !lastWakeEvent) {
    return null;
  }

  return (
    <aside aria-label="Ativação por voz KIA" className="fixed top-20 right-4 lg:right-8 z-50 max-w-sm w-full pointer-events-none animate-fadeIn">
      <div className="pointer-events-auto p-3.5 bg-gradient-to-r from-amber-500/20 via-[#0e1322]/95 to-amber-500/20 backdrop-blur-xl border-2 border-amber-400/80 rounded-2xl shadow-2xl shadow-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black animate-pulse shadow-md shadow-amber-500/40">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  "KIA" Ativada por Voz
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 truncate max-w-[220px]">
                {lastWakeEvent.isImmediateCommand && lastWakeEvent.commandText ? (
                  <>
                    <span className="text-slate-400">Comando: </span>
                    <span className="font-semibold text-amber-200">"{lastWakeEvent.commandText}"</span>
                  </>
                ) : (
                  "A ouvir a tua voz em tempo real..."
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTriggerActive(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Wave Visualizer Bars */}
        <div className="flex items-center justify-center space-x-1 mt-2.5 h-2.5">
          {[40, 80, 100, 60, 90, 100, 75, 45, 85, 95, 60, 30].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-amber-400 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};
