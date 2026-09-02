import { ThumbnailConfig, ThumbnailTemplate } from "../../types";
import { templateService } from "./templateService";

export class ThumbnailService {
  /**
   * Renderiza a Thumbnail em alta definição (1080 x 1920 pixels - 9:16) usando HTML5 Canvas
   */
  public static async renderThumbnail(
    config: ThumbnailConfig,
    templateId?: string
  ): Promise<string> {
    const template: ThumbnailTemplate =
      templateService.getById(templateId || config.templateId || "tpl_gold_cinematic") ||
      templateService.getAll()[0];

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível inicializar o contexto 2D do Canvas");

    // 1. Carregar e desenhar a imagem de fundo / frame
    if (config.frameUrl) {
      try {
        const img = await this.loadImage(config.frameUrl);
        // Cover aspect ratio
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      } catch (err) {
        // Fallback gradient if image fails to load
        this.renderFallbackBackground(ctx, canvas.width, canvas.height);
      }
    } else {
      this.renderFallbackBackground(ctx, canvas.width, canvas.height);
    }

    // 2. Filtros e Ajustes de Imagem (Brilho / Contraste / Saturação)
    // 3. Gradientes de Contraste e Vinheta Cinemática
    this.renderOverlays(ctx, canvas.width, canvas.height, config, template);

    // 4. Marca d'Água / Identidade Visual Superior ("CATEGORIA FILMES")
    this.renderBranding(ctx, canvas.width, config, template);

    // 5. Número Serial (#001) e Badge do Subnicho / Obra
    this.renderSerialAndBadge(ctx, canvas.width, config, template);

    // 6. Hook Principal (Gancho em Destaque)
    this.renderHookText(ctx, canvas.width, canvas.height, config, template);

    // 7. Nome do Filme / Série Inferior
    this.renderMovieTitle(ctx, canvas.width, canvas.height, config, template);

    return canvas.toDataURL("image/jpeg", 0.95);
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Falha ao carregar imagem: " + url));
      img.src = url;
    });
  }

  private static renderFallbackBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#18181b");
    grad.addColorStop(0.5, "#09090b");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private static renderOverlays(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: ThumbnailConfig,
    template: ThumbnailTemplate
  ) {
    const vignette = config.vignetteStrength ?? template.vignetteStrength ?? 0.5;

    // Top subtle gradient for brand visibility
    const topGrad = ctx.createLinearGradient(0, 0, 0, 450);
    topGrad.addColorStop(0, `rgba(0, 0, 0, ${0.75 * vignette})`);
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, 450);

    // Bottom dark gradient for Title & Subtitle visibility
    const bottomGrad = ctx.createLinearGradient(0, height - 700, 0, height);
    bottomGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomGrad.addColorStop(0.5, `rgba(0, 0, 0, ${0.7 * vignette})`);
    bottomGrad.addColorStop(1, `rgba(0, 0, 0, ${0.95 * vignette})`);
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height - 700, width, 700);

    // Vignette edges
    const radial = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.3,
      width / 2,
      height / 2,
      width * 0.85
    );
    radial.addColorStop(0, "rgba(0,0,0,0)");
    radial.addColorStop(1, `rgba(0,0,0,${0.6 * vignette})`);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  }

  private static renderBranding(
    ctx: CanvasRenderingContext2D,
    width: number,
    config: ThumbnailConfig,
    template: ThumbnailTemplate
  ) {
    const brand = config.brandText || template.brandText || "CATEGORIA FILMES";
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 32px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#E4E4E7";
    ctx.letterSpacing = "6px";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 12;
    ctx.fillText(brand.toUpperCase(), width / 2, 140);
    ctx.restore();
  }

  private static renderSerialAndBadge(
    ctx: CanvasRenderingContext2D,
    width: number,
    config: ThumbnailConfig,
    template: ThumbnailTemplate
  ) {
    const serial = config.serialNumber || "#001";
    const badgeStyle = config.badgeStyle || template.badgeStyle || "gold_pill";

    ctx.save();
    const badgeY = 220;
    const badgeH = 54;
    const text = `CORTES SELECIONADOS • ${serial}`;

    ctx.font = "800 24px system-ui, -apple-system, sans-serif";
    const textWidth = ctx.measureText(text).width;
    const badgeW = textWidth + 48;
    const badgeX = (width - badgeW) / 2;

    if (badgeStyle === "gold_pill") {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 27);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#FDE68A";
      ctx.stroke();

      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText(text, width / 2, badgeY + 36);
    } else if (badgeStyle === "crimson_box") {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
      ctx.fillStyle = "#DC2626";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FCA5A5";
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(text, width / 2, badgeY + 36);
    } else {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 27);
      ctx.fillStyle = "rgba(24, 24, 27, 0.85)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = template.accentColor || "#F59E0B";
      ctx.stroke();

      ctx.fillStyle = template.accentColor || "#F59E0B";
      ctx.textAlign = "center";
      ctx.fillText(text, width / 2, badgeY + 36);
    }
    ctx.restore();
  }

  private static renderHookText(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: ThumbnailConfig,
    template: ThumbnailTemplate
  ) {
    const text = (config.hookText || "CENA MARCADA NA HISTÓRIA").toUpperCase();
    const offsetY = config.hookOffsetY ?? template.hookOffsetY ?? 28;
    const y = (height * offsetY) / 100;
    const fontSize = config.hookFontSize ?? template.hookFontSize ?? 56;
    const strokeWidth = config.strokeWidth ?? template.strokeWidth ?? 6;
    const strokeColor = config.strokeColor || template.strokeColor || "#000000";
    const textColor = config.textColor || template.textColor || "#FFFFFF";

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${fontSize}px Impact, sans-serif`;

    const lines = this.wrapText(ctx, text, width - 180);
    const lineHeight = fontSize * 1.15;

    lines.forEach((line, idx) => {
      const lineY = y + idx * lineHeight;
      // Deep shadow
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Outer Stroke
      ctx.lineWidth = strokeWidth * 2;
      ctx.strokeStyle = strokeColor;
      ctx.strokeText(line, width / 2, lineY);

      // Fill
      ctx.fillStyle = textColor;
      ctx.fillText(line, width / 2, lineY);
    });

    ctx.restore();
  }

  private static renderMovieTitle(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: ThumbnailConfig,
    template: ThumbnailTemplate
  ) {
    const movie = config.movieTitle || "MELHORES MOMENTOS";
    const offsetY = config.titleOffsetY ?? template.titleOffsetY ?? 84;
    const y = (height * offsetY) / 100;

    ctx.save();
    ctx.textAlign = "center";

    // Subtitle label
    ctx.font = "800 24px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#A1A1AA";
    ctx.letterSpacing = "4px";
    ctx.fillText("OBRA EM DESTAQUE", width / 2, y - 40);

    // Movie Title in bold
    ctx.font = "900 48px system-ui, -apple-system, sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 14;

    ctx.lineWidth = 6;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(movie.toUpperCase(), width / 2, y + 10);

    ctx.fillStyle = template.accentColor || "#F59E0B";
    ctx.fillText(movie.toUpperCase(), width / 2, y + 10);

    ctx.restore();
  }

  private static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}
