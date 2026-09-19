// ============================================================
// PAYMENT & TAX SERVICE
// Cổng nộp 7 loại thuế Nhà nước & Tra cứu nghĩa vụ công dân
// Endpoint Nghĩa vụ  : GET /pay/obligations/{nationalId}
// Endpoint Tạo đơn   : POST /pay/orders
// Endpoint Thanh toán: POST /pay/process
// Endpoint Biên lai  : GET /pay/receipts/{orderCode}
// ============================================================

import { request } from '../../../utils/http';

export type TaxCategory =
  | 'PERSONAL_INCOME'
  | 'VALUE_ADDED'
  | 'SPECIAL_CONSUMPTION'
  | 'NON_AGRICULTURAL_LAND'
  | 'AGRICULTURAL_LAND'
  | 'REAL_ESTATE_TRANSFER'
  | 'SECURITIES_TRANSFER';

export interface TaxCategoryMeta {
  code: TaxCategory;
  name: string;
  description: string;
  badgeColor: string;
}

export const TAX_CATEGORIES: Record<TaxCategory, TaxCategoryMeta> = {
  PERSONAL_INCOME: {
    code: 'PERSONAL_INCOME',
    name: 'Thuế Thu nhập Cá nhân (TNCN)',
    description: 'Tiền lương, tiền công, hoạt động kinh doanh cá thể',
    badgeColor: '#2563eb',
  },
  VALUE_ADDED: {
    code: 'VALUE_ADDED',
    name: 'Thuế Giá trị Gia tăng (GTGT/VAT)',
    description: 'Kê khai thuế hàng hóa, dịch vụ theo quy định',
    badgeColor: '#0891b2',
  },
  SPECIAL_CONSUMPTION: {
    code: 'SPECIAL_CONSUMPTION',
    name: 'Thuế Tiêu thụ Đặc biệt',
    description: 'Hàng hóa, dịch vụ xa xỉ, rượu bia, xe cơ giới',
    badgeColor: '#7c3aed',
  },
  NON_AGRICULTURAL_LAND: {
    code: 'NON_AGRICULTURAL_LAND',
    name: 'Thuế Đất phi Nông nghiệp',
    description: 'Đất ở tại đô thị, đất sản xuất kinh doanh phi nông nghiệp',
    badgeColor: '#059669',
  },
  AGRICULTURAL_LAND: {
    code: 'AGRICULTURAL_LAND',
    name: 'Thuế Đất Nông nghiệp',
    description: 'Đất canh tác, nuôi trồng nông - lâm - thủy sản',
    badgeColor: '#16a34a',
  },
  REAL_ESTATE_TRANSFER: {
    code: 'REAL_ESTATE_TRANSFER',
    name: 'Thuế Chuyển nhượng Bất động sản',
    description: 'Thu nhập từ mua bán, chuyển giao quyền sử dụng đất & nhà ở',
    badgeColor: '#d97706',
  },
  SECURITIES_TRANSFER: {
    code: 'SECURITIES_TRANSFER',
    name: 'Thuế Chuyển nhượng Chứng khoán',
    description: 'Giao dịch cổ phiếu, trái phiếu và chứng chỉ quỹ',
    badgeColor: '#dc2626',
  },
};

export interface TaxObligationItem {
  obligationCode: string;
  taxpayerNationalId: string;
  taxpayerName: string;
  taxCategory: TaxCategory;
  taxPeriod: string;
  amountDue: number;
  currency: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface CreateOrderRequest {
  taxpayerNationalId: string;
  taxCategory: TaxCategory;
  amount: number;
  currency?: string;
  taxPeriod: string;
  description: string;
}

export interface ProcessPaymentRequest {
  orderCode: string;
  taxpayerNationalId: string;
  taxCategory: TaxCategory;
  amount: number;
  currency?: string;
  debitAccount: string;
  bankCode: string;
  description: string;
  idempotencyKey?: string;
}

export interface PaymentReceipt {
  transactionCode: string;
  orderCode: string;
  taxCategory: TaxCategory;
  amount: number;
  currency: string;
  status: string;
  maskedDebitAccount: string;
  creditAccount: string;
  auditIntegrityHash: string;
  paidAt: string;
  receiptUrl?: string;
}

// Mock fallback khi chạy offline
export const DEFAULT_TAX_OBLIGATIONS: TaxObligationItem[] = [
  {
    obligationCode: 'OBL-TNCN-2026-01',
    taxpayerNationalId: '001203012345',
    taxpayerName: 'Nguyễn Văn An',
    taxCategory: 'PERSONAL_INCOME',
    taxPeriod: 'Q1/2026',
    amountDue: 5400000,
    currency: 'VND',
    dueDate: '2026-03-31',
    status: 'PENDING',
  },
  {
    obligationCode: 'OBL-LAND-2026-02',
    taxpayerNationalId: '001203012345',
    taxpayerName: 'Nguyễn Văn An',
    taxCategory: 'NON_AGRICULTURAL_LAND',
    taxPeriod: 'Năm 2026',
    amountDue: 1200000,
    currency: 'VND',
    dueDate: '2026-04-15',
    status: 'PENDING',
  },
];

export async function getTaxObligationsApi(
  nationalId: string,
  token?: string,
): Promise<TaxObligationItem[]> {
  try {
    const res = await request<any>(`/pay/obligations/${nationalId}`, {
      method: 'GET',
      token,
    });
    const payload = res?.data ?? res;
    return Array.isArray(payload) && payload.length > 0
      ? payload
      : DEFAULT_TAX_OBLIGATIONS;
  } catch {
    return DEFAULT_TAX_OBLIGATIONS;
  }
}

export async function createPaymentOrderApi(
  payload: CreateOrderRequest,
  token?: string,
): Promise<any> {
  return request<any>('/pay/orders', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function processPaymentApi(
  payload: ProcessPaymentRequest,
  token?: string,
): Promise<PaymentReceipt> {
  const res = await request<any>('/pay/process', {
    method: 'POST',
    body: payload,
    token,
    idempotencyKey: payload.idempotencyKey,
  });
  return res?.data ?? res;
}
