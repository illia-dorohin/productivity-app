import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Metric } from '../models/metric.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MetricsApiService {
  private readonly baseUrl = `${environment.apiUrl}/metrics`;

  constructor(private readonly http: HttpClient) {}

  async getTree(): Promise<Metric[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Metric[]>>(this.baseUrl),
    );
    return res.data;
  }

  async create(metric: Partial<Metric>): Promise<Metric> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Metric>>(this.baseUrl, metric),
    );
    return res.data;
  }

  async update(id: string, data: Partial<Metric>): Promise<Metric> {
    const res = await firstValueFrom(
      this.http.patch<ApiResponse<Metric>>(`${this.baseUrl}/${id}`, data),
    );
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`),
    );
  }

  async seed(): Promise<Metric[]> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Metric[]>>(`${this.baseUrl}/seed`, {}),
    );
    return res.data;
  }

  async reorder(
    items: Array<{ id: string; order: number; parentId?: string | null }>,
  ): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<null>>(`${this.baseUrl}/reorder`, { items }),
    );
  }
}
