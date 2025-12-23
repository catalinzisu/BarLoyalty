import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { User, Bar, TransactionRequest, LoginRequest, LoginResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';
  private readonly WS_URL = 'http://localhost:8080/ws';

  // WebSocket client
  private stompClient: Client | null = null;

  // Signals for reactive updates
  pointsBalance = signal<number>(0);

  // Observables for component subscriptions
  private pointsBalanceSubject = new BehaviorSubject<number>(0);
  pointsBalance$ = this.pointsBalanceSubject.asObservable();

  private webSocketConnectedSubject = new Subject<boolean>();
  webSocketConnected$ = this.webSocketConnectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login user with credentials
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, request);
  }

  /**
   * Get all bars
   */
  getBars(): Observable<Bar[]> {
    return this.http.get<Bar[]>(`${this.API_BASE_URL}/bars`);
  }

  /**
   * Create a transaction (payment)
   */
  createTransaction(request: TransactionRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/transactions`, request);
  }

  /**
   * Connect to WebSocket for real-time points updates
   */
  connectWebSocket(userId: number): void {
    if (this.stompClient && this.stompClient.active) {
      console.log('WebSocket already connected');
      return;
    }

    // Create WebSocket connection using SockJS
    const socket = new SockJS(this.WS_URL);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => this.onWebSocketConnect(userId),
      onDisconnect: () => this.onWebSocketDisconnect(),
      onStompError: (error) => this.onWebSocketError(error)
    });

    this.stompClient.activate();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  /**
   * Handle successful WebSocket connection
   */
  private onWebSocketConnect(userId: number): void {
    console.log('WebSocket connected');
    this.webSocketConnectedSubject.next(true);

    // Subscribe to user-specific points updates topic
    if (this.stompClient) {
      this.stompClient.subscribe(
        `/topic/points/${userId}`,
        (message) => this.onPointsUpdate(message)
      );
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private onWebSocketDisconnect(): void {
    console.log('WebSocket disconnected');
    this.webSocketConnectedSubject.next(false);
  }

  /**
   * Handle WebSocket errors
   */
  private onWebSocketError(error: any): void {
    console.error('WebSocket error:', error);
    this.webSocketConnectedSubject.next(false);
  }

  /**
   * Handle incoming points update from WebSocket
   */
  private onPointsUpdate(message: any): void {
    try {
      const body = JSON.parse(message.body);
      const newBalance = body.pointsBalance || body.balance || 0;
      
      // Update both signal and observable
      this.pointsBalance.set(newBalance);
      this.pointsBalanceSubject.next(newBalance);
      
      console.log('Points updated:', newBalance);
    } catch (error) {
      console.error('Error parsing points update:', error);
    }
  }

  /**
   * Get current points balance (from signal)
   */
  getCurrentPointsBalance(): number {
    return this.pointsBalance();
  }

  /**
   * Set points balance manually (useful for initialization)
   */
  setPointsBalance(balance: number): void {
    this.pointsBalance.set(balance);
    this.pointsBalanceSubject.next(balance);
  }
}
