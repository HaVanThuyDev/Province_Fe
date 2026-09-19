// ============================================================
// SYNC SERVICE
// Trục tích hợp & Đồng bộ CSDL Quốc gia về Dân cư (VNeID)
// Endpoint Kích hoạt : POST /sync/trigger
// Endpoint Mới nhất  : GET /sync/latest
// Endpoint Lịch sử   : GET /sync/history
// Endpoint Xử lý lỗi : POST /sync/errors/{id}/resolve
// ============================================================

import { request } from '../../../utils/http';

export interface SyncSessionItem {
  id: number;
  sessionCode: string;
  syncType: 'FULL' | 'INCREMENTAL';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'WARNING';
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  startTime: string;
  endTime?: string;
}

export interface SyncConflictRecord {
  id: number;
  nationalId: string;
  citizenName: string;
  conflictField: string;
  localValue: string;
  nationalValue: string;
  status: 'UNRESOLVED' | 'RESOLVED';
  note?: string;
}

export const DEFAULT_SYNC_SESSIONS: SyncSessionItem[] = [
  {
    id: 1,
    sessionCode: 'SYNC-20260320-001',
    syncType: 'INCREMENTAL',
    status: 'COMPLETED',
    totalRecords: 5200,
    successRecords: 5192,
    failedRecords: 8,
    startTime: '2026-03-20 08:00:00',
    endTime: '2026-03-20 08:15:30',
  },
  {
    id: 2,
    sessionCode: 'SYNC-20260319-001',
    syncType: 'INCREMENTAL',
    status: 'COMPLETED',
    totalRecords: 4800,
    successRecords: 4800,
    failedRecords: 0,
    startTime: '2026-03-19 08:00:00',
    endTime: '2026-03-19 08:12:10',
  },
];

export const DEFAULT_CONFLICT_RECORDS: SyncConflictRecord[] = [
  {
    id: 101,
    nationalId: '001203012345',
    citizenName: 'Nguyễn Văn An',
    conflictField: 'Quê quán',
    localValue: 'Hà Nội',
    nationalValue: 'Thái Bình',
    status: 'UNRESOLVED',
  },
  {
    id: 102,
    nationalId: '036195009876',
    citizenName: 'Trần Thị Bích',
    conflictField: 'Ngày sinh',
    localValue: '1995-08-15',
    nationalValue: '1995-09-15',
    status: 'UNRESOLVED',
  },
];

export async function triggerSyncApi(
  syncType = 'INCREMENTAL',
  token?: string,
): Promise<SyncSessionItem> {
  const res = await request<any>(`/sync/trigger?syncType=${syncType}`, {
    method: 'POST',
    token,
  });
  return res?.data ?? res;
}

export async function getLatestSyncSessionApi(
  token?: string,
): Promise<SyncSessionItem> {
  try {
    const res = await request<any>('/sync/latest', {
      method: 'GET',
      token,
    });
    return res?.data ?? res ?? DEFAULT_SYNC_SESSIONS[0];
  } catch {
    return DEFAULT_SYNC_SESSIONS[0];
  }
}

export async function getSyncHistoryApi(
  token?: string,
): Promise<SyncSessionItem[]> {
  try {
    const res = await request<any>('/sync/history', {
      method: 'GET',
      token,
    });
    const payload = res?.data ?? res;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload)) return payload;
    return DEFAULT_SYNC_SESSIONS;
  } catch {
    return DEFAULT_SYNC_SESSIONS;
  }
}

export async function resolveSyncErrorApi(
  errorId: number,
  processedBy = 'admin',
  note = 'Đã đối soát với CSDL Quốc gia',
  token?: string,
): Promise<void> {
  await request<any>(`/sync/errors/${errorId}/resolve?processedBy=${encodeURIComponent(processedBy)}&note=${encodeURIComponent(note)}`, {
    method: 'POST',
    token,
  });
}
