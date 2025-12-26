export interface User {
  id: number;
  username: string;
  pointsBalance: number;
}

export interface Reward {
  id: number;
  name: string;
  pointsCost: number;
}

export interface Bar {
  id: number;
  name: string;
  rewards?: Reward[];
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
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}
