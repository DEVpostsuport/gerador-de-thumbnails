import { ThumbnailConfig, ThumbnailTemplate } from "../types";

export interface RenderOptions {
  width?: number;
  height?: number;
  showGuides?: boolean;
  guideType?: "grid" | "safe_area" | "all" | "none";
}

export function drawThumbnailToCanvas(
  canvas: HTMLCanvasElement,
  config: ThumbnailConfig,
  template?: ThumbnailTemplate,
  options: RenderOptions = {}
): Promise<string> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve("");

    const width = options.width || 1080;
    const height = options.height || 1920;
    canvas.width = width;
    canvas.height = height;

    const scale = width / 1080;

    // 1. Draw Background / Movie Still Image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw image to fill canvas (cover mode)
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;

      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        drawW = height * imgAspect;
        offsetX = -(drawW - width) / 2;
      } else {
        drawH = width / imgAspect;
        offsetY = -(drawH - height) / 2;
      }

      // Apply brightness/contrast filters
      ctx.save();
      const b = (config.filterBrightness || 100) / 100;
      const c = (config.filterContrast || 110) / 100;
      const s = (config.filterSaturation || 110) / 100;
      ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // 2. Draw Cinematic Vignettes and Gradients
      drawCinematicOverlays(ctx, width, height, config, template);

      // 3. Draw Brand Watermark / Header
      if (config.showBrand !== false) {
        drawBrandHeader(ctx, width, height, scale, config);
      }

      // 4. Draw Series Number Badge (#001)
      drawSerialBadge(ctx, width, height, scale, config, template);

      // 5. Draw Hook / Short Title Text (The Core Punch)
      drawHookText(ctx, width, height, scale, config, template);

      // 6. Draw Movie/Series Name Tag
      if (config.movieTitle) {
        drawMovieTitle(ctx, width, height, scale, config);
      }

      // 7. Draw Safe Guides if enabled
      if (options.showGuides) {
        drawSafeGuides(ctx, width, height, options.guideType || "all");
      }

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      // Fallback: draw dark cinematic gradient
      ctx.fillStyle = "#0c0a09";
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#1c1917");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      drawCinematicOverlays(ctx, width, height, config, template);
      drawBrandHeader(ctx, width, height, scale, config);
      drawSerialBadge(ctx, width, height, scale, config, template);
      drawHookText(ctx, width, height, scale, config, template);
      if (config.movieTitle) drawMovieTitle(ctx, width, height, scale, config);
      if (options.showGuides) drawSafeGuides(ctx, width, height, options.guideType || "all");

      resolve(canvas.toDataURL("image/png"));
    };

    img.src = config.frameUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop";
  });
}

function drawCinematicOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig,
  template?: ThumbnailTemplate
) {
  const vignette = config.vignetteStrength ?? template?.vignetteStrength ?? 0.7;
  const gradientType = config.gradientOverlay || template?.gradientOverlay || "bottom";

  ctx.save();

  if (gradientType === "bottom" || gradientType === "top_bottom") {
    // Bottom high-contrast gradient for text readability
    const bottomGrad = ctx.createLinearGradient(0, height * 0.4, 0, height);
    bottomGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomGrad.addColorStop(0.4, "rgba(0, 0, 0, 0.65)");
    bottomGrad.addColorStop(0.75, "rgba(0, 0, 0, 0.88)");
    bottomGrad.addColorStop(1, "rgba(0, 0, 0, 0.98)");
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height * 0.4, width, height * 0.6);
  }

  if (gradientType === "top_bottom") {
    // Top subtle gradient for badge / brand
    const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.3);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.85)");
    topGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.4)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, height * 0.3);
  }

  if (gradientType === "radial") {
    const radial = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.2,
      width / 2,
      height / 2,
      height * 0.7
    );
    radial.addColorStop(0, "rgba(0, 0, 0, 0)");
    radial.addColorStop(0.6, `rgba(0, 0, 0, ${vignette * 0.5})`);
    radial.addColorStop(1, `rgba(0, 0, 0, ${vignette})`);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

function drawBrandHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  scale: number,
  config: ThumbnailConfig
) {
  ctx.save();
  const text = (config.brandText || "CATEGORIA FILMES").toUpperCase();
  ctx.font = `800 ${22 * scale}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const y = 80 * scale;

  // Background subtle pill
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  const metrics = ctx.measureText(text);
  const pillW = metrics.width + 48 * scale;
  const pillH = 38 * scale;
  const pillX = (width - pillW) / 2;
  const pillY = y - pillH / 2;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 8 * scale);
  ctx.fill();

  // Border with accent
  ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Clapperboard / movie icon dot
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(pillX + 18 * scale, y, 4 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Brand Text
  ctx.fillStyle = "#F3F4F6";
  ctx.letterSpacing = "2px";
  ctx.fillText(text, width / 2 + 6 * scale, y);

  ctx.restore();
}

function drawSerialBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  scale: number,
  config: ThumbnailConfig,
  _template?: ThumbnailTemplate
) {
  ctx.save();
  const serialText = (config.serialNumber || "#001").toUpperCase();
  const style = config.badgeStyle || "gold_pill";

  const badgeH = 54 * scale;
  const badgeY = 140 * scale;

  ctx.font = `900 ${32 * scale}px 'Montserrat', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textMetrics = ctx.measureText(serialText);
  const badgeW = textMetrics.width + 56 * scale;
  const badgeX = (width - badgeW) / 2;

  if (style === "gold_pill") {
    // Golden gradient pill
    const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
    grad.addColorStop(0, "#F59E0B");
    grad.addColorStop(0.5, "#FCD34D");
    grad.addColorStop(1, "#D97706");
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 27 * scale);
    ctx.fill();

    // Dark high-contrast text
    ctx.fillStyle = "#000000";
    ctx.fillText(serialText, width / 2, badgeY + badgeH / 2 + 1 * scale);
  } else if (style === "crimson_box") {
    // Crimson box with sharp red aura
    ctx.fillStyle = "#DC2626";
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 10 * scale);
    ctx.fill();

    ctx.strokeStyle = "#FEF2F2";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(serialText, width / 2, badgeY + badgeH / 2);
  } else if (style === "neon_bordered") {
    // Neon emerald bordered badge
    ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 12 * scale);
    ctx.fill();

    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    ctx.fillStyle = "#6EE7B7";
    ctx.fillText(serialText, width / 2, badgeY + badgeH / 2);
  } else {
    // Minimal tag
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.fillStyle = "#F59E0B";
    ctx.fillText(serialText, width / 2, badgeY + badgeH / 2);
  }

  ctx.restore();
}

