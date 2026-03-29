import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { MetricsService } from '../metrics/metrics.service';
import { RatingsService } from '../ratings/ratings.service';

interface MetricNode {
  _id: string;
  name: string;
  slug: string;
  type: string;
  weight: number;
  children: MetricNode[];
}

interface ScoreEntry {
  metricId: Types.ObjectId;
  value: number;
}

export interface GroupScore {
  metricId: string;
  name: string;
  slug: string;
  average: number;
  count: number;
}

export interface ReportResult {
  overall: number | null;
  groups: GroupScore[];
  metrics: GroupScore[];
  daysWithData: number;
  totalDays: number;
}

export interface TrendPoint {
  date: string;
  overall: number | null;
  groups: Record<string, number | null>;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly ratingsService: RatingsService,
  ) {}

  async getWeeklyReport(userId: string, date: string): Promise<ReportResult> {
    const { start, end } = this.getWeekRange(date);
    return this.generateReport(userId, start, end);
  }

  async getMonthlyReport(
    userId: string,
    month: number,
    year: number,
  ): Promise<ReportResult> {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return this.generateReport(userId, start, end);
  }

  async getTrend(
    userId: string,
    from: string,
    to: string,
  ): Promise<TrendPoint[]> {
    const tree = await this.metricsService.getTree(userId);
    const ratings = await this.ratingsService.getByDateRange(userId, from, to);

    return ratings.map((rating) => {
      const scoreMap = new Map<string, number>();
      for (const s of rating.scores) {
        scoreMap.set(s.metricId.toString(), s.value);
      }

      const groups: Record<string, number | null> = {};
      let overallSum = 0;
      let overallWeight = 0;

      for (const node of tree) {
        const avg = this.computeNodeAverage(node, scoreMap);
        groups[node.slug] = avg;
        if (avg !== null) {
          overallSum += avg * node.weight;
          overallWeight += node.weight;
        }
      }

      return {
        date: rating.date,
        overall: overallWeight > 0 ? overallSum / overallWeight : null,
        groups,
      };
    });
  }

  private async generateReport(
    userId: string,
    from: string,
    to: string,
  ): Promise<ReportResult> {
    const tree = await this.metricsService.getTree(userId);
    const ratings = await this.ratingsService.getByDateRange(userId, from, to);

    const allMetrics = await this.metricsService.getAll(userId);
    const metricScores = new Map<string, number[]>();
    const groupScores = new Map<string, number[]>();

    for (const rating of ratings) {
      const scoreMap = new Map<string, number>();
      for (const s of rating.scores) {
        scoreMap.set(s.metricId.toString(), s.value);

        const id = s.metricId.toString();
        if (!metricScores.has(id)) metricScores.set(id, []);
        metricScores.get(id)!.push(s.value);
      }

      for (const node of tree) {
        const avg = this.computeNodeAverage(node, scoreMap);
        if (avg !== null) {
          const id = node._id;
          if (!groupScores.has(id)) groupScores.set(id, []);
          groupScores.get(id)!.push(avg);
        }
      }
    }

    const groups: GroupScore[] = tree.map((node) => {
      const scores = groupScores.get(node._id) ?? [];
      return {
        metricId: node._id,
        name: node.name,
        slug: node.slug,
        average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        count: scores.length,
      };
    });

    const metrics: GroupScore[] = allMetrics
      .filter((m) => m.type === 'rating')
      .map((m) => {
        const scores = metricScores.get(m._id.toString()) ?? [];
        return {
          metricId: m._id.toString(),
          name: m.name,
          slug: m.slug,
          average:
            scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : 0,
          count: scores.length,
        };
      });

    const groupsWithData = groups.filter((g) => g.count > 0);
    const overall =
      groupsWithData.length > 0
        ? groupsWithData.reduce((sum, g) => sum + g.average, 0) /
          groupsWithData.length
        : null;

    const totalDays = this.daysBetween(from, to);

    return {
      overall,
      groups,
      metrics,
      daysWithData: ratings.length,
      totalDays,
    };
  }

  private computeNodeAverage(
    node: MetricNode,
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

  private getWeekRange(date: string): { start: string; end: string } {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: this.formatDate(monday),
      end: this.formatDate(sunday),
    };
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private daysBetween(from: string, to: string): number {
    const start = new Date(from);
    const end = new Date(to);
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }
}
