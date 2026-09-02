import { DriveVideoFile } from "../../lib/drivePackMaster";
import { logService } from "./logService";

export interface ScanResult {
  success: boolean;
  folderName: string;
  folderUrl: string;
  totalExtracted: number;
  totalFiles: number;
  totalSizeGB: string;
  subfolderCount: number;
  subfolders: string[];
  files: DriveVideoFile[];
  sweepMessage: string;
}

export class DriveService {
  public static async scanGoogleDriveFolder(params: {
    folderUrl?: string;
    folderName?: string;
    deepSweep?: boolean;
    subfolderFilter?: string;
  }): Promise<ScanResult> {
    const startTime = performance.now();
    try {
      const res = await fetch("/api/drive/scan-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderUrl: params.folderUrl,
          folderName: params.folderName,
          deepSweep: params.deepSweep ?? true,
          subfolderFilter: params.subfolderFilter,
        }),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);

      await logService.log({
        level: "success",
        category: "ingestion",
        message: `Varredura 100% minuciosa do Google Drive concluída: ${data.totalExtracted} vídeos extraídos de ${data.subfolderCount} subpastas (${duration}ms)`,
        duration_ms: duration,
        metadata: {
          totalFiles: data.totalExtracted,
          totalSizeGB: data.totalSizeGB,
        },
      });

      return data;
    } catch (err: any) {
      await logService.log({
        level: "error",
        category: "ingestion",
        message: `Erro na varredura do Drive: ${err.message}`,
      });
      throw err;
    }
  }
}
