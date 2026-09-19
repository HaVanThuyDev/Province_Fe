// ============================================================
// FLUCTUATION SERVICE & DATA
// Quản lý biến động cư trú: Tạm trú, Tạm vắng, Khai sinh, Khai tử
// Endpoint Danh sách : GET /fluctuations
// Endpoint Ghi nhận  : POST /fluctuations
// Endpoint Thống kê  : GET /fluctuations/monthly
// ============================================================

import { request } from '../../../utils/http';

export type FluctuationType =
  | 'TEMPORARY_RESIDENCE'
  | 'TEMPORARY_ABSENCE'
  | 'BIRTH_REGISTRATION'
  | 'DEATH_REGISTRATION';

export interface FluctuationItem {
  id?: number;
  citizenId?: number;
  name: string;
  nationalId?: string;
  type: string;
  typeCode?: FluctuationType;
  from: string;
  to: string;
  address: string;
  reason?: string;
  status: string;
}

export const DEFAULT_RESIDENCY_DATA: FluctuationItem[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    nationalId: '001203012345',
    type: 'Tạm trú',
    typeCode: 'TEMPORARY_RESIDENCE',
    from: '01/03/2024',
    to: '01/09/2024',
    address: 'P.1, TP. Trung Tâm',
    reason: 'Lao động hợp đồng',
    status: 'Đang hiệu lực',
  },
  {
    id: 2,
    name: 'Trần Thị Bích',
    nationalId: '036195009876',
    type: 'Tạm vắng',
    typeCode: 'TEMPORARY_ABSENCE',
    from: '15/04/2024',
    to: '15/07/2024',
    address: 'H. Hòa Bình',
    reason: 'Học tập dài hạn',
    status: 'Đang hiệu lực',
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    nationalId: '001088005544',
    type: 'Tạm trú',
    typeCode: 'TEMPORARY_RESIDENCE',
    from: '10/01/2024',
    to: '10/04/2024',
    address: 'P.3, TP. Trung Tâm',
    reason: 'Chữa bệnh',
    status: 'Hết hạn',
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    nationalId: '079198007788',
    type: 'Tạm trú',
    typeCode: 'TEMPORARY_RESIDENCE',
    from: '20/05/2024',
    to: '20/11/2024',
    address: 'H. Miền Núi',
    reason: 'Tạm trú kinh doanh',
    status: 'Chờ duyệt',
  },
];

export interface RecordFluctuationRequest {
  citizenId?: number;
  citizenName: string;
  nationalId?: string;
  type: FluctuationType | string;
  startDate?: string;
  endDate?: string;
  destinationAddress?: string;
  reason?: string;
  areaCode?: string;
  fluctuationCode?: string;
  description?: string;
}

export async function getFluctuationsApi(
  page = 0,
  size = 10,
  token?: string,
): Promise<{ items: FluctuationItem[]; total: number }> {
  try {
    const res = await request<any>(`/fluctuations?page=${page}&size=${size}`, {
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
      return { items: DEFAULT_RESIDENCY_DATA, total: DEFAULT_RESIDENCY_DATA.length };
    }

    const items: FluctuationItem[] = rawItems.map((f: any) => ({
      id: f.id,
      citizenId: f.citizenId,
      name: f.fullName || f.citizenName || f.name || 'Công dân',
      nationalId: f.documentNumber || f.nationalId,
      type: f.fluctuationType === 'TEMPORARY_RESIDENCE' ? 'Tạm trú'
          : f.fluctuationType === 'TEMPORARY_ABSENCE' ? 'Tạm vắng'
          : f.fluctuationType === 'BIRTH' ? 'Khai sinh'
          : f.fluctuationType === 'DEATH' ? 'Khai tử'
          : f.type || 'Tạm trú',
      typeCode: f.fluctuationType || f.type,
      from: f.fluctuationDate || f.startDate || f.from || '',
      to: f.endDate || f.to || 'Vô thời hạn',
      address: f.description || f.destinationAddress || f.address || '',
      reason: f.description || f.reason || '',
      status: f.status || 'Đang hiệu lực',
    }));

    return {
      items,
      total: payload?.totalElements ?? items.length,
    };
  } catch {
    return { items: DEFAULT_RESIDENCY_DATA, total: DEFAULT_RESIDENCY_DATA.length };
  }
}

export async function recordFluctuationApi(
  payload: RecordFluctuationRequest,
  token?: string,
): Promise<any> {
  const now = new Date();
  const rawDate = payload.startDate || now.toISOString().split('T')[0];
  const dateStr = rawDate.includes('/') ? rawDate.split('/').reverse().join('-') : rawDate;
  const body = {
    fluctuationCode: payload.fluctuationCode || `FL-${Date.now().toString().slice(-6)}`,
    fluctuationType: payload.type,
    fullName: payload.citizenName,
    citizenId: payload.citizenId || null,
    areaCode: payload.areaCode || 'KV-TT-01',
    fluctuationDate: dateStr,
    description: payload.reason ? `${payload.reason} (Nơi đến: ${payload.destinationAddress || 'N/A'})` : (payload.destinationAddress || ''),
    documentNumber: payload.nationalId || `DOC-${Date.now().toString().slice(-4)}`,
    declaredBy: payload.citizenName,
  };
  return request<any>('/fluctuations', {
    method: 'POST',
    body,
    token,
  });
}
