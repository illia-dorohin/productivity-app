import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MetricsApiService } from '../../core/api/metrics.service';
import { RatingsApiService } from '../../core/api/ratings.service';
import { Metric } from '../../core/models/metric.model';
import { Score } from '../../core/models/rating.model';
import { RatingSelectorComponent } from './rating-selector.component';

@Component({
  selector: 'app-daily-rating',
  imports: [DatePipe, DecimalPipe, RatingSelectorComponent],
  templateUrl: './daily-rating.component.html',
  styleUrl: './daily-rating.component.scss',
})
export class DailyRatingComponent implements OnInit {
  private readonly metricsApi = inject(MetricsApiService);
  private readonly ratingsApi = inject(RatingsApiService);

  readonly metrics = signal<Metric[]>([]);
  readonly scores = signal<Map<string, number>>(new Map());
  readonly selectedDate = signal(this.todayString());
  readonly saving = signal(false);
  readonly loading = signal(true);

  readonly overallScore = computed(() => {
    const tree = this.metrics();
    const scoreMap = this.scores();
    if (tree.length === 0) return null;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const node of tree) {
      const avg = this.computeNodeAverage(node, scoreMap);
      if (avg !== null) {
        weightedSum += avg * node.weight;
        totalWeight += node.weight;
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  });

  readonly displayDate = computed(() => new Date(this.selectedDate() + 'T12:00:00'));

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      let tree = await this.metricsApi.getTree();
      if (tree.length === 0) {
        tree = await this.metricsApi.seed();
      }
      this.metrics.set(tree);

      const rating = await this.ratingsApi.getByDate(this.selectedDate());
      if (rating) {
        const map = new Map<string, number>();
        for (const s of rating.scores) {
          map.set(s.metricId, s.value);
        }
        this.scores.set(map);
      } else {
        this.scores.set(new Map());
      }
    } finally {
      this.loading.set(false);
    }
  }

  onScoreChange(metricId: string, value: number): void {
    const updated = new Map(this.scores());
    updated.set(metricId, value);
    this.scores.set(updated);
    this.autoSave();
  }

  async changeDate(offset: number): Promise<void> {
    const current = new Date(this.selectedDate() + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    this.selectedDate.set(this.formatDate(current));
    await this.loadData();
  }

  getGroupAverage(node: Metric): number | null {
    return this.computeNodeAverage(node, this.scores());
  }

  getScoreColor(value: number | null): string {
    if (value === null) return '';
    const rounded = Math.round(value);
    const colors: Record<number, string> = {
      1: '#FF3B30',
      2: '#FF9500',
      3: '#FFCC00',
      4: '#34C759',
      5: '#30D158',
    };
    return colors[rounded] ?? '';
  }

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  private autoSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.save(), 500);
  }

  private async save(): Promise<void> {
    this.saving.set(true);
    try {
      const scoresArray: Score[] = [];
      for (const [metricId, value] of this.scores()) {
        scoresArray.push({ metricId, value });
      }
      await this.ratingsApi.upsert(this.selectedDate(), scoresArray);
    } finally {
      this.saving.set(false);
    }
  }

  private computeNodeAverage(
    node: Metric,
    scoreMap: Map<string, number>,
  ): number | null {
    if (node.type === 'rating') {
      return scoreMap.get(node._id) ?? null;
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const child of node.children) {
      const avg = this.computeNodeAverage(child, scoreMap);
      if (avg !== null) {
        weightedSum += avg * child.weight;
        totalWeight += child.weight;
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }

  private todayString(): string {
    return this.formatDate(new Date());
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
