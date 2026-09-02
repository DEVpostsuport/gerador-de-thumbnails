import React, { useState, useMemo } from "react";
import { VideoItem } from "../types";
import { downloadBatchVideosPackage, downloadSingleVideoPackage } from "../lib/exportUtils";
import {
  Film,
  Search,
  Filter,
  Download,
  Flame,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  ArrowUpDown,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface ContentLibraryViewProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onOpenThumbnailStudio: (videoId: string) => void;
  onDeleteVideo?: (videoId: string) => void;
  onBatchDelete?: (videoIds: string[]) => void;
  onReanalyzeVideo?: (video: VideoItem) => void;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = ({
  videos,
  onSelectVideo,
  onOpenThumbnailStudio,
  onDeleteVideo,
  onBatchDelete,
  onReanalyzeVideo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"serial" | "score" | "name">("serial");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique genres for filter
  const genresList = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => {
      if (v.genre) {
        v.genre.split("/").forEach((g) => set.add(g.trim()));
      }
    });
    return Array.from(set).filter(Boolean);
  }, [videos]);

  // Filtered & Sorted
  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          v.workName.toLowerCase().includes(q) ||
          v.serialId.toLowerCase().includes(q) ||
          v.filename.toLowerCase().includes(q) ||
          v.genre.toLowerCase().includes(q) ||
          (v.package?.selectedHook || "").toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "ready" &&
            v.qualityChecklist.workIdentified &&
            v.qualityChecklist.hookStrong &&
            v.qualityChecklist.thumbnailCreated) ||
          (statusFilter === "processed" && v.package !== undefined) ||
          (statusFilter === "pending" && v.status === "aguardando");

        const matchesGenre =
          genreFilter === "all" || v.genre.toLowerCase().includes(genreFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          const scoreA = a.package?.viralScore || 0;
          const scoreB = b.package?.viralScore || 0;
          return scoreB - scoreA;
        }
        if (sortBy === "name") {
          return a.workName.localeCompare(b.workName);
        }
        return a.serialNum - b.serialNum;
      });
  }, [videos, searchTerm, statusFilter, genreFilter, sortBy]);

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1;
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(start, start + itemsPerPage);
  }, [filteredVideos, currentPage, itemsPerPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVideos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVideos.map((v) => v.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchDownloadSelected = () => {
    const selectedVideos = videos.filter((v) => selectedIds.includes(v.id));
    downloadBatchVideosPackage(selectedVideos, "full_package");
  };

  const handleBatchDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Deseja realmente excluir ${selectedIds.length} vídeos selecionados?`
      )
    ) {
      if (onBatchDelete) {
        onBatchDelete(selectedIds);
      } else if (onDeleteVideo) {
        selectedIds.forEach((id) => onDeleteVideo(id));
      }
      setSelectedIds([]);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Film className="w-4 h-4" />
            Acervo & Biblioteca de Conteúdo
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-1 uppercase tracking-tight">
            Biblioteca de Vídeos Virais ({videos.length})
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Consulte todos os cortes catalogados do Google Drive ({videos.length} vídeos no acervo), baixe pacotes individuais ou em lote (.ZIP).
          </p>
        </div>

        {/* Global Batch Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={handleBatchDownloadSelected}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer font-mono"
              >
                <Download className="w-4 h-4" />
                Baixar Selecionados ({selectedIds.length}) .ZIP
              </button>

              {onDeleteVideo && (
                <button
                  onClick={handleBatchDeleteSelected}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs uppercase flex items-center gap-2 border border-rose-500/30 cursor-pointer font-mono"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir ({selectedIds.length})
                </button>
              )}
            </>
          )}

          <button
            onClick={() => downloadBatchVideosPackage(videos, "full_package")}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs uppercase flex items-center gap-2 border border-zinc-700 cursor-pointer font-mono"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Baixar Acervo Completo (.ZIP)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por filme, série, hook, gênero ou #ID..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-44 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-300 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="ready">100% Prontos</option>
            <option value="processed">Com Análise & Copy</option>
            <option value="pending">Aguardando Fila</option>
          </select>

          {/* Genre Filter */}
          <select
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-44 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-300 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">Todos os Gêneros</option>
            {genresList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full md:w-44 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-300 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="serial">Ordenar: Número (#001)</option>
            <option value="score">Ordenar: Maior Viral Score</option>
            <option value="name">Ordenar: Nome da Obra</option>
          </select>
        </div>

        {/* Selection Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              {selectedIds.length === filteredVideos.length && filteredVideos.length > 0
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </button>
            <span>{selectedIds.length} selecionados</span>
          </div>

          <span>Exibindo {filteredVideos.length} vídeos no acervo</span>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedVideos.map((video) => {
          const isSelected = selectedIds.includes(video.id);
          const isReady =
            video.qualityChecklist.workIdentified &&
            video.qualityChecklist.hookStrong &&
            video.qualityChecklist.thumbnailCreated;
          const score = video.package?.viralScore || video.analysis?.viralScore || 0;

          return (
            <div
              key={video.id}
              className={`group rounded-2xl bg-zinc-900 border transition-all overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "border-emerald-500 ring-1 ring-emerald-500"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Media Thumbnail Container */}
              <div
                onClick={() => onSelectVideo(video)}
                className="relative aspect-[9/11] bg-black overflow-hidden cursor-pointer"
              >
                <img
                  src={
                    video.thumbnailDataUrl ||
                    video.frameDataUrl ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400"
                  }
                  alt={video.workName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/60" />

                {/* Top Select & Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOne(video.id);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ${
                      isSelected ? "bg-emerald-500 text-zinc-950" : "bg-black/60 border border-white/40"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-zinc-950 font-mono">
                    {video.serialId}
                  </span>
                </div>

                {/* Score & Subnicho at bottom inside image */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                      {video.workName}
                    </span>
                    {score > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black/80 text-emerald-300 border border-emerald-500/40 font-mono">
                        {score} pts
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-extrabold text-zinc-100 line-clamp-2">
                    "{video.package?.selectedHook || video.sceneDescription}"
                  </h3>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 space-y-3 bg-zinc-900/95">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="truncate max-w-[130px]">{video.genre}</span>
                  <span>{video.duration}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      isReady
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {isReady ? "100% Pronto" : "Pendente"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {onReanalyzeVideo && (
                      <button
                        onClick={() => onReanalyzeVideo(video)}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 cursor-pointer"
                        title="Reanalisar com IA"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onOpenThumbnailStudio(video.id)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                      title="Abrir no Thumbnail Studio"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadSingleVideoPackage(video)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                      title="Baixar ZIP Individual"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {onDeleteVideo && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja realmente excluir ${video.serialId} — "${video.workName}"?`
                            )
                          ) {
                            onDeleteVideo(video.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Excluir Vídeo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800 font-mono">
          <span className="text-xs text-zinc-400">
            Página {currentPage} de {totalPages} ({filteredVideos.length} vídeos filtrados)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-200 px-3">
              {currentPage} / {totalPages}
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
  );
};
