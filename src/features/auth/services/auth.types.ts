

import { UserRole } from '../../../constants/auth.constants';

// ── Request ────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

// ── Response ───────────────────────────────────────────────

export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  unit: string;   // Đơn vị công tác (tỉnh/huyện/xã)
  avatarUrl?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // seconds
  user: AuthUser;
}


export interface ApiError {
  code: string;
  message: string;
}
