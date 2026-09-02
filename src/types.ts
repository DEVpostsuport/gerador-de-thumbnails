export type PipelineStage =
  | "WAITING"
  | "DOWNLOADING"
  | "ANALYZING"
  | "IDENTIFYING"
  | "GENERATING_HOOKS"
  | "GENERATING_TITLES"
  | "SELECTING_FRAME"
  | "GENERATING_THUMBNAIL"
  | "GENERATING_CAPTION"
  | "GENERATING_COMMENT"
  | "QUALITY_CHECK"
  | "READY"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "ANALYZING_METRICS"
  | "ERROR";

export type VideoStatus =
  | "aguardando"
  | "analisando"
  | "gerando_estrategia"
  | "gerando_thumbnail"
  | "concluido"
  | "erro";

export type AutomationMode = "manual" | "semiauto" | "auto";
export type SpoilerLevel = "zero" | "baixo" | "medio" | "alto";
export type PlatformType = "instagram" | "tiktok" | "youtube_shorts" | "all";

// --- SUPABASE DATABASE ENTITY TYPES (14 TABLES) ---

export interface ProfileEntity {
  id: string;
  user_id: string;
  profile_name: string;
  platform: PlatformType;
  username: string;
  niche: string;
  subniche: string;
  bio?: string;
  avatar_url?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VideoEntity {
  id: string;
  user_id?: string;
  profile_id?: string;
  serial_number: string; // e.g. "#001"
  serial_num: number;
  original_filename: string;
  source_type: "google_drive" | "manual_upload" | "url";
  source_url?: string;
  drive_file_id?: string;
  storage_path?: string;
  duration: string;
  status: PipelineStage;
  movie_name: string;
  series_name?: string;
  content_type: "filme" | "serie" | "anime" | "documentario";
  genre: string;
  subniche: string;
  characters?: string[];
  scene_description: string;
  emotion: string;
  conflict: string;
  spoiler_level: SpoilerLevel;
  progress?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalysisEntity {
  id: string;
  video_id: string;
  identification_confidence: "alta" | "media" | "baixa";
  scene_analysis: string;
  visual_analysis?: string;
  emotional_analysis?: string;
  narrative_analysis?: string;
  viral_opportunities?: string[];
  recommended_angle?: string;
  recommended_hook_type?: string;
  recommended_thumbnail_type?: string;
  analysis_model: string;
  viral_score: number;
  why_stop_scroll?: string;
  why_retain?: string;
  why_comment?: string;
  why_share?: string;
  score_breakdown: {
    hookStrength: number;
    curiosityGap: number;
    visualImpact: number;
    debatePotential: number;
    retentionEstimate: number;
  };
  created_at: string;
}

export interface HookEntity {
  id: string;
  video_id: string;
  hook_text: string;
  hook_type: string; // 'curiosidade' | 'mistério' | 'tensão' | 'choque' | 'pergunta' | 'conflito' | 'reviravolta' | 'emoção' | 'nostalgia' | 'debate'
  curiosity_score: number;
  retention_score: number;
  clarity_score: number;
  originality_score: number;
  overall_score: number;
  selected: boolean;
  created_at: string;
}

export interface TitleEntity {
  id: string;
  video_id: string;
  title: string;
  title_type: string; // 'curiosidade' | 'suspense' | 'mistério' | 'emoção' | 'personagem' | 'reviravolta' | 'detalhe' | 'debate' | 'nostalgia' | 'choque'
  curiosity_score: number;
  clarity_score: number;
  originality_score: number;
  selected: boolean;
  created_at: string;
}

export interface CaptionEntity {
  id: string;
  video_id: string;
  caption_style: string; // 'Contextual & Open Loop' | 'Análise Psicológica' | 'Cinematografia' | 'Provocação' | 'Nostalgia'
  caption: string;
  cta: string;
  selected: boolean;
  created_at: string;
}

export interface CommentEntity {
  id: string;
  video_id: string;
  comment_text: string;
  comment_type: "debate" | "pergunta" | "opinião" | "ranking" | "curiosidade" | "provocação" | "continuação";
  is_main_recommendation: boolean;
  selected: boolean;
  created_at: string;
}

export interface ThumbnailEntity {
  id: string;
  video_id: string;
  template_id?: string;
  image_url: string;
  image_source: "frame" | "upload" | "generated" | "reference";
  hook_text: string;
  title_text: string;
  serial_number: string;
  configuration: ThumbnailConfig;
  selected: boolean;
  status: "draft" | "rendered" | "approved";
  created_at: string;
}

export interface ThumbnailTemplateEntity {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  description: string;
  configuration: Partial<ThumbnailConfig>;
  preview_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentCalendarEntity {
  id: string;
  profile_id?: string;
  video_id: string;
  platform: PlatformType;
  scheduled_at: string; // ISO date + time
  slot_period: "manha" | "tarde" | "noite";
  slot_index: number;
  status: "scheduled" | "publishing" | "published" | "failed";
  published_at?: string;
  external_post_id?: string;
  created_at: string;
}

export interface MetricEntity {
  id: string;
  video_id: string;
  platform: PlatformType;
  external_post_id?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers_gained: number;
  watch_time_seconds: number;
  retention_pct: number;
  completion_rate: number;
  collected_at: string;
}

export interface ExperimentEntity {
  id: string;
  video_id: string;
  experiment_type: "hook_ab" | "thumbnail_ab" | "title_ab" | "time_slot_ab";
  variable: string;
  variant_a: string;
  variant_b: string;
  result_a?: number;
  result_b?: number;
  winner?: "variant_a" | "variant_b" | "inconclusive";
  created_at: string;
}

export interface AutomationJobEntity {
  id: string;
  user_id?: string;
  video_id: string;
  job_type: "full_pipeline" | "analyze" | "generate_assets" | "quality_check" | "publish";
  status: "pending" | "running" | "completed" | "failed";
  current_stage: PipelineStage;
  progress: number;
  error_message?: string;
  attempts: number;
  max_attempts: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface SettingEntity {
  id: string;
  user_id?: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warn" | "error";
  category: "ingestion" | "gemini_ai" | "pipeline" | "supabase" | "thumbnail" | "publisher";
  message: string;
  duration_ms?: number;
  video_id?: string;
  stage?: PipelineStage;
  tokens_used?: number;
  metadata?: Record<string, any>;
}

// --- FRONTEND COMPONENT INTERFACES ---

export interface ScoreBreakdown {
  hookStrength: number;
  curiosityGap: number;
  visualImpact: number;
  debatePotential: number;
  retentionEstimate: number;
}

export interface SceneAnalysis {
  identifiedWork: string;
  confidence: "alta" | "media" | "baixa";
  genre: string;
  subnicho: string;
  emotion: string;
  conflictType: string;
  viralAngle: string;
  whyStopScroll: string;
  whyRetain: string;
  whyComment: string;
  whyShare: string;
  viralScore: number;
  scoreBreakdown: ScoreBreakdown;
  recommendedThumbnailText: string;
}

export interface HookItem {
  id: string;
  category: string;
  text: string;
  score: number;
  retentionScore?: number;
  curiosityScore?: number;
}

export interface TitleItem {
  id: string;
  category: string;
  text: string;
  score?: number;
}

export interface CaptionItem {
  id: string;
  style: string;
  text: string;
  cta: string;
}

export interface PinnedCommentItem {
  id: string;
  category: string;
  text: string;
  isMainRecommendation: boolean;
}

export interface ContentPackage {
  selectedHook: string;
  hooks: HookItem[];
  selectedTitle: string;
  titles: TitleItem[];
  selectedCaption: CaptionItem;
  captions: CaptionItem[];
  selectedCta: string;
  ctas: string[];
  selectedPinnedComment: PinnedCommentItem;
  pinnedComments: PinnedCommentItem[];
  hashtags: string[];
  viralScore: number;
  spoilerLevel: SpoilerLevel;
  customNotes?: string;
  thumbnailRecommendation?: {
    hookText: string;
    movieTitle: string;
    serialNumber: string;
    visualVibe: string;
  };
}

export interface ThumbnailConfig {
  templateId?: string;
  hookText: string;
  movieTitle: string;
  serialNumber: string;
  frameUrl: string;
  fontFamily?: string;
  hookFontSize?: number;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  accentColor?: string;
  showBadge?: boolean;
  badgeStyle?: "gold_pill" | "crimson_box" | "amber_gradient" | "neon_bordered" | "minimal_tag";
  showBrand?: boolean;
  brandText?: string;
  vignetteStrength?: number;
  gradientOverlay?: "bottom" | "top_bottom" | "radial" | "none";
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturation?: number;
  hookOffsetY?: number; // percentage from top 0-100
  titleOffsetY?: number;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badgeStyle: "gold_pill" | "crimson_box" | "amber_gradient" | "neon_bordered" | "minimal_tag";
  fontFamily: string;
  hookFontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  accentColor: string;
  gradientOverlay: "bottom" | "top_bottom" | "radial" | "none";
  vignetteStrength: number;
  brandText: string;
  hookOffsetY: number;
  titleOffsetY: number;
  previewBg: string;
}

export interface QualityChecklist {
  workIdentified: boolean;
  imageFound: boolean;
  hookCreated: boolean;
  hookStrong: boolean;
  titleSpecific: boolean;
  thumbnailCreated: boolean;
  serialNumberAdded: boolean;
  imagePresent: boolean;
  textLegible: boolean;
  captionCreated: boolean;
  ctaCreated: boolean;
  commentCreated: boolean;
  scoreCalculated: boolean;
}

export interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  retentionPct: number;
  followersGained: number;
  watchTimeSeconds?: number;
  completionRate?: number;
}

export interface VideoItem {
  id: string;
  serialId: string; // e.g. "#001"
  serialNum: number;
  filename: string;
  fileSize: string;
  duration: string;
  videoUrl?: string;
  frameDataUrl?: string;
  workName: string;
  identifiedWorkConfidence: "alta" | "media" | "baixa";
  year?: string;
  genre: string;
  subnicho: string;
  status: VideoStatus;
  pipelineStage?: PipelineStage;
  progress: number; // 0-100
  statusMessage?: string;
  error?: string;
  attempts?: number;
  sceneDescription: string;
  analysis?: SceneAnalysis;
  package?: ContentPackage;
  thumbnailConfig?: ThumbnailConfig;
  thumbnailDataUrl?: string;
  qualityChecklist: QualityChecklist;
  published: boolean;
  publishedAt?: string;
  scheduledSlot?: {
    date: string;
    time: string;
    period: "manha" | "tarde" | "noite";
    slotIndex: number;
  };
  metrics?: VideoMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelSettings {
  channelName: string;
  channelHandle?: string;
  defaultHashtags?: string[];
  dailyTargetVideos?: number;
  autoMode: boolean;
  automationMode: AutomationMode;
  defaultBadgeStyle?: "gold_pill" | "crimson_box" | "amber_gradient" | "neon_bordered" | "minimal_tag";
  defaultTemplateId?: string;
  niche?: string;
  subnicho?: string;
  nextSerialId?: number;
  prefix?: string;
  spoilerLevel?: SpoilerLevel;
  dailyTarget?: number;
  slots?: {
    morning: string[];
    afternoon: string[];
    night: string[];
  };
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  geminiApiKey?: string;
  aiModelPrimary?: string;
  aiModelSecondary?: string;
  aiVariationsCount?: number;
  aiCreativityLevel?: "baixo" | "balanceado" | "alto";
}

export interface NicheIntelligenceData {
  subnicho: string;
  avgRetention: number;
  avgViews: number;
  engagementScore: number;
  sampleCount: number;
  trend: "alta" | "estavel" | "queda";
  description: string;
  keyTrigger: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Segunda", "Terça", etc.
  morningSlots: (VideoItem | null)[];
  afternoonSlots: (VideoItem | null)[];
  nightSlots: (VideoItem | null)[];
}
