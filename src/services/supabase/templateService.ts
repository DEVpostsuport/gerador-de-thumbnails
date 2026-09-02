import { ThumbnailTemplate, ThumbnailConfig } from "../../types";
import { getSupabaseClient } from "./supabaseClient";

export const DEFAULT_THUMBNAIL_TEMPLATES: ThumbnailTemplate[] = [
  {
    id: "tpl_gold_cinematic",
    name: "Ouro & Preto Cinemático",
    category: "Geral / Suspense",
    description: "Tipografia pesada branca com traço escuro, badge dourado chanfrado e número serial de alta distinção.",
    badgeStyle: "gold_pill",
    fontFamily: "Impact, sans-serif",
    hookFontSize: 56,
    textColor: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 6,
    accentColor: "#F59E0B",
    gradientOverlay: "bottom",
    vignetteStrength: 0.5,
    brandText: "CATEGORIA FILMES",
    hookOffsetY: 26,
    titleOffsetY: 82,
    previewBg: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
  },
  {
    id: "tpl_crimson_tension",
    name: "Crimson Tensão Máxima",
    category: "Terror / Crime / Reviravolta",
    description: "Badge vermelho carmesim em bloco sólido com vinheta densa e alto contraste para clímax de suspense.",
    badgeStyle: "crimson_box",
    fontFamily: "system-ui, -apple-system, sans-serif",
    hookFontSize: 52,
    textColor: "#FEF2F2",
    strokeColor: "#450A0A",
    strokeWidth: 7,
    accentColor: "#EF4444",
    gradientOverlay: "top_bottom",
    vignetteStrength: 0.65,
    brandText: "CATEGORIA FILMES",
    hookOffsetY: 28,
    titleOffsetY: 84,
    previewBg: "linear-gradient(135deg, #270707 0%, #09090b 100%)",
  },
  {
    id: "tpl_amber_drama",
    name: "Âmbar Reviravolta",
    category: "Drama / Conflito Psicológico",
    description: "Gradiente âmbar suave com vinheta radial, foco total na expressão do personagem e texto de impacto.",
    badgeStyle: "amber_gradient",
    fontFamily: "Impact, sans-serif",
    hookFontSize: 54,
    textColor: "#FFFBEB",
    strokeColor: "#1C1917",
    strokeWidth: 5,
    accentColor: "#D97706",
    gradientOverlay: "bottom",
    vignetteStrength: 0.45,
    brandText: "CATEGORIA FILMES",
    hookOffsetY: 25,
    titleOffsetY: 82,
    previewBg: "linear-gradient(135deg, #291a05 0%, #09090b 100%)",
  },
  {
    id: "tpl_neon_action",
    name: "Neon Blue / Sci-Fi",
    category: "Ação / Ficção / Espionagem",
    description: "Contorno ciano com brilho sutil e badge vazado minimalista para ritmo acelerado.",
    badgeStyle: "neon_bordered",
    fontFamily: "system-ui, sans-serif",
    hookFontSize: 50,
    textColor: "#F0FDFA",
    strokeColor: "#042F2E",
    strokeWidth: 6,
    accentColor: "#06B6D4",
    gradientOverlay: "bottom",
    vignetteStrength: 0.55,
    brandText: "CATEGORIA FILMES",
    hookOffsetY: 27,
    titleOffsetY: 83,
    previewBg: "linear-gradient(135deg, #052029 0%, #09090b 100%)",
  },
  {
    id: "tpl_minimal_tag",
    name: "Minimal Clean Tag",
    category: "Clássicos / Diálogos Épicos",
    description: "Estética limpa sem poluição visual, mantendo legibilidade total na grade do feed do Instagram e TikTok.",
    badgeStyle: "minimal_tag",
    fontFamily: "system-ui, -apple-system, sans-serif",
    hookFontSize: 48,
    textColor: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 4,
    accentColor: "#E4E4E7",
    gradientOverlay: "bottom",
    vignetteStrength: 0.35,
    brandText: "CATEGORIA FILMES",
    hookOffsetY: 30,
    titleOffsetY: 85,
    previewBg: "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
  },
];

const TEMPLATES_KEY = "cf_thumbnail_templates_cache";

class TemplateService {
  private templates: ThumbnailTemplate[] = [...DEFAULT_THUMBNAIL_TEMPLATES];

  constructor() {
    this.loadCached();
  }

  private loadCached() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(TEMPLATES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.templates = parsed;
          }
        }
      } catch (err) {
        console.error("Erro ao carregar templates:", err);
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(this.templates));
      } catch (err) {
        console.warn("Storage quota:", err);
      }
    }
  }

  public getAll(): ThumbnailTemplate[] {
    return [...this.templates];
  }

  public getById(id: string): ThumbnailTemplate | undefined {
    return this.templates.find((t) => t.id === id) || this.templates[0];
  }

  public addTemplate(template: ThumbnailTemplate) {
    this.templates.push(template);
    this.save();
  }

  public updateTemplate(id: string, updates: Partial<ThumbnailTemplate>) {
    const idx = this.templates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.templates[idx] = { ...this.templates[idx], ...updates };
      this.save();
    }
  }
}

export const templateService = new TemplateService();
