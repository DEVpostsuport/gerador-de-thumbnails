import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Film,
  Layers,
  StopCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { importManager, ImportJobStatus } from "../services/importManagerService";

interface GlobalImportProgressBarProps {
  onNavigateToQueue?: () => void;
}

export const GlobalImportProgressBar: React.FC<GlobalImportProgressBarProps> = ({
  onNavigateToQueue,
}) => {
  const [job, setJob] = useState<ImportJobStatus>(importManager.getStatus());
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsub = importManager.subscribe((updated) => {
      setJob(updated);
    });
    return () => unsub();
  }, []);

  // Auto-dismiss completed status after 10s
  useEffect(() => {
    if (job.status === "completed" || job.status === "cancelled") {
      const timer = setTimeout(() => {
        importManager.dismissCompletedBanner();
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [job.status]);

  if (job.status === "idle" || job.total === 0) {
    return null;
  }

  const isRunning = job.status === "running";
  const isCompleted = job.status === "completed";
  const isCancelled = job.status === "cancelled";

  return (
    <div
      id="global-import-progress-card"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] sm:w-96 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      <div
        className={`rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden transition-all ${
          isRunning
            ? "bg-[#13131b]/95 border-emerald-500/40 shadow-emerald-500/10"
            : isCompleted
            ? "bg-[#111813]/95 border-emerald-400/50 shadow-emerald-500/20"
            : "bg-[#1a1415]/95 border-amber-500/40 shadow-amber-500/10"
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 flex items-center justify-between gap-3 border-b border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isRunning ? (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            ) : isCompleted ? (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}

            <div className="truncate">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                {isRunning && "Importando em Segundo Plano"}
                {isCompleted && "Importação Concluída!"}
                {isCancelled && "Importação Interrompida"}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                  {job.completed}/{job.total}
                </span>
              </h4>
              <p className="text-[10px] text-zinc-400 truncate">
                {isRunning
                  ? "Você pode navegar livremente pelo app"
                  : isCompleted
                  ? `${job.completed} vídeos prontos na esteira`
                  : `${job.completed} vídeos adicionados`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title={isMinimized ? "Expandir" : "Minimizar"}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => importManager.dismissCompletedBanner()}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Body */}
        {!isMinimized && (
          <div className="p-4 space-y-3">
            {/* Progress Bar with Numbers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-zinc-300 font-mono">
                  {job.completed} de {job.total} vídeos importados
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  {job.currentPercent}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden relative border border-white/5">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    isCompleted
                      ? "bg-emerald-400"
                      : "bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
                  }`}
                  style={{ width: `${Math.max(4, job.currentPercent)}%` }}
                />
              </div>
            </div>

            {/* Current Item Action */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Film className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate font-medium text-zinc-200">{job.currentItemName}</span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate pl-4">
                {job.currentStepMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {isRunning && (
                <button
                  onClick={() => importManager.cancelJob()}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <StopCircle className="w-3.5 h-3.5" /> Parar
                </button>
              )}

              {onNavigateToQueue && (
                <button
                  onClick={() => {
                    onNavigateToQueue();
                  }}
                  className="ml-auto px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer font-mono"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Ver Fila ({job.completed})
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
