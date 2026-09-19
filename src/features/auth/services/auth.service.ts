// ============================================================
// AUTH SERVICE
// Tất cả các lời gọi API liên quan đến xác thực
// Không chứa logic UI, chỉ giao tiếp với server
// ============================================================

import { request } from '../../../utils/http';
import { LoginRequest, LoginResponse } from './auth.types';

const AUTH_ENDPOINTS = {
  LOGIN  : '/auth/login',
  LOGOUT : '/auth/logout',
  REFRESH: '/auth/refresh-token',
} as const;

// ── Login ──────────────────────────────────────────────────

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    body  : payload,
  });
}

// ── Logout ─────────────────────────────────────────────────

export async function logoutApi(token: string): Promise<void> {
  return request<void>(AUTH_ENDPOINTS.LOGOUT, {
    method: 'POST',
    token,
  });
}

// ── Refresh Token ──────────────────────────────────────────

export async function refreshTokenApi(
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  return request(AUTH_ENDPOINTS.REFRESH, {
    method: 'POST',
    body  : { refreshToken },
  });
}
