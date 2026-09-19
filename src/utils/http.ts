import { Platform } from 'react-native';

// ============================================================
// DYNAMIC BASE URL DETERMINATION
// Tự động nhận diện môi trường: Web localhost, Mobile LAN hoặc Emulator
// ============================================================
export const DEFAULT_LAN_IP = '192.168.32.103';

export function getBaseUrl(): string {
  // 1. Kiểm tra môi trường Web
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000/civil';
    }
    return `http://${hostname}:8000/civil`;
  }

  // 2. Kiểm tra nếu có cấu hình tùy chỉnh trong localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('cudan_custom_base_url');
    if (custom) return custom;
  }

  // 3. Môi trường Mobile (Android/iOS)
  // Nếu là máy ảo Android có thể dùng 10.0.2.2, nếu thiết bị thật dùng LAN IP
  return `http://${DEFAULT_LAN_IP}:8000/civil`;
}

export const BASE_URL = getBaseUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  idempotencyKey?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

// Hàm sinh mã định danh UUIDv4 ngẫu nhiên cho Idempotency-Key
function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Tự động trích xuất token lưu trong session nếu không truyền vào
function getStoredToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem('cudan_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.accessToken || null;
      }
    } catch {
      // Bỏ qua lỗi parse
    }
  }
  return null;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    token = getStoredToken() || undefined,
    idempotencyKey,
    timeoutMs = 12000,
    headers: customHeaders = {},
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Tự động sinh Idempotency-Key cho các request thanh toán trừ tiền
  if (endpoint.includes('/pay/process') || idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey || generateIdempotencyKey();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const activeBaseUrl = getBaseUrl();

  try {
    const response = await fetch(`${activeBaseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw {
        code: data?.code ?? String(response.status),
        message: data?.message ?? `Lỗi máy chủ (${response.status})`,
        data: data?.data,
      };
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}
