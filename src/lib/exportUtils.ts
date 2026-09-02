import JSZip from "jszip";
import { VideoItem } from "../types";

export function sanitizeFilename(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase();
}

export function formatVideoFolderName(video: VideoItem): string {
  const num = String(video.serialNum || 1).padStart(3, "0");
  const movie = sanitizeFilename(video.workName || "OBRA");
  const hook = sanitizeFilename(video.package?.selectedHook || "CENA").slice(0, 30);
  return `${num}_${movie}_${hook}`;
}

export async function downloadSingleVideoPackage(video: VideoItem) {
  const zip = new JSZip();
  const folderName = formatVideoFolderName(video);
  const folder = zip.folder(folderName) || zip;

  // 1. video_info.txt
  const infoText = `CATEGORIA FILMES — VIRAL CONTENT ENGINE
==============================================
ID: ${video.serialId}
Obra / Filme / Série: ${video.workName} (${video.year || "N/A"})
Gênero: ${video.genre}
Subnicho: ${video.subnicho}
Arquivo Original: ${video.filename} (${video.fileSize})
Duração: ${video.duration}
Viral Score: ${video.package?.viralScore || video.analysis?.viralScore || "N/A"}/100

ÂNGULO VIRAL:
${video.analysis?.viralAngle || "N/A"}

POR QUE PARA A ROLAGEM:
${video.analysis?.whyStopScroll || "N/A"}

POR QUE RETÉM:
${video.analysis?.whyRetain || "N/A"}

POR QUE COMENTA:
${video.analysis?.whyComment || "N/A"}

POR QUE COMPARTILHA:
${video.analysis?.whyShare || "N/A"}
`;
  folder.file("video_info.txt", infoText);

  // 2. titulo.txt
  const titleText = `${video.package?.selectedTitle || video.workName}\n\nTÍTULOS ALTERNATIVOS:\n` +
    (video.package?.titles.map((t, idx) => `${idx + 1}. [${t.category}] ${t.text}`).join("\n") || "");
  folder.file("titulo.txt", titleText);

  // 3. legenda.txt
  const captionText = `${video.package?.selectedCaption.text || ""}\n\nCTA:\n${video.package?.selectedCta || ""}\n\nHASHTAGS:\n${video.package?.hashtags.join(" ") || ""}`;
  folder.file("legenda.txt", captionText);

  // 4. comentario.txt
  const commentText = `COMENTÁRIO ÂNCORA PRINCIPAL (FIXAR NO TOPO):\n${video.package?.selectedPinnedComment.text || ""}\n\nOUTRAS OPÇÕES DE ENGAJAMENTO:\n` +
    (video.package?.pinnedComments.map((c, idx) => `${idx + 1}. [${c.category}] ${c.text}`).join("\n") || "");
  folder.file("comentario.txt", commentText);

  // 5. thumbnail.png (if available as Data URL or frame)
  if (video.thumbnailDataUrl) {
    const base64Data = video.thumbnailDataUrl.replace(/^data:image\/png;base64,/, "");
    folder.file("thumbnail.png", base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(content, `${folderName}.zip`);
}

export async function downloadBatchVideosPackage(
  videos: VideoItem[],
  mode: "full_package" | "thumbnails_only" = "full_package"
) {
  const zip = new JSZip();
  const root = zip.folder("CATEGORIA_FILMES") || zip;

  for (const video of videos) {
    const folderName = formatVideoFolderName(video);
    const num = String(video.serialNum || 1).padStart(3, "0");

    if (mode === "thumbnails_only") {
      if (video.thumbnailDataUrl) {
        const base64Data = video.thumbnailDataUrl.replace(/^data:image\/png;base64,/, "");
        root.file(`${num}_THUMB_${sanitizeFilename(video.workName)}.png`, base64Data, { base64: true });
      }
    } else {
      const vFolder = root.folder(folderName) || root;

      // 1. video_info
      vFolder.file(
        "video_info.txt",
        `CATEGORIA FILMES — PACOTE VIRAL\nID: ${video.serialId}\nFilme: ${video.workName}\nScore: ${video.package?.viralScore || 90}/100\nÂngulo: ${video.analysis?.viralAngle || ""}`
      );

      // 2. titulo.txt
      vFolder.file("titulo.txt", video.package?.selectedTitle || video.workName);

      // 3. legenda.txt
      vFolder.file(
        "legenda.txt",
        `${video.package?.selectedCaption.text || ""}\n\n${video.package?.selectedCta || ""}\n\n${video.package?.hashtags.join(" ") || ""}`
      );

      // 4. comentario.txt
      vFolder.file("comentario.txt", video.package?.selectedPinnedComment.text || "");

      // 5. thumbnail.png
      if (video.thumbnailDataUrl) {
        const base64Data = video.thumbnailDataUrl.replace(/^data:image\/png;base64,/, "");
        vFolder.file("thumbnail.png", base64Data, { base64: true });
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const filename = mode === "thumbnails_only"
    ? "CATEGORIA_FILMES_THUMBNAILS_LOTE.zip"
    : "CATEGORIA_FILMES_PACOTES_COMPLETOS.zip";

  triggerBlobDownload(content, filename);
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
