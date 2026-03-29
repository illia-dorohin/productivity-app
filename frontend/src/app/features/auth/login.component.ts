import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1 class="login-title">Productivity</h1>
        <p class="login-subtitle">Track your daily progress and build better habits</p>
        <button class="google-btn" (click)="login()">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  `,
  styles: `
    @use '../../../styles/variables' as *;
    @use '../../../styles/mixins' as *;

    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: $space-5;
    }

    .login-card {
      @include glass-card;
      padding: $space-12 $space-8;
      text-align: center;
      max-width: 400px;
      width: 100%;
      @include fade-in;
    }

    .login-title {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $accent;
      margin-bottom: $space-3;
    }

    .login-subtitle {
      font-size: $font-size-base;
      color: $text-secondary;
      margin-bottom: $space-8;
      line-height: $line-height-normal;
    }

    .google-btn {
      display: inline-flex;
      align-items: center;
      gap: $space-3;
      padding: $space-3 $space-6;
      @include glass-card;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $text-primary;
      cursor: pointer;
      @include press-effect;
      min-height: 48px;

      &:hover {
        box-shadow: $shadow-lg;
      }
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }

    @media (prefers-color-scheme: dark) {
      .login-card { @include glass-card-dark; }
      .login-subtitle { color: $text-secondary-dark; }
      .google-btn {
        @include glass-card-dark;
        color: $text-primary-dark;
      }
    }
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  login(): void {
    this.authService.login();
  }
}
