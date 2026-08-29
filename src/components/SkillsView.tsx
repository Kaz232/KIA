import React, { useState } from "react";
import {
  Wrench,
  Search,
  Play,
  CheckCircle2,
  AlertTriangle,
  Code,
  Layers,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Skill } from "../types";

export const SkillsView: React.FC = () => {
  const { skills } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSkill, setSelectedSkill] = useState<Skill>(skills[0] || null);

  // Live Test State
  const [testPayloadStr, setTestPayloadStr] = useState<string>(
    JSON.stringify(skills[0]?.inputSchema.sample || {}, null, 2)
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  const categories: { id: string; label: string }[] = [
    { id: "ALL", label: "Todas as Categorias" },
    { id: "ANALYSIS", label: "Análise & Diagnóstico" },
    { id: "GENERATION", label: "Geração & Copy" },
    { id: "ORCHESTRATION", label: "Orquestração" },
    { id: "AUTOMATION", label: "Automação & Processos" },
    { id: "DATA", label: "Dados & Inteligência" },
    { id: "SECURITY", label: "Segurança & Auditoria" },
  ];

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setTestPayloadStr(JSON.stringify(skill.inputSchema.sample || {}, null, 2));
    setTestResult(null);
  };

  const handleExecuteSkill = async () => {
    if (!selectedSkill) return;
    setIsExecuting(true);
    setTestResult(null);

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(testPayloadStr);
    } catch (err: any) {
      setTestResult({
        error: "JSON de entrada inválido: " + err.message,
      });
      setIsExecuting(false);
      return;
    }

    try {
      const res = await fetch("/api/skills/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          payload: parsedPayload,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({
        error: "Falha na chamada da API: " + e.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (!testResult) return;
    navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Skills Registry & Execution Lab</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {skills.length} Skills Operacionais
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Catálogo padronizado de capacidades executáveis, contratos de entrada/saída (JSON Schema) e bancada de testes em tempo real.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Pesquisar por nome, ID ou funcionalidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Skills List vs Skill Inspector & Live Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills Catalog (1 col) */}
        <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredSkills.map((skill, idx) => {
            const isSelected = selectedSkill?.id === skill.id;
            return (
              <div
                key={`skill-${skill.id}-${idx}`}
                onClick={() => handleSelectSkill(skill)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-md ${
                  isSelected
                    ? "bg-[#111726] border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-[#0b0f19] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {skill.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">v{skill.version}</span>
                </div>

                <h3 className="text-xs font-bold text-white mt-2 group-hover:text-amber-300 line-clamp-1">
                  {skill.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{skill.id}</span>
                  <span className="text-emerald-400">READY</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Schema Inspector & Live Execution Deck (2 cols) */}
        <div className="lg:col-span-2 bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedSkill ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white">{selectedSkill.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                      {selectedSkill.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedSkill.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {selectedSkill.status}
                  </span>
                </div>
              </div>

              {/* Schemas Inspection Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                    <span>Input Contract (Parâmetros)</span>
                    <Code className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedSkill.inputSchema, null, 2)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                    <span>Output Contract (Estrutura Retornada)</span>
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedSkill.outputSchema, null, 2)}
                  </div>
                </div>
              </div>

              {/* Live Execution Workbench */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Bancada de Execução em Tempo Real</span>
                  </span>
                  <button
                    onClick={() =>
                      setTestPayloadStr(JSON.stringify(selectedSkill.inputSchema.sample || {}, null, 2))
                    }
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Restaurar Exemplo Padrão
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Payload JSON de Entrada:</label>
                  <textarea
                    rows={5}
                    value={testPayloadStr}
                    onChange={(e) => setTestPayloadStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button
                  onClick={handleExecuteSkill}
                  disabled={isExecuting}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executando no GAG Kernel...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Disparar Execução da Skill</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Test Results Output */}
              {testResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">Resultado da Execução</span>
                      {testResult.auditRef && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Audit: {testResult.auditRef.slice(0, 10)}...
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleCopyResult}
                      className="p-1 text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedResult ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px]">{copiedResult ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>

                  <pre className="font-mono text-[11px] text-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Seleciona uma skill à esquerda para visualizar e testar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
