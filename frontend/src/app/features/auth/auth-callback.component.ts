import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  template: `
    <div class="callback-page">
      <div class="spinner"></div>
      <p>Signing you in...</p>
    </div>
  `,
  styles: `
    @use '../../../styles/variables' as *;

    .callback-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      gap: 16px;
      color: $text-secondary;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(0, 122, 255, 0.12);
      border-top-color: #007aff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.handleCallback(token);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
