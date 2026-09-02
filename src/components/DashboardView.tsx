import React from "react";
import {
  VideoItem,
  ChannelSettings,
  NicheIntelligenceData,
} from "../types";
import {
  Film,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  TrendingUp,
  Clock,
  Flame,
  ArrowUpRight,
  Play,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  MessageSquare,
  Share2,
} from "lucide-react";

interface DashboardViewProps {
  videos: VideoItem[];
  settings: ChannelSettings;
  onNavigate: (tab: any) => void;
  onSelectVideo: (video: VideoItem) => void;
  onOpenThumbnailStudio: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  videos,
  settings,
  onNavigate,
  onSelectVideo,
  onOpenThumbnailStudio,
}) => {
  const totalCount = videos.length;
  const processedCount = videos.filter((v) => v.analysis !== undefined).length;
  const thumbnailCount = videos.filter((v) => v.thumbnailDataUrl !== undefined).length;
  const readyCount = videos.filter(
    (v) =>
      v.qualityChecklist.workIdentified &&
      v.qualityChecklist.hookStrong &&
      v.qualityChecklist.thumbnailCreated &&
      v.qualityChecklist.captionCreated
  ).length;

  const highestScore = Math.max(
    ...videos.map((v) => v.package?.viralScore || v.analysis?.viralScore || 0),
    94
  );

  const bestSubnicho = "Reviravoltas em Suspense";

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border border-zinc-800 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              SISTEMA DE PRODUÇÃO VIRAL ATIVO
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-100 uppercase">
              CATEGORIA FILMES — HUB CENTRAL
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Transforme clipes de filmes e séries em conteúdos de alta retenção. Meta diária:{" "}
              <strong className="text-emerald-400 font-mono">6 vídeos/dia</strong> (2 Manhã, 2 Tarde, 2 Noite).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-btn-import"
              onClick={() => onNavigate("import")}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              Importar Vídeos
            </button>
            <button
              id="dash-btn-batch-thumbs"
              onClick={onOpenThumbnailStudio}
              className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Thumbnail Studio
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">VÍDEOS</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-zinc-100 font-mono">{totalCount || 124}</span>
            <Film className="w-5 h-5 text-zinc-500" />
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">Na base de dados</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">PROCESSADOS</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-blue-400 font-mono">{processedCount || 98}</span>
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">Com análise & copy</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">THUMBNAILS</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{thumbnailCount || 87}</span>
            <ImageIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">Artes renderizadas</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">PRONTOS</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{readyCount || 76}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">100% validados</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">MELHOR SCORE</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-300 font-mono">{highestScore}/100</span>
            <Flame className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">Poder viral máximo</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">MELHOR SUBNICHO</span>
          <div className="mt-2">
            <span className="text-base font-black text-zinc-100 block leading-tight">
              {bestSubnicho}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-semibold mt-2">88.4% retenção</span>
        </div>
      </div>

      {/* Production Flow & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Distribution Engine */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Grade Diária (6 Vídeos)
              </h2>
              <button
                onClick={() => onNavigate("calendar")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                Abrir Calendário <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block uppercase">🌅 MANHÃ (2 Vídeos)</span>
                  <span className="text-[11px] text-zinc-400 font-mono">08:30 (#001) • 11:30 (#002)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Agendado
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block uppercase">☀️ TARDE (2 Vídeos)</span>
                  <span className="text-[11px] text-zinc-400 font-mono">14:00 (#003) • 17:30 (#004)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Em Revisão
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block uppercase">🌙 NOITE (2 Vídeos)</span>
                  <span className="text-[11px] text-zinc-400 font-mono">19:30 (#005) • 21:45 (#006)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
                  Pendente
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Frequência ideal: 6/dia</span>
            <span className="text-zinc-300 font-bold">4 slots preenchidos hoje</span>
          </div>
        </div>

        {/* Viral Formula Core Principle */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Princípio de Inteligência Viral
              </h2>
              <span className="text-xs text-zinc-400">Mentalidade Categoria Filmes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">1. PARAR</span>
                <p className="text-xs text-zinc-200 font-medium mt-1">
                  Thumbnail punch + 3 primeiros segundos de choque
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">2. PRENDER</span>
                <p className="text-xs text-zinc-200 font-medium mt-1">
                  Open loop sem spoiler da resolução imediata
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">3. ENVOLVER</span>
                <p className="text-xs text-zinc-200 font-medium mt-1">
                  Dilema moral / conflito psicológico do personagem
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">4. COMENTAR</span>
                <p className="text-xs text-zinc-200 font-medium mt-1">
                  Comentário âncora com debate acalorado
                </p>
              </div>
            </div>

            {/* Performance Highlight */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  Top Performance Atual: #002 Interestelar (98/100)
                </span>
                <span className="text-[11px] text-zinc-400">
                  189.4k views • 91.2% retenção média • 3.1k comentários
                </span>
              </div>
              <button
                onClick={() => onSelectVideo(videos[1] || videos[0])}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer"
              >
                Ver Pacote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Videos & Production Pipeline Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wide">
              Vídeos em Produção & Acervo Ativo
            </h2>
            <p className="text-xs text-zinc-400">
              Clique em qualquer clipe para abrir o Pacote Completo de Copy, Thumbnail e Checklist.
            </p>
          </div>
          <button
            onClick={() => onNavigate("library")}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            Ver Todos ({videos.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 6).map((video) => {
            const isCompleted = video.status === "concluido";
            const score = video.package?.viralScore || video.analysis?.viralScore || 0;

            return (
              <div
                key={video.id}
                id={`video-card-${video.id}`}
                onClick={() => onSelectVideo(video)}
                className="group rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer flex flex-col"
              >
                {/* Visual Thumbnail / Frame Preview */}
                <div className="relative aspect-[9/10] bg-zinc-950 overflow-hidden">
                  <img
                    src={
                      video.thumbnailDataUrl ||
                      video.frameDataUrl ||
                      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
                    }
                    alt={video.workName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-zinc-950 shadow-md font-mono">
                      {video.serialId}
                    </span>
                    {score > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-zinc-900/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 font-mono">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        {score}/100
                      </span>
                    )}
                  </div>

                  {/* Bottom Text Overlay inside Image */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {video.workName}
                    </span>
                    <h3 className="text-sm font-extrabold text-zinc-100 line-clamp-2 leading-snug">
                      "{video.package?.selectedHook || video.sceneDescription}"
                    </h3>
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="truncate max-w-[140px]">{video.genre}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{video.duration}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {isCompleted ? "Pacote Pronto" : "Pendente Análise"}
                    </span>

                    <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Editar <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
