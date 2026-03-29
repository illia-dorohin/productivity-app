import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetricsApiService } from '../../core/api/metrics.service';
import { AuthService } from '../../core/auth/auth.service';
import { Metric } from '../../core/models/metric.model';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly metricsApi = inject(MetricsApiService);
  private readonly authService = inject(AuthService);

  readonly metrics = signal<Metric[]>([]);
  readonly loading = signal(true);
  readonly showAddForm = signal(false);

  readonly user = this.authService.currentUser;

  newName = '';
  newSlug = '';
  newType: 'group' | 'rating' = 'rating';
  newParentId = '';

  ngOnInit(): void {
    this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.metricsApi.getTree();
      this.metrics.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async addMetric(): Promise<void> {
    if (!this.newName.trim() || !this.newSlug.trim()) return;

    await this.metricsApi.create({
      name: this.newName.trim(),
      slug: this.newSlug.trim(),
      type: this.newType,
      ...(this.newParentId ? { parentId: this.newParentId } : {}),
    } as Partial<Metric> & { parentId?: string });

    this.resetForm();
    await this.loadMetrics();
  }

  async deleteMetric(id: string): Promise<void> {
    await this.metricsApi.delete(id);
    await this.loadMetrics();
  }

  toggleForm(): void {
    this.showAddForm.update((v) => !v);
  }

  generateSlug(): void {
    this.newSlug = this.newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  flatGroups(): Array<{ id: string; name: string }> {
    const result: Array<{ id: string; name: string }> = [];
    const collect = (nodes: Metric[], prefix = ''): void => {
      for (const node of nodes) {
        if (node.type === 'group') {
          result.push({
            id: node._id,
            name: prefix ? `${prefix} > ${node.name}` : node.name,
          });
          collect(node.children, node.name);
        }
      }
    };
    collect(this.metrics());
    return result;
  }

  logout(): void {
    this.authService.logout();
  }

  private resetForm(): void {
    this.newName = '';
    this.newSlug = '';
    this.newType = 'rating';
    this.newParentId = '';
    this.showAddForm.set(false);
  }
}
