// ============================================================
// CITIZEN SERVICE & DATA
// Quản lý API và cấu trúc dữ liệu cho phân hệ Quản lý công dân
// Endpoint Danh sách: GET /civil/citizen
// Endpoint Tìm kiếm : GET /civil/citizen/search
// Endpoint Tạo mới  : POST /civil/citizen
// Endpoint Cập nhật : PUT /civil/citizen/{id}
// Endpoint Chi tiết : GET /civil/citizen/details/{id} hoặc /civil/citizen/details{id}
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

// ── Default Mock Citizens Database ──────────────────────────
export const DEFAULT_CITIZEN_DATA: CitizenPageResponse = {
  items: [
    {
      id: 1,
      citizenCode: 'CD000001',
      fullName: 'Nguyễn Văn An',
      genderLabel: 'Male',
      dateOfBirth: '1990-03-15',
      age: 36,
      idCardNumber: '001090003456',
      permanentAddress: 'Số 1 Hoàng Diệu, Ba Đình, Hà Nội',
      occupation: 'Kỹ sư phần mềm',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 2,
      citizenCode: 'CD000002',
      fullName: 'Trần Thị Bích',
      genderLabel: 'Other',
      dateOfBirth: '1995-07-22',
      age: 31,
      idCardNumber: '079095001234',
      permanentAddress: '123 Lý Tự Trọng, Q1, TP.HCM',
      occupation: 'Kế toán',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 3,
      citizenCode: 'CD000003',
      fullName: 'Lê Minh Cường',
      genderLabel: 'Male',
      dateOfBirth: '1988-11-30',
      age: 37,
      idCardNumber: '048088002345',
      permanentAddress: '45 Trần Phú, Hải Châu, Đà Nẵng',
      occupation: 'Bác sĩ',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 4,
      citizenCode: 'CD000004',
      fullName: 'Phạm Thị Dung',
      genderLabel: 'Other',
      dateOfBirth: '1992-04-18',
      age: 34,
      idCardNumber: '031092003456',
      permanentAddress: '78 Điện Biên Phủ, Lê Chân, Hải Phòng',
      occupation: 'Giáo viên',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 5,
      citizenCode: 'CD000005',
      fullName: 'Hoàng Văn Em',
      genderLabel: 'Male',
      dateOfBirth: '1975-09-05',
      age: 51,
      idCardNumber: '038075004567',
      permanentAddress: '12 Nguyễn Thị Minh Khai, TP Vinh, Nghệ An',
      occupation: 'Nông dân',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 6,
      citizenCode: 'CD000006',
      fullName: 'Vũ Thị Phương',
      genderLabel: 'Other',
      dateOfBirth: '1998-12-10',
      age: 27,
      idCardNumber: '001098005678',
      permanentAddress: '34 Kim Mã, Ba Đình, Hà Nội',
      occupation: 'Sinh viên',
      citizenType: 'Tạm trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 7,
      citizenCode: 'CD000007',
      fullName: 'Đỗ Quốc Hùng',
      genderLabel: 'Male',
      dateOfBirth: '1983-06-28',
      age: 43,
      idCardNumber: '074083006789',
      permanentAddress: '56 ĐT743, Thủ Dầu Một, Bình Dương',
      occupation: 'Quản lý',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 8,
      citizenCode: 'CD000008',
      fullName: 'Ngô Thị Hoa',
      genderLabel: 'Other',
      dateOfBirth: '1991-02-14',
      age: 35,
      idCardNumber: '092091007890',
      permanentAddress: '89 Nguyễn Trãi, Ninh Kiều, Cần Thơ',
      occupation: 'Dược sĩ',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 9,
      citizenCode: 'CD000009',
      fullName: 'Bùi Thành Kiên',
      genderLabel: 'Male',
      dateOfBirth: '1986-08-19',
      age: 40,
      idCardNumber: '022086008901',
      permanentAddress: '23 Lê Thánh Tông, Hạ Long, Quảng Ninh',
      occupation: 'Thuyền trưởng',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
    {
      id: 10,
      citizenCode: 'CD000010',
      fullName: 'Đinh Thị Lan',
      genderLabel: 'Other',
      dateOfBirth: '1994-05-07',
      age: 32,
      idCardNumber: '038094009012',
      permanentAddress: '67 Lê Lợi, TP Thanh Hóa, Thanh Hóa',
      occupation: 'Y tá',
      citizenType: 'Thường trú',
      status: 1,
      statusLabel: 'Active',
    },
  ],
  totalElements: 81,
  totalPages: 9,
  page: 0,
  size: 10,
};

// ── Default Mock Citizen Detail Generator ───────────────────
export function getMockCitizenDetail(
  idOrCode: number | string,
  defaultName?: string,
): CitizenDetailResponse {
  const citizen = DEFAULT_CITIZEN_DATA.items.find(
    (c) =>
      c.id === Number(idOrCode) ||
      c.citizenCode === String(idOrCode) ||
      (defaultName && c.fullName === defaultName),
  ) || DEFAULT_CITIZEN_DATA.items[0];

  return {
    id: citizen.id,
    citizenCode: citizen.citizenCode,
    fullName: citizen.fullName,
    fullNameAscii: citizen.fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D'),
    genderLabel: citizen.genderLabel,
    dateOfBirth: citizen.dateOfBirth,
    age: citizen.age,
    placeOfBirth: citizen.permanentAddress,
    ethnicity: 'Kinh',
    religion: 'Không',
    nationality: 'Việt Nam',

    idCardNumber: citizen.idCardNumber,
    idCardIssuedDate: '2021-12-25',
    idCardIssuedPlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
    idCardExpiryDate: '2031-12-25',
    idCardExpiringSoon: false,

    passportNumber: citizen.id === 1 ? 'B9283745' : undefined,
    passportExpiryDate: citizen.id === 1 ? '2029-05-14' : undefined,

    phoneNumber: '0912345678',
    email: `${citizen.citizenCode.toLowerCase()}@civilpro.gov.vn`,

    permanentAreaCode: 'AREA-' + citizen.citizenCode.slice(-3),
    permanentAddress: citizen.permanentAddress,
    temporaryAreaCode: citizen.citizenType === 'Tạm trú' ? 'TEMP-' + citizen.citizenCode.slice(-3) : undefined,
    temporaryAddress: citizen.citizenType === 'Tạm trú' ? citizen.permanentAddress : undefined,

    occupation: citizen.occupation,
    educationLevel: 'Đại học',
    workplace: 'Đơn vị công tác chuyên môn',

    citizenType: citizen.citizenType,
    isHouseholdHead: citizen.id % 2 === 1,
    householdId: 1000 + citizen.id,

    status: citizen.status,
    statusLabel: citizen.statusLabel || 'Active',
    statusReason: 'Hồ sơ đầy đủ, đang hoạt động bình thường',

    createdAt: '2022-01-15 08:30:00',
    updatedAt: '2026-03-10 14:20:00',
    createdBy: 'hethong_admin',
    updatedBy: 'canbo_quanly',
  };
}

// ── Normalizer ─────────────────────────────────────────────
export function normalizeCitizenPageResponse(
  raw: any,
  fallback: CitizenPageResponse = DEFAULT_CITIZEN_DATA,
): CitizenPageResponse {
  if (!raw) return fallback;

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
    Math.max(1, Math.ceil(totalElements / size));

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
  const queryString = buildQueryString({ page, size });
  const res = await request<any>(`/citizen${queryString}`, {
    method: 'GET',
    token,
  });
  return normalizeCitizenPageResponse(res);
}

// ── 2. API: Tìm Kiếm Công Dân (GET /civil/citizen/search) ───
export async function searchCitizensApi(
  searchRequest: SearchCitizenRequest = {},
  pageable: PageableParams = {},
  token?: string,
): Promise<CitizenPageResponse> {
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
}

// ── 3. API: Tạo Mới Công Dân (POST /civil/citizen) ──────────
export async function createCitizenApi(
  payload: CreateCitizenRequest,
  token?: string,
): Promise<any> {
  return request<any>('/citizen', {
    method: 'POST',
    body: payload,
    token,
  });
}

// ── 4. API: Cập Nhật Công Dân (PUT /civil/citizen/{id}) ─────
export async function updateCitizenApi(
  id: number | string,
  payload: UpdateCitizenRequest,
  token?: string,
): Promise<any> {
  return request<any>(`/citizen/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });
}

// ── 5. API: Chi Tiết Công Dân (GET /civil/citizen/details/{id}) ─
export async function getCitizenDetailApi(
  id: number | string,
  token?: string,
  fallbackName?: string,
): Promise<CitizenDetailResponse> {
  // Thử endpoint chuẩn /citizen/details/{id} hoặc /citizen/details{id}
  try {
    const res = await request<any>(`/citizen/details/${id}`, {
      method: 'GET',
      token,
    });
    const payload = res?.data ?? res;
    if (payload && (payload.id || payload.citizenCode || payload.fullName)) {
      return payload as CitizenDetailResponse;
    }
  } catch {
    // Thử endpoint dự phòng /citizen/details{id} nếu backend định tuyến dính liền
    try {
      const res = await request<any>(`/citizen/details${id}`, {
        method: 'GET',
        token,
      });
      const payload = res?.data ?? res;
      if (payload && (payload.id || payload.citizenCode || payload.fullName)) {
        return payload as CitizenDetailResponse;
      }
    } catch {
      // Thử endpoint dự phòng /citizen/{id}
      try {
        const res = await request<any>(`/citizen/${id}`, {
          method: 'GET',
          token,
        });
        const payload = res?.data ?? res;
        if (payload && (payload.id || payload.citizenCode || payload.fullName)) {
          return payload as CitizenDetailResponse;
        }
      } catch {
        // Fallback sang dữ liệu mẫu
      }
    }
  }

  return getMockCitizenDetail(id, fallbackName);
}
