// ============================================================
// CITIZEN SERVICE & DATA
// Quản lý API và cấu trúc dữ liệu cho phân hệ Quản lý công dân
// Tương tác trực tiếp với API thật qua Spring Cloud Gateway (civil-pro-citizen)
// Endpoint Danh sách: GET /civil/citizen
// Endpoint Tìm kiếm : GET /civil/citizen/search
// Endpoint Tạo mới  : POST /civil/citizen
// Endpoint Cập nhật : PUT /civil/citizen/{id} (@DynamicUpdate hỗ trợ partial fields)
// Endpoint Chi tiết : GET /civil/citizen/details/{id} hoặc /civil/citizen/{id}
// ============================================================

import { request } from '../../../utils/http';

export interface CitizenItem {
  id: number;
  citizenCode: string;
  fullName: string;
  genderLabel: string;
  dateOfBirth: string;
  age: number;
  idCardNumber: string;
  permanentAddress: string;
  occupation: string;
  citizenType: string;
  status: number;
  statusLabel: string;
}

export type CitizenSummaryResponse = CitizenItem;

export interface CitizenPageResponse {
  items: CitizenSummaryResponse[];
  totalElements: number;
  totalPages?: number;
  page: number;
  size: number;
}

// ── Search Request DTO ─────────────────────────────────────
export interface SearchCitizenRequest {
  keyword?: string;
  query?: string;
  fullName?: string;
  citizenCode?: string;
  idCardNumber?: string;
  citizenType?: string;
  genderLabel?: string;
  status?: number;
  [key: string]: any;
}

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
}

// ── Create Citizen Request DTO ─────────────────────────────
export interface CreateCitizenRequest {
  fullName: string;
  gender: number; // 1: Nam, 2: Nữ, 3: Khác
  dateOfBirth: string; // yyyy-MM-dd
  placeOfBirth?: string;
  ethnicity?: string;
  religion?: string;
  idCardNumber?: string; // 12 digits
  idCardIssuedDate?: string; // yyyy-MM-dd
  idCardIssuedPlace?: string;
  idCardExpiryDate?: string; // yyyy-MM-dd
  phoneNumber?: string;
  email?: string;
  permanentAreaCode: string;
  permanentAddress: string;
  occupation?: string;
  educationLevel?: string;
  workplace?: string;
  citizenType?: string; // "Thường trú" | "Tạm trú"
}

// ── Update Citizen Request DTO ─────────────────────────────
export interface UpdateCitizenRequest {
  fullName?: string;
  gender?: number; // 1: Nam, 2: Nữ, 3: Khác
  dateOfBirth?: string; // yyyy-MM-dd
  placeOfBirth?: string;
  ethnicity?: string;
  religion?: string;
  idCardNumber?: string; // 12 digits
  idCardIssuedDate?: string; // yyyy-MM-dd
  idCardIssuedPlace?: string;
  idCardExpiryDate?: string; // yyyy-MM-dd
  phoneNumber?: string;
  email?: string;
  permanentAreaCode?: string;
  permanentAddress?: string;
  occupation?: string;
  educationLevel?: string;
  workplace?: string;
  citizenType?: string;
}

// ── Citizen Detail Response DTO ────────────────────────────
export interface CitizenDetailResponse {
  id: number;
  citizenCode: string;
  fullName: string;
  fullNameAscii?: string;
  genderLabel: string;
  dateOfBirth: string; // yyyy-MM-dd
  age: number;
  placeOfBirth?: string;
  ethnicity?: string;
  religion?: string;
  nationality?: string;

  idCardNumber: string;
  idCardIssuedDate?: string;
  idCardIssuedPlace?: string;
  idCardExpiryDate?: string;
  idCardExpiringSoon?: boolean;

  passportNumber?: string;
  passportExpiryDate?: string;

  // Contact
  phoneNumber?: string;
  email?: string;

  // Residency
  permanentAreaCode?: string;
  permanentAddress: string;
  temporaryAreaCode?: string;
  temporaryAddress?: string;

  // Occupation & Education
  occupation?: string;
  educationLevel?: string;
  workplace?: string;

  // Classification & Household
  citizenType?: string;
  isHouseholdHead?: boolean;
  householdId?: number;

  // Status
  status: number;
  statusLabel: string; // "Active" / "Deceased" / "Emigrated"
  deathDate?: string;
  statusReason?: string;

  // Audit
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export const EMPTY_CITIZEN_PAGE: CitizenPageResponse = {
  items: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
};

// Utility: Loại bỏ các trường undefined, null hoặc chuỗi rỗng để tối ưu cho Hibernate @DynamicUpdate
function cleanPayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      cleaned[key] = val;
    }
  });
  return cleaned;
}

