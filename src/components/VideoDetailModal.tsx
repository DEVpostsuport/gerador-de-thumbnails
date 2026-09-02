import React, { useState } from "react";
import { VideoItem } from "../types";
import { downloadSingleVideoPackage } from "../lib/exportUtils";
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  MessageSquare,
  Share2,
  Clock,
  Layers,
  Edit3,
  RotateCcw,
  Trash2,
} from "lucide-react";

interface VideoDetailModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onOpenThumbnailStudio: (videoId: string) => void;
  onReanalyzeVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({
  video,
  onClose,
  onOpenThumbnailStudio,
  onReanalyzeVideo,
  onDeleteVideo,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!video) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const score = video.package?.viralScore || video.analysis?.viralScore || 90;
  const checklist = video.qualityChecklist;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col scrollbar-thin scrollbar-thumb-neutral-800">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-neutral-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-sm font-black bg-amber-500 text-neutral-950 font-mono shadow-md">
              {video.serialId}
            </span>
            <div>
              <h2 className="text-xl font-black text-neutral-100 uppercase tracking-tight">
                {video.workName}
              </h2>
              <span className="text-xs text-neutral-400">
                {video.genre} • {video.subnicho} • {video.duration}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onReanalyzeVideo && (
              <button
                id="modal-reanalyze-btn"
                onClick={() => {
                  onReanalyzeVideo(video);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Reanalisar cena e gerar novos ganchos e copys com a IA"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Analisar Novamente
              </button>
            )}

            <button
              onClick={() => downloadSingleVideoPackage(video)}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Baixar (.ZIP)
            </button>

            {onDeleteVideo && (
              <button
                id="modal-delete-btn"
                onClick={() => {
                  if (
                    window.confirm(
                      `Deseja realmente excluir ${video.serialId} — "${video.workName}"?`
                    )
                  ) {
                    onDeleteVideo(video.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold uppercase flex items-center gap-1.5 border border-rose-500/30 cursor-pointer"
                title="Excluir vídeo do sistema"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8">
          {/* Top Score & Strategic Analysis Banner */}
          {video.analysis && (
            <div className="p-6 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-400 uppercase">
                      VIRAL SCORE CALCULADO
                    </span>
                    <h3 className="text-2xl font-black text-amber-300">
                      {score} / 100 Pontos
                    </h3>
                  </div>
                </div>

                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Alta Probabilidade de Retenção & Compartilhamento
                </span>
              </div>

              {/* 4 Pillars of Viral Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-black text-amber-400 uppercase block">
                    1. PARAR O SCROLL
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {video.analysis.whyStopScroll}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase block">
                    2. PRENDER (RETENÇÃO)
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {video.analysis.whyRetain}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-black text-purple-400 uppercase block">
                    3. FAZER COMENTAR
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {video.analysis.whyComment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase block">
                    4. COMPARTILHAR
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {video.analysis.whyShare}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Copy Materials Grid */}
          {video.package && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-neutral-100 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Materiais de Copywriting do Pacote
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hook & Title */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-amber-400 uppercase">
                        Hook da Thumbnail & Vídeo
                      </span>
                      <button
                        onClick={() => copyToClipboard(video.package!.selectedHook, "modal-hook")}
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === "modal-hook" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-black text-neutral-100 uppercase">
                      "{video.package.selectedHook}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-neutral-400 uppercase">
                        Título do Post
                      </span>
                      <button
                        onClick={() => copyToClipboard(video.package!.selectedTitle, "modal-title")}
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === "modal-title" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-bold text-neutral-200">
                      {video.package.selectedTitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-amber-400 uppercase">
                        Comentário Âncora Fixado
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(video.package!.selectedPinnedComment.text, "modal-comment")
                        }
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === "modal-comment" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium">
                      "{video.package.selectedPinnedComment.text}"
                    </p>
                  </div>
                </div>

                {/* Caption & Hashtags */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-neutral-300 uppercase">
                        Legenda do Vídeo
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(video.package!.selectedCaption.text, "modal-caption")
                        }
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === "modal-caption" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {video.package.selectedCaption.text}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex flex-wrap gap-1">
                    {video.package.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] font-mono text-amber-400">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnail & Quality Checklist Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Thumbnail Preview Card */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <div className="w-24 aspect-[9/16] rounded-xl bg-black overflow-hidden shrink-0 border border-neutral-800 shadow-md">
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
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-200 block">
                  Arte da Thumbnail (9:16)
                </span>
                <span className="text-[11px] text-neutral-400 block">
                  Com Hook, #ID, Imagem e Marca Categoria Filmes.
                </span>
                <button
                  onClick={() => onOpenThumbnailStudio(video.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar no Studio
                </button>
              </div>
            </div>

            {/* Checklist items */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-extrabold text-neutral-400 uppercase block">
                Auditoria de Qualidade
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Obra Identificada
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hook de Alto Impacto
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Número #{video.serialId}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Comentário Âncora
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
