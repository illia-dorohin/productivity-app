import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Rating, Score } from '../models/rating.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RatingsApiService {
  private readonly baseUrl = `${environment.apiUrl}/ratings`;

  constructor(private readonly http: HttpClient) {}

  async getByDate(date: string): Promise<Rating | null> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Rating | null>>(`${this.baseUrl}/${date}`),
    );
    return res.data;
  }

  async getByDateRange(from: string, to: string): Promise<Rating[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Rating[]>>(this.baseUrl, {
        params: { from, to },
      }),
    );
    return res.data;
  }

  async upsert(date: string, scores: readonly Score[]): Promise<Rating> {
    const res = await firstValueFrom(
      this.http.put<ApiResponse<Rating>>(`${this.baseUrl}/${date}`, {
        scores,
      }),
    );
    return res.data;
  }
}