// ── Normalizer ─────────────────────────────────────────────
export function normalizeCitizenPageResponse(raw: any): CitizenPageResponse {
  if (!raw) return EMPTY_CITIZEN_PAGE;

  const payload = raw.data ?? raw;

  let items: CitizenSummaryResponse[] = [];
  if (Array.isArray(payload.items)) {
    items = payload.items;
  } else if (Array.isArray(payload.content)) {
    items = payload.content;
  } else if (Array.isArray(payload.result)) {
    items = payload.result;
  } else if (Array.isArray(payload)) {
    items = payload;
  } else if (Array.isArray(raw.items)) {
    items = raw.items;
  } else if (Array.isArray(raw.content)) {
    items = raw.content;
  }

  const totalElements =
    raw.totalElements ??
    payload.totalElements ??
    payload.total ??
    items.length;

  const size =
    raw.size ??
    payload.size ??
    10;

  const totalPages =
    raw.totalPages ??
    payload.totalPages ??
    Math.max(1, Math.ceil(totalElements / Math.max(1, size)));

  const page =
    raw.page ??
    raw.number ??
    payload.page ??
    payload.number ??
    0;

  return {
    items,
    totalElements,
    totalPages,
    page,
    size,
  };
}

function buildQueryString(params: Record<string, any>): string {
  const pairs: string[] = [];
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
    }
  });
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

// ── 1. API: Danh Sách Công Dân (GET /civil/citizen) ────────
export async function getCitizensApi(
  token?: string,
  page = 0,
  size = 10,
): Promise<CitizenPageResponse> {
  try {
    const queryString = buildQueryString({ page, size });
    const res = await request<any>(`/citizen${queryString}`, {
      method: 'GET',
      token,
    });
    return normalizeCitizenPageResponse(res);
  } catch (err) {
    return EMPTY_CITIZEN_PAGE;
  }
}

// ── 2. API: Tìm Kiếm Công Dân (GET /civil/citizen/search) ───
export async function searchCitizensApi(
  searchRequest: SearchCitizenRequest = {},
  pageable: PageableParams = {},
  token?: string,
): Promise<CitizenPageResponse> {
  try {
    const params: Record<string, any> = {};

    if (searchRequest.keyword?.trim()) {
      params.keyword = searchRequest.keyword.trim();
    }
    if (searchRequest.fullName?.trim()) {
      params.fullName = searchRequest.fullName.trim();
    }
    if (searchRequest.citizenCode?.trim()) {
      params.citizenCode = searchRequest.citizenCode.trim();
    }
    if (searchRequest.idCardNumber?.trim()) {
      params.idCardNumber = searchRequest.idCardNumber.trim();
    }
    if (searchRequest.citizenType?.trim()) {
      params.citizenType = searchRequest.citizenType.trim();
    }
    if (searchRequest.genderLabel?.trim()) {
      params.genderLabel = searchRequest.genderLabel.trim();
    }
    if (searchRequest.status !== undefined) {
      params.status = searchRequest.status;
    }

    params.page = pageable.page ?? 0;
    params.size = pageable.size ?? 10;
    params.sort = pageable.sort ?? 'fullName';

    const queryString = buildQueryString(params);
    const endpoint = `/citizen/search${queryString}`;

    const res = await request<any>(endpoint, {
      method: 'GET',
      token,
    });

    return normalizeCitizenPageResponse(res);
  } catch (err) {
    return EMPTY_CITIZEN_PAGE;
  }
}

// ── 3. API: Tạo Mới Công Dân (POST /civil/citizen) ──────────
export async function createCitizenApi(
  payload: CreateCitizenRequest,
  token?: string,
): Promise<any> {
  const body = cleanPayload(payload);
  return request<any>('/citizen', {
    method: 'POST',
    body,
    token,
  });
}

// ── 4. API: Cập Nhật Công Dân (PUT /civil/citizen/{id}) ─────
// Chuẩn RESTful API: PUT /civil/citizen/{id} khớp trực tiếp với Spring Cloud Gateway
export async function updateCitizenApi(
  id: number | string,
  payload: UpdateCitizenRequest,
  token?: string,
): Promise<any> {
  const body = cleanPayload(payload);
  return request<any>(`/citizen/${id}`, {
    method: 'PUT',
    body,
    token,
  });
}

// ── 5. API: Chi Tiết Công Dân (GET /civil/citizen/details/{id}) ─
export async function getCitizenDetailApi(
  id: number | string,
  token?: string,
): Promise<CitizenDetailResponse> {
  try {
    const res = await request<any>(`/citizen/details/${id}`, {
      method: 'GET',
      token,
    });
    const payload = res?.data ?? res;
    if (payload && (payload.id || payload.fullName)) {
      return payload as CitizenDetailResponse;
    }
  } catch {}

  const res = await request<any>(`/citizen/${id}`, {
    method: 'GET',
    token,
  });
  const payload = res?.data ?? res;
  return payload as CitizenDetailResponse;
}
