// ============================================================
// STATISTICAL SERVICE
// Tổng hợp chỉ số dân số học & biểu đồ thời gian thực
// Endpoint Dashboard: GET /statistical/dashboard
// ============================================================

import { request } from '../../../utils/http';

export interface AgeStructure {
  children_0_14: number;
  working_15_59: number;
  elderly_60_plus: number;
}

export interface MonthlyTrendItem {
  month: string;
  births: number;
  deaths: number;
  tempResidence: number;
}

export interface DashboardStatsResponse {
  totalPopulation: number;
  totalHouseholds: number;
  temporaryResidents?: number;
  expiringNationalIds?: number;
  growthRatePct?: number;
  updatedAt?: string;
  maleCount?: number;
  femaleCount?: number;
  ageStructure?: AgeStructure;
  monthlyTrend?: MonthlyTrendItem[];
}

export const DEFAULT_DASHBOARD_STATS: DashboardStatsResponse = {
  totalPopulation: 1854230,
  totalHouseholds: 450112,
  temporaryResidents: 12450,
  expiringNationalIds: 2841,
  growthRatePct: 1.2,
  updatedAt: '2026-09-20',
  maleCount: 928100,
  femaleCount: 926130,
  ageStructure: {
    children_0_14: 463550,
    working_15_59: 1205250,
    elderly_60_plus: 185430,
  },
  monthlyTrend: [
    { month: '2026-01', births: 120, deaths: 45, tempResidence: 340 },
    { month: '2026-02', births: 115, deaths: 40, tempResidence: 290 },
    { month: '2026-03', births: 140, deaths: 38, tempResidence: 410 },
  ],
};

export async function getDashboardStatsApi(
  token?: string,
): Promise<DashboardStatsResponse> {
  try {
    const res = await request<any>('/statistical/dashboard', {
      method: 'GET',
      token,
    });
    const payload = res?.data ?? res;
    if (payload && (payload.totalPopulation != null || payload.totalHouseholds != null)) {
      return {
        ...DEFAULT_DASHBOARD_STATS,
        ...payload,
      } as DashboardStatsResponse;
    }
    return DEFAULT_DASHBOARD_STATS;
  } catch {
    return DEFAULT_DASHBOARD_STATS;
  }
}
