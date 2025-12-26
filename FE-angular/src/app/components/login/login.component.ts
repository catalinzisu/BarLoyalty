import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('[Login] Login successful for user:', this.username);
        console.log('[Login] Response structure:', response);
        
        this.authService.storeCredentials(
          response.userId,
          this.username,
          this.password,
          response.token
        );

        // Store full user info from response
        const userInfo = {
          id: response.userId,
          username: response.username,
          email: response.email,
          role: response.role
        };
        localStorage.setItem('user', JSON.stringify(userInfo));

        console.log('[Login] Credentials stored, redirecting to dashboard');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        console.error('[Login] Login error:', error);
      }
    });
  }
}
