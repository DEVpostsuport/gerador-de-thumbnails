import React from "react";
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Type,
  FileText,
  MessageSquareQuote,
  Pin,
  Film,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Palette,
  Settings,
  Flame,
  CheckCircle2,
  Zap,
  Terminal,
} from "lucide-react";

export type ViewTab =
  | "dashboard"
  | "import"
  | "queue"
  | "thumbnails"
  | "hook_engine"
  | "title_engine"
  | "caption_engine"
  | "cta_engine"
  | "comment_engine"
  | "library"
  | "niche_intel"
  | "analytics"
  | "calendar"
  | "templates"
  | "automations"
  | "logs"
  | "settings";

interface NavigationProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  queueCount: number;
  readyCount: number;
  totalCount: number;
  autoMode: boolean;
  onToggleAutoMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  queueCount,
  readyCount,
  autoMode,
  onToggleAutoMode,
}) => {
  const mainNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "import", label: "Novo Conteúdo / Importar", icon: UploadCloud, highlight: true },
    { id: "queue", label: "Fila de Produção", icon: Layers, badge: queueCount > 0 ? queueCount : undefined },
    { id: "thumbnails", label: "Thumbnail Studio", icon: ImageIcon, badgeColor: "bg-amber-500" },
    { id: "library", label: "Biblioteca", icon: Film },
  ];

  const enginesNav = [
    { id: "hook_engine", label: "Hook Engine", icon: Flame },
    { id: "title_engine", label: "Title Engine", icon: Type },
    { id: "caption_engine", label: "Caption Engine", icon: FileText },
    { id: "cta_engine", label: "CTA Engine", icon: MessageSquareQuote },
    { id: "comment_engine", label: "Comentário Âncora", icon: Pin },
  ];

  const strategyNav = [
    { id: "niche_intel", label: "Niche Intelligence", icon: Sparkles },
    { id: "analytics", label: "Analytics & Aprendizado", icon: BarChart3 },
    { id: "calendar", label: "Calendário (6x/dia)", icon: CalendarDays },
    { id: "templates", label: "Templates Seriados", icon: Palette },
    { id: "automations", label: "Automações & Jobs", icon: Zap },
    { id: "logs", label: "Logs do Sistema", icon: Terminal },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-72 bg-zinc-900/95 border-r border-zinc-800 flex flex-col h-screen select-none sticky top-0 shrink-0 backdrop-blur-md"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-zinc-950 font-black text-xl">
            <Film className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-zinc-100 uppercase">
              Categoria Filmes
            </h1>
            <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              VIRAL CONTENT ENGINE
            </p>
          </div>
        </div>

        {/* Auto Mode Switch */}
        <div className="mt-4 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-zinc-200 block uppercase tracking-wider">AUTO MODE</span>
            <span className="text-[10px] text-zinc-400">Análise e artes em lote</span>
          </div>
          <button
            id="toggle-auto-mode-btn"
            onClick={onToggleAutoMode}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              autoMode ? "bg-emerald-500" : "bg-zinc-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-sm ${
                autoMode ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Produção & Fluxo
          </div>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setCurrentTab(item.id as ViewTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-zinc-950 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Copy & Strategy Engines */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
            <span>AI Copy Engines</span>
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="space-y-1">
            {enginesNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setCurrentTab(item.id as ViewTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intelligence, Growth & System */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Inteligência & Gestão
          </div>
          <div className="space-y-1">
            {strategyNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setCurrentTab(item.id as ViewTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {readyCount} prontos p/ postar
          </span>
          <span className="text-emerald-400 font-mono font-bold">6 vids/dia</span>
        </div>
      </div>
    </aside>
  );
};
