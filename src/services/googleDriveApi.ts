import { getAccessToken } from "./googleDriveAuth";
import { logService } from "./supabase/logService";

export interface GoogleDriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  sizeBytes?: number;
  thumbnailLink?: string;
  iconLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
  isFolder: boolean;
  isVideo: boolean;
  subfolderPath?: string;
}

export interface DriveFolderTreeItem {
  id: string;
  name: string;
  path: string;
}

export class GoogleDriveApiService {
  private static BASE_URL = "https://www.googleapis.com/drive/v3/files";

  private static formatBytes(bytes?: number | string): string {
    if (!bytes) return "0 MB";
    const b = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(b)) return "0 MB";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + " MB";
    return (b / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  // Fetch items inside a folder or search query
  public static async listItems(params: {
    folderId?: string;
    query?: string;
    onlyVideos?: boolean;
    pageSize?: number;
    pageToken?: string;
  }): Promise<{ items: GoogleDriveItem[]; nextPageToken?: string }> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Usuário não autenticado no Google Drive. Faça login com o Google.");
    }

    const folderId = params.folderId || "root";
    const queries: string[] = ["trashed = false"];

    if (params.folderId) {
      queries.push(`'${params.folderId}' in parents`);
    }

    if (params.query) {
      queries.push(`name contains '${params.query.replace(/'/g, "\\'")}'`);
    }

    if (params.onlyVideos) {
      queries.push(
        "(mimeType contains 'video/' or mimeType = 'application/vnd.google-apps.folder')"
      );
    }

    const q = queries.join(" and ");
    const fields =
      "nextPageToken, files(id, name, mimeType, size, thumbnailLink, iconLink, webViewLink, webContentLink, createdTime, modifiedTime, videoMediaMetadata)";
    const pageSize = params.pageSize || 50;

    const url = new URL(this.BASE_URL);
    url.searchParams.append("q", q);
    url.searchParams.append("fields", fields);
    url.searchParams.append("pageSize", String(pageSize));
    url.searchParams.append("orderBy", "folder, name");
    if (params.pageToken) {
      url.searchParams.append("pageToken", params.pageToken);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.error?.message || `Erro ao consultar Google Drive: HTTP ${res.status}`
      );
    }

    const data = await res.json();
    const items: GoogleDriveItem[] = (data.files || []).map((f: any) => {
      const isFolder = f.mimeType === "application/vnd.google-apps.folder";
      const isVideo =
        f.mimeType?.startsWith("video/") ||
        /\.(mp4|mov|mkv|avi|webm|m4v|wmv)$/i.test(f.name);

      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: this.formatBytes(f.size),
        sizeBytes: f.size ? parseInt(f.size, 10) : undefined,
        thumbnailLink: f.thumbnailLink,
        iconLink: f.iconLink,
        webViewLink: f.webViewLink,
        webContentLink: f.webContentLink,
        createdTime: f.createdTime,
        modifiedTime: f.modifiedTime,
        videoMediaMetadata: f.videoMediaMetadata,
        isFolder,
        isVideo,
      };
    });

    return {
      items,
      nextPageToken: data.nextPageToken,
    };
  }

  // Recursive deep sweep scanner through folder and all subfolders
  public static async deepScanFolder(
    rootFolderId: string,
    rootFolderName: string = "Google Drive",
    onProgress?: (progress: {
      foldersScanned: number;
      videosFound: number;
      currentFolder: string;
    }) => void
  ): Promise<{
    videos: GoogleDriveItem[];
    subfolders: string[];
    totalSizeGB: string;
    totalCount: number;
  }> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Token do Google Drive não encontrado.");
    }

    const startTime = performance.now();
    const allVideos: GoogleDriveItem[] = [];
    const discoveredSubfolders = new Set<string>();
    const folderQueue: Array<{ id: string; path: string }> = [
      { id: rootFolderId, path: rootFolderName },
    ];

    let foldersCount = 0;

    while (folderQueue.length > 0) {
      const current = folderQueue.shift()!;
      foldersCount++;
      discoveredSubfolders.add(current.path);

      if (onProgress) {
        onProgress({
          foldersScanned: foldersCount,
          videosFound: allVideos.length,
          currentFolder: current.path,
        });
      }

      let pageToken: string | undefined = undefined;
      do {
        const result = await this.listItems({
          folderId: current.id,
          pageSize: 100,
          pageToken,
        });

        for (const item of result.items) {
          if (item.isFolder) {
            folderQueue.push({
              id: item.id,
              path: `${current.path}/${item.name}`,
            });
          } else if (item.isVideo) {
            item.subfolderPath = current.path;
            allVideos.push(item);
          }
        }

        pageToken = result.nextPageToken;
      } while (pageToken);
    }

    const totalBytes = allVideos.reduce((acc, v) => acc + (v.sizeBytes || 0), 0);
    const totalSizeGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    const duration = Math.round(performance.now() - startTime);

    await logService.log({
      level: "success",
      category: "ingestion",
      message: `Deep Scan no Google Drive concluído: ${allVideos.length} vídeos encontrados em ${foldersCount} pastas (${duration}ms)`,
      metadata: {
        totalVideos: allVideos.length,
        foldersScanned: foldersCount,
        totalSizeGB,
      },
      duration_ms: duration,
    });

    return {
      videos: allVideos,
      subfolders: Array.from(discoveredSubfolders),
      totalSizeGB,
      totalCount: allVideos.length,
    };
  }

  // Get item metadata (such as folder name)
  public static async getItemMetadata(itemId: string): Promise<GoogleDriveItem> {
    const token = await getAccessToken();
    if (!token) throw new Error("Não autenticado");

    const res = await fetch(
      `${this.BASE_URL}/${itemId}?fields=id,name,mimeType,size,thumbnailLink,webViewLink,videoMediaMetadata`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Erro ao buscar item do Drive");
    const f = await res.json();
    return {
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: this.formatBytes(f.size),
      sizeBytes: f.size ? parseInt(f.size, 10) : undefined,
      thumbnailLink: f.thumbnailLink,
      webViewLink: f.webViewLink,
      videoMediaMetadata: f.videoMediaMetadata,
      isFolder: f.mimeType === "application/vnd.google-apps.folder",
      isVideo:
        f.mimeType?.startsWith("video/") ||
        /\.(mp4|mov|mkv|avi|webm|m4v|wmv)$/i.test(f.name),
    };
  }
}
