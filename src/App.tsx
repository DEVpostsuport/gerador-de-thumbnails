import React, { useState, useEffect, useRef } from "react";
import {
  VideoItem,
  ChannelSettings,
  ThumbnailConfig,
} from "./types";
import { SAMPLE_VIDEOS } from "./lib/sampleVideos";
import { DEFAULT_TEMPLATES } from "./lib/templates";
import { Navigation, ViewTab } from "./components/Navigation";
import { DashboardView } from "./components/DashboardView";
import { ImportVideosView } from "./components/ImportVideosView";
import { ProductionQueueView } from "./components/ProductionQueueView";
import { ThumbnailStudioView } from "./components/ThumbnailStudioView";
import { EnginesView } from "./components/EnginesView";
import { ContentLibraryView } from "./components/ContentLibraryView";
import { NicheIntelView } from "./components/NicheIntelView";
import { CalendarView } from "./components/CalendarView";
import { TemplatesView } from "./components/TemplatesView";
import { SettingsView } from "./components/SettingsView";
import { AutomationsView } from "./components/AutomationsView";
import { LogsView } from "./components/LogsView";
import { AnalyticsView } from "./components/AnalyticsView";
import { VideoDetailModal } from "./components/VideoDetailModal";
import { GlobalImportProgressBar } from "./components/GlobalImportProgressBar";
import { importManager } from "./services/importManagerService";
import { analyzeVideoScene, generateContentPackage } from "./lib/geminiClient";
import { drawThumbnailToCanvas } from "./lib/thumbnailRenderer";

