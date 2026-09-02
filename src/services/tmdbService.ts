export interface TMDBMedia {
  id: number;
  title: string;
  originalTitle: string;
  mediaType: "movie" | "tv";
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate?: string;
  releaseYear?: string;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  cast: Array<{ name: string; character: string; profileUrl?: string }>;
  directors: string[];
  tagline?: string;
}

export class TMDBService {
  private static IMAGE_BASE = "https://image.tmdb.org/t/p";

  public static getPosterUrl(path?: string | null, size: "w342" | "w500" | "w780" | "original" = "w500"): string {
    if (!path) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
    if (path.startsWith("http")) return path;
    return `${this.IMAGE_BASE}/${size}${path}`;
  }

  public static getBackdropUrl(path?: string | null, size: "w780" | "w1280" | "original" = "w1280"): string {
    if (!path) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80";
    if (path.startsWith("http")) return path;
    return `${this.IMAGE_BASE}/${size}${path}`;
  }

  // Search movies and series
  public static async search(query: string, type: "multi" | "movie" | "tv" = "multi"): Promise<TMDBMedia[]> {
    if (!query || query.trim().length === 0) return [];
    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=${type}`);
      if (!res.ok) throw new Error("Erro na busca do TMDB");
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error("Erro ao buscar no TMDB:", err);
      return [];
    }
  }

  // Auto-enrich a video title or filename with TMDB data
  public static async enrichMedia(titleOrFilename: string): Promise<TMDBMedia | null> {
    try {
      const res = await fetch("/api/tmdb/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: titleOrFilename }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.media || null;
    } catch (err) {
      console.error("Erro no enriquecimento TMDB:", err);
      return null;
    }
  }

  // Get full details by ID
  public static async getDetails(id: number, type: "movie" | "tv" = "movie"): Promise<TMDBMedia | null> {
    try {
      const res = await fetch(`/api/tmdb/details?id=${id}&type=${type}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.details || null;
    } catch (err) {
      console.error("Erro ao obter detalhes TMDB:", err);
      return null;
    }
  }

  // Get trending movies and series
  public static async getTrending(): Promise<TMDBMedia[]> {
    try {
      const res = await fetch("/api/tmdb/trending");
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      return [];
    }
  }
}
