// ============================================================
// HOUSEHOLD SERVICE & DATA
// Quản lý API và cấu trúc dữ liệu cho phân hệ Sổ hộ khẩu điện tử
// Endpoint Danh sách: GET /household
// Endpoint Tạo mới  : POST /household
// Endpoint Chi tiết : GET /household/{id}
// Endpoint Thêm tv  : POST /household/{id}/members
// Endpoint Tách hộ  : POST /household/split
// ============================================================

import { request } from '../../../utils/http';

export interface HouseholdMember {
  citizenId: number;
  fullName: string;
  nationalId?: string;
  relationship: string;
  genderLabel?: string;
  dateOfBirth?: string;
}

export interface HouseholdItem {
  id?: number;
  code: string;
  head: string;
  headCitizenId?: number;
  members: number;
  memberList?: HouseholdMember[];
  address: string;
  type: string;
  status: string;
  areaCode?: string;
  createdAt?: string;
}

export const DEFAULT_HOUSEHOLD_DATA: HouseholdItem[] = [
  {
    id: 1,
    code: 'HK-10029',
    head: 'Trần Văn Hoàng',
    headCitizenId: 1,
    members: 4,
    address: 'Số 12, Đường 3/2, P.1, TP. Trung Tâm',
    type: 'Thường trú',
    status: 'Hoàn chỉnh',
    areaCode: 'KV-TT-01',
  },
  {
    id: 2,
    code: 'HK-10030',
    head: 'Nguyễn Thị Lan',
    headCitizenId: 2,
    members: 3,
    address: 'Hẻm 45, Xã Hòa Xuân, H. Hòa Bình',
    type: 'Thường trú',
    status: 'Cần cập nhật',
    areaCode: 'KV-HB-02',
  },
  {
    id: 3,
    code: 'HK-10031',
    head: 'Lê Văn Minh',
    headCitizenId: 3,
    members: 6,
    address: 'Thôn 2, Xã Bình Minh, H. Miền Núi',
    type: 'Thường trú',
    status: 'Hoàn chỉnh',
    areaCode: 'KV-MN-03',
  },
  {
    id: 4,
    code: 'HK-10032',
    head: 'Phạm Thị Hương',
    headCitizenId: 4,
    members: 2,
    address: 'Số 88, Đường Lê Lợi, P.3, TP. Trung Tâm',
    type: 'Tạm trú',
    status: 'Chờ duyệt',
    areaCode: 'KV-TT-03',
  },
];

export interface CreateHouseholdRequest {
  householdCode?: string;
  head?: string;
  headCitizenId?: number;
  areaCode?: string;
  address?: string;
  fullAddress?: string;
  householdBookNumber?: string;
  householdType?: string;
  notes?: string;
}

export interface AddMemberRequest {
  citizenId: number;
  relationship: string;
}

export interface SplitHouseholdRequest {
  sourceHouseholdId: number;
  newHouseholdCode: string;
  newAddress: string;
  newHeadCitizenId: number;
  memberCitizenIds: number[];
}

export async function getHouseholdsApi(
  page = 0,
  size = 10,
  token?: string,
): Promise<{ items: HouseholdItem[]; total: number }> {
  try {
    const res = await request<any>(`/household?page=${page}&size=${size}`, {
      method: 'GET',
      token,
    });
    const payload = res?.data ?? res;
    const rawItems = Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload)
      ? payload
      : [];

    if (rawItems.length === 0) {
      return { items: DEFAULT_HOUSEHOLD_DATA, total: DEFAULT_HOUSEHOLD_DATA.length };
    }

    const items: HouseholdItem[] = rawItems.map((h: any) => ({
      id: h.id,
      code: h.householdCode || h.code || `HK-${h.id}`,
      head: h.headCitizenName || h.head || 'Chủ hộ',
      headCitizenId: h.headCitizenId,
      members: h.memberCount || (Array.isArray(h.members) ? h.members.length : 1),
      address: h.address || '',
      type: h.residenceType || 'Thường trú',
      status: h.status || 'Hoàn chỉnh',
      areaCode: h.areaCode,
      createdAt: h.createdAt,
    }));

    return {
      items,
      total: payload?.totalElements ?? items.length,
    };
  } catch {
    return { items: DEFAULT_HOUSEHOLD_DATA, total: DEFAULT_HOUSEHOLD_DATA.length };
  }
}

export async function createHouseholdApi(
  payload: CreateHouseholdRequest,
  token?: string,
): Promise<any> {
  const body = {
    headCitizenId: payload.headCitizenId || 1,
    areaCode: payload.areaCode || 'KV-TT-01',
    fullAddress: payload.fullAddress || payload.address || '',
    householdBookNumber: payload.householdBookNumber || payload.householdCode,
    householdType: payload.householdType || 'NORMAL',
    notes: payload.notes || '',
  };
  return request<any>('/household', {
    method: 'POST',
    body,
    token,
  });
}

export async function splitHouseholdApi(
  payload: SplitHouseholdRequest,
  token?: string,
): Promise<any> {
  return request<any>('/household/split', {
    method: 'POST',
    body: payload,
    token,
  });
}
