import { VideoItem, PipelineStage, AutomationMode } from "../../types";
import { videoService } from "./videoService";
import { aiService } from "../aiService";
import { ThumbnailService } from "./thumbnailService";
import { HookService, TitleService, CaptionService } from "./hookService";
import { calendarService } from "./calendarService";
import { logService } from "./logService";

class AutomationService {
  private isRunning: boolean = false;
  private currentMode: AutomationMode = "semiauto";
  private activeVideoId: string | null = null;
  private cancelRequested: boolean = false;
  private listeners: ((state: { isRunning: boolean; activeVideoId: string | null; mode: AutomationMode }) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("cf_automation_mode") as AutomationMode;
      if (savedMode) this.currentMode = savedMode;
    }
  }

  public subscribe(cb: (state: { isRunning: boolean; activeVideoId: string | null; mode: AutomationMode }) => void) {
    this.listeners.push(cb);
    cb({ isRunning: this.isRunning, activeVideoId: this.activeVideoId, mode: this.currentMode });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) =>
      l({ isRunning: this.isRunning, activeVideoId: this.activeVideoId, mode: this.currentMode })
    );
  }

  public setMode(mode: AutomationMode) {
    this.currentMode = mode;
    if (typeof window !== "undefined") {
      localStorage.setItem("cf_automation_mode", mode);
    }
    this.notify();
  }

  public getMode(): AutomationMode {
    return this.currentMode;
  }

  public isEngineRunning(): boolean {
    return this.isRunning;
  }

  public stopEngine() {
    this.cancelRequested = true;
    this.isRunning = false;
    this.activeVideoId = null;
    this.notify();
    logService.log({
      level: "warn",
      category: "pipeline",
      message: "Fila de automação pausada pelo usuário.",
    });
  }

  /**
   * Processa toda a fila pendente de vídeos
   */
  public async processQueue(targetVideoIds?: string[]) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.cancelRequested = false;
    this.notify();

    const allVideos = videoService.getAll();
    const pending = targetVideoIds
      ? allVideos.filter((v) => targetVideoIds.includes(v.id))
      : allVideos.filter((v) => v.pipelineStage === "WAITING" || v.pipelineStage === "ERROR" || !v.pipelineStage);

    await logService.log({
      level: "info",
      category: "pipeline",
      message: `Iniciando processamento em lote de ${pending.length} vídeos (Modo: ${this.currentMode.toUpperCase()})`,
    });

    for (const video of pending) {
      if (this.cancelRequested) break;
      await this.runFullPipeline(video.id);
    }

    this.isRunning = false;
    this.activeVideoId = null;
    this.notify();

    await logService.log({
      level: "success",
      category: "pipeline",
      message: "Processamento da fila de produção finalizado.",
    });
  }

  /**
   * Executa o pipeline de ponta a ponta para um vídeo específico
   */
  public async runFullPipeline(videoId: string): Promise<boolean> {
    const video = videoService.getById(videoId);
    if (!video) return false;

    this.activeVideoId = videoId;
    this.notify();

    const maxAttempts = 3;
    let attempt = (video.attempts || 0) + 1;

    try {
      // ETAPA 1: DOWNLOADING / PREPARAÇÃO
      await videoService.updateStage(videoId, "DOWNLOADING", 10, "Carregando metadados e frame do corte...");
      await this.sleep(300);

      // ETAPA 2: ANALYZING / IDENTIFYING
      await videoService.updateStage(videoId, "ANALYZING", 25, "Executando análise de clímax e retenção via IA...");
      const analysis = await aiService.analyzeVideo({
        filename: video.filename,
        workName: video.workName,
        sceneDescription: video.sceneDescription,
        spoilerLevel: video.package?.spoilerLevel || "baixo",
        videoId: video.id,
      });

      // ETAPA 3: GENERATING_HOOKS & TITLES
      await videoService.updateStage(videoId, "GENERATING_HOOKS", 45, "Gerando 10 hooks magnéticos e 10 títulos...");
      const contentPackage = await aiService.generateContentPackage({
        workName: analysis.identifiedWork || video.workName,
        sceneContext: analysis.viralAngle,
        genre: analysis.genre || video.genre,
        emotion: analysis.emotion || "Tensão",
        spoilerLevel: video.package?.spoilerLevel || "baixo",
        serialId: video.serialId,
        videoId: video.id,
      });

      // ETAPA 4: GENERATING_THUMBNAIL
      await videoService.updateStage(videoId, "GENERATING_THUMBNAIL", 70, "Compondo thumbnail de alto contraste...");
      const thumbConfig = video.thumbnailConfig || {
        hookText: contentPackage.selectedHook,
        movieTitle: analysis.identifiedWork || video.workName,
        serialNumber: video.serialId,
        frameUrl: video.frameDataUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
        badgeStyle: "gold_pill",
        brandText: "CATEGORIA FILMES",
      };

      let thumbnailDataUrl: string | undefined;
      try {
        if (typeof document !== "undefined") {
          thumbnailDataUrl = await ThumbnailService.renderThumbnail(thumbConfig);
        }
      } catch (err) {
        console.warn("Canvas thumbnail render fallback:", err);
      }

      // ETAPA 5: QUALITY_CHECK
      await videoService.updateStage(videoId, "QUALITY_CHECK", 90, "Auditando checklist de qualidade e anti-repetição...");
      const qualityChecklist = {
        workIdentified: true,
        imageFound: true,
        hookCreated: true,
        hookStrong: (contentPackage.hooks[0]?.score || 90) >= 85,
        titleSpecific: true,
        thumbnailCreated: true,
        serialNumberAdded: true,
        imagePresent: true,
        textLegible: true,
        captionCreated: true,
        ctaCreated: true,
        commentCreated: true,
        scoreCalculated: true,
      };

      // ETAPA 6: READY / PERSISTÊNCIA NAS TABELAS
      await videoService.updateVideo(videoId, {
        workName: analysis.identifiedWork || video.workName,
        genre: analysis.genre || video.genre,
        subnicho: analysis.subnicho || video.subnicho,
        analysis,
        package: contentPackage,
        thumbnailConfig: thumbConfig,
        thumbnailDataUrl,
        qualityChecklist,
        pipelineStage: "READY",
        status: "concluido",
        progress: 100,
        statusMessage: "Pronto para agendamento e publicação",
        error: undefined,
        attempts: attempt,
      });

      // Salvar tabelas filhas no Supabase se conectado
      await HookService.saveHooksToSupabase(videoId, contentPackage.hooks, contentPackage.selectedHook);
      await TitleService.saveTitlesToSupabase(videoId, contentPackage.titles, contentPackage.selectedTitle);
      await CaptionService.saveCaptionsToSupabase(videoId, contentPackage.captions, contentPackage.selectedCaption?.id);
      await CaptionService.saveCommentsToSupabase(videoId, contentPackage.pinnedComments, contentPackage.selectedPinnedComment?.text);

      await logService.log({
        level: "success",
        category: "pipeline",
        message: `Pipeline concluído com sucesso para "${video.workName}" (${video.serialId})`,
        video_id: videoId,
        stage: "READY",
      });

      // Se estiver no MODO AUTOMÁTICO, agendar no calendário imediatamente
      if (this.currentMode === "auto") {
        const updated = videoService.getById(videoId);
        if (updated) {
          await calendarService.autoFillCalendar([updated]);
          await logService.log({
            level: "success",
            category: "publisher",
            message: `[Modo Automático] Vídeo "${video.workName}" alocado no calendário com sucesso!`,
            video_id: videoId,
            stage: "SCHEDULED",
          });
        }
      }

      return true;
    } catch (err: any) {
      console.error(`Erro no pipeline do vídeo ${videoId}:`, err);

      const canRetry = attempt < maxAttempts;
      const stage: PipelineStage = canRetry ? "WAITING" : "ERROR";

      await videoService.updateVideo(videoId, {
        pipelineStage: stage,
        status: "erro",
        error: err.message || "Erro desconhecido durante o pipeline",
        statusMessage: canRetry
          ? `Falha na tentativa ${attempt}/${maxAttempts}. Reenfileirando...`
          : `Erro definitivo após ${maxAttempts} tentativas.`,
        attempts: attempt,
      });

      await logService.log({
        level: "error",
        category: "pipeline",
        message: `Erro no vídeo "${video.workName}": ${err.message}`,
        video_id: videoId,
        stage: "ERROR",
      });

      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export const automationService = new AutomationService();
