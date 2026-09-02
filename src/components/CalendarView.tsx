import React, { useState } from "react";
import { VideoItem } from "../types";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Film,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

interface CalendarViewProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  videos,
  onSelectVideo,
}) => {
  const [selectedDate, setSelectedDate] = useState("2026-09-01");

  const scheduleSlots = [
    { period: "Manhã", time: "08:30", icon: Sun, video: videos[0] },
    { period: "Manhã", time: "11:30", icon: Sun, video: videos[1] },
    { period: "Tarde", time: "14:00", icon: Sunset, video: videos[2] },
    { period: "Tarde", time: "17:30", icon: Sunset, video: videos[3] },
    { period: "Noite", time: "19:30", icon: Moon, video: videos[4] },
    { period: "Noite", time: "21:45", icon: Moon, video: videos[5] },
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            Grade Diária de Distribuição
          </span>
          <h1 className="text-3xl font-black text-neutral-100 mt-1 uppercase tracking-tight">
            Calendário de Publicação (6 Vídeos / Dia)
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Distribuição ideal: 2 Manhã (08:30 / 11:30), 2 Tarde (14:00 / 17:30), 2 Noite (19:30 / 21:45).
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5">
          <button className="p-1.5 text-neutral-400 hover:text-neutral-100 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-neutral-200 px-3">
            01 de Setembro de 2026 (Hoje)
          </span>
          <button className="p-1.5 text-neutral-400 hover:text-neutral-100 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Time Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduleSlots.map((slot, index) => {
          const Icon = slot.icon;
          const video = slot.video;

          return (
            <div
              key={index}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400 uppercase flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  {slot.period} — Slot {index + 1}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-neutral-950 font-mono text-xs font-bold text-neutral-200 border border-neutral-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  {slot.time}
                </span>
              </div>

              {/* Slot Content */}
              {video ? (
                <div
                  onClick={() => onSelectVideo(video)}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/40 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-400">
                      {video.serialId}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pronto
                    </span>
                  </div>

                  <span className="text-xs font-bold text-neutral-100 block truncate">
                    {video.workName}
                  </span>

                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    "{video.package?.selectedHook || video.sceneDescription}"
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-400">
                  <span>Slot Vago</span>
                </div>
              )}

              {/* Slot Footer */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                <span>Programação automática</span>
                <span className="text-amber-400 font-bold">Slot #{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
