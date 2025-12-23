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

  private stompClient: Client | null = null;

  pointsBalance = signal<number>(0);

  private pointsBalanceSubject = new BehaviorSubject<number>(0);
  pointsBalance$ = this.pointsBalanceSubject.asObservable();

  private webSocketConnectedSubject = new Subject<boolean>();
  webSocketConnected$ = this.webSocketConnectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, request);
  }

  getCurrentUserProfile(userId: number): Observable<User> {
    const url = `${this.API_BASE_URL}/users/${userId}`;
    console.log('Fetching user profile from:', url);
    console.log('Token available:', !!localStorage.getItem('token'));
    console.log('Credentials available:', !!localStorage.getItem('credentials'));
    return this.http.get<User>(url);
  }

  getBars(): Observable<Bar[]> {
    return this.http.get<Bar[]>(`${this.API_BASE_URL}/bars`);
  }

  createTransaction(request: TransactionRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/transactions`, request);
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
