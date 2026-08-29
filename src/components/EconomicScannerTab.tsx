import React, { useState, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  RefreshCw,
  X,
  PieChart,
  Percent,
  Download,
  Building,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { FinancialAnalysis } from "../types";

export const EconomicScannerTab: React.FC = () => {
  const { analyzeFinancialRAG, createTask, currentUser, playSfx, setActiveTab } = useApp();

  const [companyName, setCompanyName] = useState("Empresa Retalho & Serviços Luanda Lda");
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [currency, setCurrency] = useState<"AOA" | "USD" | "EUR">("AOA");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FinancialAnalysis | null>(null);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    {
      title: "📊 Balancete Trimestral GAG Q3 2026",
      desc: "Balancete de verificação com receitas de branding, consultoria de IA, salários e retenção AGT.",
      company: "GAG Visual - Comércio Geral e Prestação de Serviços (SU), Lda",
      text: `RELATÓRIO FINANCEIRO & BALANCETE Q3 2026
EMPRESA: GAG Visual (SU), Lda · NIF: 5001654063 · Luanda, Angola
MOEDA: Kwanzas (AOA)

1. PROVEITOS E GANHOS OPERACIONAIS:
- Prestação de Serviços de Branding & Identidade Visual: 38.500.000 Kz
- Consultoria Estratégica de Marketing & IA Generativa: 42.000.000 Kz
- Automação de Processos & Integrações Kaza Core: 25.500.000 Kz
TOTAL RECEITA BRUTA: 106.000.000 Kz

2. CUSTOS DIRETOS DOS SERVIÇOS (COGS):
- Infraestrutura Cloud, GPUs e Licenças de IA (Google, Supabase, Make): 12.800.000 Kz
- Produção Gráfica e Ativos Multimédia Externos: 8.400.000 Kz
TOTAL CUSTOS DIRETOS: 21.200.000 Kz

3. DESPESAS OPERACIONAIS (OPEX):
- Remunerações e Encargos da Equipa de Especialistas: 34.000.000 Kz
- Instalações, Comunicações e Logística Luanda: 6.500.000 Kz
- Marketing Próprio e Aquisição de Clientes (CAC): 7.200.000 Kz
TOTAL OPEX: 47.700.000 Kz

4. ENQUADRAMENTO FISCAL (AGT):
- Retenção na Fonte de Serviços (6.5%) sofrida pelos clientes
- IVA Regime Geral (14%) faturado e dedutível
- IRT da folha salarial retido na fonte`,
    },
    {
      title: "🏪 Demonstração Financeira Retalho Luanda",
      desc: "DRE de grande rede de retalho e distribuição com margens brutas e projeções de fluxo de caixa.",
      company: "Distribuidora & Supermercados Luanda Sul SA",
      text: `RELATÓRIO FINANCEIRO ANUAL - RETALHO ALIMENTAR & BENS DE CONSUMO
EMPRESA: Distribuidora & Supermercados Luanda Sul SA
PERÍODO: Exercício 2025/2026

- Volume de Faturação Bruta: 340.000.000 Kz
- Custo das Mercadorias Vendidas (CMV): 215.000.000 Kz
- Custos com Pessoal e Lojas (12 unidades em Luanda e Benguela): 62.000.000 Kz
- Eletricidade (Geradores industriais e combustível): 18.500.000 Kz
- Logística e Frota de Distribuição: 14.200.000 Kz
- Custos Financeiros e Câmbio BNA (USD/AOA): 8.900.000 Kz
- IVA liquidado: 14%`,
    },
    {
      title: "🏦 Proposta de Investimento B2B & ROI",
      desc: "Estudo de viabilidade económica para implantação de IA em instituição bancária angolana.",
      company: "Banco Comercial e de Investimento de Angola",
      text: `ESTUDO DE VIABILIDADE ECONÓMICA - PROJETO IA CORPORATIVA GAG CORE
CLIENTE: Banco Comercial e de Investimento
ORÇAMENTO DO PROJETO: 65.000.000 Kz

BENEFÍCIOS ECONÓMICOS PROJETADOS A 12 MESES:
- Redução de tempo na triagem de crédito: 75% de economia de horas-homem (estimado em 38.000.000 Kz/ano)
- Automação de OCR em faturas e balancetes: redução de erros operacionais (economia estimada em 24.000.000 Kz)
- Aumento de conversão de novos clientes digitais via IA: receita adicional estimada em 45.000.000 Kz
- Payback esperado: 7 meses
- Retenção na Fonte aplicável: 6.5%`,
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setCompanyName(p.company);
    setInputText(p.text);
    playSfx("click");
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      setInputText(text);
      setCompanyName(file.name.replace(/\.[^/.]+$/, ""));
      playSfx("action");
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    playSfx("execute");

    try {
      const result = await analyzeFinancialRAG(inputText, companyName, currency);
      setAnalysisResult(result);
      playSfx("success");
    } catch (err) {
      console.error("Financial analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateBudgetTasks = () => {
    if (!analysisResult) return;

    createTask({
      title: `Auditoria & Alinhamento Orçamental: ${analysisResult.companyName}`,
      description: `Tarefa gerada pelo Scanner Económico & Financeiro.\nEBITDA: ${(analysisResult.ebitdaAOA).toLocaleString()} Kz (Margem: ${analysisResult.ebitdaMarginPercent}%)\nLucro Líquido: ${(analysisResult.netProfitAOA).toLocaleString()} Kz\nRunway: ${analysisResult.cashRunwayMonths} meses.\n\nRecomendações:\n${analysisResult.recommendations.map((r) => `- ${r}`).join("\n")}`,
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      assignedAgentId: "agent-consultant",
      assignedUserId: currentUser.id,
      tags: ["Finanças", "DRE", "AGT", "Orçamento"],
      category: "Financeiro & Económico",
    });

    playSfx("action");
    setActiveTab("tasks");
  };

  const formatKz = (val: number) => {
    return `${Math.round(val || 0).toLocaleString()} Kz`;
  };

  return (
    <div className="space-y-6">
      {/* Sub-Header / Intro */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d141e] via-[#091522] to-[#0d1f18] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Scanner Económico, DRE & Inteligência Financeira Angolana
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              AGT & BNA CONFORME
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Extração automática de DRE sintética, margens brutas/líquidas, impacto tributário AGT (IVA 14%, Retenção 6.5%) e projeções de ROI para bancos, consultoras e retalho.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Carregar Balancete / PDF</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Presets */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Modelos Financeiros & Relatórios Prontos para Teste:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className="p-3.5 rounded-2xl text-left bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 transition-all hover:bg-slate-900 flex flex-col justify-between space-y-1"
            >
              <div className="font-bold text-xs text-emerald-300">{p.title}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#090c14] border border-slate-800">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Nome da Entidade / Empresa
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-[#07090e] border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Ano Fiscal / Moeda
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="w-24 bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="flex-1 bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none"
            >
              <option value="AOA">AOA (Kwanza)</option>
              <option value="USD">USD (Dólar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Texto do Relatório Financeiro, DRE ou Extrato de Contas
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            placeholder="Cola aqui os valores de receitas, custos diretos, OPEX, folha salarial e notas fiscais..."
            className="w-full bg-[#07090e] border border-slate-800 focus:border-emerald-500/60 rounded-2xl p-4 text-xs text-emerald-300 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>A Analisar DRE & Riscos Fiscais...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Executar Scanner Económico & DRE</span>
            </>
          )}
        </button>
      </div>

      {/* Financial Intelligence Dashboard Output */}
      {analysisResult && (
        <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
          {/* Top Key Financial KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Receita Bruta (Faturação)</div>
              <div className="text-xl font-black text-white">{formatKz(analysisResult.revenueAOA)}</div>
              <div className="text-[10px] text-emerald-400 font-medium">Margem Bruta: {analysisResult.grossMarginPercent}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">EBITDA Operacional</div>
              <div className="text-xl font-black text-emerald-400">{formatKz(analysisResult.ebitdaAOA)}</div>
              <div className="text-[10px] text-slate-400 font-medium">Margem EBITDA: {analysisResult.ebitdaMarginPercent}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Lucro Líquido Final</div>
              <div className="text-xl font-black text-white">{formatKz(analysisResult.netProfitAOA)}</div>
              <div className="text-[10px] text-cyan-400 font-medium">Margem Líquida: {analysisResult.netMarginPercent}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Runway de Caixa & Payback</div>
              <div className="text-xl font-black text-amber-400">{analysisResult.cashRunwayMonths} meses</div>
              <div className="text-[10px] text-slate-400 font-medium">Payback: {analysisResult.roiProjection.expectedPaybackMonths} meses</div>
            </div>
          </div>

          {/* DRE Sintética Breakdown & AGT Tax Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DRE Table */}
            <div className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Demonstração de Resultados (DRE) Sintética
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">PGC / NIRF</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-300">Receita Bruta Operacional</span>
                  <span className="font-bold text-white">{formatKz(analysisResult.revenueAOA)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">(-) Custos Diretos / COGS</span>
                  <span className="font-bold text-rose-400">-{formatKz(analysisResult.cogsAOA)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60 bg-emerald-500/5 px-2 rounded-lg">
                  <span className="font-semibold text-emerald-300">(=) Lucro Bruto</span>
                  <span className="font-bold text-emerald-300">{formatKz(analysisResult.grossProfitAOA)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">(-) Despesas Operacionais (OPEX)</span>
                  <span className="font-bold text-rose-400">-{formatKz(analysisResult.opexAOA)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60 bg-cyan-500/5 px-2 rounded-lg">
                  <span className="font-semibold text-cyan-300">(=) EBITDA</span>
                  <span className="font-bold text-cyan-300">{formatKz(analysisResult.ebitdaAOA)}</span>
                </div>
                <div className="flex justify-between py-1.5 pt-2 font-black text-sm">
                  <span className="text-white">(=) Resultado Líquido do Exercício</span>
                  <span className="text-emerald-400">{formatKz(analysisResult.netProfitAOA)}</span>
                </div>
              </div>
            </div>

            {/* AGT Tax & BNA Macro Context */}
            <div className="p-5 rounded-2xl bg-[#090c14] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enquadramento Fiscal AGT & BNA Angola</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {analysisResult.taxCompliance.fiscalRegime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold">IVA Estimado ({analysisResult.taxCompliance.ivaRatePercent}%)</div>
                  <div className="text-sm font-bold text-white mt-1">{formatKz(analysisResult.taxCompliance.ivaEstimatedAOA)}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold">Retenção na Fonte ({analysisResult.taxCompliance.retencaoFonteRatePercent}%)</div>
                  <div className="text-sm font-bold text-amber-300 mt-1">{formatKz(analysisResult.taxCompliance.retencaoFonteAOA)}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold">Câmbio BNA (USD/AOA)</div>
                  <div className="text-sm font-bold text-cyan-300 mt-1">{analysisResult.macroContext.usdRateAOA} Kz</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold">Taxa BNA / Inflação</div>
                  <div className="text-sm font-bold text-emerald-300 mt-1">{analysisResult.macroContext.bnaInterestRatePercent}% / {analysisResult.macroContext.inflationRatePercent}%</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-amber-400">Parecer Fiscal:</div>
                <p className="leading-relaxed">{analysisResult.taxCompliance.notes}</p>
              </div>
            </div>
          </div>

          {/* Insights & Actions */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Insights Estratégicos & Recomendações do Consultor GAG</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-400">Diagnóstico & Pontos Fortes:</div>
                <ul className="space-y-1 text-slate-300">
                  {analysisResult.keyInsights?.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-cyan-400">Plano de Otimização Financeira:</div>
                <ul className="space-y-1 text-slate-300">
                  {analysisResult.recommendations?.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={handleCreateBudgetTasks}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Converter em Tarefas Orçamentais no Kanban</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
