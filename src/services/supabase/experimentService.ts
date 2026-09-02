import { ExperimentEntity } from "../../types";
import { getSupabaseClient } from "./supabaseClient";

const EXP_STORAGE_KEY = "cf_experiments_cache";

class ExperimentService {
  private experiments: ExperimentEntity[] = [
    {
      id: "exp_1",
      video_id: "v_sample_1",
      experiment_type: "hook_ab",
      variable: "Pergunta Provocativa vs Revelação Direta",
      variant_a: "Você teria coragem de fazer o que ele fez aqui?",
      variant_b: "O momento exato em que ele descobriu a armadilha.",
      result_a: 78.4,
      result_b: 71.2,
      winner: "variant_a",
      created_at: new Date().toISOString(),
    },
    {
      id: "exp_2",
      video_id: "v_sample_2",
      experiment_type: "thumbnail_ab",
      variable: "Badge Ouro Dourado vs Crimson Box",
      variant_a: "Gold Pill (Contraste Alto)",
      variant_b: "Crimson Box (Tensão Extrema)",
      result_a: 84.1,
      result_b: 86.8,
      winner: "variant_b",
      created_at: new Date().toISOString(),
    },
    {
      id: "exp_3",
      video_id: "v_sample_3",
      experiment_type: "time_slot_ab",
      variable: "Horário 19:30 vs 21:45",
      variant_a: "19:30 (Pico Noturno Inicial)",
      variant_b: "21:45 (Fim de Noite / Concentração)",
      result_a: 91.2,
      result_b: 82.5,
      winner: "variant_a",
      created_at: new Date().toISOString(),
    },
  ];

  constructor() {
    this.loadCached();
  }

  private loadCached() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(EXP_STORAGE_KEY);
        if (raw) this.experiments = JSON.parse(raw);
      } catch (err) {}
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(EXP_STORAGE_KEY, JSON.stringify(this.experiments));
      } catch (err) {}
    }
  }

  public getAll(): ExperimentEntity[] {
    return [...this.experiments];
  }

  public async addExperiment(exp: Omit<ExperimentEntity, "id" | "created_at">): Promise<ExperimentEntity> {
    const item: ExperimentEntity = {
      ...exp,
      id: "exp_" + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.experiments.unshift(item);
    this.save();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("experiments").insert(item);
      } catch (err) {}
    }
    return item;
  }
}

export const experimentService = new ExperimentService();
