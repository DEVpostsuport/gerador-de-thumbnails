import React, { useState, useEffect, useRef } from "react";
import {
  VideoItem,
  ThumbnailConfig,
  ThumbnailTemplate,
} from "../types";
import { DEFAULT_TEMPLATES } from "../lib/templates";
import { drawThumbnailToCanvas } from "../lib/thumbnailRenderer";
import {
  Image as ImageIcon,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  Type,
  Palette,
  LayoutGrid,
  Maximize2,
  RefreshCw,
  FolderDown,
} from "lucide-react";
import { downloadBatchVideosPackage } from "../lib/exportUtils";

interface ThumbnailStudioViewProps {
  videos: VideoItem[];
  selectedVideoId?: string;
  onUpdateVideoThumbnail: (videoId: string, config: ThumbnailConfig, dataUrl: string) => void;
  onBatchGenerateThumbnails: (templateId: string) => Promise<void>;
}

export const ThumbnailStudioView: React.FC<ThumbnailStudioViewProps> = ({
  videos,
  selectedVideoId,
  onUpdateVideoThumbnail,
  onBatchGenerateThumbnails,
}) => {
  const currentVideo =
    videos.find((v) => v.id === selectedVideoId) || videos[0] || null;

  const [activeVideoId, setActiveVideoId] = useState<string>(
    currentVideo?.id || ""
  );

  const activeVideo =
    videos.find((v) => v.id === activeVideoId) || currentVideo;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("template-01");
  const selectedTemplate =
    DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];

  // Thumbnail Config State
  const [config, setConfig] = useState<ThumbnailConfig>({
    serialNumber: activeVideo?.serialId || "#001",
    hookText:
      activeVideo?.package?.selectedHook ||
      activeVideo?.analysis?.recommendedThumbnailText ||
      "ELE DESCOBRIU A VERDADE",
    movieTitle: activeVideo?.workName || "BREAKING BAD",
    brandText: "CATEGORIA FILMES",
    frameUrl:
      activeVideo?.frameDataUrl ||
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
    badgeStyle: selectedTemplate.badgeStyle,
    fontFamily: selectedTemplate.fontFamily,
    hookFontSize: selectedTemplate.hookFontSize,
    textColor: selectedTemplate.textColor,
    strokeColor: selectedTemplate.strokeColor,
    strokeWidth: selectedTemplate.strokeWidth,
    accentColor: selectedTemplate.accentColor,
    gradientOverlay: selectedTemplate.gradientOverlay,
    vignetteStrength: selectedTemplate.vignetteStrength,
    hookOffsetY: selectedTemplate.hookOffsetY,
    titleOffsetY: selectedTemplate.titleOffsetY,
    showBrand: true,
    filterBrightness: 100,
    filterContrast: 110,
    filterSaturation: 110,
  });

  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [guideType, setGuideType] = useState<"all" | "grid" | "safe_area">("all");
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "style" | "image" | "templates">("text");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");

  // Sync when active video changes
  useEffect(() => {
    if (activeVideo) {
      const hook =
        activeVideo.package?.selectedHook ||
        activeVideo.analysis?.recommendedThumbnailText ||
        "ELE DESCOBRIU A VERDADE";

      setConfig((prev) => ({
        ...prev,
        serialNumber: activeVideo.serialId,
        hookText: hook.length > 36 ? hook.slice(0, 36) + "..." : hook,
        movieTitle: activeVideo.workName,
        frameUrl: activeVideo.frameDataUrl || prev.frameUrl,
      }));
    }
  }, [activeVideoId]);

  // Apply template changes
  const applyTemplate = (tpl: ThumbnailTemplate) => {
    setSelectedTemplateId(tpl.id);
    setConfig((prev) => ({
      ...prev,
      badgeStyle: tpl.badgeStyle,
      fontFamily: tpl.fontFamily,
      hookFontSize: tpl.hookFontSize,
      textColor: tpl.textColor,
      strokeColor: tpl.strokeColor,
      strokeWidth: tpl.strokeWidth,
      accentColor: tpl.accentColor,
      gradientOverlay: tpl.gradientOverlay,
      vignetteStrength: tpl.vignetteStrength,
      hookOffsetY: tpl.hookOffsetY,
      titleOffsetY: tpl.titleOffsetY,
    }));
  };

  // Re-render canvas
  useEffect(() => {
    if (canvasRef.current && activeVideo) {
      drawThumbnailToCanvas(canvasRef.current, config, selectedTemplate, {
        width: 1080,
        height: 1920,
        showGuides,
        guideType,
      }).then((dataUrl) => {
        setPreviewDataUrl(dataUrl);
      });
    }
  }, [config, selectedTemplate, showGuides, guideType, activeVideo]);

  // Save changes to current video
  const handleSaveThumbnail = async () => {
    if (!activeVideo) return;
    // Render high-res without guides for production
    const offscreen = document.createElement("canvas");
    const cleanDataUrl = await drawThumbnailToCanvas(
      offscreen,
      config,
      selectedTemplate,
      {
        width: 1080,
        height: 1920,
        showGuides: false,
      }
    );

    onUpdateVideoThumbnail(activeVideo.id, config, cleanDataUrl);
  };

  // Download high-res PNG
  const handleDownloadSinglePNG = async () => {
    const offscreen = document.createElement("canvas");
    const cleanDataUrl = await drawThumbnailToCanvas(
      offscreen,
      config,
      selectedTemplate,
      {
        width: 1080,
        height: 1920,
        showGuides: false,
      }
    );

    const a = document.createElement("a");
    a.href = cleanDataUrl;
    a.download = `${config.serialNumber}_THUMB_${config.movieTitle.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Trigger batch generation
  const handleRunBatchGeneration = async () => {
    setIsGeneratingBatch(true);
    try {
      await onBatchGenerateThumbnails(selectedTemplateId);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Validation warnings
  const isHookTooLong = config.hookText.length > 36;
  const hasSerialNumber = !!config.serialNumber;
  const hasImage = !!config.frameUrl;
  const hasBrand = config.showBrand !== false;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" />
            Diretoria de Arte & Thumbnails Seriadas
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-1 uppercase tracking-tight">
            Thumbnail Studio (9:16 + Grade 1:1)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Garante os 4 pilares obrigatórios:{" "}
            <strong className="text-emerald-400">Hook Curto + #ID + Imagem + Marca</strong>.
          </p>
        </div>

        {/* Global Batch Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadBatchVideosPackage(videos, "thumbnails_only")}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs uppercase flex items-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <FolderDown className="w-4 h-4 text-emerald-400" />
            Baixar Lote PNG (.ZIP)
          </button>

          <button
            onClick={handleRunBatchGeneration}
            disabled={isGeneratingBatch}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isGeneratingBatch ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                Gerando em Lote...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar P/ Todos ({videos.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Selector & Editor Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Video Selector Carousel/Chips */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Vídeo Selecionado para Edição
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideoId(v.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeVideo?.id === v.id
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-mono">{v.serialId}</span>
                  <span className="truncate max-w-[110px]">{v.workName}</span>
                  {v.thumbnailDataUrl && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Tabs */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                {[
                  { id: "text", label: "Texto & Hook", icon: Type },
                  { id: "templates", label: "Templates", icon: LayoutGrid },
                  { id: "style", label: "Cores & Badges", icon: Palette },
                  { id: "image", label: "Imagem & Filtros", icon: Sliders },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        active
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSaveThumbnail}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-emerald-400 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar Thumbnail
              </button>
            </div>

            {/* TAB 1: TEXT & HOOK */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                    Hook Principal da Thumbnail (1 a 2 linhas)
                  </label>
                  <input
                    type="text"
                    value={config.hookText}
                    onChange={(e) =>
                      setConfig({ ...config, hookText: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: ELE DESCOBRIU A VERDADE"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-black text-zinc-100 uppercase focus:border-emerald-500 outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] mt-1.5 text-zinc-400">
                    <span>Recomendado: 2 a 5 palavras de altíssimo impacto.</span>
                    <span className={isHookTooLong ? "text-emerald-400 font-bold" : ""}>
                      {config.hookText.length} caracteres
                    </span>
                  </div>
                </div>

                {/* AI Hook Suggestions for this movie */}
                {activeVideo?.package?.hooks && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sugestões Virais Rápidas da IA:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeVideo.package.hooks.slice(0, 4).map((h, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setConfig({ ...config, hookText: h.text.toUpperCase().slice(0, 36) })
                          }
                          className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-left text-xs text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          "{h.text.slice(0, 38)}..."
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                      Número Sequencial (#ID)
                    </label>
                    <input
                      type="text"
                      value={config.serialNumber}
                      onChange={(e) => setConfig({ ...config, serialNumber: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-black text-emerald-400 uppercase focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                      Nome da Obra / Filme
                    </label>
                    <input
                      type="text"
                      value={config.movieTitle}
                      onChange={(e) => setConfig({ ...config, movieTitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-100 uppercase focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-200">
                    Marca d'água "CATEGORIA FILMES"
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showBrand !== false}
                    onChange={(e) => setConfig({ ...config, showBrand: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TEMPLATES */}
            {activeTab === "templates" && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Escolha um Template Seriador Oficial
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => applyTemplate(tpl)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-zinc-100 shadow-md"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-300">
                            {tpl.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-bold font-mono">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: STYLES & BADGES */}
            {activeTab === "style" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                    Estilo da Badge (#ID)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "gold_pill", label: "Ouro Pill" },
                      { id: "crimson_box", label: "Carmesim Box" },
                      { id: "neon_bordered", label: "Neon Verde" },
                      { id: "minimal_tag", label: "Minimal Tag" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setConfig({ ...config, badgeStyle: b.id as any })}
                        className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          config.badgeStyle === b.id
                            ? "bg-emerald-500 text-zinc-950"
                            : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                      Cor de Destaque
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.accentColor || "#10B981"}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-zinc-300">
                        {config.accentColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                      Tamanho da Fonte (Hook)
                    </label>
                    <input
                      type="range"
                      min={60}
                      max={110}
                      value={config.hookFontSize || 86}
                      onChange={(e) =>
                        setConfig({ ...config, hookFontSize: parseInt(e.target.value) })
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                    Posição Vertical do Hook ({config.hookOffsetY || 70}%)
                  </label>
                  <input
                    type="range"
                    min={40}
                    max={85}
                    value={config.hookOffsetY || 70}
                    onChange={(e) =>
                      setConfig({ ...config, hookOffsetY: parseInt(e.target.value) })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: IMAGE & FILTERS */}
            {activeTab === "image" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-zinc-300 uppercase block mb-1.5">
                    URL da Imagem / Still do Filme
                  </label>
                  <input
                    type="text"
                    value={config.frameUrl}
                    onChange={(e) => setConfig({ ...config, frameUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      Brilho ({config.filterBrightness}%)
                    </label>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={config.filterBrightness || 100}
                      onChange={(e) =>
                        setConfig({ ...config, filterBrightness: parseInt(e.target.value) })
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      Contraste ({config.filterContrast}%)
                    </label>
                    <input
                      type="range"
                      min={80}
                      max={160}
                      value={config.filterContrast || 110}
                      onChange={(e) =>
                        setConfig({ ...config, filterContrast: parseInt(e.target.value) })
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      Saturação ({config.filterSaturation}%)
                    </label>
                    <input
                      type="range"
                      min={60}
                      max={160}
                      value={config.filterSaturation || 110}
                      onChange={(e) =>
                        setConfig({ ...config, filterSaturation: parseInt(e.target.value) })
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checklist of Absolute Thumbnail Rules */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Auditoria dos 4 Pilares da Thumbnail
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div
                className={`p-2 rounded-lg flex items-center gap-1.5 ${
                  config.hookText.trim()
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>1. Hook Curto</span>
              </div>

              <div
                className={`p-2 rounded-lg flex items-center gap-1.5 ${
                  hasSerialNumber
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>2. #ID da Série</span>
              </div>

              <div
                className={`p-2 rounded-lg flex items-center gap-1.5 ${
                  hasImage
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>3. Imagem da Obra</span>
              </div>

              <div
                className={`p-2 rounded-lg flex items-center gap-1.5 ${
                  hasBrand
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>4. Marca Categoria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live 9:16 Canvas & Safe Area Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-8">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                Preview em Tempo Real (9:16)
              </span>

              {/* Safe Area Guides Switcher */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowGuides(!showGuides)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    showGuides
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {showGuides ? "Guias ON" : "Guias OFF"}
                </button>
              </div>
            </div>

            {/* Guide Mode Pills */}
            {showGuides && (
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setGuideType("all")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    guideType === "all" ? "bg-zinc-700 text-white font-bold" : "text-zinc-400"
                  }`}
                >
                  Todas as Guias
                </button>
                <button
                  onClick={() => setGuideType("grid")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    guideType === "grid" ? "bg-red-500/30 text-red-300 font-bold" : "text-zinc-400"
                  }`}
                >
                  Grade Instagram 1:1
                </button>
                <button
                  onClick={() => setGuideType("safe_area")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    guideType === "safe_area" ? "bg-blue-500/30 text-blue-300 font-bold" : "text-zinc-400"
                  }`}
                >
                  Área Segura Feed 4:5
                </button>
              </div>
            )}

            {/* Visual Phone Frame Container */}
            <div className="relative mx-auto w-[290px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl bg-black">
              {/* Actual Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Action Bar Under Preview */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                id="btn-download-png"
                onClick={handleDownloadSinglePNG}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Baixar PNG 1080x1920
              </button>
              <button
                onClick={handleSaveThumbnail}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar no Pacote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
