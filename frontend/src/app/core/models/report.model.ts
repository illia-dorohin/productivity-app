export interface GroupScore {
  readonly metricId: string;
  readonly name: string;
  readonly slug: string;
  readonly average: number;
  readonly count: number;
}

export interface Report {
  readonly overall: number | null;
  readonly groups: readonly GroupScore[];
  readonly metrics: readonly GroupScore[];
  readonly daysWithData: number;
  readonly totalDays: number;
}

export interface TrendPoint {
  readonly date: string;
  readonly overall: number | null;
  readonly groups: Record<string, number | null>;
}
