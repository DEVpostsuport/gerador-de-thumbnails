import React from "react";
import { DEFAULT_TEMPLATES } from "../lib/templates";
import { ThumbnailTemplate } from "../types";
import {
  Palette,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
} from "lucide-react";

interface TemplatesViewProps {
  onOpenThumbnailStudio: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onOpenThumbnailStudio,
}) => {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4" />
            Identidade Visual Seriada
          </span>
          <h1 className="text-3xl font-black text-neutral-100 mt-1 uppercase tracking-tight">
            Templates de Thumbnails Oficiais
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Padronização estética para criar reconhecimento imediato do perfil no feed e na grade do Instagram.
          </p>
        </div>

        <button
          onClick={onOpenThumbnailStudio}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          Abrir Editor no Studio
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEFAULT_TEMPLATES.map((tpl: ThumbnailTemplate) => (
          <div
            key={tpl.id}
            className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
          >
            <div className="space-y-3">
              {/* Visual Mock Card */}
              <div
                style={{ background: tpl.previewBg }}
                className="aspect-[9/10] rounded-xl p-4 flex flex-col justify-between border border-neutral-800 shadow-inner relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest text-neutral-300 uppercase px-2 py-0.5 bg-black/60 rounded">
                    {tpl.brandText}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-neutral-950">
                    #001
                  </span>
                </div>

                <div className="space-y-1 text-center bg-black/60 p-2.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-black uppercase text-white block">
                    ELE DESCOBRIU A VERDADE
                  </span>
                  <span className="text-[9px] font-bold text-amber-400 uppercase block">
                    BREAKING BAD
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-neutral-100">
                    {tpl.name}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {tpl.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold">{tpl.category}</span>
              <button
                onClick={onOpenThumbnailStudio}
                className="text-xs font-bold text-neutral-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                Usar Template <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
