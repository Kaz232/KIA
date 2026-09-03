import React, { useState, useEffect } from "react";
import {
  FileText,
  Send,
  Download,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Layers,
  Phone,
  Building,
  DollarSign,
  TrendingUp,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { normalizeMarkdownForWhatsApp } from "../utils/whatsappTextNormalizer";
import { GeneratedDeliverable } from "../services/deliverableGenerator";

interface UnifiedSession {
  sessionId: string;
  phone?: string;
  name?: string;
  lastMessage?: string;
  lastActivity: string;
  messageCount: number;
  channel: string;
}

export const WhatsAppDeliverablesAndSessionsTab: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<"deliverables" | "sessions" | "normalizer" | "make_webhook">("deliverables");
  const [deliverableType, setDeliverableType] = useState<"COMMERCIAL_PROPOSAL" | "EXECUTIVE_REPORT" | "MEETING_MINUTES">("COMMERCIAL_PROPOSAL");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Make Webhook Test State
  const [testPhone, setTestPhone] = useState("+244 923 884 190");
  const [testSenderName, setTestSenderName] = useState("Dra. Paula Fernandes");
  const [testMessage, setTestMessage] = useState("Olá KIA! Preciso de uma proposta comercial urgente para Luanda com sinal de 50% em Kwanzas (AOA).");
  const [testGenerateDoc, setTestGenerateDoc] = useState(true);
  const [isSendingToMake, setIsSendingToMake] = useState(false);
  const [makeTestResult, setMakeTestResult] = useState<any>(null);

  // Proposal State
  const [clientName, setClientName] = useState("Dra. Paula Fernandes");
  const [companyName, setCompanyName] = useState("Farmácias Saúde & Vida Luanda");
  const [clientPhone, setClientPhone] = useState("+244 923 884 190");
  const [projectScope, setProjectScope] = useState("Implementação de Identidade Visual Corporativa de Elite, Vídeos Institucionais e Campanhas de Tráfego Pago para novas filiais em Luanda.");
  const [urgency48h, setUrgency48h] = useState(false);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedDeliverable | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Report State
  const [reportTitle, setReportTitle] = useState("Relatório de Performance Digital Q3");
  const [period, setPeriod] = useState("Julho - Setembro 2026");
  const [budgetSpentAOA, setBudgetSpentAOA] = useState("1850000");
  const [estimatedRevenueAOA, setEstimatedRevenueAOA] = useState("7400000");
  const [roas, setRoas] = useState("4.0x");
  const [executiveSummary, setExecutiveSummary] = useState("Campanhas com ROAS de 4.0x gerando aumento de 32% em leads qualificados via WhatsApp.");

  // Meeting Minutes State
  const [meetingTitle, setMeetingTitle] = useState("Alinhamento Estratégico com Diretoria Comercial");
  const [meetingParticipants, setMeetingParticipants] = useState("Josemar Gourgel (Owner), Dra. Paula, Eng. Teresa");
  const [ownerDirectives, setOwnerDirectives] = useState("Sinal obrigatório de 50% confirmado; Produção audiovisual agendada para quarta-feira.");

  // Unified Sessions State
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [syncWebSessionId, setSyncWebSessionId] = useState("kia-main-session");
  const [syncTargetPhone, setSyncTargetPhone] = useState("+244 923 884 190");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Normalizer Interactive Sandbox
  const [markdownInput, setMarkdownInput] = useState(
`# Proposta Estratégica GAG Visual
## Pacote de Lançamento

| Entregável | Prazo | Valor (AOA) |
|---|---|---|
| Rebranding Completo | 10 dias | 1.200.000 AOA |
| Gestão Tráfego Pago | Mensal | 650.000 AOA |

\`\`\`json
{ "sinal": "50%", "urgencia": "48h" }
\`\`\`

**Atenção:** Sinal prévio obrigatório de 50% para validação da ordem de serviço.
Consulte nosso [Portal Executivo](https://gagvisual.ao).`
  );

  const normalizedOutput = normalizeMarkdownForWhatsApp(markdownInput);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch("/api/whatsapp/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      // Fallback local mock
      setSessions([
        {
          sessionId: "session_wa_244923884190",
          phone: "+244 923 884 190",
          name: "Dra. Paula Fernandes",
          lastMessage: "Confirmamos o interesse na proposta com sinal de 50%.",
          lastActivity: new Date().toISOString(),
          messageCount: 8,
          channel: "WHATSAPP",
        },
      ]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeSubView === "sessions") {
      loadSessions();
    }
  }, [activeSubView]);

  const handleGenerateDeliverable = async () => {
    setIsGenerating(true);
    setStatusMessage(null);

    let payload: any = {};
    if (deliverableType === "COMMERCIAL_PROPOSAL") {
      payload = {
        clientName,
        companyName,
        clientPhone,
        projectScope,
        urgency48h,
        options: [
          {
            title: "Pacote Estratégico Core",
            description: "Identidade visual e posicionamento digital",
            priceAOA: 1250000,
            deliveryDays: 10,
            deliverables: ["Brandbook Executivo", "Manual de Aplicação", "Assets para Redes Sociais"],
          },
          {
            title: "Pacote Performance 360° (Recomendado)",
            description: "Identidade, Vídeos em 4K e Gestão de Anúncios",
            priceAOA: 2450000,
            deliveryDays: 15,
            deliverables: ["Identidade Visual Completa", "3 Vídeos Profissionais", "Campanha Meta Ads com Tráfego Direto"],
          },
        ],
      };
    } else if (deliverableType === "EXECUTIVE_REPORT") {
      payload = {
        reportTitle,
        period,
        clientOrProject: companyName,
        clientPhone,
        executiveSummary,
        financialSummaryAOA: {
          budgetSpentAOA: Number(budgetSpentAOA) || 1850000,
          estimatedRevenueAOA: Number(estimatedRevenueAOA) || 7400000,
          roas,
        },
        kpis: [
          { metric: "Retorno s/ Investimento (ROAS)", value: roas, benchmark: "3.2x" },
          { metric: "Leads Qualificados no WhatsApp", value: "418 leads", benchmark: "+32%" },
          { metric: "Custo por Lead (CPL)", value: "4.425 AOA", benchmark: "-18%" },
        ],
        keyFindings: [
          "O canal de WhatsApp converte 3x mais que landing pages estáticas em Luanda.",
          "Vídeos com abordagem local tiveram taxa de retenção de 78%.",
        ],
        recommendations: [
          "Manter a escala no público de Luanda e expandir para Benguela e Huambo.",
          "Adotar sinal de 50% em todos os novos orçamentos com taxa de urgência 48h.",
        ],
      };
    } else {
      payload = {
        meetingTitle,
        date: new Date().toLocaleDateString("pt-PT"),
        locationOrChannel: "WhatsApp Voice & Presencial Luanda",
        participants: meetingParticipants.split(",").map((s) => s.trim()),
        clientOrProject: companyName,
        clientPhone,
        objective: "Alinhamento de escopo, prazos e condições financeiras em AOA.",
        ownerDirectives: ownerDirectives.split(";").map((s) => s.trim()),
        decisionsTaken: [
          "Metodologia TOB aprovada pelo cliente.",
          "Sinal prévio de 50% em Kwanzas confirmado para quarta-feira.",
        ],
        actionItems: [
          { task: "Envio de fatura proforma com IBAN BFA", assignee: "Agente Financeiro", deadline: "Amanhã 10h" },
          { task: "Início do design dos primeiros assets", assignee: "Agente Diretor de Arte", deadline: "Sexta-feira" },
        ],
      };
    }

    try {
      const res = await fetch("/api/deliverables/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: deliverableType,
          payload,
          sendToWhatsApp,
          recipientPhone: clientPhone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.deliverable) {
        setGeneratedResult(data.deliverable);
        setStatusMessage(
          data.whatsAppDispatched
            ? "Entregável gerado e enviado com sucesso ao WhatsApp do cliente!"
            : "Entregável gerado e arquivado com sucesso no Storage!"
        );
      } else {
        throw new Error(data.error || "Falha na geração");
      }
    } catch (err: any) {
      setStatusMessage(`Erro: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncSession = async () => {
    try {
      const res = await fetch("/api/whatsapp/sync-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webSessionId: syncWebSessionId,
          phone: syncTargetPhone,
          name: clientName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(`Sessão sincronizada com sucesso: ${data.unifiedSessionId}`);
        loadSessions();
      } else {
        setSyncStatus(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      setSyncStatus(`Erro na sincronização: ${err.message}`);
    }
  };

  const handleTestMakeWebhook = async () => {
    setIsSendingToMake(true);
    setMakeTestResult(null);
    try {
      const res = await fetch("/api/whatsapp/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          senderName: testSenderName,
          message: testMessage,
          generateDeliverable: testGenerateDoc,
        }),
      });
      const data = await res.json();
      setMakeTestResult(data);
    } catch (err: any) {
      setMakeTestResult({ status: "error", message: err.message });
    } finally {
      setIsSendingToMake(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSubView("deliverables")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubView === "deliverables"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Gerador de Entregáveis em AOA</span>
        </button>

        <button
          onClick={() => setActiveSubView("sessions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubView === "sessions"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Sessões Unificadas & Memória ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView("normalizer")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubView === "normalizer"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Normalizador de Texto Z-API</span>
        </button>

        <button
          onClick={() => setActiveSubView("make_webhook")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubView === "make_webhook"
              ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Webhook Make.com (/api/whatsapp/message)</span>
        </button>
      </div>

      {/* 1. DELIVERABLES VIEW */}
      {activeSubView === "deliverables" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Configuration */}
          <div className="lg:col-span-7 space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Configurar Entregável Corporativo (AOA)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                Metodologia TOB
              </span>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliverableType("COMMERCIAL_PROPOSAL")}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  deliverableType === "COMMERCIAL_PROPOSAL"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Proposta Comercial
              </button>
              <button
                type="button"
                onClick={() => setDeliverableType("EXECUTIVE_REPORT")}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  deliverableType === "EXECUTIVE_REPORT"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Relatório Executivo
              </button>
              <button
                type="button"
                onClick={() => setDeliverableType("MEETING_MINUTES")}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  deliverableType === "MEETING_MINUTES"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Minuta de Reunião
              </button>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nome do Cliente / Decisor</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Empresa / Marca</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Número WhatsApp (+244)</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToWhatsApp}
                    onChange={(e) => setSendToWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <span>Disparar Resumo Imediato para WhatsApp</span>
                </label>
              </div>
            </div>

            {/* Conditional Fields */}
            {deliverableType === "COMMERCIAL_PROPOSAL" && (
              <>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Diagnóstico & Escopo</label>
                  <textarea
                    rows={2}
                    value={projectScope}
                    onChange={(e) => setProjectScope(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-amber-300">
                    <strong>Regras do Owner:</strong> Sinal obrigatório de 50% em Kwanzas (AOA).
                  </div>
                  <label className="flex items-center space-x-2 text-xs text-amber-200 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={urgency48h}
                      onChange={(e) => setUrgency48h(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <span>Taxa Urgência 48h (+50%)</span>
                  </label>
                </div>
              </>
            )}

            {deliverableType === "EXECUTIVE_REPORT" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Investimento (AOA)</label>
                    <input
                      type="text"
                      value={budgetSpentAOA}
                      onChange={(e) => setBudgetSpentAOA(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Retorno Estimado (AOA)</label>
                    <input
                      type="text"
                      value={estimatedRevenueAOA}
                      onChange={(e) => setEstimatedRevenueAOA(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">ROAS Alcançado</label>
                    <input
                      type="text"
                      value={roas}
                      onChange={(e) => setRoas(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {deliverableType === "MEETING_MINUTES" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Participantes</label>
                  <input
                    type="text"
                    value={meetingParticipants}
                    onChange={(e) => setMeetingParticipants(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Diretrizes & Decisões do Owner</label>
                  <input
                    type="text"
                    value={ownerDirectives}
                    onChange={(e) => setOwnerDirectives(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              onClick={handleGenerateDeliverable}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A Gerar Entregável Corporativo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Gerar Entregável Oficial & Processar Envio</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Pré-Visualização WhatsApp (Mobile)</span>
                </div>
                {generatedResult && (
                  <button
                    onClick={() => handleCopy(generatedResult.whatsAppSummary, "wa-summary")}
                    className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    {copiedField === "wa-summary" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                )}
              </div>

              <div className="bg-[#0b141a] p-4 rounded-xl border border-emerald-500/20 font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner max-h-80 overflow-y-auto">
                {generatedResult
                  ? generatedResult.whatsAppSummary
                  : `*GAG VISUAL — PROPOSTA COMERCIAL*\nOlá ${clientName}! Apresentamos a proposta estratégica para ${companyName} com base na Metodologia TOB:\n\n*Opção 1 — Pacote Core:* 1.250.000 AOA\n• Prazo: 10 dias úteis\n\n*Opção 2 — Performance 360°:* 2.450.000 AOA\n• Prazo: 15 dias úteis\n\n*Condições:* Sinal obrigatório de 50% para início dos trabalhos.\nFicamos ao dispor para agendar a homologação!`}
              </div>

              {generatedResult && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Documento HTML/PDF:</span>
                  <a
                    href={`data:text/html;charset=utf-8,${encodeURIComponent(generatedResult.htmlContent)}`}
                    download={`${generatedResult.title.replace(/\s+/g, "_")}.html`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold border border-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descarregar HTML</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. UNIFIED SESSIONS VIEW */}
      {activeSubView === "sessions" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Sessões Unificadas (Web + WhatsApp Mobile)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Histórico persistente e sincronizado entre o chat web da KIA e as conversas reais no WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadSessions}
                disabled={isLoadingSessions}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? "animate-spin" : ""}`} />
                <span>Atualizar Sessões</span>
              </button>
            </div>
          </div>

          {/* Sync Box */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-bold">Vincular Sessão Web a Contacto WhatsApp:</span>
              <input
                type="text"
                value={syncTargetPhone}
                onChange={(e) => setSyncTargetPhone(e.target.value)}
                placeholder="+244 9XX XXX XXX"
                className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono w-44"
              />
            </div>

            <button
              onClick={handleSyncSession}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
            >
              Sincronizar Sessão Web com WhatsApp
            </button>
          </div>
          {syncStatus && <div className="text-xs text-emerald-400 px-1">{syncStatus}</div>}

          {/* Sessions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map((sess) => (
              <div
                key={sess.sessionId}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{sess.name || "Cliente WhatsApp"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {sess.channel}
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-400">{sess.phone || sess.sessionId}</div>
                <p className="text-xs text-slate-400 line-clamp-2">{sess.lastMessage || "Sem mensagens recentes."}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Mensagens: {sess.messageCount}</span>
                  <span>{new Date(sess.lastActivity).toLocaleTimeString("pt-PT")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. NORMALIZER INTERACTIVE SANDBOX */}
      {activeSubView === "normalizer" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Normalizador de Entrada e Saída Z-API / WhatsApp</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              O motor de IA gera Markdown rico com tabelas e blocos de código. No entanto, telemóveis e o WhatsApp não renderizam tabelas HTML ou blocos Markdown complexos de forma legível. Este conversor bidirecional transforma tabelas em listas com marcadores e limpa a formatação para leitura perfeita no WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Entrada Markdown / Formato Bruto (Z-API/IA):</span>
                <span className="text-[10px] text-slate-500">Editor em Tempo Real</span>
              </div>
              <textarea
                rows={10}
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Saída Normalizada para WhatsApp:</span>
                </span>
                <button
                  onClick={() => handleCopy(normalizedOutput, "normalized")}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
                >
                  {copiedField === "normalized" ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar Texto Limpo</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[#0b141a] border border-cyan-500/30 text-xs text-slate-200 whitespace-pre-wrap font-sans min-h-[220px] leading-relaxed shadow-inner">
                {normalizedOutput}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAKE.COM WEBHOOK & WHATSAPP MESSAGE ROUTE */}
      {activeSubView === "make_webhook" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-violet-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                  <Send className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Rota WhatsApp ➔ Make.com & KIA Engine
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    POST /api/whatsapp/message
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Ativo 24/7</span>
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 font-bold">
                  Make Hub Conectado
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta rota recebe mensagens enviadas pelo WhatsApp (via Z-API, Meta Cloud ou simulador), processa o texto através do <strong>Normalizador de WhatsApp</strong>, gera automaticamente entregáveis corporativos em Kwanzas (AOA) com regra de <strong>sinal de 50%</strong> e dispara o payload estruturado para o fluxo da KIA na <strong>Make.com</strong>.
            </p>

            {/* Target Make Webhook URL info */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold">URL de Destino configurado na Make.com:</div>
              <div className="flex items-center space-x-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-violet-300 break-all">
                <span className="flex-1">https://hook.eu2.make.com/wiv820ed8sbdrmf22s6d226jvgv49mme</span>
                <button
                  type="button"
                  onClick={() => handleCopy("https://hook.eu2.make.com/wiv820ed8sbdrmf22s6d226jvgv49mme", "make_hook_url")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedField === "make_hook_url" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Simulation & Test Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Test Form */}
            <div className="lg:col-span-6 space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Testar Disparo da Rota (/api/whatsapp/message)</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Live Tester</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Telefone / Remetente</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-violet-400 focus:outline-none"
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Nome do Contacto</label>
                  <input
                    type="text"
                    value={testSenderName}
                    onChange={(e) => setTestSenderName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-violet-400 focus:outline-none"
                    placeholder="Nome do Cliente"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Mensagem do WhatsApp</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-violet-400 focus:outline-none leading-relaxed"
                  placeholder="Mensagem do cliente..."
                />
              </div>

              <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center justify-between">
                <div className="text-xs text-violet-200">
                  <strong>Gerador Automático:</strong> Cria proposta comercial em Kwanzas com sinal de 50%.
                </div>
                <label className="flex items-center space-x-2 text-xs text-violet-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testGenerateDoc}
                    onChange={(e) => setTestGenerateDoc(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-500"
                  />
                  <span>Gerar Entregável</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleTestMakeWebhook}
                disabled={isSendingToMake || !testMessage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSendingToMake ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>A Processar Normalização & Enviar para a Make...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Disparar para /api/whatsapp/message ➔ Make.com</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Response Inspector */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Resposta da Rota & Status do Disparo</span>
                  </span>
                  {makeTestResult && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(makeTestResult, null, 2), "make_res_json")}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedField === "make_res_json" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar JSON</span>
                    </button>
                  )}
                </div>

                {makeTestResult ? (
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        makeTestResult.status === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                      }`}
                    >
                      {makeTestResult.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{makeTestResult.message || "Executado"}</span>
                    </div>

                    {makeTestResult.data?.generatedDeliverable && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Entregável Gerado: {makeTestResult.data.generatedDeliverable.title}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0b141a] text-[11px] text-slate-200 font-sans whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed border border-amber-500/20">
                          {makeTestResult.data.generatedDeliverable.whatsAppSummary}
                        </div>
                      </div>
                    )}

                    <pre className="p-3 bg-slate-900/90 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                      {JSON.stringify(makeTestResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                    <Send className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">
                      Clica no botão de teste ao lado para disparar uma requisição e inspecionar a resposta da rota em tempo real.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
