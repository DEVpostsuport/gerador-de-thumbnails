import { SceneAnalysis, ContentPackage, SpoilerLevel, HookItem, TitleItem, CaptionItem, PinnedCommentItem } from "../types";
import { logService } from "./supabase/logService";
import { costService } from "./supabase/costService";

export class AIService {
  private static instance: AIService;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 1. ANÁLISE PROFUNDA DE CENA (FILME/SÉRIE, CLÍMAX, RETENÇÃO, POR QUE PARAR O FEED)
   */
  public async analyzeVideo(params: {
    filename: string;
    workName?: string;
    sceneDescription?: string;
    spoilerLevel?: SpoilerLevel;
    customContext?: string;
    videoId?: string;
  }): Promise<SceneAnalysis> {
    const startTime = performance.now();
    try {
      const res = await fetch("/api/gemini/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);

      costService.recordUsage({
        model: "gemini-3.7-flash",
        stage: "ANALYZING",
        tokensInput: 320,
        tokensOutput: 450,
      });

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha na análise estratégica");
      }

      await logService.log({
        level: "success",
        category: "gemini_ai",
        message: `Análise estratégica concluída para "${params.filename}" (${duration}ms)`,
        duration_ms: duration,
        video_id: params.videoId,
        stage: "ANALYZING",
        tokens_used: 770,
      });

      return data.analysis as SceneAnalysis;
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      await logService.log({
        level: "error",
        category: "gemini_ai",
        message: `Erro na análise de vídeo: ${err.message}`,
        duration_ms: duration,
        video_id: params.videoId,
        stage: "ANALYZING",
      });
      throw err;
    }
  }

  /**
   * 2. GERAÇÃO DO PACOTE COMPLETO DE VIRALIDADE (10 HOOKS, 10 TÍTULOS, 5 LEGENDAS, CTAS, COMENTÁRIOS)
   */
  public async generateContentPackage(params: {
    workName: string;
    sceneContext?: string;
    genre?: string;
    emotion?: string;
    spoilerLevel?: SpoilerLevel;
    serialId?: string;
    videoId?: string;
  }): Promise<ContentPackage> {
    const startTime = performance.now();
    try {
      const res = await fetch("/api/gemini/generate-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);

      costService.recordUsage({
        model: "gemini-3.7-flash",
        stage: "GENERATING_HOOKS",
        tokensInput: 450,
        tokensOutput: 850,
      });

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha na geração do pacote de copy");
      }

      const raw = data.package;
      const hooks: HookItem[] = (raw.hooks || []).map((h: any, idx: number) => ({
        id: `h_${idx}_${Date.now()}`,
        category: h.category,
        text: h.text,
        score: h.score || 90,
      }));

      const titles: TitleItem[] = (raw.titles || []).map((t: any, idx: number) => ({
        id: `t_${idx}_${Date.now()}`,
        category: t.category,
        text: t.text,
      }));

      const captions: CaptionItem[] = (raw.captions || []).map((c: any, idx: number) => ({
        id: c.id || `cap_${idx}`,
        style: c.style,
        text: c.text,
        cta: c.cta,
      }));

      const pinnedComments: PinnedCommentItem[] = (raw.pinnedComments || []).map((p: any, idx: number) => ({
        id: `pc_${idx}`,
        category: p.category,
        text: p.text,
        isMainRecommendation: Boolean(p.isMainRecommendation),
      }));

      const pkg: ContentPackage = {
        selectedHook: hooks[0]?.text || "O detalhe imperceptível nesta cena.",
        hooks,
        selectedTitle: titles[0]?.text || `A cena mais intensa de ${params.workName}`,
        titles,
        selectedCaption: captions[0] || {
          id: "cap_0",
          style: "Curiosidade",
          text: "Assista com atenção cada segundo.",
          cta: "Qual sua opinião?",
        },
        captions,
        selectedCta: raw.ctas?.[0] || "Você teria feito o mesmo?",
        ctas: raw.ctas || [],
        selectedPinnedComment: pinnedComments.find((p) => p.isMainRecommendation) || pinnedComments[0] || {
          id: "pc_main",
          category: "debate",
          text: "🔥 O que você faria na mesma situação? Deixe nos comentários!",
          isMainRecommendation: true,
        },
        pinnedComments,
        hashtags: raw.hashtags || ["#categoriafilmes", "#cenasdefilmes", "#melhoresmomentos"],
        viralScore: raw.viralScore || 92,
        spoilerLevel: params.spoilerLevel || "baixo",
        thumbnailRecommendation: raw.thumbnailRecommendation,
      };

      await logService.log({
        level: "success",
        category: "gemini_ai",
        message: `Pacote viral gerado com 10 hooks, 10 títulos e 5 legendas (${duration}ms)`,
        duration_ms: duration,
        video_id: params.videoId,
        stage: "GENERATING_CAPTION",
        tokens_used: 1300,
      });

      return pkg;
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      await logService.log({
        level: "error",
        category: "gemini_ai",
        message: `Erro na geração de pacote: ${err.message}`,
        duration_ms: duration,
        video_id: params.videoId,
        stage: "GENERATING_HOOKS",
      });
      throw err;
    }
  }

  /**
   * 3. REFINAMENTO DE TEXTO / COPY DINÂMICA
   */
  public async refineCopy(
    originalText: string,
    actionType: "curto" | "curioso" | "emocional" | "provocativo" | "misterioso" | "direto",
    contentType?: string
  ): Promise<string> {
    try {
      const res = await fetch("/api/gemini/refine-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText, actionType, contentType }),
      });
      const data = await res.json();
      return data.refinedText || originalText;
    } catch (err) {
      console.error("Refine error:", err);
      return originalText;
    }
  }

  /**
   * 4. SCANNER ANTI-REPETIÇÃO E FADIGA DE AUDIÊNCIA
   */
  public async checkAntiRepetition(newHook: string, newTitle: string, recentItems: any[] = []) {
    try {
      const res = await fetch("/api/gemini/anti-repetition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newHook, newTitle, recentItems }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { hasRepetition: false, warning: null, suggestions: [] };
    }
  }
}

export const aiService = AIService.getInstance();
