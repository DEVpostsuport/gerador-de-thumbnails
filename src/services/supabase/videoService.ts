import { VideoItem, PipelineStage } from "../../types";
import { getSupabaseClient } from "./supabaseClient";
import { logService } from "./logService";

const STORAGE_KEY = "cf_videos_master_cache";

class VideoService {
  private videos: VideoItem[] = [];
  private listeners: ((videos: VideoItem[]) => void)[] = [];

  constructor() {
    this.loadFromCache();
  }

  private loadFromCache() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.videos = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Erro ao carregar cache de vídeos:", err);
      }
    }
  }

  public saveToCache() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.videos));
      } catch (err) {
        console.warn("Storage quota:", err);
      }
    }
    this.notify();
  }

  public subscribe(cb: (videos: VideoItem[]) => void) {
    this.listeners.push(cb);
    cb([...this.videos]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const copy = [...this.videos];
    this.listeners.forEach((l) => l(copy));
  }

  public getAll(): VideoItem[] {
    return [...this.videos];
  }

  public getById(id: string): VideoItem | undefined {
    return this.videos.find((v) => v.id === id);
  }

  public async setVideos(videos: VideoItem[]) {
    this.videos = videos;
    this.saveToCache();

    // Sincronizar com server backend
    try {
      fetch("/api/storage/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos }),
      }).catch(() => {});
    } catch (e) {}

    // Sincronizar com Supabase se configurado
    const supabase = getSupabaseClient();
    if (supabase && videos.length > 0) {
      try {
        const records = videos.map((v) => ({
          id: v.id,
          serial_number: v.serialId,
          serial_num: v.serialNum,
          original_filename: v.filename,
          source_type: "google_drive",
          duration: v.duration,
          status: v.pipelineStage || "READY",
          movie_name: v.workName,
          genre: v.genre,
          subnicho: v.subnicho,
          scene_description: v.sceneDescription,
          spoiler_level: v.package?.spoilerLevel || "baixo",
          progress: v.progress || 100,
        }));
        await supabase.from("videos").upsert(records, { onConflict: "id" });
      } catch (err) {
        console.warn("[Supabase] Upsert warning:", err);
      }
    }
  }

  public async addVideo(video: VideoItem): Promise<VideoItem> {
    this.videos.unshift(video);
    this.saveToCache();

    await logService.log({
      level: "info",
      category: "ingestion",
      message: `Vídeo "${video.workName}" (${video.serialId}) adicionado à fila`,
      video_id: video.id,
      stage: video.pipelineStage || "WAITING",
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("videos").insert({
          id: video.id,
          serial_number: video.serialId,
          serial_num: video.serialNum,
          original_filename: video.filename,
          source_type: "google_drive",
          duration: video.duration,
          status: video.pipelineStage || "WAITING",
          movie_name: video.workName,
          genre: video.genre,
          subnicho: video.subnicho,
          scene_description: video.sceneDescription,
          spoiler_level: "baixo",
          progress: video.progress || 0,
        });
      } catch (err) {
        console.warn("[Supabase] Insert video error:", err);
      }
    }

    return video;
  }

  public async updateVideo(id: string, updates: Partial<VideoItem>): Promise<VideoItem | null> {
    const idx = this.videos.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    this.videos[idx] = {
      ...this.videos[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToCache();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const v = this.videos[idx];
        await supabase.from("videos").update({
          status: v.pipelineStage || "READY",
          movie_name: v.workName,
          genre: v.genre,
          subnicho: v.subnicho,
          progress: v.progress,
          error_message: v.error,
          updated_at: new Date().toISOString(),
        }).eq("id", id);
      } catch (err) {
        console.warn("[Supabase] Update video warning:", err);
      }
    }

    return this.videos[idx];
  }

  public async updateStage(id: string, stage: PipelineStage, progress: number, message?: string) {
    return this.updateVideo(id, {
      pipelineStage: stage,
      progress,
      statusMessage: message,
    });
  }

  public async deleteVideo(id: string) {
    this.videos = this.videos.filter((v) => v.id !== id);
    this.saveToCache();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("videos").delete().eq("id", id);
      } catch (err) {
        console.warn("[Supabase] Delete video warning:", err);
      }
    }
  }

  public getNextSerialNumber(): { serialId: string; serialNum: number } {
    const maxNum = this.videos.reduce((max, v) => Math.max(max, v.serialNum || 0), 0);
    const nextNum = maxNum + 1;
    const serialId = `#${String(nextNum).padStart(3, "0")}`;
    return { serialId, serialNum: nextNum };
  }
}

export const videoService = new VideoService();
