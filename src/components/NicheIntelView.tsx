import React from "react";
import {
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  BarChart2,
  Clock,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

export const NicheIntelView: React.FC = () => {
  const topSubnichos = [
    { name: "Reviravoltas & Choque Psicológico", retention: 91.4, score: 98, count: 28 },
    { name: "Cenas Épicas & Tensão Máxima", retention: 89.2, score: 96, count: 34 },
    { name: "Conflitos Morais & Discussão Social", retention: 87.8, score: 95, count: 22 },
    { name: "Nostalgia & Reviravoltas Emocionais", retention: 86.5, score: 93, count: 19 },
    { name: "Revelações de Segredo / Detalhes Ocultos", retention: 84.1, score: 91, count: 21 },
  ];

  const viralArchetypes = [
    {
      title: "O Ponto de Virada Moral",
      desc: "Quando o protagonista abandona suas rédeas morais e se assume predador (Ex: Walter White, Michael Corleone).",
      hookPattern: "'O momento exato em que ele deixou de ser a vítima...'",
    },
    {
      title: "O Cálculo Sob Pressão Impossível",
      desc: "Um herói com poucos segundos para tomar uma decisão física ou técnica sem volta (Ex: Interestelar, Top Gun).",
      hookPattern: "'Ele tinha apenas 10 segundos para calcular o impossível...'",
    },
    {
      title: "A Verdade Oculta Revelada Tarde Demais",
      desc: "Quando uma mentira mantida por anos é desmascarada na frente de todos (Ex: Harry Potter - Snape, Ilha do Medo).",
      hookPattern: "'Depois de tantos anos acreditando nisso, a verdade doeu mais...'",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Inteligência de Nicho & Aprendizado de Dados
          </span>
          <h1 className="text-3xl font-black text-neutral-100 mt-1 uppercase tracking-tight">
            Niche Intelligence (Filmes & Séries)
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Mapeamento contínuo de padrões que mais geram retenção acima de 85% e debates nos comentários.
          </p>
        </div>
      </div>

      {/* Top Subnicho Ranking */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Ranking de Performance por Subnicho
        </h2>

        <div className="space-y-3">
          {topSubnichos.map((sub, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-black text-amber-400">
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-neutral-100">
                  {sub.name}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  {sub.retention}% Retenção
                </span>
                <span className="text-amber-300 font-bold">
                  {sub.score}/100 Score
                </span>
                <span className="text-neutral-400">
                  {sub.count} vídeos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viral Archetypes */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Arquétipos de Cenas Mais Virais da História
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {viralArchetypes.map((arch, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-black text-amber-300 uppercase block">
                  {arch.title}
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {arch.desc}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 font-bold">
                <span className="text-amber-400 block text-[9px] uppercase tracking-wider mb-1">
                  Padrão de Gancho:
                </span>
                {arch.hookPattern}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
