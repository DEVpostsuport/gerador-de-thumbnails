export interface CostMetrics {
  totalCalls: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  estimatedCostUSD: number;
  modelBreakdown: Record<string, { calls: number; tokens: number }>;
  stageBreakdown: Record<string, { calls: number; tokens: number }>;
}

const COST_STORAGE_KEY = "cf_ai_cost_telemetry";

class CostService {
  private metrics: CostMetrics = {
    totalCalls: 0,
    totalTokensInput: 0,
    totalTokensOutput: 0,
    estimatedCostUSD: 0,
    modelBreakdown: {},
    stageBreakdown: {},
  };

  constructor() {
    this.loadCached();
  }

  private loadCached() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(COST_STORAGE_KEY);
        if (raw) {
          this.metrics = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Erro ao carregar telemetria de custos:", err);
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(this.metrics));
      } catch (err) {
        console.warn("Storage quota:", err);
      }
    }
  }

  public recordUsage(params: {
    model: string;
    stage: string;
    tokensInput?: number;
    tokensOutput?: number;
  }) {
    const input = params.tokensInput || 250;
    const output = params.tokensOutput || 400;
    const total = input + output;

    this.metrics.totalCalls += 1;
    this.metrics.totalTokensInput += input;
    this.metrics.totalTokensOutput += output;

    // Gemini 2.5/3.0 Flash estimated price: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
    const cost = (input / 1_000_000) * 0.075 + (output / 1_000_000) * 0.30;
    this.metrics.estimatedCostUSD += cost;

    // Model breakdown
    if (!this.metrics.modelBreakdown[params.model]) {
      this.metrics.modelBreakdown[params.model] = { calls: 0, tokens: 0 };
    }
    this.metrics.modelBreakdown[params.model].calls += 1;
    this.metrics.modelBreakdown[params.model].tokens += total;

    // Stage breakdown
    if (!this.metrics.stageBreakdown[params.stage]) {
      this.metrics.stageBreakdown[params.stage] = { calls: 0, tokens: 0 };
    }
    this.metrics.stageBreakdown[params.stage].calls += 1;
    this.metrics.stageBreakdown[params.stage].tokens += total;

    this.save();
  }

  public getMetrics(): CostMetrics {
    return { ...this.metrics };
  }

  public resetMetrics() {
    this.metrics = {
      totalCalls: 0,
      totalTokensInput: 0,
      totalTokensOutput: 0,
      estimatedCostUSD: 0,
      modelBreakdown: {},
      stageBreakdown: {},
    };
    this.save();
  }
}

export const costService = new CostService();
