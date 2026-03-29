import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<User | null>(null);
  private readonly loading = signal(true);

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isLoading = this.loading.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async handleCallback(token: string): Promise<void> {
    localStorage.setItem(TOKEN_KEY, token);
    await this.loadProfile();
    await this.router.navigate(['/']);
  }

  async loadProfile(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.loading.set(false);
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`),
      );
      this.user.set(response.data);
    } catch {
      this.logout();
    } finally {
      this.loading.set(false);
    }
  }

  login(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
