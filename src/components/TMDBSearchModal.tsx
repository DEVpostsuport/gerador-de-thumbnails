import React, { useState, useEffect } from "react";
import {
  Search,
  Film,
  Tv,
  Star,
  Calendar,
  Users,
  Check,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { TMDBService, TMDBMedia } from "../services/tmdbService";

interface TMDBSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectMedia: (media: TMDBMedia) => void;
}

export const TMDBSearchModal: React.FC<TMDBSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
  onSelectMedia,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<TMDBMedia | null>(null);
  const [mediaType, setMediaType] = useState<"multi" | "movie" | "tv">("multi");

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      if (initialQuery) {
        performSearch(initialQuery, mediaType);
      } else {
        loadTrending();
      }
    }
  }, [isOpen, initialQuery]);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const trending = await TMDBService.getTrending();
      setResults(trending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchTerm: string, type: "multi" | "movie" | "tv") => {
    if (!searchTerm.trim()) {
      loadTrending();
      return;
    }
    setLoading(true);
    try {
      const items = await TMDBService.search(searchTerm, type);
      setResults(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, mediaType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-[#272738] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#242436] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Catálogo TMDB (The Movie Database)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Consulte metadados oficiais, sinopses em português, pôsteres e elenco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-[#20202e] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Type Filter */}
        <div className="p-4 border-b border-[#242436] bg-[#171722] space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar filme, série, anime por nome em português ou original..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#111117] border border-[#2f2f44] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Buscar"}
            </button>
          </form>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Filtrar por:</span>
            <button
              type="button"
              onClick={() => {
                setMediaType("multi");
                performSearch(query, "multi");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                mediaType === "multi"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-zinc-400 hover:text-white bg-[#1a1a26]"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaType("movie");
                performSearch(query, "movie");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                mediaType === "movie"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-zinc-400 hover:text-white bg-[#1a1a26]"
              }`}
            >
              <Film className="w-3 h-3" /> Filmes
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaType("tv");
                performSearch(query, "tv");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                mediaType === "tv"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-zinc-400 hover:text-white bg-[#1a1a26]"
              }`}
            >
              <Tv className="w-3 h-3" /> Séries / TV
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Consultando TMDB API...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Nenhuma obra encontrada para "{query}". Tente buscar por outro termo.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((item) => (
                <div
                  key={`${item.mediaType}-${item.id}`}
                  onClick={() => {
                    onSelectMedia(item);
                    onClose();
                  }}
                  className="group bg-[#171722] hover:bg-[#1e1e2c] border border-[#28283c] hover:border-amber-500/50 rounded-xl p-3 flex gap-3 cursor-pointer transition-all shadow-sm"
                >
                  {/* Poster */}
                  <div className="w-16 h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                    {item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#27273a] text-zinc-300 shrink-0">
                          {item.mediaType === "movie" ? "Filme" : "Série"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                        {item.releaseYear && (
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3 text-zinc-500" /> {item.releaseYear}
                          </span>
                        )}
                        {item.voteAverage > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" /> {item.voteAverage}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1.5 leading-tight">
                        {item.overview || "Sem sinopse cadastrada."}
                      </p>
                    </div>

                    {/* Genres */}
                    {item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.genres.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="text-[9px] bg-amber-500/10 text-amber-400/90 px-1.5 py-0.5 rounded border border-amber-500/20"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#242436] bg-[#171722] flex items-center justify-between text-[11px] text-zinc-400">
          <span>Dados alimentados em tempo real pela API oficial do TMDB</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252536] hover:bg-[#303046] text-white rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
