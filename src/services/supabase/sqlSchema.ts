/**
 * SQL SCHEMA DDL DEFINITION FOR SUPABASE (POSTGRESQL + RLS)
 * 
 * Contains all 14 tables, indexes, row level security policies,
 * and triggers for Categoria Filmes.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SCHEMA COMPLETO SUPABASE: CATEGORIA FILMES — AUTOMAÇÃO INTELIGENTE
-- PostgreSQL + Row Level Security (RLS) + Storage Buckets
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Perfis de Canais / Redes Sociais)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL DEFAULT 'Categoria Filmes',
  platform TEXT NOT NULL DEFAULT 'instagram',
  username TEXT NOT NULL DEFAULT '@categoriafilmes',
  niche TEXT NOT NULL DEFAULT 'Entretenimento',
  subniche TEXT NOT NULL DEFAULT 'Filmes e Séries - Melhores Momentos',
  bio TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VIDEOS (Repositório Master de Vídeos)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  serial_number TEXT NOT NULL,
  serial_num INTEGER NOT NULL DEFAULT 1,
  original_filename TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'google_drive',
  source_url TEXT,
  drive_file_id TEXT,
  storage_path TEXT,
  duration TEXT DEFAULT '01:00',
  status TEXT NOT NULL DEFAULT 'WAITING',
  movie_name TEXT NOT NULL,
  series_name TEXT,
  content_type TEXT DEFAULT 'filme',
  genre TEXT DEFAULT 'Suspense / Drama',
  subniche TEXT DEFAULT 'Melhores Momentos',
  characters TEXT[] DEFAULT '{}',
  scene_description TEXT,
  emotion TEXT DEFAULT 'Tensão',
  conflict TEXT DEFAULT 'Homem vs Conflito',
  spoiler_level TEXT DEFAULT 'baixo',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_profile_drive_file UNIQUE (profile_id, drive_file_id)
);

-- 3. VIDEO_ANALYSIS (Análise Cognitiva & Estratégica da Cena)
CREATE TABLE IF NOT EXISTS public.video_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  identification_confidence TEXT DEFAULT 'alta',
  scene_analysis TEXT,
  visual_analysis TEXT,
  emotional_analysis TEXT,
  narrative_analysis TEXT,
  viral_opportunities TEXT[] DEFAULT '{}',
  recommended_angle TEXT,
  recommended_hook_type TEXT,
  recommended_thumbnail_type TEXT,
  analysis_model TEXT DEFAULT 'gemini-3.7-flash',
  viral_score INTEGER DEFAULT 85,
  why_stop_scroll TEXT,
  why_retain TEXT,
  why_comment TEXT,
  why_share TEXT,
  score_breakdown JSONB DEFAULT '{"hookStrength": 90, "curiosityGap": 88, "visualImpact": 85, "debatePotential": 92, "retentionEstimate": 87}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOOKS (10 Variações de Ganchos Categorizados)
CREATE TABLE IF NOT EXISTS public.hooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  hook_text TEXT NOT NULL,
  hook_type TEXT NOT NULL,
  curiosity_score INTEGER DEFAULT 90,
  retention_score INTEGER DEFAULT 88,
  clarity_score INTEGER DEFAULT 92,
  originality_score INTEGER DEFAULT 85,
  overall_score INTEGER DEFAULT 89,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TITLES (10 Títulos Complementares e Magnéticos)
CREATE TABLE IF NOT EXISTS public.titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_type TEXT NOT NULL,
  curiosity_score INTEGER DEFAULT 88,
  clarity_score INTEGER DEFAULT 90,
  originality_score INTEGER DEFAULT 86,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CAPTIONS (5 Opções Estruturadas de Legenda)
CREATE TABLE IF NOT EXISTS public.captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  caption_style TEXT NOT NULL,
  caption TEXT NOT NULL,
  cta TEXT NOT NULL,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMMENTS (5 Comentários Âncora para Iniciar Debates)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL,
  is_main_recommendation BOOLEAN DEFAULT false,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. THUMBNAIL_TEMPLATES (Família Visual Categoria Filmes)
CREATE TABLE IF NOT EXISTS public.thumbnail_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL,
  preview_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. THUMBNAILS (Artes Geradas e Relações)
CREATE TABLE IF NOT EXISTS public.thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.thumbnail_templates(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  image_source TEXT DEFAULT 'frame',
  hook_text TEXT NOT NULL,
  title_text TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  configuration JSONB NOT NULL,
  selected BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONTENT_CALENDAR (Agendamento Automático 6x/dia)
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'instagram',
  scheduled_at TIMESTAMPTZ NOT NULL,
  slot_period TEXT NOT NULL, -- 'manha', 'tarde', 'noite'
  slot_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'publishing', 'published', 'failed'
  published_at TIMESTAMPTZ,
  external_post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. METRICS (Desempenho e Telemetria de Engajamento)
CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_post_id TEXT,
  views BIGINT DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  retention_pct NUMERIC(5,2) DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EXPERIMENTS (Testes A/B de Hooks, Thumbnails e Títulos)
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  experiment_type TEXT NOT NULL,
  variable TEXT NOT NULL,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  result_a NUMERIC(5,2),
  result_b NUMERIC(5,2),
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUTOMATION_JOBS (Fila e Recuperação de Tarefas Assíncronas)
CREATE TABLE IF NOT EXISTS public.automation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL DEFAULT 'full_pipeline',
  status TEXT NOT NULL DEFAULT 'pending',
  current_stage TEXT NOT NULL DEFAULT 'WAITING',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SETTINGS & SYSTEM_LOGS (Configurações e Auditoria)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_setting UNIQUE (user_id, setting_key)
);

CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL DEFAULT 'pipeline',
  message TEXT NOT NULL,
  duration_ms INTEGER,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  stage TEXT,
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES PARA MÁXIMA VELOCIDADE DE CONSULTA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_serial_num ON public.videos(serial_num);
CREATE INDEX IF NOT EXISTS idx_videos_drive_file_id ON public.videos(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_hooks_video_id ON public.hooks(video_id);
CREATE INDEX IF NOT EXISTS idx_titles_video_id ON public.titles(video_id);
CREATE INDEX IF NOT EXISTS idx_calendar_scheduled_at ON public.content_calendar(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_metrics_video_id ON public.metrics(video_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.automation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.system_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnail_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own records
CREATE POLICY "Users can manage own profiles" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own videos" ON public.videos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own jobs" ON public.automation_jobs FOR ALL USING (auth.uid() = user_id);
`;
