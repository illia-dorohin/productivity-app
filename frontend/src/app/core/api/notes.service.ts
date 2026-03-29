import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Note } from '../models/note.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotesApiService {
  private readonly baseUrl = `${environment.apiUrl}/notes`;

  constructor(private readonly http: HttpClient) {}

  async getAll(filters?: {
    from?: string;
    to?: string;
    tag?: string;
  }): Promise<Note[]> {
    const params: Record<string, string> = {};
    if (filters?.from) params['from'] = filters.from;
    if (filters?.to) params['to'] = filters.to;
    if (filters?.tag) params['tag'] = filters.tag;

    const res = await firstValueFrom(
      this.http.get<ApiResponse<Note[]>>(this.baseUrl, { params }),
    );
    return res.data;
  }

  async create(note: { text: string; date: string; tags?: string[] }): Promise<Note> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Note>>(this.baseUrl, note),
    );
    return res.data;
  }

  async update(id: string, data: Partial<Note>): Promise<Note> {
    const res = await firstValueFrom(
      this.http.patch<ApiResponse<Note>>(`${this.baseUrl}/${id}`, data),
    );
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`),
    );
  }
}
