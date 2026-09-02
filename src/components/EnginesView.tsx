import React, { useState } from "react";
import {
  VideoItem,
  HookItem,
  TitleItem,
  CaptionItem,
  PinnedCommentItem,
} from "../types";
import { refineCopyText, checkAntiRepetition } from "../lib/geminiClient";
import {
  Flame,
  Type,
  FileText,
  MessageSquareQuote,
  Pin,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

interface EnginesViewProps {
  engineType: "hook_engine" | "title_engine" | "caption_engine" | "cta_engine" | "comment_engine";
  videos: VideoItem[];
  selectedVideoId?: string;
  onSelectVideoId: (id: string) => void;
  onUpdateVideoPackage: (videoId: string, updatedPackage: any) => void;
}

export const EnginesView: React.FC<EnginesViewProps> = ({
  engineType,
  videos,
  selectedVideoId,
  onSelectVideoId,
  onUpdateVideoPackage,
}) => {
  const currentVideo =
    videos.find((v) => v.id === selectedVideoId) || videos[0] || null;

  const [activeVideoId, setActiveVideoId] = useState<string>(currentVideo?.id || "");
  const activeVideo = videos.find((v) => v.id === activeVideoId) || currentVideo;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [antiRepetitionAlert, setAntiRepetitionAlert] = useState<any>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefine = async (
    text: string,
    action: "curto" | "curioso" | "emocional" | "provocativo" | "misterioso" | "direto",
    type: string
  ) => {
    setIsRefining(true);
    try {
      const refined = await refineCopyText(text, action, type);
      if (activeVideo && activeVideo.package) {
        if (type === "hook") {
          onUpdateVideoPackage(activeVideo.id, {
            ...activeVideo.package,
            selectedHook: refined,
          });
        } else if (type === "title") {
          onUpdateVideoPackage(activeVideo.id, {
            ...activeVideo.package,
            selectedTitle: refined,
          });
        }
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleCheckRepetition = async (hook: string, title: string) => {
    const recent = videos
      .filter((v) => v.id !== activeVideo?.id && v.package)
      .slice(0, 10)
      .map((v) => ({
        work: v.workName,
        hook: v.package?.selectedHook || "",
        title: v.package?.selectedTitle || "",
      }));

    const result = await checkAntiRepetition(hook, title, recent);
    setAntiRepetitionAlert(result);
  };

  if (!activeVideo || !activeVideo.package) {
    return (
      <div className="p-12 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-100">Nenhum Pacote Gerado</h2>
        <p className="text-sm text-zinc-400">
          Selecione um vídeo já processado ou execute a análise no Dashboard/Fila.
        </p>
      </div>
    );
  }

  const pkg = activeVideo.package;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Engine Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            {engineType === "hook_engine" && <Flame className="w-4 h-4" />}
            {engineType === "title_engine" && <Type className="w-4 h-4" />}
            {engineType === "caption_engine" && <FileText className="w-4 h-4" />}
            {engineType === "cta_engine" && <MessageSquareQuote className="w-4 h-4" />}
            {engineType === "comment_engine" && <Pin className="w-4 h-4" />}
            AI Copywriting Studio
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-1 uppercase tracking-tight">
            {engineType === "hook_engine" && "Hook Engine — 10 Variações Virais"}
            {engineType === "title_engine" && "Title Engine — Títulos de Alto Clique"}
            {engineType === "caption_engine" && "Caption Engine — Legendas com Estrutura"}
            {engineType === "cta_engine" && "CTA Engine — Gatilhos de Ação"}
            {engineType === "comment_engine" && "Comentário Âncora — Ignição de Comentários"}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Produza e refine textos otimizados para parar o scroll, reter e explodir a caixa de comentários.
          </p>
        </div>

        {/* Anti-repetition Check Trigger */}
        <button
          onClick={() =>
            handleCheckRepetition(pkg.selectedHook, pkg.selectedTitle)
          }
          className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-zinc-200 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Auditar Anti-Repetição
        </button>
      </div>

      {/* Video Selector Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setActiveVideoId(v.id);
              onSelectVideoId(v.id);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeVideo?.id === v.id
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <span className="font-mono">{v.serialId}</span>
            <span className="truncate max-w-[120px]">{v.workName}</span>
          </button>
        ))}
      </div>

      {/* Anti-Repetition Warning Alert */}
      {antiRepetitionAlert && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            antiRepetitionAlert.hasRepetition
              ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
              : "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
          }`}
        >
          {antiRepetitionAlert.hasRepetition ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase block">
              {antiRepetitionAlert.hasRepetition
                ? "Aviso de Repetição de Estrutura Detectado"
                : "Auditoria Aprovada: Estrutura Original e Única"}
            </span>
            <p className="text-xs leading-relaxed">
              {antiRepetitionAlert.warning ||
                "Seus ganchos e títulos não repetem fórmulas usadas nos últimos 10 vídeos."}
            </p>
          </div>
        </div>
      )}

      {/* ENGINE 1: HOOK ENGINE */}
      {engineType === "hook_engine" && (
        <div className="space-y-6">
          {/* Selected Active Hook Banner */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                Hook Selecionado Para a Thumbnail e Vídeo
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {pkg.selectedHook.length} caracteres
              </span>
            </div>

            <textarea
              rows={2}
              value={pkg.selectedHook}
              onChange={(e) =>
                onUpdateVideoPackage(activeVideo.id, {
                  ...pkg,
                  selectedHook: e.target.value,
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-base font-black text-zinc-100 uppercase focus:border-emerald-500 outline-none leading-snug"
            />

            {/* Quick Refine Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 mr-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Refinar com IA:
              </span>
              {[
                { id: "curto", label: "Mais Curto" },
                { id: "curioso", label: "Mais Curioso" },
                { id: "emocional", label: "Mais Emocional" },
                { id: "provocativo", label: "Mais Provocativo" },
              ].map((act) => (
                <button
                  key={act.id}
                  disabled={isRefining}
                  onClick={() =>
                    handleRefine(pkg.selectedHook, act.id as any, "hook")
                  }
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 text-xs font-bold hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* 10 Categorized Hook Variations */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Todas as 10 Variações de Hook Geradas:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pkg.hooks.map((hook: HookItem) => {
                const isSelected = pkg.selectedHook === hook.text;
                return (
                  <div
                    key={hook.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-zinc-100"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono">
                          {hook.category}
                        </span>
                        {hook.score && (
                          <span className="text-[11px] font-black text-emerald-300 font-mono">
                            {hook.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold leading-relaxed">
                        "{hook.text}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      <button
                        onClick={() =>
                          onUpdateVideoPackage(activeVideo.id, {
                            ...pkg,
                            selectedHook: hook.text,
                          })
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-lg cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-zinc-950"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {isSelected ? "Selecionado" : "Usar Este Hook"}
                      </button>

                      <button
                        onClick={() => copyToClipboard(hook.text, hook.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                        title="Copiar Hook"
                      >
                        {copiedId === hook.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ENGINE 2: TITLE ENGINE */}
      {engineType === "title_engine" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-4">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              Título Principal do Vídeo
            </span>

            <input
              type="text"
              value={pkg.selectedTitle}
              onChange={(e) =>
                onUpdateVideoPackage(activeVideo.id, {
                  ...pkg,
                  selectedTitle: e.target.value,
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-base font-extrabold text-zinc-100 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Title Variations */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Variações de Título Geradas ({pkg.titles.length}):
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.titles.map((t: TitleItem) => {
                const isSelected = pkg.selectedTitle === t.text;
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-zinc-100"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1 font-mono">
                        [{t.category}]
                      </span>
                      <span className="text-xs font-bold block">{t.text}</span>
                    </div>

                    <button
                      onClick={() =>
                        onUpdateVideoPackage(activeVideo.id, {
                          ...pkg,
                          selectedTitle: t.text,
                        })
                      }
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-zinc-950"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {isSelected ? "Ativo" : "Escolher"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ENGINE 3: CAPTION ENGINE */}
      {engineType === "caption_engine" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Legenda Principal (Copy Completo)
              </span>

              <button
                onClick={() =>
                  copyToClipboard(
                    `${pkg.selectedCaption.text}\n\n${pkg.selectedCta}\n\n${pkg.hashtags.join(" ")}`,
                    "caption-full"
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === "caption-full" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copiar Legenda Completa
              </button>
            </div>

            <textarea
              rows={8}
              value={pkg.selectedCaption.text}
              onChange={(e) =>
                onUpdateVideoPackage(activeVideo.id, {
                  ...pkg,
                  selectedCaption: {
                    ...pkg.selectedCaption,
                    text: e.target.value,
                  },
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-medium text-zinc-200 focus:border-emerald-500 outline-none leading-relaxed"
            />

            {/* Hashtags Strip */}
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 block mb-1.5 uppercase">
                Hashtags Estratégicas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pkg.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-zinc-950 text-emerald-400 text-xs font-mono border border-zinc-800"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENGINE 4: CTA ENGINE */}
      {engineType === "cta_engine" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-4">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4" />
              CTA (Call to Action) Selecionada
            </span>

            <input
              type="text"
              value={pkg.selectedCta}
              onChange={(e) =>
                onUpdateVideoPackage(activeVideo.id, {
                  ...pkg,
                  selectedCta: e.target.value,
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-extrabold text-zinc-100 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Outras Sugestões de CTA:
            </h2>
            <div className="space-y-2">
              {pkg.ctas.map((cta, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                >
                  <span className="text-xs text-zinc-200 font-medium">
                    "{cta}"
                  </span>
                  <button
                    onClick={() =>
                      onUpdateVideoPackage(activeVideo.id, {
                        ...pkg,
                        selectedCta: cta,
                      })
                    }
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 cursor-pointer"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ENGINE 5: COMMENT ENGINE */}
      {engineType === "comment_engine" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Pin className="w-4 h-4" />
                Comentário Âncora para Fixar no Topo
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    pkg.selectedPinnedComment.text,
                    "pinned-comment"
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === "pinned-comment" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copiar Comentário
              </button>
            </div>

            <textarea
              rows={3}
              value={pkg.selectedPinnedComment.text}
              onChange={(e) =>
                onUpdateVideoPackage(activeVideo.id, {
                  ...pkg,
                  selectedPinnedComment: {
                    ...pkg.selectedPinnedComment,
                    text: e.target.value,
                  },
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-zinc-100 focus:border-emerald-500 outline-none leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Opções Alternativas de Engajamento:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pkg.pinnedComments.map((c: PinnedCommentItem) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-3"
                >
                  <p className="text-xs text-zinc-200 font-medium">
                    "{c.text}"
                  </p>
                  <button
                    onClick={() =>
                      onUpdateVideoPackage(activeVideo.id, {
                        ...pkg,
                        selectedPinnedComment: c,
                      })
                    }
                    className="self-start px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 cursor-pointer"
                  >
                    Definir como Principal
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
