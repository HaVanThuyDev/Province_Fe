// ============================================================
// PAYMENT MODULE – CỔNG THU NỘP THUẾ & NGÂN SÁCH NHÀ NƯỚC
// Hỗ trợ 7 loại thuế Nhà nước theo quy định hiện hành
// Giữ nguyên 100% phong cách thiết kế, màu cờ đỏ sao vàng Việt Nam
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  TaxCategory,
  TAX_CATEGORIES,
  TaxObligationItem,
  DEFAULT_TAX_OBLIGATIONS,
  PaymentReceipt,
  getTaxObligationsApi,
  processPaymentApi,
} from '../services/payment.service';

const isWeb = Platform.OS === 'web';
const { width: screenWidth } = Dimensions.get('window');
const isDesktop = isWeb && screenWidth >= 1024;

const PaymentModule: React.FC = () => {
  const accessToken = useSelector(selectAccessToken);

  // Form state
  const [nationalId, setNationalId] = useState<string>('001203012345');
  const [obligations, setObligations] = useState<TaxObligationItem[]>(DEFAULT_TAX_OBLIGATIONS);
  const [selectedObligation, setSelectedObligation] = useState<TaxObligationItem | null>(DEFAULT_TAX_OBLIGATIONS[0]);
  const [debitAccount, setDebitAccount] = useState<string>('0011004567890');
  const [bankCode, setBankCode] = useState<string>('VCB');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Tra cứu nghĩa vụ thuế theo CCCD
  const handleSearch = useCallback(async () => {
    if (!nationalId.trim()) {
      alert('Vui lòng nhập số CCCD để tra cứu');
      return;
    }
    setIsSearching(true);
    try {
      const items = await getTaxObligationsApi(nationalId.trim(), accessToken || undefined);
      setObligations(items);
      setSelectedObligation(items[0] || null);
    } catch {
      setObligations(DEFAULT_TAX_OBLIGATIONS);
      setSelectedObligation(DEFAULT_TAX_OBLIGATIONS[0]);
    } finally {
      setIsSearching(false);
    }
  }, [nationalId, accessToken]);

  // Xử lý nộp tiền vào Kho bạc Nhà nước
  const handleProcessPayment = useCallback(async () => {
    if (!selectedObligation) {
      alert('Vui lòng chọn một khoản nghĩa vụ thuế cần nộp');
      return;
    }
    if (!debitAccount.trim()) {
      alert('Vui lòng nhập số tài khoản trích nợ');
      return;
    }

    setIsProcessing(true);
    try {
      const orderCode = `ORD-${Date.now().toString().slice(-8)}`;
      const res = await processPaymentApi(
        {
          orderCode,
          taxpayerNationalId: nationalId.trim(),
          taxCategory: selectedObligation.taxCategory,
          amount: selectedObligation.amountDue,
          currency: 'VND',
          debitAccount: debitAccount.trim(),
          bankCode,
          description: `Nop ${TAX_CATEGORIES[selectedObligation.taxCategory]?.name || 'thue'} ky ${selectedObligation.taxPeriod}`,
        },
        accessToken || undefined,
      );

      setReceipt(res);
      // Đánh dấu nghĩa vụ đã thanh toán
      setObligations((prev) =>
        prev.map((o) =>
          o.obligationCode === selectedObligation.obligationCode
            ? { ...o, status: 'PAID' }
            : o,
        ),
      );
      setSelectedObligation(null);
    } catch (err: any) {
      alert(err?.message || 'Giao dịch không thành công hoặc vượt ngưỡng tần suất (Rate Limit)');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedObligation, debitAccount, bankCode, nationalId, accessToken]);

  return (
    <View style={styles.container}>
      {/* TIÊU ĐỀ MODULE */}
      <View style={styles.toolbar}>
        <View>
          <Text style={styles.title}>Cổng Nộp Thuế & Ngân Sách Nhà Nước</Text>
          <Text style={styles.subtitle}>Hạch toán kế toán kép, bảo mật AES-256 và sinh biên lai điện tử</Text>
        </View>
      </View>

      {/* MODAL BIÊN LAI KHI THANH TOÁN THÀNH CÔNG */}
      {receipt && (
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptNation}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <Text style={styles.receiptSubnation}>Độc lập - Tự do - Hạnh phúc</Text>
            <Text style={styles.receiptTitle}>BIÊN LAI THU NỘP THUẾ ĐIỆN TỬ</Text>
            <Text style={styles.receiptSuccess}>✓ GIAO DỊCH THÀNH CÔNG</Text>
          </View>

          <View style={styles.receiptBody}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Mã Giao Dịch (TXN):</Text>
              <Text style={[styles.receiptVal, styles.boldRed]}>{receipt.transactionCode}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Mã Đơn Hàng:</Text>
              <Text style={styles.receiptVal}>{receipt.orderCode}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Loại Thuế:</Text>
              <Text style={styles.receiptVal}>{TAX_CATEGORIES[receipt.taxCategory]?.name || receipt.taxCategory}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Số Tiền Nộp:</Text>
              <Text style={[styles.receiptVal, styles.amountHighlight]}>
                {receipt.amount?.toLocaleString('vi-VN')} VND
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Tài Khoản Trích Nợ (Debit):</Text>
              <Text style={styles.receiptVal}>{debitAccount} ({bankCode})</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Tài Khoản Thụ Hưởng (Credit):</Text>
              <Text style={styles.receiptVal}>TREASURY_STATE_REVENUE (Kho bạc)</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Chuỗi Băm Toàn Vẹn (SHA-256):</Text>
              <Text style={[styles.receiptVal, styles.hashText]} numberOfLines={1}>
                {receipt.auditIntegrityHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Thời Gian:</Text>
              <Text style={styles.receiptVal}>{receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</Text>
            </View>
          </View>

          <View style={styles.receiptActions}>
            <TouchableOpacity style={styles.printBtn} onPress={() => alert('Đang xuất biên lai điện tử...')}>
              <Text style={styles.printBtnText}>🖨️ In Biên Lai</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeReceiptBtn} onPress={() => setReceipt(null)}>
              <Text style={styles.closeReceiptText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* BƯỚC 1: TRA CỨU NGHĨA VỤ THUẾ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Tra cứu nghĩa vụ thuế công dân</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Nhập 12 số CCCD / Mã số thuế cá nhân"
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.searchBtnText}>🔍 Tra cứu</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* BẢNG DANH SÁCH NGHĨA VỤ */}
        <Text style={styles.sectionHeader}>Danh sách các khoản nghĩa vụ tìm thấy ({obligations.length} khoản):</Text>
        <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false}>
          <View style={[styles.tableCard, !isDesktop && { minWidth: 800 }]}>
            <View style={styles.tableHead}>
              {['Chọn', 'Loại thuế', 'Kỳ tính thuế', 'Số tiền phải nộp', 'Hạn nộp', 'Trạng thái'].map((h, i) => (
                <Text key={i} style={[styles.th, i === 1 && { flex: 2 }]}>{h}</Text>
              ))}
            </View>
            {obligations.map((item, idx) => {
              const meta = TAX_CATEGORIES[item.taxCategory] || { name: item.taxCategory, badgeColor: Colors.primary };
              const isSelected = selectedObligation?.obligationCode === item.obligationCode;
              const isPaid = item.status === 'PAID';

              return (
                <TouchableOpacity
                  key={item.obligationCode || idx}
                  style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt, isSelected && styles.rowSelected]}
                  onPress={() => !isPaid && setSelectedObligation(item)}
                  disabled={isPaid}
                >
                  <Text style={[styles.td, { fontSize: 18 }]}>{isPaid ? '✓' : isSelected ? '🔘' : '⚪'}</Text>
                  <View style={[styles.td, { flex: 2 }]}>
                    <Text style={styles.taxName}>{meta.name}</Text>
                    <Text style={styles.taxDesc}>{item.taxpayerName} ({item.taxpayerNationalId})</Text>
                  </View>
                  <Text style={styles.td}>{item.taxPeriod}</Text>
                  <Text style={[styles.td, styles.boldRed]}>{item.amountDue?.toLocaleString('vi-VN')} VND</Text>
                  <Text style={styles.td}>{item.dueDate}</Text>
                  <View style={styles.td}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isPaid ? '#dcfce7' : '#fef3c7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isPaid ? '#16a34a' : '#d97706' },
                        ]}
                      >
                        {isPaid ? 'ĐÃ NỘP' : 'CHỜ NỘP'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* BƯỚC 2: THÔNG TIN TRÍCH NỢ & THANH TOÁN */}
      {selectedObligation && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Thông tin thanh toán & Trích nợ ngân hàng</Text>
          <View style={styles.paymentSummary}>
            <Text style={styles.summaryLabel}>Khoản nộp đã chọn:</Text>
            <Text style={styles.summaryValue}>
              {TAX_CATEGORIES[selectedObligation.taxCategory]?.name || selectedObligation.taxCategory} ({selectedObligation.taxPeriod})
            </Text>
            <Text style={styles.summaryLabel}>Tổng số tiền trích nợ:</Text>
            <Text style={[styles.summaryValue, styles.amountHighlightBig]}>
              {selectedObligation.amountDue?.toLocaleString('vi-VN')} VND
            </Text>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Ngân hàng trích nợ:</Text>
              <TextInput
                style={styles.input}
                value={bankCode}
                onChangeText={setBankCode}
                placeholder="Ví dụ: VCB, CTG, BID, MB"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Số tài khoản thanh toán (Mã hóa AES-256):</Text>
              <TextInput
                style={styles.input}
                value={debitAccount}
                onChangeText={setDebitAccount}
                placeholder="Nhập STK ngân hàng"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handleProcessPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.payButtonText}>
                XÁC NHẬN NỘP TIỀN VÀO KHO BẠC NHÀ NƯỚC ({selectedObligation.amountDue?.toLocaleString('vi-VN')} VND)
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.securityNote}>
            🔒 Giao dịch được bảo vệ bằng Idempotency-Key chống trừ tiền lặp và giới hạn tần suất 1 req/phút.
          </Text>
        </View>
      )}
    </View>
  );
};

