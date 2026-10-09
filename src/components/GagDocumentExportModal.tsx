import React, { useState, useEffect } from "react";
import {
  X,
  FileDown,
  Printer,
  FileText,
  FileCode,
  Globe,
  MessageSquare,
  Code,
  Table,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Upload,
  ExternalLink,
  Info,
  Plus,
  Trash2,
  DollarSign,
  Send,
  Eye,
  Settings2,
} from "lucide-react";
import { GagDocumentData, GagExportDocumentType, GagDocumentItem } from "../types";
import {
  GAG_BRAND_DEFAULTS,
  GagBrandIdentity,
  formatAOA,
  calculateDocumentFinancials,
  exportDocumentAsPdf,
  exportDocumentAsDocx,
  exportDocumentAsMarkdown,
  exportDocumentAsHtml,
  exportDocumentAsWhatsApp,
  exportDocumentAsJson,
  exportDocumentAsCsv,
} from "../utils/documentExport";
import { playSfx } from "../utils/audio";

interface GagDocumentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: Partial<GagDocumentData>;
}

export const GagDocumentExportModal: React.FC<GagDocumentExportModalProps> = ({
  isOpen,
  onClose,
  initialDocument,
}) => {
  // Brand settings persisted
  const [brand, setBrand] = useState<GagBrandIdentity>(() => {
    try {
      const saved = localStorage.getItem("gag_brand_settings");
      return saved ? { ...GAG_BRAND_DEFAULTS, ...JSON.parse(saved) } : GAG_BRAND_DEFAULTS;
    } catch {
      return GAG_BRAND_DEFAULTS;
    }
  });

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showBrandConfig, setShowBrandConfig] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  // Document state
  const [doc, setDoc] = useState<GagDocumentData>({
    title: "Proposta Comercial Estratégica — Metodologia TOB",
    type: "COMMERCIAL_PROPOSAL",
    clientName: "Direção de Marketing",
    companyName: "Banco Angolano de Investimentos (BAI)",
    clientPhone: "+244 923 884 190",
    clientEmail: "comercial@bai.ao",
    date: new Date().toLocaleDateString("pt-PT"),
    validityDays: 15,
    summary: "Campanha multimídia 360° para Luanda com produção de 3 vídeos 4K verticais (9:16) para Reels/TikTok, identidade de marca executiva e tráfego direcionado.",
    items: [
      {
        description: "Desenvolvimento de Conceito Criativo e Identidade Visual",
        quantity: 1,
        unitPriceAOA: 1250000,
        totalAOA: 1250000,
      },
      {
        description: "Produção Audiovisual 4K (3 Vídeos Verticais 9:16 com Google Veo / Lentes 35mm)",
        quantity: 1,
        unitPriceAOA: 1850000,
        totalAOA: 1850000,
      },
      {
        description: "Campanha de Posicionamento e Tráfego Direto WhatsApp Luanda",
        quantity: 1,
        unitPriceAOA: 600000,
        totalAOA: 600000,
      },
    ],
    require50PercentDeposit: true,
    urgency48h: false,
    includeIVA: true,
    includeTaxRetention: true,
    nif: brand.nif,
    iban: brand.iban,
    bankName: brand.bankName,
  });

  // Sync initialDocument if provided
  useEffect(() => {
    if (initialDocument) {
      setDoc((prev) => ({
        ...prev,
        ...initialDocument,
        items: initialDocument.items || prev.items,
      }));
    }
  }, [initialDocument]);

  if (!isOpen) return null;

  const fin = calculateDocumentFinancials(doc);
  const { text: waText, waLink } = exportDocumentAsWhatsApp(doc, brand);

  const handleCopy = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatId);
    playSfx("success", 0.3);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleSaveBrand = (updatedBrand: GagBrandIdentity) => {
    setBrand(updatedBrand);
    localStorage.setItem("gag_brand_settings", JSON.stringify(updatedBrand));
    playSfx("success", 0.3);
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const updated = { ...brand, customLogoUrl: base64 };
        handleSaveBrand(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newItem: GagDocumentItem = {
      description: "Novo Entregável / Ativo Criativo",
      quantity: 1,
      unitPriceAOA: 500000,
      totalAOA: 500000,
    };
    setDoc({ ...doc, items: [...(doc.items || []), newItem] });
  };

  const updateItem = (index: number, field: keyof GagDocumentItem, value: any) => {
    const currentItems = [...(doc.items || [])];
    const target = { ...currentItems[index], [field]: value };
    if (field === "unitPriceAOA" || field === "quantity") {
      target.totalAOA = (target.quantity || 1) * (target.unitPriceAOA || 0);
    }
    currentItems[index] = target;
    setDoc({ ...doc, items: currentItems });
  };

  const removeItem = (index: number) => {
    const currentItems = (doc.items || []).filter((_, i) => i !== index);
    setDoc({ ...doc, items: currentItems });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#07090e] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-[#07090e] via-[#0e1424] to-[#07090e] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300">
              <FileDown className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Central de Exportação de Documentos & Ficheiros
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                  GAG Visual Brand
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geração em todos os formatos com identidade corporativa, termos fiscais de Luanda e sinal de 50%.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBrandConfig(!showBrandConfig)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Configurar Elementos e Dados Corporativos da GAG"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Elementos da Marca</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BRAND IDENTITY NOTICE / SOLICITAÇÃO AO UTILIZADOR */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Identidade GAG Integrada:</strong> Monograma vetorial dourado, Direção de <strong>{brand.managingDirector}</strong> e sinal de 50% em Kwanzas (AOA).
            </span>
          </div>
          <button
            onClick={() => setShowBrandConfig(true)}
            className="text-[11px] font-bold text-amber-300 underline hover:text-amber-100 flex items-center gap-1"
          >
            <span>Personalizar Logo, NIF ou IBAN</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* BRAND CONFIG DRAWER */}
        {showBrandConfig && (
          <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dados Corporativos Oficiais da GAG Visual (Luanda, Angola)</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Se tiveres novos dados oficiais, envia ou edita aqui diretamente.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Diretor Geral & Comercial</label>
                <input
                  type="text"
                  value={brand.managingDirector}
                  onChange={(e) => setBrand({ ...brand, managingDirector: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">NIF da Empresa</label>
                <input
                  type="text"
                  value={brand.nif}
                  onChange={(e) => setBrand({ ...brand, nif: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Telefone WhatsApp (+244)</label>
                <input
                  type="text"
                  value={brand.phone}
                  onChange={(e) => setBrand({ ...brand, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Corporativo</label>
                <input
                  type="text"
                  value={brand.email}
                  onChange={(e) => setBrand({ ...brand, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Instituição Bancária & IBAN (Para Sinal de 50%)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={brand.bankName}
                    onChange={(e) => setBrand({ ...brand, bankName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    placeholder="Nome do Banco"
                  />
                  <input
                    type="text"
                    value={brand.iban}
                    onChange={(e) => setBrand({ ...brand, iban: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    placeholder="AO06.0040.0000..."
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Pagamento por Referência Multicaixa</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={brand.multicaixaEntity || ""}
                    onChange={(e) => setBrand({ ...brand, multicaixaEntity: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    placeholder="Entidade (ex: 10234)"
                  />
                  <input
                    type="text"
                    value={brand.multicaixaRef || ""}
                    onChange={(e) => setBrand({ ...brand, multicaixaRef: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    placeholder="Referência (ex: 987 654 321)"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex items-end gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-dashed border-amber-500/40 hover:border-amber-400 text-amber-300 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Substituir Logo por PNG/SVG Original</span>
                  <input type="file" accept="image/*,.svg" onChange={handleCustomLogoUpload} className="hidden" />
                </label>
                <button
                  onClick={() => handleSaveBrand(brand)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs"
                >
                  Guardar Dados
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: DOCUMENT FORM BUILDER */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Configuração do Documento</span>
              </span>

              {/* Template quick switch */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDoc({
                      ...doc,
                      title: "Proposta Comercial Estratégica — Metodologia TOB",
                      type: "COMMERCIAL_PROPOSAL",
                      summary: "Apresentamos o pacote executivo de produção de vídeo 4K e posicionamento com sinal de 50%.",
                    });
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  Proposta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDoc({
                      ...doc,
                      title: "Relatório Executivo de Campanha & ROAS Luanda",
                      type: "EXECUTIVE_REPORT",
                      summary: "Relatório consolidado de métricas, conversões de WhatsApp e retorno sobre investimento.",
                    });
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  Relatório
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDoc({
                      ...doc,
                      title: "Minuta de Reunião & Diretivas do Owner",
                      type: "MEETING_MINUTES",
                      summary: "Registo formal das decisões estratégicas tomadas na sessão de alinhamento com a diretoria.",
                    });
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  Minuta
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block">Título do Documento</label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block">Cliente / Decisor</label>
                  <input
                    type="text"
                    value={doc.clientName}
                    onChange={(e) => setDoc({ ...doc, clientName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block">Empresa / Marca</label>
                  <input
                    type="text"
                    value={doc.companyName}
                    onChange={(e) => setDoc({ ...doc, companyName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block">Contacto WhatsApp (+244)</label>
                  <input
                    type="text"
                    value={doc.clientPhone}
                    onChange={(e) => setDoc({ ...doc, clientPhone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block">Validade da Proposta</label>
                  <select
                    value={doc.validityDays}
                    onChange={(e) => setDoc({ ...doc, validityDays: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value={7}>7 dias úteis</option>
                    <option value={15}>15 dias (Padrão)</option>
                    <option value={30}>30 dias de validade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block">Resumo Executivo / Diagnóstico</label>
                <textarea
                  rows={3}
                  value={doc.summary}
                  onChange={(e) => setDoc({ ...doc, summary: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Items & Financial Table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Itens e Entregáveis do Projeto
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(doc.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs"
                    >
                      <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                        placeholder="Descrição do item"
                      />
                      <input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                        className="w-12 px-1.5 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs text-center focus:border-amber-400 focus:outline-none"
                        min={1}
                        title="Quantidade"
                      />
                      <div className="w-28 flex items-center">
                        <input
                          type="number"
                          value={item.unitPriceAOA}
                          onChange={(e) => updateItem(idx, "unitPriceAOA", Number(e.target.value))}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono text-right focus:border-amber-400 focus:outline-none"
                          step={50000}
                          title="Preço Unitário em Kwanzas"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Remover Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fiscal & Commercial Toggles */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Diretrizes Comerciais de Luanda (Regras do Owner)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.urgency48h}
                      onChange={(e) => setDoc({ ...doc, urgency48h: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                    />
                    <span>Taxa de Urgência 48h (+50%)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.includeIVA}
                      onChange={(e) => setDoc({ ...doc, includeIVA: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                    />
                    <span>Aplicar IVA Legal (14%)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.includeTaxRetention}
                      onChange={(e) => setDoc({ ...doc, includeTaxRetention: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                    />
                    <span>Retenção na Fonte (6,5% RGIR)</span>
                  </label>

                  <div className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sinal 50% Inegociável</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE EXECUTIVE PREVIEW & EXPORT ACTIONS */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {/* EXPORT ACTION BUTTONS TOOLBAR */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileDown className="w-4 h-4 text-amber-400" />
                  <span>Descarregar em Todos os Formatos</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">1-Clique Pronto</span>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. PDF PRINT */}
                <button
                  onClick={() => {
                    playSfx("click", 0.3);
                    exportDocumentAsPdf(doc, brand);
                  }}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  title="Gera PDF Executivo Oficial A4 com logotipo da GAG Visual"
                >
                  <Printer className="w-4 h-4" />
                  <span>PDF Oficial</span>
                </button>

                {/* 2. DOCX WORD */}
                <button
                  onClick={() => {
                    playSfx("click", 0.3);
                    exportDocumentAsDocx(doc, brand);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  title="Descarregar ficheiro Microsoft Word (.doc/.docx)"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Word (.docx)</span>
                </button>

                {/* 3. MARKDOWN */}
                <button
                  onClick={() => {
                    playSfx("click", 0.3);
                    exportDocumentAsMarkdown(doc, brand);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  title="Descarregar ficheiro Markdown estruturado (.md)"
                >
                  <FileText className="w-4 h-4" />
                  <span>Markdown (.md)</span>
                </button>

                {/* 4. HTML STANDALONE */}
                <button
                  onClick={() => {
                    playSfx("click", 0.3);
                    exportDocumentAsHtml(doc, previewTheme, brand);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  title="Descarregar página HTML completa com logotipo embutido"
                >
                  <Globe className="w-4 h-4" />
                  <span>HTML Web</span>
                </button>

                {/* 5. WHATSAPP COPY / DISPATCH */}
                <button
                  onClick={() => handleCopy(waText, "wa-text")}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  title="Copiar texto formatado com asteriscos para WhatsApp"
                >
                  {copiedFormat === "wa-text" ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFormat === "wa-text" ? "Copiado!" : "Copiar WA"}</span>
                </button>

                {/* 6. WHATSAPP DIRECT WA.ME LINK */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center"
                  title="Abrir diretamente no WhatsApp Web ou App do Cliente"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar WA</span>
                </a>

                {/* 7. JSON */}
                <button
                  onClick={() => {
                    playSfx("click", 0.3);
                    exportDocumentAsJson(doc, brand);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  title="Descarregar dados estruturados em JSON"
                >
                  <Code className="w-4 h-4" />
                  <span>JSON Payload</span>
                </button>

                {/* 8. CSV EXCEL */}
                <button
                  onClick={() => {
                    playSfx("click", 0.3);
                    exportDocumentAsCsv(doc, brand);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  title="Descarregar tabela em CSV compatível com Excel"
                >
                  <Table className="w-4 h-4" />
                  <span>CSV (Excel)</span>
                </button>
              </div>
            </div>

            {/* LIVE DOCUMENT PREVIEW CANVAS */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col space-y-3 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Pré-Visualização Corporativa A4
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewTheme("dark")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewTheme === "dark" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-500"}`}
                  >
                    Dark Onyx
                  </button>
                  <button
                    onClick={() => setPreviewTheme("light")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewTheme === "light" ? "bg-white text-black font-extrabold" : "text-slate-500"}`}
                  >
                    Papel A4 White
                  </button>
                </div>
              </div>

              {/* Rendered Preview Box */}
              <div
                className={`flex-1 overflow-y-auto p-4 sm:p-5 rounded-xl border text-xs space-y-4 transition-colors ${
                  previewTheme === "dark"
                    ? "bg-[#05070c] border-amber-500/30 text-slate-200"
                    : "bg-white border-slate-300 text-slate-900 shadow-inner"
                }`}
              >
                {/* Header in Preview */}
                <div className="flex items-center justify-between border-b-2 border-amber-500 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black border border-amber-500 flex items-center justify-center font-black text-amber-400 text-base shadow-sm">
                      G
                    </div>
                    <div>
                      <div className="font-black tracking-wider text-sm text-amber-400 font-sans">
                        GAG VISUAL
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{brand.tagline}</div>
                      <div className="text-[9px] text-slate-500">{brand.address} • NIF: {brand.nif}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-black border border-amber-500 text-amber-300 font-bold text-[9px] uppercase">
                      {doc.type}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{doc.date}</div>
                  </div>
                </div>

                {/* Client Box */}
                <div
                  className={`p-3 rounded-lg border-l-4 border-amber-500 text-xs ${
                    previewTheme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Cliente / Destinatário</div>
                  <div className="font-bold text-sm">{doc.clientName}</div>
                  <div className="text-slate-400">{doc.companyName} • {doc.clientPhone}</div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 className="font-black text-base text-amber-400">{doc.title}</h3>
                  <p className="mt-1 text-xs opacity-90 leading-relaxed">{doc.summary}</p>
                </div>

                {/* Financial Summary */}
                <div
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    previewTheme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"
                  }`}
                >
                  <div className="flex justify-between text-xs">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatAOA(fin.subtotal)}</span>
                  </div>
                  {doc.urgency48h && (
                    <div className="flex justify-between text-xs text-amber-500">
                      <span>Taxa Urgência 48h (+50%):</span>
                      <span className="font-mono">{formatAOA(fin.urgencyFee)}</span>
                    </div>
                  )}
                  {doc.includeIVA && (
                    <div className="flex justify-between text-xs">
                      <span>IVA (14%):</span>
                      <span className="font-mono">{formatAOA(fin.iva14)}</span>
                    </div>
                  )}
                  {doc.includeTaxRetention && (
                    <div className="flex justify-between text-xs text-rose-500">
                      <span>Retenção na Fonte (6,5%):</span>
                      <span className="font-mono">-{formatAOA(fin.taxRetention6_5)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-700">
                    <span className="text-amber-400">VALOR TOTAL GLOBAL:</span>
                    <span className="text-amber-400 font-mono">
                      {formatAOA(doc.includeTaxRetention ? fin.totalNet : fin.totalGross)}
                    </span>
                  </div>
                </div>

                {/* 50% Deposit Callout */}
                <div className="p-3 rounded-xl bg-black border-2 border-amber-500 text-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      Sinal Obrigatório de Adjudicação (50%)
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Requisito de Luanda para reserva de pauta técnica
                    </div>
                  </div>
                  <div className="text-base font-black text-amber-400 font-mono">
                    {formatAOA(fin.deposit50Percent)}
                  </div>
                </div>

                {/* Banking & Signatures */}
                <div className="text-[10px] opacity-75 pt-2 border-t border-slate-700/50 flex justify-between items-center">
                  <div>
                    <strong>Banco:</strong> {brand.bankName} | <strong>IBAN:</strong> {brand.iban}
                  </div>
                  <div>
                    <strong>Assinatura:</strong> {brand.managingDirector}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#06080d] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Todos os ficheiros saem com codificação UTF-8 e compatibilidade nativa com impressoras A4, Word, Excel e telemóveis.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                playSfx("success", 0.3);
                exportDocumentAsPdf(doc, brand);
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Imprimir / Gerar PDF Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
