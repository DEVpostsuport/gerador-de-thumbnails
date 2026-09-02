import React, { useState, useEffect } from "react";
import { SystemLogEntry } from "../types";
import { logService } from "../services/supabase/logService";
import {
  Terminal,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Download,
} from "lucide-react";

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<SystemLogEntry[]>(logService.getLogs());
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const unsub = logService.subscribe((updated) => setLogs(updated));
    return unsub;
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (levelFilter !== "all" && l.level !== levelFilter) return false;
    if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClear = () => {
    if (confirm("Tem certeza que deseja limpar os logs do sistema?")) {
      logService.clearLogs();
    }
  };

  const handleExportLogs = () => {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categoria_filmes_logs_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
            OBSERVABILITY & AUDIT
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-2 uppercase tracking-tight flex items-center gap-3">
            <Terminal className="w-8 h-8 text-emerald-400" />
            Logs do Sistema & Auditoria de Execuções
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Rastreabilidade detalhada de chamadas de IA Gemini, latência, erros, persistência e jobs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportLogs}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Exportar JSON
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Logs
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <Filter className="w-4 h-4 text-emerald-400" />
            Nível:
          </div>
          {["all", "info", "success", "warn", "error"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                levelFilter === lvl
                  ? "bg-emerald-500 text-zinc-950 shadow-sm"
                  : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {lvl === "all" ? "Todos" : lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            <option value="gemini_ai">Gemini AI</option>
            <option value="pipeline">Pipeline Engine</option>
            <option value="ingestion">Ingestão Drive</option>
            <option value="thumbnail">Thumbnail Studio</option>
            <option value="supabase">Supabase Sync</option>
            <option value="publisher">Publicador</option>
          </select>

          <input
            type="text"
            placeholder="Buscar mensagem de log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500 w-56"
          />
        </div>
      </div>

      {/* Terminal View */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl font-mono text-xs">
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-zinc-400 text-[11px] font-bold uppercase">
              categoria_filmes_runtime.log ({filteredLogs.length} eventos)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold animate-pulse">● LIVE STREAM</span>
        </div>

        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Nenhum evento registrado com os filtros atuais.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const time = new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour12: false });
              return (
                <div
                  key={log.id}
                  className="py-1.5 px-3 rounded hover:bg-zinc-900/60 transition-colors flex items-start gap-3 border-l-2 border-transparent hover:border-zinc-700"
                >
                  <span className="text-zinc-600 shrink-0 select-none">[{time}]</span>

                  {/* Level Tag */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                      log.level === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : log.level === "error"
                        ? "bg-red-500/20 text-red-400"
                        : log.level === "warn"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {log.level}
                  </span>

                  {/* Category Tag */}
                  <span className="text-zinc-400 text-[11px] shrink-0 font-bold">
                    [{log.category.toUpperCase()}]
                  </span>

                  {/* Message */}
                  <span
                    className={`flex-1 break-words ${
                      log.level === "error"
                        ? "text-red-300"
                        : log.level === "success"
                        ? "text-emerald-300"
                        : log.level === "warn"
                        ? "text-amber-300"
                        : "text-zinc-200"
                    }`}
                  >
                    {log.message}
                  </span>

                  {/* Duration / Token Meta */}
                  {log.duration_ms && (
                    <span className="text-zinc-500 text-[10px] shrink-0 font-mono">
                      {log.duration_ms}ms
                    </span>
                  )}
                  {log.tokens_used && (
                    <span className="text-emerald-400 text-[10px] shrink-0 font-mono">
                      +{log.tokens_used} tok
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
