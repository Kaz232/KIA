import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  Eye,
  Mic,
  Film,
  Image as ImageIcon,
  Globe,
  Database,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface KiaCapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KiaCapabilitiesModal: React.FC<KiaCapabilitiesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setActiveTab } = useApp();

  if (!isOpen) return null;

  const capabilities = [
    {
      category: "Processamento e Raciocínio",
      icon: Cpu,
      color: "text-amber-400",
      items: [
        {
          name: "Modelos Multimodais Adaptativos",
          desc: "Alternância automática e resiliente entre gemini-3.7-flash, gemini-3.6-flash e gemini-3.1-flash-lite.",
          status: "Ativo",
        },
        {
          name: "Raciocínio Estratégico GAG Core",
          desc: "Planeamento de campanhas, roteiros, delegação de tarefas e criação de novos agentes autónomos.",
          status: "Ativo",
        },
      ],
    },
    {
      category: "Criação Visual & Vídeo Multimodal",
      icon: Film,
      color: "text-purple-400",
      items: [
        {
          name: "Geração & Edição de Imagens (Nano/Flash)",
          desc: "Criação de logótipos e artes visuais via gemini-3.1-flash-image-preview.",
          status: "Ativo",
          action: () => {
            setActiveTab("studio");
            onClose();
          },
        },
        {
          name: "Animação de Vídeo Veo",
          desc: "Renderização e animação de fotografias estáticas em 16:9 ou 9:16 via veo-3.1-fast-generate-preview.",
          status: "Ativo",
          action: () => {
            setActiveTab("studio");
            onClose();
          },
        },
      ],
    },
    {
      category: "Conexão em Tempo Real & Pesquisa",
      icon: Globe,
      color: "text-emerald-400",
      items: [
        {
          name: "Google Search Grounding",
          desc: "Respostas com fatos em tempo real e citações de fontes da web via gemini-3.5-flash com ferramenta Google Search.",
          status: "Ativo",
          action: () => {
            setActiveTab("studio");
            onClose();
          },
        },
        {
          name: "Gemini Live Voice (WebSockets)",
          desc: "Interação por voz bidirecional ultra-rápida via gemini-3.1-flash-live-preview.",
          status: "Ativo",
        },
      ],
    },
    {
      category: "Segurança & Persistência Cloud",
      icon: Database,
      color: "text-blue-400",
      items: [
        {
          name: "Firebase Firestore Database",
          desc: "Persistência em nuvem provisionada e protegida por regras com trilha de auditoria imutável.",
          status: "Conectado",
        },
        {
          name: "Google Sign-In & Supabase Auth",
          desc: "Autenticação corporativa com RBAC (Owner, Admin, Agent, Viewer).",
          status: "Ativo",
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#090d16] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#060911] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Checklist de Capacidades do KIA & GAG Core
              </h2>
              <p className="text-xs text-slate-400">
                Inventário completo de ferramentas de Inteligência Artificial e integrações ativas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body list */}
        <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div key={idx} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${cap.color}`} />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {cap.category}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cap.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-2 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{item.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>

                      {item.action && (
                        <button
                          onClick={item.action}
                          className="self-start pt-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                        >
                          <span>Abrir Ferramenta</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#060910] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">GAG CORE OS &bull; Powered by Google Gemini 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
          >
            Fechar Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
