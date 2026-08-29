import React, { useState } from "react";
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Bot,
  Hash,
  Eye,
  X,
  Copy,
  Check,
  Lock,
  Download,
  PlusCircle,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AuditLog } from "../types";

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentUser, activeRole } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCapability, setSelectedCapability] = useState<string>("ALL");
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [customTestNotice, setCustomTestNotice] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (log.action || "").toLowerCase().includes(q) ||
      (log.userName || "").toLowerCase().includes(q) ||
      (log.agentName || "").toLowerCase().includes(q) ||
      (log.hash || "").toLowerCase().includes(q) ||
      (log.capability || "").toLowerCase().includes(q) ||
      (log.details || "").toLowerCase().includes(q);

    const matchesStatus = selectedStatus === "ALL" || log.status === selectedStatus;
    const matchesCapability =
      selectedCapability === "ALL" || (log.capability || "").toLowerCase() === selectedCapability.toLowerCase();

    return matchesSearch && matchesStatus && matchesCapability;
  });

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gag-core-audit-logs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportLogsAsCsv = () => {
    const headers = ["ID", "Timestamp", "User", "Agent", "Action", "Capability", "Status", "Details", "Hash"];
    const rows = auditLogs.map((l) => [
      l.id,
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.userName || ""}"`,
      `"${l.agentName || ""}"`,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${l.capability || ""}"`,
      `"${l.status || ""}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.hash || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gag-core-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Trilha de Auditoria & Segurança</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Assinatura Criptográfica SHA-256 Ativa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registo imutável de todas as ações operacionais, alterações de estado, execuções de skills e acessos com verificação de integridade.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-[11px] text-slate-300">{auditLogs.length} Registos Assinados</span>
          </div>

          <button
            onClick={exportLogsAsCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl text-xs transition-colors"
            title="Exportar trilha em CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={exportLogsAsJson}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold transition-colors"
            title="Exportar trilha em JSON estruturado"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {customTestNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <span>{customTestNotice}</span>
          <button onClick={() => setCustomTestNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Pesquisar por ação, autor, hash SHA-256, detalhes ou capacidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          <option value="ALL">Todos os Estados</option>
          <option value="SUCCESS">Sucesso (SUCCESS)</option>
          <option value="DENIED">Negado / RBAC (DENIED)</option>
          <option value="REVIEW_REQUIRED">Revisão Necessária</option>
          <option value="FAILED">Falha (FAILED)</option>
        </select>
      </div>

      {/* Logs Table / Card Deck */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Shield className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Nenhum registo de auditoria encontrado.</p>
            <p className="text-xs text-slate-500">Tenta ajustar os filtros de pesquisa ou realiza uma operação na KIA ou nas Tarefas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#07090e] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp & Ação</th>
                  <th className="py-3.5 px-4">Agente / Utilizador</th>
                  <th className="py-3.5 px-4">Capacidade / Módulo</th>
                  <th className="py-3.5 px-4">Assinatura SHA-256</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspecionar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-normal">
                {filteredLogs.map((log, idx) => (
                  <tr key={`audit-${log.id}-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{log.action}</div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleString("pt-PT")}</span>
                      </div>
                      {log.details && (
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {log.details}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                          {log.agentId ? (
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-200">
                            {log.userName || log.agentName || "Sistema GAG"}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {log.agentName ? `Agente: ${log.agentName}` : "Utilizador"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {log.capability || "SYSTEM"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-amber-400/90">
                        <Hash className="w-3 h-3 text-slate-500" />
                        <span>{(log.hash || "0x00000000").slice(0, 16)}...</span>
                        <button
                          onClick={() => handleCopyHash(log.hash || "", log.id)}
                          className="p-1 hover:text-white rounded"
                          title="Copiar Hash Completo"
                        >
                          {copiedHashId === log.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : log.status === "DENIED"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        <span>{log.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-amber-300 text-slate-400 transition-colors"
                        title="Ver detalhes completos do registo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Log Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Inspeção Criptográfica do Evento</h2>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Ação Operacional:</span>
                  <span className="font-bold text-white">{inspectingLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Data / Hora:</span>
                  <span className="text-white">{new Date(inspectingLog.timestamp).toLocaleString("pt-PT")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Autor / Agente:</span>
                  <span className="text-white">
                    {inspectingLog.userName} {inspectingLog.agentName ? `(via ${inspectingLog.agentName})` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado da Operação:</span>
                  <span className="font-bold text-emerald-400">{inspectingLog.status}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Hash SHA-256 Assinado:</label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-amber-300 break-all select-all flex items-center justify-between">
                  <span>{inspectingLog.hash}</span>
                  <button
                    onClick={() => handleCopyHash(inspectingLog.hash, inspectingLog.id)}
                    className="ml-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detalhes e Rastro Operacional:</label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {inspectingLog.details || "Sem detalhes adicionais."}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] flex justify-between text-slate-400">
                <span>Origem / Ambiente: <strong className="text-slate-200">{inspectingLog.ipOrEnv || "GAG Core Engine"}</strong></span>
                <span>ID do Registo: <strong className="font-mono text-slate-200">{inspectingLog.id}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
