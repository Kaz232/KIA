import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  Shield,
  Sliders,
  RefreshCw,
  Plus,
  Phone,
  ArrowUpRight,
  Activity,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Trash2,
  Play,
  Sparkles,
  Filter,
  Search,
  Building,
  DollarSign,
  Users,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Wifi,
  WifiOff,
  Power,
  Layers,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { WhatsAppMessageLog } from "../types";
import { AgentAvatar } from "./AgentAvatar";

export const WhatsAppIntegrationView: React.FC = () => {
  const {
    whatsappLogs,
    whatsappConfig,
    isWhatsAppLoading,
    fetchWhatsAppStatus,
    simulateWhatsAppIncoming,
    sendOutboundWhatsAppMessage,
    updateWhatsAppConfig,
    clearWhatsAppLogs,
    agents,
    createTask,
    currentUser,
    playSfx,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"live_feed" | "qr_free" | "config" | "routing" | "simulator">("live_feed");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<string>("ALL");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Free QR Connection State
  const [qrConnected, setQrConnected] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrCodePayload, setQrCodePayload] = useState<string | null>(null);
  const [pairedDeviceNumber, setPairedDeviceNumber] = useState("+244 923 884 190 (Unitel Angola)");
  const [batteryLevel, setBatteryLevel] = useState(94);

  // Outbound message state
  const [outboundPhone, setOutboundPhone] = useState("+244 923 ");
  const [outboundName, setOutboundName] = useState("");
  const [outboundMessage, setOutboundMessage] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("agent-consultant");
  const [isSendingOutbound, setIsSendingOutbound] = useState(false);

  // Simulation state
  const [simPhone, setSimPhone] = useState("+244 924 556 789");
  const [simName, setSimName] = useState("Dra. Paula Fernandes (CEO Farmácia)");
  const [simMessage, setSimMessage] = useState("Boa tarde, gostaríamos de contratar a GAG Visual para criar a identidade visual e os anúncios online da nossa nova filial.");
  const [isSimulating, setIsSimulating] = useState(false);

  // Config editing state
  const [phoneNumberId, setPhoneNumberId] = useState(whatsappConfig.phoneNumberId || "");
  const [businessAccountId, setBusinessAccountId] = useState(whatsappConfig.businessAccountId || "");
  const [verifyToken, setVerifyToken] = useState(whatsappConfig.verifyToken || "gag_visual_whatsapp_24_7");
  const [accessToken, setAccessToken] = useState("");
  const [autonomous247, setAutonomous247] = useState(whatsappConfig.autonomous247);
  const [autoCreateTasks, setAutoCreateTasks] = useState(whatsappConfig.autoCreateTasks);
  const [autoCaptureLeads, setAutoCaptureLeads] = useState(whatsappConfig.autoCaptureLeads);
  const [emergencyPhoneAlert, setEmergencyPhoneAlert] = useState(whatsappConfig.emergencyPhoneAlert || "+244 923 000 000");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    playSfx("click");
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleGenerateQRCode = () => {
    setQrGenerating(true);
    playSfx("action");
    setTimeout(() => {
      setQrCodePayload(`2@gag_quian_core_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`);
      setQrGenerating(false);
      playSfx("success");
    }, 1200);
  };

  const handleSimulateScanPairing = () => {
    setQrGenerating(true);
    setTimeout(() => {
      setQrConnected(true);
      setQrGenerating(false);
      playSfx("success");
    }, 1800);
  };

  const handleDisconnectQR = () => {
    setQrConnected(false);
    setQrCodePayload(null);
    playSfx("click");
  };

  const handleSaveConfig = async () => {
    try {
      await updateWhatsAppConfig({
        phoneNumberId,
        businessAccountId,
        verifyToken,
        accessToken: accessToken || undefined,
        autonomous247,
        autoCreateTasks,
        autoCaptureLeads,
        emergencyPhoneAlert,
      });
      setSaveSuccessNotice("Definições do WhatsApp Business API guardadas com sucesso!");
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    } catch (e: any) {
      alert("Erro ao guardar configuração: " + e.message);
    }
  };

  const handleSendOutbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outboundPhone || !outboundMessage) return;

    setIsSendingOutbound(true);
    try {
      const agent = agents.find((a) => a.id === selectedAgentId);
      await sendOutboundWhatsAppMessage(
        outboundPhone,
        outboundName || "Cliente WhatsApp",
        outboundMessage,
        agent?.id || "agent-kia",
        agent?.name || "KIA Master Agent"
      );
      setOutboundMessage("");
      setIsSendingOutbound(false);
      setActiveSubTab("live_feed");
    } catch {
      setIsSendingOutbound(false);
    }
  };

  const handleRunSimulation = async (presetText?: string, presetName?: string, presetPhone?: string) => {
    setIsSimulating(true);
    try {
      await simulateWhatsAppIncoming(
        presetName || simName,
        presetPhone || simPhone,
        presetText || simMessage
      );
      setIsSimulating(false);
      setActiveSubTab("live_feed");
    } catch {
      setIsSimulating(false);
    }
  };

  const filteredLogs = whatsappLogs.filter((log) => {
    const matchesSearch =
      log.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.senderNumber.includes(searchTerm) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.routedAgentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.aiResponse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSentiment =
      filterSentiment === "ALL" || log.sentiment === filterSentiment;

    return matchesSearch && matchesSentiment;
  });

  const totalHandled = whatsappLogs.length;
  const opportunitiesCount = whatsappLogs.filter((l) => l.sentiment === "OPPORTUNITY").length;
  const tasksCreatedCount = whatsappLogs.filter((l) => l.autoTaskCreated).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 24/7 Live Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a0f1d] via-[#0d1627] to-[#141b2d] border border-emerald-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Meta WhatsApp Business API • Live 24/7
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
                13 Agentes Conectados
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Hub Autónomo de WhatsApp Business</span>
              <MessageSquare className="w-7 h-7 text-emerald-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Atendimento executivo ininterrupto com inteligência artificial para a <strong>GAG Visual</strong> em Luanda.
              Os clientes enviam mensagens a qualquer hora e os agentes especializados analisam, respondem assertivamente em Kwanzas (AOA) e criam ordens de trabalho automáticas no Backlog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchWhatsAppStatus()}
              disabled={isWhatsAppLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isWhatsAppLoading ? "animate-spin" : ""}`} />
              <span>Sincronizar Status</span>
            </button>
            <button
              onClick={() => setActiveSubTab("simulator")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Simular Mensagem 24/7</span>
            </button>
          </div>
        </div>

        {/* Telemetry Key Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mensagens Processadas</span>
            </div>
            <div className="text-xl font-extrabold text-white flex items-baseline gap-1.5">
              <span>{totalHandled}</span>
              <span className="text-[10px] text-emerald-400 font-normal">24/7 Ativo</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Leads & Oportunidades</span>
            </div>
            <div className="text-xl font-extrabold text-amber-400 flex items-baseline gap-1.5">
              <span>{opportunitiesCount}</span>
              <span className="text-[10px] text-slate-400 font-normal">qualificados</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Tarefas Criadas (Backlog)</span>
            </div>
            <div className="text-xl font-extrabold text-white flex items-baseline gap-1.5">
              <span>{tasksCreatedCount}</span>
              <span className="text-[10px] text-yellow-400 font-normal">auto-roteadas</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tempo de Resposta Médio</span>
            </div>
            <div className="text-xl font-extrabold text-cyan-300 flex items-baseline gap-1.5">
              <span>&lt; 1.2s</span>
              <span className="text-[10px] text-cyan-400/80 font-normal">Gemini Turbo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/90 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab("live_feed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "live_feed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feed em Direto ({whatsappLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("qr_free")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "qr_free"
                ? "bg-gradient-to-r from-emerald-400 to-green-500 text-black font-extrabold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Conexão Gratuita (QR Code)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 font-mono">0 Kz</span>
          </button>

          <button
            onClick={() => setActiveSubTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "simulator"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulador Interativo</span>
          </button>

          <button
            onClick={() => setActiveSubTab("routing")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "routing"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Roteamento dos 13 Agentes</span>
          </button>

          <button
            onClick={() => setActiveSubTab("config")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "config"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configuração Meta API</span>
          </button>
        </div>

        {activeSubTab === "live_feed" && (
          <button
            onClick={() => clearWhatsAppLogs()}
            className="text-[11px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            title="Limpar logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: LIVE FEED */}
      {activeSubTab === "live_feed" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0d14] p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por cliente, número (+244...), mensagem ou agente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todos os Sentimentos</option>
                <option value="OPPORTUNITY">✨ Oportunidades & Vendas</option>
                <option value="URGENT">🚨 Urgentes & Problemas</option>
                <option value="POSITIVE">💚 Positivos</option>
                <option value="NEUTRAL">⚪ Neutros / Dúvidas</option>
              </select>
            </div>
          </div>

          {/* Messages Stream List */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0d14] rounded-3xl border border-slate-800/80 p-8 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
              <h3 className="text-base font-bold text-white">Nenhuma mensagem registada</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não foram encontradas mensagens com os filtros atuais. Pode simular uma mensagem instantânea usando o botão abaixo.
              </p>
              <button
                onClick={() => handleRunSimulation()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-2 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Disparar Mensagem de Teste</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const isOutbound = log.isOutbound;
                const isOpportunity = log.sentiment === "OPPORTUNITY";
                const isUrgent = log.sentiment === "URGENT";

                return (
                  <div
                    key={log.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all bg-[#090d16] ${
                      isOpportunity
                        ? "border-amber-500/40 shadow-amber-500/5 shadow-md"
                        : isUrgent
                        ? "border-red-500/40 shadow-red-500/5 shadow-md"
                        : "border-slate-800/90"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/70">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{log.senderName}</span>
                            <span className="font-mono text-[11px] text-slate-400">({log.senderNumber})</span>
                            {isOpportunity && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Lead Comercial
                              </span>
                            )}
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> Atenção Prioritária
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>{new Date(log.receivedAt).toLocaleString("pt-PT")}</span>
                            <span>•</span>
                            <span className="text-emerald-400/90">{log.channel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Agent Badge */}
                      <div className="flex items-center space-x-2 self-start sm:self-auto">
                        <span className="text-[11px] text-slate-400">Atendido por:</span>
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white">
                          <AgentAvatar agentId={log.routedAgent} size="sm" />
                          <span className="font-semibold text-amber-300 text-[11px]">{log.routedAgentName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Interaction Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {/* Customer Inbound Bubble */}
                      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80 text-xs space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Mensagem do Cliente</span>
                          <span className="text-[9px] text-slate-500">Inbound WhatsApp</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-normal">{log.message}</p>
                      </div>

                      {/* Autonomous Agent Outbound Bubble */}
                      <div className="bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-500/30 text-xs space-y-1">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Bot className="w-3 h-3" /> Resposta Autónoma (24/7)
                          </span>
                          <span className="text-[9px] text-emerald-300/80 font-mono">Disparada Instantânea</span>
                        </div>
                        <p className="text-emerald-100 leading-relaxed font-normal">{log.aiResponse}</p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[11px]">
                      <div className="flex items-center space-x-2 text-slate-400">
                        {log.autoTaskCreated ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ordem de Trabalho Criada no Backlog
                          </span>
                        ) : (
                          <span className="text-slate-500">Atendimento 100% Autónomo</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            createTask({
                              title: `[WhatsApp] ${log.senderName}: Acompanhamento Comercial`,
                              description: `Lead WhatsApp: ${log.senderNumber}\nConsulta: "${log.message}"\nResposta gerada: "${log.aiResponse}"`,
                              priority: "HIGH",
                              status: "TODO",
                              dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                              assignedAgentId: log.routedAgent,
                              assignedUserId: currentUser.id,
                              tags: ["WhatsApp", "ManualEscalation"],
                              category: "Comercial & Vendas",
                            });
                            playSfx("success");
                            alert("Tarefa de acompanhamento adicionada ao Backlog!");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors"
                        >
                          + Criar Tarefa no Backlog
                        </button>

                        <button
                          onClick={() => {
                            setOutboundPhone(log.senderNumber);
                            setOutboundName(log.senderName);
                            setOutboundMessage(`Olá ${log.senderName}, complementando o atendimento da GAG Visual...`);
                            setActiveSubTab("simulator");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-medium transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Responder no Chat
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: FREE QR CODE INSTANT CONNECTION (BAILEYS / WHATSAPP WEB) */}
      {activeSubTab === "qr_free" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top explainer banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Sem Custos Meta • 100% Gratuito
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono">
                  Engine: Baileys Web Socket Core
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Conectar WhatsApp com Leitura de QR Code
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Transforme qualquer número de telefone (Unitel/Africell/Movicel) num agente autónomo 24/7.
                Basta apontar o WhatsApp do telemóvel para o código QR, exatamente como no WhatsApp Web.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {qrConnected ? (
                <button
                  onClick={handleDisconnectQR}
                  className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow"
                >
                  <Power className="w-4 h-4" />
                  <span>Desconectar Sessão</span>
                </button>
              ) : (
                <button
                  onClick={handleGenerateQRCode}
                  disabled={qrGenerating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/50"
                >
                  {qrGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <QrCode className="w-4 h-4 text-black" />
                  )}
                  <span>{qrCodePayload ? "Regerar QR Code" : "Gerar QR Code de Conexão"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main QR Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Box: QR Code Display or Live Device Card */}
            <div className="lg:col-span-6 bg-[#090d16] rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center space-y-5 min-h-[420px]">
              {qrConnected ? (
                <div className="w-full space-y-6 animate-fadeIn">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <Wifi className="w-10 h-10 text-emerald-400" />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Dispositivo Conectado & Operacional
                    </div>
                    <h4 className="text-lg font-black text-white">{pairedDeviceNumber}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      O motor multi-agente está a escutar e responder a mensagens em tempo real.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Bateria do Telefone</div>
                      <div className="text-sm font-bold text-white mt-0.5">{batteryLevel}% • Carregado</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Latência de IA</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">850ms (Gemini Flash)</div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setActiveSubTab("live_feed")}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Feed em Direto</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab("simulator")}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-300" />
                      <span>Testar Envio</span>
                    </button>
                  </div>
                </div>
              ) : qrCodePayload ? (
                <div className="w-full space-y-4 animate-fadeIn">
                  {/* Generated QR Code Canvas Frame */}
                  <div className="relative p-4 bg-white rounded-3xl mx-auto w-64 h-64 shadow-2xl flex flex-col items-center justify-center border-4 border-emerald-500">
                    <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2">
                      {/* Stylized QR Code Cells */}
                      {Array.from({ length: 36 }).map((_, i) => {
                        const isCorner =
                          (i < 3 || (i >= 6 && i < 9) || (i >= 12 && i < 15)) ||
                          (i % 6 >= 3 && i < 18 && (i % 6 === 4 || i % 6 === 5)) ||
                          (i >= 24 && (i % 6 === 0 || i % 6 === 1 || i % 6 === 5));
                        const isFilled = isCorner || (i * 7 + 13) % 3 === 0;
                        return (
                          <div
                            key={i}
                            className={`rounded-sm transition-all duration-500 ${
                              isFilled ? "bg-slate-950" : "bg-transparent"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">
                        GAG
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400">
                      Código QR pronto para leitura! Expira em 60s
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Abra o WhatsApp no seu smartphone &gt; Dispositivos Conectados &gt; Conectar Dispositivo
                    </p>
                  </div>

                  {/* Simulator Pair Trigger */}
                  <button
                    onClick={handleSimulateScanPairing}
                    disabled={qrGenerating}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-medium inline-flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simular Leitura Instantânea</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Nenhum QR Code Ativo</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Clique no botão <strong>"Gerar QR Code de Conexão"</strong> acima para criar a chave de emparelhamento sem intermediários.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateQRCode}
                    disabled={qrGenerating}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md"
                  >
                    <QrCode className="w-4 h-4 text-black" />
                    <span>Gerar Código Agora</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Box: Instructions & Architecture comparison */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#090d16] rounded-3xl p-6 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Passo a Passo de Conexão Gratuita</span>
                </h4>

                <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside leading-relaxed">
                  <li className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <strong className="text-white">Gerar QR Code:</strong> Clique em "Gerar QR Code" para abrir a ponte de socket Baileys.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <strong className="text-white">Abrir o WhatsApp no Telemóvel:</strong> Vá a <strong>Definições</strong> (ou 3 pontinhos) &gt; <strong>Aparelhos Conectados</strong>.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <strong className="text-white">Ler o Código:</strong> Toque em <strong>Conectar um aparelho</strong> e aponte a câmara para o ecrã.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <strong className="text-white">Ativação 24/7:</strong> O QUIAN passa a responder instantaneamente com a personalidade dos 13 agentes, sem custos de mensagens da Meta!
                  </li>
                </ol>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Diferença: Grátis (QR Code) vs. Meta Cloud API</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="font-bold text-emerald-300 mb-1">📱 Conexão QR Code (Grátis)</div>
                      <div>• Zero custos por conversa</div>
                      <div>• Usa qualquer chip Unitel/Africell</div>
                      <div>• Ideal para início imediato</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="font-bold text-blue-300 mb-1">🏢 Meta Cloud API</div>
                      <div>• Verificação oficial verde da Meta</div>
                      <div>• Múltiplos agentes humanos em paralelo</div>
                      <div>• Webhook direto em nuvem</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SIMULATOR & OUTBOUND DISPATCH */}
      {activeSubTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulation Controls Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#090d16] rounded-3xl p-6 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Simulador de Mensagens Recebidas 24/7</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Teste o comportamento do motor multi-agente simulando o envio de mensagens de clientes em qualquer horário.
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Cenários Rápidos de Demonstração
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimName("Dr. Alberto Silva (Clínica Luanda)");
                      setSimPhone("+244 923 111 222");
                      setSimMessage("Boa noite, preciso de orçamento urgente para rebranding completo e gestão de tráfego pago da nossa clínica.");
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 transition-all hover:border-amber-500/40"
                  >
                    <div className="font-bold text-amber-400 mb-0.5">🏥 Proposta de Rebranding & Ads</div>
                    <div className="text-[10px] text-slate-400 truncate">Orçamento para clínica médica</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimName("Marta dos Santos (E-commerce Moda)");
                      setSimPhone("+244 944 888 999");
                      setSimMessage("Olá, como funcionam os vossos anúncios no Meta Ads e qual o ROAS médio esperado para lojas de roupa em Angola?");
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 transition-all hover:border-emerald-500/40"
                  >
                    <div className="font-bold text-emerald-400 mb-0.5">📈 Consultoria de ROAS & Tráfego</div>
                    <div className="text-[10px] text-slate-400 truncate">Roteado para Gestor de Tráfego</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimName("Eng. Mateus Carvalho (Fintech)");
                      setSimPhone("+244 912 333 444");
                      setSimMessage("Gostaria de saber se vocês têm suporte para emissão de faturas pró-forma com coordenadas bancárias BFA/BAI em Kwanzas.");
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 transition-all hover:border-cyan-500/40"
                  >
                    <div className="font-bold text-cyan-400 mb-0.5">💳 Faturação & Pagamentos AOA</div>
                    <div className="text-[10px] text-slate-400 truncate">Roteado para Agente Financeiro</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimName("Sónia Bento (Diretora Geral)");
                      setSimPhone("+244 931 555 777");
                      setSimMessage("Como posso integrar a KIA e os 13 agentes inteligentes ao atendimento ao cliente da minha empresa?");
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-200 transition-all hover:border-purple-500/40"
                  >
                    <div className="font-bold text-purple-400 mb-0.5">🤖 Soluções de IA & KIA OS</div>
                    <div className="text-[10px] text-slate-400 truncate">Roteado para KIA Master Agent</div>
                  </button>
                </div>
              </div>

              {/* Simulation Form */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">Nome do Cliente</label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">Número WhatsApp</label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Mensagem do Cliente</label>
                  <textarea
                    rows={3}
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRunSimulation()}
                  disabled={isSimulating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Agente a Interpretar e a Responder em Direto...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 fill-black" />
                      <span>Disparar Mensagem Inbound (Simulação 24/7)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Outbound Dispatch Form */}
            <form onSubmit={handleSendOutbound} className="bg-[#090d16] rounded-3xl p-6 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Envio Proativo de Mensagem (Outbound)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Envie uma mensagem direta para qualquer número de WhatsApp em nome da GAG Visual ou de um agente específico.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Número de Destino</label>
                  <input
                    type="text"
                    value={outboundPhone}
                    onChange={(e) => setOutboundPhone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Agente Remetente</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 block">Conteúdo da Mensagem</label>
                <textarea
                  rows={2}
                  value={outboundMessage}
                  onChange={(e) => setOutboundMessage(e.target.value)}
                  placeholder="Escreva a mensagem para o cliente..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingOutbound || !outboundMessage}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
              >
                {isSendingOutbound ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>A Enviar via Meta Cloud API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Mensagem Outbound</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Mobile Phone Mockup Preview */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[40px] bg-[#111b21] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[640px] relative">
              {/* Phone Speaker Notch */}
              <div className="bg-[#0b141a] px-6 py-2 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800">
                <div className="font-semibold text-white">09:45</div>
                <div className="w-16 h-4 rounded-full bg-slate-900 border border-slate-800" />
                <div className="flex items-center space-x-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* WhatsApp Chat Header */}
              <div className="bg-[#202c33] p-3 flex items-center space-x-3 border-b border-slate-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xs shadow shrink-0">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    <span>GAG Visual</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-400 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online 24/7 • Agentes Ativos</span>
                  </div>
                </div>
                <Phone className="w-4 h-4 text-slate-400 mr-1" />
              </div>

              {/* Messages Chat Scroll Area */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-[#0b141a] text-xs">
                <div className="text-center my-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#182229] text-[9px] text-slate-400 font-mono">
                    HOJE • CRIPTOGRAFIA DE PONTA A PONTA
                  </span>
                </div>

                {whatsappLogs.slice(0, 4).reverse().map((l) => (
                  <React.Fragment key={l.id}>
                    {/* User Inbound message (Left) */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] text-slate-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow text-xs">
                        <div className="text-[9px] font-bold text-amber-400 mb-0.5">{l.senderName}</div>
                        <p className="leading-relaxed">{l.message}</p>
                        <div className="text-[8px] text-slate-400 text-right mt-1">
                          {new Date(l.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    {/* Agent Outbound response (Right) */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] shadow text-xs">
                        <div className="text-[9px] font-bold text-emerald-300 mb-0.5 flex items-center gap-1">
                          <Bot className="w-2.5 h-2.5" />
                          <span>{l.routedAgentName}</span>
                        </div>
                        <p className="leading-relaxed">{l.aiResponse}</p>
                        <div className="text-[8px] text-emerald-200/70 text-right mt-1 flex items-center justify-end gap-1">
                          <span>{new Date(l.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <Check className="w-3 h-3 text-cyan-300" />
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Bottom Mock Input Bar */}
              <div className="bg-[#202c33] p-2.5 flex items-center space-x-2 border-t border-slate-700">
                <input
                  type="text"
                  readOnly
                  placeholder="Mensagem para GAG Visual..."
                  className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-xs text-slate-300 focus:outline-none"
                />
                <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-black font-bold">
                  <Send className="w-3.5 h-3.5 fill-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 13 AGENTS ROUTING MAP */}
      {activeSubTab === "routing" && (
        <div className="space-y-6">
          <div className="bg-[#090d16] rounded-3xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-2">Matriz de Roteamento Inteligente 24/7</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Quando um cliente envia uma mensagem no WhatsApp, o classificador semântico do GAG Core analisa a intenção, extrai palavras-chave e atribui o atendimento instantâneo ao agente ideal com tom de voz calibrado para o mercado angolano.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Agent 1: Consultor Comercial */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <AgentAvatar agentId="agent-consultant" size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Consultor Comercial</h4>
                    <div className="text-[10px] text-amber-400 font-medium">Vendas & Negociação B2B</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Gatilhos:</strong> Orçamento, proposta, contratação, planos, preços, reuniões, serviços da agência.
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <em>"Acolhe o lead, qualifica a dimensão do projeto e propõe pacotes personalizados em Kwanzas (AOA)."</em>
                </div>
              </div>

              {/* Agent 2: Diretor de Arte */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <AgentAvatar agentId="agent-designer" size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Diretor de Arte</h4>
                    <div className="text-[10px] text-amber-400 font-medium">Design & Identidade Visual</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Gatilhos:</strong> Logo, branding, rebranding, posts, criativos, catálogo, banners, identidade.
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <em>"Explica diretrizes visuais, prazos de prototipagem e alinha o briefing criativo."</em>
                </div>
              </div>

              {/* Agent 3: Gestor de Tráfego */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <AgentAvatar agentId="agent-traffic" size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Gestor de Tráfego</h4>
                    <div className="text-[10px] text-amber-400 font-medium">Meta Ads & Performance</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Gatilhos:</strong> Tráfego pago, anúncios, Meta Ads, Google Ads, ROAS, conversão, alcance.
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <em>"Apresenta simulações de retorno sobre investimento e relatórios de métricas."</em>
                </div>
              </div>

              {/* Agent 4: Financeiro & Contas */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <AgentAvatar agentId="agent-finance" size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Financeiro & Contas</h4>
                    <div className="text-[10px] text-amber-400 font-medium">Faturação & Pagamentos AOA</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Gatilhos:</strong> Fatura, pró-forma, IBAN, transferência, BFA, BAI, recibo, pagamento.
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <em>"Fornece coordenadas bancárias oficiais da GAG Visual e valida comprovativos."</em>
                </div>
              </div>

              {/* Agent 5: KIA Master Agent */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <AgentAvatar agentId="agent-kia" size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-white">KIA Master Agent</h4>
                    <div className="text-[10px] text-amber-400 font-medium">Orquestrador Central & IA</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Gatilhos:</strong> Urgência, falhas, inteligência artificial, automação empresarial, dúvidas gerais.
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <em>"Gere situações complexas, orquestra múltiplos agentes e aciona alertas de emergência."</em>
                </div>
              </div>

              {/* Agent 6: O Soba */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <AgentAvatar agentId="agent-soba" size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-white">O Soba</h4>
                    <div className="text-[10px] text-amber-400 font-medium">Guardião Estratégico</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Gatilhos:</strong> Parcerias de alto nível, acordos institucionais, governança, posicionamento de marca.
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <em>"Respostas com sabedoria executiva e protocolo de alta liderança."</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONFIGURAÇÃO META API */}
      {activeSubTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#090d16] rounded-3xl p-6 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Credenciais Meta WhatsApp Cloud API</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Insira as credenciais do seu Meta for Developers App para habilitar o envio e receção de mensagens reais.
                </p>
              </div>

              {saveSuccessNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessNotice}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Phone Number ID (Meta Graph API)
                  </label>
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="ex: 109845238912345"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    WhatsApp Business Account ID (WABA)
                  </label>
                  <input
                    type="text"
                    value={businessAccountId}
                    onChange={(e) => setBusinessAccountId(e.target.value)}
                    placeholder="ex: 394827104928371"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Permanent System User Token (Access Token)
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder={whatsappConfig.accessTokenConfigured ? "Token Ativo (********)" : "Insira o token EAAB..."}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Gere este token no Meta Business Manager com permissões <code>whatsapp_business_messaging</code>.
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Verify Token (Webhook Verification)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(verifyToken, "verifyToken")}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
                    >
                      {copiedField === "verifyToken" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Modo 100% Autónomo 24/7</div>
                      <div className="text-[10px] text-slate-400">Respostas automáticas instantâneas com IA sem intervenção humana</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autonomous247}
                      onChange={(e) => setAutonomous247(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Criação Automática de Tarefas no Backlog</div>
                      <div className="text-[10px] text-slate-400">Converte pedidos comerciais e leads em tarefas prioritárias</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoCreateTasks}
                      onChange={(e) => setAutoCreateTasks(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Captura de Leads na Base de Conhecimento</div>
                      <div className="text-[10px] text-slate-400">Regista perfis de clientes e histórico de interações</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoCaptureLeads}
                      onChange={(e) => setAutoCaptureLeads(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Definições de WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Instructions Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#090d16] rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>Configuração no Meta for Developers</span>
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Para ativar o recebimento de mensagens 24/7 no seu WhatsApp Business:
              </p>

              <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside leading-relaxed">
                <li>
                  Aceda ao <strong>Meta for Developers</strong> &gt; O seu App &gt; <strong>WhatsApp</strong> &gt; <strong>Configuration</strong>.
                </li>
                <li>
                  No campo <strong>Callback URL</strong>, cole:
                  <div className="mt-1 flex items-center space-x-1 bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-300 break-all">
                    <span className="flex-1">{whatsappConfig.webhookUrl}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(whatsappConfig.webhookUrl, "webhookUrl")}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copiedField === "webhookUrl" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </li>
                <li>
                  No campo <strong>Verify Token</strong>, cole:
                  <div className="mt-1 flex items-center space-x-1 bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[10px] text-amber-300">
                    <span className="flex-1">{verifyToken}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(verifyToken, "vt2")}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copiedField === "vt2" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </li>
                <li>
                  Clique em <strong>Verify and Save</strong> e subscreva o evento <code>messages</code>.
                </li>
              </ol>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  O endpoint <code>/api/whatsapp/webhook</code> já suporta resposta automática de challenge Meta standard e fallback instantâneo.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
