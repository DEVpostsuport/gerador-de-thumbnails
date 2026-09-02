import { SystemLogEntry, PipelineStage } from "../../types";
import { getSupabaseClient } from "./supabaseClient";

const LOGS_STORAGE_KEY = "cf_system_logs_cache";

class LogService {
  private logs: SystemLogEntry[] = [];
  private listeners: ((logs: SystemLogEntry[]) => void)[] = [];

  constructor() {
    this.loadCachedLogs();
  }

  private loadCachedLogs() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LOGS_STORAGE_KEY);
        if (raw) {
          this.logs = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Erro ao carregar logs:", err);
      }
    }
  }

  private persistLogs() {
    if (typeof window !== "undefined") {
      try {
        // Keep last 300 logs in local storage
        const trimmed = this.logs.slice(0, 300);
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(trimmed));
      } catch (err) {
        console.warn("Storage quota:", err);
      }
    }
    this.notify();
  }

  public subscribe(cb: (logs: SystemLogEntry[]) => void) {
    this.listeners.push(cb);
    cb([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const copy = [...this.logs];
    this.listeners.forEach((l) => l(copy));
  }

  public async log(params: {
    level: "info" | "success" | "warn" | "error";
    category: "ingestion" | "gemini_ai" | "pipeline" | "supabase" | "thumbnail" | "publisher";
    message: string;
    duration_ms?: number;
    video_id?: string;
    stage?: PipelineStage;
    tokens_used?: number;
    metadata?: Record<string, any>;
  }) {
    const entry: SystemLogEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      ...params,
    };

    // Prepend new entry
    this.logs.unshift(entry);
    this.persistLogs();

    // Async push to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("system_logs").insert({
          level: entry.level,
          category: entry.category,
          message: entry.message,
          duration_ms: entry.duration_ms,
          video_id: entry.video_id,
          stage: entry.stage,
          tokens_used: entry.tokens_used,
          metadata: entry.metadata || {},
        });
      } catch (err) {
        // Silent catch for logs
      }
    }

    return entry;
  }

  public getLogs(): SystemLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOGS_STORAGE_KEY);
    }
    this.notify();
  }
}

export const logService = new LogService();
