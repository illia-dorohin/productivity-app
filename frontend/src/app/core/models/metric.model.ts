export type MetricType = 'group' | 'rating';

export interface Metric {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly type: MetricType;
  readonly weight: number;
  readonly order: number;
  readonly isActive: boolean;
  readonly children: Metric[];
}
