import React, { useState, useEffect } from "react";
import {
  Zap,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Bot,
  Database,
  Network,
  Film,
  Palette,
  TrendingUp,
  Headphones,
  Briefcase,
  Crown,
  Play,
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface SynergyWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SynergyWalkthroughModal: React.FC<SynergyWalkthroughModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { triggerAgentSynergyExecution, setActiveTab, playSfx } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      id: "concept",
      title: "O Conceito de Sinergia GAG Core",
      subtitle: "Por que 13 agentes integrados superam qualquer prompt isolado",
      badge: "Visão Geral",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              O Que é a Sinergia Operacional?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No ecossistema <strong>GAG Core OS</strong>, os agentes de Inteligência Artificial não operam como chatbots isolados. Eles funcionam em <strong>Sinergia Contínua</strong>: uma rede neural de agentes especializados que partilham a mesma <em>Base de Conhecimento</em>, a <em>Norma Técnica de Prompting Interativo</em> e o <em>Catálogo de 150+ Prompts Profissionais</em>.
            </p>
          </div>

          {/* Interactive Synergy Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 font-bold text-xs">
                1
              </div>
              <span className="text-xs font-bold text-white">Input / Briefing</span>
              <span className="text-[10px] text-slate-400 mt-1">Ideia, documento ou meta de negócio</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 flex flex-col items-center text-center relative">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center mb-2 font-black text-xs">
                👑
              </div>
              <span className="text-xs font-bold text-amber-300">O Soba (Arquiteto)</span>
              <span className="text-[10px] text-slate-300 mt-1">Gera infraestrutura & prompts</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 font-bold text-xs">
                3
              </div>
              <span className="text-xs font-bold text-white">13 Agentes Ativos</span>
              <span className="text-[10px] text-slate-400 mt-1">Execução especializada paralela</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 font-bold text-xs">
                4
              </div>
              <span className="text-xs font-bold text-emerald-300">Resultado & Auditoria</span>
              <span className="text-[10px] text-slate-400 mt-1">Tarefas, artes e logs validados</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Tempo médio de orquestração síncrona:</span>
            <span className="font-bold text-amber-400">&lt; 600ms via GAG Engine</span>
          </div>
        </div>
      ),
    },
    {
      id: "systems",
      title: "Agentes de Integração & Sistemas",
      subtitle: "Automação de dados e infraestrutura sem falhas operacionais",
      badge: "Sistemas & Infra",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Garantem que os dados de leads, orçamentos e comunicações circulam em tempo real entre formulários, bases de dados e ferramentas de gestão sem intervenção manual.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Kaza Core */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Arquiteto de Automação Kaza Core</h4>
                  <span className="text-[10px] text-cyan-400 font-medium">Supabase, Make, Apps Script & Zapier</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Desenha fluxos de dados automatizados e resilientes para que o CRM e formulários comuniquem perfeitamente.
              </p>
              <div className="text-[10px] bg-slate-950/70 p-2 rounded-lg text-slate-400 border border-slate-800">
                🚀 <strong>Ganho:</strong> 0% perda de leads e automatização de faturas em PDF.
              </div>
            </div>

            {/* Infra Analyst */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-teal-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Analista de Infraestrutura e Redes</h4>
                  <span className="text-[10px] text-teal-400 font-medium">Cisco Packet Tracer & Cibersegurança</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Diagnostica conectividade, desenha topologias de rede corporativa e aplica firewalls e regras de segurança.
              </p>
              <div className="text-[10px] bg-slate-950/70 p-2 rounded-lg text-slate-400 border border-slate-800">
                🔒 <strong>Ganho:</strong> Continuidade de serviços e proteção de dados confidenciais.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "design",
      title: "Agentes de Design & IA Visual",
      subtitle: "Criatividade profissional com identidade e representatividade angolana",
      badge: "Design & Multimodal",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Adequam a produção audiovisual e artística aos padrões estéticos de alto nível, com especialização no modelo <strong>Veo 3.1</strong> e consistência de marca.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Avatar Director */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Diretor de Avatares Veo 3</h4>
                  <span className="text-[10px] text-purple-300">Face-Lock & Cultura</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cria avatares digitais ultra-realistas com traços autênticos angolanos, eliminando o visual artificial.
              </p>
            </div>

            {/* Brandkit Strategist */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Estrategista de Brand Kits</h4>
                  <span className="text-[10px] text-amber-300">Identidade Visual</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Gera manuais de marca, paletas HEX, tipografia e diretrizes de design completas para novos clientes.
              </p>
            </div>

            {/* Art Director */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Diretor de Arte & Motion</h4>
                  <span className="text-[10px] text-rose-300">Cinematografia & Veo</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Estrutura prompts de iluminação, enquadramento de câmara e animações verticais (9:16) e panorâmicas (16:9).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "business",
      title: "Agentes de Escala & Negócios",
      subtitle: "Tráfego pago, funis de conversão e atendimento qualificado",
      badge: "Crescimento & Vendas",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Potenciam o crescimento sustentável da empresa através de estratégias de marketing orientadas a dados e triagem de clientes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Campaigns Manager */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Gestor de Campanhas</h4>
                  <span className="text-[10px] text-emerald-300">Tráfego & ROAS</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Otimiza anúncios, cria testes A/B e analisa o tráfego para maximizar o retorno sobre investimento.
              </p>
            </div>

            {/* Support Engineer */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Engenheiro de Suporte</h4>
                  <span className="text-[10px] text-blue-300">HubSpot & Typeform</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Constrói fluxos de atendimento imediato e triagem prévia antes da transferência para humanos.
              </p>
            </div>

            {/* Consultant */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Consultor Estratégico GAG</h4>
                  <span className="text-[10px] text-amber-300">Value-Based Selling</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Audita propostas de alto valor, quebra objeções e analisa a concorrência no mercado local.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "command",
      title: "O Núcleo de Comando: O Soba & KIA Master",
      subtitle: "Como o arquiteto de IA e a orquestradora governam o ecossistema",
      badge: "Núcleo de Inteligência",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* O Soba Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">O Soba — Arquiteto-Chefe de IA</h4>
                  <span className="text-[10px] text-amber-300 font-semibold">Gera Infraestrutura de Agentes</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Não fala com utilizadores finais: lê dados de entrada e estrutura a configuração completa (System Prompts, Skills, RBAC) de novos agentes na <strong>Agent Factory</strong>.
              </p>
            </div>

            {/* KIA Master Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-950 border border-blue-500/40 space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-black flex items-center justify-center font-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">KIA Master — Orquestradora Central</h4>
                  <span className="text-[10px] text-blue-300 font-semibold">Governança & Raciocínio Sequencial</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Interface conversacional primária com o utilizador. Aplica o protocolo <em>Chain-of-Thought</em> da Norma Técnica para diagnosticar necessidades e coordenar os restantes 12 agentes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 text-center space-y-3">
            <h4 className="text-sm font-bold text-white">Pronto para colocar a equipa em marcha?</h4>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Ao clicar em <strong>Disparar Sinergia Operacional</strong>, todos os 13 agentes serão ativados em paralelo e as respetivas tarefas serão atribuídas no Backlog.
            </p>
            <button
              onClick={() => {
                triggerAgentSynergyExecution();
                localStorage.setItem("gag_synergy_onboarding_seen", "true");
                onClose();
                setActiveTab("kia");
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Disparar Sinergia Agora</span>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    playSfx("action");
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      localStorage.setItem("gag_synergy_onboarding_seen", "true");
      onClose();
    }
  };

  const handlePrev = () => {
    playSfx("action");
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#090c14] border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Onboarding & Walkthrough de Sinergia
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
                  {current.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Passo {currentStep + 1} de {steps.length}: {current.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem("gag_synergy_onboarding_seen", "true");
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-white tracking-wide">{current.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
          </div>

          {current.content}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {/* Step Progress Indicators */}
          <div className="flex items-center space-x-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  playSfx("action");
                  setCurrentStep(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-7 bg-amber-400"
                    : idx < currentStep
                    ? "w-3 bg-amber-600/60"
                    : "w-2 bg-slate-700"
                }`}
                title={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "Concluir Tour" : "Seguinte"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
