import React, { useState, useEffect } from "react";
import { VideoItem, AutomationMode, PipelineStage } from "../types";
import { automationService } from "../services/supabase/automationService";
import { videoService } from "../services/supabase/videoService";
import { costService, CostMetrics } from "../services/supabase/costService";
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  Flame,
} from "lucide-react";

interface AutomationsViewProps {
  videos: VideoItem[];
  onOpenVideoDetail: (video: VideoItem) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({ videos, onOpenVideoDetail }) => {
  const [engineState, setEngineState] = useState<{
    isRunning: boolean;
    activeVideoId: string | null;
    mode: AutomationMode;
  }>({
    isRunning: automationService.isEngineRunning(),
    activeVideoId: null,
    mode: automationService.getMode(),
  });

  const [costMetrics, setCostMetrics] = useState<CostMetrics>(costService.getMetrics());

  useEffect(() => {
    const unsub = automationService.subscribe((state) => {
      setEngineState(state);
      setCostMetrics(costService.getMetrics());
    });
    return unsub;
  }, []);

  const pendingVideos = videos.filter(
    (v) => v.pipelineStage === "WAITING" || v.pipelineStage === "ERROR" || !v.pipelineStage
  );
  const processingVideos = videos.filter(
    (v) =>
      v.pipelineStage &&
      v.pipelineStage !== "WAITING" &&
      v.pipelineStage !== "READY" &&
      v.pipelineStage !== "SCHEDULED" &&
      v.pipelineStage !== "PUBLISHED" &&
      v.pipelineStage !== "ERROR"
  );
  const readyVideos = videos.filter((v) => v.pipelineStage === "READY");
  const errorVideos = videos.filter((v) => v.pipelineStage === "ERROR");

  const handleStartQueue = () => {
    automationService.processQueue();
  };

  const handleStopQueue = () => {
    automationService.stopEngine();
  };

  const handleRetryFailed = () => {
    const failedIds = errorVideos.map((v) => v.id);
    if (failedIds.length > 0) {
      automationService.processQueue(failedIds);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
              ENGINE V2.4 • BACKGROUND WORKER
            </span>
            {engineState.isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                EXECUTANDO EM SEGUNDO PLANO
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-zinc-100 mt-2 uppercase tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-emerald-400" />
            Automações & Jobs em Segundo Plano
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Orquestrador inteligente de ingestão, análise multimodal, geração seriada de hooks e thumbnails.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {engineState.isRunning ? (
            <button
              onClick={handleStopQueue}
              className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center gap-2 hover:bg-amber-500/20 transition-all cursor-pointer shadow-lg"
            >
              <Pause className="w-4 h-4" />
              Pausar Fila
            </button>
          ) : (
            <button
              onClick={handleStartQueue}
              disabled={pendingVideos.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              Executar Fila Pendente ({pendingVideos.length})
            </button>
          )}

          {errorVideos.length > 0 && (
            <button
              onClick={handleRetryFailed}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-red-500/30 hover:border-red-500/60 text-red-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reprocessar Erros ({errorVideos.length})
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            mode: "manual" as AutomationMode,
            title: "Modo Manual",
            desc: "Você analisa e aprova cada gancho, legenda e arte de forma cirúrgica.",
            badge: "Total Controle",
            icon: Sliders,
          },
          {
            mode: "semiauto" as AutomationMode,
            title: "Modo Semiautomático (Recomendado)",
            desc: "A IA processa todas as etapas e deixa o pacote pronto para revisão com 1 clique.",
            badge: "Alta Produtividade",
            icon: Sparkles,
          },
          {
            mode: "auto" as AutomationMode,
            title: "Modo 100% Automático",
            desc: "Do download do Drive ao agendamento diário de 6 vídeos sem intervenção humana.",
            badge: "Piloto Automático",
            icon: Zap,
          },
        ].map((item) => {
          const isCurrent = engineState.mode === item.mode;
          const Icon = item.icon;
          return (
            <div
              key={item.mode}
              onClick={() => automationService.setMode(item.mode)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                isCurrent
                  ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50 shadow-xl"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${isCurrent ? "text-emerald-400" : "text-zinc-400"}`} />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                      isCurrent
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-zinc-100 uppercase">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500">
                  {isCurrent ? "✓ MODO ATIVO" : "Clique para selecionar"}
                </span>
                <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-emerald-400" : "bg-zinc-700"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost & Token Monitor */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200">
              Telemetria de Tokens & Custo Gemini API
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Modelo Principal: Gemini 3.7 Flash</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block">Chamadas de IA</span>
            <span className="text-lg font-black text-zinc-100 font-mono mt-0.5 block">{costMetrics.totalCalls}</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block">Tokens Processados</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
              {((costMetrics.totalTokensInput + costMetrics.totalTokensOutput) / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block">Custo Estimado</span>
            <span className="text-lg font-black text-amber-400 font-mono mt-0.5 block">
              ${costMetrics.estimatedCostUSD.toFixed(4)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block">Latência Média</span>
            <span className="text-lg font-black text-zinc-200 font-mono mt-0.5 block">1.2s / cena</span>
          </div>
        </div>
      </div>

      {/* Active Jobs Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Status dos Vídeos no Pipeline ({videos.length})
          </h2>
          <span className="text-xs text-zinc-400">
            {readyVideos.length} Concluídos • {pendingVideos.length} Na Fila
          </span>
        </div>

        <div className="space-y-2">
          {videos.slice(0, 15).map((video) => {
            const isCurrentActive = engineState.activeVideoId === video.id;
            const isDone = video.pipelineStage === "READY" || video.pipelineStage === "SCHEDULED";
            const isFailed = video.pipelineStage === "ERROR";

            return (
              <div
                key={video.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCurrentActive
                    ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40"
                    : isFailed
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      isDone
                        ? "bg-emerald-500 text-zinc-950"
                        : isFailed
                        ? "bg-red-500 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {video.serialId}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100 truncate">{video.workName}</span>
                      <span className="text-[10px] font-mono text-zinc-400">[{video.genre}]</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {video.statusMessage || video.sceneDescription}
                    </span>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-36 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className={isFailed ? "text-red-400" : isDone ? "text-emerald-400" : "text-zinc-400"}>
                        {video.pipelineStage || "WAITING"}
                      </span>
                      <span className="font-mono text-zinc-400">{video.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isFailed ? "bg-red-500" : isDone ? "bg-emerald-500" : "bg-emerald-400"
                        }`}
                        style={{ width: `${video.progress || (isDone ? 100 : 0)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenVideoDetail(video)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
