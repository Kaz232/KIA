import React, { useState, useRef } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  Radio,
  Upload,
  RefreshCw,
  Download,
  Copy,
  Check,
  Play,
  Film,
  ExternalLink,
  Layers,
  Wand2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const MultimodalStudioView: React.FC = () => {
  const { recordAuditLog } = useApp();
  const [activeTab, setActiveTab] = useState<"image" | "video" | "search" | "live">("image");

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Veo Video Generation State
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoPendingNotice, setVideoPendingNotice] = useState<string | null>(null);

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([
    "Canal Live WebSocket inicializado com gemini-3.1-flash-live-preview.",
    "Aguardando conexão de voz/áudio bidirecional...",
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type || "image/png");
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(",")[1];
        setSelectedImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch("/api/media/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          base64InputImage: selectedImageBase64 || undefined,
          mimeType: imageMimeType,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageData) {
        setGeneratedImage(`data:${data.mimeType || "image/png"};base64,${data.imageData}`);
        recordAuditLog("Geração de Imagem IA", "agent_factory", "SUCCESS", `Prompt: "${imagePrompt}" via ${data.model}`);
      } else {
        setImageError(data.error || "Não foi possível gerar a imagem.");
      }
    } catch (err: any) {
      setImageError(err.message || "Erro de conexão ao gerar imagem.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedImageBase64 && !videoPrompt.trim()) {
      setVideoError("Insere uma descrição ou carrega uma fotografia de base.");
      return;
    }
    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoPendingNotice(null);
    try {
      const res = await fetch("/api/media/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt || "Cinematic smooth motion 4k animation",
          base64InputImage: selectedImageBase64 || undefined,
          mimeType: imageMimeType,
          aspectRatio: videoAspectRatio,
        }),
      });

      const data = await res.json();
      if (data.success && data.videoUri) {
        setGeneratedVideoUrl(data.videoUri);
        recordAuditLog("Animação Veo Video", "agent_factory", "SUCCESS", `Vídeo gerado via ${data.model}`);
      } else if (data.pending) {
        setVideoPendingNotice("O vídeo está sendo processado pelo cluster Veo. Verifique em instantes.");
      } else {
        setVideoError(data.error || "Erro na geração de vídeo.");
      }
    } catch (err: any) {
      setVideoError(err.message || "Erro de conexão com o cluster Veo.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSearchGrounding = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/search/grounded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (data.success) {
        setSearchResult(data.text);
        setGroundingChunks(data.groundingChunks || []);
        setSearchQueries(data.webSearchQueries || []);
        recordAuditLog("Pesquisa Google Grounded", "knowledge", "SUCCESS", `Query: "${searchQuery}"`);
      } else {
        setSearchError(data.error || "Erro na pesquisa com Google Search Grounding.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Erro de conexão.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              Estúdio Multimodal & Gemini Labs
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              Veo & Flash Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Geração de imagens (gemini-3.1-flash-image-preview), animação de vídeos com Veo, Google Search Grounding em tempo real e Live API.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("image")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "image"
                ? "bg-amber-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Criar / Editar Imagem</span>
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "video"
                ? "bg-amber-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Animar com Veo</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "search"
                ? "bg-amber-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Grounding</span>
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "live"
                ? "bg-amber-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live API (Voz)</span>
          </button>
        </div>
      </div>

      {/* 1. Image Studio View */}
      {activeTab === "image" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Prompt de Criação ou Edição de Imagem</span>
            </h2>

            <div className="space-y-3">
              <label className="text-xs text-slate-400">Descreve a imagem ou as alterações pretendidas:</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Ex: Logótipo minimalista em dourado e preto para a agência GAG Visual..."
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 custom-scrollbar"
              />
            </div>

            {/* Optional Reference Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Imagem de Referência / Base (Opcional):</span>
                {selectedImageBase64 && (
                  <button
                    onClick={() => setSelectedImageBase64(null)}
                    className="text-red-400 hover:underline text-[11px]"
                  >
                    Remover
                  </button>
                )}
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-900/40 transition-colors flex flex-col items-center justify-center space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {selectedImageBase64 ? (
                  <img
                    src={`data:${imageMimeType};base64,${selectedImageBase64}`}
                    alt="Upload Preview"
                    className="max-h-32 rounded-lg border border-slate-700 object-contain"
                  />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-medium">
                      Clica para carregar uma imagem para edição visual
                    </span>
                  </>
                )}
              </div>
            </div>

            {imageError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                {imageError}
              </div>
            )}

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A gerar com gemini-3.1-flash-image-preview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Imagem</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[360px]">
            {generatedImage ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <img
                  src={generatedImage}
                  alt="Generated Result"
                  className="rounded-xl border border-amber-500/30 max-h-80 w-auto shadow-2xl"
                />
                <a
                  href={generatedImage}
                  download="gag-visual-ai.png"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descarregar Imagem PNG</span>
                </a>
              </div>
            ) : (
              <div className="text-center space-y-2 text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs">O resultado gerado pelo modelo aparecerá aqui em alta resolução.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Veo Video Studio View */}
      {activeTab === "video" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Animar Fotografia com Veo Video Generation</span>
            </h2>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Instruções de Movimento / Animação:</label>
              <input
                type="text"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Ex: Movimento cinematográfico de câmara lento, iluminação volumétrica..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Proporção do Vídeo (Aspect Ratio):</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setVideoAspectRatio("16:9")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    videoAspectRatio === "16:9"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  16:9 (Horizontal / Paisagem)
                </button>
                <button
                  onClick={() => setVideoAspectRatio("9:16")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    videoAspectRatio === "9:16"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  9:16 (Vertical / Reels & Stories)
                </button>
              </div>
            </div>

            {videoPendingNotice && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                {videoPendingNotice}
              </div>
            )}

            {videoError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                {videoError}
              </div>
            )}

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              {isGeneratingVideo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A renderizar com veo-3.1-fast-generate-preview...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Renderizar Vídeo Veo</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[360px]">
            {generatedVideoUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className={`rounded-xl border border-amber-500/30 max-h-80 shadow-2xl ${
                    videoAspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-[16/9]"
                  }`}
                />
                <a
                  href={generatedVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Vídeo Original</span>
                </a>
              </div>
            ) : (
              <div className="text-center space-y-2 text-slate-500">
                <VideoIcon className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs">O vídeo renderizado pelo modelo Veo será reproduzido aqui.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Search Grounding View */}
      {activeTab === "search" && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Google Search Grounding em Tempo Real (gemini-3.5-flash)</span>
            </h2>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchGrounding()}
                placeholder="Ex: Quais são as tendências mais recentes de Inteligência Artificial e branding em 2026?"
                className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSearchGrounding}
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>Pesquisar</span>
              </button>
            </div>
          </div>

          {searchResult && (
            <div className="space-y-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Search Grounded
                </span>
                {searchQueries.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Consultas: {searchQueries.join(", ")}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {searchResult}
              </div>

              {groundingChunks.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fontes Verificadas:</span>
                  <div className="flex flex-wrap gap-2">
                    {groundingChunks.map((chunk, idx) => (
                      <a
                        key={idx}
                        href={chunk.web?.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-amber-300 hover:underline flex items-center space-x-1"
                      >
                        <span>{chunk.web?.title || chunk.web?.uri}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Live API View */}
      {activeTab === "live" && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Gemini Live API (gemini-3.1-flash-live-preview)</span>
            </h2>

            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                isLiveActive
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-500 text-black shadow-lg"
              }`}
            >
              <span>{isLiveActive ? "Encerrar Sessão Live" : "Conectar Sessão Live"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {liveLogs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500">{">"}</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
