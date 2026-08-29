import React, { useEffect, useState } from "react";
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Share,
  PlusSquare,
  X,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if app is in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#090c14] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
            G
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Instalar GAG Core OS</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                PWA PRONTA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aplicativo Progressivo Nativo para Computador, Android e iOS
            </p>
          </div>
        </div>

        {installSuccess || isInstalled ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 text-xs text-emerald-300 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>GAG Core instalado e pronto para utilização!</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              O sistema operacional da GAG Visual está instalado no teu dispositivo e pode ser aberto diretamente a partir do ecrã inicial ou menu de aplicações.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Install Trigger Button if browser supports it */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora no Dispositivo (1-Clique)</span>
              </button>
            )}

            {/* Platform Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Desktop / Chrome / Edge */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop (Chrome / Edge)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Clica no ícone de <strong>Instalar</strong> (computador com seta para baixo) na barra de endereço do navegador, ou vai ao menu <strong>⋮ &gt; Instalar GAG Core</strong>.
                </p>
              </div>

              {/* iOS / iPhone / iPad */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>iOS (Safari)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  No Safari, clica no botão <strong>Partilhar</strong> (<Share className="w-3 h-3 inline" />) e seleciona <strong>"Adicionar ao Ecrã Principal"</strong> (<PlusSquare className="w-3 h-3 inline" />).
                </p>
              </div>
            </div>

            {/* Core PWA Features */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-white block">
                Vantagens do GAG Core Instalado:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acesso ultra-rápido em ecrã inteiro sem barra do navegador</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Persistência local segura + Sincronização Cloud Supabase</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reconhecimento de voz e síntese neural ativadas diretamente</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
