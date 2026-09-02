import { VideoItem } from "../types";
import { TMDBService } from "./tmdbService";
import { videoService } from "./supabase/videoService";
import { logService } from "./supabase/logService";

export interface ImportCandidate {
  id?: string;
  name: string;
  size?: string;
  duration?: string;
  sourceUrl?: string;
  driveFileId?: string;
  thumbnailUrl?: string;
  subfolderPath?: string;
  workNameHint?: string;
  year?: string;
  genreHint?: string;
  sceneDescriptionHint?: string;
}

export interface ImportJobStatus {
  id: string;
  status: "idle" | "running" | "paused" | "completed" | "cancelled" | "error";
  total: number;
  completed: number;
  failed: number;
  currentPercent: number;
  currentItemName: string;
  currentStepMessage: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  importedItems: VideoItem[];
}

type JobListener = (job: ImportJobStatus) => void;
type ItemImportedCallback = (item: VideoItem, autoStartQueue?: boolean) => void;

class ImportManagerService {
  private currentJob: ImportJobStatus = {
    id: "",
    status: "idle",
    total: 0,
    completed: 0,
    failed: 0,
    currentPercent: 0,
    currentItemName: "",
    currentStepMessage: "",
    startedAt: "",
    importedItems: [],
  };

  private listeners: JobListener[] = [];
  private itemCallbacks: ItemImportedCallback[] = [];
  private isCancellationRequested = false;

  public getStatus(): ImportJobStatus {
    return { ...this.currentJob };
  }

