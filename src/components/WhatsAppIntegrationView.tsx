import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  Bot,
  CheckCircle2,
  Clock,
  RefreshCw,
  Phone,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  Layers,
  Settings,
  UserCheck,
  FileText,
  Share2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AgentAvatar } from "./AgentAvatar";
import { WhatsAppDeliverablesAndSessionsTab } from "./WhatsAppDeliverablesAndSessionsTab";

export const WhatsAppIntegrationView: React.FC = () => {
  const {
    whatsappLogs,
    whatsappConfig,
    isWhatsAppLoading,
    fetchWhatsAppStatus,
    sendOutboundWhatsAppMessage,
    updateWhatsAppConfig,
    clearWhatsAppLogs,
    agents,
    createTask,
    currentUser,
    playSfx,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"inbox" | "compose" | "deliverables" | "settings">("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<string>("ALL");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Outbound / Compose state
  const [outboundPhone, setOutboundPhone] = useState("+244 923 ");
  const [outboundName, setOutboundName] = useState("");
  const [outboundMessage, setOutboundMessage] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("agent-consultant");
  const [isSendingOutbound, setIsSendingOutbound] = useState(false);
  const [sendSuccessNotice, setSendSuccessNotice] = useState<string | null>(null);

  // Config editing state
  const [phoneNumberId, setPhoneNumberId] = useState(whatsappConfig.phoneNumberId || "");
  const [businessAccountId, setBusinessAccountId] = useState(whatsappConfig.businessAccountId || "");
  const [verifyToken, setVerifyToken] = useState(whatsappConfig.verifyToken || "gag_visual_whatsapp_24_7");
  const [accessToken, setAccessToken] = useState("");
  const [autonomous247, setAutonomous247] = useState(whatsappConfig.autonomous247);
  const [autoCreateTasks, setAutoCreateTasks] = useState(whatsappConfig.autoCreateTasks);
  const [autoCaptureLeads, setAutoCaptureLeads] = useState(whatsappConfig.autoCaptureLeads);
  const [emergencyPhoneAlert, setEmergencyPhoneAlert] = useState(whatsappConfig.emergencyPhoneAlert || "+244 922 835 116");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    playSfx("click");
    setTimeout(() => setCopiedField(null), 2500);
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
      setSaveSuccessNotice("Configurações do WhatsApp guardadas com sucesso.");
      playSfx("success");
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    } catch (e: any) {
      alert("Erro ao guardar configuração: " + (e?.message || "Erro desconhecido"));
    }
  };

  // Open direct chat on WhatsApp (100% real, works without API setup)
  const handleOpenDirectWhatsApp = (phone: string, text: string) => {
    const sanitizedNumber = phone.replace(/[^0-9]/g, "");
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${sanitizedNumber}${text ? `?text=${encodedText}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
    playSfx("click");
  };

  // Quick handoff to Josemar's phone
  const handleHandoffToJosemar = (senderName: string, senderPhone: string, message: string) => {
    const josemarPhone = emergencyPhoneAlert.replace(/[^0-9]/g, "") || "244922835116";
    const leadText = `*Transbordo de Lead WhatsApp - GAG Visual*\n\n` +
      `*Cliente:* ${senderName || "Não especificado"}\n` +
      `*Telemóvel:* ${senderPhone}\n` +
      `*Mensagem:* "${message}"\n\n` +
      `_Encaminhado diretamente pelo painel GAG Core OS._`;
    const url = `https://wa.me/${josemarPhone}?text=${encodeURIComponent(leadText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    playSfx("click");
  };

  const handleSendOutbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outboundPhone || !outboundMessage) return;

    setIsSendingOutbound(true);
    try {
      const agent = agents.find((a) => a.id === selectedAgentId);
      await sendOutboundWhatsAppMessage(
        outboundPhone,
        outboundName || "Cliente",
        outboundMessage,
        agent?.id || "agent-kia",
        agent?.name || "KIA Master Agent"
      );
      setSendSuccessNotice("Mensagem registada e disparada via API.");
      setOutboundMessage("");
      playSfx("success");
      setTimeout(() => {
        setSendSuccessNotice(null);
        setActiveSubTab("inbox");
      }, 1500);
    } catch {
      // Fallback: offer direct wa.me opening
      handleOpenDirectWhatsApp(outboundPhone, outboundMessage);
    } finally {
      setIsSendingOutbound(false);
    }
  };

  const filteredLogs = whatsappLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.senderName.toLowerCase().includes(term) ||
      log.senderNumber.includes(term) ||
      log.message.toLowerCase().includes(term) ||
      log.routedAgentName.toLowerCase().includes(term) ||
      log.aiResponse.toLowerCase().includes(term);

    const matchesSentiment =
      filterSentiment === "ALL" || log.sentiment === filterSentiment;

    return matchesSearch && matchesSentiment;
  });

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = whatsappConfig.webhookUrl || `${currentOrigin}/api/whatsapp/webhook`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Clean, Refined Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Business</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Webhook Ativo
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Gestão operacional de mensagens, envio de propostas e transbordo direto para WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleCopy(webhookUrl, "top_webhook")}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Copiar URL do Webhook oficial"
          >
            {copiedField === "top_webhook" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Copiar Webhook</span>
          </button>

          <button
            onClick={() => setActiveSubTab("compose")}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Escrever Mensagem</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("inbox")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "inbox"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mensagens & Histórico</span>
          {whatsappLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] text-slate-200">
              {whatsappLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("compose")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "compose"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-400" />
          <span>Enviar & Transbordo</span>
        </button>

        <button
          onClick={() => setActiveSubTab("deliverables")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "deliverables"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Propostas & Documentos</span>
        </button>

        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "settings"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Definições do Webhook</span>
        </button>
      </div>

      {/* TAB 1: INBOX / MESSAGES */}
      {activeSubTab === "inbox" && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por cliente, telemóvel ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-600"
              >
                <option value="ALL">Todas as mensagens</option>
                <option value="OPPORTUNITY">Oportunidades Comerciais</option>
                <option value="URGENT">Atenção Prioritária</option>
                <option value="POSITIVE">Positivas</option>
              </select>

              {whatsappLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Deseja limpar todo o histórico de mensagens?")) {
                      clearWhatsAppLogs();
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Limpar histórico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/80 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Nenhuma mensagem registada</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                As mensagens recebidas através do Webhook configurado ou enviadas diretamente pelo painel ficarão listadas aqui em tempo real.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setActiveSubTab("compose")}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  Escrever Mensagem
                </button>
                <button
                  onClick={() => setActiveSubTab("settings")}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Ver Webhook
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const isOpportunity = log.sentiment === "OPPORTUNITY";
                const isUrgent = log.sentiment === "URGENT";

                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-xs shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs sm:text-sm">{log.senderName}</span>
                            <span className="font-mono text-[11px] text-slate-400">{log.senderNumber}</span>
                            {isOpportunity && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-medium border border-amber-500/20">
                                Oportunidade
                              </span>
                            )}
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 text-[10px] font-medium border border-red-500/20">
                                Urgente
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{new Date(log.receivedAt).toLocaleString("pt-PT")}</span>
                            <span>•</span>
                            <span>{log.channel || "WhatsApp"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="text-[10px] text-slate-500">Agente:</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300">
                          <AgentAvatar agentId={log.routedAgent} size="sm" />
                          <span>{log.routedAgentName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs space-y-1">
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                          Mensagem Recebida
                        </div>
                        <p className="text-slate-200 leading-relaxed">{log.message}</p>
                      </div>

                      <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs space-y-1">
                        <div className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider flex items-center gap-1">
                          <Bot className="w-3 h-3" /> Resposta Registada
                        </div>
                        <p className="text-slate-300 leading-relaxed">{log.aiResponse}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
                      <div className="text-slate-500 text-[11px]">
                        {log.autoTaskCreated ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Tarefa associada no Backlog
                          </span>
                        ) : (
                          <span>Atendimento registado</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open WhatsApp chat */}
                        <button
                          onClick={() => handleOpenDirectWhatsApp(log.senderNumber, "")}
                          className="px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1 transition-colors text-[11px]"
                          title="Abrir no WhatsApp Web ou App"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Abrir WhatsApp</span>
                        </button>

                        {/* Handoff to Josemar */}
                        <button
                          onClick={() => handleHandoffToJosemar(log.senderName, log.senderNumber, log.message)}
                          className="px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium flex items-center gap-1 transition-colors text-[11px]"
                          title="Encaminhar para o telemóvel do Josemar"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Transbordar</span>
                        </button>

                        {/* Create task in backlog */}
                        <button
                          onClick={() => {
                            createTask({
                              title: `[WhatsApp] ${log.senderName}: Acompanhamento`,
                              description: `Contacto: ${log.senderNumber}\nConsulta: "${log.message}"\nResposta: "${log.aiResponse}"`,
                              priority: "HIGH",
                              status: "TODO",
                              dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                              assignedAgentId: log.routedAgent,
                              assignedUserId: currentUser.id,
                              tags: ["WhatsApp", "Lead"],
                              category: "Comercial & Vendas",
                            });
                            playSfx("success");
                            alert("Tarefa adicionada ao Backlog com sucesso.");
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                        >
                          Criar Tarefa
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

      {/* TAB 2: COMPOSE & DIRECT HANDOFF */}
      {activeSubTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Escrever Mensagem WhatsApp</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Envie mensagens comerciais ou abra a conversa diretamente no WhatsApp Web/App com o texto preparado.
                </p>
              </div>

              {sendSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sendSuccessNotice}</span>
                </div>
              )}

              <form onSubmit={handleSendOutbound} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                      Número de Telemóvel
                    </label>
                    <input
                      type="text"
                      value={outboundPhone}
                      onChange={(e) => setOutboundPhone(e.target.value)}
                      placeholder="+244 923 884 190"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                      Nome do Cliente / Empresa
                    </label>
                    <input
                      type="text"
                      value={outboundName}
                      onChange={(e) => setOutboundName(e.target.value)}
                      placeholder="Ex: Dra. Paula Fernandes"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-400">
                      Conteúdo da Mensagem
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {outboundMessage.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={outboundMessage}
                    onChange={(e) => setOutboundMessage(e.target.value)}
                    placeholder="Escreva a mensagem aqui..."
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-normal"
                    required
                  />
                </div>

                {/* Quick Templates */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-medium">Modelos Rápidos:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setOutboundMessage(
                          `Olá ${outboundName || "Cliente"}! Aqui é da equipa da GAG Visual em Luanda. Conforme conversado, preparamos a proposta executiva para o seu projeto com 50% de sinal para adjudicação imediata. Podemos agendar uma chamada para alinhar os detalhes?`
                        )
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                    >
                      Proposta Comercial
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOutboundMessage(
                          `Olá! Seguem as coordenadas bancárias da GAG Visual para liquidação do sinal:\n- Banco BAI: [Seu IBAN BAI]\n- Banco BFA: [Seu IBAN BFA]\nAssim que efetuar a transferência, envie o comprovativo para iniciarmos de imediato.`
                        )
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                    >
                      Dados para Pagamento
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOutboundMessage(
                          `Olá ${outboundName || "Cliente"}! Confirmamos o agendamento da nossa reunião de alinhamento estratégico. Ficamos ao dispor para qualquer esclarecimento prévio.`
                        )
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                    >
                      Confirmação de Reunião
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenDirectWhatsApp(outboundPhone, outboundMessage)}
                    disabled={!outboundPhone}
                    className="flex-1 min-w-[200px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Abrir Conversa no WhatsApp</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSendingOutbound || !outboundPhone || !outboundMessage}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {isSendingOutbound ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Registar / Enviar via API</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Transbordo Humano</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Linha de encaminhamento direto para o telemóvel do responsável comercial da GAG Visual:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500">Contacto de Transbordo:</div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  {emergencyPhoneAlert || "+244 922 835 116"}
                </div>
                <div className="text-[11px] text-slate-400">Josemar Gourgel · Direção Comercial</div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ao clicar em "Transbordar" numa mensagem ou proposta, o sistema formata os detalhes da oportunidade e abre uma conversa pronta no WhatsApp para assumir o contacto de imediato.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROPOSALS & DELIVERABLES */}
      {activeSubTab === "deliverables" && (
        <WhatsAppDeliverablesAndSessionsTab />
      )}

      {/* TAB 4: WEBHOOK & PROVIDER SETTINGS */}
      {activeSubTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Configuração do Webhook e Provedor</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Definições para integração oficial com a Meta WhatsApp Cloud API ou provedores locais.
                </p>
              </div>

              {saveSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessNotice}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    URL do Webhook (Callback URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-300 font-mono select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(webhookUrl, "wh_set")}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                    >
                      {copiedField === "wh_set" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Verify Token (Validação do Webhook)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(verifyToken, "vt_set")}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                    >
                      {copiedField === "vt_set" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Telemóvel para Transbordo e Alertas de Emergência
                  </label>
                  <input
                    type="text"
                    value={emergencyPhoneAlert}
                    onChange={(e) => setEmergencyPhoneAlert(e.target.value)}
                    placeholder="+244 923 884 190"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Credenciais Meta Cloud API (Opcional):</div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Phone Number ID</label>
                    <input
                      type="text"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      placeholder="Ex: 109845238912345"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">WABA ID (WhatsApp Business Account)</label>
                    <input
                      type="text"
                      value={businessAccountId}
                      onChange={(e) => setBusinessAccountId(e.target.value)}
                      placeholder="Ex: 394827104928371"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Permanent Access Token</label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder={whatsappConfig.accessTokenConfigured ? "Token ativo configurado" : "Insira o token EAAB..."}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                    />
                  </div>
                </div>

                {/* Automation Rules */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Atendimento Autónomo com IA</div>
                      <div className="text-[10px] text-slate-500">Responde automaticamente quando o webhook recebe mensagens</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autonomous247}
                      onChange={(e) => setAutonomous247(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Criação Automática de Tarefas no Backlog</div>
                      <div className="text-[10px] text-slate-500">Regista pedidos de clientes diretamente no Backlog da equipa</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoCreateTasks}
                      onChange={(e) => setAutoCreateTasks(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 mt-3"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Configurações</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Como Conectar o Webhook</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pode ligar este sistema a qualquer provedor oficial ou gateway de WhatsApp:
              </p>
              <ol className="text-xs text-slate-400 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>
                  <strong className="text-slate-200">Meta Cloud API:</strong> No Meta for Developers, configure o <em>Callback URL</em> e o <em>Verify Token</em> acima e subscreva o evento <code className="text-emerald-300 font-mono text-[11px]">messages</code>.
                </li>
                <li>
                  <strong className="text-slate-200">Z-API / Provedores Locais:</strong> Insira o Callback URL no painel do seu número para receber eventos de mensagens em tempo real.
                </li>
                <li>
                  <strong className="text-slate-200">Envio Direto:</strong> Não necessita de API para enviar mensagens. Na aba "Enviar & Transbordo", clique em "Abrir Conversa no WhatsApp" para iniciar atendimento imediato no telemóvel ou navegador.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
