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
  // Base URL without version - we'll handle versioning per endpoint
  private readonly API_BASE_URL = 'http://localhost:8080/api';
  private readonly WS_URL = 'http://localhost:8080/ws';

  private stompClient: Client | null = null;

  pointsBalance = signal<number>(0);

  private pointsBalanceSubject = new BehaviorSubject<number>(0);
  pointsBalance$ = this.pointsBalanceSubject.asObservable();

  private webSocketConnectedSubject = new Subject<boolean>();
  webSocketConnected$ = this.webSocketConnectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Auth endpoints use /v1
  login(request: LoginRequest): Observable<LoginResponse> {
    const url = `${this.API_BASE_URL}/v1/auth/login`;
    console.log('[ApiService] Login endpoint:', url);
    return this.http.post<LoginResponse>(url, request);
  }

  // Users endpoint uses /v1
  getCurrentUserProfile(userId: number): Observable<User> {
    const url = `${this.API_BASE_URL}/v1/users/${userId}`;
    console.log('[ApiService] Get user profile from:', url);
    console.log('[ApiService] Token available:', !!localStorage.getItem('token'));
    return this.http.get<User>(url);
  }

  // Bars endpoint does NOT use /v1
  getBars(): Observable<Bar[]> {
    const url = `${this.API_BASE_URL}/bars`;
    console.log('[ApiService] Get bars from:', url);
    return this.http.get<Bar[]>(url);
  }

  // Transactions endpoint does NOT use /v1
  createTransaction(request: TransactionRequest): Observable<any> {
    const url = `${this.API_BASE_URL}/transactions`;
    console.log('[ApiService] Create transaction at:', url);
    return this.http.post(url, request);
  }

  connectWebSocket(userId: number): void {
    if (this.stompClient && this.stompClient.active) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new SockJS(this.WS_URL);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => this.onWebSocketConnect(userId),
      onDisconnect: () => this.onWebSocketDisconnect(),
      onStompError: (error) => this.onWebSocketError(error)
    });

    this.stompClient.activate();
  }

  disconnectWebSocket(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  private onWebSocketConnect(userId: number): void {
    console.log('WebSocket connected');
    this.webSocketConnectedSubject.next(true);

    if (this.stompClient) {
      this.stompClient.subscribe(
        `/topic/points/${userId}`,
        (message) => this.onPointsUpdate(message)
      );
    }
  }

  private onWebSocketDisconnect(): void {
    console.log('WebSocket disconnected');
    this.webSocketConnectedSubject.next(false);
  }

  private onWebSocketError(error: any): void {
    console.error('WebSocket error:', error);
    this.webSocketConnectedSubject.next(false);
  }

  private onPointsUpdate(message: any): void {
    try {
      const body = JSON.parse(message.body);
      const newBalance = body.pointsBalance || body.balance || 0;
      
      this.pointsBalance.set(newBalance);
      this.pointsBalanceSubject.next(newBalance);
      
      console.log('Points updated:', newBalance);
    } catch (error) {
      console.error('Error parsing points update:', error);
    }
  }

  getCurrentPointsBalance(): number {
    return this.pointsBalance();
  }

  setPointsBalance(balance: number): void {
    this.pointsBalance.set(balance);
    this.pointsBalanceSubject.next(balance);
  }
}
