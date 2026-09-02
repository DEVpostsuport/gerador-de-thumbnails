import React, { useState, useEffect } from "react";
import { ChannelSettings, AutomationMode, SpoilerLevel } from "../types";
import {
  getSupabaseConfig,
  testSupabaseConnection,
  resetSupabaseClient,
} from "../services/supabase/supabaseClient";
import { SUPABASE_SQL_SCHEMA } from "../services/supabase/sqlSchema";
import { automationService } from "../services/supabase/automationService";
import {
  Settings,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Save,
  RotateCcw,
  Database,
  Key,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Code2,
} from "lucide-react";

interface SettingsViewProps {
  settings: ChannelSettings;
  onSaveSettings: (newSettings: ChannelSettings) => void;
  onResetDatabase: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDatabase,
}) => {
  const [form, setForm] = useState<ChannelSettings>({
    ...settings,
    automationMode: settings.automationMode || "semiauto",
    spoilerLevel: settings.spoilerLevel || "baixo",
    supabaseUrl: localStorage.getItem("cf_supabase_url") || "",
    supabaseAnonKey: localStorage.getItem("cf_supabase_anon_key") || "",
  });

  const [saved, setSaved] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showSchemaModal, setShowSchemaModal] = useState(false);

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseStatus(null);
    try {
      if (form.supabaseUrl) localStorage.setItem("cf_supabase_url", form.supabaseUrl);
      if (form.supabaseAnonKey) localStorage.setItem("cf_supabase_anon_key", form.supabaseAnonKey);
      resetSupabaseClient();
      const res = await testSupabaseConnection();
      setSupabaseStatus(res);
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.supabaseUrl) localStorage.setItem("cf_supabase_url", form.supabaseUrl);
    if (form.supabaseAnonKey) localStorage.setItem("cf_supabase_anon_key", form.supabaseAnonKey);
    automationService.setMode(form.automationMode);
    onSaveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Settings className="w-4 h-4" />
            Configurações do Sistema & Integrações
          </span>
          <h1 className="text-3xl font-black text-zinc-100 mt-1 uppercase tracking-tight">
            Supabase, IA & Preferências
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure seu banco de dados PostgreSQL Supabase, chaves de API, modos de automação e regras editoriais.
          </p>
        </div>

        {saved && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            Configurações Salvas com Sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. SUPABASE DATABASE CONFIGURATION */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                  Banco de Dados Supabase (PostgreSQL + RLS)
                </h2>
                <p className="text-xs text-zinc-400">
                  Armazenamento persistente de 14 tabelas, filas de jobs e métricas históricas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSchemaModal(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                Ver Schema SQL
              </button>
              <button
                type="button"
                onClick={handleCopySchema}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSchema ? "Copiado!" : "Copiar DDL SQL"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={form.supabaseUrl || ""}
                onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1.5">
                Supabase Anon Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={form.supabaseAnonKey || ""}
                onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={testingSupabase}
              onClick={handleTestSupabase}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              {testingSupabase ? "Testando Conexão..." : "Testar Conexão Supabase"}
            </button>

            {supabaseStatus && (
              <span
                className={`text-xs font-bold ${
                  supabaseStatus.success ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {supabaseStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* 2. AUTOMATION & PUBLISHING BEHAVIOR */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Modo de Operação da Engine
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "manual", title: "Manual", desc: "Aprovação ponto a ponto de cada copy e thumb" },
              { id: "semiauto", title: "Semiautomático", desc: "IA processa tudo e aguarda revisão final" },
              { id: "auto", title: "100% Automático", desc: "Execução direta do Drive ao Calendário (6x/dia)" },
            ].map((m) => (
              <label
                key={m.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                  form.automationMode === m.id
                    ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-100 uppercase">{m.title}</span>
                  <input
                    type="radio"
                    name="automationMode"
                    value={m.id}
                    checked={form.automationMode === m.id}
                    onChange={() => setForm({ ...form, automationMode: m.id as AutomationMode })}
                    className="accent-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 leading-snug">{m.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. PROFILE & FREQUENCY */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
            Identidade do Perfil & Meta de Postagem
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1.5">
                Nome do Canal
              </label>
              <input
                type="text"
                value={form.channelName}
                onChange={(e) => setForm({ ...form, channelName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1.5">
                Handle Oficial (@)
              </label>
              <input
                type="text"
                value={form.channelHandle || "@categoriafilmes"}
                onChange={(e) => setForm({ ...form, channelHandle: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1.5">
                Meta Diária de Vídeos
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.dailyTargetVideos || 6}
                onChange={(e) =>
                  setForm({ ...form, dailyTargetVideos: parseInt(e.target.value) || 6 })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase block mb-1.5">
              Nível Padrão de Spoiler
            </label>
            <div className="flex gap-2">
              {(["zero", "baixo", "medio", "alto"] as SpoilerLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setForm({ ...form, spoilerLevel: lvl })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    form.spoilerLevel === lvl
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. AI SECURITY INFO & DEMO RESET */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">
              Restaurar Base Inicial de Demonstração
            </span>
            <span className="text-[11px] text-zinc-400">
              Recarrega o acervo de cenas com Breaking Bad, Interestelar, Coringa e Severance.
            </span>
          </div>

          <button
            type="button"
            onClick={onResetDatabase}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            Restaurar Base Demo
          </button>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4 fill-zinc-950" />
          Salvar Todas as Configurações
        </button>
      </form>

      {/* SCHEMA MODAL */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase text-zinc-100">
                  Schema SQL Completo Supabase (14 Tabelas + RLS)
                </h3>
              </div>
              <button
                onClick={() => setShowSchemaModal(false)}
                className="text-zinc-400 hover:text-zinc-100 text-sm font-bold cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-zinc-950 font-mono text-xs text-zinc-300">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Copie e cole este script no <strong>SQL Editor</strong> do seu painel Supabase.
              </span>
              <button
                onClick={handleCopySchema}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg"
              >
                {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSchema ? "Copiado com Sucesso!" : "Copiar SQL Completo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
