import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  FluctuationItem,
  DEFAULT_RESIDENCY_DATA,
  getFluctuationsApi,
} from '../services/fluctuation.service';

const isWeb = Platform.OS === 'web';
const { width: screenWidth } = Dimensions.get('window');
const isDesktop = isWeb && screenWidth >= 1024;

const ResidencyModule: React.FC = () => {
  const navigation = useNavigation<any>();
  const accessToken = useSelector(selectAccessToken);
  const [data, setData] = useState<FluctuationItem[]>(DEFAULT_RESIDENCY_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getFluctuationsApi(0, 50, accessToken || undefined);
      if (res && res.items && res.items.length > 0) {
        setData(res.items);
      }
    } catch {
      setData(DEFAULT_RESIDENCY_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tamTruCount = data.filter((d) => d.type === 'Tạm trú').length;
  const tamVangCount = data.filter((d) => d.type === 'Tạm vắng').length;
  const pendingCount = data.filter((d) => d.status === 'Chờ duyệt').length;
  const expiredCount = data.filter((d) => d.status === 'Hết hạn').length;

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Quản lý tạm trú / tạm vắng</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {isLoading && <ActivityIndicator size="small" color={Colors.primary} />}
          <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
            <Text style={styles.refreshBtnText}>🔄 Làm mới</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddResidency')}
          >
            <Text style={styles.addBtnText}>+ Đăng ký mới</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statsRow}>
        {[
          { label: 'Đang tạm trú', value: tamTruCount.toLocaleString('vi-VN'), color: Colors.primary },
          { label: 'Đang tạm vắng', value: tamVangCount.toLocaleString('vi-VN'), color: '#7c3aed' },
          { label: 'Chờ duyệt', value: pendingCount.toLocaleString('vi-VN'), color: '#d97706' },
          { label: 'Hết hạn', value: expiredCount.toLocaleString('vi-VN'), color: Colors.dangerIcon },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
        <View style={[styles.tableCard, !isDesktop && { minWidth: 800 }]}>
          <View style={styles.tableHead}>
            {['Họ tên', 'Loại', 'Từ ngày', 'Đến ngày', 'Địa chỉ', 'Trạng thái', 'Thao tác'].map((h, i) => (
              <Text key={i} style={styles.th}>{h}</Text>
            ))}
          </View>
          {data.map((d, i) => {
            const sc = d.status === 'Đang hiệu lực' ? '#16a34a' : d.status === 'Hết hạn' ? Colors.dangerIcon : '#d97706';
            const sb = d.status === 'Đang hiệu lực' ? '#dcfce7' : d.status === 'Hết hạn' ? '#ffe4e6' : '#fef3c7';
            return (
              <View key={d.id || i} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                <Text style={[styles.td, styles.bold]}>{d.name}</Text>
                <View style={styles.td}>
                  <View style={[styles.typeBadge, { backgroundColor: d.type === 'Tạm trú' ? Colors.primaryLight : '#f3e8ff' }]}>
                    <Text style={[styles.typeText, { color: d.type === 'Tạm trú' ? Colors.primary : '#7c3aed' }]}>{d.type}</Text>
                  </View>
                </View>
                <Text style={styles.td}>{d.from}</Text>
                <Text style={styles.td}>{d.to}</Text>
                <Text style={styles.td}>{d.address}</Text>
                <View style={styles.td}>
                  <View style={[styles.badge, { backgroundColor: sb }]}>
                    <Text style={[styles.badgeText, { color: sc }]}>{d.status}</Text>
                  </View>
                </View>
                <View style={[styles.td, { flexDirection: 'row', gap: 6 }]}>
                  <TouchableOpacity><Text>👁️</Text></TouchableOpacity>
                  <TouchableOpacity><Text>✏️</Text></TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default ResidencyModule;

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 40 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 18, fontFamily: 'BeVietnamPro-Bold', color: Colors.primaryDark },
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 10 },
  addBtnText: { fontSize: 15, color: Colors.white, fontFamily: 'BeVietnamPro-SemiBold' },
  refreshBtn: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.white },
  refreshBtnText: { fontSize: 15, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Medium' },
  statsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 120, backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 28, fontFamily: 'BeVietnamPro-ExtraBold', color: Colors.textPrimary },
  statLabel: { fontSize: 14, fontFamily: 'BeVietnamPro-Medium', color: Colors.textMuted, marginTop: 4 },
  scrollWrapper: { width: '100%', borderRadius: 16 },
  tableCard: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: Colors.bgInput, paddingHorizontal: 16, paddingVertical: 14 },
  th: { flex: 1, fontSize: 13, fontFamily: 'BeVietnamPro-Bold', color: Colors.textMuted, textTransform: 'uppercase' },
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border },
  rowAlt: { backgroundColor: '#fafafa' },
  td: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontFamily: 'BeVietnamPro-Regular' },
  bold: { fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  typeText: { fontSize: 13, fontFamily: 'BeVietnamPro-SemiBold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 13, fontFamily: 'BeVietnamPro-Bold' },
});
