import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Bar, User, TransactionRequest } from '../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  bars: Bar[] = [];
  pointsBalance: number = 0;
  isLoading: boolean = true;
  isProcessing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to real-time points updates
    this.apiService.pointsBalance$
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        this.pointsBalance = balance;
      });

    // Load initial data
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.apiService.disconnectWebSocket();
  }

  /**
   * Load user data from localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
        this.pointsBalance = this.user?.pointsBalance || 0;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }

  /**
   * Load dashboard data (bars and connect WebSocket)
   */
  private loadDashboardData(): void {
    if (!this.user) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Fetch bars
    this.apiService.getBars()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bars) => {
          this.bars = bars;
          
          // Set initial points balance from user
          this.apiService.setPointsBalance(this.user!.pointsBalance);
          
          // Connect to WebSocket for real-time updates
          this.apiService.connectWebSocket(this.user!.id);
          
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load bars. Please refresh the page.';
          console.error('Error loading bars:', error);
        }
      });
  }

  /**
   * Process payment/transaction
   */
  onPayClick(bar: Bar): void {
    if (!this.user) {
      this.errorMessage = 'User not found. Please login again.';
      return;
    }

    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';

    const transactionRequest: TransactionRequest = {
      userId: this.user.id,
      barId: bar.id,
      amount: 50 // RON
    };

    this.apiService.createTransaction(transactionRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          this.successMessage = `Payment of 50 RON at ${bar.name} successful!`;
          
          // Points will be updated via WebSocket, but we can also update locally
          if (response.newBalance !== undefined) {
            this.pointsBalance = response.newBalance;
          }

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.isProcessing = false;
          this.errorMessage = error.error?.message || 'Payment failed. Please try again.';
          console.error('Payment error:', error);
        }
      });
  }

  /**
   * Logout user
   */
  onLogout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.apiService.disconnectWebSocket();
    this.router.navigate(['/login']);
  }
}
