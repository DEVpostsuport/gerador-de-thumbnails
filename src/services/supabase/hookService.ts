import { HookItem, TitleItem, CaptionItem, PinnedCommentItem } from "../../types";
import { getSupabaseClient } from "./supabaseClient";
import { aiService } from "../aiService";

// --- HOOK SERVICE ---
export class HookService {
  public static readonly CATEGORIES = [
    "curiosidade",
    "tensão",
    "mistério",
    "choque",
    "pergunta",
    "conflito",
    "reviravolta",
    "emoção",
    "nostalgia",
    "debate",
  ];

  public static async refineHook(text: string, style: "curto" | "curioso" | "emocional" | "provocativo" | "misterioso" | "direto") {
    return aiService.refineCopy(text, style, "hook de retenção");
  }

  public static calculateScores(hookText: string) {
    const len = hookText.length;
    const curiosityScore = Math.min(99, Math.max(75, 95 - Math.abs(len - 45) / 2));
    const retentionScore = Math.min(98, Math.max(70, 92 + (hookText.includes("?") || hookText.includes("quando") ? 5 : 0)));
    const clarityScore = len > 20 && len < 80 ? 94 : 80;
    const originalityScore = !hookText.toLowerCase().includes("veja") && !hookText.toLowerCase().includes("inacreditável") ? 92 : 72;
    const overallScore = Math.round((curiosityScore * 0.35 + retentionScore * 0.35 + clarityScore * 0.15 + originalityScore * 0.15));

    return {
      curiosityScore: Math.round(curiosityScore),
      retentionScore: Math.round(retentionScore),
      clarityScore: Math.round(clarityScore),
      originalityScore: Math.round(originalityScore),
      overallScore,
    };
  }

  public static async saveHooksToSupabase(videoId: string, hooks: HookItem[], selectedHookText?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const records = hooks.map((h) => {
        const scores = this.calculateScores(h.text);
        return {
          video_id: videoId,
          hook_text: h.text,
          hook_type: h.category,
          curiosity_score: scores.curiosityScore,
          retention_score: scores.retentionScore,
          clarity_score: scores.clarityScore,
          originality_score: scores.originalityScore,
          overall_score: h.score || scores.overallScore,
          selected: h.text === selectedHookText,
        };
      });
      await supabase.from("hooks").delete().eq("video_id", videoId);
      await supabase.from("hooks").insert(records);
    } catch (err) {
      console.warn("[Supabase] Hook save warning:", err);
    }
  }
}

// --- TITLE SERVICE ---
export class TitleService {
  public static readonly CATEGORIES = [
    "curiosidade",
    "suspense",
    "mistério",
    "emoção",
    "personagem",
    "reviravolta",
    "detalhe",
    "debate",
    "nostalgia",
    "choque",
  ];

  public static async refineTitle(text: string, style: "curto" | "curioso" | "emocional" | "provocativo" | "misterioso" | "direto") {
    return aiService.refineCopy(text, style, "título de vídeo curto");
  }

  public static async saveTitlesToSupabase(videoId: string, titles: TitleItem[], selectedTitleText?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const records = titles.map((t) => ({
        video_id: videoId,
        title: t.text,
        title_type: t.category,
        curiosity_score: 90,
        clarity_score: 92,
        originality_score: 88,
        selected: t.text === selectedTitleText,
      }));
      await supabase.from("titles").delete().eq("video_id", videoId);
      await supabase.from("titles").insert(records);
    } catch (err) {
      console.warn("[Supabase] Title save warning:", err);
    }
  }
}

// --- CAPTION & CTA SERVICE ---
export class CaptionService {
  public static async refineCaption(text: string, style: "curto" | "curioso" | "emocional" | "provocativo" | "misterioso" | "direto") {
    return aiService.refineCopy(text, style, "legenda de reels");
  }

  public static async saveCaptionsToSupabase(videoId: string, captions: CaptionItem[], selectedCaptionId?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const records = captions.map((c) => ({
        video_id: videoId,
        caption_style: c.style,
        caption: c.text,
        cta: c.cta,
        selected: c.id === selectedCaptionId,
      }));
      await supabase.from("captions").delete().eq("video_id", videoId);
      await supabase.from("captions").insert(records);
    } catch (err) {
      console.warn("[Supabase] Caption save warning:", err);
    }
  }

  public static async saveCommentsToSupabase(videoId: string, comments: PinnedCommentItem[], selectedCommentText?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const records = comments.map((c) => ({
        video_id: videoId,
        comment_text: c.text,
        comment_type: c.category,
        is_main_recommendation: c.isMainRecommendation,
        selected: c.text === selectedCommentText,
      }));
      await supabase.from("comments").delete().eq("video_id", videoId);
      await supabase.from("comments").insert(records);
    } catch (err) {
      console.warn("[Supabase] Comment save warning:", err);
    }
  }
}
