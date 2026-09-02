import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  Film,
  Search,
  CheckSquare,
  Square,
  Download,
  RefreshCw,
  LogOut,
  Sparkles,
  ChevronRight,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Play,
  Layers,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import {
  googleSignIn,
  logoutGoogleDrive,
  isDriveAuthenticated,
  getCurrentDriveUser,
  subscribeToDriveAuth,
} from "../services/googleDriveAuth";
import {
  GoogleDriveApiService,
  GoogleDriveItem,
} from "../services/googleDriveApi";
import { TMDBService } from "../services/tmdbService";
import { VideoEntity, VideoItem, PipelineStage } from "../types";
import { videoService } from "../services/supabase/videoService";
import { importManager, ImportCandidate } from "../services/importManagerService";

interface GoogleDriveExplorerProps {
  onImportVideos?: (newVideos: Partial<VideoItem>[], autoStartQueue?: boolean) => void;
  onImportComplete?: (importedVideos: VideoEntity[]) => void;
  nextSerialId?: number;
  nextSerialNum?: number;
  autoMode?: boolean;
}

export const GoogleDriveExplorer: React.FC<GoogleDriveExplorerProps> = ({
  onImportVideos,
  onImportComplete,
  nextSerialId = 1,
  nextSerialNum = 1,
  autoMode = true,
}) => {
  const [user, setUser] = useState(getCurrentDriveUser());
  const [isConnected, setIsConnected] = useState(isDriveAuthenticated());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Folder navigation
  const [currentFolder, setCurrentFolder] = useState<{ id: string; name: string }>({
    id: "root",
    name: "Meu Google Drive",
  });
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([
    { id: "root", name: "Meu Drive" },
  ]);

  // Items in current view
  const [items, setItems] = useState<GoogleDriveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Deep Scan state
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [deepScanProgress, setDeepScanProgress] = useState<{
    foldersScanned: number;
    videosFound: number;
    currentFolder: string;
  } | null>(null);

  // Import options
  const [autoEnrichTMDB, setAutoEnrichTMDB] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsub = subscribeToDriveAuth((u, token) => {
      setUser(u);
      setIsConnected(!!token && !!u);
      if (token && u) {
        loadFolder("root", "Meu Drive");
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsConnected(true);
        setUser(res.user);
        loadFolder("root", "Meu Drive");
      }
    } catch (err: any) {
      setError(err.message || "Falha ao conectar com o Google Drive");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogleDrive();
      setIsConnected(false);
      setUser(null);
      setItems([]);
      setSelectedItemIds(new Set());
    } catch (err: any) {
      console.error("Erro ao desconectar:", err);
    }
  };

  const loadFolder = async (folderId: string, folderName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await GoogleDriveApiService.listItems({
        folderId: folderId === "root" ? undefined : folderId,
        query: searchQuery || undefined,
      });
      setItems(res.items);
      setCurrentFolder({ id: folderId, name: folderName });
    } catch (err: any) {
      setError(err.message || "Erro ao carregar arquivos da pasta.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    const newBreadcrumbs = [...breadcrumbs, { id: folderId, name: folderName }];
    setBreadcrumbs(newBreadcrumbs);
    loadFolder(folderId, folderName);
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    loadFolder(target.id, target.name);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFolder(currentFolder.id, currentFolder.name);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedItemIds(next);
  };

  const selectAllVideos = () => {
    const videoItems = items.filter((i) => i.isVideo);
    if (selectedItemIds.size === videoItems.length && videoItems.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(videoItems.map((i) => i.id)));
    }
  };

  // Run deep scan in current folder
  const handleDeepScan = async () => {
    setIsDeepScanning(true);
    setError(null);
    try {
      const result = await GoogleDriveApiService.deepScanFolder(
        currentFolder.id === "root" ? "root" : currentFolder.id,
        currentFolder.name,
        (progress) => setDeepScanProgress(progress)
      );
      setItems(result.videos);
      setSelectedItemIds(new Set(result.videos.map((v) => v.id)));
    } catch (err: any) {
      setError(err.message || "Erro durante a varredura minuciosa.");
    } finally {
      setIsDeepScanning(false);
      setDeepScanProgress(null);
    }
  };

  // Batch import selected videos into Categoria Filmes queue (Non-blocking background job)
  const handleImportSelected = async () => {
    const selectedVideos = items.filter((i) => selectedItemIds.has(i.id) && i.isVideo);
    if (selectedVideos.length === 0) return;

    const candidates: ImportCandidate[] = selectedVideos.map((item) => ({
      name: item.name,
      driveFileId: item.id,
      thumbnailUrl: item.thumbnailLink,
      sourceUrl: item.webViewLink || `https://drive.google.com/file/d/${item.id}/view`,
      size: item.size ? `${(parseInt(item.size, 10) / (1024 * 1024)).toFixed(1)} MB` : "45.0 MB",
      duration: item.videoMediaMetadata?.durationMillis
        ? `${Math.round(parseInt(item.videoMediaMetadata.durationMillis, 10) / 1000)}s`
        : "00:45",
      subfolderPath: item.subfolderPath || "Cortes Selecionados",
    }));

    const count = candidates.length;
    setSelectedItemIds(new Set());
    setImportStatus(`Importação de ${count} vídeos iniciada em segundo plano! Acompanhe o progresso na barra flutuante.`);

    // Trigger non-blocking job
    importManager.startImportJob({
      candidates,
      startSerialNum: nextSerialNum || nextSerialId || 1,
      autoEnrichTMDB,
      autoStartQueue: autoMode,
    });

    setTimeout(() => setImportStatus(null), 4000);
  };

  const videoCount = items.filter((i) => i.isVideo).length;
  const folderCount = items.filter((i) => i.isFolder).length;

  return (
    <div className="bg-[#121217] border border-[#262633] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262633]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Google Drive Integrado
              {isConnected && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3" /> Conectado
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              Navegue, selecione e faça varredura minuciosa de seus packs e pastas de vídeos no Google Drive.
            </p>
          </div>
        </div>

        {/* Auth Button or User Badge */}
        <div>
          {!isConnected ? (
            <button
              id="google-drive-signin-btn"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isLoggingIn ? "Conectando..." : "Conectar com Google"}
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-[#1a1a24] border border-[#2a2a38] px-3.5 py-1.5 rounded-xl">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Google User"}
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "G"}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user?.displayName || "Conta Google"}
                </p>
                <p className="text-[10px] text-zinc-400 leading-tight">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Desconectar do Google Drive"
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Prompt when not logged in */}
      {!isConnected ? (
        <div className="bg-[#171722] border border-[#2b2b3d] rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <HardDrive className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">Acesse seus Packs no Google Drive</h3>
            <p className="text-sm text-zinc-400">
              Conecte sua conta do Google com segurança para carregar e escanear pastas de cortes de filmes,
              extrair metadados e enviar vídeos diretamente para a esteira de produção.
            </p>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoggingIn ? "Conectando..." : "Conectar Conta Google"}
          </button>
        </div>
      ) : (
        /* Connected Drive Explorer View */
        <div className="space-y-4">
          {/* Breadcrumbs & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171722] p-3 rounded-xl border border-[#262638]">
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-300 overflow-x-auto py-1">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                  <button
                    onClick={() => navigateToBreadcrumb(idx)}
                    className={`hover:text-amber-400 transition-colors font-medium cursor-pointer ${
                      idx === breadcrumbs.length - 1 ? "text-amber-400 font-bold" : "text-zinc-400"
                    }`}
                  >
                    {b.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadFolder(currentFolder.id, currentFolder.name)}
                disabled={loading}
                title="Recarregar pasta"
                className="p-2 text-zinc-400 hover:text-white bg-[#20202e] hover:bg-[#2b2b3d] rounded-lg border border-[#333347] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
              </button>

              <button
                onClick={handleDeepScan}
                disabled={isDeepScanning}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isDeepScanning ? "Varrendo Recursivamente..." : "Varredura Minuciosa (Deep Scan)"}
              </button>
            </div>
          </div>

          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar arquivos no Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181824] border border-[#2e2e42] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </form>

            <div className="flex items-center gap-3 text-xs text-zinc-400 w-full sm:w-auto justify-between sm:justify-end">
              <span>
                <strong className="text-white">{folderCount}</strong> pastas •{" "}
                <strong className="text-white">{videoCount}</strong> vídeos
              </span>

              {videoCount > 0 && (
                <button
                  onClick={selectAllVideos}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {selectedItemIds.size === videoCount ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" /> Desmarcar Todos
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" /> Selecionar Todos ({selectedItemIds.size}/{videoCount})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Deep Scan Progress Bar */}
          {isDeepScanning && deepScanProgress && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-semibold flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Varrendo subpastas minuciosamente...
                </span>
                <span className="text-zinc-400">
                  {deepScanProgress.foldersScanned} pastas | {deepScanProgress.videosFound} vídeos encontrados
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Pasta atual: <span className="text-zinc-200">{deepScanProgress.currentFolder}</span>
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Items Grid & List */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Carregando itens do Google Drive...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center bg-[#181824] rounded-xl border border-[#2a2a3d] space-y-2">
              <Folder className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">Nenhum arquivo ou vídeo encontrado nesta pasta.</p>
              <p className="text-xs text-zinc-500">Navegue pelas pastas acima ou faça uma busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = selectedItemIds.has(item.id);

                if (item.isFolder) {
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigateToFolder(item.id, item.name)}
                      className="group p-3 bg-[#171722] hover:bg-[#20202e] border border-[#29293d] hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-zinc-500">Pasta do Drive</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`relative group p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5"
                        : "bg-[#171722] hover:bg-[#1e1e2c] border-[#29293d] hover:border-[#3d3d57]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className="mt-0.5 text-zinc-500 hover:text-amber-400 transition-colors shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>

                      {/* Video Thumbnail or Icon */}
                      <div className="w-12 h-12 rounded-lg bg-[#0d0d12] border border-[#2a2a3c] overflow-hidden shrink-0 flex items-center justify-center relative">
                        {item.thumbnailLink ? (
                          <img
                            src={item.thumbnailLink}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Film className="w-6 h-6 text-amber-500/60" />
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-semibold text-white truncate leading-snug">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                          <span className="text-amber-400 font-medium">{item.size}</span>
                          {item.subfolderPath && (
                            <>
                              <span>•</span>
                              <span className="truncate text-zinc-500">{item.subfolderPath.split("/").pop()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Link */}
                    {item.webViewLink && (
                      <div className="mt-2 pt-2 border-t border-[#252538] flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Vídeo para Corte</span>
                        <a
                          href={item.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                        >
                          Ver no Drive <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Import Footer Bar */}
          {selectedItemIds.size > 0 && (
            <div className="bg-[#1a1a26] border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {selectedItemIds.size}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {selectedItemIds.size} {selectedItemIds.size === 1 ? "vídeo selecionado" : "vídeos selecionados"}
                  </h4>
                  <label className="flex items-center gap-2 mt-1 text-[11px] text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoEnrichTMDB}
                      onChange={(e) => setAutoEnrichTMDB(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <Sparkles className="w-3 h-3 text-amber-400" /> Auto-enriquecer com dados e pôster oficial do TMDB
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleImportSelected}
                  disabled={isImporting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isImporting ? "Importando e Enriquecendo..." : `Importar ${selectedItemIds.size} Vídeos para Produção`}
                </button>
              </div>
            </div>
          )}

          {/* Import Status Message */}
          {importStatus && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
