import { ProfileEntity } from "../../types";
import { getSupabaseClient } from "./supabaseClient";

const PROFILE_CACHE_KEY = "cf_active_profile_cache";

export const DEFAULT_PROFILE: ProfileEntity = {
  id: "prof_categoria_filmes",
  user_id: "usr_admin",
  profile_name: "Categoria Filmes",
  platform: "instagram",
  username: "@categoriafilmes",
  niche: "Entretenimento",
  subniche: "Filmes e Séries - Melhores Momentos",
  bio: "Os melhores momentos, reviravoltas e cenas icônicas do cinema em cortes de alto impacto.",
  avatar_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export class ProfileService {
  private static profile: ProfileEntity = { ...DEFAULT_PROFILE };

  public static getProfile(): ProfileEntity {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(PROFILE_CACHE_KEY);
        if (raw) this.profile = JSON.parse(raw);
      } catch (err) {}
    }
    return this.profile;
  }

  public static async updateProfile(updates: Partial<ProfileEntity>): Promise<ProfileEntity> {
    this.profile = {
      ...this.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(this.profile));
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("profiles").upsert(this.profile);
      } catch (err) {}
    }

    return this.profile;
  }
}

// --- PUBLISHING SERVICE ---
export class PublishingService {
  public static async publishVideo(videoId: string, platform: string) {
    // Social media direct API publishing placeholder / webhook trigger
    return {
      success: true,
      publishedAt: new Date().toISOString(),
      postId: "post_" + Date.now(),
      platform,
    };
  }
}

// --- AUTH SERVICE ---
export class AuthService {
  public static async getCurrentUser() {
    const supabase = getSupabaseClient();
    if (!supabase) return { id: "local_user", email: "admin@categoriafilmes.com" };
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user || { id: "local_user", email: "admin@categoriafilmes.com" };
    } catch {
      return { id: "local_user", email: "admin@categoriafilmes.com" };
    }
  }
}
