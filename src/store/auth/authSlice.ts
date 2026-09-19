// ============================================================
// AUTH SLICE – Redux Toolkit
// Lưu trữ trạng thái xác thực toàn cục (token, user info)
// Hỗ trợ duy trì phiên khi F5 và tự động đăng xuất sau 30 phút không hoạt động
// ============================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, LoginResponse } from '../../features/auth/services/auth.types';

export const SESSION_STORAGE_KEY = 'cudan_auth_session';
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút

export interface StoredAuthSession {
  accessToken : string | null;
  refreshToken: string | null;
  user        : any;
  lastActive  : number;
}

// ── State ──────────────────────────────────────────────────

interface AuthState {
  accessToken : string | null;
  refreshToken: string | null;
  user        : any;
  isLoggedIn  : boolean;
}

function getInitialAuthState(): AuthState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: StoredAuthSession = JSON.parse(raw);
        const now = Date.now();
        // Kiểm tra nếu chưa quá 30 phút kể từ lần thao tác cuối
        if (parsed.lastActive && (now - parsed.lastActive < IDLE_TIMEOUT_MS)) {
          // Gia hạn lại lastActive khi tải lại trang
          parsed.lastActive = now;
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
          return {
            accessToken : parsed.accessToken,
            refreshToken: parsed.refreshToken,
            user        : parsed.user,
            isLoggedIn  : true,
          };
        } else {
          // Quá 30 phút không thao tác -> Hết hạn phiên
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      // Bỏ qua lỗi phân tích chuỗi JSON
    }
  }
  return {
    accessToken : null,
    refreshToken: null,
    user        : null,
    isLoggedIn  : false,
  };
}

const initialState: AuthState = getInitialAuthState();

// ── Slice ──────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Gọi sau khi login thành công – map dữ liệu và lưu phiên vào localStorage
    loginSuccess(state, action: PayloadAction<any>) {
      const payload = action.payload;
      const accessToken = payload.accessToken || payload.token || 'demo-token';
      const refreshToken = payload.refreshToken || 'demo-refresh';
      const user = payload.user || {
        userId     : payload.userId ?? 1,
        username   : payload.username ?? 'admin',
        fullName   : payload.fullName ?? 'Cán bộ Quản trị',
        roles      : payload.roles ?? ['ADMIN'],
        authorities: payload.authorities ?? [],
      };

      state.accessToken  = accessToken;
      state.refreshToken = refreshToken;
      state.user         = user;
      state.isLoggedIn   = true;

      // Lưu trữ phiên đăng nhập vào bộ nhớ cục bộ
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const sessionData: StoredAuthSession = {
            accessToken,
            refreshToken,
            user,
            lastActive: Date.now(),
          };
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        } catch (e) {
          // ignore
        }
      }
    },

    // Gọi khi logout hoặc token/phiên hết hạn – xóa sạch storage
    logout(state) {
      state.accessToken  = null;
      state.refreshToken = null;
      state.user         = null;
      state.isLoggedIn   = false;

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (e) {
          // ignore
        }
      }
    },

    // Cập nhật access token mới sau khi refresh
    tokenRefreshed(
      state,
      action: PayloadAction<{ accessToken: string; expiresIn: number }>,
    ) {
      state.accessToken = action.payload.accessToken;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.accessToken = action.payload.accessToken;
            parsed.lastActive = Date.now();
            window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          // ignore
        }
      }
    },

    // Cập nhật mốc thời gian hoạt động gần nhất
    updateActivity(state) {
      if (state.isLoggedIn && typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.lastActive = Date.now();
            window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          // ignore
        }
      }
    },

    // Kiểm tra và tự động đăng xuất nếu không hoạt động quá 30 phút
    checkSessionExpiry(state) {
      if (state.isLoggedIn && typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.lastActive && (Date.now() - parsed.lastActive >= IDLE_TIMEOUT_MS)) {
              state.accessToken  = null;
              state.refreshToken = null;
              state.user         = null;
              state.isLoggedIn   = false;
              window.localStorage.removeItem(SESSION_STORAGE_KEY);
            }
          }
        } catch (e) {
          // ignore
        }
      }
    },
  },
});

export const {
  loginSuccess,
  logout,
  tokenRefreshed,
  updateActivity,
  checkSessionExpiry,
} = authSlice.actions;

export default authSlice.reducer;

// ── Selectors ──────────────────────────────────────────────

export const selectIsLoggedIn  = (state: { auth: AuthState }) => state.auth.isLoggedIn;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectFullName    = (state: { auth: AuthState }) => state.auth.user?.fullName ?? '';
