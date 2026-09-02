import React, { useState } from "react";
import { VideoItem } from "../types";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Flame,
  Award,
} from "lucide-react";

interface AnalyticsViewProps {
  videos: VideoItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ videos }) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  // Aggregate simulated / real performance
  const totalViews = 1845200;
  const avgRetention = 68.4;
  const totalShares = 42100;
  const totalSaves = 89400;

  const topPerforming = [
    {
      id: "v-001",
      work: "Breaking Bad",
      scene: "Walter White: Say My Name",
      views: "1.2M",
      retention: "74.2%",
      shares: "18.4K",
      hook: "A CENA QUE MUDOU O DESTINO DE WALTER WHITE",
      archetype: "Intensidade / Diálogo Icônico",
    },
    {
      id: "v-002",
      work: "Interestelar",
      scene: "Ondas Gigantes de Miller",
      views: "940K",
      retention: "81.0%",
      shares: "22.1K",
      hook: "CADA HORA AQUI SÃO 7 ANOS NA TERRA",
      archetype: "Tensão Extrema / Escala Cósmica",
    },
    {
      id: "v-003",
      work: "Coringa",
      scene: "Dança na Escadaria do Bronx",
      views: "810K",
      retention: "69.5%",
      shares: "12.8K",
      hook: "O MOMENTO EXATO QUE ELE SE TORNOU O CORINGA",
      archetype: "Transformação Psicológica",
    },
    {
      id: "v-004",
      work: "Harry Potter",
      scene: "A Revelação de Snape - Always",
      views: "760K",
      retention: "85.6%",
      shares: "28.5K",
      hook: "DEPOIS DE TANTO TEMPO? O SEGREDO DE SNAPE",
      archetype: "Reviravolta Emocional / Redenção",
    },
  ];

  const hourlyHeatmap = [
    { hour: "08:00", day: "Manhã 1", score: 85, label: "Pico de abertura de reels" },
    { hour: "11:30", day: "Manhã 2", score: 92, label: "Pausa almoço / trânsito" },
    { hour: "15:00", day: "Tarde 1", score: 78, label: "Engajamento estável" },
    { hour: "18:00", day: "Tarde 2", score: 98, label: "Fim do expediente (MELHOR HORÁRIO)" },
    { hour: "20:30", day: "Noite 1", score: 95, label: "Horário nobre de retenção longa" },
    { hour: "22:30", day: "Noite 2", score: 88, label: "Scroll pré-sono / salvamentos" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <BarChart3 className="w-4 h-4" />
            Performance & Algoritmo
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-1 uppercase tracking-tight">
            Analytics & Aprendizado Contínuo
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Métricas reais de retenção, compartilhamentos e inteligência algorítmica para calibrar os próximos ganchos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          {(["7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-emerald-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {r === "all" ? "Todo Período" : r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Visualizações Totais</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-zinc-100 font-mono block">1.84M</span>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +34.2% este mês
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Retenção Média</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-zinc-100 font-mono block">{avgRetention}%</span>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Meta de 65%+ superada
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Compartilhamentos</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-zinc-100 font-mono block">{(totalShares / 1000).toFixed(1)}k</span>
          <span className="text-[11px] text-zinc-400">Viralidade por Direct</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Salvamentos</span>
            <Bookmark className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-zinc-100 font-mono block">{(totalSaves / 1000).toFixed(1)}k</span>
          <span className="text-[11px] text-zinc-400">Sinal forte para o algoritmo</span>
        </div>
      </div>

      {/* Posting Time Heatmap */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Melhores Janelas de Publicação (Estratégia 6 Vídeos/Dia)
            </h2>
            <p className="text-xs text-zinc-400">
              Taxa de alcance algorítmico por slot de postagem diária.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">6 SLOTS / DIA</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {hourlyHeatmap.map((slot, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                slot.score >= 95
                  ? "bg-emerald-500/10 border-emerald-500 text-zinc-100"
                  : "bg-zinc-950 border-zinc-800 text-zinc-300"
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-emerald-400 block">{slot.hour}</span>
                <span className="text-[11px] font-bold text-zinc-200 block mt-0.5">{slot.day}</span>
              </div>
              <div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-1">
                  <div className="bg-emerald-400 h-full" style={{ width: `${slot.score}%` }} />
                </div>
                <span className="text-[10px] text-zinc-400 block leading-tight">{slot.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Clips Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Top Vídeos Mais Virais & Estrutura de Retenção
          </h2>
          <span className="text-xs text-zinc-400">Padrões validados pelo público</span>
        </div>

        <div className="space-y-3">
          {topPerforming.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-mono font-black text-emerald-400 text-xs shrink-0">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-100">{item.work}</span>
                    <span className="text-xs text-zinc-400">• {item.scene}</span>
                  </div>
                  <span className="text-xs text-emerald-300 font-bold mt-1 block">
                    "{item.hook}"
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                    Arquétipo: {item.archetype}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] block uppercase">Views</span>
                  <span className="font-bold text-zinc-100">{item.views}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] block uppercase">Retenção</span>
                  <span className="font-bold text-emerald-400">{item.retention}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] block uppercase">Shares</span>
                  <span className="font-bold text-zinc-200">{item.shares}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