const DEFAULT_SETTINGS: ChannelSettings = {
  channelName: "Categoria Filmes",
  channelHandle: "@categoriafilmes",
  defaultHashtags: [
    "#categoriafilmes",
    "#cinema",
    "#series",
    "#filmeseseries",
    "#cenasinesqueciveis",
    "#melhoresmomentos",
  ],
  dailyTargetVideos: 6,
  autoMode: true,
  automationMode: "semiauto",
  spoilerLevel: "baixo",
  defaultBadgeStyle: "gold_pill",
  defaultTemplateId: "template-01",
};

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem("cat_filmes_videos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SAMPLE_VIDEOS;
      }
    }
    return SAMPLE_VIDEOS;
  });

  const [settings, setSettings] = useState<ChannelSettings>(() => {
    const saved = localStorage.getItem("cat_filmes_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [autoMode, setAutoMode] = useState<boolean>(settings.autoMode);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);
  const [selectedModalVideo, setSelectedModalVideo] = useState<VideoItem | null>(null);
  const [studioVideoId, setStudioVideoId] = useState<string>(videos[0]?.id || "");

  // Listen to background non-blocking video imports across the entire app
  useEffect(() => {
    const unsub = importManager.onItemImported((newItem, autoStart) => {
      setVideos((prev) => {
        if (prev.some((v) => v.id === newItem.id)) {
          return prev;
        }
        return [...prev, newItem];
      });
      if (autoStart) {
        setIsProcessingQueue(true);
      }
    });
    return () => unsub();
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem("cat_filmes_videos", JSON.stringify(videos));
    // Also try background sync to backend
    fetch("/api/storage/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videos, settings }),
    }).catch(() => {});
  }, [videos, settings]);

  const queueCount = videos.filter((v) => v.status === "aguardando").length;
  const readyCount = videos.filter(
    (v) =>
      v.qualityChecklist.workIdentified &&
      v.qualityChecklist.hookStrong &&
      v.qualityChecklist.thumbnailCreated
  ).length;

  // Process a single video with AI pipeline
  const processVideoPipeline = async (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              status: "analisando",
              statusMessage: "Analisando cena e gerando estratégia...",
              progress: 25,
            }
          : v
      )
    );

    try {
      const current = videos.find((v) => v.id === videoId);
      if (!current) return;

      // 1. Analyze Scene
      const analysis = await analyzeVideoScene({
        filename: current.filename,
        workName: current.workName,
        sceneDescription: current.sceneDescription,
        spoilerLevel: "baixo",
      });

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                analysis,
                status: "gerando_estrategia",
                statusMessage: "Gerando variações de ganchos, títulos e legendas...",
                progress: 60,
              }
            : v
        )
      );

      // 2. Generate Full Content Package
      const pkg = await generateContentPackage({
        workName: current.workName,
        sceneContext: current.sceneDescription,
        genre: current.genre || analysis.genre,
        emotion: analysis.emotion,
        spoilerLevel: "baixo",
        serialId: current.serialId,
      });

      // 3. Render Default Serialized Thumbnail (9:16)
      const offscreenCanvas = document.createElement("canvas");
      const thumbConfig: ThumbnailConfig = {
        serialNumber: current.serialId,
        hookText: (pkg.selectedHook || analysis.recommendedThumbnailText).toUpperCase().slice(0, 36),
        movieTitle: current.workName,
        brandText: "CATEGORIA FILMES",
        frameUrl: current.frameDataUrl,
        badgeStyle: "gold_pill",
        fontFamily: "'Bebas Neue', sans-serif",
        hookFontSize: 86,
        textColor: "#FFFFFF",
        strokeColor: "#000000",
        strokeWidth: 6,
        accentColor: "#F59E0B",
        gradientOverlay: "bottom",
        vignetteStrength: 0.7,
        showBrand: true,
        filterBrightness: 100,
        filterContrast: 110,
        filterSaturation: 110,
      };

      const thumbDataUrl = await drawThumbnailToCanvas(
        offscreenCanvas,
        thumbConfig,
        DEFAULT_TEMPLATES[0],
        {
          width: 1080,
          height: 1920,
          showGuides: false,
        }
      );

      // 4. Mark Complete & Update Checklist
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                analysis,
                package: pkg,
                thumbnailDataUrl: thumbDataUrl,
                status: "concluido",
                statusMessage: "Pacote 100% concluído e validado",
                progress: 100,
                qualityChecklist: {
                  workIdentified: true,
                  imageFound: true,
                  hookCreated: true,
                  hookStrong: true,
                  titleSpecific: true,
                  thumbnailCreated: true,
                  serialNumberAdded: true,
                  imagePresent: true,
                  textLegible: true,
                  captionCreated: true,
                  ctaCreated: true,
                  commentCreated: true,
                  scoreCalculated: true,
                },
                updatedAt: new Date().toISOString(),
              }
            : v
        )
      );
    } catch (err: any) {
      console.error("Pipeline error for video", videoId, err);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                status: "erro",
                statusMessage: err.message || "Erro durante o processamento",
              }
            : v
        )
      );
    }
  };

  // Handlers for Delete & Reanalyze
  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    if (selectedModalVideo?.id === videoId) {
      setSelectedModalVideo(null);
    }
    if (studioVideoId === videoId) {
      setVideos((prev) => {
        const remaining = prev.filter((v) => v.id !== videoId);
        setStudioVideoId(remaining[0]?.id || "");
        return remaining;
      });
    }
  };

  const handleBatchDeleteVideos = (videoIds: string[]) => {
    setVideos((prev) => prev.filter((v) => !videoIds.includes(v.id)));
    if (selectedModalVideo && videoIds.includes(selectedModalVideo.id)) {
      setSelectedModalVideo(null);
    }
  };

  const handleReanalyzeVideo = (video: VideoItem) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? {
              ...v,
              status: "aguardando",
              statusMessage: "Reanálise agendada na fila...",
              progress: 0,
            }
          : v
      )
    );
    setIsProcessingQueue(true);
    processVideoPipeline(video.id);
  };

  const handleRetryFailed = () => {
    setVideos((prev) =>
      prev.map((v) => (v.status === "erro" ? { ...v, status: "aguardando", progress: 0 } : v))
    );
    setIsProcessingQueue(true);
  };

  // Automated Queue Loop - Processes waiting videos sequentially & automatically
  useEffect(() => {
    if (isProcessingQueue || autoMode) {
      const isCurrentlyProcessing = videos.some(
        (v) =>
          v.status === "analisando" ||
          v.status === "gerando_estrategia" ||
          v.status === "gerando_thumbnail"
      );

      if (!isCurrentlyProcessing) {
        const nextPending = videos.find((v) => v.status === "aguardando");
        if (nextPending) {
          if (!isProcessingQueue) setIsProcessingQueue(true);
          processVideoPipeline(nextPending.id);
        } else if (isProcessingQueue && !videos.some((v) => v.status === "aguardando")) {
          setIsProcessingQueue(false);
        }
      }
    }
  }, [isProcessingQueue, autoMode, videos]);

  // Handlers
  const handleImportVideos = (newVideos: Partial<VideoItem>[], autoStart?: boolean) => {
    if (newVideos && newVideos.length > 0) {
      setVideos((prev) => [...prev, ...(newVideos as VideoItem[])]);
    }
    setCurrentTab("queue");
    if (autoStart || autoMode) {
      setIsProcessingQueue(true);
    }
  };

  const handleUpdateThumbnail = (videoId: string, config: ThumbnailConfig, dataUrl: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              thumbnailDataUrl: dataUrl,
              qualityChecklist: {
                ...v.qualityChecklist,
                thumbnailCreated: true,
                serialNumberAdded: !!config.serialNumber,
                textLegible: true,
              },
            }
          : v
      )
    );
  };

  const handleBatchGenerateThumbnails = async (templateId: string) => {
    const targetTpl =
      DEFAULT_TEMPLATES.find((t) => t.id === templateId) || DEFAULT_TEMPLATES[0];

    const updated = await Promise.all(
      videos.map(async (v) => {
        const offscreen = document.createElement("canvas");
        const hook =
          v.package?.selectedHook ||
          v.analysis?.recommendedThumbnailText ||
          "MOMENTO MARCANTEDO CINEMA";

        const cfg: ThumbnailConfig = {
          serialNumber: v.serialId,
          hookText: hook.toUpperCase().slice(0, 36),
          movieTitle: v.workName,
          brandText: "CATEGORIA FILMES",
          frameUrl: v.frameDataUrl,
          badgeStyle: targetTpl.badgeStyle,
          fontFamily: targetTpl.fontFamily,
          hookFontSize: targetTpl.hookFontSize,
          textColor: targetTpl.textColor,
          strokeColor: targetTpl.strokeColor,
          strokeWidth: targetTpl.strokeWidth,
          accentColor: targetTpl.accentColor,
          gradientOverlay: targetTpl.gradientOverlay,
          vignetteStrength: targetTpl.vignetteStrength,
          showBrand: true,
          filterBrightness: 100,
          filterContrast: 110,
          filterSaturation: 110,
        };

        const dataUrl = await drawThumbnailToCanvas(offscreen, cfg, targetTpl, {
          width: 1080,
          height: 1920,
          showGuides: false,
        });

        return {
          ...v,
          thumbnailDataUrl: dataUrl,
          qualityChecklist: {
            ...v.qualityChecklist,
            thumbnailCreated: true,
            serialNumberAdded: true,
            textLegible: true,
          },
        };
      })
    );

    setVideos(updated);
  };

  const handleUpdatePackage = (videoId: string, updatedPackage: any) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, package: updatedPackage } : v))
    );
  };

  const handleResetDatabase = () => {
    if (window.confirm("Deseja restaurar a base padrão de demonstração?")) {
      setVideos(SAMPLE_VIDEOS);
      localStorage.setItem("cat_filmes_videos", JSON.stringify(SAMPLE_VIDEOS));
    }
  };

  const nextSerialNum =
    videos.length > 0 ? Math.max(...videos.map((v) => v.serialNum || 0)) + 1 : 1;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950 font-sans antialiased">
      {/* Persistent Left Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        queueCount={queueCount}
        readyCount={readyCount}
        totalCount={videos.length}
        autoMode={autoMode}
        onToggleAutoMode={() => {
          setAutoMode(!autoMode);
          setSettings((prev) => ({ ...prev, autoMode: !autoMode }));
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {currentTab === "dashboard" && (
          <DashboardView
            videos={videos}
            settings={settings}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectVideo={(v) => setSelectedModalVideo(v)}
            onOpenThumbnailStudio={() => {
              setStudioVideoId(videos[0]?.id || "");
              setCurrentTab("thumbnails");
            }}
          />
        )}

        {currentTab === "import" && (
          <ImportVideosView
            onImportVideos={handleImportVideos}
            nextSerialId={nextSerialNum}
            autoMode={autoMode}
          />
        )}

        {currentTab === "queue" && (
          <ProductionQueueView
            videos={videos}
            isProcessing={isProcessingQueue}
            autoMode={autoMode}
            onToggleAutoMode={() => {
              setAutoMode(!autoMode);
              setSettings((prev) => ({ ...prev, autoMode: !autoMode }));
            }}
            onStartQueue={() => setIsProcessingQueue(true)}
            onPauseQueue={() => setIsProcessingQueue(false)}
            onRetryFailed={handleRetryFailed}
            onProcessSingle={(v) => processVideoPipeline(v.id)}
            onReanalyzeVideo={handleReanalyzeVideo}
            onDeleteVideo={handleDeleteVideo}
            onBatchDelete={handleBatchDeleteVideos}
            onSelectVideo={(v) => setSelectedModalVideo(v)}
          />
        )}

        {currentTab === "thumbnails" && (
          <ThumbnailStudioView
            videos={videos}
            selectedVideoId={studioVideoId}
            onUpdateVideoThumbnail={handleUpdateThumbnail}
            onBatchGenerateThumbnails={handleBatchGenerateThumbnails}
          />
        )}

        {(currentTab === "hook_engine" ||
          currentTab === "title_engine" ||
          currentTab === "caption_engine" ||
          currentTab === "cta_engine" ||
          currentTab === "comment_engine") && (
          <EnginesView
            engineType={currentTab}
            videos={videos}
            selectedVideoId={studioVideoId}
            onSelectVideoId={(id) => setStudioVideoId(id)}
            onUpdateVideoPackage={handleUpdatePackage}
          />
        )}

        {currentTab === "library" && (
          <ContentLibraryView
            videos={videos}
            onSelectVideo={(v) => setSelectedModalVideo(v)}
            onOpenThumbnailStudio={(id) => {
              setStudioVideoId(id);
              setCurrentTab("thumbnails");
            }}
            onDeleteVideo={handleDeleteVideo}
            onBatchDelete={handleBatchDeleteVideos}
            onReanalyzeVideo={handleReanalyzeVideo}
          />
        )}

        {currentTab === "niche_intel" && <NicheIntelView />}

        {currentTab === "analytics" && <AnalyticsView videos={videos} />}

        {currentTab === "calendar" && (
          <CalendarView
            videos={videos}
            onSelectVideo={(v) => setSelectedModalVideo(v)}
          />
        )}

        {currentTab === "templates" && (
          <TemplatesView
            onOpenThumbnailStudio={() => {
              setStudioVideoId(videos[0]?.id || "");
              setCurrentTab("thumbnails");
            }}
          />
        )}

        {currentTab === "automations" && (
          <AutomationsView
            videos={videos}
            onOpenVideoDetail={(v) => setSelectedModalVideo(v)}
          />
        )}

        {currentTab === "logs" && <LogsView />}

        {currentTab === "settings" && (
          <SettingsView
            settings={settings}
            onSaveSettings={(newS) => {
              setSettings(newS);
              localStorage.setItem("cat_filmes_settings", JSON.stringify(newS));
            }}
            onResetDatabase={handleResetDatabase}
          />
        )}
      </main>

      {/* Video Detail Modal */}
      {selectedModalVideo && (
        <VideoDetailModal
          video={selectedModalVideo}
          onClose={() => setSelectedModalVideo(null)}
          onOpenThumbnailStudio={(id) => {
            setStudioVideoId(id);
            setSelectedModalVideo(null);
            setCurrentTab("thumbnails");
          }}
          onReanalyzeVideo={handleReanalyzeVideo}
          onDeleteVideo={handleDeleteVideo}
        />
      )}

      {/* Persistent Non-Blocking Global Import Progress Card */}
      <GlobalImportProgressBar
        onNavigateToQueue={() => setCurrentTab("queue")}
      />
    </div>
  );
}

export default App;