function drawHookText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  config: ThumbnailConfig,
  template?: ThumbnailTemplate
) {
  ctx.save();
  const rawText = (config.hookText || "ELE DESCOBRIU A VERDADE").toUpperCase();
  const fontSize = (config.hookFontSize || template?.hookFontSize || 86) * scale;
  const fontFamily = config.fontFamily || template?.fontFamily || "'Bebas Neue', sans-serif";

  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textColor = config.textColor || "#FFFFFF";
  const strokeColor = config.strokeColor || "#000000";
  const strokeW = (config.strokeWidth || 6) * scale;

  // Split into lines to fit maxWidth with high punch
  const maxLineWidth = width * 0.88;
  const lines = wrapTextLines(ctx, rawText, maxLineWidth);

  const lineHeight = fontSize * 1.08;
  const totalTextHeight = lines.length * lineHeight;

  // Placement based on safe area (lower third, high impact)
  const basePercentY = config.hookOffsetY || template?.hookOffsetY || 70;
  const centerY = (height * basePercentY) / 100;
  const startY = centerY - totalTextHeight / 2 + lineHeight / 2;

  // Background banner box for ultra contrast & readability
  const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const padX = 36 * scale;
  const padY = 24 * scale;
  const boxX = (width - maxW) / 2 - padX;
  const boxY = centerY - totalTextHeight / 2 - padY;
  const boxW = maxW + padX * 2;
  const boxH = totalTextHeight + padY * 2;

  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 16 * scale);
  ctx.fill();

  // Subtle accent top border on banner
  ctx.fillStyle = config.accentColor || template?.accentColor || "#F59E0B";
  drawRoundedRect(ctx, boxX + 16 * scale, boxY, boxW - 32 * scale, 5 * scale, 3 * scale);
  ctx.fill();

  lines.forEach((line, i) => {
    const lineY = startY + i * lineHeight;

    // Stroke outline for maximum legibility
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeW * 1.5;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.strokeText(line, width / 2, lineY);

    // Main text
    ctx.fillStyle = textColor;
    ctx.fillText(line, width / 2, lineY);
  });

  ctx.restore();
}

function drawMovieTitle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  config: ThumbnailConfig
) {
  ctx.save();
  const title = (config.movieTitle || "").toUpperCase();
  if (!title) return;

  const y = (height * (config.titleOffsetY || 88)) / 100;

  ctx.font = `800 ${30 * scale}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(title);
  const padW = metrics.width + 48 * scale;
  const padH = 46 * scale;
  const rectX = (width - padW) / 2;
  const rectY = y - padH / 2;

  // Background tag
  ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
  drawRoundedRect(ctx, rectX, rectY, padW, padH, 23 * scale);
  ctx.fill();

  ctx.strokeStyle = config.accentColor || "#F59E0B";
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Movie Title Text
  ctx.fillStyle = config.accentColor || "#FCD34D";
  ctx.fillText(title, width / 2, y);

  ctx.restore();
}

function drawSafeGuides(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  guideType: "grid" | "safe_area" | "all" | "none"
) {
  ctx.save();
  ctx.lineWidth = 2;

  if (guideType === "grid" || guideType === "all") {
    // 1:1 Instagram Profile Grid (Centered 1080x1080 square in 9:16)
    const squareH = width; // 1080
    const squareY = (height - squareH) / 2; // (1920 - 1080) / 2 = 420

    ctx.strokeStyle = "rgba(239, 68, 68, 0.85)"; // Red border
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(10, squareY, width - 20, squareH);

    // Label
    ctx.fillStyle = "#EF4444";
    ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("📷 CORTE DA GRADE DO INSTAGRAM (1:1 - ÁREA SEGURA)", 24, squareY + 34);
    ctx.fillText("📷 LIMITE INFERIOR DA GRADE", 24, squareY + squareH - 20);
  }

  if (guideType === "safe_area" || guideType === "all") {
    // 4:5 Feed Safe Area (1080x1350)
    const feedH = width * (5 / 4); // 1350
    const feedY = (height - feedH) / 2; // 285

    ctx.strokeStyle = "rgba(59, 130, 246, 0.75)"; // Blue dashed
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(20, feedY, width - 40, feedH);

    ctx.fillStyle = "#3B82F6";
    ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("📱 ÁREA SEGURA DO FEED (4:5)", width - 30, feedY + 30);

    // Center crosshair
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  ctx.restore();
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
