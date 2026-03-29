import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Report, TrendPoint } from '../models/report.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  constructor(private readonly http: HttpClient) {}

  async getWeekly(date: string): Promise<Report> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Report>>(`${this.baseUrl}/weekly`, {
        params: { date },
      }),
    );
    return res.data;
  }

  async getMonthly(month: number, year: number): Promise<Report> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Report>>(`${this.baseUrl}/monthly`, {
        params: { month: month.toString(), year: year.toString() },
      }),
    );
    return res.data;
  }

  async getTrend(from: string, to: string): Promise<TrendPoint[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<TrendPoint[]>>(`${this.baseUrl}/trend`, {
        params: { from, to },
      }),
    );
    return res.data;
  }
}
