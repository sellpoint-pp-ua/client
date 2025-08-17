export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export type AuthResponse = { token: string } | string;

export interface AuthError {
  message: string;
} 