import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReportsApiService } from '../../core/api/reports.service';
import { Report } from '../../core/models/report.model';

type ReportType = 'weekly' | 'monthly';

@Component({
  selector: 'app-reports',
  imports: [DecimalPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly reportsApi = inject(ReportsApiService);

  readonly reportType = signal<ReportType>('weekly');
  readonly report = signal<Report | null>(null);
  readonly loading = signal(true);
  readonly selectedDate = signal(this.todayString());
  readonly selectedMonth = signal(new Date().getMonth() + 1);
  readonly selectedYear = signal(new Date().getFullYear());

  readonly monthLabel = computed(() => {
    const date = new Date(this.selectedYear(), this.selectedMonth() - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  ngOnInit(): void {
    this.loadReport();
  }

  async loadReport(): Promise<void> {
    this.loading.set(true);
    try {
      if (this.reportType() === 'weekly') {
        const data = await this.reportsApi.getWeekly(this.selectedDate());
        this.report.set(data);
      } else {
        const data = await this.reportsApi.getMonthly(
          this.selectedMonth(),
          this.selectedYear(),
        );
        this.report.set(data);
      }
    } finally {
      this.loading.set(false);
    }
  }

  setReportType(type: ReportType): void {
    this.reportType.set(type);
    this.loadReport();
  }

  navigateWeek(offset: number): void {
    const d = new Date(this.selectedDate() + 'T12:00:00');
    d.setDate(d.getDate() + offset * 7);
    this.selectedDate.set(this.formatDate(d));
    this.loadReport();
  }

  navigateMonth(offset: number): void {
    let m = this.selectedMonth() + offset;
    let y = this.selectedYear();
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    this.selectedMonth.set(m);
    this.selectedYear.set(y);
    this.loadReport();
  }

  getScoreColor(value: number | null): string {
    if (value === null || value === 0) return '';
    const rounded = Math.round(value);
    const colors: Record<number, string> = {
      1: '#FF3B30', 2: '#FF9500', 3: '#FFCC00', 4: '#34C759', 5: '#30D158',
    };
    return colors[rounded] ?? '';
  }

  getBarWidth(value: number): string {
    return `${(value / 5) * 100}%`;
  }

  private todayString(): string {
    return this.formatDate(new Date());
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
