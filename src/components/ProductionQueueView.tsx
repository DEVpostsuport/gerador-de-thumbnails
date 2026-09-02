import React, { useState, useMemo } from "react";
import {
  VideoItem,
  VideoStatus,
} from "../types";
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Film,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  Zap,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react";

interface ProductionQueueViewProps {
  videos: VideoItem[];
  isProcessing: boolean;
  autoMode: boolean;
  onToggleAutoMode: () => void;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onRetryFailed: () => void;
  onProcessSingle: (video: VideoItem) => void;
  onReanalyzeVideo: (video: VideoItem) => void;
  onDeleteVideo: (videoId: string) => void;
  onBatchDelete?: (videoIds: string[]) => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const ProductionQueueView: React.FC<ProductionQueueViewProps> = ({
  videos,
  isProcessing,
  autoMode,
  onToggleAutoMode,
  onStartQueue,
  onPauseQueue,
  onRetryFailed,
  onProcessSingle,
  onReanalyzeVideo,
  onDeleteVideo,
  onBatchDelete,
  onSelectVideo,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const pending = videos.filter((v) => v.status === "aguardando").length;
  const inProgress = videos.filter(
    (v) =>
      v.status === "analisando" ||
      v.status === "gerando_estrategia" ||
      v.status === "gerando_thumbnail"
  ).length;
  const completed = videos.filter((v) => v.status === "concluido").length;
  const errors = videos.filter((v) => v.status === "erro").length;

  const analyzed = videos.filter((v) => v.analysis !== undefined).length;
  const packagesCreated = videos.filter((v) => v.package !== undefined).length;
  const thumbnailsReady = videos.filter((v) => v.thumbnailDataUrl !== undefined).length;
  const reviewed = videos.filter((v) => v.qualityChecklist.textLegible).length;
  const readyToPublish = videos.filter(
    (v) =>
      v.qualityChecklist.workIdentified &&
      v.qualityChecklist.hookStrong &&
      v.qualityChecklist.thumbnailCreated &&
      v.qualityChecklist.captionCreated
  ).length;

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && video.status === "aguardando") ||
        (statusFilter === "processing" &&
          (video.status === "analisando" ||
            video.status === "gerando_estrategia" ||
            video.status === "gerando_thumbnail")) ||
        (statusFilter === "completed" && video.status === "concluido") ||
        (statusFilter === "error" && video.status === "erro");

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        video.workName.toLowerCase().includes(q) ||
        video.serialId.toLowerCase().includes(q) ||
        video.filename.toLowerCase().includes(q) ||
        (video.genre && video.genre.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [videos, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1;
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(start, start + itemsPerPage);
  }, [filteredVideos, currentPage, itemsPerPage]);

  const toggleSelectAll = () => {
    if (selectedVideoIds.length === filteredVideos.length) {
      setSelectedVideoIds([]);
    } else {
      setSelectedVideoIds(filteredVideos.map((v) => v.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedVideoIds.includes(id)) {
      setSelectedVideoIds(selectedVideoIds.filter((i) => i !== id));
    } else {
      setSelectedVideoIds([...selectedVideoIds, id]);
    }
  };

  const handleBatchDeleteSelected = () => {
    if (selectedVideoIds.length === 0) return;
    if (
      window.confirm(
        `Deseja realmente excluir ${selectedVideoIds.length} vídeos selecionados da fila?`
      )
    ) {
      if (onBatchDelete) {
        onBatchDelete(selectedVideoIds);
      } else {
        selectedVideoIds.forEach((id) => onDeleteVideo(id));
      }
      setSelectedVideoIds([]);
    }
  };

  const handleBatchReanalyzeSelected = () => {
    if (selectedVideoIds.length === 0) return;
    const selectedVideos = videos.filter((v) => selectedVideoIds.includes(v.id));
    selectedVideos.forEach((v) => onReanalyzeVideo(v));
    setSelectedVideoIds([]);
  };

  const getStatusBadge = (status: VideoStatus, msg?: string) => {
    switch (status) {
      case "concluido":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concluído
          </span>
        );
      case "analisando":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Analisando Cena...
          </span>
        );
      case "gerando_estrategia":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Gerando Copy & Hooks...
          </span>
        );
      case "gerando_thumbnail":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono">
            <ImageIcon className="w-3.5 h-3.5" />
            Renderizando Thumbnail...
          </span>
        );
      case "erro":
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono"
            title={msg || "Erro no processamento"}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Erro na análise
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Aguardando
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4" />
            Pipeline Automático de Produção
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-1 uppercase tracking-tight">
            Fila de Processamento em Lote
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Análise de cenas, geração de copy e renderização automática com suporte a reanálise de falhas e exclusão ({videos.length} vídeos).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Automatic Mode Indicator & Toggle */}
          <button
            onClick={onToggleAutoMode}
            id="toggle-auto-mode-queue-btn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer font-mono ${
              autoMode
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
            title="Alternar se a fila analisa automaticamente todos os novos vídeos adicionados"
          >
            <Zap className={`w-3.5 h-3.5 ${autoMode ? "text-emerald-400 fill-emerald-400/40" : "text-zinc-500"}`} />
            <span>Auto-Análise: {autoMode ? "ATIVA" : "PAUSADA"}</span>
          </button>

