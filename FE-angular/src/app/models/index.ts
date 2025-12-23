export interface User {
  id: number;
  username: string;
  pointsBalance: number;
}

export interface Bar {
  id: number;
  name: string;
}

export interface TransactionRequest {
  userId: number;
  barId: number;
  amount: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
