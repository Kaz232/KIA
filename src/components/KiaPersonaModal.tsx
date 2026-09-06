import React, { useState } from "react";
import {
  X,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  ShieldCheck,
  Brain,
  MessageSquare,
  Award,
  Zap,
} from "lucide-react";
import {
  KiaPersonaConfig,
  AVAILABLE_PERSONA_TRAITS,
  TONE_PRESETS,
  DEFAULT_PERSONA_CONFIG,
  savePersonaConfig,
} from "../config/kiaPersona";
import { playSfx } from "../utils/audio";

interface KiaPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: KiaPersonaConfig;
  onSave: (updated: KiaPersonaConfig) => void;
}

export const KiaPersonaModal: React.FC<KiaPersonaModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<KiaPersonaConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<"personality" | "instructions" | "anti_robot">("personality");
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  if (!isOpen) return null;

  const handleToggleTrait = (traitId: string) => {
    playSfx("click", 0.2);
    setConfig((prev) => {
      const exists = prev.selectedTraits.includes(traitId);
      const updated = exists
        ? prev.selectedTraits.filter((t) => t !== traitId)
        : [...prev.selectedTraits, traitId];
      return { ...prev, selectedTraits: updated };
    });
  };

  const handleSelectTone = (tone: KiaPersonaConfig["tone"]) => {
    playSfx("click", 0.25);
    setConfig((prev) => ({ ...prev, tone }));
  };

  const handleResetDefaults = () => {
    playSfx("click", 0.3);
    setConfig({ ...DEFAULT_PERSONA_CONFIG });
  };

  const handleSaveAndApply = () => {
    savePersonaConfig(config);
    onSave(config);
    playSfx("success", 0.4);
    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Configuração de Persona da KIA
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Anti-Robô Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Define a personalidade, tom executivo e diretrizes em linguagem natural para conversas orgânicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab("personality")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "personality"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Tom & Personalidade</span>
          </button>
          <button
            onClick={() => setActiveTab("instructions")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "instructions"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Diretrizes em Linguagem Natural</span>
          </button>
          <button
            onClick={() => setActiveTab("anti_robot")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "anti_robot"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Regras Anti-Robô & Proibições</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "personality" && (
            <div className="space-y-5">
              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                  Tom de Voz Ativo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(TONE_PRESETS) as Array<KiaPersonaConfig["tone"]>).map((key) => {
                    const preset = TONE_PRESETS[key];
                    const isSelected = config.tone === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectTone(key)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/60 shadow-sm shadow-amber-500/20"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? "text-amber-300" : "text-white"}`}>
                            {preset.label}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personality Traits Chips */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Traços de Personalidade Ativos
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {config.selectedTraits.length} selecionados
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_PERSONA_TRAITS.map((trait) => {
                    const isSelected = config.selectedTraits.includes(trait.id);
                    return (
                      <button
                        type="button"
                        key={trait.id}
                        onClick={() => handleToggleTrait(trait.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                            : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? "bg-amber-500 border-amber-400 text-slate-950"
                              : "border-slate-700 bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold">{trait.label}</div>
                          <div className="text-[10px] text-slate-400 leading-snug">{trait.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "instructions" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  Diretrizes Comportamentais Customizadas (Linguagem Natural)
                </label>
                <p className="text-xs text-slate-400 mb-2.5">
                  Instrui a KIA exatamente sobre como ela deve pensar, falar e responder em Luanda.
                </p>
                <textarea
                  value={config.customInstructions}
                  onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
                  rows={8}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-xs text-slate-200 font-mono focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 outline-none leading-relaxed resize-y"
                  placeholder="Ex: Fala diretamente com o Josemar como braço direito, sem rodeios, destacando sempre soluções comerciais em Kwanzas..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  Relação com Josemar Gourgel (Founder & CEO)
                </label>
                <input
                  type="text"
                  value={config.relationshipWithJosemar}
                  onChange={(e) => setConfig({ ...config, relationshipWithJosemar: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "anti_robot" && (
            <div className="space-y-4">
              {/* Cognitive Protocol: Interpret Before Responding */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>Protocolo Cognitivo: "Interpretar Antes de Responder"</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Obriga a KIA a analisar o contexto, intenção e impacto estratégico nas entrelinhas antes de gerar a resposta em linguagem natural executiva.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, interpretBeforeResponding: !p.interpretBeforeResponding }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    config.interpretBeforeResponding !== false ? "bg-purple-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.interpretBeforeResponding !== false ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Show Strategic Interpretation Badge */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Exibir Tag de Interpretação Prévia no Chat</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mostra um cartão retrátil com a leitura estratégica da KIA acima da resposta, permitindo auditar o seu raciocínio em tempo real.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, showInterpretationBadge: !p.showInterpretationBadge }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    config.showInterpretationBadge !== false ? "bg-amber-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.showInterpretationBadge !== false ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Anti Robotic Switch */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Modo Anti-Robô Estrito</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Proíbe expressamente clichês de IA ("Como assistente virtual...", saudações genéricas) e templates pré-fabricados de 4 passos repetitivos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, antiRoboticMode: !p.antiRoboticMode }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    config.antiRoboticMode ? "bg-amber-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.antiRoboticMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Currency Enforce */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Obrigatoriedade de Moeda em Kwanzas (AOA)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Força todas as cotações, orçamentos e estimativas financeiras da KIA a serem em AOA, com menção à prática de 50% de sinal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, currencyEnforcement: !p.currencyEnforcement }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    config.currencyEnforcement ? "bg-amber-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.currencyEnforcement ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Banned Patterns List */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Frases & Padrões Banned (Zero Tolerância)
                </label>
                <div className="space-y-1.5">
                  {config.prohibitedPatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/40 text-[11px] text-red-300 flex items-center space-x-2"
                    >
                      <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="truncate">"{pat}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-amber-300 flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão de Elite</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={isSavedRecently}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Configuração Salva!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Salvar & Ativar Persona</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