          {errors > 0 && (
            <button
              onClick={onRetryFailed}
              id="retry-failed-queue-btn"
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs uppercase border border-rose-500/30 flex items-center gap-2 cursor-pointer font-mono shadow-sm"
              title="Reanalisar todos os vídeos que apresentaram erro na análise"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              Reanalisar Erros ({errors})
            </button>
          )}

          {isProcessing ? (
            <button
              onClick={onPauseQueue}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 border border-zinc-700 cursor-pointer font-mono"
            >
              <Pause className="w-4 h-4 text-emerald-400" />
              Pausar Fila
            </button>
          ) : (
            <button
              onClick={onStartQueue}
              disabled={pending === 0 && errors === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer font-mono"
            >
              <Play className="w-4 h-4 fill-current" />
              Processar Fila ({pending + errors})
            </button>
          )}
        </div>
      </div>

      {/* Funnel Pipeline Visual Counters */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
          Funil de Produção & Qualidade
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xl font-black text-zinc-200 block font-mono">{videos.length}</span>
            <span className="text-[11px] text-zinc-400">Total na Fila</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xl font-black text-emerald-400 block font-mono">{analyzed}</span>
            <span className="text-[11px] text-zinc-400">Analisados</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xl font-black text-emerald-400 block font-mono">{packagesCreated}</span>
            <span className="text-[11px] text-zinc-400">Pacotes Criados</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xl font-black text-emerald-400 block font-mono">{thumbnailsReady}</span>
            <span className="text-[11px] text-zinc-400">Thumbnails Prontas</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xl font-black text-emerald-400 block font-mono">{reviewed}</span>
            <span className="text-[11px] text-zinc-400">Revisados</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xl font-black text-emerald-400 block font-mono">{readyToPublish}</span>
            <span className="text-[11px] text-zinc-400">Prontos p/ Postar</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & Batch Actions Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "all", label: `Todos (${videos.length})` },
              { id: "pending", label: `Aguardando (${pending})` },
              { id: "processing", label: `Em Progresso (${inProgress})` },
              { id: "completed", label: `Concluídos (${completed})` },
              { id: "error", label: `Erros (${errors})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-emerald-500 text-zinc-950 shadow-md"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por #ID, título, obra..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Batch Selection Action Bar */}
        {selectedVideoIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-emerald-500/30 font-mono text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-zinc-200">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-black">
                {selectedVideoIds.length}
              </span>
              <span>vídeo(s) selecionado(s)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchReanalyzeSelected}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reanalisar Selecionados
              </button>
              <button
                onClick={handleBatchDeleteSelected}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold flex items-center gap-1.5 border border-rose-500/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Selecionados
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Queue Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-3 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="Selecionar Todos"
            >
              {selectedVideoIds.length === filteredVideos.length && filteredVideos.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span>Vídeo / Obra ({filteredVideos.length})</span>
          </div>
          <span>Status & Ações</span>
        </div>

        <div className="space-y-2.5">
          {paginatedVideos.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl font-mono">
              Nenhum vídeo encontrado com os filtros selecionados.
            </div>
          ) : (
            paginatedVideos.map((video) => {
              const isSelected = selectedVideoIds.includes(video.id);
              const isCurrentProcessing =
                video.status === "analisando" ||
                video.status === "gerando_estrategia" ||
                video.status === "gerando_thumbnail";

              return (
                <div
                  key={video.id}
                  id={`queue-item-${video.id}`}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    video.status === "erro"
                      ? "bg-rose-950/10 border-rose-500/30 hover:border-rose-500/50"
                      : isSelected
                      ? "bg-emerald-950/15 border-emerald-500/40"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Left: Checkbox + Video Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleSelectOne(video.id)}
                      className="text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="w-14 h-14 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800 relative">
                      <img
                        src={
                          video.thumbnailDataUrl ||
                          video.frameDataUrl ||
                          "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200"
                        }
                        alt={video.workName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-zinc-950/90 text-[9px] font-black text-emerald-400 text-center py-0.5 font-mono">
                        {video.serialId}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-zinc-100 truncate">
                          {video.serialId} — {video.workName}
                        </h3>
                        {video.package?.viralScore && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            {video.package.viralScore} pts
                          </span>
                        )}
                        {video.status === "erro" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
                            Falha na IA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate max-w-md">
                        {video.package?.selectedHook || video.sceneDescription || video.filename}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1 font-mono">
                        <span>{video.genre}</span>
                        <span>•</span>
                        <span>{video.duration}</span>
                        <span>•</span>
                        <span>{video.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center flex-wrap">
                    {getStatusBadge(video.status, video.statusMessage)}

                    {/* Botão Analisar Novamente / Analisar Agora / Reanalisar IA */}
                    {video.status === "erro" ? (
                      <button
                        id={`btn-reanalyze-${video.id}`}
                        onClick={() => onReanalyzeVideo(video)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-black cursor-pointer font-mono flex items-center gap-1.5 transition-all shadow-sm"
                        title="Tentar analisar novamente este vídeo com a IA"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
                        Analisar Novamente
                      </button>
                    ) : video.status === "aguardando" ? (
                      <button
                        id={`btn-process-${video.id}`}
                        onClick={() => onProcessSingle(video)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black cursor-pointer font-mono flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Analisar Agora
                      </button>
                    ) : video.status === "concluido" ? (
                      <button
                        id={`btn-reanalyze-${video.id}`}
                        onClick={() => onReanalyzeVideo(video)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 text-xs font-bold cursor-pointer font-mono flex items-center gap-1.5 border border-zinc-700/60"
                        title="Reanalisar com IA para gerar novos ganchos e copys"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Reanalisar IA
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 rounded-lg bg-zinc-800/60 text-zinc-500 text-xs font-mono flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Processando
                      </div>
                    )}

                    {/* Botão Excluir Vídeo */}
                    {deleteConfirmId === video.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          id={`btn-confirm-delete-${video.id}`}
                          onClick={() => {
                            onDeleteVideo(video.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black cursor-pointer font-mono"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] font-bold cursor-pointer font-mono"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-delete-${video.id}`}
                        onClick={() => setDeleteConfirmId(video.id)}
                        className="p-2 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700/60 hover:border-rose-500/30 transition-colors cursor-pointer"
                        title="Excluir vídeo da fila"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Botão Detalhes */}
                    <button
                      id={`btn-details-${video.id}`}
                      onClick={() => onSelectVideo(video)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-zinc-700/60 cursor-pointer"
                      title="Abrir Detalhes"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
            <span className="text-xs text-zinc-400 font-mono">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, filteredVideos.length)} de{" "}
              {filteredVideos.length} vídeos na fila ({videos.length} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-200 px-3 font-mono">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
