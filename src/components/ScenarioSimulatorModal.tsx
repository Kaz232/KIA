import React, { useState } from "react";
import {
  TrendingUp,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  RefreshCw,
  X,
  Target,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ScenarioSimulation } from "../types";

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { simulateScenario, createTask, setActiveTab, playSfx, currentUser } = useApp();

  const [campaignName, setCampaignName] = useState("Lançamento Q4 IA Luanda & Lisboa");
  const [monthlyBudgetAOA, setMonthlyBudgetAOA] = useState(150000); // 150k AOA default (acessível)
  const [averageTicketAOA, setAverageTicketAOA] = useState(25000); // 25k AOA
  const [targetCPA_AOA, setTargetCPA_AOA] = useState(5000); // 5k AOA
  const [conversionRate, setConversionRate] = useState(2.8); // 2.8%
  const [trafficChannel, setTrafficChannel] = useState<ScenarioSimulation["trafficChannel"]>("Meta Ads");
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState<ScenarioSimulation | null>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    playSfx("execute");

    try {
      const result = await simulateScenario({
        campaignName,
        monthlyBudgetAOA,
        averageTicketAOA,
        targetCPA_AOA,
        conversionRatePercent: conversionRate,
        trafficChannel,
      });
      setSimulation(result);
      playSfx("success");
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleInjectToCampaigns = () => {
    if (!simulation) return;

    createTask({
      title: `Executar Estratégia de Tráfego: ${simulation.campaignName}`,
      description: `Estratégia validada pelo Simulador Preditivo de Riscos.\n- Orçamento: ${(simulation.monthlyBudgetAOA).toLocaleString()} Kz\n- ROAS Realista Projetado: ${simulation.scenarios.realistic.roas}x\n- Ponto de Equilíbrio: ${simulation.breakEvenConversions} conversões\n- Canal: ${simulation.trafficChannel}\n\nRecomendações:\n${simulation.recommendations.map((r) => `- ${r}`).join("\n")}`,
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      assignedAgentId: "agent-campaigns",
      assignedUserId: currentUser.id,
      tags: ["Tráfego", "SimulaçãoROAS", "Performance", simulation.trafficChannel],
      category: "Escala & Negócios",
    });

    playSfx("action");
    onClose();
    setActiveTab("tasks");
  };

  const formatKz = (val: number) => {
    return `${Math.round(val).toLocaleString()} Kz`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#090c15] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0a121f] via-[#0e1829] to-[#0a1d2e] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Simulador Preditivo de Cenários & Riscos de Mercado
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30">
                  ROAS & MONTE CARLO AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Testa propostas comerciais e estratégias de tráfego antes de publicar, prevendo ROAS, margens e taxas de conversão.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Nome da Campanha / Proposta
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Canal Principal de Tráfego
              </label>
              <select
                value={trafficChannel}
                onChange={(e) => setTrafficChannel(e.target.value as any)}
                className="w-full bg-[#07090e] border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Meta Ads">Meta Ads (Instagram & Facebook)</option>
                <option value="Google Search">Google Search & YouTube</option>
                <option value="TikTok Ads">TikTok Ads (Reels & Spark Ads)</option>
                <option value="B2B Outbound">B2B Outbound (LinkedIn & E-mail)</option>
                <option value="Omnichannel">Omnichannel Estratégico</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Orçamento Mensal</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={10000}
                    max={50000000}
                    step={5000}
                    value={monthlyBudgetAOA}
                    onChange={(e) => setMonthlyBudgetAOA(Math.max(10000, Number(e.target.value) || 10000))}
                    className="w-24 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-2 py-0.5 text-right text-xs font-bold text-cyan-400 focus:outline-none"
                  />
                  <span className="text-cyan-400 font-bold text-xs">Kz</span>
                </div>
              </div>
              <input
                type="range"
                min={10000}
                max={10000000}
                step={10000}
                value={monthlyBudgetAOA}
                onChange={(e) => setMonthlyBudgetAOA(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[25000, 50000, 100000, 250000, 500000, 1500000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlyBudgetAOA(val)}
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono transition-all ${
                      monthlyBudgetAOA === val
                        ? "bg-cyan-400 text-black font-bold"
                        : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`} Kz
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Ticket Médio</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={1000}
                    max={5000000}
                    step={1000}
                    value={averageTicketAOA}
                    onChange={(e) => setAverageTicketAOA(Math.max(1000, Number(e.target.value) || 1000))}
                    className="w-24 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-2 py-0.5 text-right text-xs font-bold text-cyan-400 focus:outline-none"
                  />
                  <span className="text-cyan-400 font-bold text-xs">Kz</span>
                </div>
              </div>
              <input
                type="range"
                min={1000}
                max={1000000}
                step={5000}
                value={averageTicketAOA}
                onChange={(e) => setAverageTicketAOA(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[5000, 15000, 25000, 50000, 100000, 250000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAverageTicketAOA(val)}
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono transition-all ${
                      averageTicketAOA === val
                        ? "bg-cyan-400 text-black font-bold"
                        : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`} Kz
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wider">CPA Alvo Estimado</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={500}
                    max={200000}
                    step={500}
                    value={targetCPA_AOA}
                    onChange={(e) => setTargetCPA_AOA(Math.max(500, Number(e.target.value) || 500))}
                    className="w-24 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-2 py-0.5 text-right text-xs font-bold text-cyan-400 focus:outline-none"
                  />
                  <span className="text-cyan-400 font-bold text-xs">Kz</span>
                </div>
              </div>
              <input
                type="range"
                min={500}
                max={50000}
                step={500}
                value={targetCPA_AOA}
                onChange={(e) => setTargetCPA_AOA(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[1000, 2500, 5000, 10000, 20000, 35000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetCPA_AOA(val)}
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono transition-all ${
                      targetCPA_AOA === val
                        ? "bg-cyan-400 text-black font-bold"
                        : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {val / 1000}k Kz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>A Calcular Probabilidades...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  <span>Simular 3 Cenários Preditivos</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output */}
          {simulation && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
              {/* 3 Scenario Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pessimistic */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                        Cenário Pessimista
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                        Pior Caso
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-2">
                      {formatKz(simulation.scenarios.pessimistic.revenueAOA)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ROAS: <span className="font-bold text-rose-300">{simulation.scenarios.pessimistic.roas}x</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Conversões:</span>
                      <span className="font-bold text-white">{simulation.scenarios.pessimistic.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Líquido:</span>
                      <span className="font-bold text-rose-300">{formatKz(simulation.scenarios.pessimistic.netProfitAOA)}</span>
                    </div>
                  </div>
                </div>

                {/* Realistic */}
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/50 shadow-lg shadow-cyan-500/10 flex flex-col justify-between space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                        Cenário Realista (Base)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold">
                        MAIS PROVÁVEL
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-2">
                      {formatKz(simulation.scenarios.realistic.revenueAOA)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ROAS: <span className="font-bold text-cyan-300 text-sm">{simulation.scenarios.realistic.roas}x</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-500/20 text-[11px] text-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Conversões:</span>
                      <span className="font-bold text-cyan-300">{simulation.scenarios.realistic.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Líquido:</span>
                      <span className="font-bold text-emerald-400">{formatKz(simulation.scenarios.realistic.netProfitAOA)}</span>
                    </div>
                  </div>
                </div>

                {/* Optimistic */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        Cenário Otimista
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Melhor Caso
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-2">
                      {formatKz(simulation.scenarios.optimistic.revenueAOA)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ROAS: <span className="font-bold text-emerald-300">{simulation.scenarios.optimistic.roas}x</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Conversões:</span>
                      <span className="font-bold text-white">{simulation.scenarios.optimistic.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Líquido:</span>
                      <span className="font-bold text-emerald-400">{formatKz(simulation.scenarios.optimistic.netProfitAOA)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations & Break-even */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      Ponto de Equilíbrio (Break-Even): {simulation.breakEvenConversions} vendas necessárias para cobrir o custo de tráfego
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Score de Risco: {simulation.riskScore}/100 (Baixo)
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recomendações Táticas do Gestor de Campanhas & KIA:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {simulation.recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Inject Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleInjectToCampaigns}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Injetar Estratégia no Gestor de Campanhas (Kanban)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