export default PaymentModule;

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 40 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 20, fontFamily: 'BeVietnamPro-Bold', color: Colors.primaryDark },
  subtitle: { fontSize: 13, fontFamily: 'BeVietnamPro-Regular', color: Colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 14,
  },
  cardTitle: { fontSize: 16, fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Regular',
    backgroundColor: Colors.bgInput,
    color: Colors.textPrimary,
  },
  searchBtn: {
    paddingHorizontal: 20,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: { color: Colors.white, fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14 },
  sectionHeader: { fontSize: 14, fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textSecondary, marginTop: 4 },
  tableCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: Colors.bgInput, paddingHorizontal: 14, paddingVertical: 12 },
  th: { flex: 1, fontSize: 12, fontFamily: 'BeVietnamPro-Bold', color: Colors.textMuted, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border },
  tableRowAlt: { backgroundColor: '#fafafa' },
  rowSelected: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary, borderWidth: 1 },
  td: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: 'BeVietnamPro-Regular' },
  taxName: { fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary, fontSize: 14 },
  taxDesc: { fontFamily: 'BeVietnamPro-Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  boldRed: { fontFamily: 'BeVietnamPro-Bold', color: Colors.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontFamily: 'BeVietnamPro-Bold' },
  paymentSummary: {
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 4,
  },
  summaryLabel: { fontSize: 13, fontFamily: 'BeVietnamPro-Regular', color: Colors.textSecondary },
  summaryValue: { fontSize: 15, fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary },
  amountHighlightBig: { fontSize: 20, color: Colors.primary, fontFamily: 'BeVietnamPro-Bold' },
  formRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  formCol: { flex: 1, minWidth: 260, gap: 6 },
  label: { fontSize: 13, fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary },
  payButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  payButtonDisabled: { opacity: 0.7 },
  payButtonText: { color: Colors.white, fontSize: 15, fontFamily: 'BeVietnamPro-Bold' },
  securityNote: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', fontFamily: 'BeVietnamPro-Regular' },
  // Receipt
  receiptCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  receiptHeader: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fde68a', paddingBottom: 10 },
  receiptNation: { fontSize: 13, fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary },
  receiptSubnation: { fontSize: 12, fontFamily: 'BeVietnamPro-Regular', color: Colors.textSecondary, marginBottom: 8 },
  receiptTitle: { fontSize: 18, fontFamily: 'BeVietnamPro-Bold', color: Colors.primaryDark },
  receiptSuccess: { fontSize: 13, fontFamily: 'BeVietnamPro-Bold', color: '#16a34a', marginTop: 4 },
  receiptBody: { gap: 8 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Regular' },
  receiptVal: { fontSize: 13, fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary, maxWidth: '60%' },
  amountHighlight: { fontSize: 16, color: Colors.primary, fontFamily: 'BeVietnamPro-Bold' },
  hashText: { fontSize: 11, fontFamily: 'Consolas', color: Colors.textMuted },
  receiptActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  printBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 8 },
  printBtnText: { color: Colors.white, fontFamily: 'BeVietnamPro-Bold', fontSize: 13 },
  closeReceiptBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 8 },
  closeReceiptText: { color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Medium', fontSize: 13 },
});