  public subscribe(listener: JobListener): () => void {
    this.listeners.push(listener);
    listener({ ...this.currentJob });
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  public onItemImported(callback: ItemImportedCallback): () => void {
    this.itemCallbacks.push(callback);
    return () => {
      const idx = this.itemCallbacks.indexOf(callback);
      if (idx !== -1) this.itemCallbacks.splice(idx, 1);
    };
  }

  private notify() {
    const copy = { ...this.currentJob };
    this.listeners.forEach((l) => {
      try {
        l(copy);
      } catch (err) {
        console.error("Erro no listener de importação:", err);
      }
    });
  }

  public cancelJob() {
    if (this.currentJob.status === "running") {
      this.isCancellationRequested = true;
      this.currentJob.status = "cancelled";
      this.currentJob.currentStepMessage = "Importação cancelada pelo usuário.";
      this.notify();
    }
  }

  public dismissCompletedBanner() {
    if (this.currentJob.status === "completed" || this.currentJob.status === "cancelled") {
      this.currentJob = {
        id: "",
        status: "idle",
        total: 0,
        completed: 0,
        failed: 0,
        currentPercent: 0,
        currentItemName: "",
        currentStepMessage: "",
        startedAt: "",
        importedItems: [],
      };
      this.notify();
    }
  }

  // Start background non-blocking import job
  public async startImportJob(params: {
    candidates: ImportCandidate[];
    startSerialNum: number;
    autoEnrichTMDB?: boolean;
    autoStartQueue?: boolean;
    customSceneContext?: string;
  }): Promise<void> {
    const {
      candidates,
      startSerialNum,
      autoEnrichTMDB = true,
      autoStartQueue = true,
      customSceneContext,
    } = params;

    if (candidates.length === 0) return;

    this.isCancellationRequested = false;
    const jobId = `job-import-${Date.now()}`;
    const startTime = new Date().toISOString();

    this.currentJob = {
      id: jobId,
      status: "running",
      total: candidates.length,
      completed: 0,
      failed: 0,
      currentPercent: 0,
      currentItemName: candidates[0]?.name || "Iniciando...",
      currentStepMessage: `Preparando importação de ${candidates.length} vídeos em segundo plano...`,
      startedAt: startTime,
      importedItems: [],
    };
    this.notify();

    await logService.log({
      level: "info",
      category: "ingestion",
      message: `Iniciando job de importação em segundo plano: ${candidates.length} itens.`,
      metadata: { jobId, total: candidates.length, autoEnrichTMDB },
    });

    let currentSerial = startSerialNum;
    const importedList: VideoItem[] = [];

    // Execute non-blocking loop with micro-task yielding
    for (let i = 0; i < candidates.length; i++) {
      if (this.isCancellationRequested) {
        break;
      }

      const candidate = candidates[i];
      const serialStr = `#${String(currentSerial).padStart(3, "0")}`;
      const itemProgressPercent = Math.round(((i) / candidates.length) * 100);

      this.currentJob.currentItemName = candidate.name;
      this.currentJob.currentStepMessage = `[${i + 1}/${candidates.length}] Extraindo metadados e normalizando arquivo...`;
      this.currentJob.currentPercent = itemProgressPercent;
      this.notify();

      // Clean default movie name from candidate name or hint
      let movieName = candidate.workNameHint ||
        candidate.name
          .replace(/\.(mp4|mov|mkv|avi|webm|m4v|ts)$/i, "")
          .replace(/\[.*?\]|\(.*?\)/g, "")
          .replace(/1080p|720p|4k|hdr|bluray|web-dl|x264|hevc/gi, "")
          .replace(/[-_]/g, " ")
          .trim();

      let genre = candidate.genreHint || "Filmes e Séries";
      let subnicho = candidate.subfolderPath || "Melhores Momentos";
      let releaseYear = candidate.year || "2024";
      let posterUrl = candidate.thumbnailUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop";
      let sceneDesc = customSceneContext || candidate.sceneDescriptionHint || `Cena marcante extraída do arquivo ${candidate.name}.`;

      // TMDB auto-enrichment if requested
      if (autoEnrichTMDB) {
        try {
          this.currentJob.currentStepMessage = `[${i + 1}/${candidates.length}] Consultando TMDB para "${movieName}"...`;
          this.notify();

          const tmdbMedia = await TMDBService.enrichMedia(movieName);
          if (tmdbMedia) {
            movieName = tmdbMedia.title;
            if (tmdbMedia.releaseYear) releaseYear = tmdbMedia.releaseYear;
            if (tmdbMedia.genres && tmdbMedia.genres.length > 0) {
              genre = tmdbMedia.genres.join(" / ");
            }
            if (tmdbMedia.overview && tmdbMedia.overview.length > 10) {
              sceneDesc = `${tmdbMedia.overview.slice(0, 160)}...`;
            }
            if (tmdbMedia.posterUrl) {
              posterUrl = tmdbMedia.posterUrl;
            }
          }
        } catch (tmdbErr) {
          console.warn("TMDB enrich fallback:", tmdbErr);
        }
      }

      // Build complete VideoItem
      const videoId = candidate.id || `vid-bg-${Date.now()}-${currentSerial}-${i}`;
      const newVideoItem: VideoItem = {
        id: videoId,
        serialId: serialStr,
        serialNum: currentSerial,
        filename: candidate.name,
        fileSize: candidate.size || "45.0 MB",
        duration: candidate.duration || "00:45",
        workName: movieName,
        identifiedWorkConfidence: "alta",
        year: releaseYear,
        genre,
        subnicho,
        status: "aguardando",
        progress: 0,
        statusMessage: "Na fila para análise",
        sceneDescription: sceneDesc,
        frameDataUrl: posterUrl,
        qualityChecklist: {
          workIdentified: true,
          imageFound: true,
          hookCreated: false,
          hookStrong: false,
          titleSpecific: false,
          thumbnailCreated: false,
          serialNumberAdded: false,
          imagePresent: true,
          textLegible: false,
          captionCreated: false,
          ctaCreated: false,
          commentCreated: false,
          scoreCalculated: false,
        },
        published: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      importedList.push(newVideoItem);
      this.currentJob.completed = i + 1;
      this.currentJob.currentPercent = Math.round(((i + 1) / candidates.length) * 100);
      this.currentJob.currentStepMessage = `[${i + 1}/${candidates.length}] ${movieName} adicionado à fila com sucesso!`;
      this.currentJob.importedItems = [...importedList];

      // Dispatch single item to App listener so it appears immediately in the queue
      this.itemCallbacks.forEach((cb) => {
        try {
          cb(newVideoItem, autoStartQueue && i === 0);
        } catch (err) {
          console.error("Erro ao despachar item importado:", err);
        }
      });

      this.notify();
      currentSerial++;

      // Yield event loop briefly to ensure browser stays 100% fluid
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    if (this.isCancellationRequested) {
      this.currentJob.status = "cancelled";
      this.currentJob.currentStepMessage = `Importação interrompida. ${this.currentJob.completed} de ${candidates.length} vídeos foram importados.`;
    } else {
      this.currentJob.status = "completed";
      this.currentJob.completedAt = new Date().toISOString();
      this.currentJob.currentPercent = 100;
      this.currentJob.currentStepMessage = `Concluído! ${importedList.length} vídeos importados e prontos para processamento.`;

      await logService.log({
        level: "success",
        category: "ingestion",
        message: `Importação em segundo plano finalizada: ${importedList.length} vídeos adicionados.`,
        metadata: { jobId, count: importedList.length },
      });
    }

    this.notify();
  }
}

export const importManager = new ImportManagerService();
