export interface Score {
  readonly metricId: string;
  readonly value: number;
}

export interface Rating {
  readonly _id: string;
  readonly date: string;
  readonly scores: readonly Score[];
}
