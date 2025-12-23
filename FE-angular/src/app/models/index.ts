/**
 * User Model
 */
export interface User {
  id: number;
  username: string;
  pointsBalance: number;
}

/**
 * Bar Model
 */
export interface Bar {
  id: number;
  name: string;
}

/**
 * Transaction Request Model
 */
export interface TransactionRequest {
  userId: number;
  barId: number;
  amount: number;
}

/**
 * Login Request Model
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login Response Model
 */
export interface LoginResponse {
  user: User;
  token: string;
}
