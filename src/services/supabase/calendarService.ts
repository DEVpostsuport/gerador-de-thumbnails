import { CalendarDay, VideoItem, PlatformType } from "../../types";
import { getSupabaseClient } from "./supabaseClient";
import { videoService } from "./videoService";

const CALENDAR_CACHE_KEY = "cf_content_calendar_cache";

class CalendarService {
  private scheduledSlots: Record<string, { videoId: string; platform: PlatformType; time: string; period: "manha" | "tarde" | "noite"; slotIndex: number }> = {};

  constructor() {
    this.loadCached();
  }

  private loadCached() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(CALENDAR_CACHE_KEY);
        if (raw) {
          this.scheduledSlots = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Erro ao carregar calendário:", err);
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(this.scheduledSlots));
      } catch (err) {
        console.warn("Storage quota:", err);
      }
    }
  }

  public getDays(startDate: Date = new Date(), numDays = 7): CalendarDay[] {
    const days: CalendarDay[] = [];
    const allVideos = videoService.getAll();
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = dayNames[d.getDay()];

      // 2 morning slots (08:30, 11:30), 2 afternoon slots (14:00, 17:30), 2 night slots (19:30, 21:45)
      const morningSlots: (VideoItem | null)[] = [
        this.getVideoForSlot(dateStr, "manha", 0, allVideos),
        this.getVideoForSlot(dateStr, "manha", 1, allVideos),
      ];

      const afternoonSlots: (VideoItem | null)[] = [
        this.getVideoForSlot(dateStr, "tarde", 0, allVideos),
        this.getVideoForSlot(dateStr, "tarde", 1, allVideos),
      ];

      const nightSlots: (VideoItem | null)[] = [
        this.getVideoForSlot(dateStr, "noite", 0, allVideos),
        this.getVideoForSlot(dateStr, "noite", 1, allVideos),
      ];

      days.push({
        date: dateStr,
        dayOfWeek,
        morningSlots,
        afternoonSlots,
        nightSlots,
      });
    }

    return days;
  }

  private getVideoForSlot(
    date: string,
    period: "manha" | "tarde" | "noite",
    slotIndex: number,
    allVideos: VideoItem[]
  ): VideoItem | null {
    const key = `${date}_${period}_${slotIndex}`;
    const scheduled = this.scheduledSlots[key];
    if (scheduled) {
      return allVideos.find((v) => v.id === scheduled.videoId) || null;
    }
    // Also check directly on video object
    return (
      allVideos.find(
        (v) =>
          v.scheduledSlot?.date === date &&
          v.scheduledSlot?.period === period &&
          v.scheduledSlot?.slotIndex === slotIndex
      ) || null
    );
  }

  public async scheduleVideo(
    videoId: string,
    date: string,
    period: "manha" | "tarde" | "noite",
    slotIndex: number,
    time: string,
    platform: PlatformType = "instagram"
  ) {
    const key = `${date}_${period}_${slotIndex}`;
    this.scheduledSlots[key] = { videoId, platform, time, period, slotIndex };
    this.save();

    await videoService.updateVideo(videoId, {
      pipelineStage: "SCHEDULED",
      scheduledSlot: { date, time, period, slotIndex },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("content_calendar").upsert({
          video_id: videoId,
          platform,
          scheduled_at: `${date}T${time}:00Z`,
          slot_period: period,
          slot_index: slotIndex,
          status: "scheduled",
        });
      } catch (err) {
        console.warn("[Supabase] Calendar schedule error:", err);
      }
    }
  }

  public async unscheduleSlot(date: string, period: "manha" | "tarde" | "noite", slotIndex: number) {
    const key = `${date}_${period}_${slotIndex}`;
    const current = this.scheduledSlots[key];
    if (current) {
      delete this.scheduledSlots[key];
      this.save();
      await videoService.updateVideo(current.videoId, {
        pipelineStage: "READY",
        scheduledSlot: undefined,
      });
    }
  }

  public async autoFillCalendar(videosToSchedule: VideoItem[]) {
    const today = new Date();
    const times = {
      manha: ["08:30", "11:30"],
      tarde: ["14:00", "17:30"],
      noite: ["19:30", "21:45"],
    };

    let videoIdx = 0;
    for (let dayOffset = 0; dayOffset < 7 && videoIdx < videosToSchedule.length; dayOffset++) {
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split("T")[0];

      const periods: ("manha" | "tarde" | "noite")[] = ["manha", "tarde", "noite"];
      for (const period of periods) {
        for (let slotIndex = 0; slotIndex < 2 && videoIdx < videosToSchedule.length; slotIndex++) {
          const key = `${dateStr}_${period}_${slotIndex}`;
          if (!this.scheduledSlots[key]) {
            const v = videosToSchedule[videoIdx];
            const time = times[period][slotIndex];
            await this.scheduleVideo(v.id, dateStr, period, slotIndex, time);
            videoIdx++;
          }
        }
      }
    }
  }
}

export const calendarService = new CalendarService();
