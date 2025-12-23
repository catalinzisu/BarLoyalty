import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  lastTransaction: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  ngOnInit(): void {
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
      console.log('[Dashboard] No currentUser found in localStorage, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    let userId: number;
    try {
      const currentUser = JSON.parse(currentUserJson);
      userId = currentUser.id;
      console.log('[Dashboard] Retrieved userId from currentUser:', userId);
    } catch (error) {
      console.error('[Dashboard] Error parsing currentUser:', error);
      this.router.navigate(['/login']);
      return;
    }

    console.log('[Dashboard] Fetching real balance from database for userId:', userId);
    this.http.get<any>(`http://localhost:8080/api/users/${userId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[Dashboard] Balance fetched from database:', response.pointsBalance);
          this.pointsBalance = response.pointsBalance;
          this.apiService.setPointsBalance(response.pointsBalance);
          console.log('[Dashboard] Balance synchronized from database:', this.pointsBalance);
        },
        error: (error) => {
          console.error('[Dashboard] Failed to fetch balance from database:', error.status, error.message);
          this.errorMessage = 'Failed to sync balance. Please refresh or login again.';
        }
      });

    this.apiService.pointsBalance$
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        console.log('[Dashboard] WebSocket balance update received:', balance);
        this.pointsBalance = balance;
      });

    this.loadDashboardData(userId);
  }

  private loadDashboardData(userId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getBars()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bars) => {
          this.bars = bars;
          console.log('[Dashboard] Bars loaded successfully, connecting to WebSocket');
          
          this.apiService.connectWebSocket(userId);
          
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load bars. Please refresh the page.';
          console.error('[Dashboard] Error loading bars:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.apiService.disconnectWebSocket();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
        console.log('[Dashboard] User loaded from localStorage:', this.user?.username);
      } catch (error) {
        console.error('[Dashboard] Error parsing user from localStorage:', error);
      }
    }
  }

  onPayClick(bar: Bar): void {
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
      this.errorMessage = 'User not found. Please login again.';
      return;
    }

    let userId: number;
    try {
      const currentUser = JSON.parse(currentUserJson);
      userId = currentUser.id;
    } catch (error) {
      console.error('[Dashboard] Error parsing currentUser:', error);
      this.errorMessage = 'User not found. Please login again.';
      return;
    }

    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';

    const transactionRequest: TransactionRequest = {
      userId: userId,
      barId: bar.id,
      amount: 50
    };

    this.apiService.createTransaction(transactionRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          this.lastTransaction = response;
          console.log('[Dashboard] Transaction completed, awaiting WebSocket balance update');
          
        },
        error: (error) => {
          this.isProcessing = false;
          this.errorMessage = error.error?.message || 'Payment failed. Please try again.';
          console.error('[Dashboard] Payment error:', error);
        }
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.apiService.disconnectWebSocket();
    this.router.navigate(['/login']);
  }
}
