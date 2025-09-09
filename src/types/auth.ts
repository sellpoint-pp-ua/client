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
  errors?: Record<string, string[]>;
  type?: string;
  title?: string;
  status?: number;
  traceId?: string;
}

export interface ForgotPasswordRequest {
  login: string;
}

export interface VerifyResetCodeRequest {
  resetToken: string;
  code: string;
}

export interface ResetPasswordRequest {
  password: string;
  accessCode: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  resetToken?: string;
  accessCode?: string;
} 