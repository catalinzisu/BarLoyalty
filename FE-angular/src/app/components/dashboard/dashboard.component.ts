import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Bar, User, TransactionRequest, Reward } from '../../models';
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
  selectedReward: Reward | null = null;

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

    // Fetch fresh balance from database
    console.log('[Dashboard] Fetching fresh user data from database for userId:', userId);
    this.apiService.getCurrentUserProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userProfile) => {
          console.log('[Dashboard] User profile fetched from database:', userProfile);
          console.log('[Dashboard] Points balance from DB:', userProfile.pointsBalance);
          
          // Update local balance
          this.pointsBalance = userProfile.pointsBalance;
          
          // Sync balance with ApiService signal/subject
          this.apiService.setPointsBalance(userProfile.pointsBalance);
          
          console.log('[Dashboard] Balance synchronized from database:', this.pointsBalance);
        },
        error: (error) => {
          // CRITICAL: Just log the error, do NOT logout or redirect
          // This prevents users from being kicked out on temporary glitches
          console.error('[Dashboard] Failed to fetch user profile from database');
          console.error('[Dashboard] Error status:', error.status);
          console.error('[Dashboard] Error statusText:', error.statusText);
          console.error('[Dashboard] Error message:', error.message);
          console.error('[Dashboard] Full error:', error);
          
          // Log the issue but let the app continue working with cached balance
          console.warn('[Dashboard] Continuing with cached balance data. Balance may not be up-to-date.');
          console.warn('[Dashboard] The app is continuing to work, but balance sync failed.');
        }
      });

    // Subscribe to WebSocket balance updates
    this.apiService.pointsBalance$
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        console.log('[Dashboard] WebSocket balance update received:', balance);
        this.pointsBalance = balance;
      });

    // Load dashboard data (bars list)
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

  onRedeemReward(bar: Bar, reward: Reward): void {
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
      this.errorMessage = 'User not found. Please login again.';
      return;
    }

    if (this.pointsBalance < reward.pointsCost) {
      this.errorMessage = `You need ${reward.pointsCost - this.pointsBalance} more points to redeem this reward.`;
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
    this.selectedReward = reward;
    this.successMessage = '';
    this.errorMessage = '';

    console.log('[Dashboard] Redeeming reward:', reward.name, 'for user:', userId);

    // TODO: Call backend API to redeem the reward
    // This would be something like: this.apiService.redeemReward(userId, reward.id)
    // For now, we'll just simulate the redemption
    setTimeout(() => {
      this.isProcessing = false;
      this.selectedReward = null;
      this.pointsBalance -= reward.pointsCost;
      this.successMessage = `Successfully redeemed ${reward.name}!`;
      this.apiService.setPointsBalance(this.pointsBalance);
      console.log('[Dashboard] Reward redeemed successfully');
    }, 1000);
  }

  onLogout(): void {
    this.authService.logout();
    this.apiService.disconnectWebSocket();
    this.router.navigate(['/login']);
  }
}
