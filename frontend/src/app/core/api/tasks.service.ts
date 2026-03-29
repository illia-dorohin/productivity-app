import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Task } from '../models/task.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  async getAll(filters?: {
    status?: string;
    priority?: string;
    tag?: string;
  }): Promise<Task[]> {
    const params: Record<string, string> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.priority) params['priority'] = filters.priority;
    if (filters?.tag) params['tag'] = filters.tag;

    const res = await firstValueFrom(
      this.http.get<ApiResponse<Task[]>>(this.baseUrl, { params }),
    );
    return res.data;
  }

  async create(task: Partial<Task>): Promise<Task> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Task>>(this.baseUrl, task),
    );
    return res.data;
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const res = await firstValueFrom(
      this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/${id}`, data),
    );
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`),
    );
  }

  async reorder(items: Array<{ id: string; order: number }>): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<null>>(`${this.baseUrl}/reorder`, { items }),
    );
  }
}
