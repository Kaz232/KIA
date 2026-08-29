import React, { useState, useRef } from "react";
import {
  FileSearch,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Eye,
  Trash2,
  Sparkles,
  RefreshCw,
  X,
  FileCode,
  Layers,
  TrendingUp,
  DollarSign,
  Plus,
  Files,
  Check,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ScannedDocument } from "../types";
import { EconomicScannerTab } from "./EconomicScannerTab";

export const ScannerView: React.FC = () => {
  const {
    scannedDocs,
    uploadAndScanDoc,
    uploadAndScanBatchDocs,
    deleteScannedDoc,
    clearScannedDocs,
    convertDocToKnowledge,
    convertDocToTasks,
    updateDocStatus,
    activeRole,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"ocr" | "finance">("ocr");
  const [isScanning, setIsScanning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
  } | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ScannedDocument | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | File[] | null) => {
    if (!files) return;
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    if (fileArray.length === 0) return;

    setIsScanning(true);

    if (fileArray.length === 1) {
      const file = fileArray[0];
      setBatchProgress({
        current: 1,
        total: 1,
        currentFileName: file.name,
      });
      try {
        const doc = await uploadAndScanDoc(file);
        setNotification(`Documento "${doc.filename}" processado com sucesso!`);
        setSelectedDoc(doc);
      } catch (e: any) {
        setNotification(`Erro ao processar: ${e.message || e}`);
      } finally {
        setIsScanning(false);
        setBatchProgress(null);
        setTimeout(() => setNotification(null), 4000);
      }
    } else {
      // Processamento em lote de múltiplos ficheiros simultâneos
      setBatchProgress({
        current: 1,
        total: fileArray.length,
        currentFileName: fileArray[0].name,
      });

      try {
        const processed = await uploadAndScanBatchDocs(fileArray, (curr, tot, fname) => {
          setBatchProgress({
            current: curr,
            total: tot,
            currentFileName: fname,
          });
        });
        setNotification(`${processed.length} de ${fileArray.length} documentos foram processados com sucesso!`);
        if (processed.length > 0) {
          setSelectedDoc(processed[0]);
        }
      } catch (e: any) {
        setNotification(`Erro ao processar lote: ${e.message || e}`);
      } finally {
        setIsScanning(false);
        setBatchProgress(null);
        setTimeout(() => setNotification(null), 5000);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleConvertKnowledge = (docId: string) => {
    convertDocToKnowledge(docId);
    setNotification("Documento transformado em artigo no Knowledge Base!");
    if (selectedDoc?.id === docId) {
      setSelectedDoc({ ...selectedDoc, status: "PROCESSED_TO_KNOWLEDGE" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConvertTasks = (docId: string) => {
    convertDocToTasks(docId);
    setNotification("Itens de ação extraídos e criados na lista de Tarefas!");
    if (selectedDoc?.id === docId) {
      setSelectedDoc({ ...selectedDoc, status: "PROCESSED_TO_TASK" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBatchConvertKnowledge = () => {
    if (selectedDocIds.length === 0) return;
    selectedDocIds.forEach((id) => convertDocToKnowledge(id));
    setNotification(`${selectedDocIds.length} documento(s) convertidos em artigos na Base de Conhecimento!`);
    setSelectedDocIds([]);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBatchConvertTasks = () => {
    if (selectedDocIds.length === 0) return;
    selectedDocIds.forEach((id) => convertDocToTasks(id));
    setNotification(`Tarefas geradas a partir de ${selectedDocIds.length} documento(s)!`);
    setSelectedDocIds([]);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBatchDelete = () => {
    if (selectedDocIds.length === 0) return;
    selectedDocIds.forEach((id) => deleteScannedDoc(id));
    setNotification(`${selectedDocIds.length} documento(s) eliminados com sucesso.`);
    if (selectedDoc && selectedDocIds.includes(selectedDoc.id)) {
      setSelectedDoc(null);
    }
    setSelectedDocIds([]);
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleSelectDoc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map((d) => d.id));
    }
  };

  const filteredDocs = scannedDocs.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.filename.toLowerCase().includes(q) ||
      doc.fileType.toLowerCase().includes(q) ||
      doc.structuredData?.summary.toLowerCase().includes(q) ||
      doc.structuredData?.suggestedDepartment?.toLowerCase().includes(q) ||
      doc.structuredData?.keyEntities?.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <FileSearch className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Scanner & Inteligência Documental</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              AI Powered Multi-Doc
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            OCR em lote, extração multi-documental em paralelo, DRE económica e conformidade fiscal AGT / BNA.
          </p>
        </div>

        {/* Dual Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("ocr")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === "ocr"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>OCR & Multi-Documentos</span>
          </button>

          <button
            onClick={() => setActiveSubTab("finance")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === "finance"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Scanner Económico (DRE)</span>
          </button>
        </div>
      </div>

      {/* Render Subtab */}
      {activeSubTab === "finance" ? (
        <EconomicScannerTab />
      ) : (
        <>
          {notification && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{notification}</span>
              </span>
              <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
                ×
              </button>
            </div>
          )}

          {/* Drag & Drop Multi-Upload Zone */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 lg:p-10 text-center cursor-pointer transition-all relative overflow-hidden ${
              dragActive
                ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
                : "border-slate-800 bg-[#090c14] hover:border-emerald-500/40"
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                {isScanning ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center justify-center space-x-2">
                  <span>{isScanning ? "A processar documentos em lote..." : "Arrasta ou seleciona múltiplos documentos"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Até 50+ Ficheiros
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pode selecionar <strong>até 50+ ficheiros de uma só vez</strong> (PDFs, faturas, folhas Excel, briefings, imagens PNG/JPG e textos). O motor processa em paralelo com OCR e extração estruturada.
                </p>
              </div>

              {/* Supported formats & batch capacity chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  📄 PDF / DOCX
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  📊 XLS / CSV
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  🖼️ PNG / JPG / OCR
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-mono">
                  ⚡ Fila Paralela
                </span>
              </div>

              {/* Live Batch Progress */}
              {batchProgress && (
                <div className="pt-2 space-y-2 max-w-sm mx-auto">
                  <div className="flex justify-between text-xs text-emerald-300 font-mono">
                    <span className="truncate max-w-[200px]">{batchProgress.currentFileName}</span>
                    <span>
                      {batchProgress.current} / {batchProgress.total} ({Math.round((batchProgress.current / batchProgress.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-emerald-500/30">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-1">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Escolher Múltiplos Ficheiros</span>
                </span>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx,.md,.csv,.xlsx,.json"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          {/* Search, Filter & Multi-Selection Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#090c14] border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar nos documentos por nome, resumo, entidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Batch Actions when items selected */}
            {selectedDocIds.length > 0 ? (
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <span className="text-xs font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  {selectedDocIds.length} selecionado(s)
                </span>

                <button
                  onClick={handleBatchConvertKnowledge}
                  className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  title="Converter selecionados em artigos de conhecimento"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Base Conhecimento</span>
                </button>

                <button
                  onClick={handleBatchConvertTasks}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  title="Gerar tarefas a partir de todos os selecionados"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Criar Tarefas</span>
                </button>

                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  title="Eliminar documentos selecionados"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>

                <button
                  onClick={() => setSelectedDocIds([])}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  title="Limpar seleção"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {scannedDocs.length > 0 && (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Selecionar Todos</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("Deseja limpar todos os documentos do scanner?")) {
                          clearScannedDocs();
                          setSelectedDoc(null);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all"
                      title="Limpar todos os documentos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Base</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Scanned Documents Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <span>Documentos Processados</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                  {filteredDocs.length} de {scannedDocs.length}
                </span>
              </h2>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center bg-[#090c14] border border-slate-800/80 rounded-2xl space-y-2">
                <Files className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">Nenhum documento encontrado</p>
                <p className="text-xs text-slate-500">
                  Carregue múltiplos ficheiros acima para análise inteligente, OCR e conversão automática.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc, idx) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={`doc-${doc.id}-${idx}`}
                      onClick={() => setSelectedDoc(doc)}
                      className={`bg-[#090c14] border rounded-2xl p-5 cursor-pointer group transition-all flex flex-col justify-between shadow-lg relative ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-950/10 shadow-emerald-500/10"
                          : "border-slate-800 hover:border-emerald-500/40"
                      }`}
                    >
                      <div>
                        {/* Card Header & Checkbox */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => toggleSelectDoc(doc.id, e)}
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-emerald-500 border-emerald-400 text-black"
                                  : "border-slate-700 hover:border-slate-500 bg-slate-900"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 uppercase font-bold">
                              {doc.fileType.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                doc.status === "APPROVED" || doc.status === "PROCESSED_TO_KNOWLEDGE"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : doc.status === "PROCESSED_TO_TASK"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : doc.status === "REVIEW_REQUIRED"
                                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {doc.status.replace(/_/g, " ")}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScannedDoc(doc.id);
                                if (selectedDoc?.id === doc.id) setSelectedDoc(null);
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Eliminar documento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {doc.filename}
                        </h3>

                        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {doc.structuredData?.summary || doc.ocrText || "Documento estruturado"}
                        </p>

                        {/* Entities / Tags Preview */}
                        {doc.structuredData?.keyEntities && doc.structuredData.keyEntities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {doc.structuredData.keyEntities.slice(0, 3).map((entity, eIdx) => (
                              <span
                                key={eIdx}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                              >
                                {entity}
                              </span>
                            ))}
                            {doc.structuredData.keyEntities.length > 3 && (
                              <span className="text-[9px] text-slate-500">
                                +{doc.structuredData.keyEntities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{new Date(doc.uploadDate).toLocaleDateString("pt-PT")}</span>
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspecionar</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Document Detail Drawer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090c14] border border-emerald-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="min-w-0 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {selectedDoc.fileType.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedDoc.uploadDate).toLocaleString("pt-PT")}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1 truncate">{selectedDoc.filename}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    deleteScannedDoc(selectedDoc.id);
                    setSelectedDoc(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                  title="Eliminar este documento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Executive Summary */}
              {selectedDoc.structuredData && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sumário Executivo & Diagnóstico</span>
                  </h4>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedDoc.structuredData.summary}
                  </p>
                  {selectedDoc.structuredData.executiveBrief && (
                    <p className="text-slate-400 italic mt-1 leading-relaxed">
                      {selectedDoc.structuredData.executiveBrief}
                    </p>
                  )}
                </div>
              )}

              {/* Action items extracted */}
              {selectedDoc.structuredData?.extractedActionItems &&
                selectedDoc.structuredData.extractedActionItems.length > 0 && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-400 flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Itens de Ação Recomendados ({selectedDoc.structuredData.extractedActionItems.length})</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                      {selectedDoc.structuredData.extractedActionItems.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Key Entities */}
              {selectedDoc.structuredData?.keyEntities && selectedDoc.structuredData.keyEntities.length > 0 && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Entidades e Tópicos Extraídos</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.structuredData.keyEntities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300 text-[11px]"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted OCR Raw Text */}
              {selectedDoc.ocrText && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold">Texto Extraído / Transcrição OCR:</span>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {selectedDoc.ocrText}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => handleConvertKnowledge(selectedDoc.id)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl font-semibold flex items-center justify-center space-x-1.5 text-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Converter em Conhecimento</span>
                </button>

                <button
                  onClick={() => handleConvertTasks(selectedDoc.id)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-xl font-semibold flex items-center justify-center space-x-1.5 text-xs"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Extrair Tarefas</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs"
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
