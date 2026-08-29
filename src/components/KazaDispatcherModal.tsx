import React, { useState } from "react";
import {
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  Send,
  RefreshCw,
  X,
  Radio,
  FileCode,
  Check,
  Cpu,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { KazaWebhookEvent } from "../types";

interface KazaDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KazaDispatcherModal: React.FC<KazaDispatcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dispatchKazaWebhook, playSfx, setActiveTab } = useApp();

  const [source, setSource] = useState<KazaWebhookEvent["source"]>("Typeform");
  const [endpoint, setEndpoint] = useState("/api/kaza/lead-intake");
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      {
        clientName: "Empresa de Retalho Luanda Lda",
        contactPerson: "Dr. António Silva",
        serviceRequested: "Rebranding Completo & Automação de Vendas com IA",
        budgetAOA: "18.000.000 Kz",
        urgency: "Alta",
        country: "Angola",
      },
      null,
      2
    )
  );

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedEvent, setDispatchedEvent] = useState<KazaWebhookEvent | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      source: "Typeform" as const,
      endpoint: "/api/kaza/lead-intake",
      title: "📋 Novo Lead Qualificado (Typeform)",
      payload: {
        clientName: "Banco Atlântico Inovação",
        projectType: "Brand Kit & Avatares IA com Representatividade Angolana",
        budgetRangeAOA: "25.000.000 - 45.000.000 Kz",
        decisionMaker: "Diretora de Marketing",
      },
    },
    {
      source: "Multicaixa Express" as const,
      endpoint: "/api/kaza/payment-confirmation",
      title: "💳 Confirmação de Pagamento (Multicaixa)",
      payload: {
        reference: "EMIS-9938210-LU",
        amountAOA: "7.500.000 Kz",
        clientNif: "5001654063",
        status: "CONFIRMED",
        serviceId: "srv-consultoria-q4",
      },
    },
    {
      source: "HubSpot" as const,
      endpoint: "/api/kaza/crm-trigger",
      title: "🔄 Gatilho de Automação de CRM (HubSpot)",
      payload: {
        lifecycleStage: "Sales Qualified Lead",
        pipeline: "Grandes Contas B2B",
        recommendedAgent: "agent-consultant",
      },
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setSource(p.source);
    setEndpoint(p.endpoint);
    setPayloadText(JSON.stringify(p.payload, null, 2));
    playSfx("click");
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    playSfx("execute");

    try {
      let parsed = {};
      try {
        parsed = JSON.parse(payloadText);
      } catch {
        parsed = { rawContent: payloadText };
      }

      const event = await dispatchKazaWebhook(source, endpoint, parsed);
      setDispatchedEvent(event);
      playSfx("success");
    } catch (err) {
      console.error("Webhook dispatch failed:", err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#090c15] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#07131d] via-[#0b1c2b] to-[#12283a] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-black shadow-lg shadow-cyan-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Automação de Dispatcher Kaza Core 24/7 (Webhooks & Pipelines)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30">
                  LATÊNCIA ULTRA-BAIXA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Processamento imediato de formulários, pagamentos e integrações (Make, Zapier, Supabase) despachando diretamente para a API do agente especialista.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              1. Simular Evento de Entrada Real (Presets de Produção):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className="p-3.5 rounded-2xl text-left bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-all hover:bg-slate-900"
                >
                  <div className="font-bold text-xs text-cyan-300 mb-1">{p.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.endpoint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Config row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Origem do Webhook (Source)
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-[#07090e] border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Typeform">Typeform (Formulário de Entrada de Leads)</option>
                <option value="HubSpot">HubSpot CRM (Pipeline de Vendas)</option>
                <option value="Supabase">Supabase DB Triggers (Database Webhooks)</option>
                <option value="Multicaixa Express">Multicaixa Express (Gateways de Pagamento)</option>
                <option value="Make/Zapier">Make / Zapier (Workflows Externos)</option>
                <option value="Custom CRM">Custom CRM & APIs de Clientes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Endpoint Receptor Kaza Core
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Payload JSON Editor */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Payload JSON do Pedido</span>
              <span className="text-[10px] text-slate-400 font-mono">application/json</span>
            </label>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={5}
              className="w-full bg-[#07090e] border border-slate-800 focus:border-cyan-500/60 rounded-2xl p-4 text-xs text-cyan-300 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleDispatch}
              disabled={isDispatching}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-500 hover:from-cyan-300 hover:to-emerald-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>A Processar no Kaza Core...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Despachar Webhook 24/7</span>
                </>
              )}
            </button>
          </div>

          {/* Dispatched Result */}
          {dispatchedEvent && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Pedido Despachado sem Fila de Espera em {dispatchedEvent.latencyMs}ms!
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  DISPATCHED_TO_AGENT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Agente Especialista Acionado:</div>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">{dispatchedEvent.routedAgentName}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">ID: {dispatchedEvent.routedAgentId}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Sumário da Operação:</div>
                  <div className="text-white font-medium text-xs mt-0.5">{dispatchedEvent.payloadSummary}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab("tasks");
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5"
                >
                  <span>Ver Ordem de Trabalho no Kanban</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
